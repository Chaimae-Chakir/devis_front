import { Component, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [NgbDropdownModule, CommonModule],
  templateUrl: './navigation.component.html'
})
export class NavigationComponent {
  public username: string = '';
  public isAuthenticated = false;
  public userRoles: string[] = [];

  constructor(
    private modalService: NgbModal,
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;

      if (isAuth) {
        this.loadUserInfo();
      }
    });

    this.authService.userRoles$.subscribe(roles => {
      this.userRoles = roles;
    });

    if (this.authService.getToken()) {
      this.loadUserInfo();
    }
  }

  private loadUserInfo(): void {
    try {
      const token = this.authService.getToken();
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.username = payload.preferred_username ;
      }
    } catch (error) {
      console.error('Erreur lors du décodage du token', error);
      this.username = 'User';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
