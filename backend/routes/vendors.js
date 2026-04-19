const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');

// GET /api/vendors
router.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.find({ deleted: false }).sort({ createdAt: -1 });
    res.json({ success: true, data: vendors, message: 'Vendors fetched' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, message: 'Failed to fetch vendors' });
  }
});

// POST /api/vendors
router.post('/', async (req, res) => {
  try {
    const { name, email, contactPerson, phone, category } = req.body;
    if (!name || name.length < 2) {
      return res.status(400).json({ success: false, error: 'Validation', message: 'Vendor name is required (min 2 characters)' });
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ success: false, error: 'Validation', message: 'Valid email is required' });
    }
    const vendor = new Vendor({ name, email, contactPerson, phone, category: category || [] });
    await vendor.save();
    res.status(201).json({ success: true, data: vendor, message: 'Vendor created' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, message: 'Failed to create vendor' });
  }
});

// GET /api/vendors/:id
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor || vendor.deleted) {
      return res.status(404).json({ success: false, error: 'Not found', message: 'Vendor not found' });
    }
    res.json({ success: true, data: vendor, message: 'Vendor fetched' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, message: 'Failed to fetch vendor' });
  }
});

// PATCH /api/vendors/:id
router.patch('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vendor) return res.status(404).json({ success: false, error: 'Not found', message: 'Vendor not found' });
    res.json({ success: true, data: vendor, message: 'Vendor updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, message: 'Failed to update vendor' });
  }
});

// DELETE /api/vendors/:id (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, { deleted: true }, { new: true });
    if (!vendor) return res.status(404).json({ success: false, error: 'Not found', message: 'Vendor not found' });
    res.json({ success: true, data: {}, message: 'Vendor deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, message: 'Failed to delete vendor' });
  }
});

module.exports = router;
