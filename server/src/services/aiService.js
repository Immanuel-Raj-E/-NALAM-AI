/**
 * NALAM AI - Mock AI Service
 * Provides rule-based responses for symptom checking and disease prediction.
 * Replace with a real AI model API (e.g., Google Gemini, OpenAI) in production.
 */

const symptomDatabase = {
  fever: {
    conditions: ['Common Cold', 'Influenza', 'Malaria', 'Dengue', 'Typhoid'],
    severity: 'Medium',
    precautions: ['Rest and stay hydrated', 'Take paracetamol for fever', 'Monitor temperature regularly', 'Avoid self-medication with antibiotics'],
  },
  cough: {
    conditions: ['Common Cold', 'Bronchitis', 'Asthma', 'Tuberculosis', 'COVID-19'],
    severity: 'Low',
    precautions: ['Stay warm and drink warm fluids', 'Avoid dusty environments', 'Wear a mask in public', 'Monitor for blood in cough'],
  },
  headache: {
    conditions: ['Migraine', 'Tension Headache', 'Sinusitis', 'Hypertension', 'Dengue'],
    severity: 'Low',
    precautions: ['Rest in a quiet dark room', 'Stay hydrated', 'Avoid screen time', 'Monitor blood pressure'],
  },
  'chest pain': {
    conditions: ['Angina', 'Heart Attack', 'Pneumonia', 'Costochondritis', 'Acid Reflux'],
    severity: 'High',
    precautions: ['URGENT: Seek immediate medical attention', 'Do not ignore chest pain', 'Keep patient calm and seated', 'Call ambulance immediately'],
  },
  diarrhea: {
    conditions: ['Gastroenteritis', 'Food Poisoning', 'Cholera', 'IBS', 'Typhoid'],
    severity: 'Medium',
    precautions: ['ORS (Oral Rehydration Salts) immediately', 'Drink boiled water only', 'Avoid solid food temporarily', 'Monitor for dehydration signs'],
  },
  vomiting: {
    conditions: ['Gastroenteritis', 'Food Poisoning', 'Dengue', 'Pregnancy', 'Appendicitis'],
    severity: 'Medium',
    precautions: ['Oral rehydration is essential', 'Small sips of water frequently', 'Avoid solid food until vomiting stops', 'Seek medical help if vomiting persists > 6 hours'],
  },
  fatigue: {
    conditions: ['Anaemia', 'Diabetes', 'Thyroid Disorder', 'Malaria', 'Depression'],
    severity: 'Low',
    precautions: ['Ensure adequate sleep (7-8 hours)', 'Check blood haemoglobin levels', 'Eat iron-rich foods', 'Avoid strenuous activity'],
  },
  rash: {
    conditions: ['Chickenpox', 'Measles', 'Allergic Reaction', 'Dengue', 'Skin Infection'],
    severity: 'Medium',
    precautions: ['Do not scratch the rash', 'Keep the area clean and dry', 'Avoid sharing clothes/towels', 'Isolate if infectious disease suspected'],
  },
  'shortness of breath': {
    conditions: ['Asthma', 'COPD', 'Pneumonia', 'Heart Failure', 'Anaemia'],
    severity: 'High',
    precautions: ['URGENT: Seek medical help immediately', 'Keep patient in sitting position', 'Ensure good ventilation', 'Avoid exertion'],
  },
  'abdominal pain': {
    conditions: ['Appendicitis', 'Gastritis', 'Kidney Stones', 'UTI', 'Pregnancy Complications'],
    severity: 'Medium',
    precautions: ['Do not give painkillers without diagnosis', 'Monitor pain intensity and location', 'Seek medical evaluation', 'Check for fever alongside pain'],
  },
  default: {
    conditions: ['Unknown Condition'],
    severity: 'Low',
    precautions: ['Monitor symptoms carefully', 'Drink plenty of fluids', 'Get adequate rest', 'Consult a doctor if symptoms persist beyond 2 days'],
  },
};

