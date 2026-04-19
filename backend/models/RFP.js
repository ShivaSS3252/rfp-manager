const mongoose = require('mongoose');

const rfpSchema = new mongoose.Schema(
  {
    title: String,
    rawInput: String,
    requirements: {
      items: [String],
      budget: Number,
      deadline: Date,
      paymentTerms: String,
      warranty: String,
      quantity: Number,
      additionalNotes: String,
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'receiving', 'closed'],
      default: 'draft',
    },
    vendorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('RFP', rfpSchema);
