import React, { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import styles from './PaymentForm.module.css';

export const PaymentForm = ({ bill, tenantId, onSave, onCancel }) => {
  const charge = bill.charges.find(c => c.tenantId === tenantId);
  const payments = bill.payments.filter(p => p.tenantId === tenantId);

  let rentPaid = 0;
  let utilityPaid = 0;
  payments.forEach(p => {
    if (p.appliesTo === 'rent') rentPaid += p.amount;
    else if (p.appliesTo === 'utility') utilityPaid += p.amount;
    else {
      const remainingRent = charge.baseRent - rentPaid;
      if (remainingRent > 0) {
        const toRent = Math.min(remainingRent, p.amount);
        rentPaid += toRent;
        utilityPaid += (p.amount - toRent);
      } else {
        utilityPaid += p.amount;
      }
    }
  });

  const rentRemaining = Math.max(0, charge.baseRent - rentPaid);
  const utilitiesEntered = !!bill.utilitiesEnteredDate;
  const utilityRemaining = utilitiesEntered ? Math.max(0, charge.utilityShare - utilityPaid) : 0;
  const totalRemaining = rentRemaining + utilityRemaining;

  const [formData, setFormData] = useState({
    amount: totalRemaining.toString(),
    date: new Date().toISOString().split('T')[0],
    appliesTo: 'both',
    note: ''
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.amount || Number(formData.amount) <= 0) newErrors.amount = 'Valid amount is required';
    if (!formData.date) newErrors.date = 'Date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const amt = Number(formData.amount);
      if (formData.appliesTo === 'both') {
        let amountToProcess = amt;
        const paymentsToSave = [];
        
        if (rentRemaining > 0 && amountToProcess > 0) {
          const toRent = Math.min(rentRemaining, amountToProcess);
          paymentsToSave.push({
            amount: toRent,
            date: formData.date,
            appliesTo: 'rent',
            note: formData.note
          });
          amountToProcess -= toRent;
        }
        
        if (amountToProcess > 0) {
          paymentsToSave.push({
            amount: amountToProcess,
            date: formData.date,
            appliesTo: 'utility',
            note: formData.note
          });
        }
        
        onSave(paymentsToSave);
      } else {
        onSave([{
          amount: amt,
          date: formData.date,
          appliesTo: formData.appliesTo,
          note: formData.note
        }]);
      }
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span>Rent Remaining:</span>
          <span>₹{rentRemaining.toLocaleString()}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Utility Remaining:</span>
          <span>{utilitiesEntered ? `₹${utilityRemaining.toLocaleString()}` : 'Not Billed Yet'}</span>
        </div>
        <div className={styles.summaryRow} style={{ fontWeight: 'bold', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '8px' }}>
          <span>Total Remaining:</span>
          <span>₹{totalRemaining.toLocaleString()}</span>
        </div>
      </div>

      <Select
        label="Payment Applies To"
        value={formData.appliesTo}
        onChange={(e) => setFormData({ ...formData, appliesTo: e.target.value })}
        options={[
          { label: 'Both (Auto-Split)', value: 'both' },
          { label: 'Rent Only', value: 'rent' },
          { label: 'Utility Only', value: 'utility' }
        ]}
      />

      <Input
        label="Payment Amount (₹)"
        type="number"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        error={errors.amount}
      />
      
      <Input
        label="Payment Date"
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        error={errors.date}
      />

      <Input
        label="Note (Optional)"
        value={formData.note}
        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
        placeholder="e.g. UPI transfer"
      />

      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Record Payment
        </Button>
      </div>
    </form>
  );
};
