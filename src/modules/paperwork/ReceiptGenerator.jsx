import React, { useState } from 'react';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { PDFPreview } from './PDFPreview';
import { exportToPDF } from '../../utils/pdfExport';
import styles from './ReceiptGenerator.module.css';
import pdfStyles from './PDFPreview.module.css';
import { formatDate } from '../../utils/dateHelpers';

export const ReceiptGenerator = ({ bills, rooms, tenants, settings }) => {
  const [selectedBillId, setSelectedBillId] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState('');

  const billOptions = bills.map(b => {
    const room = rooms.find(r => r.id === b.roomId);
    return {
      label: `${room ? room.name : 'Unknown'} - ${b.month}`,
      value: b.id
    };
  });

  const selectedBill = bills.find(b => b.id === selectedBillId);
  
  const tenantOptions = selectedBill 
    ? selectedBill.charges.map(c => {
        const tenant = tenants.find(t => t.id === c.tenantId);
        return {
          label: tenant ? tenant.name : 'Unknown',
          value: c.tenantId
        };
      })
    : [];

  const handleGenerate = () => {
    exportToPDF('receipt-preview', `Receipt_${selectedBill.roomId}_${selectedBill.month}_${selectedTenantId}`);
  };

  const charge = selectedBill?.charges.find(c => c.tenantId === selectedTenantId);
  const tenant = tenants.find(t => t.id === selectedTenantId);
  const room = rooms.find(r => r.id === selectedBill?.roomId);
  
  // Get latest payment for this tenant in this bill
  const payments = selectedBill?.payments.filter(p => p.tenantId === selectedTenantId) || [];
  const latestPayment = payments.length > 0 ? payments[payments.length - 1] : null;

  return (
    <div className={styles.container}>
      <Select
        label="Select Bill Month & Room"
        value={selectedBillId}
        onChange={(e) => {
          setSelectedBillId(e.target.value);
          setSelectedTenantId('');
        }}
        options={[{ label: '-- Select Bill --', value: '' }, ...billOptions]}
      />

      {selectedBill && (
        <Select
          label="Select Tenant"
          value={selectedTenantId}
          onChange={(e) => setSelectedTenantId(e.target.value)}
          options={[{ label: '-- Select Tenant --', value: '' }, ...tenantOptions]}
        />
      )}

      {selectedBill && selectedTenantId && charge && (
        <Button variant="primary" onClick={handleGenerate} disabled={!latestPayment}>
          {latestPayment ? 'Download Receipt PDF' : 'No payments recorded yet'}
        </Button>
      )}

      {selectedBill && selectedTenantId && charge && latestPayment && (
        <PDFPreview id="receipt-preview">
          <div className={pdfStyles.header}>
            <h1 className={pdfStyles.title}>RENT RECEIPT</h1>
            <p className={pdfStyles.subtitle}>{settings.propertyName}</p>
            <p className={pdfStyles.subtitle}>{settings.address}</p>
          </div>

          <div className={pdfStyles.row}>
            <div>
              <strong>Receipt No:</strong> REC-{room?.id}-{selectedBill.month}-{tenant?.id.substring(0, 4)}
            </div>
            <div>
              <strong>Date:</strong> {formatDate(latestPayment.date)}
            </div>
          </div>

          <div className={pdfStyles.section}>
            <p>
              Received with thanks from <strong>{tenant?.name}</strong>, a sum of 
              <strong> Rs. {latestPayment.amount}/-</strong> 
              towards rent and utilities for <strong>{room?.name}</strong> for the month of <strong>{selectedBill.month}</strong>.
            </p>
          </div>

          <div className={pdfStyles.section}>
            <h3 className={pdfStyles.sectionTitle}>Payment Details</h3>
            <table className={pdfStyles.table}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount (Rs)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Base Rent ({charge.daysOccupied} days)</td>
                  <td>{charge.baseRent}</td>
                </tr>
                <tr>
                  <td>Utility Share</td>
                  <td>{charge.utilityShare}</td>
                </tr>
                <tr>
                  <td><strong>Total Billed</strong></td>
                  <td><strong>{charge.total}</strong></td>
                </tr>
                <tr>
                  <td><strong>Amount Paid</strong></td>
                  <td><strong>{latestPayment.amount}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={pdfStyles.signatureArea}>
            <div className={pdfStyles.signatureBlock}>
              <div className={pdfStyles.signatureLine}>Tenant Signature</div>
            </div>
            <div className={pdfStyles.signatureBlock}>
              <div className={pdfStyles.signatureLine}>Landlord Signature ({settings.landlordName})</div>
            </div>
          </div>
        </PDFPreview>
      )}
    </div>
  );
};
