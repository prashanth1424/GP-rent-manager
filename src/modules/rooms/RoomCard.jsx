import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import styles from './RoomCard.module.css';

export const RoomCard = ({ room, activeTenancies, tenants, onClick }) => {
  const isDouble = room.type === 'double';
  const capacity = isDouble ? 2 : 1;
  const occupants = activeTenancies.map(t => {
    const tenant = tenants.find(user => user.id === t.tenantId);
    return {
      name: tenant ? tenant.name : 'Unknown',
      rent: t.agreedRent
    };
  });

  const vacantSlots = capacity - occupants.length;
  const isVacant = vacantSlots === capacity;
  
  const totalRent = occupants.reduce((sum, occ) => sum + occ.rent, 0);

  return (
    <Card onClick={onClick} className={styles.interactive}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>{room.name}</h3>
          <span className={styles.subtitle}>Floor {room.floor}</span>
        </div>
        <Badge variant={isVacant ? 'vacant' : 'active'}>
          {room.type.toUpperCase()}
        </Badge>
      </div>

      <div className={styles.occupants}>
        {occupants.map((occ, idx) => (
          <div key={idx} className={styles.occupantRow}>
            <span className={styles.occupantName}>{occ.name}</span>
            <span className={styles.occupantRent}>₹{occ.rent.toLocaleString()}/mo</span>
          </div>
        ))}
        {Array.from({ length: vacantSlots }).map((_, idx) => (
          <div key={`vacant-${idx}`} className={styles.occupantRow}>
            <span className={styles.vacantSlot}>Vacant Bed</span>
            <span className={styles.occupantRent}>--</span>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <span className={styles.totalLabel}>Total Expected:</span>
        <span className={styles.totalAmount}>₹{totalRent.toLocaleString()}/mo</span>
      </div>
    </Card>
  );
};
