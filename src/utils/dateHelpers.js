// Month is "YYYY-MM" string
export const daysOccupiedInMonth = (startDate, endDate, month) => {
  const [year, monthNum] = month.split('-').map(Number);
  
  const firstDayOfMonth = new Date(year, monthNum - 1, 1);
  const lastDayOfMonth = new Date(year, monthNum, 0); // 0th day of next month is last day of current month
  
  const start = new Date(startDate);
  // Ensure we compare midnight to midnight in local time
  start.setHours(0, 0, 0, 0);
  const startInMonth = start > firstDayOfMonth ? start : firstDayOfMonth;
  
  const end = endDate ? new Date(endDate) : lastDayOfMonth;
  end.setHours(0, 0, 0, 0);
  const endInMonth = end < lastDayOfMonth ? end : lastDayOfMonth;
  
  if (startInMonth > endInMonth) return 0;
  
  // Calculate days difference
  const diffTime = endInMonth.getTime() - startInMonth.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1; 
  return diffDays;
};

export const getDaysInMonth = (month) => {
  const [year, monthNum] = month.split('-').map(Number);
  return new Date(year, monthNum, 0).getDate();
};

export const getCurrentMonth = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
