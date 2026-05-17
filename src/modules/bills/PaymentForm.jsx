import React, { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import styles from './PaymentForm.module.css';

export const PaymentForm = ({ tenantName, amountDue, amountPaid, onSave, onCancel }) => {
  const remaining = amountDue - amountPaid;
  const [formData, setFormData] = useState({
    amount: remaining.toString(),
    date: new Date().toISOString().split('T')[0],
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
      onSave({
        amount: Number(formData.amount),
        date: formData.date,
        note: formData.note
      });
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span>Total Bill:</span>
          <span>₹{amountDue.toLocaleString()}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Amount Paid:</span>
          <span>₹{amountPaid.toLocaleString()}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Remaining Balance:</span>
          <span>₹{remaining.toLocaleString()}</span>
        </div>
      </div>

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
