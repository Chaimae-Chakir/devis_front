import { Component, OnInit } from '@angular/core';
import { DevisService } from '../../services/devis.service';
import { DevisResponse } from '../../models/devis-response.model';
import { Router } from '@angular/router';
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "../../shared/confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-devis-list',
  templateUrl: './devis-list.component.html',
  styleUrls: ['./devis-list.component.scss']
})
export class DevisListComponent implements OnInit {
  devisList: DevisResponse[] = [];
  displayedColumns: string[] = ['numero', 'clientNom', 'dateCreation', 'statut', 'totalHt', 'actions'];
  isLoading = true;

  constructor(
    private devisService: DevisService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDevis();
  }

  loadDevis(clientId?: number): void {
    this.isLoading = true;
    this.devisService.getAllDevis(clientId).subscribe({
      next: (devis) => {
        this.devisList = devis;
        this.isLoading = false;
        console.log(this.devisList);
      },
      error: (error) => {
        console.error('Error loading devis:', error);
        this.isLoading = false;
      }
    });
  }

  editDevis(id: number): void {
    this.router.navigate(['/devis/edit', id]);
  }

  viewDevis(id: number): void {
    this.router.navigate(['/devis/view', id]);
  }

  deleteDevis(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la suppression',
        message: 'Êtes-vous sûr de vouloir supprimer ce devis ?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.devisService.deleteDevis(id).subscribe(() => {
          this.loadDevis();
        });
      }
    });
  }

  duplicateDevis(id: number): void {
    this.devisService.duplicateDevis(id).subscribe(newDevis => {
      this.router.navigate(['/devis/edit', newDevis.id]);
    });
  }

  generatePdf(id: number): void {
    this.devisService.generatePdf(id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    });
  }

  validateDevis(id: number): void {
    // Ici vous pourriez demander le nom du validateur via un dialogue
    this.devisService.validateDevis(id, 'Admin').subscribe(() => {
      this.loadDevis();
    });
  }

  createNewDevis(): void {
    this.router.navigate(['/devis/new']);
  }
}
