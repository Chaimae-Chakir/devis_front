import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {AuthService} from "../../core/services/auth.service";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule
  ],
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  // onSubmit() {
  //   if (this.loginForm.invalid) {
  //     return;
  //   }
  //
  //   this.loading = true;
  //   this.errorMessage = '';
  //
  //   this.authService.login(
  //     this.loginForm.get('username')?.value,
  //     this.loginForm.get('password')?.value
  //   ).subscribe({
  //     next: () => {
  //       this.router.navigate(['/dashboard']);
  //     },
  //     error: (error) => {
  //       this.errorMessage = 'Échec de connexion. Veuillez vérifier vos identifiants.';
  //       this.loading = false;
  //     }
  //   });
  // }
  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (response) => {
        this.loading = false;
        this.snackBar.open('Connexion réussie !', 'Fermer', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Identifiants incorrects';
        this.snackBar.open('Échec de la connexion', 'Fermer', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }

}

