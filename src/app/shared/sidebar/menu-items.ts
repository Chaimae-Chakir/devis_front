import { RouteInfo } from './sidebar.metadata';

export const ROUTES: RouteInfo[] = [
  {
    path: '/dashboard/devis',
    title: 'Devis',
    icon: 'bi bi-file-earmark-text',
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/dashboard/client',
    title: 'Client',
    icon: 'bi bi-people',
    class: '',
    extralink: false,
    submenu: [],
    roles: ['ADMIN']
  },
  {
    path: '/dashboard/parametre',
    title: 'Paramètres',
    icon: 'bi bi-gear',
    class: '',
    extralink: false,
    submenu: []
  }
];
