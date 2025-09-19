
import type { User, UserGroup } from './types';

export const users: User[] = [
    { id: 'user-1', name: 'Ana García', role: 'Director', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', email: 'ana.garcia@example.com' },
    { id: 'user-2', name: 'Carlos Rodríguez', role: 'Responsible', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', email: 'carlos.rodriguez@example.com' },
    { id: 'user-3', name: 'Laura Martinez', role: 'Creator', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d', email: 'laura.martinez@example.com' },
    { id: 'user-4', name: 'Javier López', role: 'Committee', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026708c', email: 'javier.lopez@example.com' },
    { id: 'user-5', name: 'Sofía Hernandez', role: 'Admin', avatar: 'https://i.pravatar.cc/150?u=a0425e8ff4e29026704d', email: 'sofia.hernandez@example.com' },
    { id: 'user-6', name: 'David Fernandez', role: 'Responsible', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f', email: 'david.fernandez@example.com' },
    { id: 'user-7', name: 'Elena Gomez', role: 'Creator', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702e', email: 'elena.gomez@example.com' },
    { id: 'user-8', name: 'Miguel Perez', role: 'Director', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026708d', email: 'miguel.perez@example.com' },
    { id: 'user-9', name: 'Elisabet Jordana', role: 'Creator', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026709e', email: 'elisabet.jordana@example.com' }
  ];
  
  export const groups: UserGroup[] = [
    { id: 'finance@example.com', name: 'Departament Financer', userIds: ['user-1', 'user-2'] },
    { id: 'it-security@example.com', name: 'Seguretat Informàtica', userIds: ['user-5'] },
    { id: 'customer-support@example.com', name: 'Atenció al Client', userIds: ['user-1', 'user-3'] },
    { id: 'quality-management@example.com', name: 'Gestió de Qualitat', userIds: ['user-2', 'user-4'] },
    { id: 'risk-management@example.com', name: 'Gestió de Riscos', userIds: ['user-1', 'user-5'] },
    { id: 'it-legacy-systems@example.com', name: 'Sistemes Legacy', userIds: ['user-5'] },
    { id: 'rsc-committee@example.com', name: 'Comitè RSC', userIds: ['user-3', 'user-4'] },
    { id: 'bcn_ca_director@example.com', name: 'Direcció CA (BCN)', userIds: []}
  ];
