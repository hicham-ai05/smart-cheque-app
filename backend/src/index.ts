import express from 'express';
import cors from 'cors';
import { tenantMiddleware } from './middleware/tenant';
import contactsRouter from './routes/contacts';
import banksRouter from './routes/banks';
import checkbooksRouter from './routes/checkbooks';
import checksRouter from './routes/checks';
import invoicesRouter from './routes/invoices';
import dashboardRouter from './routes/dashboard';
import aiRouter from './routes/ai';
import prisma from './prismaClient';

const app = express();
app.use(cors());
app.use(express.json());

// Public route to setup a company if none exists
app.post('/api/companies', async (req, res) => {
  try {
    const { name } = req.body;
    const company = await prisma.company.create({
      data: { name }
    });
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create company' });
  }
});

app.get('/api/companies', async (req, res) => {
  try {
    const companies = await prisma.company.findMany();
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Enforce tenant isolation for all other routes
app.use('/api', tenantMiddleware);

app.use('/api/contacts', contactsRouter);
app.use('/api/banks', banksRouter);
app.use('/api/checkbooks', checkbooksRouter);
app.use('/api/checks', checksRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api', aiRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
