import React, { useContext, useState } from 'react';
import { Users, Plus } from 'lucide-react';
import { RentContext } from '../../context/RentContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/layout/Modal';
import { ConfirmDialog } from '../../components/layout/ConfirmDialog';
import { TenantCard } from './TenantCard';
import { TenantForm } from './TenantForm';
import { TenantDetail } from './TenantDetail';
import { AssignRoomModal } from './AssignRoomModal';
import { VacateTenantModal } from './VacateTenantModal';
import { generateId } from '../../utils/idGenerator';
import styles from './TenantList.module.css';

export const TenantList = () => {
  const { state, dispatch } = useContext(RentContext);
  const { tenants, tenancies, rooms } = state;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [editingTenant, setEditingTenant] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isVacateModalOpen, setIsVacateModalOpen] = useState(false);
  const [deletingTenant, setDeletingTenant] = useState(null);
  
  // State for handling co-tenant rent splits
  const [coTenantPrompt, setCoTenantPrompt] = useState(null);

  const handleAddTenant = (tenantData) => {
    if (editingTenant) {
      dispatch({ type: 'UPDATE_TENANT', payload: tenantData });
      setEditingTenant(null);
      setSelectedTenant(tenantData); // update detail view
    } else {
      dispatch({ type: 'ADD_TENANT', payload: tenantData });
    }
    setIsFormOpen(false);
  };

  const openEditForm = (tenant) => {
    setEditingTenant(tenant);
    setIsFormOpen(true);
  };

  const handleDeleteTenant = () => {
    if (deletingTenant) {
      dispatch({ type: 'DELETE_TENANT', payload: deletingTenant.id });
      setDeletingTenant(null);
      setSelectedTenant(null); // Close the detail modal too
    }
  };

  const getActiveTenancy = (tenantId) => {
    return tenancies.find(t => t.tenantId === tenantId && t.status === 'active' && !t.endDate);
  };

  const getRoom = (roomId) => {
    return rooms.find(r => r.id === roomId);
  };

  const handleAssign = (newTenancy, coTenantData) => {
    dispatch({ type: 'CREATE_TENANCY', payload: newTenancy });
    setIsAssignModalOpen(false);
    
    if (coTenantData && coTenantData.splitRentPrompt) {
      setCoTenantPrompt({
        type: 'split',
        coTenant: coTenantData,
        room: getRoom(newTenancy.roomId),
        message: 'This is a double room. Do you want to adjust the existing tenant\'s rent share?'
      });
    }
  };

  const handleVacate = (updatedTenancy, coTenantData) => {
    dispatch({ type: 'CLOSE_TENANCY', payload: updatedTenancy });
    setIsVacateModalOpen(false);

    if (coTenantData) {
      setCoTenantPrompt({
        type: 'absorb',
        coTenant: coTenantData,
        room: getRoom(updatedTenancy.roomId),
        message: 'The co-tenant has left. Since the policy is "Remaining Tenant Pays Full", do you want to update this tenant\'s rent share to the full room amount?'
      });
    }
  };

  const handleCoTenantUpdate = () => {
    if (!coTenantPrompt) return;

    const { coTenant, room, type } = coTenantPrompt;
    
    // Close old record
    const today = new Date().toISOString().split('T')[0];
    dispatch({
      type: 'CLOSE_TENANCY',
      payload: { ...coTenant, endDate: today, depositRefunded: 0, depositDeductions: [] }
    });

    // Create new record
    const newRent = type === 'split' ? room.defaultRent / 2 : room.defaultRent;
    
    dispatch({
      type: 'CREATE_TENANCY',
      payload: {
        ...coTenant,
        id: generateId('tenancy'),
        startDate: today,
        endDate: null,
        agreedRent: newRent,
        status: 'active'
      }
    });

    setCoTenantPrompt(null);
  };

  return (
    <div className={styles.container}>
      <PageHeader 
        title="Tenants" 
        actions={
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus size={20} />
            Add Tenant
          </Button>
        }
      />

      {tenants.length === 0 ? (
        <div className={styles.emptyState}>
          <Users size={48} className={styles.emptyStateIcon} />
          <h2 className={styles.emptyStateText}>No tenants added yet</h2>
          <Button onClick={() => setIsFormOpen(true)}>Add Your First Tenant</Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {tenants.map(tenant => {
            const activeTenancy = getActiveTenancy(tenant.id);
            const room = activeTenancy ? getRoom(activeTenancy.roomId) : null;
            return (
              <TenantCard
                key={tenant.id}
                tenant={tenant}
                activeTenancy={activeTenancy}
                room={room}
                onClick={() => setSelectedTenant(tenant)}
              />
            );
          })}
        </div>
      )}

      <Modal 
        isOpen={isFormOpen} 
        onClose={() => { setIsFormOpen(false); setEditingTenant(null); }} 
        title={editingTenant ? "Edit Tenant" : "Add New Tenant"}
      >
        <TenantForm 
          initialData={editingTenant}
          onSubmit={handleAddTenant} 
          onCancel={() => { setIsFormOpen(false); setEditingTenant(null); }} 
        />
      </Modal>

      <Modal
        isOpen={!!selectedTenant}
        onClose={() => setSelectedTenant(null)}
        title={selectedTenant?.name}
      >
        {selectedTenant && (
          <TenantDetail 
            tenant={selectedTenant}
            tenancies={tenancies}
            rooms={rooms}
            activeTenancy={getActiveTenancy(selectedTenant.id)}
            onOpenAssign={() => setIsAssignModalOpen(true)}
            onOpenVacate={() => setIsVacateModalOpen(true)}
            onEdit={() => openEditForm(selectedTenant)}
            onDelete={() => setDeletingTenant(selectedTenant)}
          />
        )}
      </Modal>

      {selectedTenant && (
        <>
          <AssignRoomModal
            isOpen={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
            tenant={selectedTenant}
            rooms={rooms}
            tenancies={tenancies}
            onAssign={handleAssign}
          />
          <VacateTenantModal
            isOpen={isVacateModalOpen}
            onClose={() => setIsVacateModalOpen(false)}
            tenant={selectedTenant}
            activeTenancy={getActiveTenancy(selectedTenant.id)}
            room={getActiveTenancy(selectedTenant.id) ? getRoom(getActiveTenancy(selectedTenant.id).roomId) : null}
            tenancies={tenancies}
            onVacate={handleVacate}
          />
        </>
      )}

      <ConfirmDialog
        isOpen={!!coTenantPrompt}
        onClose={() => setCoTenantPrompt(null)}
        onConfirm={handleCoTenantUpdate}
        title="Update Co-Tenant Rent"
        message={coTenantPrompt?.message}
        confirmText="Update Rent"
      />

      <ConfirmDialog
        isOpen={!!deletingTenant}
        onClose={() => setDeletingTenant(null)}
        onConfirm={handleDeleteTenant}
        title="Delete Tenant"
        message={`Are you sure you want to completely delete ${deletingTenant?.name}? This action cannot be undone and may leave orphaned tenancy records.`}
        confirmText="Delete Permanently"
      />
    </div>
  );
};
