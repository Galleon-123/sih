/* ============================================================
   UniServ Organizer Portal — Shared App Data & Utilities
   ============================================================ */

const COLORS = ['#1a6bcf','#2a7dbf','#3a8faf','#4a9f9f','#5aaf8f','#6abf7f','#7acf6f'];
function avatarColor(name) {
  const palette = ['#004ac6','#006c49','#784b00','#ba1a1a','#5c4db1','#0278ae','#a03b4c'];
  let idx = 0; for (let c of name) idx += c.charCodeAt(0);
  return palette[idx % palette.length];
}
function initials(name) { return name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(); }

// ─── Mock Workers ───────────────────────────────────────────
const MOCK_WORKERS = [
  { id:'WRK-1001', name:'Ravi Kumar',      trade:'Electrician',    loc:'Lajpat Nagar, Delhi',  applied:'2026-08-15', kyc:'verified',   assessment:'passed',    status:'active',             phone:'9876543210', exp:'5 yrs', aadhaar:'****-4521' },
  { id:'WRK-1002', name:'Suresh Patel',    trade:'Plumber',        loc:'Dwarka, Delhi',         applied:'2026-08-18', kyc:'pending',    assessment:'pending',   status:'pending',            phone:'9765432109', exp:'3 yrs', aadhaar:'****-3312' },
  { id:'WRK-1003', name:'Meena Devi',      trade:'Cleaner',        loc:'Saket, Delhi',          applied:'2026-08-20', kyc:'verified',   assessment:'assigned',  status:'assessment_pending', phone:'9654321098', exp:'2 yrs', aadhaar:'****-7823' },
  { id:'WRK-1004', name:'Arun Singh',      trade:'Carpenter',      loc:'Rohini, Delhi',         applied:'2026-08-22', kyc:'pending',    assessment:'pending',   status:'pending',            phone:'9543210987', exp:'7 yrs', aadhaar:'****-5541' },
  { id:'WRK-1005', name:'Priya Sharma',    trade:'Domestic Helper',loc:'Janakpuri, Delhi',      applied:'2026-08-23', kyc:'verified',   assessment:'passed',    status:'active',             phone:'9432109876', exp:'4 yrs', aadhaar:'****-9921' },
  { id:'WRK-1006', name:'Mohan Yadav',     trade:'Gardener',       loc:'Pitampura, Delhi',      applied:'2026-08-24', kyc:'rejected',   assessment:'pending',   status:'rejected',           phone:'9321098765', exp:'6 yrs', aadhaar:'****-2234' },
  { id:'WRK-1007', name:'Kavita Joshi',    trade:'Painter',        loc:'Vasant Kunj, Delhi',    applied:'2026-08-25', kyc:'pending',    assessment:'unassigned',status:'assessment_pending', phone:'9210987654', exp:'3 yrs', aadhaar:'****-6612' },
  { id:'WRK-1008', name:'Ramesh Gupta',    trade:'Driver',         loc:'Shahdara, Delhi',       applied:'2026-08-26', kyc:'verified',   assessment:'passed',    status:'active',             phone:'9109876543', exp:'8 yrs', aadhaar:'****-8831' },
  { id:'WRK-1009', name:'Sunita Kumari',   trade:'Cleaner',        loc:'Greater Noida',         applied:'2026-08-27', kyc:'pending',    assessment:'pending',   status:'pending',            phone:'9098765432', exp:'1 yr',  aadhaar:'****-4413' },
  { id:'WRK-1010', name:'Dinesh Tiwari',   trade:'Technician',     loc:'Gurgaon, Haryana',      applied:'2026-08-28', kyc:'verified',   assessment:'assigned',  status:'assessment_pending', phone:'8987654321', exp:'5 yrs', aadhaar:'****-7742' },
  { id:'WRK-1011', name:'Lalita Verma',    trade:'Domestic Helper',loc:'Faridabad, Haryana',    applied:'2026-08-29', kyc:'pending',    assessment:'unassigned',status:'assessment_pending', phone:'8876543210', exp:'2 yrs', aadhaar:'****-3381' },
  { id:'WRK-1012', name:'Ganesh Mishra',   trade:'Plumber',        loc:'Noida, UP',             applied:'2026-08-30', kyc:'verified',   assessment:'passed',    status:'active',             phone:'8765432109', exp:'9 yrs', aadhaar:'****-9953' },
  { id:'WRK-1013', name:'Radha Pandey',    trade:'Gardener',       loc:'South Delhi',           applied:'2026-08-31', kyc:'pending',    assessment:'pending',   status:'pending',            phone:'8654321098', exp:'3 yrs', aadhaar:'****-1127' },
  { id:'WRK-1014', name:'Arjun Rawat',     trade:'Carpenter',      loc:'East Delhi',            applied:'2026-09-01', kyc:'verified',   assessment:'passed',    status:'active',             phone:'8543210987', exp:'6 yrs', aadhaar:'****-5562' },
  { id:'WRK-1015', name:'Savita Nair',     trade:'Painter',        loc:'West Delhi',            applied:'2026-09-01', kyc:'pending',    assessment:'unassigned',status:'assessment_pending', phone:'8432109876', exp:'4 yrs', aadhaar:'****-8814' },
  { id:'WRK-1016', name:'Kishore Kumar',   trade:'Electrician',    loc:'North Delhi',           applied:'2026-09-01', kyc:'verified',   assessment:'passed',    status:'active',             phone:'8321098765', exp:'11 yrs',aadhaar:'****-2293' },
  { id:'WRK-1017', name:'Deepa Rawat',     trade:'Cleaner',        loc:'Ghaziabad, UP',         applied:'2026-09-01', kyc:'pending',    assessment:'pending',   status:'pending',            phone:'8210987654', exp:'2 yrs', aadhaar:'****-6641' },
  { id:'WRK-1018', name:'Naresh Pal',      trade:'Driver',         loc:'Gurugram, Haryana',     applied:'2026-09-01', kyc:'verified',   assessment:'assigned',  status:'assessment_pending', phone:'8109876543', exp:'7 yrs', aadhaar:'****-3374' },
  { id:'WRK-1019', name:'Pooja Singh',     trade:'Technician',     loc:'Connaught Place, Delhi',applied:'2026-09-02', kyc:'pending',    assessment:'unassigned',status:'assessment_pending', phone:'8098765432', exp:'3 yrs', aadhaar:'****-9982' },
  { id:'WRK-1020', name:'Bharat Sharma',   trade:'Plumber',        loc:'Mayur Vihar, Delhi',    applied:'2026-09-02', kyc:'rejected',   assessment:'pending',   status:'rejected',           phone:'7987654321', exp:'4 yrs', aadhaar:'****-7713' },
];

