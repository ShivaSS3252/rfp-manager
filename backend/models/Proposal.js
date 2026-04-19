const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema(
  {
    rfpId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFP', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    rawEmail: {
      subject: String,
      body: String,
      receivedAt: Date,
      attachments: [String],
    },
    parsedData: {
      totalPrice: Number,
      unitPrices: [{ item: String, price: Number }],
      deliveryDays: Number,
      paymentTerms: String,
      warranty: String,
      additionalTerms: String,
      confidence: Number,
    },
    aiScore: {
      overall: Number,
      priceScore: Number,
      deliveryScore: Number,
      completenessScore: Number,
      reasoning: String,
    },
    status: {
      type: String,
      enum: ['pending', 'parsed', 'reviewed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Proposal', proposalSchema);
