import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  doc, collection, query, where, onSnapshot, updateDoc, getDoc, serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import * as Location from 'expo-location';

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

  const timerRef     = useRef(null);
  const workTimerRef = useRef(null);
  const locationRef  = useRef(null);

  const uid = () => auth.currentUser?.uid;

  // ── Listen for incoming jobs (status == 1, assigned to this worker) ──
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

  // ── Countdown timer ───────────────────────────────────────────
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

  // ── Listen for active job ─────────────────────────────────────
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

  // ── Work elapsed timer ────────────────────────────────────────
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

  // ── GPS broadcast ─────────────────────────────────────────────
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

  // ── Accept job ────────────────────────────────────────────────
  const acceptJob = async () => {
    if (!pendingRequest) return;
    clearInterval(timerRef.current);
    const job = pendingRequest;
    setPendingRequest(null);
    await updateDoc(doc(db, 'bookings', job.id), { status: 2, updatedAt: serverTimestamp() }).catch(() => {});
    setActiveJob({ ...job, acceptedAt: new Date().toISOString() });
    setJobStatus('travelling');
    setElapsedSeconds(0);
    setProcurementPaused(false);
    setOvertimeApplied(false);
    startLocationBroadcast();
  };

  // ── Decline job ───────────────────────────────────────────────
  const declineJob = async (reason) => {
    clearInterval(timerRef.current);
    if (pendingRequest?.id) {
      await updateDoc(doc(db, 'bookings', pendingRequest.id), {
        status: 0, workerId: null, declineReason: reason || 'Declined',
        updatedAt: serverTimestamp(),
      }).catch(() => {});
    }
    setPendingRequest(null);
  };

  // ── Update status ─────────────────────────────────────────────
  const updateJobStatus = async (status) => {
    setJobStatus(status);
    if (status === 'working') setElapsedSeconds(0);
    const map = { travelling: 2, arrived: 3, working: 4, completed: 5 };
    const fsStatus = map[status];
    if (fsStatus && activeJob?.id) {
      await updateDoc(doc(db, 'bookings', activeJob.id), { status: fsStatus, updatedAt: serverTimestamp() }).catch(() => {});
    }
    if (status === 'completed') stopLocationBroadcast();
  };

  // ── Start OTP ─────────────────────────────────────────────────
  const verifyStartOtp = async (enteredOtp) => {
    if (!activeJob?.id) return false;
    const snap = await getDoc(doc(db, 'bookings', activeJob.id));
    if (snap.data()?.startOtp === enteredOtp) {
      await updateDoc(doc(db, 'bookings', activeJob.id), { status: 3, updatedAt: serverTimestamp() });
      setJobStatus('working');
      return true;
    }
    return false;
  };

  // ── Completion OTP ────────────────────────────────────────────
  const verifyCompletionOtp = async (enteredOtp) => {
    if (!activeJob?.id) return false;
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

  // ── Procurement ───────────────────────────────────────────────
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

  // ── Job history ───────────────────────────────────────────────
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
      activeJob, pendingRequest, jobHistory, jobStatus, countdown,
      extraWorkRequest, setExtraWorkRequest,
      elapsedSeconds, procurementPaused, overtimeApplied,
      acceptJob, declineJob, updateJobStatus,
      verifyStartOtp, verifyCompletionOtp,
      pauseForProcurement, resumeFromProcurement,
      startLocationBroadcast, stopLocationBroadcast,
    }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJob = () => useContext(JobContext);
export default JobContext;
