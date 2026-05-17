import { daysOccupiedInMonth, getDaysInMonth } from './dateHelpers';

export const getActiveTenantsForRoom = (tenancies, roomId) => {
  return tenancies.filter(t => t.roomId === roomId && t.status === "active" && !t.endDate);
};

export const getTenantsForRoomInMonth = (tenancies, roomId, month) => {
  const [year, monthNum] = month.split('-').map(Number);
  const firstDayOfMonth = new Date(year, monthNum - 1, 1);
  const lastDayOfMonth = new Date(year, monthNum, 0);

  return tenancies.filter(t => {
    if (t.roomId !== roomId) return false;
    const start = new Date(t.startDate);
    start.setHours(0, 0, 0, 0);
    if (start > lastDayOfMonth) return false;

    if (!t.endDate) return true; // Active
    
    const end = new Date(t.endDate);
    end.setHours(0, 0, 0, 0);
    if (end < firstDayOfMonth) return false;
    
    return true;
  });
};

export const prorateRent = (agreedRent, daysOccupied, daysInMonth) => {
  return Math.round(((agreedRent / daysInMonth) * daysOccupied) * 100) / 100;
};

// Generates bill charges for a room + month
export const generateCharges = (tenancies, roomId, month, utilities) => {
  const activeTenancies = getTenantsForRoomInMonth(tenancies, roomId, month);
  const daysInMonth = getDaysInMonth(month);
  
  const totalUtility = (utilities.electricity || 0) + (utilities.water || 0) + (utilities.other || 0);
  
  const activeCount = activeTenancies.length;
  const utilityShare = activeCount > 0 ? totalUtility / activeCount : 0;
  
  return activeTenancies.map(t => {
    const daysOccupied = daysOccupiedInMonth(t.startDate, t.endDate, month);
    const baseRent = prorateRent(t.agreedRent, daysOccupied, daysInMonth);
    
    return {
      tenantId: t.tenantId,
      daysOccupied,
      baseRent,
      utilityShare,
      total: baseRent + utilityShare
    };
  });
};

export const isRoomAvailable = (tenancies, roomId, roomType) => {
  const activeCount = getActiveTenantsForRoom(tenancies, roomId).length;
  if (roomType === 'single') return activeCount === 0;
  if (roomType === 'double') return activeCount < 2;
  return false;
};

export const getPaymentStatus = (bill, tenantId, tenancy) => {
  // Check if paid in advance
  if (tenancy && tenancy.advanceMonths > 0) {
    // Basic logic: count months from startDate
    // Need a robust way to check if 'month' falls within the first N months of startDate
    const start = new Date(tenancy.startDate);
    const [year, monthNum] = bill.month.split('-').map(Number);
    const billDate = new Date(year, monthNum - 1, 1);
    
    const monthDiff = (billDate.getFullYear() - start.getFullYear()) * 12 + (billDate.getMonth() - start.getMonth());
    if (monthDiff >= 0 && monthDiff < tenancy.advanceMonths) {
      return "advance";
    }
  }

  if (!bill) return "pending";
  
  const tenantCharge = bill.charges.find(c => c.tenantId === tenantId);
  if (!tenantCharge) return "pending"; // Shouldn't happen if they are active
  
  const totalPaid = bill.payments
    .filter(p => p.tenantId === tenantId)
    .reduce((sum, p) => sum + p.amount, 0);
    
  if (totalPaid >= tenantCharge.total) return "paid";
  if (totalPaid > 0) return "partial";
  
  // If no payment and it's past the month, it's overdue. 
  // Simplified logic: just check if month is in the past.
  const now = new Date();
  const [bYear, bMonth] = bill.month.split('-').map(Number);
  if (now.getFullYear() > bYear || (now.getFullYear() === bYear && now.getMonth() + 1 > bMonth)) {
    return "overdue";
  }
  
  return "pending";
};
