import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactRequest, ContactResponse } from '../models/contact.model';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = `${environment.apiUrl}/api/contacts`;

  constructor(private http: HttpClient) { }

  createContact(contact: ContactRequest): Observable<ContactResponse> {
    return this.http.post<ContactResponse>(this.apiUrl, contact);
  }

  getContactsByClient(clientId: number): Observable<ContactResponse[]> {
    return this.http.get<ContactResponse[]>(`${this.apiUrl}/client/${clientId}`);
  }
}
