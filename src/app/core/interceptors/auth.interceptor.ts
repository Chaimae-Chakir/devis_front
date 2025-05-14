import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import {AuthService} from "../services/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Exclude auth endpoints from token addition
    if (this.isAuthUrl(request.url)) {
      return next.handle(request);
    }

    // Add token to all other requests
    const token = this.authService.getToken();
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        } else {
          return throwError(() => error);
        }
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private isAuthUrl(url: string): boolean {
    return url.includes('/api/auth/login') || url.includes('/api/auth/refresh');
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      console.log('Auth interceptor handling 401 error, attempting to refresh token');
      return this.authService.refreshToken().pipe(
        switchMap(() => {
          this.isRefreshing = false;
          const token = this.authService.getToken();
          console.log('Token refreshed successfully, retrying request with new token');
          this.refreshTokenSubject.next(token);
          return next.handle(this.addToken(request, token!));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          console.error('Failed to refresh token in interceptor:', error);
          this.authService.logout();
          return throwError(() => error);
        })
      );
    } else {
      console.log('Token refresh already in progress, waiting for completion');
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          console.log('Using refreshed token from subject for request');
          return next.handle(this.addToken(request, token));
        })
      );
    }
  }
}
