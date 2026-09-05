# Firebase Setup — UniServ Production

## Step 1 — Create Firebase Project

1. Go to https://console.firebase.google.com
2. Create a new project named "uniserv-production"
3. Enable Google Analytics (optional)

## Step 2 — Enable Firebase Services

In the Firebase Console, enable:
- **Authentication** → Sign-in methods → Phone (enable it)
- **Firestore Database** → Create database → Production mode
- **Storage** (for Aadhaar/selfie uploads)
- **Hosting** (for Organizer Portal deployment)

## Step 3 — Register Apps

Register THREE apps in the same project:
1. **Android app** — package: `com.uniserv.user` → download `google-services.json` → place in `UniServ/UniServ/android/app/`
2. **Android app** — package: `com.uniserv.worker` → download `google-services.json` → place in `UniServ-Worker/android/app/`
3. **Web app** — for Organizer Portal → copy the config object

## Step 4 — Fill in Config Keys

Replace `YOUR_API_KEY`, `YOUR_PROJECT_ID`, etc. in these files:
- `UniServ/UniServ/src/firebase/firebase.js`
- `UniServ-Worker/src/firebase/firebase.js`
- `UniServ-Organizer/js/firebase-data.js`

## Step 5 — Deploy Firestore Security Rules

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
# paste the contents of firestore.rules
firebase deploy --only firestore:rules
```

## Step 6 — Create Organizer Admin Account

In Firebase Console → Authentication → Add user:
- Email: `admin@your-cooperative.org`
- Password: (set a strong password)

Then set custom claims to make them admin:
```js
// Run this once in Firebase Cloud Functions or Admin SDK
admin.auth().setCustomUserClaims(uid, { admin: true });
```

## Step 7 — Deploy Organizer Portal

```bash
cd UniServ-Organizer
firebase init hosting
firebase deploy --only hosting
```

## Step 8 — Install Packages and Run Mobile Apps

```bash
# User App
cd UniServ/UniServ
npm install
npx expo run:android  # or run:ios

# Worker App
cd UniServ-Worker
npm install
npx expo run:android
```

## Step 9 — Seed Initial Worker Data (Optional)

Open `workers.html` in the Organizer Portal. In the browser console:
```js
// Paste your initial workers array, then:
UniServSeed.seedWorkersFromJson(yourWorkersArray)
```

## Data Flow Summary

```
User App ──────────────────────────────────────────►  Firestore
  - Firebase Phone Auth (real SMS OTP)                ↓ bookings/{id}
  - Writes booking to /bookings/{id}                  ↓ startOtp, status
  - Reads worker location from /workers/{uid}         ↓
  - Writes startOtp/completionOtp to booking         ↓
                                                       ↓
Worker App ◄──────────────────────────────────────── Firestore
  - Firebase Phone Auth (real SMS OTP)               ↑ listens for status==1
  - Listens for job requests (status==1)             ↑ broadcasts GPS location
  - Broadcasts GPS to /workers/{uid}.location        ↑ reads startOtp/completionOtp
  - Reads OTP from booking, updates status           ↑
                                                       ↑
Organizer Portal ◄────────────────────────────────── Firestore
  - Firebase Email/Password Auth                     ↑ all collections
  - Real-time worker verification queue              ↑
  - Approve/reject KYC → updates /workers/{uid}      ↑
  - Assign assessment token → creates /assessments/  ↑
  - Live bookings dashboard                          ↑
  - Complaint management                             ↑
```
