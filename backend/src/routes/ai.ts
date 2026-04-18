import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import prisma from '../prismaClient';

const router = Router();

// Intialize anthropic with api key from environment
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an AI assistant for a financial management application.

Your role: Understand user queries in Arabic, Darija, French, or English
Convert them into structured JSON for backend processing

STRICT RULES:
Only return valid JSON
No explanations
No text outside JSON

Supported actions:
search_invoices
get_summary
get_clients
get_alerts

Filters:
status: paid | unpaid
amount_gt: number
amount_lt: number
month: YYYY-MM
date_from: YYYY-MM-DD
date_to: YYYY-MM-DD
client_name: string

If unclear:
{ "action": "unknown" }
`;

router.post('/ai-query', async (req, res) => {
  const companyId = (req as any).companyId;
  const { query } = req.body;

  if (!query) return res.status(400).json({ error: 'Query string is required' });

  try {
    const rawResponse = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: query }
      ]
    });

    let jsonString = '';
    
    if (rawResponse.content[0].type === 'text') {
      jsonString = rawResponse.content[0].text;
    }

    let parsedRequest;
    try {
      parsedRequest = JSON.parse(jsonString);
    } catch (parseError) {
      // Best effort JSON extraction if formatting fails strictly
      const match = jsonString.match(/\{[\s\S]*\}/);
      if (match) {
        parsedRequest = JSON.parse(match[0]);
      } else {
        return res.json({ action: "unknown", message: "Failed to parse JSON" });
      }
    }

    const { action, filters = {} } = parsedRequest;
    let sqlResults = [];
    let summaryText = '';

    // Advanced dynamic Prisma Filter building based on JSON constraints
    if (action === 'search_invoices') {
      const whereClause: any = { companyId };
      
      if (filters.status === 'unpaid') whereClause.status = 'PENDING';
      if (filters.status === 'paid') whereClause.status = 'PAID';
      
      if (filters.amount_gt) whereClause.amount = { ...whereClause.amount, gt: Number(filters.amount_gt) };
      if (filters.amount_lt) whereClause.amount = { ...whereClause.amount, lt: Number(filters.amount_lt) };
      
      if (filters.month) {
        if (filters.month === 'CURRENT_MONTH') {
           const now = new Date();
           const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
           whereClause.date = { gte: firstDay };
        } else {
           const [y, m] = filters.month.split('-');
           const start = new Date(parseInt(y), parseInt(m) - 1, 1);
           const end = new Date(parseInt(y), parseInt(m), 1);
           whereClause.date = { gte: start, lt: end };
        }
      }
      
      if (filters.date_from) whereClause.date = { ...whereClause.date, gte: new Date(filters.date_from) };
      if (filters.date_to) whereClause.date = { ...whereClause.date, lte: new Date(filters.date_to) };

      if (filters.client_name) {
        whereClause.supplier = { name: { contains: filters.client_name } };
      }

      sqlResults = await prisma.invoice.findMany({
        where: whereClause,
        include: { supplier: true }
      });
      summaryText = `Found ${sqlResults.length} invoices matching criteria.`;

    } else if (action === 'get_clients') {
       const whereClause: any = { companyId, type: 'CLIENT' };
       if (filters.client_name) {
           whereClause.name = { contains: filters.client_name };
       }
       sqlResults = await prisma.contact.findMany({ where: whereClause });
       summaryText = `Found ${sqlResults.length} clients relative to query.`;
       
    } else if (action === 'get_summary') {
      // Summary KPIs
      const allChecks = await prisma.check.findMany({ where: { companyId } });
      const totalReceipts = allChecks.filter(c => c.type === 'INCOMING' && c.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0);
      const totalDisbursed = allChecks.filter(c => c.type === 'OUTGOING' && c.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0);
      summaryText = `Résumé du mois: Recettes: ${totalReceipts} MAD | Dépenses: ${totalDisbursed} MAD | Solde: ${totalReceipts - totalDisbursed} MAD`;
    } else if (action === 'get_alerts') {
       const now = new Date();
       const alertThreshold = new Date();
       alertThreshold.setDate(now.getDate() + 3);
       
       sqlResults = await prisma.check.findMany({ 
         where: { companyId, status: 'PENDING', dueDate: { lte: alertThreshold } },
         include: { bank: true }
       });
       summaryText = `Attention: ${sqlResults.length} chèques critiques nécessitent une action (proches de l'échéance ou en retard).`;
    } else {
       summaryText = "Je n'ai pas compris votre demande. Pouvez-vous reformuler ?";
    }

    res.json({
      parsedAction: action,
      filtersUsed: filters,
      summary: summaryText,
      data: sqlResults
    });

  } catch (err: any) {
    console.error("AI Logic Error", err);
    res.status(500).json({ error: 'AI processing failed', details: err.message });
  }
});

export default router;
