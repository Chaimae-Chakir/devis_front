import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DevisResponse, DevisLigneResponse } from '../../../models/devis-response.model';
import { MatDialog } from '@angular/material/dialog';
import {ConfirmDialogComponent} from "../../../shared/confirm-dialog/confirm-dialog.component";
import {PdfService} from "../../../services/pdf.service";
import {DevisService} from "../../../services/devis.service";
@Component({
  selector: 'app-devis-detail',
  templateUrl: './devis-detail.component.html',
  styleUrls: ['./devis-detail.component.scss']
})
export class DevisDetailComponent implements OnInit {
  devis: DevisResponse | null = null;
  isLoading = true;
  totalTTC: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private devisService: DevisService,
    private dialog: MatDialog,
    private pdfService: PdfService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDevis(+id);
    }
  }

  loadDevis(id: number): void {
    this.isLoading = true;
    this.devisService.getDevisById(id).subscribe({
      next: (devis) => {
        this.devis = devis;
        this.totalTTC = this.calculateTotalTTC(devis.lignes);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private calculateTotalTTC(lignes: DevisLigneResponse[]): number {
    return lignes.reduce((total, ligne) => {
      const ristourne = ligne.ristournePct ?? 0;
      const montant = ligne.quantite * ligne.prixUnitaireHt * (1 - (ristourne ?? 0) / 100);
      return total + (montant * (1 + (ligne.tvaPct ?? 0) / 100));
    }, 0);
  }

  editDevis(): void {
    if (this.devis) {
      this.router.navigate(['/devis/edit', this.devis.id]);
    }
  }

  deleteDevis(): void {
    if (!this.devis) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      data: {
        title: 'Confirmer la suppression',
        message: 'Êtes-vous sûr de vouloir supprimer ce devis ?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.devis) {
        this.devisService.deleteDevis(this.devis.id).subscribe(() => {
          this.router.navigate(['/devis']);
        });
      }
    });
  }


  generatePdf(): void {
    if (this.devis) {
      this.devisService.generatePdf(this.devis.id).subscribe({
        next: (blob: Blob) => {
          this.pdfService.openPdf(blob, `devis-${this.devis?.numero}.pdf`);
        },
        error: (err) => {
          console.error('Erreur lors de la génération du PDF', err);
        }
      });
    }
  }

  validateDevis(): void {
    if (this.devis) {
      this.devisService.validateDevis(this.devis.id, 'Admin').subscribe(() => {
        this.loadDevis(this.devis!.id);
      });
    }
  }
}
