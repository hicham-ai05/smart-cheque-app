import { Router } from 'express';
import prisma from '../prismaClient';

const router = Router();

// Get all checks
router.get('/', async (req, res) => {
  const companyId = (req as any).companyId;
  const checks = await prisma.check.findMany({
    where: { companyId },
    include: { fromContact: true, toContact: true, bank: true }
  });
  res.json(checks);
});

// Create a check (Incoming Receipt or Outgoing Expense)
router.post('/', async (req, res) => {
  const companyId = (req as any).companyId;
  const { type, status, number, amount, issueDate, dueDate, bankId, checkbookId, fromContactId, toContactId, invoiceId } = req.body;

  try {
    let checkNumber = number;

    // For outgoing checks from our checkbook, decrement the next number
    if (type === 'OUTGOING' && checkbookId) {
      const checkbook = await prisma.checkbook.findFirst({ where: { id: checkbookId, bank: { companyId } } });
      if (!checkbook) return res.status(404).json({ error: 'Checkbook not found' });
      if (checkbook.nextNumber > checkbook.endNumber) return res.status(400).json({ error: 'Checkbook exhausted' });

      checkNumber = checkbook.nextNumber.toString();

      // auto-increment checkbook
      await prisma.checkbook.update({
        where: { id: checkbookId },
        data: { nextNumber: checkbook.nextNumber + 1 }
      });
    }

    const check = await prisma.check.create({
      data: {
        companyId,
        type,
        status: status || 'PENDING',
        number: checkNumber,
        amount: parseFloat(amount),
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        bankId,
        fromContactId,
        toContactId,
        invoiceId,
      }
    });

    res.status(201).json(check);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create check' });
  }
});

// Endorse a check (Forward an incoming client check to a supplier)
router.post('/:id/endorse', async (req, res) => {
  const companyId = (req as any).companyId;
  const { id } = req.params;
  const { supplierId } = req.body;

  try {
    const check = await prisma.check.update({
      where: { id, companyId },
      data: {
        status: 'ENDORSED',
        toContactId: supplierId
      }
    });
    res.json(check);
  } catch (error) {
    res.status(500).json({ error: 'Failed to endorse check' });
  }
});

// Change status (e.g., PENDING -> SUBMITTED, UNPAID, PAID, CONTENTIEUX)
router.put('/:id/status', async (req, res) => {
  const companyId = (req as any).companyId;
  const { id } = req.params;
  const { status, replacementCheckId } = req.body;

  try {
    const data: any = { status };
    if (replacementCheckId) {
      data.replacementCheckId = replacementCheckId;
    }
    
    const check = await prisma.check.update({
      where: { id, companyId },
      data
    });
    res.json(check);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update check status' });
  }
});

export default router;
