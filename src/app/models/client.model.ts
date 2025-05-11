import {ContactResponse} from "./contact.model";

export interface ClientRequest {
  id: number;
  nom: string;
  ice?: string;
  logoUrl?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
}

export interface ClientResponse {
  id: number;
  nom: string;
  ice?: string;
  logoUrl?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  dateCreation: string;
  contacts?: ContactResponse[];
}

export interface ClientPageResponse {
  clients: ClientResponse[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
  totalElements: number;
}
