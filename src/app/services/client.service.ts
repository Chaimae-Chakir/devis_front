import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {ClientPageResponse, ClientRequest, ClientResponse} from '../models/client.model';
import {environment} from "../environments/environment";
import {HttpParams} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = `${environment.apiUrl}/api/clients`;

  constructor(private http: HttpClient) { }

  createClient(client: ClientRequest): Observable<ClientResponse> {
    return this.http.post<ClientResponse>(this.apiUrl, client);
  }

  getAllClients(): Observable<ClientPageResponse> {
    return this.http.get<ClientPageResponse>(this.apiUrl);
  }

  getClientById(id: number): Observable<ClientResponse> {
    return this.http.get<ClientResponse>(`${this.apiUrl}/${id}`);
  }

  getPageClients(page: number = 0, size: number = 10): Observable<ClientPageResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ClientPageResponse>(this.apiUrl, { params });
  }

  updateClient(id:number, client: ClientResponse): Observable<ClientResponse> {
    return this.http.put<ClientResponse>(`${this.apiUrl}/${id}`, client);
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
