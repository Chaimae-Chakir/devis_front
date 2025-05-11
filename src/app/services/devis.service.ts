import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {DevisPageResponse, DevisResponse} from '../models/devis-response.model';
import { DevisRequest } from '../models/devis-request.model';
import {environment} from "../environments/environment";
import {ClientPageResponse} from "../models/client.model";

@Injectable({
  providedIn: 'root'
})
export class DevisService {
  private apiUrl = `${environment.apiUrl}/api/v1/devis`;

  constructor(private http: HttpClient) { }

  getAllDevis(page: number = 0, size: number = 10): Observable<DevisPageResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<DevisPageResponse>(this.apiUrl, { params });
  }

  getDevisById(id: number): Observable<DevisResponse> {
    return this.http.get<DevisResponse>(`${this.apiUrl}/${id}`);
  }

  createDevis(devis: DevisRequest): Observable<DevisResponse> {
    return this.http.post<DevisResponse>(this.apiUrl, devis);
  }

  updateDevis(id: number, devis: DevisRequest): Observable<DevisResponse> {
    return this.http.put<DevisResponse>(`${this.apiUrl}/${id}`, devis);
  }

  deleteDevis(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  validateDevis(id: number, validatedBy: string): Observable<DevisResponse> {
    const params = new HttpParams().set('validatedBy', validatedBy);
    return this.http.put<DevisResponse>(`${this.apiUrl}/${id}/validate`, null, { params });
  }

  duplicateDevis(id: number): Observable<DevisResponse> {
    return this.http.post<DevisResponse>(`${this.apiUrl}/${id}/duplicate`, null);
  }

  generatePdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}
