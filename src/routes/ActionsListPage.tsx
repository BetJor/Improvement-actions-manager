
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActions } from '@/hooks/useActions';
import { ActionCard } from '@/components/ActionCard';
import { CreateActionModal } from '@/components/CreateActionModal';
import { Header } from '@/components/header';

export const ActionsListPage: React.FC = () => {
  const { actions, isLoading, error } = useActions();
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = (id: string) => {
    navigate(`/actions/${id}`);
  };

  return (
    <div style={styles.page}>
      <Header />

      <main style={styles.main}>
        <div style={styles.header}>
          <h1>Gestor d'Accions de Millora</h1>
          <button onClick={() => setModalOpen(true)} style={styles.button}>Nova Acció</button>
        </div>
        {isLoading && <p>Carregant accions...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {actions.map(action => (
          <ActionCard 
            key={action.id} 
            action={action} 
            onClick={() => handleCardClick(action.id)} 
          />
        ))}
      </main>
      <CreateActionModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
      />
    </div>
  );
};

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    minHeight: '100vh',
    backgroundColor: '#f4f7f9',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #ddd',
  },
  main: {
    flex: 1,
    padding: '20px',
  },
  button: {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  }
};
