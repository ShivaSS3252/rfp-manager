require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');

const rfpRoutes = require('./routes/rfps');
const vendorRoutes = require('./routes/vendors');
const proposalRoutes = require('./routes/proposals');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', groqKeySet: !!process.env.GROQ_API_KEY });
});

// Test route to verify Groq AI connection
app.get('/api/test-ai', async (req, res) => {
  try {
    const Groq = require('groq-sdk');
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ success: false, error: 'GROQ_API_KEY not set' });
    }
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say hello in exactly 5 words.' }],
      model: 'llama-3.3-70b-versatile',
    });
    const text = completion.choices[0].message.content;
    res.json({ success: true, response: text, model: 'llama-3.3-70b-versatile' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use('/api/rfps', rfpRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/proposals', proposalRoutes);

async function processInbox() {
  const { pollInbox } = require('./services/emailService');
  const { parseVendorProposal } = require('./services/aiService');
  const Proposal = require('./models/Proposal');
  try {
    const newProposals = await pollInbox();
    for (const proposal of newProposals) {
      try {
        const parsedData = await parseVendorProposal(proposal.rawEmail.body);
        await Proposal.findByIdAndUpdate(proposal._id, { parsedData, status: 'parsed' });
      } catch (err) {
        console.error(`[Cron] Parse failed for ${proposal._id}:`, err.message);
      }
    }
    if (newProposals.length > 0) {
      console.log(`[Cron] Processed ${newProposals.length} new proposals`);
    }
  } catch (err) {
    console.error('[Cron] Inbox poll error:', err.message);
  }
}

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rfp-manager')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`GROQ_API_KEY set: ${!!process.env.GROQ_API_KEY}`);
      cron.schedule('*/5 * * * *', processInbox);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
