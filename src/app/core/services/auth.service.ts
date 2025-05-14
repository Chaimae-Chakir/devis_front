import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { TokenResponse } from "../../models/tokenResponse.model";
import { JwtHelperService } from "@auth0/angular-jwt";

@Injectable()
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
  private readonly TOKEN_EXPIRES_AT_KEY = 'auth_expires_at';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private userRolesSubject = new BehaviorSubject<string[]>(this.getUserRoles());
  public userRoles$ = this.userRolesSubject.asObservable();

  // Flag to prevent multiple concurrent token refresh requests
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<any>(null);

  private jwtHelper = new JwtHelperService();
  private apiUrl = 'http://localhost:8080/api';
  private tokenRefreshInterval: any;

  constructor(private http: HttpClient) {
    this.initializeAuthFromStorage();
    this.setupTokenExpirationCheck();
  }

  private initializeAuthFromStorage(): void {
    if (this.hasValidToken()) {
      this.isAuthenticatedSubject.next(true);
      this.userRolesSubject.next(this.getUserRoles());
    } else {
      const hasToken = !!localStorage.getItem(this.TOKEN_KEY);
      if (hasToken) {
        console.log('Potentially expired token found in storage, checking if it can be refreshed');
        // Check if we have a refresh token to try
        const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
        if (refreshToken) {
          this.refreshToken().subscribe({
            next: () => console.log('Token successfully refreshed during initialization'),
            error: (err) => {
              console.warn('Failed to refresh token during initialization, logging out', err);
              this.clearTokens();
              this.isAuthenticatedSubject.next(false);
              this.userRolesSubject.next([]);
            }
          });
        } else {
          console.warn('No refresh token available, clearing invalid tokens');
          this.clearTokens();
          this.isAuthenticatedSubject.next(false);
          this.userRolesSubject.next([]);
        }
      } else {
        this.isAuthenticatedSubject.next(false);
        this.userRolesSubject.next([]);
      }
    }
  }

  private setupTokenExpirationCheck(): void {
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
    }

    // Run once immediately
    this.checkTokenExpiration();

    // Then set up interval - checking every minute
    this.tokenRefreshInterval = setInterval(() => {
      this.checkTokenExpiration();
    }, 60 * 1000); // Check every minute
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/auth/login`, { username, password })
        .pipe(
            tap(response => this.handleAuthSuccess(response)),
            map(() => true),
            catchError(error => {
              console.error('Login failed', error);
              return throwError(() => new Error(error.error?.error_description || 'Login failed'));
            })
        );
  }

  logout(): void {
    this.clearTokens();

    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
      this.tokenRefreshInterval = null;
    }

    this.isAuthenticatedSubject.next(false);
    this.userRolesSubject.next([]);
  }

  private clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRES_AT_KEY);
  }

  refreshToken(): Observable<boolean> {
    // If already refreshing, wait for completion of that request
    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
          switchMap(token => {
            if (token) {
              return of(true);
            } else {
              return throwError(() => new Error('Session expired. Please login again.'));
            }
          })
      );
    }

    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      console.warn('No refresh token available');
      return throwError(() => new Error('Session expired. Please login again.'));
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    console.log('Attempting to refresh token...');
    return this.http.post<TokenResponse>(`${this.apiUrl}/auth/refresh`, { refreshToken })
        .pipe(
            tap(response => {
              console.log('Token refresh successful, storing new tokens');
              this.handleAuthSuccess(response);
              this.refreshTokenSubject.next(response.access_token);
            }),
            map(() => true),
            catchError((error: HttpErrorResponse) => {
              console.error('Token refresh failed', error);

              // Additional error details logging to help debug
              if (error.error) {
                console.error('Error details:', JSON.stringify(error.error));
              }

              this.logout();
              return throwError(() => new Error('Session expired. Please login again.'));
            }),
            // Always mark as no longer refreshing when complete
            tap(() => {
              this.isRefreshing = false;
            }, () => {
              this.isRefreshing = false;
            })
        );
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  hasRole(role: string): boolean {
    const roles = this.getUserRoles();
    return roles.includes(role);
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isCommercial(): boolean {
    return this.hasRole('USER');  // Changed from COMMERCIAL to USER to match backend roles
  }

  private handleAuthSuccess(response: TokenResponse): void {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + response.expires_in);

    localStorage.setItem(this.TOKEN_KEY, response.access_token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refresh_token);
    localStorage.setItem(this.TOKEN_EXPIRES_AT_KEY, expiresAt.getTime().toString());

    this.isAuthenticatedSubject.next(true);
    this.userRolesSubject.next(this.getUserRoles());

    // Reset token check interval when we get new tokens
    this.setupTokenExpirationCheck();
  }

  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      return !this.jwtHelper.isTokenExpired(token);
    } catch (err) {
      return false;
    }
  }

  getUserRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];

    try {
      const decodedToken = this.jwtHelper.decodeToken(token);
      const realmRoles = decodedToken.realm_access?.roles || [];
      return realmRoles.map((role: string) => role.toUpperCase());
    } catch (err) {
      console.error('Error decoding token', err);
      return [];
    }
  }

  private checkTokenExpiration(): void {
    if (!this.isAuthenticatedSubject.value) return;

    const expiresAtStr = localStorage.getItem(this.TOKEN_EXPIRES_AT_KEY);
    if (!expiresAtStr) return;

    const expiresAt = parseInt(expiresAtStr, 10);
    const now = new Date().getTime();

    // Refresh token if it expires in less than 5 minutes
    if (expiresAt - now < 5 * 60 * 1000 && expiresAt > now) {
      console.log('Token expiring soon, refreshing...');
      if (!this.isRefreshing) {
        this.refreshToken().subscribe({
          next: () => {
            console.log('Token refreshed successfully');
          },
          error: (err) => {
            console.error('Token refresh failed during expiration check', err);
            this.logout();
          }
        });
      }
    } else if (expiresAt <= now) {
      console.warn('Token has expired, attempting to refresh');
      if (!this.isRefreshing) {
        this.refreshToken().subscribe({
          next: () => {
            console.log('Token refreshed successfully after expiration');
          },
          error: (err) => {
            console.error('Token refresh failed after expiration', err);
            this.logout();
          }
        });
      }
    }
  }
}
