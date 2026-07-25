const multer = require('multer');

// Use memoryStorage for serverless environments (Vercel, AWS Lambda, Docker)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  cb(null, true); // Allow all report formats to prevent upload rejections
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

module.exports = upload;
