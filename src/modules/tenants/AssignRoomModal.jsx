import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/layout/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { generateId } from '../../utils/idGenerator';
import { isRoomAvailable, getActiveTenantsForRoom } from '../../utils/calculations';
import styles from './AssignRoomModal.module.css';

export const AssignRoomModal = ({ isOpen, onClose, tenant, rooms, tenancies, onAssign }) => {
  const availableRooms = rooms.filter(r => isRoomAvailable(tenancies, r.id, r.type));

  const [formData, setFormData] = useState({
    roomId: '',
    startDate: new Date().toISOString().split('T')[0],
    agreedRent: '',
    depositPaid: '',
    advanceMonths: '0'
  });

  const [errors, setErrors] = useState({});
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [existingTenant, setExistingTenant] = useState(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        roomId: '',
        startDate: new Date().toISOString().split('T')[0],
        agreedRent: '',
        depositPaid: '',
        advanceMonths: '0'
      });
      setSelectedRoom(null);
      setExistingTenant(null);
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.roomId) {
      const room = rooms.find(r => r.id === formData.roomId);
      setSelectedRoom(room);
      if (room) {
        setFormData(prev => ({ ...prev, agreedRent: room.defaultRent.toString() }));
        
        // Check for double room split
        if (room.type === 'double') {
          const active = getActiveTenantsForRoom(tenancies, room.id);
          if (active.length === 1) {
            setExistingTenant(active[0]);
          } else {
            setExistingTenant(null);
          }
        }
      }
    } else {
      setSelectedRoom(null);
      setExistingTenant(null);
    }
  }, [formData.roomId, rooms, tenancies]);

  const validate = () => {
    const newErrors = {};
    if (!formData.roomId) newErrors.roomId = 'Please select a room';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.agreedRent || Number(formData.agreedRent) <= 0) newErrors.agreedRent = 'Valid rent amount is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const tenancyRecord = {
        id: generateId('tenancy'),
        roomId: formData.roomId,
        tenantId: tenant.id,
        startDate: formData.startDate,
        endDate: null,
        agreedRent: Number(formData.agreedRent),
        depositPaid: Number(formData.depositPaid) || 0,
        depositRefunded: null,
        depositDeductions: [],
        advanceMonths: Number(formData.advanceMonths) || 0,
        agreementStatus: 'draft',
        status: 'active'
      };

      // Need to inform parent if we are splitting rent for an existing tenant
      onAssign(tenancyRecord, existingTenant ? { 
        ...existingTenant, 
        splitRentPrompt: true 
      } : null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign Room to ${tenant?.name}`}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <Select
          label="Select Room"
          value={formData.roomId}
          onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
          options={[
            { label: '-- Choose a Room --', value: '' },
            ...availableRooms.map(r => ({ label: `${r.name} (${r.type.toUpperCase()})`, value: r.id }))
          ]}
          error={errors.roomId}
        />

        {existingTenant && (
          <div className={styles.warning}>
            <strong>Note:</strong> This room already has 1 occupant. 
            Assigning this tenant will prompt you to update the existing tenant's rent share.
          </div>
        )}

        <Input
          label="Start Date"
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          error={errors.startDate}
        />

        <Input
          label="Agreed Rent (₹/mo)"
          type="number"
          value={formData.agreedRent}
          onChange={(e) => setFormData({ ...formData, agreedRent: e.target.value })}
          error={errors.agreedRent}
          placeholder={selectedRoom ? `Default: ₹${selectedRoom.defaultRent}` : ''}
        />

        <Input
          label="Deposit Paid (₹)"
          type="number"
          value={formData.depositPaid}
          onChange={(e) => setFormData({ ...formData, depositPaid: e.target.value })}
        />

        <Input
          label="Advance Rent Paid (Months)"
          type="number"
          min="0"
          value={formData.advanceMonths}
          onChange={(e) => setFormData({ ...formData, advanceMonths: e.target.value })}
        />

        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Assign Room
          </Button>
        </div>
      </form>
    </Modal>
  );
};