// ─── Assessment Criteria per Trade ──────────────────────────
const ASSESSMENT_CRITERIA = {
  'Electrician':     ['Safety Practices','Wire Identification','Switch Installation','Circuit Testing','Fault Diagnosis','Tool Handling'],
  'Plumber':         ['Safety Practices','Pipe & Fitting Knowledge','Pipe Jointing','Tap Installation','Leakage Detection','Drainage Handling','Tool Handling'],
  'Cleaner':         ['Hygiene Practices','Cleaning Procedure','Bathroom Cleaning','Floor Cleaning','Chemical Handling','Waste Handling','Equipment Handling'],
  'Domestic Helper': ['Safety Practices','Cleaning Technique','Surface Handling','Chemical Handling','Sanitization','Waste Segregation','Equipment Handling'],
  'Gardener':        ['Safety Practices','Plant Identification','Planting Technique','Pruning','Soil Preparation','Watering Practices','Tool Handling'],
  'Carpenter':       ['Safety Practices','Measurement','Wood Cutting','Drilling','Joint Making','Furniture Repair','Tool Handling'],
  'Painter':         ['Safety Practices','Surface Preparation','Primer Application','Paint Mixing','Brush Technique','Finishing & Smoothing','Tool Handling'],
  'Technician':      ['Safety Awareness','Basic Maintenance','Problem Identification','Basic Troubleshooting','Emergency Response','Equipment Handling','Issue Reporting'],
  'Driver':          ['Driving Licence','Licence Validity','Vehicle Class','Driving Experience','Vehicle Documents','Experience Details'],
  'Caregiver':       ['Patient Safety Practices','Vitals Monitoring','Medication Handling','Mobility & Transfer Support','Hygiene Care','Emergency Response Protocol','Equipment Handling'],
};

