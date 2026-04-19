const express = require('express');
const router = express.Router();
const Proposal = require('../models/Proposal');
const RFP = require('../models/RFP');
const Vendor = require('../models/Vendor');
const { pollInbox } = require('../services/emailService');
const { parseVendorProposal } = require('../services/aiService');

// POST /api/proposals/simulate-reply
router.post('/simulate-reply', async (req, res) => {
  try {
    const { rfpId, vendorId } = req.body;
    if (!rfpId || !vendorId) {
      return res.status(400).json({ success: false, error: 'Missing fields', message: 'rfpId and vendorId are required' });
    }

    const [rfp, vendor] = await Promise.all([
      RFP.findById(rfpId),
      Vendor.findById(vendorId),
    ]);
    if (!rfp) return res.status(404).json({ success: false, error: 'Not found', message: 'RFP not found' });
    if (!vendor) return res.status(404).json({ success: false, error: 'Not found', message: 'Vendor not found' });

    const totalPrice = Math.floor(Math.random() * 30000) + 20000;
    const deliveryDays = Math.floor(Math.random() * 20) + 10;
    const paymentOptions = ['Net 30', 'Net 45', '50% upfront, 50% on delivery'];
    const warrantyOptions = ['1 year', '2 years', '18 months'];
    const paymentTerms = paymentOptions[Math.floor(Math.random() * paymentOptions.length)];
    const warranty = warrantyOptions[Math.floor(Math.random() * warrantyOptions.length)];

    const items = rfp.requirements?.items || ['requested items'];
    const unitPrice = Math.floor(totalPrice / items.length);
    const itemLines = items.map(item => `  - ${item}: $${unitPrice.toLocaleString()}`).join('\n');

    const emailBody = `Dear Procurement Team,

Thank you for the Request for Proposal regarding "${rfp.title}".

We are pleased to submit our competitive proposal:

PRICING BREAKDOWN:
${itemLines}

Total Quoted Price: $${totalPrice.toLocaleString()}

DELIVERY: We guarantee delivery within ${deliveryDays} business days of purchase order confirmation.

PAYMENT TERMS: ${paymentTerms}

WARRANTY: All supplied items carry a ${warranty} manufacturer warranty covering parts and labor.

We are confident in our ability to meet your requirements on time and within budget.

Best regards,
${vendor.contactPerson || vendor.name}
${vendor.name}
${vendor.email}`;

    const parsedData = await parseVendorProposal(emailBody);

    const proposal = new Proposal({
      rfpId,
      vendorId,
      rawEmail: {
        subject: `Re: Request for Proposal — ${rfp.title}`,
        body: emailBody,
        receivedAt: new Date(),
      },
      parsedData,
      status: 'parsed',
    });
    await proposal.save();

    if (rfp.status === 'sent') {
      await RFP.findByIdAndUpdate(rfpId, { status: 'receiving' });
    }

    const populated = await proposal.populate('vendorId');
    res.status(201).json({ success: true, data: populated, message: `Simulated reply from ${vendor.name} parsed successfully` });
  } catch (err) {
    console.error('[simulate-reply] Error:', err.message);
    res.status(500).json({ success: false, error: err.message, message: 'Failed to simulate vendor reply' });
  }
});

// POST /api/proposals/parse-manual
router.post('/parse-manual', async (req, res) => {
  try {
    const newProposals = await pollInbox();
    const parsed = [];

    for (const proposal of newProposals) {
      try {
        const parsedData = await parseVendorProposal(proposal.rawEmail.body);
        await Proposal.findByIdAndUpdate(proposal._id, { parsedData, status: 'parsed' });
        parsed.push(proposal._id);
      } catch (err) {
        console.error(`[Parse] Failed for proposal ${proposal._id}:`, err.message);
      }
    }

    res.json({
      success: true,
      data: { found: newProposals.length, parsed: parsed.length, proposals: newProposals },
      message: `Found ${newProposals.length} new proposals, parsed ${parsed.length}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, message: 'Failed to check inbox' });
  }
});

// GET /api/proposals
router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.rfpId) query.rfpId = req.query.rfpId;
    const proposals = await Proposal.find(query).populate('vendorId').sort({ createdAt: -1 });
    res.json({ success: true, data: proposals, message: 'Proposals fetched' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, message: 'Failed to fetch proposals' });
  }
});

// GET /api/proposals/:id
router.get('/:id', async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate('vendorId').populate('rfpId');
    if (!proposal) return res.status(404).json({ success: false, error: 'Not found', message: 'Proposal not found' });
    res.json({ success: true, data: proposal, message: 'Proposal fetched' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, message: 'Failed to fetch proposal' });
  }
});

module.exports = router;
