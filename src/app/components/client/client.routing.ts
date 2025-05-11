import { Routes } from '@angular/router';
import {ClientListComponent} from "./client-list/client-list.component";
import {ClientFormComponent} from "./client-form/client-form.component";

export const clientRoutes: Routes = [
  {
    path: '',
    component: ClientListComponent
  },
  {
    path: 'new',
    component: ClientFormComponent
  },
  {
    path: 'edit/:id',
    component: ClientFormComponent
  }
];
