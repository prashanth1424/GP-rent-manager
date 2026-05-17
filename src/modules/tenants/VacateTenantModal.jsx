import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '../../components/layout/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { getActiveTenantsForRoom } from '../../utils/calculations';
import styles from './VacateTenantModal.module.css';

export const VacateTenantModal = ({ isOpen, onClose, tenant, activeTenancy, room, tenancies, onVacate }) => {
  const [formData, setFormData] = useState({
    endDate: new Date().toISOString().split('T')[0],
    depositRefunded: ''
  });

  const [deductions, setDeductions] = useState([]);
  const [errors, setErrors] = useState({});
  const [coTenant, setCoTenant] = useState(null);

  useEffect(() => {
    if (isOpen && activeTenancy && room) {
      setFormData({
        endDate: new Date().toISOString().split('T')[0],
        depositRefunded: activeTenancy.depositPaid.toString()
      });
      setDeductions([]);
      setErrors({});

      if (room.type === 'double') {
        const active = getActiveTenantsForRoom(tenancies, room.id);
        const otherTenant = active.find(t => t.id !== activeTenancy.id);
        if (otherTenant && room.vacancyPolicy === 'tenant_pays_full') {
          setCoTenant(otherTenant);
        } else {
          setCoTenant(null);
        }
      } else {
        setCoTenant(null);
      }
    }
  }, [isOpen, activeTenancy, room, tenancies]);

  const totalDeductions = deductions.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const suggestedRefund = Math.max(0, (activeTenancy?.depositPaid || 0) - totalDeductions);

  useEffect(() => {
    setFormData(prev => ({ ...prev, depositRefunded: suggestedRefund.toString() }));
  }, [totalDeductions, suggestedRefund]);

  const validate = () => {
    const newErrors = {};
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.depositRefunded === '') newErrors.depositRefunded = 'Required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddDeduction = () => {
    setDeductions([...deductions, { reason: '', amount: '' }]);
  };

  const handleUpdateDeduction = (index, field, value) => {
    const newDeds = [...deductions];
    newDeds[index][field] = value;
    setDeductions(newDeds);
  };

  const handleRemoveDeduction = (index) => {
    setDeductions(deductions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate() && activeTenancy) {
      const validDeductions = deductions.filter(d => d.reason && d.amount);
      onVacate({
        ...activeTenancy,
        endDate: formData.endDate,
        depositRefunded: Number(formData.depositRefunded),
        depositDeductions: validDeductions.map(d => ({ reason: d.reason, amount: Number(d.amount) }))
      }, coTenant);
    }
  };

  if (!activeTenancy || !room) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Vacate ${tenant?.name}`}>
      <form className={styles.form} onSubmit={handleSubmit}>
        
        {coTenant && (
          <div className={styles.warning}>
            <strong>Note:</strong> This is a double room and the policy is "Remaining Tenant Pays Full". 
            Vacating this tenant will prompt you to update the co-tenant's rent share.
          </div>
        )}

        <Input
          label="Move-out Date"
          type="date"
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          error={errors.endDate}
        />

        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span>Deposit Paid Initially:</span>
            <span>₹{(activeTenancy.depositPaid || 0).toLocaleString()}</span>
          </div>
          
          <div className={styles.deductionsHeader}>
            <span className={styles.deductionsTitle}>Deductions</span>
            <Button type="button" variant="ghost" size="small" onClick={handleAddDeduction}>
              <Plus size={16} /> Add
            </Button>
          </div>

          {deductions.map((d, idx) => (
            <div key={idx} className={styles.deductionRow}>
              <Input
                placeholder="Reason (e.g. Damage)"
                value={d.reason}
                onChange={(e) => handleUpdateDeduction(idx, 'reason', e.target.value)}
                containerClassName={styles.flexItem}
              />
              <Input
                type="number"
                placeholder="Amount"
                value={d.amount}
                onChange={(e) => handleUpdateDeduction(idx, 'amount', e.target.value)}
                containerClassName={styles.flexItem}
              />
              <Button type="button" variant="ghost" iconOnly onClick={() => handleRemoveDeduction(idx)}>
                <Trash2 size={16} />
              </Button>
            </div>
          ))}

          <div className={styles.summaryTotal}>
            <span>Total to Refund:</span>
            <span>₹{suggestedRefund.toLocaleString()}</span>
          </div>
        </div>

        <Input
          label="Actual Deposit Refunded (₹)"
          type="number"
          value={formData.depositRefunded}
          onChange={(e) => setFormData({ ...formData, depositRefunded: e.target.value })}
          error={errors.depositRefunded}
        />

        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="danger">
            Vacate Tenant
          </Button>
        </div>
      </form>
    </Modal>
  );
};
