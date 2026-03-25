// Convertit un nombre en toutes lettres françaises (adaptation marocaine)
const ones = ['', 'UN', 'DEUX', 'TROIS', 'QUATRE', 'CINQ', 'SIX', 'SEPT', 'HUIT', 'NEUF',
  'DIX', 'ONZE', 'DOUZE', 'TREIZE', 'QUATORZE', 'QUINZE', 'SEIZE', 'DIX-SEPT', 'DIX-HUIT', 'DIX-NEUF'];
const tens = ['', 'DIX', 'VINGT', 'TRENTE', 'QUARANTE', 'CINQUANTE', 'SOIXANTE', 'SOIXANTE-DIX', 'QUATRE-VINGT', 'QUATRE-VINGT-DIX'];

function belowHundred(n) {
  if (n < 20) return ones[n];
  const ten = Math.floor(n / 10);
  const one = n % 10;
  if (ten === 7 || ten === 9) {
    return tens[ten - 1] + (one > 0 ? '-' + ones[10 + one] : '-DIX');
  }
  if (ten === 8) {
    return 'QUATRE-VINGT' + (one > 0 ? '-' + ones[one] : 'S');
  }
  return tens[ten] + (one > 0 ? '-' + ones[one] : '');
}

function belowThousand(n) {
  if (n < 100) return belowHundred(n);
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const hundredStr = (hundreds === 1 ? '' : ones[hundreds] + ' ') + 'CENT' + (rest === 0 && hundreds > 1 ? 'S' : '');
  return hundredStr + (rest > 0 ? ' ' + belowHundred(rest) : '');
}

export function numberToFrench(amount) {
  if (!amount || isNaN(amount)) return '';
  const num = Math.abs(parseFloat(amount));
  const intPart = Math.floor(num);
  const decimalPart = Math.round((num - intPart) * 100);

  let result = '';

  if (intPart === 0) {
    result = 'ZÉRO';
  } else if (intPart < 1000) {
    result = belowThousand(intPart);
  } else if (intPart < 1000000) {
    const thousands = Math.floor(intPart / 1000);
    const rest = intPart % 1000;
    result = (thousands === 1 ? 'MILLE' : belowThousand(thousands) + ' MILLE') + (rest > 0 ? ' ' + belowThousand(rest) : '');
  } else {
    const millions = Math.floor(intPart / 1000000);
    const rest = intPart % 1000000;
    result = belowThousand(millions) + ' MILLION' + (millions > 1 ? 'S' : '') + (rest > 0 ? ' ' + numberToFrench(rest).replace(' DIRHAMS', '').replace(' DIRHAM', '') : '');
  }

  result += intPart > 1 ? ' DIRHAMS' : ' DIRHAM';

  if (decimalPart > 0) {
    result += ' ET ' + belowHundred(decimalPart) + ' CENTIME' + (decimalPart > 1 ? 'S' : '');
  }

  return result;
}