const diseaseDatabase = {
  malaria: { symptoms: ['fever', 'chills', 'headache', 'fatigue', 'vomiting'], confidence: 85, action: 'Refer to PHC immediately for blood smear test. Give chloroquine/artemisinin as per protocol.' },
  dengue: { symptoms: ['fever', 'rash', 'headache', 'fatigue', 'vomiting'], confidence: 78, action: 'Monitor platelet count. Admit if severe. Provide paracetamol and ORS. Avoid NSAIDs.' },
  typhoid: { symptoms: ['fever', 'headache', 'fatigue', 'abdominal pain', 'diarrhea'], confidence: 72, action: 'Refer for Widal test. Provide antibiotics as per doctor prescription. Ensure boiled water.' },
  tuberculosis: { symptoms: ['cough', 'fever', 'fatigue', 'weight loss', 'night sweats'], confidence: 80, action: 'Refer to DOTS centre immediately. Sputum test required. Isolate patient from household.' },
  anaemia: { symptoms: ['fatigue', 'shortness of breath', 'headache', 'dizziness'], confidence: 75, action: 'Provide IFA tablets. Iron-rich diet counselling. Refer if Hb < 7g/dL.' },
  pneumonia: { symptoms: ['cough', 'fever', 'shortness of breath', 'chest pain'], confidence: 82, action: 'Refer to doctor immediately for chest X-ray. Antibiotic treatment required. Monitor SpO2.' },
  cholera: { symptoms: ['diarrhea', 'vomiting', 'fatigue'], confidence: 70, action: 'URGENT ORS administration. Refer to hospital. Notify health authorities. Water purification.' },
  default: { symptoms: [], confidence: 40, action: 'Consult a qualified medical professional for accurate diagnosis and treatment.' },
};

/**
 * Symptom Checker
 * @param {string[]} symptoms - Array of symptom strings
 * @param {number} age - Patient age
 * @param {string} gender - Patient gender
 */
