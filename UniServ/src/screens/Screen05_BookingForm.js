import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useUser } from '../context/UserContext';
import { useBooking } from '../context/BookingContext';
import Header from '../components/Header';
import MediaCaptureModal from '../components/MediaCaptureModal';
import cooperativesData from '../data/cooperatives.json';

// =========================================================================
// 360-DEGREE TAILORED BULK & PROJECT CONFIGURATION ACROSS ALL 10 TRADES
// =========================================================================
export const TRADE_BULK_CONFIG = {
  s1: { // Plumber
    scaleHeading: '1. Select Plumbing Scope / Bathroom Units',
    scales: [
      { id: 'sc0', label: '1 Bathroom', sub: '~15–20 Concealed Fittings' },
      { id: 'sc1', label: '2 Baths + Kitchen', sub: '~40 Fittings & Diverters' },
      { id: 'sc2', label: '3 Baths + Kitchen + Tank', sub: '~65 Fittings & Manifold' },
      { id: 'sc3', label: 'Full Villa / Society Grid', sub: '~100+ Fittings & Pumps' }
    ],
    materialHeading: '2. Pipe Material & Sanitary Fixture Sourcing',
    materials: [
      { id: 'm0', label: 'Labour Only (Plumbing Tools Only)', sub: 'Customer provides all CPVC pipes, diverters & valves' },
      { id: 'm1', label: 'Labour + Standard ISI CPVC & Brass Valves', sub: 'Co-op supplies Astral/Ashirvad SDR-11 CPVC pipes & brass valves' },
      { id: 'm2', label: 'Labour + Premium Concealed Diverter Grid', sub: 'Thermostatic concealed diverters, multi-flow showers & pump lines' }
    ]
  },
  s2: { // Electrician
    scaleHeading: '1. Select Rewiring Scale & Power Points',
    scales: [
      { id: 'sc0', label: '1 BHK Rewiring', sub: '~25–35 Points + 1 AC Loop' },
      { id: 'sc1', label: '2 BHK Rewiring', sub: '~55–70 Points + 2 AC Lines' },
      { id: 'sc2', label: '3 BHK Full Grid', sub: '~90–120 Points + Inverter' },
      { id: 'sc3', label: '4 BHK / Villa 3-Phase', sub: '~150+ Points + Dual DB' }
    ],
    materialHeading: '2. Wire Gauge, MCB & Switchboard Sourcing',
    materials: [
      { id: 'm0', label: 'Labour Only (Electrical Tools Only)', sub: 'Customer provides all wires, conduits, DB & MCBs' },
      { id: 'm1', label: 'Labour + Standard ISI FRLS Wires & MCBs', sub: 'Co-op supplies Havells/Polycab FRLS copper wires, 6-Way DB & RCCB' },
      { id: 'm2', label: 'Labour + Premium Smart Modular IoT Grid', sub: 'Schneider/Legrand feather-touch smart switches & chemical earthing' }
    ]
  },
  s3: { // Cleaner
    scaleHeading: '1. Select Carpet Area & Cleaning Scope',
    scales: [
      { id: 'sc0', label: '1 BHK Deep Clean', sub: '~450–600 sq.ft (1 Bath + Kitchen)' },
      { id: 'sc1', label: '2 BHK Deep Clean', sub: '~800–1,100 sq.ft (2 Baths + Sofa)' },
      { id: 'sc2', label: '3 BHK Intensive Clean', sub: '~1,300–1,800 sq.ft (3 Baths + Steam)' },
      { id: 'sc3', label: '4 BHK / Villa Move-In', sub: '~2,500–4,500+ sq.ft (Full Crew)' }
    ],
    materialHeading: '2. Eco-Chemicals & Machinery Squad Setup',
    materials: [
      { id: 'm0', label: 'Labour Only (Basic Equipment Only)', sub: 'Customer provides all detergents, mops & vacuum machine' },
      { id: 'm1', label: 'Labour + TASKI Eco-Certified Chemical Squad', sub: 'Co-op supplies Diversey TASKI R1-R7 chemicals & single-disc rotary scrubbers' },
      { id: 'm2', label: 'Labour + Premium Hospital-Grade Steam Sanitization', sub: '130°C steam upholstery sterilization, diamond floor buffing & 30L wet extraction' }
    ]
  },
  s4: { // Carpenter
    scaleHeading: '1. Select Carpentry Scope & Joinery Scale',
    scales: [
      { id: 'sc0', label: 'Modular Kitchen', sub: '15–20 Shutters & Tandem Drawers' },
      { id: 'sc1', label: '2 Wardrobes + Bed', sub: '35–50 Hardware Points & Lifters' },
      { id: 'sc2', label: 'Full House Joinery', sub: '70–100 Points (Doors, Beds, Kitchen)' },
      { id: 'sc3', label: 'Full Villa Luxury Joinery', sub: '130+ Points (Teak Framing & Polish)' }
    ],
    materialHeading: '2. Hardware & Soft-Close Fitting Sourcing',
    materials: [
      { id: 'm0', label: 'Labour Only (Precision Carpentry Tools Only)', sub: 'Customer provides all hinges, drawer channels, locks & handles' },
      { id: 'm1', label: 'Labour + Standard ISI Soft-Close Hardware', sub: 'Co-op supplies Ebco 3D clip-on soft-close hinges, drawer slides & Godrej locks' },
      { id: 'm2', label: 'Labour + Premium German Silent Hardware', sub: 'Hettich Sensys silent damping hinges, Hafele pocket sliders & PU polish' }
    ]
  },
  s5: { // Painter
    scaleHeading: '1. Select Wall Area & Property Size',
    scales: [
      { id: 'sc0', label: '1 BHK Interior', sub: '~1,500 sq.ft Wall Area' },
      { id: 'sc1', label: '2 BHK Full House', sub: '~2,800 sq.ft Wall Area' },
      { id: 'sc2', label: '3 BHK Full House', sub: '~4,500 sq.ft Wall Area' },
      { id: 'sc3', label: '4 BHK / Villa Exterior', sub: '~6,500+ sq.ft Scaffolding' }
    ],
    materialHeading: '2. Paint Formulation & Surface Coat Quality',
    materials: [
      { id: 'm0', label: 'Labour Only', sub: 'Customer provides all paint, primer & putty cans' },
      { id: 'm1', label: 'Labour + Standard Co-op Paint & Primer', sub: 'Co-op supplies Asian Paints/Berger tractor emulsion & Birla white putty' },
      { id: 'm2', label: 'Labour + Premium Luxury Anti-Damp Paint', sub: 'Royale luxury high-sheen washable paint, anti-fungal seal & trim enamel' }
    ]
  },
  s6: { // Caregiver
    scaleHeading: '1. Select Patient Care Duration & Shift Schedule',
    scales: [
      { id: 'sc0', label: 'Weekly Post-Op Support', sub: '4 Hours Daily (7 Days)' },
      { id: 'sc1', label: 'Monthly 12-Hour Shift', sub: 'Day/Night Senior Care (30 Days)' },
      { id: 'sc2', label: 'Monthly 24x7 Dual Relay', sub: 'Continuous 2-Caregiver Team (30 Days)' },
      { id: 'sc3', label: 'Specialized ICU Step-Down', sub: 'Tracheostomy & Critical Care (30 Days)' }
    ],
    materialHeading: '2. Medical Equipment & Nursing Complexity',
    materials: [
      { id: 'm0', label: 'Basic Companionship & Mobility', sub: 'Assisted walking, feeding, oral medication reminders & vital checks' },
      { id: 'm1', label: 'Bedridden & Semi-Mobile Nursing Care', sub: 'Bed sore prevention, sponge bath, catheter bag care & wheelchair transfer' },
      { id: 'm2', label: 'Critical Post-Op & Physio Support', sub: 'Nebulization, oxygen monitoring, passive physiotherapy & medical chart logging' }
    ]
  },
  s7: { // Technician
    scaleHeading: '1. Select Multi-Appliance Service Scale',
    scales: [
      { id: 'sc0', label: 'Single Flat Multi-Appliance', sub: '3–5 AC / Fridge / Washing Units' },
      { id: 'sc1', label: 'Duplex / Villa HVAC Grid', sub: '6–10 Units & Inverter Circuits' },
      { id: 'sc2', label: 'Society Pre-Summer Camp', sub: '15–30 AC Jet-Wash Units' },
      { id: 'sc3', label: 'RWA Commercial Infrastructure', sub: '40+ Units & Chiller Systems' }
    ],
    materialHeading: '2. Spare Parts & Refrigerant Gas Grade',
    materials: [
      { id: 'm0', label: 'Labour Only (Diagnostics & Jet Wash)', sub: 'Customer pays extra for any replacement spare parts on-site' },
      { id: 'm1', label: 'Labour + Standard OEM Capacitors & Gas', sub: 'Co-op supplies heavy-duty starting capacitors, R32/R410A gas top-up & RO filters' },
      { id: 'm2', label: 'Labour + Complete Chemical Coil Wash & PCB', sub: 'Copper coil descaling, high-pressure foam jet wash & PCB circuit warranty' }
    ]
  },
  s8: { // Domestic Helper
    scaleHeading: '1. Select Event Squad or Monthly Roster Scope',
    scales: [
      { id: 'sc0', label: 'Single Event Kitchen Squad', sub: '3–4 Helpers (4 Hours Gathering)' },
      { id: 'sc1', label: 'Multi-Day Event / Wedding', sub: '5–8 Helpers (2 Full Days)' },
      { id: 'sc2', label: 'Monthly 2-Slot Household', sub: 'Daily Morning + Evening (30 Days)' },
      { id: 'sc3', label: 'Monthly Full-Day Housekeeping', sub: '8 Hours Daily Cooking & Chores (30 Days)' }
    ],
    materialHeading: '2. Meal Preparation & Hospitality Complexity',
    materials: [
      { id: 'm0', label: 'Standard Household Chores', sub: 'Sweeping, mopping, utensil washing & laundry folding' },
      { id: 'm1', label: 'Full 3-Course Cooking + Deep Kitchen', sub: 'Vegetable chopping, multi-cuisine cooking & complete slab degreasing' },
      { id: 'm2', label: 'All-Inclusive Event Buffet & Party Squad', sub: 'Live food serving, party dishwashing, garbage segregation & sanitization' }
    ]
  },
  s9: { // Driver
    scaleHeading: '1. Select Fleet & Valet Deployment Scale',
    scales: [
      { id: 'sc0', label: 'Single Event Valet Squad', sub: '4 Uniformed Chauffeurs (6 Hours)' },
      { id: 'sc1', label: 'Corporate Delegate Fleet', sub: '6 Luxury Chauffeurs (Full Day)' },
      { id: 'sc2', label: 'Outstation Multi-Day Relay', sub: '3–5 Drivers (3 Days Tour)' },
      { id: 'sc3', label: 'Monthly Dedicated Chauffeur', sub: '26 Working Days (8 hrs/day)' }
    ],
    materialHeading: '2. Vehicle Transmission & Chauffeur Tier',
    materials: [
      { id: 'm0', label: 'Standard Commercial DL Chauffeur', sub: 'Manual transmission sedans and hatchbacks with route GPS navigation' },
      { id: 'm1', label: 'Automatic & Large SUV / MUV Chauffeur', sub: 'Automatic transmission, Innova/Fortuner/EV certified with FastTag' },
      { id: 'm2', label: 'VIP Executive Luxury & Armoured Squad', sub: 'Uniformed bilingual luxury chauffeurs (Mercedes/BMW/Audi), defensive driving certified' }
    ]
  },
  s10: { // Gardener
    scaleHeading: '1. Select Garden Area & Landscape Scale',
    scales: [
      { id: 'sc0', label: 'Balcony / Terrace Garden', sub: '15–35 Pots Soil Aeration' },
      { id: 'sc1', label: 'Lawn & Boundary Hedges', sub: '~500–1,200 sq.ft Grass & Hedges' },
      { id: 'sc2', label: 'Large Villa Landscape', sub: '~2,000–5,000 sq.ft & Tree Pruning' },
      { id: 'sc3', label: 'Society Green Belt & Parks', sub: '10,000+ sq.ft Park Maintenance' }
    ],
    materialHeading: '2. Horticulture, Compost & Irrigation Sourcing',
    materials: [
      { id: 'm0', label: 'Labour Only (Horticulture Tools Only)', sub: 'Customer supplies all soil, organic manure & fertilizer' },
      { id: 'm1', label: 'Labour + Organic Vermicompost & Neem Care', sub: 'Co-op supplies fortified vermicompost, neem pest spray & electric shears' },
      { id: 'm2', label: 'Labour + Fresh Lawn Sodding & Drip Grid', sub: 'Fresh Mexican lawn grass sods, exotic flowering plants & automated drip lines' }
    ]
  }
};

