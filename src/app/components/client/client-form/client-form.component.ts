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
  styleUrls: ['client-form.component.scss']
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
    if (this.data.isEdit && this.data.clientData) {
      this.isEditMode = true;
      this.clientData = this.data.clientData;
      this.patchFormValues();
    }
  }
  private patchFormValues(): void {
    if (this.clientData) {
      this.clientForm.patchValue({
        nom: this.clientData.nom,
        ice: this.clientData.ice,
        logoUrl: this.clientData.logoUrl,
        adresse: this.clientData.adresse,
        ville: this.clientData.ville,
        pays: this.clientData.pays
      });
    }
  }

  loadClient(id: number): void {
    this.isLoading = true;
    this.clientService.getClientById(id).subscribe({
      next: (client) => {
        this.clientForm.patchValue({
          nom: client.nom,
          ice: client.ice,
          logoUrl: client.logoUrl,
          adresse: client.adresse,
          ville: client.ville,
          pays: client.pays
        });
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Failed to load client', 'Close', { duration: 3000 });
        this.router.navigate(['/clients']);
      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      return;
    }

    this.isLoading = true;
    const clientData: ClientRequest = this.clientForm.value;

    if (this.isEditMode && this.clientData) {
      this.clientService.updateClient(this.clientData?.id, clientData).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Client updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/clients']);
        },
        error: () => {
          this.isLoading = false;
          this.snackBar.open('Failed to update client', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.clientService.createClient(clientData).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Client created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/clients']);
        },
        error: () => {
          this.isLoading = false;
          this.snackBar.open('Failed to create client', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/clients']);
  }
}
