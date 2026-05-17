import React, { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { generateId } from '../../utils/idGenerator';
import styles from './TenantForm.module.css';

export const TenantForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    idProof: initialData?.idProof || '',
    emergencyContact: initialData?.emergencyContact || ''
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const tenant = {
        ...formData,
        id: initialData?.id || generateId('tenant'),
        createdAt: initialData?.createdAt || new Date().toISOString()
      };
      onSubmit(tenant);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        label="Full Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
      />
      
      <Input
        label="Phone Number"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        error={errors.phone}
      />

      <Input
        label="ID Proof (e.g., Aadhar - 1234)"
        value={formData.idProof}
        onChange={(e) => setFormData({ ...formData, idProof: e.target.value })}
      />

      <Input
        label="Emergency Contact"
        value={formData.emergencyContact}
        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
      />

      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? 'Save Changes' : 'Add Tenant'}
        </Button>
      </div>
    </form>
  );
};
