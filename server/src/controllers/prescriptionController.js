const Prescription = require('../models/Prescription');
const Medicine = require('../models/Medicine');
const Patient = require('../models/Patient');
const { extractTextFromFile } = require('../services/ocrService');

const getPrescriptions = async (req, res, next) => {
  try {
    const { patientId } = req.query;
    const query = { ashaWorker: req.user._id };
    if (patientId) query.patient = patientId;
    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name age village')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (error) {
    next(error);
  }
};

const getPrescription = async (req, res, next) => {
  try {
    const p = await Prescription.findById(req.params.id).populate('patient', 'name age gender');
    if (!p) return res.status(404).json({ success: false, message: 'Prescription not found' });
    res.json({ success: true, data: p });
  } catch (error) {
    next(error);
  }
};

const createPrescription = async (req, res, next) => {
  try {
    const { patient, doctorName, hospitalName, prescriptionDate, notes, extractedMedicines } = req.body;
    let fileUrl = null;
    let fileName = null;
    let ocrText = '';

    if (req.file) {
      fileUrl = `/uploads/prescriptions/${req.file.filename}`;
      fileName = req.file.originalname;
      try {
        ocrText = await extractTextFromFile(req.file.path);
      } catch (err) {
        console.error('OCR error:', err.message);
        ocrText = 'OCR processing failed';
      }
    }

    const prescription = await Prescription.create({
      patient,
      ashaWorker: req.user._id,
      doctorName,
      hospitalName,
      prescriptionDate,
      notes,
      extractedMedicines: extractedMedicines || [],
      fileUrl,
      fileName,
      ocrText,
    });

    // ==================== SEND TWILIO WHATSAPP NOTIFICATION ====================
    try {
      const patientObj = await Patient.findById(patient);
      if (patientObj && patientObj.phone) {
        const { sendPrescriptionNotification } = require('../services/twilioService');
        sendPrescriptionNotification(patientObj, prescription).catch(err => {
          console.error('⚠️ Twilio Notification background failure:', err.message);
        });
      }
    } catch (twilioErr) {
      console.error('⚠️ Twilio Notification Error (non-blocking):', twilioErr.message);
    }

    // ==================== AUTOMATIC STOCK DEDUCTION IN DATABASE ====================
    if (extractedMedicines && Array.isArray(extractedMedicines) && extractedMedicines.length > 0) {
      for (const item of extractedMedicines) {
        try {
          let med = null;
          if (item.medicineId) {
            med = await Medicine.findById(item.medicineId);
          }
          if (!med && item.name) {
            med = await Medicine.findOne({
              name: new RegExp(item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
              ashaWorker: req.user._id
            });
          }

          if (med) {
            // Deduct stock quantity by prescribed dose count (e.g. 10 tablets)
            let deductAmount = 1;
            if (item.quantityDeducted && typeof item.quantityDeducted === 'number') {
              deductAmount = item.quantityDeducted;
            } else if (item.dosage) {
              const match = String(item.dosage).match(/\d+/);
              if (match) deductAmount = parseInt(match[0], 10);
            }

            med.quantity = Math.max(0, med.quantity - deductAmount);
            await med.save();
            console.log(`📉 Stock reduced by ${deductAmount} for ${med.name}: new quantity is ${med.quantity}`);

            // ==================== n8n LOW STOCK WEBHOOK TRIGGER ====================
            if (med.quantity <= med.lowStockThreshold) {
              try {
                const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://immanuel123.app.n8n.cloud/webhook/low-stock-alert';
                await fetch(webhookUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    medicineName: med.name,
                    availableQuantity: med.quantity,
                    threshold: med.lowStockThreshold,
                    unit: med.unit || 'Tablets',
                    email: process.env.ALERT_EMAIL || 'imman8046@gmail.com'
                  })
                });
                console.log(`📡 n8n Low Stock Webhook triggered for medicine: ${med.name}`);
              } catch (webhookErr) {
                console.error('⚠️ n8n Webhook Error (non-blocking):', webhookErr.message);
              }
            }
          }
        } catch (stockErr) {
          console.error(`⚠️ Failed to update stock for ${item.name}:`, stockErr.message);
        }
      }
    }
    // ==============================================================================

    res.status(201).json({ success: true, message: 'Prescription created and medicine stock reduced', data: prescription });
  } catch (error) {
    next(error);
  }
};

const deletePrescription = async (req, res, next) => {
  try {
    await Prescription.findOneAndDelete({ _id: req.params.id, ashaWorker: req.user._id });
    res.json({ success: true, message: 'Prescription deleted' });
  } catch (error) {
    next(error);
  }
};

const sendPrescriptionWhatsapp = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });

    const patientObj = await Patient.findById(prescription.patient);
    if (!patientObj) return res.status(404).json({ success: false, message: 'Patient not found' });
    if (!patientObj.phone) return res.status(400).json({ success: false, message: 'Patient does not have a registered phone number' });

    const { sendPrescriptionNotification } = require('../services/twilioService');
    const twilioRes = await sendPrescriptionNotification(patientObj, prescription);

    if (twilioRes.success) {
      res.json({ success: true, message: 'WhatsApp notification sent successfully', sid: twilioRes.sid });
    } else {
      res.status(500).json({ success: false, message: twilioRes.error || 'Failed to send WhatsApp notification' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getPrescriptions, getPrescription, createPrescription, deletePrescription, sendPrescriptionWhatsapp };

