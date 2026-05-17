import React, { useState } from 'react';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { PDFPreview } from './PDFPreview';
import { exportToPDF } from '../../utils/pdfExport';
import styles from './DepositStatement.module.css';
import pdfStyles from './PDFPreview.module.css';
import { formatDate } from '../../utils/dateHelpers';

export const DepositStatement = ({ tenancies, rooms, tenants, settings }) => {
  const [selectedTenancyId, setSelectedTenancyId] = useState('');

  const vacatedTenancies = tenancies.filter(t => t.status === 'vacated' && t.endDate);
  const tenancyOptions = vacatedTenancies.map(t => {
    const tenant = tenants.find(user => user.id === t.tenantId);
    const room = rooms.find(r => r.id === t.roomId);
    return {
      label: `${tenant ? tenant.name : 'Unknown'} - ${room ? room.name : 'Unknown'} (Vacated: ${formatDate(t.endDate)})`,
      value: t.id
    };
  });

  const tenancy = vacatedTenancies.find(t => t.id === selectedTenancyId);
  const tenant = tenancy ? tenants.find(t => t.id === tenancy.tenantId) : null;
  const room = tenancy ? rooms.find(r => r.id === tenancy.roomId) : null;

  const handleGenerate = () => {
    exportToPDF('deposit-preview', `DepositSettlement_${tenant?.name}_${room?.name}`);
  };

  const totalDeductions = tenancy?.depositDeductions.reduce((sum, d) => sum + d.amount, 0) || 0;

  return (
    <div className={styles.container}>
      <Select
        label="Select Vacated Tenancy"
        value={selectedTenancyId}
        onChange={(e) => setSelectedTenancyId(e.target.value)}
        options={[{ label: '-- Select Tenancy --', value: '' }, ...tenancyOptions]}
      />

      {tenancy && (
        <Button variant="primary" onClick={handleGenerate}>
          Download Settlement PDF
        </Button>
      )}

      {tenancy && tenant && room && (
        <PDFPreview id="deposit-preview">
          <div className={pdfStyles.header}>
            <h1 className={pdfStyles.title}>DEPOSIT SETTLEMENT STATEMENT</h1>
            <p className={pdfStyles.subtitle}>{settings.propertyName}</p>
          </div>

          <div className={pdfStyles.section}>
            <h3 className={pdfStyles.sectionTitle}>Tenancy Details</h3>
            <p><strong>Tenant Name:</strong> {tenant.name}</p>
            <p><strong>Room:</strong> {room.name}</p>
            <p><strong>Lease Period:</strong> {formatDate(tenancy.startDate)} to {formatDate(tenancy.endDate)}</p>
          </div>

          <div className={pdfStyles.section}>
            <h3 className={pdfStyles.sectionTitle}>Settlement Calculation</h3>
            <table className={pdfStyles.table}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount (Rs)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Security Deposit Paid</strong></td>
                  <td><strong>{tenancy.depositPaid}</strong></td>
                </tr>
                {tenancy.depositDeductions && tenancy.depositDeductions.length > 0 && (
                  <tr>
                    <td colSpan={2} style={{ backgroundColor: '#fafafa', fontStyle: 'italic' }}>Less Deductions:</td>
                  </tr>
                )}
                {tenancy.depositDeductions && tenancy.depositDeductions.map((d, idx) => (
                  <tr key={idx}>
                    <td style={{ paddingLeft: '20px' }}>- {d.reason}</td>
                    <td>{d.amount}</td>
                  </tr>
                ))}
                <tr>
                  <td><strong>Total Deductions</strong></td>
                  <td><strong>{totalDeductions}</strong></td>
                </tr>
                <tr>
                  <td><strong>Final Refund Amount</strong></td>
                  <td><strong>{tenancy.depositRefunded}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={pdfStyles.section}>
            <p>
              I, <strong>{tenant.name}</strong>, acknowledge that I have received the final refund amount of 
              <strong> Rs. {tenancy.depositRefunded}/-</strong> as full and final settlement of my security deposit 
              for the aforementioned room. I have vacated the premises and handed over the keys to the landlord.
            </p>
          </div>

          <div className={pdfStyles.signatureArea}>
            <div className={pdfStyles.signatureBlock}>
              <div className={pdfStyles.signatureLine}>Tenant Signature ({tenant.name})</div>
            </div>
            <div className={pdfStyles.signatureBlock}>
              <div className={pdfStyles.signatureLine}>Date</div>
            </div>
          </div>
        </PDFPreview>
      )}
    </div>
  );
};
