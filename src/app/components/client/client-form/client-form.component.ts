import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientRequest } from '../../../models/client.model';
import { ClientService } from '../../../services/client.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { ClientResponse } from '../../../models/client.model';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss']
})
export class ClientFormComponent implements OnInit {
  clientForm: FormGroup;
  isEditMode = false;
  clientData!: ClientResponse;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ClientFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.clientForm = this.fb.group({
      nom: ['', Validators.required],
      ice: ['', [Validators.required, Validators.pattern(/^[0-9]{15}$/)]],
      logoUrl: [''],
      adresse: ['', Validators.required],
      ville: ['', Validators.required],
      pays: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    console.log('Dialog data:', this.data);
    if (this.data && this.data.isEdit && this.data.clientData) {
      this.isEditMode = true;
      this.clientData = this.data.clientData;
      this.patchFormValues();
    }
  }

  private patchFormValues(): void {
    if (this.clientData) {
      console.log('Patching form with values:', this.clientData);
      // Use setTimeout to ensure Angular's change detection picks up the changes
      setTimeout(() => {
        this.clientForm.patchValue({
          nom: this.clientData.nom || '',
          ice: this.clientData.ice || '',
          logoUrl: this.clientData.logoUrl || '',
          adresse: this.clientData.adresse || '',
          ville: this.clientData.ville || '',
          pays: this.clientData.pays || ''
        });

        // Mark all fields as touched to trigger validation
        Object.keys(this.clientForm.controls).forEach(key => {
          const control = this.clientForm.get(key);
          if (control) {
            control.markAsTouched();
            control.updateValueAndValidity();
          }
        });

        console.log('Form valid after patch:', this.clientForm.valid);
        console.log('Form values after patch:', this.clientForm.value);
        console.log('Form errors:', this.getFormValidationErrors());
      });
    }
  }

  // Helper method to debug form validation errors
  getFormValidationErrors() {
    const errors: any = {};
    Object.keys(this.clientForm.controls).forEach(key => {
      const control = this.clientForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.clientForm.controls).forEach(key => {
        const control = this.clientForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      this.snackBar.open('Veuillez corriger les erreurs du formulaire', 'Fermer', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const clientData: ClientRequest = this.clientForm.value;

    if (this.isEditMode && this.clientData) {
      this.clientService.updateClient(this.clientData.id, clientData).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Client mis à jour avec succès', 'Fermer', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error updating client:', err);
          this.snackBar.open('Échec de la mise à jour du client', 'Fermer', { duration: 3000 });
        }
      });
    } else {
      this.clientService.createClient(clientData).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Client créé avec succès', 'Fermer', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error creating client:', err);
          this.snackBar.open('Échec de la création du client', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
