import React, { useState } from 'react';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { PDFPreview } from './PDFPreview';
import { exportToPDF } from '../../utils/pdfExport';
import styles from './AgreementBuilder.module.css';
import pdfStyles from './PDFPreview.module.css';
import { formatDate } from '../../utils/dateHelpers';

export const AgreementBuilder = ({ tenancies, rooms, tenants, settings }) => {
  const [selectedTenancyId, setSelectedTenancyId] = useState('');

  const activeTenancies = tenancies.filter(t => t.status === 'active');
  const tenancyOptions = activeTenancies.map(t => {
    const tenant = tenants.find(user => user.id === t.tenantId);
    const room = rooms.find(r => r.id === t.roomId);
    return {
      label: `${tenant ? tenant.name : 'Unknown'} - ${room ? room.name : 'Unknown'}`,
      value: t.id
    };
  });

  const tenancy = activeTenancies.find(t => t.id === selectedTenancyId);
  const tenant = tenancy ? tenants.find(t => t.id === tenancy.tenantId) : null;
  const room = tenancy ? rooms.find(r => r.id === tenancy.roomId) : null;

  const handleGenerate = () => {
    exportToPDF('agreement-preview', `Agreement_${tenant?.name}_${room?.name}`);
  };

  return (
    <div className={styles.container}>
      <Select
        label="Select Active Tenancy"
        value={selectedTenancyId}
        onChange={(e) => setSelectedTenancyId(e.target.value)}
        options={[{ label: '-- Select Tenancy --', value: '' }, ...tenancyOptions]}
      />

      {tenancy && (
        <Button variant="primary" onClick={handleGenerate}>
          Download Agreement PDF
        </Button>
      )}

      {tenancy && tenant && room && (
        <PDFPreview id="agreement-preview">
          <div className={pdfStyles.header}>
            <h1 className={pdfStyles.title}>RENTAL AGREEMENT</h1>
            <p className={pdfStyles.subtitle}>Made on {formatDate(new Date().toISOString())}</p>
          </div>

          <div className={pdfStyles.section}>
            <p>This Rental Agreement is made and executed by and between:</p>
            <p>
              <strong>LANDLORD:</strong> {settings.landlordName}, residing at {settings.address}.<br/>
              (Hereinafter called the "Landlord")
            </p>
            <p style={{ textAlign: 'center' }}>AND</p>
            <p>
              <strong>TENANT:</strong> {tenant.name}, carrying ID proof {tenant.idProof || 'N/A'}, 
              contact number {tenant.phone}.<br/>
              (Hereinafter called the "Tenant")
            </p>
          </div>

          <div className={pdfStyles.section}>
            <h3 className={pdfStyles.sectionTitle}>1. Premises</h3>
            <p>
              The Landlord hereby lets out <strong>{room.name}</strong> (Type: {room.type.toUpperCase()}, Floor: {room.floor}) 
              located at {settings.propertyName}, {settings.address} to the Tenant.
            </p>
          </div>

          <div className={pdfStyles.section}>
            <h3 className={pdfStyles.sectionTitle}>2. Term and Rent</h3>
            <p>
              The lease shall commence on <strong>{formatDate(tenancy.startDate)}</strong>. 
              The agreed monthly base rent is <strong>Rs. {tenancy.agreedRent}/-</strong>, payable in advance on or before the 1st of every calendar month. Utility bills will be calculated and billed separately each month.
            </p>
          </div>

          <div className={pdfStyles.section}>
            <h3 className={pdfStyles.sectionTitle}>3. Security Deposit</h3>
            <p>
              The Tenant has paid a security deposit of <strong>Rs. {tenancy.depositPaid}/-</strong>. 
              This deposit shall be refunded at the time of vacating the premises, subject to deductions for damages or unpaid dues.
            </p>
          </div>

          <div className={pdfStyles.section}>
            <h3 className={pdfStyles.sectionTitle}>4. Standard Clauses</h3>
            <ul>
              <li style={{ marginBottom: 5 }}>Notice period of 30 days must be provided before vacating.</li>
              <li style={{ marginBottom: 5 }}>Subletting the room or bed is strictly prohibited.</li>
              <li style={{ marginBottom: 5 }}>The Tenant shall maintain the premises in good condition.</li>
              <li style={{ marginBottom: 5 }}>The Landlord reserves the right to terminate this agreement with 30 days notice.</li>
            </ul>
          </div>

          <div className={pdfStyles.signatureArea}>
            <div className={pdfStyles.signatureBlock}>
              <div className={pdfStyles.signatureLine}>Tenant Signature ({tenant.name})</div>
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
