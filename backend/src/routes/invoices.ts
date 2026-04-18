import { Router } from 'express';
import prisma from '../prismaClient';

const router = Router();

// Get invoices
router.get('/', async (req, res) => {
  const companyId = (req as any).companyId;
  const invoices = await prisma.invoice.findMany({
    where: { companyId },
    include: { supplier: true, payments: true }
  });

  // Calculate alert risk (in memory, though can be DB driven)
  const now = new Date();
  const enhancedInvoices = invoices.map(inv => {
    let alert = 'NONE';
    const daysUntilDue = Math.ceil((inv.dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    if (inv.status !== 'PAID') {
      if (daysUntilDue < 0) alert = 'OVERDUE';
      else if (daysUntilDue <= 3) alert = 'AT_RISK';
      else alert = 'IN_PROGRESS';
    }

    return { ...inv, alert, daysUntilDue };
  });

  res.json(enhancedInvoices);
});

// Create Invoice
router.post('/', async (req, res) => {
  const companyId = (req as any).companyId;
  const { supplierId, number, date, amount, termsDays } = req.body;

  try {
    const issueDate = new Date(date);
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + (parseInt(termsDays) || 30));

    const invoice = await prisma.invoice.create({
      data: {
        companyId,
        supplierId,
        number,
        date: issueDate,
        dueDate,
        amount: parseFloat(amount),
        status: 'PENDING'
      }
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

export default router;
