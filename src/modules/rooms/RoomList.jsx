import React, { useContext, useState } from 'react';
import { Home, Plus } from 'lucide-react';
import { RentContext } from '../../context/RentContext';
import { getActiveTenantsForRoom } from '../../utils/calculations';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/layout/Modal';
import { RoomCard } from './RoomCard';
import { RoomForm } from './RoomForm';
import { RoomDetail } from './RoomDetail';
import styles from './RoomList.module.css';

export const RoomList = () => {
  const { state, dispatch } = useContext(RentContext);
  const { rooms, tenancies, tenants } = state;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);

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
          />
        )}
      </Modal>
    </div>
  );
};
