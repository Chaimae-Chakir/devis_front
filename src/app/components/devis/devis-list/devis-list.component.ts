import { Component, OnInit, ViewChild } from '@angular/core';
import { DevisService } from '../../../services/devis.service';
import { DevisResponse, DevisPageResponse } from '../../../models/devis-response.model';
import { Router } from '@angular/router';
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../../../shared/confirm-dialog/confirm-dialog.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-devis-list',
  templateUrl: './devis-list.component.html',
  styleUrls: ['./devis-list.component.scss']
})
export class DevisListComponent implements OnInit {
  displayedColumns: string[] = ['numero', 'clientNom', 'dateCreation', 'statut', 'totalHt', 'actions'];
  dataSource = new MatTableDataSource<DevisResponse>();
  totalItems = 0;
  pageSize = 7;
  currentPage = 0;
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private devisService: DevisService,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadDevis();
  }

  loadDevis(): void {
    this.isLoading = true;
    this.devisService.getAllDevis(this.currentPage, this.pageSize).subscribe({
      next: (response: DevisPageResponse) => {
        this.dataSource.data = response.devis;
        this.totalItems = response.totalElements;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading devis:', error);
        this.isLoading = false;
        this.snackBar.open('Erreur lors du chargement des devis', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    console.log('PageEvent:', event);
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadDevis();
  }

  editDevis(id: number): void {
    this.router.navigate(['/dashboard/devis/edit', id]);
  }

  viewDevis(id: number): void {
    this.router.navigate(['/dashboard/devis/view', id]);
  }

  deleteDevis(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      data: {
        title: 'Confirmer la suppression',
        message: 'Êtes-vous sûr de vouloir supprimer ce devis ?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.devisService.deleteDevis(id).subscribe({
          next: () => {
            // Vérifier s'il faut aller à la page précédente après suppression
            if (this.dataSource.data.length === 1 && this.currentPage > 0) {
              this.currentPage--;
              if (this.paginator) {
                this.paginator.pageIndex = this.currentPage;
              }
            }
            this.loadDevis();
            this.snackBar.open('Devis supprimé avec succès', 'Fermer', { duration: 3000 });
          },
          error: (err) => {
            console.error('Erreur lors de la suppression', err);
            this.isLoading = false;
            this.snackBar.open('Échec de la suppression', 'Fermer', { duration: 3000 });
          }
        });
      }
    });
  }

  duplicateDevis(id: number): void {
    this.devisService.duplicateDevis(id).subscribe(newDevis => {
      this.router.navigate(['/dashboard/devis/edit', newDevis.id]);
    });
  }

  generatePdf(id: number): void {
    this.devisService.generatePdf(id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    });
  }

  validateDevis(id: number): void {
    this.devisService.validateDevis(id, 'Admin').subscribe(() => {
      this.loadDevis();
    });
  }

  createNewDevis(): void {
    this.router.navigate(['/dashboard/devis/new']);
  }
}
