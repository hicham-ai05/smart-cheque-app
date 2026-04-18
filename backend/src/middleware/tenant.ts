import { Request, Response, NextFunction } from 'express';

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const companyId = req.headers['x-company-id'] as string;
  
  if (!companyId) {
    return res.status(400).json({ error: 'x-company-id header is strictly required for all operations.' });
  }

  // Inject companyId to req for downstream usage
  (req as any).companyId = companyId;
  next();
};
