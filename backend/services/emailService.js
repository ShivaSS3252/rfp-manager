const nodemailer = require('nodemailer');
const RFP = require('../models/RFP');
const Vendor = require('../models/Vendor');
const Proposal = require('../models/Proposal');

let _transporter = null;

async function getTransporter() {
  if (_transporter) return _transporter;
  const testAccount = await nodemailer.createTestAccount();
  console.log('[Email] Ethereal account:', testAccount.user);
  _transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  return _transporter;
}

function formatRFPEmail(rfp, vendor) {
  const recipientName = vendor.contactPerson || vendor.name;
  const items = (rfp.requirements.items || []).map(item => `  • ${item}`).join('\n');
  const deadline = rfp.requirements.deadline
    ? new Date(rfp.requirements.deadline).toLocaleDateString()
    : 'TBD';
  const budget = rfp.requirements.budget
    ? `$${rfp.requirements.budget.toLocaleString()}`
    : 'TBD';

  const text = `Dear ${recipientName},

We are seeking proposals for the following procurement:

PROJECT: ${rfp.title}
DEADLINE: ${deadline}
BUDGET: ${budget}

ITEMS REQUIRED:
${items}

TERMS:
- Payment: ${rfp.requirements.paymentTerms || 'TBD'}
- Warranty: ${rfp.requirements.warranty || 'TBD'}

${rfp.requirements.additionalNotes ? rfp.requirements.additionalNotes + '\n\n' : ''}Please reply to this email with your detailed proposal including:
- Itemized pricing
- Delivery timeline
- Payment terms
- Any applicable warranties or guarantees

Deadline for submissions: ${deadline}

Best regards,
Procurement Team`;

  const html = `
<p>Dear ${recipientName},</p>
<p>We are seeking proposals for the following procurement:</p>
<table style="border-collapse:collapse;margin-bottom:16px">
  <tr><td style="padding:4px 12px 4px 0;font-weight:bold">PROJECT:</td><td>${rfp.title}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;font-weight:bold">DEADLINE:</td><td>${deadline}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;font-weight:bold">BUDGET:</td><td>${budget}</td></tr>
</table>
<p><strong>ITEMS REQUIRED:</strong></p>
<ul>${(rfp.requirements.items || []).map(item => `<li>${item}</li>`).join('')}</ul>
<p><strong>TERMS:</strong></p>
<ul>
  <li>Payment: ${rfp.requirements.paymentTerms || 'TBD'}</li>
  <li>Warranty: ${rfp.requirements.warranty || 'TBD'}</li>
</ul>
${rfp.requirements.additionalNotes ? `<p>${rfp.requirements.additionalNotes}</p>` : ''}
<p>Please reply to this email with your detailed proposal including:</p>
<ul>
  <li>Itemized pricing</li>
  <li>Delivery timeline</li>
  <li>Payment terms</li>
  <li>Any applicable warranties or guarantees</li>
</ul>
<p>Deadline for submissions: ${deadline}</p>
<p>Best regards,<br>Procurement Team</p>`;

  return { subject: `Request for Proposal — ${rfp.title}`, text, html };
}

async function sendRFPEmail(rfp, vendor) {
  try {
    const transporter = await getTransporter();
    const { subject, text, html } = formatRFPEmail(rfp, vendor);
    const info = await transporter.sendMail({
      from: '"RFP Manager" <rfp@manager.com>',
      to: vendor.email,
      subject,
      text,
      html,
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('[Email] Sent to', vendor.email, '— preview:', previewUrl);
    return { success: true, vendorEmail: vendor.email, previewUrl };
  } catch (err) {
    console.error('[Email] Send failed for', vendor.email, ':', err.message);
    return { success: false, vendorEmail: vendor.email, error: err.message };
  }
}

async function sendRFPToVendors(rfp, vendors) {
  return Promise.all(vendors.map(vendor => sendRFPEmail(rfp, vendor)));
}

async function matchEmailToRFP(subject) {
  const rfps = await RFP.find({ status: { $in: ['sent', 'receiving'] } });
  for (const rfp of rfps) {
    if (subject.toLowerCase().includes(rfp.title.toLowerCase())) return rfp;
  }
  return null;
}

async function matchEmailToVendor(fromEmail) {
  return Vendor.findOne({ email: fromEmail, deleted: false });
}

async function saveIncomingProposal(rfpId, vendorId, rawEmail) {
  const proposal = new Proposal({ rfpId, vendorId, rawEmail, status: 'pending' });
  return proposal.save();
}

async function pollInbox() {
  console.log('[IMAP] Poll skipped — using Ethereal (no real inbox)');
  return [];
}

module.exports = {
  getTransporter,
  formatRFPEmail,
  sendRFPEmail,
  sendRFPToVendors,
  pollInbox,
  matchEmailToRFP,
  matchEmailToVendor,
  saveIncomingProposal,
};
