import React from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/dateHelpers';
import styles from './TenantDetail.module.css';

export const TenantDetail = ({ tenant, tenancies, rooms, activeTenancy, onOpenAssign, onOpenVacate, onEdit, onDelete }) => {
  const tenantHistory = tenancies
    .filter(t => t.tenantId === tenant.id)
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className={styles.sectionTitle}>Profile Details</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" size="small" onClick={onEdit}>Edit</Button>
            <Button variant="danger" size="small" onClick={onDelete} iconOnly>
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
        <p><strong>Phone:</strong> {tenant.phone}</p>
        <p><strong>ID Proof:</strong> {tenant.idProof || 'Not provided'}</p>
        <p><strong>Emergency Contact:</strong> {tenant.emergencyContact || 'Not provided'}</p>
        <p><strong>Added On:</strong> {formatDate(tenant.createdAt)}</p>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Actions</h3>
        <div className={styles.actions}>
          {!activeTenancy && (
            <Button variant="primary" onClick={onOpenAssign}>
              Assign to Room
            </Button>
          )}
          {activeTenancy && (
            <Button variant="danger" onClick={onOpenVacate}>
              Vacate Current Room
            </Button>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Tenancy History</h3>
        {tenantHistory.length === 0 ? (
          <p className={styles.emptyHistory}>No tenancy records found.</p>
        ) : (
          tenantHistory.map(t => {
            const room = rooms.find(r => r.id === t.roomId);
            return (
              <div key={t.id} className={styles.historyItem}>
                <div className={styles.historyHeader}>
                  <span className={styles.roomName}>{room ? room.name : 'Unknown Room'}</span>
                  <Badge variant={t.status === 'active' ? 'active' : 'vacated'}>
                    {t.status.toUpperCase()}
                  </Badge>
                </div>
                <div className={styles.historyDetails}>
                  <span>{formatDate(t.startDate)} - {t.endDate ? formatDate(t.endDate) : 'Present'}</span>
                  <span>₹{t.agreedRent.toLocaleString()}/mo</span>
                </div>
                {t.depositRefunded !== null && (
                  <div className={styles.historyDetails} style={{ marginTop: 4 }}>
                    <span>Deposit Refunded: ₹{t.depositRefunded.toLocaleString()}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
