import React from 'react';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/dateHelpers';
import { Button } from '../../components/ui/Button';
import styles from './RoomDetail.module.css';

export const RoomDetail = ({ room, tenancies, tenants, onEdit, onVacateTenant }) => {
  const roomTenancies = tenancies
    .filter(t => t.roomId === room.id)
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className={styles.sectionTitle}>Room Details</h3>
          <Button variant="secondary" size="small" onClick={onEdit}>Edit</Button>
        </div>
        <p><strong>Type:</strong> {room.type.toUpperCase()}</p>
        <p><strong>Floor:</strong> {room.floor}</p>
        <p><strong>Default Rent:</strong> ₹{room.defaultRent.toLocaleString()}/mo</p>
        {room.type === 'double' && (
          <p><strong>Vacancy Policy:</strong> {room.vacancyPolicy === 'landlord_absorbs' ? 'Landlord Absorbs Loss' : 'Remaining Tenant Pays Full'}</p>
        )}
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Tenancy History</h3>
        {roomTenancies.length === 0 ? (
          <p className={styles.emptyHistory}>No tenancies recorded for this room.</p>
        ) : (
          roomTenancies.map(t => {
            const tenant = tenants.find(user => user.id === t.tenantId);
            return (
              <div key={t.id} className={styles.historyItem}>
                <div className={styles.historyHeader}>
                  <span className={styles.tenantName}>{tenant ? tenant.name : 'Unknown Tenant'}</span>
                  <Badge variant={t.status === 'active' ? 'active' : 'vacated'}>
                    {t.status.toUpperCase()}
                  </Badge>
                  {t.status === 'active' && onVacateTenant && (
                    <Button variant="danger" size="small" onClick={() => onVacateTenant(tenant, t)} style={{marginLeft: '8px', padding: '2px 8px', fontSize: '0.75rem'}}>
                      Vacate
                    </Button>
                  )}
                </div>
                <div className={styles.historyDetails}>
                  <span>{formatDate(t.startDate)} - {t.endDate ? formatDate(t.endDate) : 'Present'}</span>
                  <span>₹{t.agreedRent.toLocaleString()}/mo</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
