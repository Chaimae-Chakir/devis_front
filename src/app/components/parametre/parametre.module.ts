import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UtilisateurComponent } from './utilisateur/utilisateur.component';
import {RouterModule} from "@angular/router";
import {parametreRoutes} from "./parametre.routing";



@NgModule({
  declarations: [
    UtilisateurComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(parametreRoutes),
  ]
})
export class ParametreModule { }
