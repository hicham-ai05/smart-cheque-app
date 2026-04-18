import { Router } from 'express';
import prisma from '../prismaClient';

const router = Router();

// Get checkbooks for tenant
router.get('/', async (req, res) => {
  const companyId = (req as any).companyId;
  // Get all checkbooks for banks owned by this company
  const checkbooks = await prisma.checkbook.findMany({
    where: { bank: { companyId } },
    include: { bank: true }
  });
  res.json(checkbooks);
});

router.post('/', async (req, res) => {
  const companyId = (req as any).companyId;
  const { bankId, startNumber, endNumber } = req.body;

  // ensure bank belongs to this company
  const bank = await prisma.bank.findFirst({ where: { id: bankId, companyId } });
  if (!bank) return res.status(404).json({ error: 'Bank not found' });

  if (startNumber >= endNumber) {
    return res.status(400).json({ error: 'End number must be greater than start number' });
  }

  try {
    const checkbook = await prisma.checkbook.create({
      data: {
        bankId,
        startNumber: parseInt(startNumber),
        endNumber: parseInt(endNumber),
        nextNumber: parseInt(startNumber), // initially next number is start number
        active: true
      }
    });
    res.status(201).json(checkbook);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create checkbook' });
  }
});

export default router;
