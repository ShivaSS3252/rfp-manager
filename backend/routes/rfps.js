const express = require('express');
const router = express.Router();
const RFP = require('../models/RFP');
const Vendor = require('../models/Vendor');
const Proposal = require('../models/Proposal');
const { parseRFPFromText, scoreProposals } = require('../services/aiService');
const { sendRFPToVendors } = require('../services/emailService');

// POST /api/rfps/parse
router.post('/parse', async (req, res) => {
  try {
    const { rawInput } = req.body;
    if (!rawInput || !rawInput.trim()) {
      return res.status(400).json({ success: false, error: 'Empty input', message: 'Please describe what you want to procure.' });
    }
    const parsed = await parseRFPFromText(rawInput.trim());
    res.json({ success: true, data: parsed, message: 'RFP parsed successfully' });
  } catch (err) {
    console.error('[/parse] Error:', err.message);
    const isQuota = err.message.includes('429') || err.message.toLowerCase().includes('quota');
    const isAuth = err.message.includes('401') || err.message.includes('API_KEY');
    const message = isQuota
      ? 'Gemini API quota exceeded. Please wait a minute and try again, or check your API plan.'
      : isAuth
      ? 'Gemini API key is invalid or not set. Check your .env file.'
      : 'Could not parse your request. Please be more specific.';
    res.status(500).json({ success: false, error: err.message, message });
  }
});

