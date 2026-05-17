import React, { useContext, useState, useRef } from 'react';
import { Upload, Download, AlertTriangle } from 'lucide-react';
import { RentContext } from '../../context/RentContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/layout/ConfirmDialog';
import { exportToJSON, importFromJSON } from '../../utils/storage';
import styles from './SettingsPage.module.css';

export const SettingsPage = () => {
  const { state, dispatch } = useContext(RentContext);
  const { settings } = state;
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(settings);
  const [isClearDataOpen, setIsClearDataOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importError, setImportError] = useState('');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    dispatch({ type: 'UPDATE_SETTINGS', payload: formData });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExport = () => {
    exportToJSON(state);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await importFromJSON(file);
      dispatch({ type: 'IMPORT_DATA', payload: data });
      setImportError('');
      alert("Data imported successfully!");
    } catch (err) {
      setImportError(err.message);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearData = () => {
    const confirmInput = prompt("Type 'DELETE ALL' to confirm data wiping:");
    if (confirmInput === 'DELETE ALL') {
      dispatch({ type: 'CLEAR_DATA' });
      setIsClearDataOpen(false);
      alert("All data has been cleared.");
    } else if (confirmInput !== null) {
      alert("Verification failed. Data was not cleared.");
      setIsClearDataOpen(false);
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader title="Settings" />

      <div className={styles.content}>
        
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Property Information</h2>
          <form className={styles.form} onSubmit={handleSaveSettings}>
            <Input
              label="Property Name"
              value={formData.propertyName}
              onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
            />
            <Input
              label="Landlord Name"
              value={formData.landlordName}
              onChange={(e) => setFormData({ ...formData, landlordName: e.target.value })}
            />
            <Input
              label="Landlord Phone"
              value={formData.landlordPhone}
              onChange={(e) => setFormData({ ...formData, landlordPhone: e.target.value })}
            />
            <Input
              label="Property Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <Input
              label="Electricity Rate (₹ per unit)"
              type="number"
              value={formData.electricityRatePerUnit || ''}
              onChange={(e) => setFormData({ ...formData, electricityRatePerUnit: Number(e.target.value) || 0 })}
            />
            
            <Select
              label="Vacant Room Utility Policy (Who pays when a room is entirely empty?)"
              value={formData.vacantRoomUtilityPolicy}
              onChange={(e) => setFormData({ ...formData, vacantRoomUtilityPolicy: e.target.value })}
              options={[
                { label: 'Landlord Absorbs Cost', value: 'absorb' },
                { label: 'Redistribute Among Occupied Rooms', value: 'redistribute' }
              ]}
            />

            <div className={styles.actions}>
              <Button type="submit" variant="primary">
                {saveSuccess ? 'Saved ✓' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Data Management</h2>
          <div className={styles.form}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Your data is stored locally in your browser. Use these tools to back up your data or move it to another device.
            </p>
            
            <div className={styles.dataActions}>
              <Button variant="secondary" onClick={handleExport}>
                <Download size={18} />
                Export Full Backup (.json)
              </Button>
              
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                <Upload size={18} />
                Import Backup
              </Button>
              <input 
                type="file" 
                accept=".json" 
                ref={fileInputRef} 
                onChange={handleImport}
                className={styles.fileInput}
              />
              
              {importError && (
                <div style={{ color: 'var(--status-overdue)', fontSize: '0.875rem' }}>
                  {importError}
                </div>
              )}

              <Button variant="danger" onClick={() => setIsClearDataOpen(true)} style={{ marginTop: '24px' }}>
                <AlertTriangle size={18} />
                Clear All Data
              </Button>
            </div>
          </div>
        </div>

      </div>

      <ConfirmDialog
        isOpen={isClearDataOpen}
        onClose={() => setIsClearDataOpen(false)}
        onConfirm={handleClearData}
        title="Clear All Data?"
        message="This action cannot be undone. All rooms, tenants, bills, and history will be permanently deleted unless you have a backup."
        confirmText="Proceed"
        isDanger={true}
      />
    </div>
  );
};
