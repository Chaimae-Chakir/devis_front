import { Routes, RouterModule } from '@angular/router';

import { FullComponent } from './layouts/full/full.component';

export const Approutes: Routes = [
  {
    path: '',
    component: FullComponent,
    children: [
      { path: '', redirectTo: '/devis', pathMatch: 'full' },
      {
        path: 'devis',
        loadChildren: () => import('./components/devis/devis.module').then(m => m.DevisModule)
      },
      {
        path: 'client',
        loadChildren: () => import('./components/client/client.module').then(m => m.ClientModule)
      },
      {
        path: 'parametre',
        loadChildren: () => import('./components/parametre/parametre.module').then(m => m.ParametreModule)
      },
    ]
  },
  {
    path: '**',
    redirectTo: '/devis'
  }
];
