# 🏥 NALAM AI

### AI-Powered Rural Healthcare Assistant for ASHA Workers

> Bridging the gap between rural communities and quality healthcare through Artificial Intelligence, Digital Health Records, and Workflow Automation.

---

# 📖 Overview

NALAM AI is an AI-powered healthcare platform designed to empower **ASHA (Accredited Social Health Activist)** workers by digitizing patient records, assisting in medical decision-making, analyzing diagnostic reports, and automating medicine inventory management.

The platform provides a unified ecosystem consisting of an **ASHA Portal**, **Patient Portal**, **AI Diagnostic Module**, and an **Automated Inventory Management System**, enabling faster, smarter, and more efficient healthcare delivery in rural communities.
   
---

# 👥 Team Details

| Field | Details |
|-------|---------|
| **Project Name** | NALAM AI |
| **Team Name** | RUNTIME TERRORS |
| **Hackathon** | RUSH HOUR |
| **College** | Easwari Engineering College |
| **Department** | Computer Science and Engineering (Artificial Intelligence & Machine Learning) |

## 👨‍💻 Team Members

- Member 1 - ASHMITHA R
- Member 2 - ARUL PRAKASH P.S
- Member 3 - IMMANUEL RAJ E
- Member 4 - HARRITHA S
- Member 5 - Sharmili J
- Member 6 - BISHWANTH KUMAR S

---

# 📌 Problem Statement

ASHA (**Accredited Social Health Activist**) workers play a vital role in delivering primary healthcare services to rural communities across India. However, they often depend on manual documentation and have limited access to intelligent decision-support tools while managing patient care.

Some of the major challenges include:

- 📄 Maintaining patient records manually.
- 🩺 Difficulty identifying high-risk patients.
- 📊 Limited support for interpreting ECGs and medical reports.
- 💊 Inefficient medicine inventory management.
- 📅 Manual appointment scheduling.
- 🔄 Lack of an integrated patient history system.

These challenges delay treatment, reduce efficiency, and impact the quality of rural healthcare.

---

# 💡 Proposed Solution

**NALAM AI** is an AI-powered healthcare assistant that helps ASHA workers manage patient care efficiently through Artificial Intelligence and workflow automation.

The platform provides:

- 🆔 Unique Patient ID
- 📋 Digital Prescription Management
- 🫀 AI-powered ECG Analysis
- 📄 AI Medical Report Analysis
- 📜 Digital Patient History
- 📅 Smart Appointment Scheduling
- 💊 Real-time Medicine Inventory Management
- 🔄 n8n Workflow Automation
- 📧 Automatic Low Stock Email Notifications
- 📲 Secure Patient Portal

---

# ✨ Features

NALAM AI provides an AI-powered healthcare platform that helps ASHA workers deliver better healthcare services through digital records, intelligent decision support, and workflow automation.

- 👩‍⚕️ ASHA Worker Dashboard
- 🆔 Unique Patient ID
- 📋 Digital Prescription Management
- 📜 Patient Medical History
- 🫀 AI-Powered ECG Analysis
- 📄 AI Medical Report Analysis
- 📅 Smart Appointment Scheduling
- 💊 Medicine Inventory Management
- 🔄 Automated Inventory Workflow using n8n
- 📧 Automatic Low Stock Notifications
- 📲 Secure Patient Portal
- 🔒 Secure Authentication

---

# 🛠️ Complete Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React.js, Tailwind CSS, JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **AI Report Analysis** | Google Gemini API |
| **ECG Analysis Model** | EfficientNet-B0 (PyTorch) |
| **Workflow Automation** | n8n |
| **Authentication** | JWT |
| **API Testing** | Postman |
| **Version Control** | Git & GitHub |

---

# 🏗️ System Architecture

https://drive.google.com/file/d/1zdNnYajoyY3etLa73NnhNIboKTyedZ8V/view?usp=sharing

```text
ASHA Portal
      │
      ▼
React Frontend
      │
      ▼
Express Backend
      │
      ▼
MongoDB Database
      │
      ├──────────────┐
      ▼              ▼
AI Module      Inventory Module
      │              │
      ▼              ▼
Gemini API    Threshold Check
                     │
                     ▼
               Trigger n8n
                     │
                     ▼
            Purchase Request
                     │
                     ▼
             Email Notification
```

---

# 🔄 Detailed Workflow

1. **ASHA Worker Login**
   - Login to the dashboard.

