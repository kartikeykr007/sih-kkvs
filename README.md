# ParimaN (परिमाण) — Online Legal Metrology Verification System
> **Smart India Hackathon 2026** | **Problem Statement:** Digital Verification & Certification of Weights and Measures  
> **Ministry / Department:** Department of Consumer Affairs, Ministry of Consumer Affairs, Food & Public Distribution, Government of India

---

## 🏛️ Overview
**ParimaN** is an end-to-end digital governance platform that modernizes and digitizes the statutory lifecycle of weighing and measuring instruments under the **Legal Metrology Act, 2009** and **Legal Metrology (General) Rules, 2011**.

By replacing fragmented manual paper processes, physical office visits, and vulnerable paper certificates, ParimaN provides a single-window portal with:
- Automated application scrutiny and tracking.
- Intelligent scheduling between Legal Metrology Officers (LMO) and Government Approved Test Centres (GATC / NABL laboratories).
- Standardized 14-parameter digital calibration and testing checklists.
- Cryptographically verifiable digital certificates with public QR code validation.
- Executive departmental dashboards with real-time Citizen Charter SLA telemetry.

---

## 🔄 End-to-End Workflow

```
[ Commercial Applicant ]
         │
         ▼
  1. Register Measuring Instrument (Make, Serial No, Capacity, Accuracy Class)
         │
         ▼
  2. File Verification Application (Initial / Re-verification / Renewal)
         │
         ▼
  3. Online Statutory Fee Settlement (Demonstration BharatKosh Gateway)
         │
         ▼
[ Legal Metrology Officer (LMO) ]
  4. Scrutinize Dossier & Model Gazette Approval ──► (Approve / Request Docs / Reject)
         │
         ▼
  5. Schedule Physical Verification Appointment with Designated GATC Laboratory
         │
         ▼
[ Government Approved Test Centre (GATC) ]
  6. Conduct Standardized Calibration & Tolerance Testing (14-parameter Checklist)
         │
         ▼
  7. Submit Official Calibration Test Report
         │
         ▼
[ Legal Metrology Officer (LMO) ]
  8. Issue Official Verification Certificate (Cryptographic QR Code Embedded)
         │
         ▼
[ Public Consumer / Enforcement / Buyer ]
  9. Instant QR Code Verification (Authenticity, Expiry Date, Jurisdiction Stamping)
```

---

## 👥 Stakeholder Portals & Demo Accounts

For hackathon jury evaluations, instant 1-click credentials are built directly into the login screen:

| Role | Name | Email | Password | Scope |
|---|---|---|---|---|
| **Commercial Applicant** | Rajesh Kumar | `rajesh.kumar@demo.com` | `demo1234` | Instrument registration, filings, fee payment, certificate downloads |
| **Legal Metrology Officer (LMO)** | Arvind Sharma | `inspector.sharma@gov.in` | `demo1234` | Regulatory scrutiny, approvals, GATC scheduling, certificate issuance |
| **GATC Laboratory** | GATC Delhi Central | `gatc.delhi@demo.com` | `demo1234` | Appointment queue, calibration checklist testing, laboratory report submission |
| **Administrator** | Central Admin | `admin@legalmetrology.gov.in` | `demo1234` | Executive analytics, SLA monitoring, user management, immutable audit logs |

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, Recharts (analytics)
- **Backend:** Node.js, Express.js REST API
- **Database:** SQLite (Better-SQLite3) with relational integrity and foreign keys
- **Security:** JSON Web Tokens (JWT), bcrypt password hashing, immutable audit logging
- **QR Certification:** Cryptographically signed certificate verification URL

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kartikeykr007/sih-kkvs.git
   cd sih-kkvs
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   ```bash
   cp .env.example .env
   ```

4. **Initialize and Seed Database:**
   ```bash
   npm run seed
   ```

5. **Start Development Servers (Frontend + Backend concurrently):**
   ```bash
   npm run dev
   ```

The application will be accessible at:
- **Web Portal:** `http://localhost:5173`
- **REST API:** `http://localhost:3001/api`
- **Public Certificate Lookup:** `http://localhost:5173/verify?cert=CERT-LM-2026-0001`

---

## 🚀 Deploying to Vercel (1-Click Ready)

ParimaN is configured for zero-friction deployment on **Vercel**:

### Option 1: Vercel Web Dashboard (Recommended)
1. Fork or push this repository to your GitHub account (`https://github.com/kartikeykr007/sih-kkvs.git`).
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"** -> **"Import Git Repository"**.
3. Select `sih-kkvs`.
4. Vercel automatically detects Vite:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **"Deploy"**.
6. That's it! In ~45 seconds, your live production URL is ready.

### Option 2: Vercel CLI
```bash
npm install -g vercel
vercel
```

### Architecture on Vercel:
- **Client SPA:** Vite builds static HTML/JS/CSS assets into `dist/` served at the global edge.
- **Serverless API:** The Express backend is exported as a Vercel Serverless Function via [`api/index.js`](file:///c:/Users/karti/OneDrive/Desktop/Coding/HTML/legal-metrology-system/api/index.js) and configured via [`vercel.json`](file:///c:/Users/karti/OneDrive/Desktop/Coding/HTML/legal-metrology-system/vercel.json).
- **Database:** Uses Node.js built-in `node:sqlite` in `/tmp` on serverless execution with automatic schema initialization and demo seeding on cold start. All 6 stakeholder demo accounts, instruments, and certificates are fully interactive out of the box!

---

## 📋 Key Features

- **Tricolor Government Aesthetic:** Clean design complying with National Informatics Centre (NIC) and Digital India design standards.
- **Application Progress Pipeline:** Citizen Charter status tracking showing submission, scrutiny, approval, scheduling, testing, and certification stages.
- **Pre-fill Compliant Standard:** Fast evaluation helper for testing benches during live jury presentations.
- **Immutable Audit Trail:** Comprehensive event logging for all actions taken across the system.
- **Responsive & Accessible:** Fully mobile-responsive layout with accessible forms and high contrast ratios.

---

## 📜 Legal Framework Grounding
Built strictly in accordance with:
- Legal Metrology Act, 2009 (Act No. 1 of 2010)
- Legal Metrology (General) Rules, 2011
- Legal Metrology (Approval of Models) Rules, 2011
- Department of Consumer Affairs Guidelines for GATC Accreditation