export const getDynamicSoloPrice = (
  serviceId,
  tradeSubtype,
  tradeScope2,
  tradeScope3,
  tripType,
  transmissionType,
  defaultStartPrice = 149
) => {
  let price = Number(defaultStartPrice) || 149;

  switch (serviceId) {
    case 's1': // Plumber
      price = 149;
      if (tradeSubtype === 'Leaking Tap / Spindle') price = 149;
      else if (tradeSubtype === 'Drainage / Bottle Trap Block') price = 249;
      else if (tradeSubtype === 'Flush Tank / Cistern Fault') price = 299;
      else if (tradeSubtype === 'Shower Mixer / Diverter') price = 349;
      else if (tradeSubtype === 'Pipe Joint Burst (SOS)') price = 399;
      else if (tradeSubtype === 'Water Tank Overflow / Ball Valve') price = 349;

      if (tradeScope3 === 'Concealed Inside Wall') price += 100;
      break;

    case 's2': // Electrician
      price = 149;
      if (tradeSubtype === 'Switchboard / Socket Spark') price = 149;
      else if (tradeSubtype === 'Fan / Chandelier Fitting') price = 199;
      else if (tradeSubtype === 'MCB / RCCB Frequent Tripping') price = 249;
      else if (tradeSubtype === 'Heavy AC/Geyser Power Line') price = 349;
      else if (tradeSubtype === 'Inverter Backup / Battery Fuse') price = 299;
      else if (tradeSubtype === 'Total Power Outage (SOS)') price = 399;

      if (tradeScope3 === '3-Phase 415V (Heavy Load)') price += 100;
      break;

    case 's3': // Cleaner
      price = 199;
      if (tradeSubtype === 'Balcony Scrub & Pigeon Net') price = 199;
      else if (tradeSubtype === 'Window Tracks & Glass Buffing') price = 249;
      else if (tradeSubtype === 'Bathroom Scrub & Descaling') price = 299;
      else if (tradeSubtype === 'Kitchen Degreasing & Chimney') price = 399;
      else if (tradeSubtype === 'Sofa / Carpet Wet Shampoo') price = 499;
      else if (tradeSubtype === 'Full Floor Rotary Machine Scrub') price = 599;

      if (tradeScope2 === 'Post-Paint / Cement Marks' || tradeScope2 === 'Heavy Oil & Grease Sludge') price += 100;
      if (tradeScope3 === 'Hospital Grade Steam Sterilization') price += 150;
      break;

    case 's4': // Carpenter
      price = 149;
      if (tradeSubtype === 'Door Lock / Mortise Latch Repair') price = 149;
      else if (tradeSubtype === 'Hydraulic Soft-Close Hinge') price = 199;
      else if (tradeSubtype === 'Drawer Telescopic Slider Channel') price = 249;
      else if (tradeSubtype === 'Door Bottom Planing / Floor Rub') price = 299;
      else if (tradeSubtype === 'Wood Sanding & Touch-Up Polish') price = 349;
      else if (tradeSubtype === 'Bed / Wardrobe Assembly & Align') price = 399;

      if (tradeScope2 === 'Solid Teak / Sheesham Wood') price += 100;
      break;

    case 's5': // Painter
      price = 249;
      if (tradeSubtype === 'Water Dampness & Putty Patch') price = 249;
      else if (tradeSubtype === 'Door / Window Polish & Enamel') price = 349;
      else if (tradeSubtype === 'Single Accent Wall Paint') price = 499;
      break;

    case 's6': // Caregiver
      price = 249;
      if (tradeSubtype === 'Doctor Visit / OPD Mobility Escort') price = 249;
      else if (tradeSubtype === 'Elderly Companionship & Feeding') price = 299;
      else if (tradeSubtype === 'Vitals Check (BP, Sugar, SpO2)') price = 349;
      else if (tradeSubtype === 'Post-Operative Recovery Support') price = 399;
      else if (tradeSubtype === 'Bedridden Sponge Bath & Hygiene') price = 449;
      else if (tradeSubtype === 'Night-Time Bedside Vigil') price = 599;

      if (tradeScope3 && (tradeScope3.includes('Oxygen') || tradeScope3.includes('Tracheostomy') || tradeScope3.includes('Ryle'))) price += 150;
      break;

    case 's7': // Technician
      price = 199;
      if (tradeSubtype?.includes('Microwave') || tradeSubtype?.includes('Storage Geyser')) price = 249;
      else if (tradeSubtype?.includes('RO Water Purifier')) price = 299;
      else if (tradeSubtype?.includes('Washing Machine')) price = 349;
      else if (tradeSubtype?.includes('Refrigerator')) price = 399;
      else if (tradeSubtype?.includes('Split / Inverter AC')) price = 449;

      if (tradeScope3 === 'Suspected Gas Leak & Brazing Repair' || tradeScope3 === 'PCB Circuit Board Diagnostics') price += 150;
      break;

    case 's8': // Domestic Helper
      price = 149;
      if (tradeSubtype === 'Clothes Ironing & Wardrobe Fold') price = 149;
      else if (tradeSubtype === 'Party Utensils Mass Washing') price = 249;
      else if (tradeSubtype === 'Post-Event Kitchen Slab Degrease' || tradeSubtype === 'Deep Balcony & Window Mesh Wash') price = 299;
      else if (tradeSubtype === 'One-Time Meal Cooking (Lunch/Dinner)') price = 349;
      else if (tradeSubtype === 'Emergency Substitute Cook (SOS)') price = 399;

      if (tradeScope3 === '6+ Large Joint Family') price += 100;
      break;

    case 's9': // Driver
      price = 199;
      if (tripType === 'City Commute (2 hrs)') price = 199;
      else if (tripType === 'Airport Transfer') price = 299;
      else if (tripType === 'Full Day City (8 hrs)') price = 699;
      else if (tripType === 'Outstation Round-Trip') price = 1199;

      if (transmissionType === 'Heavy SUV / 4x4' || transmissionType === 'Automatic (AT/CVT)' || transmissionType === 'Electric Vehicle (EV)') price += 100;
      break;

    case 's10': // Gardener
      price = 149;
      if (tradeSubtype === 'Balcony Pot Aeration & Soil Refresh') price = 149;
      else if (tradeSubtype === 'Indoor Plant Repotting & Fertilizer') price = 199;
      else if (tradeSubtype === 'Organic Pest Spray (Neem/Bio)') price = 249;
      else if (tradeSubtype === 'Lawn De-weeding & Mowing' || tradeSubtype === 'Automated Drip Tube Unclogging') price = 349;
      else if (tradeSubtype === 'Tree Canopy Lopping & Branch Trim') price = 399;

      if (tradeScope3 === 'Fortified Vermicompost & Neem Blend' || tradeScope3 === 'Coco-Peat & Perlite Aeration Mix') price += 100;
      break;

    default:
      price = Number(defaultStartPrice) || 149;
  }

  return price;
};