2. **Patient Registration**
   - Register or search for a patient.
   - Generate a Unique Patient ID.

3. **Digital Prescription**
   - Create and store prescriptions digitally.

4. **AI Report Analysis**
   - Upload ECG or medical reports.
   - AI analyzes the report.

5. **Medicine Dispensing**
   - Dispense medicines.
   - Inventory is automatically updated.

6. **Inventory Management**
   - Backend checks medicine stock.
   - If stock is low, an **n8n workflow** is triggered.
   - n8n generates a purchase request and sends an email notification.

7. **Patient Portal**
   - Patients can access their medical history and reports.

---

# 📂 Folder Structure

```text
NALAM-AI/
│
├── client/
├── server/
├── README.md
└── .gitignore
```

### Folder Description

- **client/** – React application
- **server/** – Express APIs & MongoDB Models
- **README.md** – Project documentation

---

# ⚙️ Installation and Usage Guide

## Installation

```bash
git clone https://github.com/Immanuel-Raj-E/-NALAM-AI.git
cd -NALAM-AI
```

Configure your `.env` file with MongoDB Atlas and JWT credentials.

Start the project:

```bash
# Backend
cd server
npm run dev

# Frontend
cd client
npm run dev
```

## Usage

- Login to the ASHA Dashboard or System Admin Control Center.
- Register a patient.
- Create a digital prescription.
- Upload medical reports.
- Dispense medicines.
- Inventory updates automatically.
- Patients can view their records in the Patient Portal.

---

# 📡 API Documentation

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/patients` | Register Patient |
| GET | `/api/patients/:id` | Get Patient |
| POST | `/api/prescriptions` | Create Prescription |
| POST | `/api/reports` | Upload Report |
| GET | `/api/health-records` | Medical History |

---

# 🤖 AI/ML Workflow

NALAM AI uses Artificial Intelligence to assist ASHA workers in analyzing ECG images and medical reports.

## 🫀 ECG Analysis

The ECG module is built using **EfficientNet-B0**, a lightweight CNN pre-trained on ImageNet. The model is currently being **fine-tuned** for ECG heartbeat classification.

### Model Details

- **Architecture:** EfficientNet-B0
- **Framework:** PyTorch
- **Transfer Learning:** ImageNet Pre-trained
- **Input:** 224 × 224 ECG Images
- **Output:** ECG Heartbeat Classification

### Workflow

1. Upload ECG image.
2. Image preprocessing.
3. EfficientNet-B0 predicts the heartbeat class.
4. Display prediction with confidence score.

### Medical Report Analysis

- Upload report.
- OCR extracts text.
- Gemini AI analyzes the report.
- Generate a simplified medical summary.

> **Note:** The AI models are intended to assist healthcare professionals and do not replace medical diagnosis.

---

# 🔒 Security Measures

- 🔐 Secure user authentication.
- 👥 Role-based access control.
- 🔑 Encrypted password storage.
- 📡 Secure API communication.
- ✅ Input validation.
- 🗄️ Secure MongoDB storage.
- 🔒 Environment variables for sensitive credentials.

---

# 🧪 Testing and Performance

### Testing

- Tested frontend and backend.
- Verified database connectivity.
- Tested ECG model with sample images.
- Tested medicine inventory updates.
- Verified n8n workflow.

### Performance

- Fast patient data retrieval.
- Real-time inventory updates.
- Smooth system workflow.

---

# 🚧 Challenges Faced

- Fine-tuning the ECG model.
- Integrating AI with the application.
- Setting up n8n workflow automation.

---

# 🚀 Future Scope

- Complete ECG model fine-tuning.
- Add X-ray and MRI analysis.
- Improve AI-based recommendations.
- Deploy the system for real-world rural healthcare.

---

# 📸 Demo

- ASHA Dashboard
- Patient Portal
- System Admin Portal
- Digital Prescription Generator
- Inventory Dashboard

---

# 📚 References

- Google Gemini API
- PyTorch Documentation
- React Documentation
- Express.js Documentation
- MongoDB Documentation
- n8n Documentation
- EfficientNet Research Paper
- WHO Rural Healthcare Guidelines

---

# ❤️ Conclusion

NALAM AI empowers ASHA workers by integrating Artificial Intelligence, Digital Health Records, and Workflow Automation into a single platform. The system simplifies patient management, assists in medical decision-making, automates medicine inventory, and enhances the overall efficiency of rural healthcare services.