const checkSymptoms = (symptoms, age = null, gender = null) => {
  const lowerSymptoms = symptoms.map(s => s.toLowerCase().trim());
  let highestSeverity = 'Low';
  const allPrecautions = new Set();
  const possibleConditions = new Set();
  const matchedSymptoms = [];

  lowerSymptoms.forEach(symptom => {
    let matched = false;
    Object.keys(symptomDatabase).forEach(key => {
      if (key !== 'default' && (symptom.includes(key) || key.includes(symptom))) {
        const data = symptomDatabase[key];
        data.conditions.forEach(c => possibleConditions.add(c));
        data.precautions.forEach(p => allPrecautions.add(p));
        if (data.severity === 'High') highestSeverity = 'High';
        else if (data.severity === 'Medium' && highestSeverity !== 'High') highestSeverity = 'Medium';
        matchedSymptoms.push(key);
        matched = true;
      }
    });
    if (!matched) {
      symptomDatabase.default.precautions.forEach(p => allPrecautions.add(p));
    }
  });

  const riskLevel = highestSeverity;
  const recommendation = riskLevel === 'High'
    ? '🚨 URGENT: Please refer this patient to the nearest hospital immediately.'
    : riskLevel === 'Medium'
    ? '⚠️ Monitor closely and consult a doctor within 24 hours if symptoms persist or worsen.'
    : '✅ Provide basic care and monitor. Consult a doctor if symptoms persist beyond 2-3 days.';

  const disclaimer = '⚕️ DISCLAIMER: This is an AI-assisted guidance tool, not a definitive diagnosis. Always consult a qualified medical professional for accurate diagnosis and treatment.';

  return {
    symptoms: lowerSymptoms,
    possibleConditions: [...possibleConditions].slice(0, 5),
    riskLevel,
    precautions: [...allPrecautions].slice(0, 6),
    recommendation,
    disclaimer,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Disease Prediction
 * @param {string[]} symptoms
 */
const predictDisease = (symptoms) => {
  const lowerSymptoms = symptoms.map(s => s.toLowerCase().trim());
  let bestMatch = null;
  let bestScore = 0;

  Object.entries(diseaseDatabase).forEach(([disease, data]) => {
    if (disease === 'default') return;
    const matchCount = data.symptoms.filter(s => lowerSymptoms.some(ls => ls.includes(s) || s.includes(ls))).length;
    const score = (matchCount / data.symptoms.length) * data.confidence;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = { disease, ...data, matchScore: Math.round(score) };
    }
  });

  if (!bestMatch || bestScore < 20) {
    return {
      predictedDisease: 'Unable to determine',
      confidence: 0,
      recommendedAction: diseaseDatabase.default.action,
      disclaimer: '⚕️ DISCLAIMER: This is an AI-assisted guidance tool, not a definitive diagnosis.',
    };
  }

  return {
    predictedDisease: bestMatch.disease.charAt(0).toUpperCase() + bestMatch.disease.slice(1),
    confidence: Math.min(bestMatch.matchScore, 90),
    recommendedAction: bestMatch.action,
    disclaimer: '⚕️ DISCLAIMER: This is an AI-assisted guidance tool, not a definitive diagnosis. Always consult a qualified medical professional.',
  };
};

/**
 * Analyze OCR text from medical report
 */
const analyzeReport = (ocrText) => {
  const text = ocrText.toLowerCase();
  const findings = [];
  const abnormalValues = [];

  // Rule-based checks for common lab values
  const patterns = [
    { regex: /haemoglobin[:\s]+(\d+\.?\d*)/i, param: 'Haemoglobin', unit: 'g/dL', low: 12, high: 17 },
    { regex: /glucose[:\s]+(\d+\.?\d*)/i, param: 'Blood Glucose', unit: 'mg/dL', low: 70, high: 140 },
    { regex: /creatinine[:\s]+(\d+\.?\d*)/i, param: 'Creatinine', unit: 'mg/dL', low: 0.5, high: 1.2 },
    { regex: /wbc[:\s]+(\d+\.?\d*)/i, param: 'WBC Count', unit: 'cells/μL', low: 4000, high: 11000 },
    { regex: /platelet[:\s]+(\d+\.?\d*)/i, param: 'Platelet Count', unit: '×10³/μL', low: 150, high: 400 },
  ];

  patterns.forEach(({ regex, param, unit, low, high }) => {
    const match = ocrText.match(regex);
    if (match) {
      const value = parseFloat(match[1]);
      let status = 'Normal';
      if (value < low) status = 'Low';
      else if (value > high) status = 'High';

      if (status !== 'Normal') {
        abnormalValues.push({ parameter: param, value: `${value} ${unit}`, normalRange: `${low}-${high} ${unit}`, status });
        findings.push(`${param} is ${status}: ${value} ${unit} (Normal: ${low}-${high} ${unit})`);
      }
    }
  });

  if (text.includes('abnormal') || text.includes('high') || text.includes('elevated')) {
    findings.push('Report indicates some abnormal values requiring medical attention');
  }

  const summary = findings.length > 0
    ? `Clinical Report Description: Extracted report indicates ${findings.length} key parameter area(s) requiring clinical follow-up. ${abnormalValues.length > 0 ? 'Abnormal values identified: ' + abnormalValues.map(v => `${v.parameter} (${v.status}: ${v.value})`).join(', ') + '.' : ''} Recommendation: Advise patient on prescribed follow-up schedule and monitor vitals.`
    : 'Clinical Report Description: All extracted lab values appear within standard reference intervals. Continue routine preventive health monitoring and regular ASHA checkups.';

  return { summary, findings, abnormalValues };
};

/**
 * Chat response generator
 */
const generateChatResponse = (message) => {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('namaste')) {
    return { message: 'Namaste! 🙏 I am NALAM AI, your healthcare assistant. I can help you check symptoms, analyze medical reports, and provide health guidance. How can I assist you today?', type: 'greeting' };
  }

  if (lowerMsg.includes('symptom') || lowerMsg.includes('fever') || lowerMsg.includes('pain') || lowerMsg.includes('cough')) {
    const extractedSymptoms = lowerMsg.split(/[,\s]+/).filter(w => Object.keys(symptomDatabase).some(k => k.includes(w) || w.includes(k)));
    if (extractedSymptoms.length > 0) {
      const result = checkSymptoms(extractedSymptoms);
      return { message: `Based on the symptoms mentioned, here's my assessment:\n\n**Risk Level:** ${result.riskLevel}\n\n**Possible Conditions:** ${result.possibleConditions.join(', ')}\n\n**Precautions:**\n${result.precautions.map(p => `• ${p}`).join('\n')}\n\n${result.recommendation}\n\n${result.disclaimer}`, type: 'symptom_check', data: result };
    }
    return { message: 'Please describe the patient\'s symptoms in more detail. For example: "fever, cough, headache". I will help assess the condition.', type: 'request_info' };
  }

  if (lowerMsg.includes('emergency') || lowerMsg.includes('sos') || lowerMsg.includes('urgent')) {
    return { message: '🚨 **EMERGENCY CONTACTS:**\n\n• **Ambulance:** 108\n• **Emergency:** 112\n• **Child Helpline:** 1098\n• **Women Helpline:** 181\n• **ASHA Helpline:** 104\n\nPlease call 108 for immediate medical emergency assistance.', type: 'emergency' };
  }

  if (lowerMsg.includes('medicine') || lowerMsg.includes('drug') || lowerMsg.includes('tablet')) {
    return { message: '💊 For medicine-related guidance, please consult a registered doctor or pharmacist. Self-medication can be dangerous. Use the Medicine Inventory section to track your stock levels and expiry dates.', type: 'medicine_info' };
  }

  if (lowerMsg.includes('malaria') || lowerMsg.includes('dengue') || lowerMsg.includes('typhoid')) {
    const disease = lowerMsg.includes('malaria') ? 'malaria' : lowerMsg.includes('dengue') ? 'dengue' : 'typhoid';
    const data = diseaseDatabase[disease];
    return { message: `**${disease.charAt(0).toUpperCase() + disease.slice(1)} Information:**\n\nCommon symptoms: ${data.symptoms.join(', ')}\n\n**Recommended Action:** ${data.action}\n\n${diseaseDatabase.default.action}`, type: 'disease_info' };
  }

  return { message: 'I can help you with:\n• 🩺 **Symptom checking** - Describe symptoms to get guidance\n• 🔬 **Disease information** - Ask about specific diseases\n• 🚨 **Emergency contacts** - Type "emergency" for contacts\n• 💊 **Medicine reminders** - Manage through the Medicines section\n\nPlease describe the patient\'s condition or ask a health question.', type: 'help' };
};

