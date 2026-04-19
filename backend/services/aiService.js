const Groq = require('groq-sdk');

function getClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in environment variables');
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

async function callGroq(prompt) {
  const groq = getClient();
  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
  });
  return completion.choices[0].message.content;
}

function extractJSON(rawText) {
  const text = rawText
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON object found in response');
  return JSON.parse(match[0]);
}

async function parseRFPFromText(rawInput) {
  console.log('[AI] parseRFPFromText called');
  const prompt = `You are an RFP data extractor.
Given a natural language procurement request, extract structured data.

Return ONLY valid JSON with this exact shape:
{
  "title": "short descriptive title",
  "requirements": {
    "items": ["array of items needed"],
    "budget": number_in_usd_or_null,
    "deadline": "ISO date string or null",
    "paymentTerms": "string or null",
    "warranty": "string or null",
    "quantity": number_or_null,
    "additionalNotes": "anything else mentioned"
  }
}

User input: ${rawInput}`;

  try {
    const text = await callGroq(prompt);
    console.log('[AI] Raw response:', text.substring(0, 300));
    const parsed = extractJSON(text);
    console.log('[AI] Parsed successfully:', JSON.stringify(parsed).substring(0, 200));
    return parsed;
  } catch (err) {
    console.error('[AI] parseRFPFromText error:', err.message);
    throw err;
  }
}

async function parseVendorProposal(emailBody) {
  console.log('[AI] parseVendorProposal called');
  const prompt = `You are a procurement proposal parser.
Extract structured data from this vendor email response to an RFP.

Return ONLY valid JSON with this exact shape:
{
  "totalPrice": number or null,
  "unitPrices": [
    { "item": "item name", "price": number }
  ],
  "deliveryDays": number or null,
  "paymentTerms": "string or null",
  "warranty": "string or null",
  "additionalTerms": "any other terms or conditions",
  "confidence": 0.0 to 1.0
}

If a value is not mentioned, use null.
confidence = how complete and clear the response is (1.0 = very clear, 0.0 = vague).

Vendor email:
---
${emailBody}
---`;

  try {
    const text = await callGroq(prompt);
    console.log('[AI] Raw proposal response:', text.substring(0, 300));
    return extractJSON(text);
  } catch (err) {
    console.error('[AI] parseVendorProposal error:', err.message);
    throw err;
  }
}

async function scoreProposals(rfp, proposals) {
  console.log('[AI] scoreProposals called for', proposals.length, 'proposals');
  const proposalsData = proposals.map(p => ({
    proposalId: p._id.toString(),
    vendorName: p.vendorId?.name || 'Unknown',
    totalPrice: p.parsedData?.totalPrice,
    deliveryDays: p.parsedData?.deliveryDays,
    paymentTerms: p.parsedData?.paymentTerms,
    warranty: p.parsedData?.warranty,
    additionalTerms: p.parsedData?.additionalTerms,
    confidence: p.parsedData?.confidence,
  }));

  const prompt = `You are a procurement evaluation expert.

RFP Requirements:
- Budget: $${rfp.requirements.budget}
- Required delivery by: ${rfp.requirements.deadline}
- Payment terms requested: ${rfp.requirements.paymentTerms}
- Warranty required: ${rfp.requirements.warranty}

Vendor proposals to score:
${JSON.stringify(proposalsData, null, 2)}

Score EACH proposal on a 0-100 scale across:
- priceScore: how well it fits the budget (lower price = higher score)
- deliveryScore: how well it meets the deadline
- completenessScore: how complete and professional the response is

Also produce an "overall" (weighted average: price 40%, delivery 35%, completeness 25%)
and a short "reasoning" sentence for each.

Then produce a top-level recommendation:
- vendorId of the best choice
- summary: 2-3 sentence explanation
- tradeoffs: 1 sentence about runner-up

Return ONLY valid JSON:
{
  "scores": [
    { "proposalId": "...", "overall": 87, "priceScore": 90, "deliveryScore": 85, "completenessScore": 88, "reasoning": "..." }
  ],
  "recommendation": {
    "vendorId": "...",
    "vendorName": "...",
    "summary": "...",
    "tradeoffs": "..."
  }
}`;

  try {
    const text = await callGroq(prompt);
    console.log('[AI] Raw scoring response:', text.substring(0, 300));
    return extractJSON(text);
  } catch (err) {
    console.error('[AI] scoreProposals error:', err.message);
    throw err;
  }
}

module.exports = { parseRFPFromText, parseVendorProposal, scoreProposals };
