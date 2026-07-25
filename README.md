# 🏥 NALAM AI

### AI-Powered Rural Healthcare Assistant & Clinical Decision Support System for ASHA Workers

> **NALAM AI** bridges the gap between rural communities and quality healthcare through Artificial Intelligence, Digital Health Records, Clinical Decision Support, and Automated Workflow Systems.

---

## 📖 Project Overview

NALAM AI is an integrated healthcare ecosystem designed to empower **ASHA (Accredited Social Health Activist)** workers in rural India. The platform digitizes patient health records, assists in clinical decision-making, classifies ECG cardiac rhythms using PyTorch deep learning, summarizes medical diagnostic reports, and automates medicine inventory management with real-time n8n low-stock webhooks.

---

## 👥 Team Details

| Field | Details |
|-------|---------|
| **Project Name** | NALAM AI |
| **Team Name** | RUNTIME TERRORS |
| **Hackathon** | RUSH HOUR |
| **College** | Easwari Engineering College |
| **Department** | Computer Science and Engineering (Artificial Intelligence & Machine Learning) |

### 👨‍💻 Team Members
- **ASHMITHA R**
- **ARUL PRAKASH P.S**
- **IMMANUEL RAJ E**
- **HARRITHA S**
- **SHARMILI J**
- **BISHWANTH KUMAR S**

---

## ✨ Key Features & Capabilities

- 👩‍⚕️ **ASHA Worker Portal:** Digital health records, patient registration, appointment scheduling, and vaccination reminders.
- 💊 **AI Prescription Generator:** Converts patient symptoms into structured prescriptions and automatically deducts medicines from the MongoDB Atlas database inventory.
- 🫀 **EfficientNet-B0 ECG AI Classifier:** PyTorch deep learning model to analyze 224×224 ECG images and detect heartbeat arrhythmias across 6 clinical risk categories.
- 📄 **AI Medical Report & OCR Summarizer:** Automated text extraction and instant clinical summaries for lab tests and diagnostic reports.
- 📡 **Automated Low-Stock n8n Webhook Alerts:** Triggers production email alerts when medicine stock falls below critical thresholds.
- 🛡️ **System Admin Control Center:** Centralized management for Hospitals/PHCs, ASHA worker allocations, and patient registries.
- 📲 **Patient Health Portal:** Patient-facing portal to access medical history, prescriptions, and appointment bookings.

---

## 🛠️ Complete Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React.js, Vite, Tailwind CSS, Lucide Icons, JavaScript (ES6+) |
| **Backend** | Node.js, Express.js, Serverless API |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **AI / Deep Learning** | PyTorch, EfficientNet-B0, Google Gemini API, Tesseract OCR |
| **Workflow Automation** | n8n Webhook Cloud Automation |
| **Authentication** | JWT (JSON Web Tokens), Bcryptjs |
| **Deployment** | Vercel Serverless Platform |

---

## 🫀 AI & Deep Learning Models

### 1. EfficientNet-B0 ECG Heartbeat Classification (`PyTorch`)
Lightweight Convolutional Neural Network (CNN) trained to classify 6 heartbeat classes:
- **`N` (Normal Beat):** 🟢 Low Risk – Normal sinus rhythm.
- **`F` (Fusion Beat):** 🟡 Moderate Risk – Fusion of normal & ventricular beats.
- **`M` (Myocardial Beat):** 🟡 Moderate Risk – Myocardial abnormality.
- **`Q` (Unknown Beat):** 🟠 Medium Risk – Unclassifiable rhythm.
- **`S` (Supraventricular Ectopic Beat):** 🟠 Medium Risk – Supraventricular arrhythmia.
- **`V` (Ventricular Ectopic Beat):** 🔴 High Risk – Ventricular arrhythmia (PVC).

### 2. Medical Report & OCR Analysis
- Extracts text from diagnostic reports via OCR.
- Generates instant clinical summaries, abnormal value alerts, and precautionary recommendations.

---

## ⚙️ Installation and Setup Guide

```bash
# Clone the repository
git clone https://github.com/Immanuel-Raj-E/-NALAM-AI.git
cd -NALAM-AI

# Install dependencies
npm install

# Start Backend Server
cd server
npm run dev

# Start Frontend Server
cd client
npm run dev
```

---

## 🔐 Portal Access & Credentials

- 🛡️ **System Admin:** `admin@nalamhealth.in` | Password: `admin123`
- 👩‍⚕️ **ASHA Worker:** `meena@nalamhealth.in` | Password: `asha1234`
- 🧑 **Patient Portal:** `lakshmi@nalamhealth.in` | Password: `patient123`

---

## 📦 GitHub Repository & Live Demo

- **GitHub Repository:** [https://github.com/Immanuel-Raj-E/-NALAM-AI](https://github.com/Immanuel-Raj-E/-NALAM-AI)
- **Live Vercel Deployment:** [https://nalam-ai-eta.vercel.app](https://nalam-ai-eta.vercel.app)