/**
 * AI Prescription Generator
 */
const generateAIPrescription = ({ patientName, patientAge, patientGender, symptoms = [], diagnosis = '' }) => {
  const lowerSymptoms = symptoms.map(s => s.toLowerCase().trim());
  const medicines = [];
  const precautions = new Set();

  if (lowerSymptoms.some(s => s.includes('fever'))) {
    medicines.push({ name: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'Three times a day (TID) after food', duration: '3-5 days', instructions: 'Take with plenty of water. Do not exceed 4 tablets in 24 hours.' });
    precautions.add('Rest adequately and stay well hydrated.');
    precautions.add('Monitor body temperature every 4 hours.');
  }

  if (lowerSymptoms.some(s => s.includes('cough') || s.includes('cold'))) {
    medicines.push({ name: 'Amoxicillin 250mg / Cetirizine 10mg', dosage: '1 tablet', frequency: 'Twice daily (BID)', duration: '5 days', instructions: 'Complete full course if antibiotic prescribed by MO.' });
    medicines.push({ name: 'Cough Syrup (Kufma/Benadryl)', dosage: '10 ml', frequency: 'Three times daily', duration: '5 days', instructions: 'Take warm water after intake.' });
    precautions.add('Steam inhalation twice daily.');
    precautions.add('Avoid cold items, ice water, and dust exposure.');
  }

  if (lowerSymptoms.some(s => s.includes('pain') || s.includes('headache') || s.includes('bodyache'))) {
    medicines.push({ name: 'Ibuprofen 400mg / Paracetamol', dosage: '1 tablet', frequency: 'As needed (max 3 times/day)', duration: '3 days', instructions: 'Always take after meals to protect stomach lining.' });
  }

  if (lowerSymptoms.some(s => s.includes('diarrhea') || s.includes('vomiting'))) {
    medicines.push({ name: 'ORS (Oral Rehydration Salts)', dosage: '1 sachet in 1 Litre water', frequency: 'Sip continuously throughout the day', duration: 'Until recovery', instructions: 'Use clean boiled and cooled water only.' });
    medicines.push({ name: 'Zinc Tablets 20mg', dosage: '1 tablet', frequency: 'Once daily (OD)', duration: '14 days', instructions: 'Essential for pediatric and adult gut recovery.' });
    precautions.add('Maintain strict hand hygiene and sanitary food practices.');
  }

  if (lowerSymptoms.some(s => s.includes('anaemia') || s.includes('fatigue') || s.includes('weakness'))) {
    medicines.push({ name: 'Iron & Folic Acid (IFA) Tablet', dosage: '1 tablet', frequency: 'Once daily after dinner', duration: '90 days', instructions: 'Do not take with tea or milk. Take with citrus fruit/lemon water.' });
    precautions.add('Include green leafy vegetables, jaggery, and pulses in daily diet.');
  }

  if (medicines.length === 0) {
    medicines.push({ name: 'Multivitamin & Mineral Supplement', dosage: '1 tablet', frequency: 'Once daily after breakfast', duration: '15 days', instructions: 'General health support.' });
    medicines.push({ name: 'Paracetamol 500mg (SOS)', dosage: '1 tablet', frequency: 'Only if fever/pain occurs', duration: 'As needed', instructions: 'For symptomatic relief.' });
  }

  return {
    prescriptionId: `NALAM-RX-${Math.floor(100000 + Math.random() * 900000)}`,
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    patientInfo: {
      name: patientName || 'Patient',
      age: patientAge ? `${patientAge} Yrs` : 'N/A',
      gender: patientGender || 'N/A',
    },
    symptomsProvided: symptoms,
    workingDiagnosis: diagnosis || (symptoms.length > 0 ? `Acute Symptomatic Condition (${symptoms.join(', ')})` : 'General Health Review'),
    recommendedMedicines: medicines,
    precautions: [...precautions, 'Consult nearest PHC/Doctor immediately if symptoms worsen or alarm signs appear.'],
    dietaryAdvice: 'Hydrating light diet (Khichdi, warm soups, ORS, fresh fruits). Avoid oily and spicy foods.',
    doctorNotes: 'Prescription generated via NALAM AI Clinical Decision Support. ASHA worker to review patient adherence in 48 hours.',
    disclaimer: '⚕️ DISCLAIMER: This AI-generated prescription is for primary healthcare guidance by ASHA workers. Official dispensing requires doctor validation.'
  };
};

module.exports = { checkSymptoms, predictDisease, analyzeReport, generateChatResponse, generateAIPrescription };

