/**
 * Format a number as currency with comma separators
 * @param {number} num - The number to format
 * @returns {string} Formatted currency string (e.g., "1,234.56")
 */
export function formatCurrency(num) {
  return parseFloat(num)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
