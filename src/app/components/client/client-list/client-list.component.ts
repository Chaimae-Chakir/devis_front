import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ClientFormComponent } from '../client-form/client-form.component';
import {ClientPageResponse, ClientResponse} from "../../../models/client.model";
import {ClientService} from "../../../services/client.service";
import {ConfirmDialogComponent} from "../../../shared/confirm-dialog/confirm-dialog.component";
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit {
  displayedColumns: string[] = ['nom', 'ice', 'ville', 'pays', 'actions'];
  dataSource = new MatTableDataSource<ClientResponse>();

  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private clientService: ClientService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading = true;
    this.clientService.getPageClients(this.currentPage, this.pageSize)
      .subscribe({
        next: (response: ClientPageResponse) => {
          this.dataSource.data = response.clients;
          this.totalItems = response.totalElements;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadClients();
  }

  createNewClient(): void {
    const dialogConfig = {
      width: '800px',
      data: {
        isEdit: false,
        clientData: null
      }
    };
    const dialogRef = this.dialog.open(ClientFormComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadClients();
      }
    });
  }

  editClient(client: ClientResponse): void {
    const dialogRef = this.dialog.open(ClientFormComponent, {
      width: '800px',
      data: {
        isEdit: true,
        clientData: client
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadClients();
      }
    });
  }

  deleteClient(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      data: {
        title: 'Confirmer la suppression',
        message: 'Êtes-vous sûr de vouloir supprimer ce client ?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.clientService.deleteClient(id).subscribe({
          next: () => {
            this.loadClients();
            this.snackBar.open('Client supprimé avec succès', 'Fermer', {
              duration: 3000
            });
          },
          error: (err) => {
            console.error('Erreur lors de la suppression du client', err);
            this.isLoading = false;
            this.snackBar.open('Échec de la suppression du client', 'Fermer', {
              duration: 3000
            });
          }
        });
      }
    });
  }
}
