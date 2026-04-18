import { z } from 'zod';

export const contactSchema = z.object({
  type: z.enum(['CLIENT', 'SUPPLIER']),
  name: z.string().min(2, 'Name is required, minimum 2 characters.'),
  phone: z.string().optional(),
  address: z.string().optional(),
  ice: z.string()
    .length(15, 'ICE must be exactly 15 digits.')
    .regex(/^[0-9]*$/, 'ICE must be numeric.'), // Allow 000000000000000 as requested
  if: z.string()
    .max(9, 'IF must be max 9 digits.')
    .regex(/^[0-9]*$/, 'IF must be numeric.')
    .optional()
    .or(z.literal('')),
  rc: z.string().optional() // free alphanumeric format
});

export const bankSchema = z.object({
  name: z.string().min(2, 'Bank name is required'),
  branch: z.string().min(2, 'Branch is required'),
  rib: z.string()
    .length(24, 'RIB must be exactly 24 digits')
    .regex(/^[0-9]*$/, 'RIB must be numeric')
});

export const checkbookSchema = z.object({
  bankId: z.string().uuid('Please select a bank'),
  startNumber: z.coerce.number().min(1, 'Start number must be positive'),
  endNumber: z.coerce.number().min(1, 'End number must be positive'),
}).refine(data => data.endNumber > data.startNumber, {
  message: "End number must be greater than start number",
  path: ["endNumber"],
});