// ─── Assessment tokens (unassigned workers) ─────────────────
const ASSESSMENT_TOKENS = [
  { token:'ASS-4821', name:'Kavita Joshi',  trade:'Painter',        applied:'2026-08-25', id:'WRK-1007' },
  { token:'ASS-4822', name:'Lalita Verma',  trade:'Domestic Helper',applied:'2026-08-29', id:'WRK-1011' },
  { token:'ASS-4823', name:'Pooja Singh',   trade:'Technician',     applied:'2026-09-02', id:'WRK-1019' },
  { token:'ASS-4824', name:'Savita Nair',   trade:'Painter',        applied:'2026-09-01', id:'WRK-1015' },
  { token:'ASS-4825', name:'Sunita Kumari', trade:'Cleaner',        applied:'2026-08-27', id:'WRK-1009' },
  { token:'ASS-4826', name:'Radha Pandey',  trade:'Gardener',       applied:'2026-08-31', id:'WRK-1013' },
  { token:'ASS-4827', name:'Naresh Pal',    trade:'Driver',         applied:'2026-09-01', id:'WRK-1018' },
  { token:'ASS-4828', name:'Dinesh Tiwari', trade:'Technician',     applied:'2026-08-28', id:'WRK-1010' },
];

const ASSESSMENT_SCHEDULED = [
  { token:'ASS-4810', name:'Suresh Patel',  trade:'Plumber',        date:'2026-09-04 10:00 AM', assessor:'Ramesh Verma' },
  { token:'ASS-4811', name:'Meena Devi',    trade:'Cleaner',        date:'2026-09-04 11:30 AM', assessor:'Sunita Rao' },
  { token:'ASS-4812', name:'Arun Singh',    trade:'Carpenter',      date:'2026-09-05 09:00 AM', assessor:'Rajesh Kumar' },
  { token:'ASS-4813', name:'Bharat Sharma', trade:'Plumber',        date:'2026-09-05 02:00 PM', assessor:'Ramesh Verma' },
  { token:'ASS-4814', name:'Deepa Rawat',   trade:'Cleaner',        date:'2026-09-06 10:00 AM', assessor:'Sunita Rao' },
  { token:'ASS-4815', name:'Ganesh Mishra', trade:'Plumber',        date:'2026-09-06 03:00 PM', assessor:'Ramesh Verma' },
];

const ASSESSMENT_COMPLETED = [
  { token:'ASS-4800', name:'Ravi Kumar',   trade:'Electrician', result:'PASS', score:86 },
  { token:'ASS-4801', name:'Priya Sharma', trade:'Domestic Helper', result:'PASS', score:91 },
  { token:'ASS-4802', name:'Ramesh Gupta', trade:'Driver',      result:'PASS', score:95 },
  { token:'ASS-4803', name:'Arjun Rawat',  trade:'Carpenter',   result:'PASS', score:90 },
  { token:'ASS-4804', name:'Kishore Kumar',trade:'Electrician', result:'PASS', score:88 },
  { token:'ASS-4805', name:'Ganesh Mishra',trade:'Plumber',     result:'PASS', score:88 },
  { token:'ASS-4806', name:'Mohan Yadav',  trade:'Gardener',    result:'FAIL', score:48 },
  { token:'ASS-4807', name:'Bharat Sharma',trade:'Plumber',     result:'FAIL', score:42 },
  { token:'ASS-4808', name:'Lalita Verma', trade:'Domestic Helper', result:'PASS', score:84 },
  { token:'ASS-4809', name:'Naresh Pal',   trade:'Driver',      result:'PASS', score:92 },
];

