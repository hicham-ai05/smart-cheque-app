import React from 'react';

export const getBankLogo = (bankName) => {
  const logos = {
    'CIH BANK': { bg: '#005e83', color: '#fff', text: 'CIH BANK' },
    'Banque Populaire': { bg: '#c75a22', color: '#fff', text: 'BANQUE POPULAIRE' },
    'Attijariwafa Bank': { bg: '#e0a800', color: '#000', text: 'ATTIJARIWAFA' },
    'BMCE Bank': { bg: '#00438a', color: '#fff', text: 'BMCE BANK' },
    'Société Générale': { bg: '#e31818', color: '#fff', text: 'SOCIETE GENERALE', split: ['#e31818', '#000'] },
    'Crédit du Maroc': { bg: '#00703c', color: '#fff', text: 'CREDIT DU MAROC' },
    'Crédit Agricole du Maroc': { bg: '#008b45', color: '#fff', text: 'CREDIT AGRICOLE' },
    'Al Barid Bank': { bg: '#fcd116', color: '#0055a4', text: 'AL BARID BANK' }
  };
  return logos[bankName] || null;
};

export const BankLogoRender = ({ bankName, style = {} }) => {
  const logo = getBankLogo(bankName);

  if (!logo) {
    return <div style={{ ...defaultStyle, ...style }}>{bankName}</div>;
  }

  if (logo.split) {
    return (
      <div style={{ ...defaultStyle, ...style, background: `linear-gradient(to bottom, ${logo.split[0]} 50%, ${logo.split[1]} 50%)`, color: '#fff' }}>
        {logo.text}
      </div>
    );
  }

  return (
    <div style={{ ...defaultStyle, ...style, backgroundColor: logo.bg, color: logo.color }}>
      {logo.text}
    </div>
  );
};

const defaultStyle = {
  padding: '6px 12px',
  borderRadius: '4px',
  fontWeight: 800,
  fontSize: '0.85rem',
  letterSpacing: '0.05em',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  fontFamily: 'Montserrat, system-ui, sans-serif'
};
