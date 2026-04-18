import { Router } from 'express';
import prisma from '../prismaClient';

const router = Router();

// Dashboard KPIs and Alerts
router.get('/', async (req, res) => {
  const companyId = (req as any).companyId;
  const now = new Date();
  const alertThreshold = new Date();
  alertThreshold.setDate(now.getDate() + 3);

  try {
    const allChecks = await prisma.check.findMany({ where: { companyId } });
    
    const totalReceipts = allChecks
      .filter(c => c.type === 'INCOMING' && c.status === 'PAID')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalDisbursements = allChecks
      .filter(c => c.type === 'OUTGOING' && c.status === 'PAID')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const netCashBalance = totalReceipts - totalDisbursements;

    const nearingChecksFilter = allChecks.filter(c => 
      c.status !== 'PAID' && 
      c.status !== 'UNPAID' && 
      c.dueDate >= now && 
      c.dueDate <= alertThreshold
    );

    const checkAlerts = nearingChecksFilter.length;

    res.json({
      kpis: {
        totalReceipts,
        totalDisbursements,
        netCashBalance
      },
      alerts: {
        checksNearingDue: checkAlerts
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