export const Screen05_BookingForm = ({ route, navigation }) => {
  const { service, bookingType = 'now', emergencyIssue } = route.params || {};
  const { user, t } = useUser();
  const { createBooking, isFirstTimeUser, FIRST_TIME_DISCOUNT, submitCommunityBulkRequest } = useBooking();

  const serviceId = service?.id || 's1';
  const isDriverService = serviceId === 's9';
  const matchedCoop = cooperativesData[0];

  const currentBulkConfig = TRADE_BULK_CONFIG[serviceId] || TRADE_BULK_CONFIG.s1;

  // Scale Mode: 'solo' (Retail household 1-2 workers) vs 'bulk' (Full Property / Multi-Worker Community Fleet)
  const [scaleMode, setScaleMode] = useState('solo');

  // Bulk Project Customization State by Index
  const [selectedScaleIndex, setSelectedScaleIndex] = useState(1); // Default to 2nd tier
  const [selectedMaterialIndex, setSelectedMaterialIndex] = useState(1); // Default to Standard Co-op

  const [callModalVisible, setCallModalVisible] = useState(false);
  const [inspectionSuccessModal, setInspectionSuccessModal] = useState(false);
  const [inspectionTicket, setInspectionTicket] = useState(null);

  // Standard address vs Driver Pickup & Drop
  const [address, setAddress] = useState(user?.address || 'Flat 302, Palm Heights, Block B, Lajpat Nagar, New Delhi');
  const [pickupAddress, setPickupAddress] = useState('Flat 302, Palm Heights, Block B, Lajpat Nagar, New Delhi');
  const [dropAddress, setDropAddress] = useState('IGI Airport Terminal 3, New Delhi');
  const [landmark, setLandmark] = useState(user?.landmark || 'Near Metro Gate No. 2');

  // Trade-Specific Dynamic State
  const [tradeSubtype, setTradeSubtype] = useState('');
  const [tradeScope2, setTradeScope2] = useState('');
  const [tradeScope3, setTradeScope3] = useState('');

  // Driver Trip Config
  const [tripType, setTripType] = useState('City Commute (2 hrs)');
  const [transmissionType, setTransmissionType] = useState('Manual');

  const DRIVER_TRIP_TYPES = [
    { id: 't1', label: 'City Commute (2 hrs)', price: 199 },
    { id: 't2', label: 'Full Day City (8 hrs)', price: 699 },
    { id: 't3', label: 'Airport Transfer', price: 299 },
    { id: 't4', label: 'Outstation Round-Trip', price: 1199 }
  ];

  const POPULAR_DROP_LOCATIONS = [
    'IGI Airport Terminal 3',
    'Cyber Hub, Gurugram',
    'Max Super Speciality Hospital, Saket',
    'New Delhi Railway Station',
    'Select Citywalk, Saket'
  ];

  const [description, setDescription] = useState(
    emergencyIssue
      ? `Emergency SOS: ${emergencyIssue} requiring immediate priority dispatch.`
      : ''
  );

  const [pickedImage, setPickedImage] = useState(null);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [type, setType] = useState(bookingType);
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  // Separate Date & Time selectors
  const DATES = [
    { id: 'd1', label: 'Today (31 Aug)', day: 'Today' },
    { id: 'd2', label: 'Tomorrow (1 Sep)', day: 'Tomorrow' },
    { id: 'd3', label: 'Wed (2 Sep)', day: 'Wed' },
    { id: 'd4', label: 'Sat (5 Sep)', day: 'Sat' }
  ];

  const TIMES = [
    '09:30 AM',
    '11:30 AM',
    '02:00 PM',
    '04:30 PM',
    '06:30 PM'
  ];

  const [selectedDate, setSelectedDate] = useState(DATES[0].label);
  const [selectedTime, setSelectedTime] = useState(TIMES[0]);

  // =========================================================================
  // DEEP INDIAN MARKET MATHEMATICAL BULK COST ESTIMATION ALGORITHM
  // =========================================================================
  const bulkEstimation = useMemo(() => {
    let crewSize = 3;
    let days = 2;
    let minCost = 3500;
    let maxCost = 5500;
    let desc = '';

    const isLabourOnly = selectedMaterialIndex === 0;
    const isPremium = selectedMaterialIndex === 2;

    switch (serviceId) {
      case 's1': // Plumbing Bulk
        if (selectedScaleIndex === 0) { // 1 Bathroom
          crewSize = isLabourOnly ? 2 : 3;
          days = 2;
          minCost = isLabourOnly ? 3500 : isPremium ? 12500 : 7500;
          maxCost = isLabourOnly ? 5000 : isPremium ? 16500 : 10500;
          desc = '1 Bathroom Overhaul (~15–20 fittings): Concealed CPVC hot & cold line, angle valves, bottle trap & diverter pressure test.';
        } else if (selectedScaleIndex === 1) { // 2 Baths + Kitchen
          crewSize = 3;
          days = 3;
          minCost = isLabourOnly ? 7000 : isPremium ? 24000 : 15000;
          maxCost = isLabourOnly ? 9500 : isPremium ? 32000 : 20000;
          desc = '2 Bathrooms + Kitchen (~40 fittings): Complete repiping with ISI Astral/Ashirvad CPVC, brass ball valves & kitchen grease trap.';
        } else if (selectedScaleIndex === 2) { // 3 Baths + Tank
          crewSize = 5;
          days = 4;
          minCost = isLabourOnly ? 12000 : isPremium ? 38000 : 25000;
          maxCost = isLabourOnly ? 16000 : isPremium ? 48000 : 34000;
          desc = '3 Bathrooms + Kitchen + Overhead Tank Grid: 5 certified plumbers under 1 Master Pipefitter, multi-port manifold & core drilling.';
        } else { // Full Villa Grid
          crewSize = 7;
          days = 6;
          minCost = isLabourOnly ? 22000 : isPremium ? 65000 : 45000;
          maxCost = isLabourOnly ? 30000 : isPremium ? 85000 : 58000;
          desc = 'Full Villa / Society Water Infrastructure (~100+ fittings): Booster pump line, rainwater harvesting bypass & multi-floor riser lines.';
        }
        break;

      case 's2': // Electrician Bulk
        if (selectedScaleIndex === 0) { // 1 BHK Rewiring
          crewSize = isLabourOnly ? 2 : 3;
          days = 2;
          minCost = isLabourOnly ? 4500 : isPremium ? 18000 : 9500;
          maxCost = isLabourOnly ? 6500 : isPremium ? 24000 : 13500;
          desc = '1 BHK Complete Rewiring (~25–35 Points): FRLS multi-strand copper wire pulling, DB dressing with RCCB & load balancing.';
        } else if (selectedScaleIndex === 1) { // 2 BHK Rewiring
          crewSize = 3;
          days = 3;
          minCost = isLabourOnly ? 8500 : isPremium ? 32000 : 18000;
          maxCost = isLabourOnly ? 11500 : isPremium ? 42000 : 24000;
          desc = '2 BHK Complete Rewiring (~55–70 Points): Dedicated 4 sq.mm AC lines, Havells/Polycab FRLS cables, 6-Way DB & earthing test.';
        } else if (selectedScaleIndex === 2) { // 3 BHK Full Grid
          crewSize = 5;
          days = 4;
          minCost = isLabourOnly ? 14000 : isPremium ? 52000 : 30000;
          maxCost = isLabourOnly ? 19000 : isPremium ? 68000 : 38000;
          desc = '3 BHK Full Electrical Grid (~90–120 Points): 5 licensed wiremen under 1 Master Wireman, 8-Way double door DB, 3 AC loops & inverter dual circuit.';
        } else { // 4 BHK / Villa 3-Phase
          crewSize = 7;
          days = 6;
          minCost = isLabourOnly ? 24000 : isPremium ? 85000 : 48000;
          maxCost = isLabourOnly ? 32000 : isPremium ? 115000 : 62000;
          desc = 'Full Villa / Society 3-Phase Infrastructure (~150+ Points): 3-Phase 415V distribution, dual DB, chemical copper earthing pit & surge arrestors.';
        }
        break;

      case 's3': // Deep Cleaning Bulk
        if (selectedScaleIndex === 0) { // 1 BHK Deep Clean
          crewSize = 2;
          days = 1;
          minCost = isLabourOnly ? 1499 : isPremium ? 2499 : 1799;
          maxCost = isLabourOnly ? 1999 : isPremium ? 3299 : 2299;
          desc = '1 BHK Full Deep Clean (~450–600 sq.ft): Single-disc rotary scrubber, acid-free bathroom descaling, chimney degreasing & window track vacuum.';
        } else if (selectedScaleIndex === 1) { // 2 BHK Deep Clean
          crewSize = 3;
          days = 1;
          minCost = isLabourOnly ? 2499 : isPremium ? 3799 : 2899;
          maxCost = isLabourOnly ? 3299 : isPremium ? 4899 : 3699;
          desc = '2 BHK Full Deep Clean (~800–1,100 sq.ft): 3 sanitation specialists with 30L industrial wet-vacuum, sofa fabric extraction & kitchen tile buffing.';
        } else if (selectedScaleIndex === 2) { // 3 BHK Intensive Clean
          crewSize = 5;
          days = 1;
          minCost = isLabourOnly ? 3799 : isPremium ? 5499 : 4499;
          maxCost = isLabourOnly ? 4899 : isPremium ? 6999 : 5699;
          desc = '3 BHK Intensive Sanitization (~1,300–1,800 sq.ft): 5-member team covering 3 bathrooms, kitchen cabinets interior, 130°C steam upholstery sterilization.';
        } else { // 4 BHK / Villa Move-In
          crewSize = 8;
          days = 1;
          minCost = isLabourOnly ? 6499 : isPremium ? 9500 : 7999;
          maxCost = isLabourOnly ? 8999 : isPremium ? 12500 : 10500;
          desc = 'Full Villa / Move-in Sanitization (~2,500–4,500+ sq.ft): 8 specialists + 1 supervisor with heavy floor polishers, post-construction paint & cement scrub.';
        }
        break;

      case 's4': // Carpenter Bulk (REAL-WORLD JOINERY)
        if (selectedScaleIndex === 0) { // Modular Kitchen Overhaul
          crewSize = isLabourOnly ? 2 : 3;
          days = 2;
          minCost = isLabourOnly ? 4500 : isPremium ? 16000 : 8500;
          maxCost = isLabourOnly ? 6500 : isPremium ? 22000 : 12500;
          desc = 'Modular Kitchen Overhaul (15–20 Shutters/Drawers): Soft-close 3D hydraulic hinges, tandem drawer channels, spice rack pullout alignment & base leveling.';
        } else if (selectedScaleIndex === 1) { // 2 Wardrobes + Bed Storage
          crewSize = 3;
          days = 3;
          minCost = isLabourOnly ? 7500 : isPremium ? 28000 : 16000;
          maxCost = isLabourOnly ? 10500 : isPremium ? 38000 : 22000;
          desc = '2 Bedroom Wardrobes + Hydraulic Storage Bed (35–50 Points): Heavy-duty gas pump bed lifters, sliding wardrobe tracks, computerized mortise locks & handles.';
        } else if (selectedScaleIndex === 2) { // Full House Joinery
          crewSize = 5;
          days = 4;
          minCost = isLabourOnly ? 12500 : isPremium ? 48000 : 26000;
          maxCost = isLabourOnly ? 17500 : isPremium ? 62000 : 35000;
          desc = 'Full House Joinery & Modular Grid (70–100 Points): 5 joiners under 1 Master Carpenter covering all internal doors, kitchen cabinets, wardrobes & PU polish touch-up.';
        } else { // Full Villa Luxury Joinery
          crewSize = 7;
          days = 6;
          minCost = isLabourOnly ? 22000 : isPremium ? 78000 : 44000;
          maxCost = isLabourOnly ? 30000 : isPremium ? 105000 : 58000;
          desc = 'Full Villa Luxury Joinery (130+ Points): Solid teak wood door framing, Hettich Sensys silent damping hinges, Hafele pocket sliders & high-gloss veneer edging.';
        }
        break;

      case 's5': // Painting
        if (selectedScaleIndex === 0) { // 1 BHK
          crewSize = isLabourOnly ? 2 : 3;
          days = 2;
          minCost = isLabourOnly ? 4500 : isPremium ? 12000 : 8500;
          maxCost = isLabourOnly ? 6000 : isPremium ? 15000 : 11000;
          desc = 'Full 1 BHK Interior (~1,500 sq.ft wall area): Putty touch-up, primer base coat + 2 coats of emulsion.';
        } else if (selectedScaleIndex === 1) { // 2 BHK
          crewSize = 4;
          days = 3;
          minCost = isLabourOnly ? 8500 : isPremium ? 22000 : 16500;
          maxCost = isLabourOnly ? 11000 : isPremium ? 26000 : 19500;
          desc = 'Full 2 BHK (~2,800 sq.ft wall area): Surface sanding, crack filling, moisture seal & 2 finish coats.';
        } else if (selectedScaleIndex === 2) { // 3 BHK
          crewSize = 6;
          days = 4;
          minCost = isLabourOnly ? 14000 : isPremium ? 36000 : 26000;
          maxCost = isLabourOnly ? 18000 : isPremium ? 42000 : 31000;
          desc = 'Full 3 BHK (~4,500 sq.ft wall area): 6 certified painters under 1 Master Foreman, ceiling & trim masking.';
        } else { // 4 BHK / Villa
          crewSize = 8;
          days = 6;
          minCost = isLabourOnly ? 24000 : isPremium ? 58000 : 42000;
          maxCost = isLabourOnly ? 30000 : isPremium ? 68000 : 50000;
          desc = 'Full 4 BHK / Independent Villa (~6,500+ sq.ft): Double-tier scaffolding, exterior & interior weather-coat.';
        }
        break;

      case 's6': // Caregiver Bulk / Shift Packages
        if (selectedScaleIndex === 0) { // Weekly Post-Op Support (7 Days)
          crewSize = 1;
          days = 7;
          minCost = isLabourOnly ? 4200 : isPremium ? 9800 : 6300;
          maxCost = isLabourOnly ? 5600 : isPremium ? 13000 : 8400;
          desc = 'Weekly Post-Operative Recovery (4 hrs/day • 7 Days): Surgical dressing assistance, assisted walking, passive physio exercises & medicine charting.';
        } else if (selectedScaleIndex === 1) { // Monthly 12-Hour Shift (30 Days)
          crewSize = 1;
          days = 30;
          minCost = isLabourOnly ? 18000 : isPremium ? 38000 : 26000;
          maxCost = isLabourOnly ? 24000 : isPremium ? 48000 : 34000;
          desc = 'Monthly 12-Hour Day/Night Senior Care (30 Days): Feeding, bathing, diaper hygiene, medication schedule, vital monitoring & cognitive companionship.';
        } else if (selectedScaleIndex === 2) { // Monthly 24x7 Continuous Dual Relay (30 Days)
          crewSize = 2;
          days = 30;
          minCost = isLabourOnly ? 34000 : isPremium ? 68000 : 48000;
          maxCost = isLabourOnly ? 44000 : isPremium ? 88000 : 62000;
          desc = 'Monthly 24x7 Continuous Dual-Caregiver Relay (30 Days): 2 alternating caregivers covering round-the-clock bedridden care & night vigilance.';
        } else { // Specialized ICU Step-Down & Tracheostomy (30 Days)
          crewSize = 2;
          days = 30;
          minCost = isLabourOnly ? 48000 : isPremium ? 88000 : 68000;
          maxCost = isLabourOnly ? 62000 : isPremium ? 115000 : 88000;
          desc = 'Specialized ICU Step-Down & Critical Care (30 Days): 2 certified GDAs + 1 weekly Nurse Supervisor for suctioning, oxygen monitoring & tube feeding.';
        }
        break;

      case 's7': // Technician Multi-Appliance & HVAC Camps
        if (selectedScaleIndex === 0) { // Single Flat Multi-Appliance (3–5 Units)
          crewSize = 2;
          days = 1;
          minCost = isLabourOnly ? 1800 : isPremium ? 7500 : 4500;
          maxCost = isLabourOnly ? 2800 : isPremium ? 10500 : 6800;
          desc = 'Single Flat Multi-Appliance (3–5 Units): High-pressure foam jet wash for 2 ACs, washing machine descaling & refrigerator condenser cleaning.';
        } else if (selectedScaleIndex === 1) { // Duplex / Villa HVAC Grid (6–10 Units)
          crewSize = 3;
          days = 2;
          minCost = isLabourOnly ? 3800 : isPremium ? 16000 : 9500;
          maxCost = isLabourOnly ? 5500 : isPremium ? 22000 : 14000;
          desc = 'Duplex / Villa Complete HVAC & Kitchen (6–10 Units): Comprehensive chemical coil wash, refrigerant gas top-up, RO membrane replacement & geyser descaling.';
        } else if (selectedScaleIndex === 2) { // Society Pre-Summer AC Camp (15–30 Units)
          crewSize = 5;
          days = 3;
          minCost = isLabourOnly ? 8500 : isPremium ? 38000 : 22000;
          maxCost = isLabourOnly ? 12500 : isPremium ? 52000 : 32000;
          desc = 'Society Pre-Summer Camp (15–30 AC Units): 5 HVAC technicians with mobile diagnostic bay, indoor jacket wash, outdoor unit jetting & capacitor load test.';
        } else { // RWA Commercial Infrastructure (40+ Units)
          crewSize = 8;
          days = 5;
          minCost = isLabourOnly ? 18000 : isPremium ? 85000 : 48000;
          maxCost = isLabourOnly ? 26000 : isPremium ? 120000 : 68000;
          desc = 'Commercial / RWA Full Society Infrastructure (40+ Units & Chillers): 8 technicians under 1 Master Engineer, chiller maintenance & ventilation fan overhaul.';
        }
        break;

      case 's8': // Domestic Helper Bulk / Event Squads / Monthly Rosters
        if (selectedScaleIndex === 0) { // Single Event Kitchen Squad (3–4 Helpers)
          crewSize = 4;
          days = 1;
          minCost = isLabourOnly ? 2499 : isPremium ? 5499 : 3999;
          maxCost = isLabourOnly ? 3499 : isPremium ? 7200 : 5499;
          desc = 'Single Event Kitchen Squad (4 Helpers • 4 hrs): Multi-helper food prep, hot chapati/poori rolling, live buffet serving & party dishwashing.';
        } else if (selectedScaleIndex === 1) { // Multi-Day Event / Wedding (5–8 Helpers)
          crewSize = 6;
          days = 2;
          minCost = isLabourOnly ? 7500 : isPremium ? 22000 : 14000;
          maxCost = isLabourOnly ? 10500 : isPremium ? 29000 : 19000;
          desc = 'Multi-Day Wedding / Festival Squad (6 Helpers • 2 Days): Continuous catering assistance, multi-course banquet prep, hall table cleaning & garbage segregation.';
        } else if (selectedScaleIndex === 2) { // Monthly 2-Slot Household (30 Days)
          crewSize = 1;
          days = 30;
          minCost = isLabourOnly ? 4500 : isPremium ? 14000 : 8500;
          maxCost = isLabourOnly ? 6000 : isPremium ? 18500 : 11500;
          desc = 'Monthly 2-Slot Dedicated Household Roster (30 Days): Fixed morning & evening visits for 3-course Indian homestyle cooking, sweeping, mopping & utensils with backup relief.';
        } else { // Monthly Full-Day Housekeeping (8 hrs daily • 30 Days)
          crewSize = 1;
          days = 30;
          minCost = isLabourOnly ? 12000 : isPremium ? 26000 : 18000;
          maxCost = isLabourOnly ? 15500 : isPremium ? 34000 : 24000;
          desc = 'Monthly Full-Day Resident Housekeeping Aide (8 hrs daily • 30 Days): All 3 meals cooking, complete floor sanitization, laundry ironing & kitchen inventory maintenance.';
        }
        break;

      case 's9': // Driver Bulk / Event Valet Fleets / Multi-Day
        if (selectedScaleIndex === 0) { // Single Event Valet Squad (4 Chauffeurs • 6 hrs)
          crewSize = 4;
          days = 1;
          minCost = isLabourOnly ? 2499 : isPremium ? 5999 : 3999;
          maxCost = isLabourOnly ? 3499 : isPremium ? 8200 : 5499;
          desc = 'Single Event Valet Squad (4 Uniformed Chauffeurs • 6 hrs): Dedicated banquet / wedding guest vehicle parking, key-tag tracking & zero scratch protocol.';
        } else if (selectedScaleIndex === 1) { // Corporate Delegate Fleet (6 Luxury Chauffeurs)
          crewSize = 6;
          days = 1;
          minCost = isLabourOnly ? 5500 : isPremium ? 14000 : 8500;
          maxCost = isLabourOnly ? 7500 : isPremium ? 19000 : 12000;
          desc = 'Corporate Delegate Multi-Car Fleet (6 Luxury Chauffeurs • Full Day): Punctual airport transfers, luxury EV / German car handling, bilingual etiquette.';
        } else if (selectedScaleIndex === 2) { // Outstation Multi-Day Relay (3–5 Drivers • 3 Days)
          crewSize = 4;
          days = 3;
          minCost = isLabourOnly ? 7500 : isPremium ? 18000 : 12000;
          maxCost = isLabourOnly ? 10500 : isPremium ? 25000 : 16500;
          desc = 'Outstation Multi-Day Tour Relay (4 Highway Drivers • 3 Days): Multi-car convoy highway driving, night navigation, FastTag clearance & hill/ghat section handling.';
        } else { // Monthly Dedicated Chauffeur (26 Days • 8 hrs/day)
          crewSize = 1;
          days = 26;
          minCost = isLabourOnly ? 14000 : isPremium ? 25000 : 18000;
          maxCost = isLabourOnly ? 17500 : isPremium ? 32000 : 23000;
          desc = 'Monthly Dedicated Personal Chauffeur (26 Days • 8 hrs/day): Punctual daily office commute, school runs, vehicle maintenance & weekly cooperative safety audit.';
        }
        break;

      case 's10': // Gardener Bulk / Landscaping & Society Parks
        if (selectedScaleIndex === 0) { // Balcony / Terrace Garden (15–35 Pots)
          crewSize = 2;
          days = 1;
          minCost = isLabourOnly ? 1299 : isPremium ? 3500 : 1999;
          maxCost = isLabourOnly ? 1899 : isPremium ? 4800 : 3200;
          desc = 'Balcony / Terrace Garden (15–35 Pots): Root pruning, khurpi soil aeration, fortified vermicompost & cold-pressed neem insecticide spray.';
        } else if (selectedScaleIndex === 1) { // Lawn & Boundary Hedges (~500–1,200 sq.ft)
          crewSize = 4;
          days = 1;
          minCost = isLabourOnly ? 2499 : isPremium ? 6800 : 3500;
          maxCost = isLabourOnly ? 3499 : isPremium ? 9500 : 6000;
          desc = 'Lawn & Boundary Hedges (~500–1,200 sq.ft): Electric hedge shaping, motorized lawn mowing, de-weeding & nitrogen organic dressing.';
        } else if (selectedScaleIndex === 2) { // Large Villa Landscape (~2,000–5,000 sq.ft)
          crewSize = 6;
          days = 2;
          minCost = isLabourOnly ? 4800 : isPremium ? 14000 : 7500;
          maxCost = isLabourOnly ? 6800 : isPremium ? 20000 : 12000;
          desc = 'Large Villa Landscape (~2,000–5,000 sq.ft & Tree Pruning): Tree lopping with pole saw, ornamental shrub sculpting & automated drip tube installation.';
        } else { // Society Green Belt & Parks (10,000+ sq.ft)
          crewSize = 8;
          days = 3;
          minCost = isLabourOnly ? 9500 : isPremium ? 28000 : 14000;
          maxCost = isLabourOnly ? 14000 : isPremium ? 42000 : 24000;
          desc = 'Society Green Belt & Parks (10,000+ sq.ft Community Overhaul): 8 gardeners + 1 supervisor for park rejuvenation, flower bed redesign & community composting setup.';
        }
        break;

      default:
        crewSize = 3; days = 2; minCost = 4500; maxCost = 7500;
        desc = 'Multi-Artisan Cooperative Project Deployment under District Ward Coordinator.';
    }

    const midCost = Math.round((minCost + maxCost) / 2);
    const workerWage = Math.round(midCost * 0.8);
    const welfare = Math.round(midCost * 0.1);
    const coopOps = Math.round(midCost * 0.06);
    const platform = Math.round(midCost * 0.04);

    const advancePercent = isLabourOnly ? 25 : isPremium ? 50 : 40;
    const advanceMin = Math.round(minCost * (advancePercent / 100));
    const advanceMax = Math.round(maxCost * (advancePercent / 100));
    const advanceMid = Math.round(midCost * (advancePercent / 100));
    const midMilestone = Math.round(midCost * 0.35);
    const finalMilestone = Math.max(midCost - advanceMid - midMilestone, 0);

    return {
      crewSize,
      days,
      minCost,
      maxCost,
      midCost,
      workerWage,
      welfare,
      coopOps,
      platform,
      advancePercent,
      advanceMin,
      advanceMax,
      advanceMid,
      midMilestone,
      finalMilestone,
      desc
    };
  }, [serviceId, selectedScaleIndex, selectedMaterialIndex]);

  const handleGpsAutoFill = (isPickup = false) => {
    setIsGpsLoading(true);
    setTimeout(() => {
      const detected = 'Flat 302, Lajpat Nagar IV, Ring Road, New Delhi - 110024';
      if (isPickup || isDriverService) {
        setPickupAddress(detected);
        setAddress(detected);
      } else {
        setAddress(detected);
      }
      setLandmark('Opposite Metro Station Gate 2');
      setIsGpsLoading(false);
      Alert.alert('GPS Location Detected 📍', 'Address updated to your current detected location.');
    }, 700);
  };

  const isEmergency = type === 'emergency';
  const baseRate = getDynamicSoloPrice(
    serviceId,
    tradeSubtype,
    tradeScope2,
    tradeScope3,
    tripType,
    transmissionType,
    service?.start_price || 149
  );
  const emergencySurge = isEmergency ? 100 : 0;
  const welcomeDiscount = isFirstTimeUser ? FIRST_TIME_DISCOUNT : 0;
  const finalPayable = Math.max(baseRate + emergencySurge - welcomeDiscount, 49);

  const selectedScaleObj = currentBulkConfig.scales[selectedScaleIndex] || currentBulkConfig.scales[0];
  const selectedMaterialObj = currentBulkConfig.materials[selectedMaterialIndex] || currentBulkConfig.materials[0];

  const handleScheduleInspection = () => {
    const ticket = submitCommunityBulkRequest({
      society_name: user?.name ? `${user.name}'s Property (${selectedScaleObj.label})` : `Residential Project (${selectedScaleObj.label})`,
      service_title: `${service?.name || 'Home'} Bulk Project: ${selectedScaleObj.label} (${selectedMaterialObj.label})`,
      cooperative: matchedCoop.name,
      contact_person: user?.name || 'Priya Sharma',
      phone: user?.phone || '9876543210',
      target_date: type === 'scheduled' ? selectedDate : 'Tomorrow, 10:00 AM',
      units_estimate: `${selectedScaleObj.label} • Est ₹${bulkEstimation.minCost.toLocaleString()} - ₹${bulkEstimation.maxCost.toLocaleString()}`
    });
    setInspectionTicket(ticket);
    setInspectionSuccessModal(true);
  };

  const handleBookBulkWithAdvance = () => {
    if (isDriverService && (!pickupAddress.trim() || !dropAddress.trim())) {
      Alert.alert('Incomplete Route', 'Please enter both Pickup and Drop locations for the fleet.');
      return;
    }

    const compiledNotes = isDriverService
      ? `Bulk Fleet Route: ${pickupAddress} to ${dropAddress} (${selectedScaleObj.label}, ${selectedMaterialObj.label})`
      : `Bulk Project Scope: ${selectedScaleObj.label} (${selectedMaterialObj.label}). ${description || bulkEstimation.desc}`;

    createBooking({
      service,
      is_bulk_project: true,
      scale_mode: 'bulk',
      base_amount: bulkEstimation.advanceMid, // Milestone 1 Advance Escrow
      advance_amount: bulkEstimation.advanceMid,
      total_project_cost: bulkEstimation.midCost,
      min_cost: bulkEstimation.minCost,
      max_cost: bulkEstimation.maxCost,
      advance_percent: bulkEstimation.advancePercent,
      mid_milestone: bulkEstimation.midMilestone,
      final_milestone: bulkEstimation.finalMilestone,
      crew_size: bulkEstimation.crewSize,
      estimated_days: bulkEstimation.days,
      scale_label: selectedScaleObj.label,
      scale_sub: selectedScaleObj.sub,
      material_label: selectedMaterialObj.label,
      material_sub: selectedMaterialObj.sub,
      trade_subtype: `Bulk: ${selectedScaleObj.label}`,
      trade_scope: selectedMaterialObj.label,
      trade_details: `${selectedMaterialObj.sub} • ${bulkEstimation.crewSize} Artisans for ${bulkEstimation.days} Days`,
      address: isDriverService ? `Pickup: ${pickupAddress} → Drop: ${dropAddress}` : address,
      pickup_address: isDriverService ? pickupAddress : address,
      drop_address: isDriverService ? dropAddress : null,
      trip_type: isDriverService ? selectedScaleObj.label : null,
      transmission: isDriverService ? selectedMaterialObj.label : null,
      landmark,
      description: compiledNotes,
      photo: pickedImage,
      booking_type: type,
      scheduled_date: type === 'scheduled' ? selectedDate : 'Tomorrow',
      scheduled_time: type === 'scheduled' ? selectedTime : '10:00 AM - 12:00 PM',
    });

    navigation.navigate('BulkPayment');
  };

  const handleFindWorker = () => {
    if (isDriverService && (!pickupAddress.trim() || !dropAddress.trim())) {
      Alert.alert('Incomplete Route', 'Please enter both Pickup and Drop locations for the driver.');
      return;
    }

    if (scaleMode === 'bulk') {
      handleBookBulkWithAdvance();
      return;
    }

    const compiledNotes = isDriverService
      ? `Driver Route: ${pickupAddress} to ${dropAddress} (${tripType}, ${transmissionType} Transmission)`
      : `${tradeSubtype ? `Category Focus: ${tradeSubtype}. ` : ''}${tradeScope2 ? `Setup: ${tradeScope2}. ` : ''}${description || 'Standard repair request.'}`;

    createBooking({
      service,
      is_bulk_project: false,
      scale_mode: 'solo',
      address: isDriverService ? `Pickup: ${pickupAddress} → Drop: ${dropAddress}` : address,
      pickup_address: isDriverService ? pickupAddress : address,
      drop_address: isDriverService ? dropAddress : null,
      trip_type: isDriverService ? tripType : null,
      transmission: isDriverService ? transmissionType : null,
      landmark,
      trade_subtype: tradeSubtype,
      trade_scope: tradeScope2,
      trade_details: tradeScope3,
      description: compiledNotes,
      photo: pickedImage,
      booking_type: type,
      scheduled_date: type === 'scheduled' ? selectedDate : null,
      scheduled_time: type === 'scheduled' ? selectedTime : null,
      base_amount: baseRate
    });

    navigation.navigate('WorkerMatch', { service, bookingType: type, isBulkProject: false });
  };

  // Render trade-specific diagnosis fields for SOLO mode
  const renderTradeSpecificFields = () => {
    switch (serviceId) {
      case 's1': // Plumber
        return (
          <View style={styles.tradeCard}>
            <Text style={styles.tradeCardTitle}>PLUMBING SPECIFIC DETAILS (WORKER &amp; USER POV)</Text>
            
            <Text style={styles.tradeSubLabel}>1. Specific Plumbing Issue</Text>
            <View style={styles.chipsRow}>
              {[
                'Leaking Tap / Spindle',
                'Drainage / Bottle Trap Block',
                'Flush Tank / Cistern Fault',
                'Shower Mixer / Diverter',
                'Pipe Joint Burst (SOS)',
                'Water Tank Overflow / Ball Valve'
              ].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.tradeChip, tradeSubtype === item && styles.tradeChipActive]}
                  onPress={() => setTradeSubtype(item)}
                >
                  <Text style={[styles.tradeChipText, tradeSubtype === item && styles.tradeChipTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.tradeSubLabel, { marginTop: 10 }]}>2. Fixture Location</Text>
            <View style={styles.chipsRow}>
              {['Kitchen Sink', 'Master Bathroom', 'Common Washroom', 'Terrace / Overhead Tank', 'Main Inlet Pipeline'].map((loc) => (
                <TouchableOpacity
                  key={loc}
                  style={[styles.tradeChip, tradeScope2 === loc && styles.tradeChipActive]}
                  onPress={() => setTradeScope2(loc)}
                >
                  <Text style={[styles.tradeChipText, tradeScope2 === loc && styles.tradeChipTextActive]}>{loc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.tradeSubLabel, { marginTop: 10 }]}>3. Existing Pipe Material &amp; Setup</Text>
            <View style={styles.chipsRow}>
              {['CPVC / UPVC (Plastic)', 'GI Metal (Older Threaded)', 'SWR Drainage PVC', 'Concealed Inside Wall'].map((mat) => (
                <TouchableOpacity
                  key={mat}
                  style={[styles.tradeChip, tradeScope3 === mat && styles.tradeChipActive]}
                  onPress={() => setTradeScope3(mat)}
                >
                  <Text style={[styles.tradeChipText, tradeScope3 === mat && styles.tradeChipTextActive]}>{mat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 's2': // Electrician
        return (
          <View style={styles.tradeCard}>
            <Text style={styles.tradeCardTitle}>ELECTRICAL SETUP &amp; SAFETY DETAILS (WORKER &amp; USER POV)</Text>
            
            <Text style={styles.tradeSubLabel}>1. Specific Electrical Fault / Requirement</Text>
            <View style={styles.chipsRow}>
              {[
                'Switchboard / Socket Spark',
                'MCB / RCCB Frequent Tripping',
                'Fan / Chandelier Fitting',
                'Heavy AC/Geyser Power Line',
                'Inverter Backup / Battery Fuse',
                'Total Power Outage (SOS)'
              ].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.tradeChip, tradeSubtype === item && styles.tradeChipActive]}
                  onPress={() => setTradeSubtype(item)}
                >
                  <Text style={[styles.tradeChipText, tradeSubtype === item && styles.tradeChipTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.tradeSubLabel, { marginTop: 10 }]}>2. Installation Area / Room</Text>
            <View style={styles.chipsRow}>
              {['Living Room / Hall', 'Master Bedroom', 'Kitchen Power Board', 'Main DB / Meter Box', 'Balcony / Exterior'].map((loc) => (
                <TouchableOpacity
                  key={loc}
                  style={[styles.tradeChip, tradeScope2 === loc && styles.tradeChipActive]}
                  onPress={() => setTradeScope2(loc)}
                >
                  <Text style={[styles.tradeChipText, tradeScope2 === loc && styles.tradeChipTextActive]}>{loc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.tradeSubLabel, { marginTop: 10 }]}>3. Power Phase &amp; Safety Earthing</Text>
            <View style={styles.chipsRow}>
              {['Single Phase 220V (Domestic)', '3-Phase 415V (Heavy Load)', 'Inverter Dedicated Loop', 'No Earth Wire Present'].map((phase) => (
                <TouchableOpacity
                  key={phase}
                  style={[styles.tradeChip, tradeScope3 === phase && styles.tradeChipActive]}
                  onPress={() => setTradeScope3(phase)}
                >
                  <Text style={[styles.tradeChipText, tradeScope3 === phase && styles.tradeChipTextActive]}>{phase}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 's3': // Cleaner
        return (
          <View style={styles.tradeCard}>
            <Text style={styles.tradeCardTitle}>CLEANING FOCUS &amp; SOIL DETAILS (WORKER &amp; USER POV)</Text>
            
            <Text style={styles.tradeSubLabel}>1. Specific Cleaning Focus Area</Text>
            <View style={styles.chipsRow}>
              {[
                'Bathroom Scrub & Descaling',
                'Kitchen Degreasing & Chimney',
                'Sofa / Carpet Wet Shampoo',
                'Balcony Scrub & Pigeon Net',
                'Window Tracks & Glass Buffing',
                'Full Floor Rotary Machine Scrub'
              ].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.tradeChip, tradeSubtype === item && styles.tradeChipActive]}
                  onPress={() => setTradeSubtype(item)}
                >
                  <Text style={[styles.tradeChipText, tradeSubtype === item && styles.tradeChipTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.tradeSubLabel, { marginTop: 10 }]}>2. Soil &amp; Stain Intensity</Text>
            <View style={styles.chipsRow}>
              {['Standard Dust / Routine Soil', 'Hard Water Yellow Scaling', 'Heavy Oil & Grease Sludge', 'Post-Paint / Cement Marks'].map((soil) => (
                <TouchableOpacity
                  key={soil}
                  style={[styles.tradeChip, tradeScope2 === soil && styles.tradeChipActive]}
                  onPress={() => setTradeScope2(soil)}
                >
                  <Text style={[styles.tradeChipText, tradeScope2 === soil && styles.tradeChipTextActive]}>{soil}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.tradeSubLabel, { marginTop: 10 }]}>3. Eco &amp; Chemical Formulation</Text>
            <View style={styles.chipsRow}>
              {['TASKI Eco-Certified (Child & Pet Safe)', 'Acid-Free Heavy Descaling', 'Hospital Grade Steam Sterilization'].map((chem) => (
                <TouchableOpacity
                  key={chem}
                  style={[styles.tradeChip, tradeScope3 === chem && styles.tradeChipActive]}
                  onPress={() => setTradeScope3(chem)}
                >
                  <Text style={[styles.tradeChipText, tradeScope3 === chem && styles.tradeChipTextActive]}>{chem}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 's4': // Carpenter
        return (
          <View style={styles.tradeCard}>
            <Text style={styles.tradeCardTitle}>CARPENTRY &amp; HARDWARE SPECS (WORKER &amp; USER POV)</Text>
            
            <Text style={styles.tradeSubLabel}>1. Specific Carpentry Scope</Text>
            <View style={styles.chipsRow}>
              {[
                'Door Lock / Mortise Latch Repair',
                'Hydraulic Soft-Close Hinge',
                'Drawer Telescopic Slider Channel',
                'Door Bottom Planing / Floor Rub',
                'Bed / Wardrobe Assembly & Align',
                'Wood Sanding & Touch-Up Polish'
              ].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.tradeChip, tradeSubtype === item && styles.tradeChipActive]}
                  onPress={() => setTradeSubtype(item)}
                >
                  <Text style={[styles.tradeChipText, tradeSubtype === item && styles.tradeChipTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.tradeSubLabel, { marginTop: 10 }]}>2. Furniture &amp; Material Base</Text>
            <View style={styles.chipsRow}>
              {['Engineered Plywood / Board', 'MDF / Particle Board Modular', 'Solid Teak / Sheesham Wood', 'Glass / Aluminum Shutter'].map((mat) => (
                <TouchableOpacity
                  key={mat}
                  style={[styles.tradeChip, tradeScope2 === mat && styles.tradeChipActive]}
                  onPress={() => setTradeScope2(mat)}
                >
                  <Text style={[styles.tradeChipText, tradeScope2 === mat && styles.tradeChipTextActive]}>{mat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.tradeSubLabel, { marginTop: 10 }]}>3. Hardware Spares Sourcing</Text>
            <View style={styles.chipsRow}>
              {['Artisan Supplies ISI Ebco/Godrej Spares', 'Artisan Supplies Premium Hettich/Hafele', 'Customer Has Hardware Ready'].map((hw) => (
                <TouchableOpacity
                  key={hw}
                  style={[styles.tradeChip, tradeScope3 === hw && styles.tradeChipActive]}
                  onPress={() => setTradeScope3(hw)}
                >
                  <Text style={[styles.tradeChipText, tradeScope3 === hw && styles.tradeChipTextActive]}>{hw}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 's5': // Painter
        return (
          <View style={styles.tradeCard}>
            <Text style={styles.tradeCardTitle}>MINOR PAINTING SCOPE (SOLO ARTISAN)</Text>
            <View style={styles.chipsRow}>
              {['Water Dampness & Putty Patch', 'Single Accent Wall Paint', 'Door / Window Polish & Enamel'].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.tradeChip, tradeSubtype === item && styles.tradeChipActive]}
                  onPress={() => setTradeSubtype(item)}
                >
                  <Text style={[styles.tradeChipText, tradeSubtype === item && styles.tradeChipTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 's6': // Caregiver Solo Mode
        return (
          <View style={styles.tradeCard}>
            <Text style={styles.tradeCardTitle}>PATIENT CARE &amp; CLINICAL NEEDS (WORKER &amp; USER POV)</Text>
            
            <Text style={styles.tradeSubLabel}>1. Specific Care Requirement</Text>
            <View style={styles.chipsRow}>
              {[
                'Post-Operative Recovery Support',
                'Elderly Companionship & Feeding',
                'Bedridden Sponge Bath & Hygiene',
                'Doctor Visit / OPD Mobility Escort',
                'Vitals Check (BP, Sugar, SpO2)',
                'Night-Time Bedside Vigil'
              ].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.tradeChip, tradeSubtype === item && styles.tradeChipActive]}
                  onPress={() => setTradeSubtype(item)}
                >
                  <Text style={[styles.tradeChipText, tradeSubtype === item && styles.tradeChipTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.tradeSubLabel, { marginTop: 10 }]}>2. Patient Mobility Level</Text>
            <View style={styles.chipsRow}>
              {['Fully Mobile (Needs Guidance)', 'Assisted Mobility (Walker/Stick)', 'Wheelchair Bound', 'Completely Bedridden'].map((mob) => (
                <TouchableOpacity
                  key={mob}
                  style={[styles.tradeChip, tradeScope2 === mob && styles.tradeChipActive]}
                  onPress={() => setTradeScope2(mob)}
                >
                  <Text style={[styles.tradeChipText, tradeScope2 === mob && styles.tradeChipTextActive]}>{mob}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.tradeSubLabel, { marginTop: 10 }]}>3. Medical Apparatus &amp; Devices in Use</Text>
            <View style={styles.chipsRow}>
              {['Oral Medication Only (No Devices)', 'Catheter / Urine Bag Drain', "Ryle's Tube (Nasal Feeding)", 'Oxygen Concentrator / BiPAP', 'Tracheostomy / Suction Unit'].map((dev) => (
                <TouchableOpacity
                  key={dev}
                  style={[styles.tradeChip, tradeScope3 === dev && styles.tradeChipActive]}
                  onPress={() => setTradeScope3(dev)}
                >
                  <Text style={[styles.tradeChipText, tradeScope3 === dev && styles.tradeChipTextActive]}>{dev}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 's7': // Technician Solo Mode
        return (
          <View style={styles.tradeCard}>
            <Text style={styles.tradeCardTitle}>APPLIANCE DIAGNOSTICS &amp; SYMPTOMS (WORKER &amp; USER POV)</Text>
            
            <Text style={styles.tradeSubLabel}>1. Specific Appliance &amp; Fault Symptom</Text>
            <View style={styles.chipsRow}>
              {[
                'Split / Inverter AC (Not Cooling / Water Leak)',
                'Washing Machine (Drain / Spin / Bearing Error)',
                'Refrigerator (No Cooling / Gas Choked)',
                'RO Water Purifier (Low Flow / TDS High)',
                'Microwave / OTG (Sparking / No Heating)',
                'Storage Geyser (Heating Element / Thermostat)'
              ].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.tradeChip, tradeSubtype === item && styles.tradeChipActive]}
                  onPress={() => setTradeSubtype(item)}
                >
                  <Text style={[styles.tradeChipText, tradeSubtype === item && styles.tradeChipTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.tradeSubLabel, { marginTop: 10 }]}>2. Appliance Brand &amp; Inverter Tech</Text>
            <View style={styles.chipsRow}>
              {['Inverter Dual Rotary (5-Star / Smart)', 'Non-Inverter Standard (3-Star)', 'Commercial Heavy-Duty / Cassette', 'Older Legacy Unit (> 7 Years)'].map((tech) => (
                <TouchableOpacity
                  key={tech}
                  style={[styles.tradeChip, tradeScope2 === tech && styles.tradeChipActive]}
                  onPress={() => setTradeScope2(tech)}
                >
                  <Text style={[styles.tradeChipText, tradeScope2 === tech && styles.tradeChipTextActive]}>{tech}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.tradeSubLabel, { marginTop: 10 }]}>3. Service &amp; Spare Parts Scope</Text>
            <View style={styles.chipsRow}>
              {['Foam Jet Wash & Basic Service', 'Suspected Gas Leak & Brazing Repair', 'PCB Circuit Board Diagnostics', 'Full Filter & Wear-and-Tear Spares'].map((sc) => (
                <TouchableOpacity
                  key={sc}
                  style={[styles.tradeChip, tradeScope3 === sc && styles.tradeChipActive]}
                  onPress={() => setTradeScope3(sc)}
                >
                  <Text style={[styles.tradeChipText, tradeScope3 === sc && styles.tradeChipTextActive]}>{sc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 's8': // Domestic Helper Solo Mode
        return (
          <View style={styles.tradeCard}>
            <Text style={styles.tradeCardTitle}>DOMESTIC HELP &amp; MEAL PREFERENCE (WORKER &amp; USER POV)</Text>
            
            <Text style={styles.tradeSubLabel}>1. Specific Help Required</Text>
            <View style={styles.chipsRow}>
              {[
                'One-Time Meal Cooking (Lunch/Dinner)',
                'Party Utensils Mass Washing',
                'Post-Event Kitchen Slab Degrease',
                'Clothes Ironing & Wardrobe Fold',
                'Deep Balcony & Window Mesh Wash',
                'Emergency Substitute Cook (SOS)'
              ].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.tradeChip, tradeSubtype === item && styles.tradeChipActive]}
                  onPress={() => setTradeSubtype(item)}
                >
                  <Text style={[styles.tradeChipText, tradeSubtype === item && styles.tradeChipTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.tradeSubLabel, { marginTop: 10 }]}>2. Cuisine &amp; Dietary Preference</Text>
            <View style={styles.chipsRow}>
              {['North Indian Veg (Roti/Sabzi/Dal)', 'South Indian (Dosa/Sambar/Rice)', 'Non-Vegetarian Multi-Cuisine', 'Jain / Satvik (No Onion/Garlic)'].map((cui) => (
                <TouchableOpacity
                  key={cui}
                  style={[styles.tradeChip, tradeScope2 === cui && styles.tradeChipActive]}
                  onPress={() => setTradeScope2(cui)}
                >
                  <Text style={[styles.tradeChipText, tradeScope2 === cui && styles.tradeChipTextActive]}>{cui}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.tradeSubLabel, { marginTop: 10 }]}>3. Household Scale &amp; Kitchen Setup</Text>
            <View style={styles.chipsRow}>
              {['1–2 Persons (Quick Meal)', '3–5 Family Members (Standard)', '6+ Large Joint Family', 'Commercial Heavy Cookware'].map((hh) => (
                <TouchableOpacity
                  key={hh}
                  style={[styles.tradeChip, tradeScope3 === hh && styles.tradeChipActive]}
                  onPress={() => setTradeScope3(hh)}
                >
                  <Text style={[styles.tradeChipText, tradeScope3 === hh && styles.tradeChipTextActive]}>{hh}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 's10': // Gardener Solo Mode
        return (
          <View style={styles.tradeCard}>
            <Text style={styles.tradeCardTitle}>HORTICULTURE &amp; GARDEN DETAILS (WORKER &amp; USER POV)</Text>
            
            <Text style={styles.tradeSubLabel}>1. Specific Gardening Task</Text>
            <View style={styles.chipsRow}>
              {[
                'Balcony Pot Aeration & Soil Refresh',
                'Tree Canopy Lopping & Branch Trim',
                'Lawn De-weeding & Mowing',
                'Organic Pest Spray (Neem/Bio)',
                'Indoor Plant Repotting & Fertilizer',
                'Automated Drip Tube Unclogging'
              ].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.tradeChip, tradeSubtype === item && styles.tradeChipActive]}
                  onPress={() => setTradeSubtype(item)}
                >
                  <Text style={[styles.tradeChipText, tradeSubtype === item && styles.tradeChipTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.tradeSubLabel, { marginTop: 10 }]}>2. Garden Type &amp; Sun Exposure</Text>
            <View style={styles.chipsRow}>
              {['Balcony Garden (Full / Partial Sun)', 'Terrace Rooftop (Direct Sun)', 'Ground Lawn / Backyard', 'Indoor Low-Light Plants'].map((gType) => (
                <TouchableOpacity
                  key={gType}
                  style={[styles.tradeChip, tradeScope2 === gType && styles.tradeChipActive]}
                  onPress={() => setTradeScope2(gType)}
                >
                  <Text style={[styles.tradeChipText, tradeScope2 === gType && styles.tradeChipTextActive]}>{gType}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.tradeSubLabel, { marginTop: 10 }]}>3. Soil &amp; Fertilizer Requirement</Text>
            <View style={styles.chipsRow}>
              {['Basic Soil Aeration (No Supplies)', 'Fortified Vermicompost & Neem Blend', 'Coco-Peat & Perlite Aeration Mix', 'Fresh Nursery Flowering Seedlings'].map((soil) => (
                <TouchableOpacity
                  key={soil}
                  style={[styles.tradeChip, tradeScope3 === soil && styles.tradeChipActive]}
                  onPress={() => setTradeScope3(soil)}
                >
                  <Text style={[styles.tradeChipText, tradeScope3 === soil && styles.tradeChipTextActive]}>{soil}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={isDriverService ? 'Book Cooperative Driver' : t('bookingRequest')}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Emergency Banner if emergency */}
        {isEmergency && (
          <View style={styles.emergencyBanner}>
            <Ionicons name="flash" size={22} color="#FFFFFF" />
            <View style={styles.emergencyBannerCol}>
              <Text style={styles.emergencyBannerTitle}>Emergency SOS Priority Dispatch (+₹100)</Text>
              <Text style={styles.emergencyBannerSub}>
                Closest on-duty certified artisan alerted with highest dispatch priority & rapid response.
              </Text>
            </View>
          </View>
        )}

        {/* First-Time User Welcome Offer Pill */}
        {isFirstTimeUser && (
          <View style={styles.welcomePill}>
            <Ionicons name="gift" size={16} color={colors.successDark} />
            <Text style={styles.welcomePillText}>
              🎉 First-Time User: ₹50 Cooperative Welcome Discount Applied!
            </Text>
          </View>
        )}

        {/* Selected Service Card */}
        <View style={styles.selectedServiceCard}>
          <View style={styles.serviceIconCircle}>
            <Text style={styles.serviceEmoji}>{service?.icon || (isDriverService ? '🚗' : '🔧')}</Text>
          </View>
          <View style={styles.serviceInfoCol}>
            <Text style={styles.serviceCategoryLabel}>{t('selectedCategory')}</Text>
            <Text style={styles.selectedServiceName}>{service?.name || 'Home Service'}</Text>
            <Text style={styles.serviceSubtext}>Standardized cooperative rate card • 100% KYC verified</Text>
          </View>
          <View style={styles.servicePriceBadge}>
            <Text style={styles.servicePriceText}>
              {scaleMode === 'bulk' ? 'Bulk Fleet' : `₹${finalPayable}`}
            </Text>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 🏢 SCALE SELECTOR: SOLO ARTISAN vs FULL PROPERTY MULTI-WORKER FLEET */}
        {/* ========================================================================= */}
        <View style={styles.scaleSelectorContainer}>
          <Text style={styles.scaleSelectorHeading}>CHOOSE WORK SCALE &amp; DEPLOYMENT</Text>
          <View style={styles.scaleTabsRow}>
            <TouchableOpacity
              style={[styles.scaleTab, scaleMode === 'solo' && styles.scaleTabActive]}
              onPress={() => setScaleMode('solo')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="person"
                size={16}
                color={scaleMode === 'solo' ? colors.primary : colors.textSecondary}
              />
              <View style={{ marginLeft: 6 }}>
                <Text style={[styles.scaleTabText, scaleMode === 'solo' && styles.scaleTabTextActive]}>
                  {isDriverService ? 'Solo / City Route' : 'Solo / Minor Repair'}
                </Text>
                <Text style={styles.scaleTabSub}>
                  {isDriverService ? 'Single trip / 2–8 hours' : 'Single fixture / 1-2 hours'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.scaleTab, scaleMode === 'bulk' && styles.scaleTabActive]}
              onPress={() => setScaleMode('bulk')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="people"
                size={18}
                color={scaleMode === 'bulk' ? colors.primary : colors.textSecondary}
              />
              <View style={{ marginLeft: 6 }}>
                <Text style={[styles.scaleTabText, scaleMode === 'bulk' && styles.scaleTabTextActive]}>
                  {isDriverService ? 'Valet & Fleet Squad' : 'Full Property / Bulk'}
                </Text>
                <Text style={styles.scaleTabSub}>
                  {isDriverService ? 'Multi-driver crew (3–6 fleet)' : 'Multi-artisan team (3–8 crew)'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 🔥 AI DYNAMIC COOPERATIVE BULK PROJECT ESTIMATOR (100% TRADE SPECIFIC) */}
        {/* ========================================================================= */}
        {scaleMode === 'bulk' ? (
          <View style={styles.bulkProjectCard}>
            <View style={styles.bulkProjectHeader}>
              <View style={styles.bulkIconBadge}>
                <Ionicons name="calculator" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.bulkTag}>AI COOPERATIVE BULK ESTIMATOR</Text>
                <Text style={styles.bulkTitle}>
                  {service?.name ? `${service.name} Bulk Project Calculator` : 'Full Property Project Calculator'}
                </Text>
              </View>
            </View>

            {/* Dynamic Step 1: Trade Specific Scale Chips */}
            <Text style={styles.bulkInputLabel}>{currentBulkConfig.scaleHeading}</Text>
            <View style={styles.scaleChipsGrid}>
              {currentBulkConfig.scales.map((sc, idx) => {
                const isSelected = selectedScaleIndex === idx;
                return (
                  <TouchableOpacity
                    key={sc.id}
                    style={[styles.tradeScaleCard, isSelected && styles.tradeScaleCardActive]}
                    onPress={() => setSelectedScaleIndex(idx)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tradeScaleLabel, isSelected && styles.tradeScaleLabelActive]}>
                      {sc.label}
                    </Text>
                    <Text style={[styles.tradeScaleSub, isSelected && styles.tradeScaleSubActive]}>
                      {sc.sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Dynamic Step 2: Trade Specific Material / Supply Options */}
            <Text style={[styles.bulkInputLabel, { marginTop: 14 }]}>
              {currentBulkConfig.materialHeading}
            </Text>
            <View style={styles.materialCol}>
              {currentBulkConfig.materials.map((m, idx) => {
                const isSelected = selectedMaterialIndex === idx;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.materialOptionCard, isSelected && styles.materialOptionCardActive]}
                    onPress={() => setSelectedMaterialIndex(idx)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.materialOptionTitle, isSelected && styles.materialOptionTitleActive]}>
                        {m.label}
                      </Text>
                      <Text style={styles.materialOptionSub}>{m.sub}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Real-time Math Estimation Summary Box */}
            <View style={styles.mathSummaryCard}>
              <Text style={styles.mathSummaryTitle}>ESTIMATED COOPERATIVE DEPLOYMENT METRICS</Text>
              
              <View style={styles.metricsGrid}>
                <View style={styles.metricBox}>
                  <Ionicons name="people" size={18} color={colors.primary} />
                  <Text style={styles.metricVal}>{bulkEstimation.crewSize} Artisans</Text>
                  <Text style={styles.metricLabel}>Assigned Crew Size</Text>
                </View>

                <View style={styles.metricBox}>
                  <Ionicons name="time" size={18} color={colors.primary} />
                  <Text style={styles.metricVal}>{bulkEstimation.days} Days</Text>
                  <Text style={styles.metricLabel}>Estimated Duration</Text>
                </View>
              </View>

              <Text style={styles.mathDesc}>{bulkEstimation.desc}</Text>

              {/* Price Estimate Range Banner */}
              <View style={styles.costRangeBanner}>
                <View>
                  <Text style={styles.costRangeLabel}>APPROXIMATE ESTIMATED COST</Text>
                  <Text style={styles.costRangeVal}>
                    ₹{bulkEstimation.minCost.toLocaleString()} – ₹{bulkEstimation.maxCost.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.estimateBadge}>
                  <Text style={styles.estimateBadgeText}>Cooperative Rate</Text>
                </View>
              </View>

              {/* 80/10/6/4 Transparent Breakdown */}
              <View style={styles.splitBox}>
                <Text style={styles.splitHeader}>FAIR WAGE ALLOCATION BREAKDOWN (MIDPOINT ₹{bulkEstimation.midCost})</Text>
                <View style={styles.splitRow}>
                  <Text style={styles.splitKey}>• Direct Artisan Team Wages (80%):</Text>
                  <Text style={[styles.splitVal, { color: colors.successDark }]}>₹{bulkEstimation.workerWage.toLocaleString()}</Text>
                </View>
                <View style={styles.splitRow}>
                  <Text style={styles.splitKey}>• Worker Healthcare &amp; Accident Fund (10%):</Text>
                  <Text style={styles.splitVal}>₹{bulkEstimation.welfare.toLocaleString()}</Text>
                </View>
                <View style={styles.splitRow}>
                  <Text style={styles.splitKey}>• District Co-op Reserve &amp; Tool Depot (6%):</Text>
                  <Text style={styles.splitVal}>₹{bulkEstimation.coopOps.toLocaleString()}</Text>
                </View>
                <View style={styles.splitRow}>
                  <Text style={styles.splitKey}>• Platform &amp; Seva Suraksha Pool (4%):</Text>
                  <Text style={styles.splitVal}>₹{bulkEstimation.platform.toLocaleString()}</Text>
                </View>
              </View>

              {/* AI Predicted Advance & Escrow Milestone Card */}
              <View style={styles.advanceCard}>
                <View style={styles.advanceHeaderRow}>
                  <Ionicons name="shield-checkmark" size={15} color={colors.primary} />
                  <Text style={styles.advanceHeaderTitle}>AI PREDICTED ADVANCE &amp; ESCROW MILESTONES</Text>
                </View>

                <View style={styles.advanceHighlightRow}>
                  <View>
                    <Text style={styles.advanceHighlightSub}>
                      Upfront Material &amp; Fleet Advance ({bulkEstimation.advancePercent}%)
                    </Text>
                    <Text style={styles.advanceHighlightAmount}>
                      ₹{bulkEstimation.advanceMin.toLocaleString()} – ₹{bulkEstimation.advanceMax.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.escrowBadge}>
                    <Text style={styles.escrowBadgeText}>Escrow Protected</Text>
                  </View>
                </View>

                {/* Milestone Stepper */}
                <View style={styles.milestoneList}>
                  <View style={styles.milestoneItem}>
                    <View style={styles.milestoneDotActive} />
                    <View style={styles.milestoneTextBox}>
                      <Text style={styles.milestoneName}>
                        Milestone 1: Fleet Mobilization &amp; Blocking ({bulkEstimation.advancePercent}%)
                      </Text>
                      <Text style={styles.milestoneDetail}>
                        ₹{bulkEstimation.advanceMid.toLocaleString()} • Released for fleet reservation, fuel advance &amp; chauffeur dispatch.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.milestoneItem}>
                    <View style={styles.milestoneDot} />
                    <View style={styles.milestoneTextBox}>
                      <Text style={styles.milestoneName}>
                        Milestone 2: Mid-Trip / Day 1 Inspection (35%)
                      </Text>
                      <Text style={styles.milestoneDetail}>
                        ₹{bulkEstimation.midMilestone.toLocaleString()} • Released after initial route completion or mid-event valet operations.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.milestoneItem}>
                    <View style={styles.milestoneDot} />
                    <View style={styles.milestoneTextBox}>
                      <Text style={styles.milestoneName}>
                        Milestone 3: Final Sign-off &amp; Handover ({100 - bulkEstimation.advancePercent - 35}%)
                      </Text>
                      <Text style={styles.milestoneDetail}>
                        ₹{bulkEstimation.finalMilestone.toLocaleString()} • Released only after completion parking audit &amp; customer OTP sign-off.
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.escrowTrustNote}>
                  <Ionicons name="lock-closed" size={12} color={colors.successDark} />
                  <Text style={styles.escrowTrustText}>
                    100% Advance held in Govt-monitored SBI MSCS Cooperative Escrow Trust Account.
                  </Text>
                </View>
              </View>

              {/* Direct Instant Booking with Milestone 1 Advance Escrow Box */}
              <View style={styles.directBulkBookingCard}>
                <View style={styles.directBulkHeader}>
                  <View style={styles.directBulkIconCircle}>
                    <Ionicons name="flash" size={18} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.directBulkTag}>INSTANT PROJECT CONFIRMATION</Text>
                    <Text style={styles.directBulkTitle}>Book Project &amp; Lock Milestone 1 Advance</Text>
                  </View>
                </View>

                <Text style={styles.directBulkDesc}>
                  Directly dispatch Master Contractor &amp; {bulkEstimation.crewSize} Artisans for {bulkEstimation.days} days by locking Milestone 1 Advance into Govt SBI MSCS Escrow.
                </Text>

                <View style={styles.directBulkMetricsRow}>
                  <View style={styles.directBulkMetricItem}>
                    <Text style={styles.directBulkMetricLabel}>MILESTONE 1 ADVANCE</Text>
                    <Text style={styles.directBulkMetricVal}>₹{bulkEstimation.advanceMid.toLocaleString()}</Text>
                    <Text style={styles.directBulkMetricSub}>({bulkEstimation.advancePercent}% Escrow Locked)</Text>
                  </View>
                  <View style={styles.directBulkMetricDivider} />
                  <View style={styles.directBulkMetricItem}>
                    <Text style={styles.directBulkMetricLabel}>ESTIMATED TOTAL</Text>
                    <Text style={styles.directBulkMetricVal}>₹{bulkEstimation.midCost.toLocaleString()}</Text>
                    <Text style={styles.directBulkMetricSub}>Fair Wage Split</Text>
                  </View>
                  <View style={styles.directBulkMetricDivider} />
                  <View style={styles.directBulkMetricItem}>
                    <Text style={styles.directBulkMetricLabel}>DEPLOYED SQUAD</Text>
                    <Text style={styles.directBulkMetricVal}>{bulkEstimation.crewSize} Artisans</Text>
                    <Text style={styles.directBulkMetricSub}>{bulkEstimation.days} Days Tour</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.directBulkPayBtn}
                  onPress={handleBookBulkWithAdvance}
                  activeOpacity={0.85}
                >
                  <Ionicons name="lock-closed" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.directBulkPayBtnText}>
                    Book Project &amp; Deposit Advance (₹{bulkEstimation.advanceMid.toLocaleString()})
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Matched District Co-op Ward Coordinator Profile */}
            <View style={styles.wardHeadCard}>
              <Image source={{ uri: matchedCoop.head_photo }} style={styles.wardHeadPhoto} />
              <View style={styles.wardHeadInfo}>
                <Text style={styles.wardHeadTag}>MATCHED DISTRICT WARD COORDINATOR</Text>
                <Text style={styles.wardHeadName}>{matchedCoop.head_name}</Text>
                <Text style={styles.wardHeadSub}>{matchedCoop.name} • {matchedCoop.registration_no}</Text>
              </View>
            </View>

            {/* Call Ward Head Quick Action */}
            <TouchableOpacity
              style={styles.callHeadBtn}
              onPress={() => setCallModalVisible(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="call" size={16} color="#FFFFFF" />
              <Text style={styles.callHeadBtnText}>Call Ward Head ({matchedCoop.head_name})</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Solo Trade Specific Diagnosis */}
        {scaleMode === 'solo' && !isDriverService && renderTradeSpecificFields()}

        {/* Driver Pickup & Drop */}
        {scaleMode === 'solo' && isDriverService && (
          <View style={styles.routeCard}>
            <View style={styles.routeCardHeader}>
              <Text style={styles.routeCardTitle}>TRIP ROUTE (PICKUP &amp; DROP)</Text>
              <TouchableOpacity
                style={styles.gpsSmallBtn}
                onPress={() => handleGpsAutoFill(true)}
                disabled={isGpsLoading}
              >
                {isGpsLoading ? (
                  <ActivityIndicator size="small" color={colors.successDark} />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="navigate" size={12} color={colors.successDark} />
                    <Text style={styles.gpsSmallBtnText}>Use GPS</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.routeTimeline}>
              <View style={styles.timelinePointRow}>
                <View style={styles.pickupDotCircle}>
                  <View style={styles.pickupInnerDot} />
                </View>
                <View style={styles.timelineInputBox}>
                  <Text style={styles.timelineLabel}>PICKUP LOCATION</Text>
                  <TextInput
                    style={styles.timelineInput}
                    value={pickupAddress}
                    onChangeText={setPickupAddress}
                    placeholder="Enter pickup house/building, street"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <View style={styles.timelineLine} />

              <View style={styles.timelinePointRow}>
                <View style={styles.dropDotCircle}>
                  <Ionicons name="location" size={14} color="#EF4444" />
                </View>
                <View style={styles.timelineInputBox}>
                  <Text style={[styles.timelineLabel, { color: '#EF4444' }]}>DROP LOCATION</Text>
                  <TextInput
                    style={styles.timelineInput}
                    value={dropAddress}
                    onChangeText={setDropAddress}
                    placeholder="Enter destination, landmark or airport"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.quickDropHeading}>POPULAR DESTINATIONS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickDropsScroll}>
              {POPULAR_DROP_LOCATIONS.map((loc) => (
                <TouchableOpacity
                  key={loc}
                  style={[styles.quickDropChip, dropAddress === loc && styles.quickDropChipActive]}
                  onPress={() => setDropAddress(loc)}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name="pin-outline"
                    size={12}
                    color={dropAddress === loc ? colors.primary : colors.textSecondary}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.quickDropText, dropAddress === loc && styles.quickDropTextActive]}>
                    {loc}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.quickDropHeading, { marginTop: 14 }]}>SELECT TRIP DURATION</Text>
            <View style={styles.tripPlansGrid}>
              {DRIVER_TRIP_TYPES.map((plan) => {
                const isSelected = tripType === plan.label;
                return (
                  <TouchableOpacity
                    key={plan.id}
                    style={[styles.tripPlanCard, isSelected && styles.tripPlanCardActive]}
                    onPress={() => setTripType(plan.label)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tripPlanLabel, isSelected && styles.tripPlanLabelActive]}>
                      {plan.label}
                    </Text>
                    <Text style={[styles.tripPlanPrice, isSelected && styles.tripPlanPriceActive]}>
                      ₹{plan.price}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.quickDropHeading, { marginTop: 14 }]}>VEHICLE TRANSMISSION &amp; CAR TYPE</Text>
            <View style={styles.chipsRow}>
              {['Manual (MT)', 'Automatic (AT/CVT)', 'Electric Vehicle (EV)', 'Heavy SUV / 4x4'].map((trans) => (
                <TouchableOpacity
                  key={trans}
                  style={[styles.tradeChip, transmissionType === trans && styles.tradeChipActive]}
                  onPress={() => setTransmissionType(trans)}
                >
                  <Text style={[styles.tradeChipText, transmissionType === trans && styles.tradeChipTextActive]}>
                    {trans}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Booking Type Selector (Immediate vs Scheduled) */}
        <View style={styles.typeSelectorRow}>
          <TouchableOpacity
            style={[styles.typePill, type === 'now' && styles.typePillActive]}
            onPress={() => setType('now')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="time"
              size={14}
              color={type === 'now' ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.typeText, type === 'now' && styles.typeTextActive]}>
              {scaleMode === 'bulk' ? 'Schedule Site Inspection' : t('bookImmediate')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typePill, type === 'scheduled' && styles.typePillActive]}
            onPress={() => setType('scheduled')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="calendar"
              size={14}
              color={type === 'scheduled' ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.typeText, type === 'scheduled' && styles.typeTextActive]}>
              {t('scheduleLater')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date & Time Selectors */}
        {type === 'scheduled' && (
          <View style={styles.formSection}>
            <View style={styles.scheduleHeaderRow}>
              <Ionicons name="calendar" size={16} color={colors.primary} />
              <Text style={[styles.sectionLabel, { marginLeft: 6 }]}>1. Select Target Date</Text>
            </View>
            <View style={styles.datesRow}>
              {DATES.map((d) => {
                const isSelected = selectedDate === d.label;
                return (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                    onPress={() => setSelectedDate(d.label)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.dateChipText, isSelected && styles.dateChipTextSelected]}>
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={[styles.scheduleHeaderRow, { marginTop: 14 }]}>
              <Ionicons name="time" size={16} color={colors.primary} />
              <Text style={[styles.sectionLabel, { marginLeft: 6 }]}>2. Select Arrival Time Slot</Text>
            </View>
            <View style={styles.timesRow}>
              {TIMES.map((timeStr) => {
                const isSelected = selectedTime === timeStr;
                return (
                  <TouchableOpacity
                    key={timeStr}
                    style={[styles.timeChip, isSelected && styles.timeChipSelected]}
                    onPress={() => setSelectedTime(timeStr)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.timeChipText, isSelected && styles.timeChipTextSelected]}>
                      {timeStr}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Address Fields (For Non-Driver Services) */}
        {!isDriverService && (
          <View style={styles.formSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>
                {scaleMode === 'bulk' ? 'Site / Property Inspection Address' : t('serviceAddress')}
              </Text>
              <TouchableOpacity
                style={styles.gpsSmallBtn}
                onPress={() => handleGpsAutoFill(false)}
                disabled={isGpsLoading}
              >
                {isGpsLoading ? (
                  <ActivityIndicator size="small" color={colors.successDark} />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="navigate" size={12} color={colors.successDark} />
                    <Text style={styles.gpsSmallBtnText}>Use GPS</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputWrap}>
              <Ionicons name="location-outline" size={18} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={address}
                onChangeText={setAddress}
                placeholder="House/Flat number, building, area"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 12 }]}>{t('landmarkLabel')}</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="navigate-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={landmark}
                onChangeText={setLandmark}
                placeholder="e.g. Near Metro Gate 2, 3rd Floor"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
        )}

        {/* Additional Notes */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>
            {scaleMode === 'bulk' ? 'Project Requirements & Custom Notes' : 'Additional Notes / Instructions'}
          </Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder={
              scaleMode === 'bulk'
                ? 'e.g. Need comprehensive full-property overhaul with ISI materials...'
                : 'Any specific instructions for the visiting artisan...'
            }
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Rate Card Summary for Solo */}
        {scaleMode === 'solo' && (
          <View style={styles.estimateBreakdownCard}>
            <Text style={styles.estimateTitle}>ESTIMATED SERVICE CHARGES</Text>
            <View style={styles.estimateRow}>
              <Text style={styles.estimateKey}>
                {isDriverService ? `${tripType} Base Fare` : 'Standard Cooperative Base Rate'}
              </Text>
              <Text style={styles.estimateVal}>₹{baseRate}</Text>
            </View>
            {isEmergency && (
              <View style={styles.estimateRow}>
                <Text style={[styles.estimateKey, { color: colors.danger }]}>Emergency Priority Surge (&lt;15 mins)</Text>
                <Text style={[styles.estimateVal, { color: colors.danger }]}>+₹100</Text>
              </View>
            )}
            {isFirstTimeUser && (
              <View style={styles.estimateRow}>
                <Text style={[styles.estimateKey, { color: colors.successDark }]}>First-Time Welcome Discount</Text>
                <Text style={[styles.estimateVal, { color: colors.successDark }]}>-₹{FIRST_TIME_DISCOUNT}</Text>
              </View>
            )}
            <View style={styles.estimateDivider} />
            <View style={styles.estimateRow}>
              <Text style={styles.estimateTotalKey}>Estimated Total Payable</Text>
              <Text style={styles.estimateTotalVal}>₹{finalPayable}</Text>
            </View>
          </View>
        )}

        {/* Assurance Banner */}
        <View style={styles.assuranceFooterCard}>
          <Ionicons name="shield-checkmark" size={20} color={colors.success} />
          <View style={styles.assuranceTextCol}>
            <Text style={styles.assuranceTitle}>
              {scaleMode === 'bulk' ? 'Cooperative Federation Project Guarantee' : 'Cooperative Service Assurance'}
            </Text>
            <Text style={styles.assuranceSub}>
              {scaleMode === 'bulk'
                ? 'Free on-site measurement & physical estimation. Fixed rate card with 80% direct artisan compensation.'
                : 'Zero cancellation charges before artisan arrives. Standardized cooperative rates.'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Camera vs Gallery Capture Modal */}
      <MediaCaptureModal
        visible={mediaModalVisible}
        onClose={() => setMediaModalVisible(false)}
        onImageSelected={(uri) => setPickedImage(uri)}
      />

      {/* Simulated Call to Ward Head Modal */}
      <Modal visible={callModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { alignItems: 'center', paddingVertical: 24 }]}>
            <View style={styles.callRingCircle}>
              <Ionicons name="call" size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.callingTitle}>Calling District Cooperative Ward Head</Text>
            <Text style={styles.callingName}>{matchedCoop.head_name}</Text>
            <Text style={styles.callingDesignation}>{matchedCoop.head_designation}</Text>
            <Text style={styles.callingNumber}>{matchedCoop.phone}</Text>

            <View style={styles.callingSafetyBadge}>
              <Ionicons name="shield-checkmark" size={14} color={colors.successDark} />
              <Text style={styles.callingSafetyText}>Official Verified Cooperative Federation Line</Text>
            </View>

            <TouchableOpacity
              style={styles.endCallBtn}
              onPress={() => setCallModalVisible(false)}
            >
              <Ionicons name="call" size={18} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
              <Text style={styles.endCallText}>End Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bulk Project Inspection Confirmed Modal */}
      <Modal visible={inspectionSuccessModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={{ alignItems: 'center', paddingVertical: 14 }}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.confirmedTitle}>On-Site Inspection Scheduled!</Text>
              <Text style={styles.confirmedTicket}>Project Ticket #{inspectionTicket?.id || 'COMM-92841'}</Text>
              <Text style={styles.confirmedDesc}>
                District Ward Head <Text style={{ fontWeight: '800' }}>{matchedCoop.head_name}</Text> from {matchedCoop.name} will visit your site for physical measurement & final contract sign-off.
              </Text>

              <View style={styles.confirmedDetailsCard}>
                <Text style={styles.detailRow}>🏢 <Text style={{ fontWeight: '700' }}>Scope:</Text> {selectedScaleObj.label}</Text>
                <Text style={styles.detailRow}>👷 <Text style={{ fontWeight: '700' }}>Fleet Size:</Text> {bulkEstimation.crewSize} Certified Artisans</Text>
                <Text style={styles.detailRow}>💰 <Text style={{ fontWeight: '700' }}>Estimated Cost:</Text> ₹{bulkEstimation.minCost.toLocaleString()} – ₹{bulkEstimation.maxCost.toLocaleString()}</Text>
                <Text style={styles.detailRow}>📅 <Text style={{ fontWeight: '700' }}>Target Date:</Text> {type === 'scheduled' ? selectedDate : 'Tomorrow, 10:00 AM'}</Text>
              </View>

              <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => {
                  setInspectionSuccessModal(false);
                  navigation.navigate('Home');
                }}
              >
                <Text style={styles.doneBtnText}>Return to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sticky Bottom Action */}
      <View style={styles.bottomBar}>
        {scaleMode === 'bulk' ? (
          <View style={styles.bulkDualButtonRow}>
            <TouchableOpacity
              style={styles.bulkInspectBtn}
              onPress={handleScheduleInspection}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              <View style={{ marginLeft: 6 }}>
                <Text style={styles.bulkInspectBtnText}>Free Inspection</Text>
                <Text style={styles.bulkInspectBtnSub}>Zero Advance</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bulkDirectBookBtn}
              onPress={handleBookBulkWithAdvance}
              activeOpacity={0.85}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.bulkDirectBookBtnText}>
                  Book &amp; Deposit Advance (₹{bulkEstimation.advanceMid.toLocaleString()})
                </Text>
                <Text style={styles.bulkDirectBookBtnSub}>
                  {bulkEstimation.advancePercent}% Milestone 1 Escrow • {bulkEstimation.crewSize} Artisans
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.findWorkerBtn}
            onPress={handleFindWorker}
            activeOpacity={0.85}
          >
            <Text style={styles.findWorkerText}>
              {isDriverService
                ? `Book Driver • ₹${finalPayable}`
                : `${t('findWorker')} • ₹${finalPayable}`}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 90
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12
  },
  emergencyBannerCol: {
    marginLeft: 10,
    flex: 1
  },
  emergencyBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  emergencyBannerSub: {
    fontSize: 11,
    color: '#FEE2E2',
    marginTop: 2
  },
  welcomePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    padding: 12,
    borderRadius: 14,
    marginBottom: 12
  },
  welcomePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.successDark,
    marginLeft: 6,
    flex: 1
  },
  selectedServiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14
  },
  serviceIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  serviceEmoji: {
    fontSize: 24
  },
  serviceInfoCol: {
    flex: 1
  },
  serviceCategoryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5
  },
  selectedServiceName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2
  },
  serviceSubtext: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  servicePriceBadge: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  servicePriceText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary
  },
  scaleSelectorContainer: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14
  },
  scaleSelectorHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: 8
  },
  scaleTabsRow: {
    flexDirection: 'row',
    gap: 10
  },
  scaleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border
  },
  scaleTabActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary
  },
  scaleTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary
  },
  scaleTabTextActive: {
    color: colors.primary,
    fontWeight: '800'
  },
  scaleTabSub: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 1
  },
  bulkProjectCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    marginBottom: 14,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  bulkProjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  bulkIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bulkTag: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5
  },
  bulkTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary
  },
  bulkInputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6
  },
  scaleChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6
  },
  tradeScaleCard: {
    width: '48.5%',
    backgroundColor: colors.surfaceSecondary,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border
  },
  tradeScaleCardActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary
  },
  tradeScaleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary
  },
  tradeScaleLabelActive: {
    color: colors.primary,
    fontWeight: '800'
  },
  tradeScaleSub: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 2
  },
  tradeScaleSubActive: {
    color: colors.primaryText
  },
  materialCol: {
    gap: 8,
    marginBottom: 12
  },
  materialOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  materialOptionCardActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioCircleActive: {
    borderColor: colors.primary
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary
  },
  materialOptionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary
  },
  materialOptionTitleActive: {
    color: colors.primary
  },
  materialOptionSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1
  },
  mathSummaryCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  mathSummaryTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 10
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10
  },
  metricBox: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 2
  },
  metricLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 1
  },
  mathDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 10
  },
  costRangeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primarySubtle,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    marginBottom: 10
  },
  costRangeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5
  },
  costRangeVal: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 2
  },
  estimateBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  estimateBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary
  },
  splitBox: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  splitHeader: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 6
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2
  },
  splitKey: {
    fontSize: 10,
    color: colors.textSecondary
  },
  splitVal: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary
  },
  advanceCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    marginTop: 10
  },
  advanceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  advanceHeaderTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
    marginLeft: 6
  },
  advanceHighlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primarySubtle,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10
  },
  advanceHighlightSub: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary
  },
  advanceHighlightAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 1
  },
  escrowBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  escrowBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.successDark
  },
  milestoneList: {
    gap: 8,
    marginBottom: 8
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  milestoneDotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: 3,
    marginRight: 8
  },
  milestoneDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.borderDark,
    marginTop: 3,
    marginRight: 8
  },
  milestoneTextBox: {
    flex: 1
  },
  milestoneName: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary
  },
  milestoneDetail: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
    lineHeight: 14
  },
  escrowTrustNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: 8,
    borderRadius: 8,
    marginTop: 4
  },
  escrowTrustText: {
    fontSize: 9,
    color: colors.successDark,
    fontWeight: '600',
    marginLeft: 4,
    flex: 1
  },
  wardHeadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: 10,
    borderRadius: 12,
    marginBottom: 10
  },
  wardHeadPhoto: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.border,
    marginRight: 10
  },
  wardHeadInfo: {
    flex: 1
  },
  wardHeadTag: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5
  },
  wardHeadName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary
  },
  wardHeadSub: {
    fontSize: 10,
    color: colors.textSecondary
  },
  callHeadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: 12,
    borderRadius: 12
  },
  callHeadBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 6
  },
  tradeCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    marginBottom: 14
  },
  tradeCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: 10
  },
  tradeSubLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  tradeChip: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.border
  },
  tradeChipActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary
  },
  tradeChipText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  tradeChipTextActive: {
    color: colors.primary,
    fontWeight: '800'
  },
  routeCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    marginBottom: 14
  },
  routeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  routeCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5
  },
  routeTimeline: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  timelinePointRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  pickupDotCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  pickupInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A'
  },
  dropDotCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  timelineLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.borderDark,
    marginLeft: 10,
    marginVertical: 2
  },
  timelineInputBox: {
    flex: 1
  },
  timelineLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#16A34A',
    letterSpacing: 0.5
  },
  timelineInput: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingVertical: 2,
    marginTop: 2
  },
  quickDropHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 8
  },
  quickDropsScroll: {
    gap: 8
  },
  quickDropChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  quickDropChipActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primaryLight
  },
  quickDropText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary
  },
  quickDropTextActive: {
    color: colors.primary,
    fontWeight: '700'
  },
  tripPlansGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tripPlanCard: {
    width: '48%',
    backgroundColor: colors.surfaceSecondary,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border
  },
  tripPlanCardActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary
  },
  tripPlanLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary
  },
  tripPlanLabelActive: {
    color: colors.primary,
    fontWeight: '800'
  },
  tripPlanPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 6
  },
  tripPlanPriceActive: {
    color: colors.primary
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14
  },
  typePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  typePillActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primaryLight
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 6
  },
  typeTextActive: {
    color: colors.primary,
    fontWeight: '700'
  },
  formSection: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary
  },
  datesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4
  },
  dateChip: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  dateChipSelected: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primaryLight
  },
  dateChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  dateChipTextSelected: {
    color: colors.primary,
    fontWeight: '700'
  },
  timesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4
  },
  timeChip: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  timeChipSelected: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primaryLight
  },
  timeChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  timeChipTextSelected: {
    color: colors.primary,
    fontWeight: '700'
  },
  gpsSmallBtn: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  gpsSmallBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.successDark,
    marginLeft: 3
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border
  },
  inputIcon: {
    marginRight: 8
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    height: '100%'
  },
  textArea: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 70
  },
  estimateBreakdownCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14
  },
  estimateTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: 10
  },
  estimateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3
  },
  estimateKey: {
    fontSize: 12,
    color: colors.textSecondary
  },
  estimateVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary
  },
  estimateDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 8
  },
  estimateTotalKey: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary
  },
  estimateTotalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary
  },
  assuranceFooterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    padding: 14,
    borderRadius: 16,
    marginTop: 2
  },
  assuranceTextCol: {
    marginLeft: 10,
    flex: 1
  },
  assuranceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.successDark
  },
  assuranceSub: {
    fontSize: 11,
    color: colors.successDark,
    marginTop: 1,
    lineHeight: 15
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  findWorkerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4
  },
  findWorkerText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 20
  },
  callRingCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14
  },
  callingTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary
  },
  callingName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4
  },
  callingDesignation: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600'
  },
  callingNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 8
  },
  callingSafetyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 12
  },
  callingSafetyText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.successDark,
    marginLeft: 4
  },
  endCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 20
  },
  endCallText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 6
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  confirmedTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary
  },
  confirmedTicket: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2
  },
  confirmedDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 10,
    lineHeight: 17
  },
  confirmedDetailsCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    width: '100%',
    marginVertical: 10,
    gap: 6
  },
  detailRow: {
    fontSize: 12,
    color: colors.textPrimary
  },
  doneBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    marginTop: 8
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  directBulkBookingCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: colors.success
  },
  directBulkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  directBulkIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.successDark,
    alignItems: 'center',
    justifyContent: 'center'
  },
  directBulkTag: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.successDark,
    letterSpacing: 0.5
  },
  directBulkTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary
  },
  directBulkDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 12
  },
  directBulkMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  directBulkMetricItem: {
    flex: 1,
    alignItems: 'center'
  },
  directBulkMetricLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.textSecondary
  },
  directBulkMetricVal: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 2
  },
  directBulkMetricSub: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 1
  },
  directBulkMetricDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border
  },
  directBulkPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successDark,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12
  },
  directBulkPayBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  bulkDualButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  bulkInspectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14
  },
  bulkInspectBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary
  },
  bulkInspectBtnSub: {
    fontSize: 9,
    color: colors.textSecondary
  },
  bulkDirectBookBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14
  },
  bulkDirectBookBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  bulkDirectBookBtnSub: {
    fontSize: 9,
    color: '#E0E7FF',
    marginTop: 1
  }
});

export default Screen05_BookingForm;
