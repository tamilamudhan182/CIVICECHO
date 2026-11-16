# 🏛️ CivicEcho (CivicEchoX)

> **Citizen-Centric Grievance Redressal & Civic Engagement Platform**  
> Empowering citizens to report local civic issues, earn green contribution rewards, and enable municipal authorities to prioritize and resolve complaints efficiently.

---

## 🌟 Key Highlights & Capabilities

- **🔐 Aadhaar-Linked Citizen Authentication:** Secure citizen sign-in with 12-digit Aadhaar pairing and individual 6-digit OTP verification.
- **⚡ AI & Mathematical Priority Scoring (Business Rule 1):** Real-time automated priority calculation based on Base Urgency Weight (Critical, High, Medium, Low), Duplicate/Cluster frequency, and Citizen Sentiment score.
- **🎁 Civic Reward Points & Vouchers (Business Rule 2):** Citizens earn **+50 PTS** upon reporting verified complaints and **+100 PTS** automatically upon municipal resolution. Zero-base points ensure points strictly reflect active participation.
- **🎟️ Voucher & Discount Redemption:** Exchange earned civic points for Namma Metro transit passes, BBMP Property Tax rebates, BESCOM electricity bill credits, and HOPCOMS organic grocery passes with promo codes, validity dates, rules, and usage guides.
- **🏢 Multi-Department Municipal Authority Dashboard:** Workflows for 6 departments: Public Health, Safety & Traffic, Sanitation & Waste, Water Supply & Drainage, Electricity & Power, and Roads & Infrastructure.
- **🏆 Civic Champions Leaderboard:** Community rankings sorted dynamically by verified civic contribution points with live deduplication.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Radix UI / Shadcn UI, Framer Motion, Recharts, Lucide Icons |
| **Backend (Primary)** | Java 21, Spring Boot 3.3.4, Spring Data JPA, H2 In-Memory Database (`jdbc:h2:mem:civicechodb`), Maven |
| **Express Backend** | Node.js, Express 5, TypeScript (Microservice in `server/`) |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (v22 recommended)
- **Java JDK**: 21 or higher
- **Maven**: 3.9+ (or use wrapper)

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Build the Spring Boot Backend
```bash
cd backend
mvn clean package -DskipTests
cd ..
```

### 3. Run Both Services (One-Click on Windows)
Simply double-click or run:
```bash
run-all.bat
```
Or start them individually:
- **Backend:** `run-backend.bat` (Runs Spring Boot on `http://localhost:8080`)
- **Frontend:** `run-frontend.bat` (Runs Vite on `http://localhost:5173`)

---

## 🔑 Demo Access Credentials

### Citizen Portal
- **Aadhaar Number:** `123456789012`
- **Specific OTP:** `123456`
- *Or register your own custom Aadhaar & OTP combination directly via "Manage / Add Yours" on the login screen.*

### Municipal Authority Admin Portal
- **Department:** Select any department (e.g., *Public Health Board*, *Water Supply*, *Roads & Infrastructure*)
- **Password:** `admin123`

---

## 🧪 Testing & Verification

Run frontend vitest test suite:
```bash
npm test
```

Run backend JUnit test suite:
```bash
cd backend
mvn test
```

---

## 📄 License
This project is licensed under the MIT License.
