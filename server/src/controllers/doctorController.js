// Mock doctor directory data
const doctors = [
  { id: 1, name: 'Dr. Priya Rajan', specialty: 'General Medicine', hospital: 'Krishnagiri Government Hospital', location: 'Krishnagiri', phone: '9876543210', availability: 'Mon-Fri, 9AM-4PM', experience: '12 years' },
  { id: 2, name: 'Dr. Senthil Kumar', specialty: 'Pediatrics', hospital: 'Dharmapuri District Hospital', location: 'Dharmapuri', phone: '9876543211', availability: 'Mon-Sat, 8AM-2PM', experience: '8 years' },
  { id: 3, name: 'Dr. Meena Devi', specialty: 'Gynecology & Obstetrics', hospital: 'PHC Mathur', location: 'Mathur', phone: '9876543212', availability: 'Tue-Sat, 10AM-3PM', experience: '15 years' },
  { id: 4, name: 'Dr. Arun Prakash', specialty: 'Cardiology', hospital: 'Salem Government Hospital', location: 'Salem', phone: '9876543213', availability: 'Mon-Thu, 9AM-1PM', experience: '20 years' },
  { id: 5, name: 'Dr. Lakshmi Priya', specialty: 'Dermatology', hospital: 'PHC Veppanapalli', location: 'Veppanapalli', phone: '9876543214', availability: 'Wed-Fri, 9AM-12PM', experience: '6 years' },
  { id: 6, name: 'Dr. Rajesh Babu', specialty: 'Orthopedics', hospital: 'Krishnagiri Government Hospital', location: 'Krishnagiri', phone: '9876543215', availability: 'Mon-Fri, 2PM-5PM', experience: '10 years' },
  { id: 7, name: 'Dr. Kavitha S.', specialty: 'ENT', hospital: 'Hosur Government Hospital', location: 'Hosur', phone: '9876543216', availability: 'Mon-Sat, 8AM-1PM', experience: '9 years' },
  { id: 8, name: 'Dr. Murugan K.', specialty: 'Ophthalmology', hospital: 'PHC Bargur', location: 'Bargur', phone: '9876543217', availability: 'Tue-Thu, 10AM-2PM', experience: '7 years' },
];

const getDoctors = (req, res) => {
  const { specialty, location, search } = req.query;
  let result = [...doctors];

  if (specialty) result = result.filter(d => d.specialty.toLowerCase().includes(specialty.toLowerCase()));
  if (location) result = result.filter(d => d.location.toLowerCase().includes(location.toLowerCase()));
  if (search) result = result.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase()) ||
    d.hospital.toLowerCase().includes(search.toLowerCase())
  );

  res.json({ success: true, count: result.length, data: result });
};

module.exports = { getDoctors };
