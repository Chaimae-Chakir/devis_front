import { Component, OnInit } from '@angular/core';
import { ROUTES } from './menu-items';
import { RouteInfo } from './sidebar.metadata';
import { RouterModule } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule, NgIf],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  showMenu = '';
  public sidebarnavItems: RouteInfo[] = [];
  public userRoles: string[] = [];

  constructor(private authService: AuthService) {
    // S'abonner aux changements de rôles utilisateur
    this.authService.userRoles$.subscribe(roles => {
      this.userRoles = roles;
      // Mettre à jour les éléments du menu lorsque les rôles changent
      this.updateMenuItems();
    });
  }

  // Méthode pour vérifier si l'utilisateur a accès à un élément de menu
  hasAccess(item: RouteInfo): boolean {
    // Si aucun rôle n'est spécifié pour cet élément, tout le monde y a accès
    if (!item.roles || item.roles.length === 0) {
      return true;
    }

    // Vérifier si l'utilisateur a au moins un des rôles requis
    return this.userRoles.some(role => item.roles?.includes(role));
  }

  // Mettre à jour les éléments du menu en fonction des rôles de l'utilisateur
  updateMenuItems() {
    // Filtrer les éléments du menu auxquels l'utilisateur a accès
    this.sidebarnavItems = ROUTES.filter(item => this.hasAccess(item));
  }

  // this is for the open close
  addExpandClass(element: string) {
    if (element === this.showMenu) {
      this.showMenu = '0';
    } else {
      this.showMenu = element;
    }
  }

  ngOnInit() {
    this.updateMenuItems();
  }
}
