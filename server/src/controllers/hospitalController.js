// Mock hospital data
const hospitals = [
  { id: 1, name: 'Krishnagiri Government Hospital', distance: '2.3 km', phone: '04343-276011', type: 'Government', services: ['Emergency', 'OPD', 'Surgery', 'ICU', 'Lab', 'Radiology'], beds: 300, lat: 12.5266, lng: 78.2136, address: 'Main Road, Krishnagiri - 635001' },
  { id: 2, name: 'PHC Mathur', distance: '0.8 km', phone: '04343-256789', type: 'PHC', services: ['OPD', 'Maternal Care', 'Immunization', 'Lab'], beds: 30, lat: 12.4891, lng: 78.1987, address: 'Mathur Village, Krishnagiri' },
  { id: 3, name: 'Dharmapuri District Hospital', distance: '15 km', phone: '04342-268100', type: 'Government', services: ['Emergency', 'OPD', 'Surgery', 'ICU', 'Blood Bank', 'NICU'], beds: 400, lat: 12.1278, lng: 78.1578, address: 'Hospital Road, Dharmapuri - 636701' },
  { id: 4, name: 'PHC Veppanapalli', distance: '5.1 km', phone: '04343-289012', type: 'PHC', services: ['OPD', 'Immunization', 'Family Planning'], beds: 20, lat: 12.5698, lng: 78.2987, address: 'Veppanapalli, Krishnagiri District' },
  { id: 5, name: 'Hosur Government Hospital', distance: '22 km', phone: '04344-242011', type: 'Government', services: ['Emergency', 'OPD', 'Surgery', 'ICU', 'Lab'], beds: 200, lat: 12.7409, lng: 77.8253, address: 'Hosur - Bangalore Road, Hosur - 635109' },
  { id: 6, name: 'Community Health Centre Bargur', distance: '12 km', phone: '04343-265432', type: 'CHC', services: ['OPD', 'Surgery', 'Maternal Care', 'Lab', 'X-Ray'], beds: 100, lat: 12.4632, lng: 78.2541, address: 'Bargur Town, Krishnagiri District' },
];

const getHospitals = (req, res) => {
  const { type, search } = req.query;
  let result = [...hospitals];

  if (type) result = result.filter(h => h.type.toLowerCase() === type.toLowerCase());
  if (search) result = result.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.address.toLowerCase().includes(search.toLowerCase())
  );

  // Sort by distance
  result.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

  res.json({ success: true, count: result.length, data: result });
};

const getHospital = (req, res) => {
  const hospital = hospitals.find(h => h.id === parseInt(req.params.id));
  if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });
  res.json({ success: true, data: hospital });
};

module.exports = { getHospitals, getHospital };
