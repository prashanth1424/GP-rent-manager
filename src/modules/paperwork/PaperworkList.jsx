import React, { useContext, useState } from 'react';
import { FileText, FileSignature, Receipt } from 'lucide-react';
import { RentContext } from '../../context/RentContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/layout/Modal';
import { ReceiptGenerator } from './ReceiptGenerator';
import { AgreementBuilder } from './AgreementBuilder';
import { DepositStatement } from './DepositStatement';
import styles from './PaperworkList.module.css';

export const PaperworkList = () => {
  const { state } = useContext(RentContext);
  const { bills, tenancies, rooms, tenants, settings } = state;

  const [activeModal, setActiveModal] = useState(null); // 'receipt', 'agreement', 'deposit'

  const closeModal = () => setActiveModal(null);

  return (
    <div className={styles.container}>
      <PageHeader title="Paperwork & PDFs" />

      <div className={styles.grid}>
        <Card onClick={() => setActiveModal('receipt')} className={styles.interactive}>
          <div className={styles.cardContent}>
            <Receipt size={32} className={styles.icon} />
            <h2 className={styles.title}>Rent Receipts</h2>
            <p className={styles.description}>
              Generate standard rent receipts for any recorded payment to provide to your tenants for tax purposes.
            </p>
          </div>
        </Card>

        <Card onClick={() => setActiveModal('agreement')} className={styles.interactive}>
          <div className={styles.cardContent}>
            <FileSignature size={32} className={styles.icon} />
            <h2 className={styles.title}>Tenancy Agreements</h2>
            <p className={styles.description}>
              Generate customized rental agreements for active tenancies, ready for printing and signatures.
            </p>
          </div>
        </Card>

        <Card onClick={() => setActiveModal('deposit')} className={styles.interactive}>
          <div className={styles.cardContent}>
            <FileText size={32} className={styles.icon} />
            <h2 className={styles.title}>Deposit Settlements</h2>
            <p className={styles.description}>
              Generate settlement statements for vacated tenants, detailing deductions and final deposit refunds.
            </p>
          </div>
        </Card>
      </div>

      <Modal isOpen={activeModal === 'receipt'} onClose={closeModal} title="Generate Rent Receipt">
        <ReceiptGenerator bills={bills} rooms={rooms} tenants={tenants} settings={settings} />
      </Modal>

      <Modal isOpen={activeModal === 'agreement'} onClose={closeModal} title="Generate Tenancy Agreement">
        <AgreementBuilder tenancies={tenancies} rooms={rooms} tenants={tenants} settings={settings} />
      </Modal>

      <Modal isOpen={activeModal === 'deposit'} onClose={closeModal} title="Generate Deposit Settlement">
        <DepositStatement tenancies={tenancies} rooms={rooms} tenants={tenants} settings={settings} />
      </Modal>
    </div>
  );
};
