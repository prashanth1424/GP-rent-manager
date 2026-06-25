import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import styles from './TenantCard.module.css';

export const TenantCard = ({ tenant, activeTenancy, room, onClick }) => {
  return (
    <Card onClick={onClick} className={styles.interactive} isActive={!!activeTenancy}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h3 className={styles.name}>{tenant.name}</h3>
          <span className={styles.phone}>{tenant.phone}</span>
        </div>
        <Badge variant={activeTenancy ? 'active' : 'vacant'}>
          {activeTenancy ? 'ASSIGNED' : 'UNASSIGNED'}
        </Badge>
      </div>

      <div className={styles.details}>
        <div className={styles.roomInfo}>
          <span className={styles.roomLabel}>Current Room:</span>
          {activeTenancy && room ? (
            <span className={styles.roomName}>{room.name} <span style={{opacity: 0.7}}>(Floor {room.floor})</span></span>
          ) : (
            <span className={styles.unassigned}>None</span>
          )}
        </div>
        {activeTenancy && (
          <div className={styles.roomInfo}>
            <span className={styles.roomLabel}>Rent:</span>
            <span className={styles.roomName}>₹{activeTenancy.agreedRent.toLocaleString()}/mo</span>
          </div>
        )}
      </div>
    </Card>
  );
};
