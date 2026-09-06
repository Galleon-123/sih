import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  doc, collection, query, where, onSnapshot, updateDoc, getDoc, serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import * as Location from 'expo-location';
import { MOCK_SIMULATED_JOBS, MOCK_JOB_HISTORY } from '../data/mockJobs';

const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const [activeJob, setActiveJob]           = useState(null);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [jobHistory, setJobHistory]         = useState([]);
  const [jobStatus, setJobStatus]           = useState('idle');
  const [countdown, setCountdown]           = useState(60);
  const [extraWorkRequest, setExtraWorkRequest] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [procurementPaused, setProcurementPaused] = useState(false);
  const [procurementResumeOtp, setProcurementResumeOtp] = useState(null);
  const [overtimeApplied, setOvertimeApplied] = useState(false);
  const [simJobIndex, setSimJobIndex]       = useState(0);

  // Accept-time elapsed timer (travelling stage)
  const [acceptElapsed, setAcceptElapsed]   = useState(0);
  const [isTravelPaused, setIsTravelPaused] = useState(false);

  // Helper request state
  const [helperRequest, setHelperRequest]   = useState(null);

  // Wait time request state
  const [waitRequest, setWaitRequest]       = useState(null);
  const [waitElapsed, setWaitElapsed]       = useState(0);

  const timerRef       = useRef(null);
  const workTimerRef   = useRef(null);
  const acceptTimerRef = useRef(null);
  const locationRef    = useRef(null);
  const waitTimerRef   = useRef(null);

  const uid = () => auth.currentUser?.uid;
  const isSimMode = () => !auth.currentUser;

  useEffect(() => {
    if (isSimMode()) setJobHistory(MOCK_JOB_HISTORY);
  }, []);

  // --- Accept-time elapsed timer (travelling stage) ---
  useEffect(() => {
    if (jobStatus === 'travelling' && !isTravelPaused) {
      acceptTimerRef.current = setInterval(() => {
        setAcceptElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(acceptTimerRef.current);
    }
    return () => clearInterval(acceptTimerRef.current);
  }, [jobStatus, isTravelPaused]);

  const pauseTravel = () => setIsTravelPaused(true);
  const resumeTravel = () => setIsTravelPaused(false);

  // --- Wait time timer ---
  useEffect(() => {
    if (waitRequest?.status === 'waiting') {
      waitTimerRef.current = setInterval(() => setWaitElapsed(s => s + 1), 1000);
    } else {
      clearInterval(waitTimerRef.current);
    }
    return () => clearInterval(waitTimerRef.current);
  }, [waitRequest?.status]);

  // --- Simulation: trade-aware job request ---
  const simulateJobRequest = (workerTrade) => {
    if (pendingRequest || activeJob) return;
    let pool = MOCK_SIMULATED_JOBS;
    if (workerTrade) {
      const filtered = MOCK_SIMULATED_JOBS.filter(
        (j) => j.serviceType === workerTrade
      );
      if (filtered.length > 0) pool = filtered;
    }
    const job = { ...pool[simJobIndex % pool.length], timeLeft: 60 };
    setSimJobIndex((i) => i + 1);
    setPendingRequest(job);
    setCountdown(60);
  };

  // --- Firestore: listen for pending job requests (status 1) ---
  useEffect(() => {
    const workerId = uid();
    if (!workerId) return;
    const q = query(
      collection(db, 'bookings'),
      where('workerId', '==', workerId),
      where('status', '==', 1)
    );
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const job = { id: snap.docs[0].id, ...snap.docs[0].data() };
        setPendingRequest((prev) => (!prev || prev.id !== job.id) ? { ...job, timeLeft: 60 } : prev);
        setCountdown(60);
      }
    });
    return unsub;
  }, [uid()]);

  // --- Countdown timer for pending request ---
  useEffect(() => {
    if (!pendingRequest) return;
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (pendingRequest?.id) {
            updateDoc(doc(db, 'bookings', pendingRequest.id), {
              workerId: null, status: 0, updatedAt: serverTimestamp(),
            }).catch(() => {});
          }
          setPendingRequest(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [pendingRequest?.id]);

  // --- Firestore: listen for active job (status 2,3,4) ---
  useEffect(() => {
    const workerId = uid();
    if (!workerId) return;
    const q = query(
      collection(db, 'bookings'),
      where('workerId', '==', workerId),
      where('status', 'in', [2, 3, 4])
    );
    const unsub = onSnapshot(q, (snap) => {
      setActiveJob(snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() });
    });
    return unsub;
  }, [uid()]);

  // --- Firestore: listen for helper request status updates on active job ---
  useEffect(() => {
    const workerId = uid();
    if (!workerId || !activeJob?.id) return;
    const unsub = onSnapshot(doc(db, 'bookings', activeJob.id), (snap) => {
      const data = snap.data();
      if (data?.helperRequested) {
        setHelperRequest(data.helperRequested);
      }
    });
    return unsub;
  }, [activeJob?.id]);

  // --- Work timer (elapsed seconds during working stage) ---
  useEffect(() => {
    if (jobStatus === 'working' && !procurementPaused) {
      workTimerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          if (next >= 7200 && !overtimeApplied) setOvertimeApplied(true);
          return next;
        });
      }, 1000);
    } else {
      clearInterval(workTimerRef.current);
    }
    return () => clearInterval(workTimerRef.current);
  }, [jobStatus, procurementPaused, overtimeApplied]);

  // --- Location broadcast ---
  const startLocationBroadcast = async () => {
    const workerId = uid();
    if (!workerId) return;
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    locationRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 10 },
      (loc) => {
        updateDoc(doc(db, 'workers', workerId), {
          location: { lat: loc.coords.latitude, lng: loc.coords.longitude, updatedAt: serverTimestamp() },
        }).catch(() => {});
      }
    );
  };

  const stopLocationBroadcast = () => {
    locationRef.current?.remove?.();
    locationRef.current = null;
  };

  // --- Accept / decline job ---
  const acceptJob = async () => {
    if (!pendingRequest) return;
    clearInterval(timerRef.current);
    const job = pendingRequest;
    setPendingRequest(null);
    if (!isSimMode()) {
      await updateDoc(doc(db, 'bookings', job.id), { status: 2, updatedAt: serverTimestamp() }).catch(() => {});
    }
    setActiveJob({ ...job, acceptedAt: new Date().toISOString() });
    setJobStatus('travelling');
    setAcceptElapsed(0);
    setIsTravelPaused(false);
    setElapsedSeconds(0);
    setProcurementPaused(false);
    setOvertimeApplied(false);
    setWaitRequest(null);
    setWaitElapsed(0);
    startLocationBroadcast();
  };

  const declineJob = async (reason) => {
    clearInterval(timerRef.current);
    if (!isSimMode() && pendingRequest?.id) {
      await updateDoc(doc(db, 'bookings', pendingRequest.id), {
        status: 0, workerId: null, declineReason: reason || 'Declined',
        updatedAt: serverTimestamp(),
      }).catch(() => {});
    }
    setPendingRequest(null);
  };

  const updateJobStatus = async (status) => {
    setJobStatus(status);
    if (status === 'working') setElapsedSeconds(0);
    if (!isSimMode()) {
      const map = { travelling: 2, arrived: 3, working: 4, completed: 5 };
      const fsStatus = map[status];
      if (fsStatus && activeJob?.id) {
        await updateDoc(doc(db, 'bookings', activeJob.id), { status: fsStatus, updatedAt: serverTimestamp() }).catch(() => {});
      }
    }
    if (status === 'completed') stopLocationBroadcast();
  };

  // --- OTP verification ---
  const verifyStartOtp = async (enteredOtp) => {
    if (!activeJob) return false;
    if (isSimMode()) {
      if (activeJob.start_otp === enteredOtp) { setJobStatus('working'); return true; }
      return false;
    }
    const snap = await getDoc(doc(db, 'bookings', activeJob.id));
    if (snap.data()?.startOtp === enteredOtp) {
      await updateDoc(doc(db, 'bookings', activeJob.id), { status: 3, updatedAt: serverTimestamp() });
      setJobStatus('working');
      return true;
    }
    return false;
  };

  const verifyCompletionOtp = async (enteredOtp) => {
    if (!activeJob) return false;
    if (isSimMode()) {
      if (activeJob.completion_otp === enteredOtp) {
        setJobStatus('idle');
        stopLocationBroadcast();
        setJobHistory((prev) => [{ ...activeJob, status: 5, date: new Date().toISOString().slice(0, 10), amount: activeJob.estimatedEarning }, ...prev]);
        setActiveJob(null);
        return true;
      }
      return false;
    }
    const snap = await getDoc(doc(db, 'bookings', activeJob.id));
    if (snap.data()?.completionOtp === enteredOtp) {
      await updateDoc(doc(db, 'bookings', activeJob.id), { status: 5, updatedAt: serverTimestamp() });
      setJobStatus('idle');
      stopLocationBroadcast();
      setActiveJob(null);
      return true;
    }
    return false;
  };

  // --- Procurement pause/resume ---
  const pauseForProcurement = () => {
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    setProcurementPaused(true);
    setProcurementResumeOtp(otp);
    return otp;
  };

  const resumeFromProcurement = (enteredOtp) => {
    if (enteredOtp === procurementResumeOtp) {
      setProcurementPaused(false);
      setProcurementResumeOtp(null);
      return true;
    }
    return false;
  };

  // --- Complete job (without OTP — direct completion) ---
  // Accepts an optional snapshot to avoid stale-closure on delayed calls
  const completeJob = (jobSnapshot) => {
    const job = jobSnapshot || activeJob;
    setJobStatus('idle');
    stopLocationBroadcast();
    if (job) {
      const entry = {
        ...job,
        status: 5,
        date: new Date().toISOString().slice(0, 10),
        amount: job.estimatedEarning || job.totalAmount || 0,
        service: job.service || 'Service',
        customerArea: job.customerArea || '',
      };
      setJobHistory((prev) => [entry, ...prev]);
    }
    setActiveJob(null);
    setExtraWorkRequest(null);
    setWaitRequest(null);
    setHelperRequest(null);
  };

  // --- Extra work request ---
  const submitExtraWork = async ({ description, additionalCost }) => {
    const payload = {
      description,
      additionalCost,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    setExtraWorkRequest(payload);
    if (!isSimMode() && activeJob?.id) {
      await updateDoc(doc(db, 'bookings', activeJob.id), {
        extraWorkRequest: payload,
        updatedAt: serverTimestamp(),
      }).catch(() => {});
    }
  };

  const approveExtraWork = () => {
    setExtraWorkRequest((prev) => prev ? { ...prev, status: 'approved' } : prev);
  };

  // --- Wait time request ---
  const startWaitTime = () => {
    const req = { status: 'waiting', startedAt: new Date().toISOString(), elapsed: 0, billable: false };
    setWaitRequest(req);
    setWaitElapsed(0);
    if (!isSimMode() && activeJob?.id) {
      updateDoc(doc(db, 'bookings', activeJob.id), {
        waitRequest: { ...req, updatedAt: serverTimestamp() }
      }).catch(() => {});
    }
  };

  const endWaitTime = () => {
    const elapsed = waitElapsed;
    const billable = elapsed > 300; // billable if > 5 minutes
    setWaitRequest(prev => prev ? { ...prev, status: 'ended', elapsed, billable } : null);
    clearInterval(waitTimerRef.current);
    if (!isSimMode() && activeJob?.id) {
      updateDoc(doc(db, 'bookings', activeJob.id), {
        waitRequest: { status: 'ended', elapsed, billable, updatedAt: serverTimestamp() }
      }).catch(() => {});
    }
  };

  // --- Helper worker request ---
  const requestHelperWorker = async (message) => {
    const payload = {
      status: 'pending',
      message: message || '',
      requestedAt: new Date().toISOString(),
    };
    setHelperRequest(payload);
    if (!isSimMode() && activeJob?.id) {
      await updateDoc(doc(db, 'bookings', activeJob.id), {
        helperRequested: payload,
        updatedAt: serverTimestamp(),
      }).catch(() => {});
    }
  };

  // --- Simulate customer approving helper request ---
  const approveHelperRequest = () => {
    setHelperRequest(prev => prev ? { ...prev, status: 'approved' } : null);
  };

  // --- Simulate customer acknowledging wait time ---
  const acknowledgeWaitRequest = () => {
    setWaitRequest(prev => prev ? { ...prev, status: 'acknowledged' } : null);
    clearInterval(waitTimerRef.current);
  };

  // --- Simulated overtime trigger ---
  const triggerSimulatedOvertime = () => {
    setElapsedSeconds(7200);
    setOvertimeApplied(true);
  };

  // --- Firestore: job history (status 5) ---
  useEffect(() => {
    const workerId = uid();
    if (!workerId) return;
    const q = query(
      collection(db, 'bookings'),
      where('workerId', '==', workerId),
      where('status', '==', 5)
    );
    const unsub = onSnapshot(q, (snap) =>
      setJobHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, [uid()]);

  return (
    <JobContext.Provider value={{
      // existing
      activeJob, pendingRequest, jobHistory, jobStatus, countdown,
      extraWorkRequest, setExtraWorkRequest,
      elapsedSeconds, procurementPaused, overtimeApplied,
      procurementResumeOtp,
      acceptJob, declineJob, updateJobStatus,
      verifyStartOtp, verifyCompletionOtp,
      pauseForProcurement, resumeFromProcurement,
      startLocationBroadcast, stopLocationBroadcast,
      simulateJobRequest, isSimMode: isSimMode(),
      // new
      acceptElapsed,
      isTravelPaused, pauseTravel, resumeTravel,
      helperRequest, requestHelperWorker, approveHelperRequest,
      completeJob,
      submitExtraWork, approveExtraWork,
      triggerSimulatedOvertime,
      // wait time
      waitRequest, waitElapsed, startWaitTime, endWaitTime, acknowledgeWaitRequest,
    }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJob = () => useContext(JobContext);
export default JobContext;
