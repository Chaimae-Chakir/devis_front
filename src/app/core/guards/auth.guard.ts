import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import {AuthService} from "../services/auth.service";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          // Check for required roles if specified
          if (route.data && route.data['roles']) {
            const requiredRoles = route.data['roles'] as string[];
            const hasRequiredRole = requiredRoles.some(role =>
              this.authService.hasRole(role)
            );

            if (!hasRequiredRole) {
              this.router.navigate(['/dashboard']);
              return false;
            }
          }
          return true;
        } else {
          this.router.navigate(['']);
          return false;
        }
      })
    );
  }
}
