const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 2 },
    email: { type: String, required: true },
    contactPerson: String,
    phone: String,
    category: [String],
    pastPerformance: [
      {
        rfpId: mongoose.Schema.Types.ObjectId,
        score: Number,
        notes: String,
      },
    ],
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vendor', vendorSchema);
