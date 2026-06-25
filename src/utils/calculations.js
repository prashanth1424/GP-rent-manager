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
export const generateCharges = (tenancies, roomId, month, utilities, utilitiesEnteredDate) => {
  const activeTenancies = getTenantsForRoomInMonth(tenancies, roomId, month);
  const daysInMonth = getDaysInMonth(month);
  
  const totalUtility = utilitiesEnteredDate ? (utilities.electricity || 0) + (utilities.water || 0) + (utilities.other || 0) : 0;
  
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
  const result = { rentStatus: "pending", utilityStatus: "not_billed" };
  
  if (!bill) return result;
  
  const tenantCharge = bill.charges.find(c => c.tenantId === tenantId);
  if (!tenantCharge) return result;

  // Rent status
  let rentStatus = "pending";
  if (tenancy && tenancy.advanceMonths > 0) {
    const start = new Date(tenancy.startDate);
    const [year, monthNum] = bill.month.split('-').map(Number);
    const billDate = new Date(year, monthNum - 1, 1);
    
    const monthDiff = (billDate.getFullYear() - start.getFullYear()) * 12 + (billDate.getMonth() - start.getMonth());
    if (monthDiff >= 0 && monthDiff < tenancy.advanceMonths) {
      rentStatus = "advance";
    }
  }

  let rentPaid = 0;
  let utilityPaid = 0;
  
  bill.payments.filter(p => p.tenantId === tenantId).forEach(p => {
    if (p.appliesTo === 'rent') rentPaid += p.amount;
    else if (p.appliesTo === 'utility') utilityPaid += p.amount;
    else {
      const remainingRent = tenantCharge.baseRent - rentPaid;
      if (remainingRent > 0) {
        const toRent = Math.min(remainingRent, p.amount);
        rentPaid += toRent;
        utilityPaid += (p.amount - toRent);
      } else {
        utilityPaid += p.amount;
      }
    }
  });

  if (rentStatus !== "advance") {
    if (rentPaid >= tenantCharge.baseRent) rentStatus = "paid";
    else if (rentPaid > 0) rentStatus = "partial";
    else {
      const now = new Date();
      const [bYear, bMonth] = bill.month.split('-').map(Number);
      if (now.getFullYear() > bYear || (now.getFullYear() === bYear && now.getMonth() + 1 > bMonth)) {
        rentStatus = "overdue";
      }
    }
  }
  result.rentStatus = rentStatus;

  if (!bill.utilitiesEnteredDate) {
    result.utilityStatus = "not_billed";
  } else {
    if (utilityPaid >= tenantCharge.utilityShare && tenantCharge.utilityShare > 0) result.utilityStatus = "paid";
    else if (utilityPaid > 0) result.utilityStatus = "partial";
    else {
      const now = new Date();
      const [bYear, bMonth] = bill.month.split('-').map(Number);
      if (now.getFullYear() > bYear || (now.getFullYear() === bYear && now.getMonth() + 1 > bMonth)) {
        result.utilityStatus = "overdue";
      } else {
        result.utilityStatus = "pending";
      }
    }
  }

  return result;
};
