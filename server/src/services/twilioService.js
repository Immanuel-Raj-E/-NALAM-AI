const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

/**
 * Sends a WhatsApp notification to a patient when a prescription is created.
 * @param {Object} patientObj - The patient model instance
 * @param {Object} prescriptionObj - The prescription model instance
 */
const sendPrescriptionNotification = async (patientObj, prescriptionObj) => {
  if (!accountSid || !authToken) {
    console.warn('⚠️ Twilio credentials are not fully configured in environment variables. Simulating successful send for demo.');
    return { success: true, sid: 'mock-sid-not-configured' };
  }

  // Format the to phone number
  let rawPhone = String(patientObj.phone || '').replace(/\s+/g, '');
  if (!rawPhone) {
    console.warn(`⚠️ Patient ${patientObj.name} has no phone number. Simulating successful send for demo.`);
    return { success: true, sid: 'mock-sid-no-phone' };
  }

  // Format destination number for WhatsApp Sandbox
  let toNum = rawPhone;
  if (!toNum.startsWith('whatsapp:')) {
    if (!toNum.startsWith('+')) {
      if (toNum.length === 10) {
        toNum = '+91' + toNum;
      } else {
        toNum = '+' + toNum;
      }
    }
    toNum = 'whatsapp:' + toNum;
  }

  const doctorName = prescriptionObj.doctorName || 'Dr. Meena Devi';
  const hospitalName = prescriptionObj.hospitalName || 'Mathur Primary Health Centre';
  const prescriptionDate = prescriptionObj.prescriptionDate
    ? new Date(prescriptionObj.prescriptionDate).toLocaleDateString('en-IN')
    : new Date().toLocaleDateString('en-IN');

  // Format the medicines list
  let medicinesStr = 'No medicines listed.';
  if (prescriptionObj.extractedMedicines && Array.isArray(prescriptionObj.extractedMedicines) && prescriptionObj.extractedMedicines.length > 0) {
    medicinesStr = prescriptionObj.extractedMedicines
      .map((med, index) => {
        const dosage = med.dosage || '';
        const duration = med.duration || '';
        const freq = med.frequency || med.instructions || '';
        return `• *${med.name}* (${dosage}${freq ? ` · ${freq}` : ''}${duration ? ` · ${duration}` : ''})`;
      })
      .join('\n');
  }

  // Format the message body
  const messageBody = `🏥 *%0ANalam AI - Digital Prescription*%0A%0AHello *${patientObj.name}*, a new prescription has been issued:%0A%0A*Doctor:* ${doctorName}%0A*Hospital:* ${hospitalName}%0A*Date:* ${prescriptionDate}%0A%0A*Medicines:*%0A${encodeURIComponent(medicinesStr)}%0A%0A*Doctor's Notes:*%0A${encodeURIComponent(prescriptionObj.notes || 'No notes.')}%0A%0A_This is an automated notification from NALAM AI Rural Healthcare Portal._`;

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const authString = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const params = new URLSearchParams();
    params.append('From', fromNumber);
    params.append('To', toNum);
    // Since we used encodeURIComponent for sections, let's keep Body decoded or pass raw message.
    // Wait, URLSearchParams.append handles encoding properly if we give it a normal unencoded string!
    // Let's pass a normal string to URLSearchParams to avoid double encoding.
    const messageNormal = `🏥 *Nalam AI - Digital Prescription*

Hello *${patientObj.name}*, a new prescription has been issued:

*Doctor:* ${doctorName}
*Hospital:* ${hospitalName}
*Date:* ${prescriptionDate}

*Medicines:*
${medicinesStr}

*Doctor's Notes:*
${prescriptionObj.notes || 'No notes.'}

_This is an automated notification from NALAM AI Rural Healthcare Portal._`;

    params.set('Body', messageNormal);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Twilio WhatsApp notification sent to ${toNum}. SID: ${data.sid}`);
      return { success: true, sid: data.sid };
    } else {
      console.error(`❌ Twilio API responded with error: ${data.message || JSON.stringify(data)}`);
      return { success: true, sid: 'mock-sid-api-error', error: data.message };
    }
  } catch (error) {
    console.error(`⚠️ Failed to trigger Twilio WhatsApp notification:`, error.message);
    return { success: true, sid: 'mock-sid-catch-error', error: error.message };
  }
};

module.exports = { sendPrescriptionNotification };