// ─── Verification Queue ─────────────────────────────────────
const VERIFICATION_QUEUE = [
  { id:'WRK-1002', name:'Suresh Patel',  trade:'Plumber',         applied:'2026-08-18', aadhaar:'uploaded', selfie:'uploaded', cert:'missing' },
  { id:'WRK-1004', name:'Arun Singh',    trade:'Carpenter',       applied:'2026-08-22', aadhaar:'uploaded', selfie:'uploaded', cert:'uploaded' },
  { id:'WRK-1007', name:'Kavita Joshi',  trade:'Painter',         applied:'2026-08-25', aadhaar:'uploaded', selfie:'missing',  cert:'uploaded' },
  { id:'WRK-1009', name:'Sunita Kumari', trade:'Cleaner',         applied:'2026-08-27', aadhaar:'uploaded', selfie:'uploaded', cert:'missing' },
  { id:'WRK-1010', name:'Dinesh Tiwari', trade:'Technician',      applied:'2026-08-28', aadhaar:'uploaded', selfie:'uploaded', cert:'uploaded' },
  { id:'WRK-1011', name:'Lalita Verma',  trade:'Domestic Helper', applied:'2026-08-29', aadhaar:'missing',  selfie:'uploaded', cert:'uploaded' },
  { id:'WRK-1013', name:'Radha Pandey',  trade:'Gardener',        applied:'2026-08-31', aadhaar:'uploaded', selfie:'uploaded', cert:'uploaded' },
  { id:'WRK-1015', name:'Savita Nair',   trade:'Painter',         applied:'2026-09-01', aadhaar:'uploaded', selfie:'uploaded', cert:'uploaded' },
];

// ─── Demand Heatmap Data ─────────────────────────────────────
const HEATMAP_ZONES = [
  { zone:'Connaught Place', demand:'High',   service:'Electrician',    workers:3 },
  { zone:'Lajpat Nagar',   demand:'High',   service:'Plumber',        workers:2 },
  { zone:'Saket',          demand:'Medium', service:'Cleaner',        workers:6 },
  { zone:'Dwarka',         demand:'Critical',service:'Plumber',       workers:2 },
  { zone:'Rohini',         demand:'Medium', service:'Carpenter',      workers:4 },
  { zone:'Janakpuri',      demand:'Low',    service:'Domestic Helper',workers:5 },
  { zone:'Pitampura',      demand:'Medium', service:'Gardener',       workers:3 },
  { zone:'Vasant Kunj',    demand:'High',   service:'Painter',        workers:1 },
  { zone:'Shahdara',       demand:'Low',    service:'Driver',         workers:7 },
  { zone:'South Delhi',    demand:'High',   service:'Cleaner',        workers:4 },
  { zone:'Greater Noida',  demand:'Medium', service:'Technician',     workers:5 },
  { zone:'Gurgaon',        demand:'High',   service:'Electrician',    workers:3 },
  { zone:'Noida Sector 18',demand:'High',   service:'Plumber',        workers:2 },
  { zone:'Faridabad',      demand:'Low',    service:'Domestic Helper',workers:6 },
  { zone:'Ghaziabad',      demand:'Medium', service:'Cleaner',        workers:4 },
  { zone:'South Delhi Senior Care', demand:'High',   service:'Caregiver', workers:2 },
  { zone:'Gurgaon Sector 14',       demand:'Medium', service:'Caregiver', workers:3 },
];

// ─── Utility functions ───────────────────────────────────────
function showModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}
// Close modal on backdrop click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) closeModal(e.target.id);
});

