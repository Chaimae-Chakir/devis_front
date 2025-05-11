import { Routes } from '@angular/router';
import { DevisListComponent } from './devis-list/devis-list.component';
import { DevisFormComponent } from './devis-form/devis-form.component';
import { DevisDetailComponent } from './devis-detail/devis-detail.component';

export const devisRoutes: Routes = [
  {
    path: '',
    component: DevisListComponent
  },
  {
    path: 'new',
    component: DevisFormComponent
  },
  {
    path: 'edit/:id',
    component: DevisFormComponent
  },
  {
    path: 'view/:id',
    component: DevisDetailComponent
  }
];
