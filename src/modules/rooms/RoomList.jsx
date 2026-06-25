import React, { useContext, useState } from 'react';
import { Home, Plus } from 'lucide-react';
import { RentContext } from '../../context/RentContext';
import { getActiveTenantsForRoom } from '../../utils/calculations';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/layout/Modal';
import { ConfirmDialog } from '../../components/layout/ConfirmDialog';
import { RoomCard } from './RoomCard';
import { RoomForm } from './RoomForm';
import { RoomDetail } from './RoomDetail';
import { VacateTenantModal } from '../tenants/VacateTenantModal';
import { generateId } from '../../utils/idGenerator';
import styles from './RoomList.module.css';

export const RoomList = () => {
  const { state, dispatch } = useContext(RentContext);
  const { rooms, tenancies, tenants } = state;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [vacatingTenantData, setVacatingTenantData] = useState(null);
  const [coTenantPrompt, setCoTenantPrompt] = useState(null);

  const handleAddRoom = (roomData) => {
    if (editingRoom) {
      dispatch({ type: 'UPDATE_ROOM', payload: roomData });
      setEditingRoom(null);
      setSelectedRoom(roomData); // update the detail view
    } else {
      dispatch({ type: 'ADD_ROOM', payload: roomData });
    }
    setIsFormOpen(false);
  };

  const openEditForm = (room) => {
    setEditingRoom(room);
    setIsFormOpen(true);
  };

  const handleVacate = (updatedTenancy, coTenantData) => {
    dispatch({ type: 'CLOSE_TENANCY', payload: updatedTenancy });
    setVacatingTenantData(null);

    if (coTenantData) {
      setCoTenantPrompt({
        type: 'absorb',
        coTenant: coTenantData,
        room: selectedRoom,
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
        title="Rooms" 
        actions={
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus size={20} />
            Add Room
          </Button>
        }
      />

      {rooms.length === 0 ? (
        <div className={styles.emptyState}>
          <Home size={48} className={styles.emptyStateIcon} />
          <h2 className={styles.emptyStateText}>No rooms added yet</h2>
          <Button onClick={() => setIsFormOpen(true)}>Add Your First Room</Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {rooms.map(room => (
            <RoomCard
              key={room.id}
              room={room}
              activeTenancies={getActiveTenantsForRoom(tenancies, room.id)}
              tenants={tenants}
              onClick={() => setSelectedRoom(room)}
            />
          ))}
        </div>
      )}

      <Modal 
        isOpen={isFormOpen} 
        onClose={() => { setIsFormOpen(false); setEditingRoom(null); }} 
        title={editingRoom ? "Edit Room" : "Add New Room"}
      >
        <RoomForm 
          initialData={editingRoom}
          onSubmit={handleAddRoom} 
          onCancel={() => { setIsFormOpen(false); setEditingRoom(null); }} 
        />
      </Modal>

      <Modal
        isOpen={!!selectedRoom}
        onClose={() => setSelectedRoom(null)}
        title={selectedRoom?.name}
      >
        {selectedRoom && (
          <RoomDetail 
            room={selectedRoom} 
            tenancies={tenancies} 
            tenants={tenants} 
            onEdit={() => openEditForm(selectedRoom)}
            onVacateTenant={(tenant, tenancy) => setVacatingTenantData({ tenant, tenancy })}
          />
        )}
      </Modal>

      {vacatingTenantData && (
        <VacateTenantModal
          isOpen={true}
          onClose={() => setVacatingTenantData(null)}
          tenant={vacatingTenantData.tenant}
          activeTenancy={vacatingTenantData.tenancy}
          room={selectedRoom}
          tenancies={tenancies}
          onVacate={handleVacate}
        />
      )}

      <ConfirmDialog
        isOpen={!!coTenantPrompt}
        onClose={() => setCoTenantPrompt(null)}
        onConfirm={handleCoTenantUpdate}
        title="Update Co-Tenant Rent"
        message={coTenantPrompt?.message}
        confirmText="Update Rent"
      />
    </div>
  );
};