function setActivePage(page) {
  document.querySelectorAll('.nav-link').forEach(el => {
    el.classList.remove('active');
    if (el.dataset.page === page) el.classList.add('active');
  });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

function statusBadge(status) {
  const map = {
    active:             '<span class="badge badge-green">Active</span>',
    pending:            '<span class="badge badge-amber">Pending</span>',
    assessment_pending: '<span class="badge badge-blue">Assessment Pending</span>',
    rejected:           '<span class="badge badge-red">Rejected</span>',
    verified:           '<span class="badge badge-green">Verified</span>',
    passed:             '<span class="badge badge-green">Passed</span>',
    failed:             '<span class="badge badge-red">Failed</span>',
    assigned:           '<span class="badge badge-blue">Assigned</span>',
    unassigned:         '<span class="badge badge-amber">Token Issued</span>',
  };
  return map[status] || `<span class="badge badge-gray">${status}</span>`;
}

function docBadge(status) {
  return status === 'uploaded'
    ? '<span style="color:#059669; font-weight:700; font-size:13px;">✓ Uploaded</span>'
    : '<span style="color:#dc2626; font-weight:700; font-size:13px;">✗ Missing</span>';
}

function calcScore(results, total) {
  const passes = Object.values(results).filter(v => v === 'pass').length;
  return Math.round((passes / total) * 100);
}

// Sidebar renderer
function renderSidebar(activePage) {
  const links = [
    { page:'dashboard',    icon:'dashboard',        label:'Dashboard',     href:'dashboard.html' },
    { page:'workers',      icon:'group',            label:'Workers',       href:'workers.html' },
    { page:'verification', icon:'verified_user',    label:'Verification',  href:'verification.html' },
    { page:'assessment',   icon:'assignment',       label:'Assessments',   href:'assessment.html' },
    { page:'bookings',     icon:'work_history',     label:'Live Bookings', href:'bookings.html' },
    { page:'community',    icon:'apartment',        label:'Bulk Projects', href:'community.html' },
    { page:'complaints',   icon:'report',           label:'Complaints',    href:'complaints.html' },
    { page:'heatmap',      icon:'map',              label:'Demand Heatmap',href:'heatmap.html' },
    { page:'analytics',    icon:'bar_chart',        label:'Analytics',     href:'analytics.html' },
  ];
  const navHTML = links.map(l => `
    <a href="${l.href}" class="nav-link${l.page === activePage ? ' active' : ''}" data-page="${l.page}">
      <span class="material-symbols-outlined" style="font-size:20px;">${l.icon}</span>
      <span>${l.label}</span>
    </a>`).join('');

  const html = `
    <div style="padding:24px; border-bottom:1px solid #c3c6d7;">
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="width:40px;height:40px;background:#004ac6;border-radius:12px;display:flex;align-items:center;justify-content:center;">
          <span class="material-symbols-outlined" style="color:white;font-size:20px;font-variation-settings:'FILL' 1;">hub</span>
        </div>
        <div>
          <h1 style="font-family:'Plus Jakarta Sans';font-size:18px;font-weight:700;color:#191c1e;line-height:1.2;">UniServ</h1>
          <p style="font-size:11px;color:#434655;">Organizer Portal</p>
        </div>
      </div>
    </div>
    <nav style="flex:1;padding:16px;overflow-y:auto;">${navHTML}</nav>
    <div style="padding:12px 16px;border-top:1px solid #c3c6d7;background:#f8f9ff;">
      <p style="font-size:10px;font-weight:700;color:#8b8fa8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Switch App</p>
      <div style="display:flex;gap:8px;">
        <a href="/sih/app/" target="_blank" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:8px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;text-decoration:none;color:#1d4ed8;font-size:12px;font-weight:600;">
          <span class="material-symbols-outlined" style="font-size:15px;font-variation-settings:'FILL' 1;">smartphone</span>User App
        </a>
        <a href="/sih/worker/" target="_blank" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:8px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;text-decoration:none;color:#15803d;font-size:12px;font-weight:600;">
          <span class="material-symbols-outlined" style="font-size:15px;font-variation-settings:'FILL' 1;">engineering</span>Worker App
        </a>
      </div>
    </div>
    <div style="padding:16px;border-top:1px solid #c3c6d7;">
      <div style="display:flex;align-items:center;gap:12px;padding:12px;background:#f2f4f6;border-radius:12px;">
        <div class="avatar" style="background:#004ac6;width:36px;height:36px;font-size:13px;">AS</div>
        <div style="flex:1;min-width:0;">
          <p style="font-size:13px;font-weight:600;color:#191c1e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Admin Sharma</p>
          <p style="font-size:11px;color:#434655;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">admin@delhi-coop.org</p>
        </div>
        <a href="index.html" title="Logout" style="text-decoration:none;">
          <span class="material-symbols-outlined" style="font-size:20px;color:#434655;cursor:pointer;">logout</span>
        </a>
      </div>
    </div>`;
  const container = document.getElementById('sidebar');
  if (container) container.innerHTML = html;
}
