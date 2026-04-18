import { Router } from 'express';
import prisma from '../prismaClient';

const router = Router();

// Get all banks for the tenant
router.get('/', async (req, res) => {
  const companyId = (req as any).companyId;
  const banks = await prisma.bank.findMany({ where: { companyId } });
  res.json(banks);
});

router.post('/', async (req, res) => {
  const companyId = (req as any).companyId;
  const { name, branch, rib } = req.body;

  if (!rib || rib.length !== 24) {
    return res.status(400).json({ error: 'RIB must be exactly 24 digits.' });
  }

  try {
    const bank = await prisma.bank.create({
      data: { companyId, name, branch, rib }
    });
    res.status(201).json(bank);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create bank configuration' });
  }
});

router.put('/:id', async (req, res) => {
  const companyId = (req as any).companyId;
  const { id } = req.params;
  const { name, branch, rib } = req.body;

  if (rib && rib.length !== 24) {
    return res.status(400).json({ error: 'RIB must be exactly 24 digits.' });
  }

  try {
    const bank = await prisma.bank.update({
      where: { id, companyId },
      data: { name, branch, rib }
    });
    res.json(bank);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bank' });
  }
});

export default router;
