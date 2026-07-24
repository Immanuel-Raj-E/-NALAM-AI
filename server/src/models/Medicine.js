const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    ashaWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: [true, 'Medicine name is required'], trim: true },
    genericName: { type: String, trim: true },
    category: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, default: 'Tablets' },
    lowStockThreshold: { type: Number, default: 10 },
    expiryDate: { type: Date },
    batchNumber: { type: String, trim: true },
    supplier: { type: String, trim: true },
    isExpired: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Virtual for low stock status
medicineSchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.lowStockThreshold;
});

medicineSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Medicine', medicineSchema);
