import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { NavigationComponent } from './header/navigation.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SpinnerComponent } from './spinner.component';

@NgModule({
  declarations: [
    SpinnerComponent
  ],
  imports: [
    CommonModule,
    ConfirmDialogComponent,
    NavigationComponent,
    SidebarComponent
  ],
  exports: [
    ConfirmDialogComponent,
    NavigationComponent,
    SidebarComponent,
    SpinnerComponent
  ]
})
export class SharedModule { }
