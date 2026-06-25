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
  const [selectedComponent, setSelectedComponent] = useState('rent');

  const billOptions = bills.map(b => {
    const room = rooms.find(r => r.id === b.roomId);
    return {
      label: `${room ? `${room.name} (Floor ${room.floor})` : 'Unknown'} - ${b.month}`,
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
  
  const payments = selectedBill?.payments.filter(p => p.tenantId === selectedTenantId) || [];
  const componentPayments = selectedComponent === 'both' 
    ? payments 
    : payments.filter(p => p.appliesTo === selectedComponent || !p.appliesTo); // include legacy
    
  const totalPaid = componentPayments.reduce((sum, p) => sum + p.amount, 0);
  const hasPayments = totalPaid > 0;
  
  // Use the latest payment date for the receipt date if available
  const receiptDate = componentPayments.length > 0 ? componentPayments[componentPayments.length - 1].date : new Date().toISOString();

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

      {selectedBill && selectedTenantId && (
        <Select
          label="Receipt Component"
          value={selectedComponent}
          onChange={(e) => setSelectedComponent(e.target.value)}
          options={[
            { label: 'Rent Only', value: 'rent' },
            { label: 'Utility Only', value: 'utility' },
            { label: 'Both (Consolidated)', value: 'both' }
          ]}
        />
      )}

      {selectedBill && selectedTenantId && charge && (
        <Button variant="primary" onClick={handleGenerate} disabled={!hasPayments}>
          {hasPayments ? 'Download Receipt PDF' : 'No payments recorded for this component'}
        </Button>
      )}

      {selectedBill && selectedTenantId && charge && hasPayments && (
        <PDFPreview id="receipt-preview">
          <div className={pdfStyles.header}>
            <h1 className={pdfStyles.title}>RENT RECEIPT</h1>
            <p className={pdfStyles.subtitle}>{settings.propertyName}</p>
            <p className={pdfStyles.subtitle}>{settings.address}</p>
          </div>

          <div className={pdfStyles.row}>
            <div>
              <strong>Receipt No:</strong> REC-{room?.id}-{selectedBill.month}-{tenant?.id.substring(0, 4)}-{selectedComponent.toUpperCase()}
            </div>
            <div>
              <strong>Date:</strong> {formatDate(receiptDate)}
            </div>
          </div>

          <div className={pdfStyles.section}>
            <p>
              Received with thanks from <strong>{tenant?.name}</strong>, a sum of 
              <strong> Rs. {totalPaid}/-</strong> 
              towards {selectedComponent === 'both' ? 'rent and utilities' : selectedComponent} for <strong>{room?.name}</strong> for the month of <strong>{selectedBill.month}</strong>.
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
                {(selectedComponent === 'rent' || selectedComponent === 'both') && (
                  <tr>
                    <td>Base Rent ({charge.daysOccupied} days)</td>
                    <td>{charge.baseRent}</td>
                  </tr>
                )}
                {(selectedComponent === 'utility' || selectedComponent === 'both') && (
                  <tr>
                    <td>Utility Share</td>
                    <td>{charge.utilityShare}</td>
                  </tr>
                )}
                <tr>
                  <td><strong>Amount Paid</strong></td>
                  <td><strong>{totalPaid}</strong></td>
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
