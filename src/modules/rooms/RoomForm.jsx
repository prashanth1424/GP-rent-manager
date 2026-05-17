import React, { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { generateId } from '../../utils/idGenerator';
import styles from './RoomForm.module.css';

export const RoomForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'single',
    floor: initialData?.floor || 1,
    defaultRent: initialData?.defaultRent || '',
    vacancyPolicy: initialData?.vacancyPolicy || 'landlord_absorbs'
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Room name is required';
    if (!formData.defaultRent || formData.defaultRent <= 0) newErrors.defaultRent = 'Valid default rent is required';
    if (!formData.floor || formData.floor < 0) newErrors.floor = 'Valid floor number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const room = {
        ...formData,
        id: initialData?.id || generateId('room'),
        floor: Number(formData.floor),
        defaultRent: Number(formData.defaultRent)
      };
      onSubmit(room);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        label="Room Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="e.g. Room 101"
        error={errors.name}
      />
      
      <div className={styles.row}>
        <Select
          label="Room Type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          options={[
            { label: 'Single', value: 'single' },
            { label: 'Double', value: 'double' }
          ]}
        />
        <Input
          label="Floor"
          type="number"
          value={formData.floor}
          onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
          error={errors.floor}
        />
      </div>

      <Input
        label="Default Rent (₹)"
        type="number"
        value={formData.defaultRent}
        onChange={(e) => setFormData({ ...formData, defaultRent: e.target.value })}
        placeholder="e.g. 8000"
        error={errors.defaultRent}
      />

      {formData.type === 'double' && (
        <Select
          label="Vacancy Policy (if 1 bed empty)"
          value={formData.vacancyPolicy}
          onChange={(e) => setFormData({ ...formData, vacancyPolicy: e.target.value })}
          options={[
            { label: 'Landlord Absorbs Loss', value: 'landlord_absorbs' },
            { label: 'Remaining Tenant Pays Full', value: 'tenant_pays_full' }
          ]}
        />
      )}

      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? 'Save Changes' : 'Create Room'}
        </Button>
      </div>
    </form>
  );
};
