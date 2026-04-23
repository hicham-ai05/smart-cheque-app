/**
 * Standard dimensions for Moroccan banking documents (in mm)
 * Chèque: 175 x 80 mm
 * LCN (Effet): 200 x 105 mm
 */

export const DEFAULT_DIMENSIONS = {
  'Chèque': { width: 175, height: 80 },
  'LCN': { width: 200, height: 105 }
};

export const getDimensions = (type, bankName) => {
  const savedTemplates = JSON.parse(localStorage.getItem('printTemplates') || '{}');
  const key = `${bankName}_${type}`;
  
  if (savedTemplates[key] && savedTemplates[key].dimensions) {
    return savedTemplates[key].dimensions;
  }
  
  return DEFAULT_DIMENSIONS[type] || { width: 175, height: 80 };
};

export const saveDimensions = (type, bankName, dimensions) => {
  const savedTemplates = JSON.parse(localStorage.getItem('printTemplates') || '{}');
  const key = `${bankName}_${type}`;
  
  if (!savedTemplates[key]) {
    savedTemplates[key] = { fields: [], dimensions: dimensions };
  } else {
    // If it was just an array (old format), convert to object
    if (Array.isArray(savedTemplates[key])) {
      savedTemplates[key] = { fields: savedTemplates[key], dimensions: dimensions };
    } else {
      savedTemplates[key].dimensions = dimensions;
    }
  }
  
  localStorage.setItem('printTemplates', JSON.stringify(savedTemplates));
};
