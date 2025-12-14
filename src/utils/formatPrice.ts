export const getPricePrecision = (price: number): number => {
  if (price >= 10000) return 1; // e.g., BTC 92000.1
  if (price >= 100) return 2;   // e.g., ETH 3200.11
  if (price >= 10) return 3;    // tighter for mid-range
  return price >= 1 ? 4 : 5;    // more detail for small caps
};

/**
 * Formats price to always show 6 significant digits
 * Examples:
 * - BTC: 92,000.1 (5 digits + 1 decimal = 6 total)
 * - SOL: 142,678 (6 digits, no decimal)
 * - ETH: 3200.11 (4 digits + 2 decimals = 6 total)
 * - SUI: 1.42123 (1 digit + 5 decimals = 6 total)
 */
export const formatPrice = (price: number): string => {
  if (price === 0) return '0';
  
  // Get exactly 6 significant digits as a string
  const precisionString = price.toPrecision(6);
  const precisionValue = Number.parseFloat(precisionString);
  
  // Count digits in integer part
  const integerPart = Math.floor(Math.abs(precisionValue));
  const integerDigits = integerPart === 0 ? 0 : Math.floor(Math.log10(integerPart)) + 1;
  
  // Calculate decimal places needed
  let decimalPlaces: number;
  if (integerDigits >= 6) {
    // 6+ digits in integer part, no decimals needed
    decimalPlaces = 0;
  } else if (integerDigits === 0 && Math.abs(precisionValue) < 1) {
    // Number is < 1, count decimal places directly from precision string
    const decimalIndex = precisionString.indexOf('.');
    if (decimalIndex !== -1) {
      // Count all digits after decimal point in the precision string
      decimalPlaces = precisionString.length - decimalIndex - 1;
    } else {
      decimalPlaces = 6;
    }
  } else {
    // Need decimals to complete 6 total significant digits
    decimalPlaces = 6 - integerDigits;
  }
  
  // Format with comma separators and calculated decimal places
  return precisionValue.toLocaleString('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
};
