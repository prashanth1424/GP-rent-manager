import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { getPaymentStatus } from '../../utils/calculations';
import { getDaysInMonth } from '../../utils/dateHelpers';
import styles from './BillSummaryCard.module.css';

export const BillSummaryCard = ({ room, bill, tenants, tenancies, onEdit, onRecordPayment }) => {
  const isVacant = !bill || !bill.charges || bill.charges.length === 0;

  const getTenantName = (tenantId) => {
    const t = tenants.find(user => user.id === tenantId);
    return t ? t.name : 'Unknown';
  };

  const getTenancy = (tenantId) => {
    return tenancies.find(t => t.roomId === room.id && t.tenantId === tenantId && t.status === 'active');
  };

  const daysInMonth = bill ? getDaysInMonth(bill.month) : 30;

  return (
    <Card>
      <div className={styles.header}>
        <h3 className={styles.title}>{room.name}</h3>
        {isVacant ? (
          <Badge variant="vacant">VACANT</Badge>
        ) : (
          <Badge variant="active">BILLED</Badge>
        )}
      </div>

      {isVacant ? (
        <div className={styles.vacantNotice}>
          No active tenancies in this month.
          <div className={styles.actions} style={{ justifyContent: 'center' }}>
            <Button variant="primary" onClick={() => onEdit(room.id)}>Generate Bill</Button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.utilitiesSection}>
            <div className={styles.utilRow}>
              <span>Electricity 
                {bill.utilities.currentMeter !== undefined && bill.utilities.previousMeter !== undefined && (
                  ` (${bill.utilities.currentMeter} - ${bill.utilities.previousMeter} = ${Math.max(0, bill.utilities.currentMeter - bill.utilities.previousMeter)} units)`
                )}:
              </span>
              <span>₹{bill.utilities.electricity.toLocaleString()}</span>
            </div>
            <div className={styles.utilRow}>
              <span>Other:</span>
              <span>₹{bill.utilities.other.toLocaleString()}</span>
            </div>
            <div className={styles.utilTotal}>
              <span>Total Utilities:</span>
              <span>₹{(bill.utilities.electricity + (bill.utilities.water || 0) + bill.utilities.other).toLocaleString()}</span>
            </div>
          </div>

          <div className={styles.tenantSection}>
            {bill.charges.map((charge, idx) => {
              const status = getPaymentStatus(bill, charge.tenantId, getTenancy(charge.tenantId));
              return (
                <div key={idx} className={styles.tenantBlock}>
                  <div className={styles.tenantHeader}>
                    <span>{getTenantName(charge.tenantId)}</span>
                    <Badge variant={status}>{status.toUpperCase()}</Badge>
                  </div>
                  <div className={styles.tenantDetail}>
                    <span>Base Rent ({charge.daysOccupied}/{daysInMonth} days):</span>
                    <span>₹{charge.baseRent.toLocaleString()}</span>
                  </div>
                  <div className={styles.tenantDetail}>
                    <span>Utility Share:</span>
                    <span>₹{charge.utilityShare.toLocaleString()}</span>
                  </div>
                  <div className={styles.tenantTotal}>
                    <span>TOTAL:</span>
                    <span>₹{charge.total.toLocaleString()}</span>
                  </div>
                  {status !== 'paid' && status !== 'advance' && (
                    <div className={styles.actions}>
                      <Button 
                        variant="secondary" 
                        size="small" 
                        onClick={() => onRecordPayment(bill, charge.tenantId, charge.total)}
                        style={{ padding: '6px 12px', fontSize: '0.8rem', width: '100%' }}
                      >
                        Record Payment
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.roomTotal}>
            <span>Room Total</span>
            <span>
              ₹{bill.charges.reduce((sum, c) => sum + c.total, 0).toLocaleString()}
            </span>
          </div>

          <div className={styles.actions}>
            <Button variant="ghost" onClick={() => onEdit(room.id)} style={{ width: '100%' }}>
              Edit Utilities
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};
