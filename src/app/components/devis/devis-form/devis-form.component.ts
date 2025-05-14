import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {DevisService} from "../../../services/devis.service";
import {ClientService} from "../../../services/client.service";
import {DevisRequest, DevisLigneRequest} from "../../../models/devis-request.model";
import {ClientPageResponse, ClientResponse} from "../../../models/client.model";

@Component({
  selector: 'app-devis-form',
  templateUrl: './devis-form.component.html',
  styleUrls: ['./devis-form.component.scss']
})
export class DevisFormComponent implements OnInit {
  devisForm: FormGroup;
  isEditMode = false;
  devisId: number | null = null;
  isLoading = false;
  clients: ClientResponse[]=[];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    protected router: Router,
    private devisService: DevisService,
    private clientService: ClientService,
    private snackBar: MatSnackBar
  ) {
    this.devisForm = this.fb.group({
      clientId: ['', Validators.required],
      perimetre: [''],
      offreFonctionnelle: [''],
      offreTechnique: [''],
      conditions: [''],
      planning: [''],
      offrePdfUrl: [''],
      lignes: this.fb.array([this.createLigne()])
    });
  }

  ngOnInit(): void {
    this.loadClients();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.devisId = +params['id'];
        this.loadDevis(this.devisId);
      }
    });
  }

  get lignes(): FormArray {
    return this.devisForm.get('lignes') as FormArray;
  }

  createLigne(ligne?: DevisLigneRequest): FormGroup {
    return this.fb.group({
      descriptionLibre: [ligne?.descriptionLibre ?? ''],
      quantite: [ligne?.quantite ?? 1, [Validators.required, Validators.min(0.01)]],
      prixUnitaireHt: [ligne?.prixUnitaireHt ?? 0, [Validators.required, Validators.min(0.01)]],
      tvaPct: [ligne?.tvaPct ?? 20],
      ristournePct: [ligne?.ristournePct ?? 20]
    });
  }

  addLigne(): void {
    this.lignes.push(this.createLigne());
  }

  removeLigne(index: number): void {
    this.lignes.removeAt(index);
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe({
      next: (response) => {
        console.log('Clients loaded:', response);
        this.clients=response.clients;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
      }
    });
  }

  loadDevis(id: number): void {
    this.isLoading = true;
    this.devisService.getDevisById(id).subscribe({
      next: (devis) => {
        this.devisForm.patchValue({
          clientId: devis.clientId,
          perimetre: devis.perimetre,
          offreFonctionnelle: devis.offreFonctionnelle,
          offreTechnique: devis.offreTechnique,
          conditions: devis.conditions,
          planning: devis.planning,
          offrePdfUrl: devis.offrePdfUrl
        });
        // Clear existing lines
        while (this.lignes.length) {
          this.lignes.removeAt(0);
        }
        // Add lines from the devis
        devis.lignes.forEach(ligne => {
          this.lignes.push(this.createLigne(ligne));
        });
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  calculateTotalHt(): number {
    return this.lignes.controls.reduce((total, ligne) => {
      const quantite = ligne.get('quantite')?.value ?? 0;
      const prixUnitaire = ligne.get('prixUnitaireHt')?.value ?? 0;
      const ristourne = ligne.get('ristournePct')?.value ?? 0;
      const montant = quantite * prixUnitaire;
      return total + (montant - (montant * ristourne / 100));
    }, 0);
  }

  calculateTotalTtc(): number {
    return this.lignes.controls.reduce((total, ligne) => {
      const quantite = ligne.get('quantite')?.value ?? 0;
      const prixUnitaire = ligne.get('prixUnitaireHt')?.value ?? 0;
      const ristourne = ligne.get('ristournePct')?.value ?? 0;
      const tva = ligne.get('tvaPct')?.value ?? 0;
      const montant = quantite * prixUnitaire;
      const montantApresRistourne = montant - (montant * ristourne / 100);
      return total + (montantApresRistourne * (1 + tva / 100));
    }, 0);
  }

  onSubmit(): void {
    if (this.devisForm.invalid) {
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', {
        duration: 3000
      });
      return;
    }

    const devisData: DevisRequest = this.devisForm.value;
    this.isLoading = true;

    if (this.isEditMode && this.devisId) {
      this.devisService.updateDevis(this.devisId, devisData).subscribe({
        next: () => {
          this.snackBar.open('Devis mis à jour avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/dashboard/devis']);
        },
        error: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.devisService.createDevis(devisData).subscribe({
        next: () => {
          this.snackBar.open('Devis créé avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/dashboard/devis']);
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }
}
