// Utility functions for date operations

/**
 * Generate last 12 months options starting from current month
 * @returns {Array} Array of month/year objects with display names
 */
export const getLast12MonthsOptions = () => {
  const months = [];
  const now = new Date();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.getMonth() + 1; // 1-based month for API
    const year = date.getFullYear();
    const displayName = `${monthNames[date.getMonth()]} ${year}`;
    
    months.push({
      month,
      year,
      displayName,
      value: `${month}-${year}`,
      isCurrentMonth: i === 0
    });
  }

  return months;
};

/**
 * Get current month and year
 * @returns {Object} Current month and year
 */
export const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1, // 1-based month for API
    year: now.getFullYear()
  };
};

/**
 * Format month and year for display
 * @param {number} month - 1-based month
 * @param {number} year - Year
 * @returns {string} Formatted display name
 */
export const formatMonthYear = (month, year) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${monthNames[month - 1]} ${year}`;
};