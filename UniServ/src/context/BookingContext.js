import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import workersData from '../data/workers.json';
import servicesData from '../data/services.json';
import cooperativesData from '../data/cooperatives.json';

const BookingContext = createContext();

export const BOOKING_STATUSES = [
  'Booking Confirmed',
  'Worker Assigned',
  'Worker is on the way',
  'Worker Arrived',
  'Work Started',
  'Work Completed'
];

const INITIAL_PAST_BOOKINGS = [
  {
    booking_id: 'BK92841',
    service: { id: 's2', name: 'Electrician', icon: '⚡' },
    worker: workersData.find(w => w.id === 'w3') || workersData[0],
    date: '24 Aug 2026',
    status: 'Work Completed',
    total_amount: 349,
    payment_method: 'UPI',
    rating: 5
  }
];

export const BookingProvider = ({ children }) => {
  const [activeBooking, setActiveBooking] = useState(null);
  const [pastBookings, setPastBookings] = useState(INITIAL_PAST_BOOKINGS);
  const [communityRequests, setCommunityRequests] = useState([]);
  const [workerWaitRequest, setWorkerWaitRequest] = useState(null);
  // null | { status: 'waiting' | 'ended', startedAt, elapsed, billable }
  const [waitElapsed, setWaitElapsed] = useState(0);
  const waitTimerRef = useRef(null);

  // Wait time simulation: fires 10 seconds after worker 'arrived' (statusIndex === 3)
  useEffect(() => {
    if (activeBooking?.statusIndex === 3) {
      const t = setTimeout(() => {
        setWorkerWaitRequest({ status: 'waiting', startedAt: new Date().toISOString() });
        setWaitElapsed(0);
      }, 10000);
      return () => clearTimeout(t);
    } else if (activeBooking?.statusIndex !== 3) {
      setWorkerWaitRequest(null);
      clearInterval(waitTimerRef.current);
    }
  }, [activeBooking?.statusIndex]);

  // Elapsed counter while worker is waiting
  useEffect(() => {
    if (workerWaitRequest?.status === 'waiting') {
      waitTimerRef.current = setInterval(() => setWaitElapsed(s => s + 1), 1000);
    } else {
      clearInterval(waitTimerRef.current);
    }
    return () => clearInterval(waitTimerRef.current);
  }, [workerWaitRequest?.status]);

  const acknowledgeWorkerWait = () => {
    setWorkerWaitRequest(prev => prev ? { ...prev, status: 'acknowledged' } : null);
  };

  const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();
  const generateBookingId = () => 'BK' + Math.floor(10000 + Math.random() * 90000).toString();

  // Check if first-time user
  const isFirstTimeUser = pastBookings.length === 0 || !pastBookings.some(b => b.status === 'Work Completed');
  const FIRST_TIME_DISCOUNT = 50; // ₹50 Welcome Discount

  // Helper to accurately compute total from all line items
  const computeTotal = (booking) => {
    if (!booking) return 350;
    const base = Number(booking.base_amount || booking.service?.start_price || 299);
    const surge = Number(booking.emergency_surge || 0);
    const extra = (booking.extra_work && booking.extra_work.approved) ? Number(booking.extra_work.amount || 0) : 0;
    const helper = (booking.second_worker && (booking.helper_request?.status === 'approved' || booking.second_worker))
      ? Number(booking.helper_request?.amount || booking.service?.helper_request?.amount || 200)
      : 0;
    const discount = Number(booking.discount_applied || 0);
    return Math.max(base + surge + extra + helper - discount, 49);
  };

  // 1. Initialize Booking with Emergency Surge & First-Time Discount
  const createBooking = (bookingData) => {
    const startOtp = generateOTP();
    const completionOtp = generateOTP();
    const serviceDef = servicesData.find(s => s.id === bookingData.service?.id) || bookingData.service;
    const isEmergency = bookingData.booking_type === 'emergency';
    
    const rawBasePrice = Number(bookingData.base_amount || serviceDef?.start_price || 299);
    const emergencySurge = isEmergency ? 100 : 0; // Emergency surge +₹100
    const discount = isFirstTimeUser ? FIRST_TIME_DISCOUNT : 0;
    const computedTotal = Math.max(rawBasePrice + emergencySurge - discount, 49);

    const initialBooking = {
      booking_id: generateBookingId(),
      service: serviceDef,
      address: bookingData.address,
      landmark: bookingData.landmark || '',
      description: bookingData.description || '',
      photo: bookingData.photo || null,
      booking_type: bookingData.booking_type || 'now',
      scheduled_date: bookingData.scheduled_date || null,
      scheduled_time: bookingData.scheduled_time || null,
      is_bulk_project: !!bookingData.is_bulk_project,
      scale_mode: bookingData.scale_mode || 'solo',
      advance_amount: bookingData.advance_amount || 0,
      total_project_cost: bookingData.total_project_cost || computedTotal,
      min_cost: bookingData.min_cost || computedTotal,
      max_cost: bookingData.max_cost || computedTotal,
      advance_percent: bookingData.advance_percent || 40,
      mid_milestone: bookingData.mid_milestone || 0,
      final_milestone: bookingData.final_milestone || 0,
      crew_size: bookingData.crew_size || 1,
      estimated_days: bookingData.estimated_days || 1,
      scale_label: bookingData.scale_label || '',
      scale_sub: bookingData.scale_sub || '',
      material_label: bookingData.material_label || '',
      material_sub: bookingData.material_sub || '',
      trade_subtype: bookingData.trade_subtype || '',
      trade_scope: bookingData.trade_scope || '',
      trade_details: bookingData.trade_details || '',
      milestone_stage: bookingData.is_bulk_project ? 1 : null,
      escrow_status: bookingData.is_bulk_project ? 'Milestone 1 Advance Locked' : 'Standard Payment',
      worker: null,
      second_worker: null,
      helper_request: null,
      status: BOOKING_STATUSES[0],
      statusIndex: 0,
      start_otp: startOtp,
      completion_otp: completionOtp,
      base_amount: rawBasePrice,
      emergency_surge: emergencySurge,
      discount_applied: discount,
      total_amount: computedTotal,
      extra_work: null,
      payment_method: null,
      payment_status: 'pending',
      worker_delayed: false,
      delay_minutes: 0,
      created_at: new Date().toISOString()
    };
    setActiveBooking(initialBooking);
    return initialBooking;
  };

  // 2. Assign Primary Worker
  const assignWorker = (worker) => {
    setActiveBooking(prev => {
      if (!prev) return null;
      return {
        ...prev,
        worker,
        status: BOOKING_STATUSES[1],
        statusIndex: 1
      };
    });
  };

  // 3. Worker Delay Notification & Handling
  const triggerWorkerDelay = (delayMins = 10, reason = 'Heavy traffic at Ring Road flyover') => {
    setActiveBooking(prev => {
      if (!prev) return null;
      return {
        ...prev,
        worker_delayed: true,
        delay_minutes: delayMins,
        delay_reason: reason
      };
    });
  };

  const acceptWorkerDelay = () => {
    setActiveBooking(prev => {
      if (!prev) return null;
      return {
        ...prev,
        worker_delayed: false,
        worker: {
          ...prev.worker,
          eta_minutes: (prev.worker?.eta_minutes || 8) + (prev.delay_minutes || 10)
        }
      };
    });
  };

  const findReplacementWorker = () => {
    const currentId = activeBooking?.worker?.id;
    const replacement = workersData.find(w => w.id !== currentId && w.skill === (activeBooking?.service?.name || 'Plumber')) || workersData[1] || workersData[0];

    setActiveBooking(prev => {
      if (!prev) return null;
      return {
        ...prev,
        worker: {
          ...replacement,
          eta_minutes: 6,
          distance_km: 0.9
        },
        worker_delayed: false,
        status: BOOKING_STATUSES[1],
        statusIndex: 1
      };
    });
    return replacement;
  };

  // 4. Update Status
  const updateBookingStatus = (statusIndex) => {
    setActiveBooking(prev => {
      if (!prev) return null;
      const validIndex = Math.min(Math.max(statusIndex, 0), BOOKING_STATUSES.length - 1);
      return {
        ...prev,
        status: BOOKING_STATUSES[validIndex],
        statusIndex: validIndex
      };
    });
  };

  // 5. Start OTP Handshake
  const verifyStartOtp = () => {
    setActiveBooking(prev => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'Work Started',
        statusIndex: 4
      };
    });
  };

  // 6. Request Extra Work (Category-Aware)
  const requestExtraWork = (customDetails) => {
    setActiveBooking(prev => {
      if (!prev) return null;
      const serviceExtra = prev.service?.extra_work || {
        title: 'Component Replacement & Service',
        amount: 150,
        description: 'Inspection revealed wear and tear requiring part replacement.'
      };

      const extra = {
        requested: true,
        title: customDetails?.title || serviceExtra.title,
        description: customDetails?.description || serviceExtra.description,
        amount: customDetails?.amount || serviceExtra.amount,
        photo: customDetails?.photo || serviceExtra.photo || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&q=80',
        approved: false
      };

      return {
        ...prev,
        extra_work: extra
      };
    });
  };

  // 7. Approve Extra Work (Accurately re-computes total)
  const approveExtraWork = (customData) => {
    setActiveBooking(prev => {
      if (!prev) return prev;
      const serviceExtra = prev.service?.extra_work;
      const extraAmount = Number(customData?.amount || serviceExtra?.amount || prev.extra_work?.amount || 150);
      const extraTitle = customData?.title || serviceExtra?.title || prev.extra_work?.title || 'Component Replacement';
      const extraDesc = customData?.description || serviceExtra?.description || prev.extra_work?.description || 'Additional repair parts';
      const extraPhoto = customData?.photo || serviceExtra?.photo || prev.extra_work?.photo || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&q=80';

      const updatedBooking = {
        ...prev,
        extra_work: {
          requested: true,
          title: extraTitle,
          description: extraDesc,
          amount: extraAmount,
          photo: extraPhoto,
          approved: true,
          declined: false
        }
      };

      updatedBooking.total_amount = computeTotal(updatedBooking);
      return updatedBooking;
    });
  };

  // 8. Decline Extra Work
  const declineExtraWork = () => {
    setActiveBooking(prev => {
      if (!prev) return prev;
      const updatedBooking = {
        ...prev,
        extra_work: {
          ...(prev.extra_work || prev.service?.extra_work),
          requested: false,
          approved: false,
          declined: true
        }
      };
      updatedBooking.total_amount = computeTotal(updatedBooking);
      return updatedBooking;
    });
  };

  // 9. 2nd Worker / Helper Request
  const requestSecondWorker = (helperData) => {
    setActiveBooking(prev => {
      if (!prev) return null;
      const helperDef = prev.service?.helper_request || {
        role: 'Cooperative Assistant Artisan',
        reason: 'Heavy material handling & dual coordination.',
        amount: 200
      };

      return {
        ...prev,
        helper_request: {
          role: helperData?.role || helperDef.role,
          reason: helperData?.reason || helperDef.reason,
          amount: Number(helperData?.amount || helperDef.amount),
          status: 'pending'
        }
      };
    });
  };

  // 10. Approve 2nd Worker (Accurately re-computes total)
  const approveSecondWorker = (workerData) => {
    const assistantWorker = workerData || {
      id: 'h2',
      name: 'Amit Verma',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80',
      role: activeBooking?.service?.helper_request?.role || 'Cooperative Assistant Artisan',
      rating: 4.8,
      phone: '+91 98112 34567',
      cooperative: 'Delhi Labour Cooperative Union'
    };

    setActiveBooking(prev => {
      if (!prev) return null;
      const helperCost = Number(prev.helper_request?.amount || prev.service?.helper_request?.amount || 200);
      const updatedBooking = {
        ...prev,
        second_worker: assistantWorker,
        helper_request: {
          role: prev.service?.helper_request?.role || 'Cooperative Assistant Artisan',
          reason: prev.service?.helper_request?.reason || 'Heavy equipment support & dual coordination.',
          amount: helperCost,
          status: 'approved',
          assigned_worker: assistantWorker
        }
      };
      updatedBooking.total_amount = computeTotal(updatedBooking);
      return updatedBooking;
    });
    return assistantWorker;
  };

  // 11. Decline 2nd Worker
  const declineSecondWorker = () => {
    setActiveBooking(prev => {
      if (!prev) return null;
      const updatedBooking = {
        ...prev,
        second_worker: null,
        helper_request: {
          ...prev.helper_request,
          status: 'declined'
        }
      };
      updatedBooking.total_amount = computeTotal(updatedBooking);
      return updatedBooking;
    });
  };

  // 12. Completion OTP Handshake
  const verifyCompletionOtp = () => {
    setActiveBooking(prev => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'Work Completed',
        statusIndex: 5
      };
    });
  };

  // 13. Process Payment & Settlement
  const completePayment = (method) => {
    setActiveBooking(prev => {
      if (!prev) return null;
      return {
        ...prev,
        payment_method: method || 'UPI',
        payment_status: 'success'
      };
    });
  };

  // 14. Submit Rating & Complete Flow
  const submitRating = (ratingScore, tags = [], reviewText = '') => {
    if (activeBooking) {
      const score = typeof ratingScore === 'object' ? ratingScore.rating || 5 : ratingScore;
      const finalTags = typeof ratingScore === 'object' ? ratingScore.tags || [] : tags;
      const text = typeof ratingScore === 'object' ? ratingScore.review || '' : reviewText;

      const finishedBooking = {
        ...activeBooking,
        rating: score,
        review_tags: finalTags,
        review_text: text,
        completed_at: new Date().toISOString()
      };
      setPastBookings(prev => [finishedBooking, ...prev]);
    }
  };

  // 15. File Complaint
  const fileComplaint = (complaintData) => {
    const complaintRecord = {
      ...complaintData,
      id: 'CMP-' + Math.floor(1000 + Math.random() * 9000),
      status: 'Complaint Received',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    if (activeBooking) {
      setActiveBooking(prev => ({
        ...prev,
        complaint: complaintRecord
      }));
    }
    return complaintRecord;
  };

  // 16. Community Bulk Service Inquiry / Quote Request
  const submitCommunityBulkRequest = (requestData) => {
    const newReq = {
      id: 'COMM-' + Math.floor(10000 + Math.random() * 90000),
      society_name: requestData.society_name || 'Palm Heights RWA',
      service_title: requestData.service_title,
      cooperative: requestData.cooperative,
      contact_person: requestData.contact_person,
      phone: requestData.phone,
      target_date: requestData.target_date,
      units_estimate: requestData.units_estimate,
      status: 'Inspection Scheduled',
      submitted_at: new Date().toISOString()
    };
    setCommunityRequests(prev => [newReq, ...prev]);
    return newReq;
  };

  // Always compute dynamic total as single source of truth
  const totalAmount = computeTotal(activeBooking);

  return (
    <BookingContext.Provider
      value={{
        activeBooking,
        pastBookings,
        communityRequests,
        totalAmount,
        isFirstTimeUser,
        FIRST_TIME_DISCOUNT,
        computeTotal,
        createBooking,
        assignWorker,
        triggerWorkerDelay,
        acceptWorkerDelay,
        findReplacementWorker,
        updateBookingStatus,
        verifyStartOtp,
        requestExtraWork,
        approveExtraWork,
        declineExtraWork,
        requestSecondWorker,
        approveSecondWorker,
        declineSecondWorker,
        verifyCompletionOtp,
        completePayment,
        processPayment: completePayment,
        submitRating,
        fileComplaint,
        submitCommunityBulkRequest,
        setActiveBooking,
        workerWaitRequest,
        waitElapsed,
        acknowledgeWorkerWait
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
export default BookingContext;
