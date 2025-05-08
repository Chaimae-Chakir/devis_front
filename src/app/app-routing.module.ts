import { NgModule } from '@angular/core';
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
        loadChildren: () => import('./component/devis.module').then(m => m.DevisModule)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/devis'
  }
];
