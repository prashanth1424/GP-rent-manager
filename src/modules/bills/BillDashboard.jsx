import React, { useContext, useState } from 'react';
import { ChevronLeft, ChevronRight, Receipt } from 'lucide-react';
import { RentContext } from '../../context/RentContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/layout/Modal';
import { BillSummaryCard } from './BillSummaryCard';
import { BillEntryForm } from './BillEntryForm';
import { PaymentForm } from './PaymentForm';
import { getCurrentMonth, getDaysInMonth } from '../../utils/dateHelpers';
import { generateCharges, getPaymentStatus } from '../../utils/calculations';
import { generateId } from '../../utils/idGenerator';
import styles from './BillDashboard.module.css';

export const BillDashboard = () => {
  const { state, dispatch } = useContext(RentContext);
  const { rooms, tenants, tenancies, bills, settings } = state;

  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [paymentData, setPaymentData] = useState(null); // { billId, tenantId, amountDue, amountPaid }

  // Month navigation
  const navigateMonth = (direction) => {
    const [year, month] = currentMonth.split('-').map(Number);
    let newDate;
    if (direction === 'prev') {
      newDate = new Date(year, month - 2); // 0-indexed month
    } else {
      newDate = new Date(year, month);
    }
    const newYear = newDate.getFullYear();
    const newMonthStr = String(newDate.getMonth() + 1).padStart(2, '0');
    setCurrentMonth(`${newYear}-${newMonthStr}`);
  };

  const getBillForRoom = (roomId, monthStr = currentMonth) => {
    return bills.find(b => b.roomId === roomId && b.month === monthStr);
  };

  const getPreviousMonthString = (monthStr) => {
    const [year, month] = monthStr.split('-').map(Number);
    const date = new Date(year, month - 2);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const handleSaveBill = (utilities) => {
    const utilitiesEnteredDate = utilities.isEntered ? new Date().toISOString() : null;
    const charges = generateCharges(tenancies, editingRoomId, currentMonth, utilities, utilitiesEnteredDate);
    const existingBill = getBillForRoom(editingRoomId);

    const newBill = {
      id: existingBill ? existingBill.id : generateId('bill'),
      month: currentMonth,
      roomId: editingRoomId,
      utilities,
      utilitiesEnteredDate,
      charges,
      payments: existingBill ? existingBill.payments : []
    };

    dispatch({ type: 'UPSERT_BILL', payload: newBill });
    setEditingRoomId(null);
  };

  const handleRecordPayment = (paymentsToSave) => {
    paymentsToSave.forEach(payment => {
      dispatch({
        type: 'ADD_PAYMENT',
        payload: {
          billId: paymentData.billId,
          payment: {
            tenantId: paymentData.tenantId,
            ...payment
          }
        }
      });
    });
    setPaymentData(null);
  };

  // Dashboard Stats
  const monthBills = bills.filter(b => b.month === currentMonth);
  let totalExpected = 0;
  let totalCollected = 0;

  monthBills.forEach(bill => {
    bill.charges.forEach(charge => {
      totalExpected += charge.total;
    });
    bill.payments.forEach(payment => {
      totalCollected += payment.amount;
    });
  });

  const totalPending = totalExpected - totalCollected;

  return (
    <div className={styles.container}>
      <PageHeader title="Bills & Payments" />

      <div className={styles.monthSelector}>
        <Button variant="ghost" iconOnly onClick={() => navigateMonth('prev')}>
          <ChevronLeft size={24} />
        </Button>
        <div className={styles.monthDisplay}>
          {new Date(currentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <Button variant="ghost" iconOnly onClick={() => navigateMonth('next')}>
          <ChevronRight size={24} />
        </Button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Expected</span>
          <span className={styles.statValue}>₹{totalExpected.toLocaleString()}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Collected</span>
          <span className={styles.statValue} style={{ color: 'var(--status-paid)' }}>
            ₹{totalCollected.toLocaleString()}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pending</span>
          <span className={styles.statValue} style={{ color: 'var(--status-pending)' }}>
            ₹{totalPending.toLocaleString()}
          </span>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className={styles.emptyState}>
          <Receipt size={48} className={styles.emptyStateIcon} />
          <h2>No rooms to bill</h2>
          <p>Add some rooms first to start managing bills.</p>
        </div>
      ) : (
        <div className={styles.billsGrid}>
          {rooms.map(room => (
            <BillSummaryCard
              key={room.id}
              room={room}
              bill={getBillForRoom(room.id)}
              tenants={tenants}
              tenancies={tenancies}
              onEdit={(roomId) => setEditingRoomId(roomId)}
              onRecordPayment={(bill, tenantId) => {
                setPaymentData({ billId: bill.id, tenantId });
              }}
            />
          ))}
        </div>
      )}

      <Modal 
        isOpen={!!editingRoomId} 
        onClose={() => setEditingRoomId(null)}
        title="Generate/Edit Monthly Bill"
      >
        {editingRoomId && (
          <BillEntryForm
            room={rooms.find(r => r.id === editingRoomId)}
            month={currentMonth}
            existingBill={getBillForRoom(editingRoomId, currentMonth)}
            previousMonthMeterReading={getBillForRoom(editingRoomId, getPreviousMonthString(currentMonth))?.utilities?.currentMeter}
            electricityRatePerUnit={settings.electricityRatePerUnit || 0}
            onSave={handleSaveBill}
            onCancel={() => setEditingRoomId(null)}
          />
        )}
      </Modal>

      <Modal
        isOpen={!!paymentData}
        onClose={() => setPaymentData(null)}
        title="Record Payment"
        maxWidth="400px"
      >
        {paymentData && (
          <PaymentForm
            bill={bills.find(b => b.id === paymentData.billId)}
            tenantId={paymentData.tenantId}
            onSave={handleRecordPayment}
            onCancel={() => setPaymentData(null)}
          />
        )}
      </Modal>
    </div>
  );
};
