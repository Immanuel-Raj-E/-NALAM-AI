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
| **Team Name** | Runtime Terrors |
| **Hackathon** | *Hackathon Name* |
| **College** | Easwari Engineering College |
| **Department** | Computer Science and Engineering (Artificial Intelligence & Machine Learning) |

## 👨‍💻 Team Members

- **Ashmitha R**
- **Arul Prakash P.S**
- **Immanuel Raj E**
- **Harritha S**
- **Bishwanth Kumar S**
- **Sharmili J**

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
- 🫀 AI-powered ECG Analysis *(In Progress)*
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
| **Workflow Automation** | n8n |
| **Authentication** | JWT |
| **API Testing** | Postman |
| **Version Control** | Git & GitHub |

---

# 🏗️ System Architecture

https://1drv.ms/i/c/273ac9af897564e3/IQBmAL4jw1RtS70-I7IlAFKMAfHT_mmGZOwEqQHiB2lrRnI?e=Ch9B47.

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

Or display the image:

```markdown
![System Architecture](docs/system-architecture.png)
```

---

# 🔄 Detailed Workflow

### 1. ASHA Worker Login

- Login to the dashboard.

### 2. Patient Registration

- Register or search for a patient.
- Generate a Unique Patient ID.

### 3. Digital Prescription

- Create and store prescriptions digitally.

### 4. AI Report Analysis

- Upload a medical report.
- Gemini AI analyzes the report.
- Generate a simplified medical summary.

### 5. Medicine Dispensing

- Dispense medicines.
- Inventory is automatically updated.

### 6. Inventory Management

- Backend checks medicine stock.
- If stock is below the threshold level:
  - Trigger the n8n workflow.
  - Generate a purchase request.
  - Send an email notification to the PHC/Admin.

### 7. Patient Portal

Patients can:

- View prescriptions.
- View reports.
- Access complete medical history.

---

# 📂 Folder Structure

```text
NALAM-AI/
│
├── frontend/
├── backend/
├── ai-model/
├── n8n/
├── docs/
│   ├── system-architecture.png
│   └── screenshots/
├── database/
├── README.md
├── .gitignore
└── LICENSE
```

### Folder Description

- **frontend/** – React application
- **backend/** – Express APIs
- **ai-model/** – AI modules
- **n8n/** – Automation workflows
- **docs/** – Architecture diagrams and screenshots
- **database/** – Database schema

---

# ⚙️ Installation and Usage Guide

## Installation

```bash
git clone https://github.com/your-username/NALAM-AI.git

cd NALAM-AI
```

Install Backend

```bash
cd backend
npm install
npm start
```

Install Frontend

```bash
cd frontend
npm install
npm run dev
```

Configure your `.env` file.

```env
PORT=

MONGO_URI=

JWT_SECRET=

GEMINI_API_KEY=

N8N_WEBHOOK=

EMAIL_USER=

EMAIL_PASS=
```

Import the provided **n8n workflow** before running the project.

## Usage

- Login to the ASHA Dashboard.
- Register a patient.
- Create a digital prescription.
- Upload ECG or medical reports.
- AI analyzes the report.
- Dispense medicines.
- Inventory updates automatically.
- If stock is low, n8n sends notifications and creates a purchase request.
- Patients can view their records in the Patient Portal.

---

# 📡 API Documentation

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/login` | Login |
| POST | `/api/patient` | Register Patient |
| GET | `/api/patient/:id` | Get Patient |
| PUT | `/api/patient/:id` | Update Patient |
| POST | `/api/report` | Upload Medical Report |
| POST | `/api/dispense` | Dispense Medicine |
| GET | `/api/history/:id` | Medical History |

---

# 🧠 Medical Report Analysis *(In Progress)*

### AI Medical Report Analysis

- Upload a medical report.
- Gemini AI analyzes the report.
- Generate a simplified medical summary for the ASHA worker.

> **Note:** The AI model is designed to assist healthcare professionals and should not be considered a replacement for medical diagnosis.

---

# 🔒 Security Measures

- 🔐 Secure JWT Authentication
- 👥 Role-Based Access Control
- 🔑 Encrypted Password Storage
- 📡 Secure API Communication
- ✅ Input Validation
- 🗄️ Secure MongoDB Storage
- 🔒 Environment Variables for Sensitive Credentials

---

# 🧪 Testing and Performance

## Testing

- ✅ Frontend Testing
- ✅ Backend API Testing
- ✅ Database Connectivity
- ✅ AI Report Analysis
- ✅ Medicine Inventory Updates
- ✅ n8n Workflow Automation

## Performance

- ⚡ Fast patient data retrieval
- ⚡ Real-time inventory updates
- ⚡ Smooth workflow execution
- ⚡ Scalable backend architecture

---

# 🚧 Challenges Faced

- Fine-tuning the AI model.
- Integrating Gemini API.
- Designing scalable patient records.
- Implementing medicine inventory automation.
- Setting up n8n workflow automation.

---

# 🚀 Future Scope

- 🫀 Complete ECG model fine-tuning.
- 🩻 Add X-ray and MRI report analysis.
- 🤖 Improve AI-based recommendations.
- 📱 Mobile application for ASHA workers.
- 🌐 Multi-language support.
- ☁️ Cloud deployment for rural healthcare centers.

#Demo

https://1drv.ms/i/c/273ac9af897564e3/IQBCfKVJqDHiR7fAq-k8W_NDASjZSU75IDcg_JfqciVTeVc?e=3sGtqH

https://1drv.ms/i/c/273ac9af897564e3/IQC8lDwpU0T-T7s3lrrg7VzVAWD31wn2yRY-Ns48rGydmYk?e=sGUd41

---

# 📚 References

- Google Gemini API Documentation
- React Documentation
- Express.js Documentation
- MongoDB Documentation
- n8n Documentation
- JWT Documentation
- Postman Documentation
- WHO Rural Healthcare Guidelines

---

# ❤️ Conclusion

NALAM AI empowers ASHA workers by integrating Artificial Intelligence, Digital Health Records, and Workflow Automation into a single platform. The system simplifies patient management, assists in medical decision-making, automates medicine inventory, and enhances the overall efficiency of rural healthcare services.

By leveraging modern web technologies, AI-powered analysis, and automated workflows, NALAM AI aims to make quality healthcare more accessible, efficient, and reliable for rural communities across India.