// GET /api/rfps
router.get('/', async (req, res) => {
  try {
    const rfps = await RFP.find().sort({ createdAt: -1 });
    res.json({ success: true, data: rfps, message: 'RFPs fetched successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, message: 'Failed to fetch RFPs' });
  }
});

// POST /api/rfps
router.post('/', async (req, res) => {
  try {
    const { title, rawInput, requirements, status } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Title required', message: 'RFP title is required.' });
    }
    const rfp = new RFP({ title, rawInput, requirements, status: status || 'draft' });
    await rfp.save();
    res.status(201).json({ success: true, data: rfp, message: 'RFP created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, message: 'Failed to save RFP. Please try again.' });
  }
});

// GET /api/rfps/:id/compare
router.get('/:id/compare', async (req, res) => {
  try {
    const rfp = await RFP.findById(req.params.id);
    if (!rfp) return res.status(404).json({ success: false, error: 'Not found', message: 'RFP not found' });

    const proposals = await Proposal.find({
      rfpId: rfp._id,
      status: { $in: ['parsed', 'reviewed'] },
    }).populate('vendorId');

    if (proposals.length < 2) {
      return res.status(400).json({ success: false, error: 'Not enough proposals', message: 'Need at least 2 parsed proposals to compare' });
    }

    // Always call scoreProposals to get recommendation; only save scores if unscored
    const scoring = await scoreProposals(rfp, proposals);
    console.log('[/compare] scoreProposals result:', JSON.stringify(scoring, null, 2));

    const unscored = proposals.filter(p => !p.aiScore?.overall);
    if (unscored.length > 0) {
      for (const score of scoring.scores) {
        await Proposal.findByIdAndUpdate(score.proposalId, {
          aiScore: {
            overall: score.overall,
            priceScore: score.priceScore,
            deliveryScore: score.deliveryScore,
            completenessScore: score.completenessScore,
            reasoning: score.reasoning,
          },
          status: 'reviewed',
        });
      }
    }

    const finalProposals = await Proposal.find({
      rfpId: rfp._id,
      status: { $in: ['parsed', 'reviewed'] },
    }).populate('vendorId');

    const responseData = { rfp, proposals: finalProposals, recommendation: scoring.recommendation };
    console.log('[/compare] Sending response recommendation:', JSON.stringify(scoring.recommendation, null, 2));

    res.json({ success: true, data: responseData, message: 'Comparison ready' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, message: 'Failed to fetch comparison data' });
  }
});

// POST /api/rfps/:id/score
router.post('/:id/score', async (req, res) => {
  try {
    const rfp = await RFP.findById(req.params.id);
    if (!rfp) return res.status(404).json({ success: false, error: 'Not found', message: 'RFP not found' });

    const proposals = await Proposal.find({ rfpId: rfp._id }).populate('vendorId');
    const scoring = await scoreProposals(rfp, proposals);

    for (const score of scoring.scores) {
      await Proposal.findByIdAndUpdate(score.proposalId, {
        aiScore: {
          overall: score.overall,
          priceScore: score.priceScore,
          deliveryScore: score.deliveryScore,
          completenessScore: score.completenessScore,
          reasoning: score.reasoning,
        },
        status: 'reviewed',
      });
    }

    res.json({ success: true, data: scoring, message: 'Proposals scored successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, message: 'Failed to score proposals' });
  }
});

// PATCH /api/rfps/:id/award
router.patch('/:id/award', async (req, res) => {
  try {
    const { vendorId } = req.body;
    const rfp = await RFP.findByIdAndUpdate(
      req.params.id,
      { status: 'closed' },
      { new: true }
    );
    if (!rfp) return res.status(404).json({ success: false, error: 'Not found', message: 'RFP not found' });
    res.json({ success: true, data: rfp, message: 'RFP awarded and closed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, message: 'Failed to award RFP' });
  }
});

// POST /api/rfps/:id/send
router.post('/:id/send', async (req, res) => {
  try {
    const { vendorIds } = req.body;
    if (!vendorIds || vendorIds.length === 0) {
      return res.status(400).json({ success: false, error: 'No vendors selected', message: 'Select at least one vendor' });
    }

    const rfp = await RFP.findById(req.params.id);
    if (!rfp) return res.status(404).json({ success: false, error: 'Not found', message: 'RFP not found' });

    const vendors = await Vendor.find({ _id: { $in: vendorIds }, deleted: false });
    const rawResults = await sendRFPToVendors(rfp, vendors);

    const vendorByEmail = Object.fromEntries(vendors.map(v => [v.email, v]));
    const results = rawResults.map(r => ({
      ...r,
      vendorName: vendorByEmail[r.vendorEmail]?.name || r.vendorEmail,
    }));

    console.log('[/send] Full results:', JSON.stringify(results, null, 2));

    const sent = results.filter(r => r.success).map(r => ({
      email: r.vendorEmail,
      vendorName: r.vendorName,
      previewUrl: r.previewUrl,
    }));
    const failed = results.filter(r => !r.success).map(r => ({
      email: r.vendorEmail,
      vendorName: r.vendorName,
      error: r.error,
    }));

    await RFP.findByIdAndUpdate(req.params.id, {
      status: 'sent',
      $addToSet: { vendorIds: { $each: vendorIds } },
    });

    res.json({
      success: true,
      data: { sent, failed },
      message: `RFP sent to ${sent.length} vendor${sent.length !== 1 ? 's' : ''}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, message: 'Failed to send RFP emails' });
  }
});

// GET /api/rfps/:id
router.get('/:id', async (req, res) => {
  try {
    const rfp = await RFP.findById(req.params.id).populate('vendorIds');
    if (!rfp) return res.status(404).json({ success: false, error: 'Not found', message: 'RFP not found' });
    res.json({ success: true, data: rfp, message: 'RFP fetched successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, message: 'Failed to fetch RFP' });
  }
});

// PATCH /api/rfps/:id
router.patch('/:id', async (req, res) => {
  try {
    const rfp = await RFP.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!rfp) return res.status(404).json({ success: false, error: 'Not found', message: 'RFP not found' });
    res.json({ success: true, data: rfp, message: 'RFP updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, message: 'Failed to update RFP' });
  }
});

// DELETE /api/rfps/:id
router.delete('/:id', async (req, res) => {
  try {
    await RFP.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: {}, message: 'RFP deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, message: 'Failed to delete RFP' });
  }
});

module.exports = router;
