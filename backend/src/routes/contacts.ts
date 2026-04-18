import { Router } from 'express';
import prisma from '../prismaClient';

const router = Router();

// Get all contacts for the tenant
router.get('/', async (req, res) => {
  const companyId = (req as any).companyId;
  const contacts = await prisma.contact.findMany({ where: { companyId } });
  res.json(contacts);
});

// Create a new contact
router.post('/', async (req, res) => {
  const companyId = (req as any).companyId;
  const { type, name, phone, address, ice, if: ifCode, rc } = req.body;

  // Manual ICE Validation (15 chars)
  if (!ice || ice.length !== 15) {
    return res.status(400).json({ error: 'ICE must be exactly 15 digits.' });
  }
  
  // IF Validation (max 9 chars)
  if (ifCode && ifCode.length > 9) {
    return res.status(400).json({ error: 'IF must be max 9 digits.' });
  }

  try {
    const contact = await prisma.contact.create({
      data: {
        companyId,
        type, // 'CLIENT' | 'SUPPLIER'
        name,
        phone,
        address,
        ice,
        if: ifCode,
        rc
      }
    });
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// Update a contact
router.put('/:id', async (req, res) => {
  const companyId = (req as any).companyId;
  const { id } = req.params;
  const { type, name, phone, address, ice, if: ifCode, rc } = req.body;

  if (ice && ice.length !== 15) {
    return res.status(400).json({ error: 'ICE must be exactly 15 digits.' });
  }
  if (ifCode && ifCode.length > 9) {
    return res.status(400).json({ error: 'IF must be max 9 digits.' });
  }

  try {
    const contact = await prisma.contact.update({
      where: { id, companyId },
      data: { type, name, phone, address, ice, if: ifCode, rc }
    });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Delete a contact
router.delete('/:id', async (req, res) => {
  const companyId = (req as any).companyId;
  const { id } = req.params;
  
  try {
    await prisma.contact.delete({
      where: { id, companyId }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

export default router;
