import { Routes } from '@angular/router';

import { FullComponent } from './layouts/full/full.component';
import { LoginComponent } from "./components/login/login.component";
import { AuthGuard } from "./core/guards/auth.guard";

export const Approutes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    component: FullComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'devis', pathMatch: 'full' },
      {
        path: 'devis',
        loadChildren: () => import('./components/devis/devis.module').then(m => m.DevisModule)
      },
      {
        path: 'client',
        loadChildren: () => import('./components/client/client.module').then(m => m.ClientModule),
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'parametre',
        loadChildren: () => import('./components/parametre/parametre.module').then(m => m.ParametreModule),
        data: { roles: ['ADMIN','USER'] }
      },
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
