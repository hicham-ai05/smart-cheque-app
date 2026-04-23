const DEFAULT_BANKS = [
  'CIH BANK', 
  'Banque Populaire', 
  'Attijariwafa Bank', 
  'BMCE Bank', 
  'Société Générale', 
  'Crédit du Maroc', 
  'Crédit Agricole du Maroc'
];

export const getBanques = () => {
  const saved = localStorage.getItem('banques');
  if (!saved) return DEFAULT_BANKS;
  try {
    const list = JSON.parse(saved);
    return list.length > 0 ? list : DEFAULT_BANKS;
  } catch (e) {
    return DEFAULT_BANKS;
  }
};

export const saveBanques = (list) => {
  localStorage.setItem('banques', JSON.stringify(list));
};
