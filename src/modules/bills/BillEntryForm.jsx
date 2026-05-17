import React, { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import styles from './BillEntryForm.module.css';

export const BillEntryForm = ({ room, month, existingBill, previousMonthMeterReading, electricityRatePerUnit, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    previousMeter: existingBill?.utilities?.previousMeter?.toString() || previousMonthMeterReading?.toString() || '',
    currentMeter: existingBill?.utilities?.currentMeter?.toString() || '',
    other: existingBill?.utilities?.other?.toString() || ''
  });

  const calculatedElectricity = Math.max(0, (Number(formData.currentMeter) - Number(formData.previousMeter)) * electricityRatePerUnit);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      previousMeter: Number(formData.previousMeter) || 0,
      currentMeter: Number(formData.currentMeter) || 0,
      electricity: calculatedElectricity,
      water: 0,
      other: Number(formData.other) || 0
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.notice}>
        Enter meter readings for <strong>{room.name}</strong> for <strong>{month}</strong>. 
        Electricity will be calculated at ₹{electricityRatePerUnit} per unit and split among active tenants.
      </div>

      <Input
        label="Previous Month Meter Reading (Units)"
        type="number"
        value={formData.previousMeter}
        onChange={(e) => setFormData({ ...formData, previousMeter: e.target.value })}
      />
      
      <Input
        label="Current Month Meter Reading (Units)"
        type="number"
        value={formData.currentMeter}
        onChange={(e) => setFormData({ ...formData, currentMeter: e.target.value })}
      />

      <div className={styles.notice} style={{ backgroundColor: 'var(--bg-elevated)' }}>
        <strong>Calculated Electricity Bill:</strong> ₹{calculatedElectricity.toLocaleString()} 
        <br/>
        <small>({formData.currentMeter || 0} - {formData.previousMeter || 0} = {Math.max(0, Number(formData.currentMeter) - Number(formData.previousMeter))} units × ₹{electricityRatePerUnit})</small>
      </div>

      <Input
        label="Other Utilities/Maintenance (₹)"
        type="number"
        value={formData.other}
        onChange={(e) => setFormData({ ...formData, other: e.target.value })}
      />

      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Generate Bill
        </Button>
      </div>
    </form>
  );
};
