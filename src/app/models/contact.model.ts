export interface ContactRequest {
  email?: string;
  telephone?: string;
  fax?: string;
  clientId: number;
}

export interface ContactResponse {
  id: number;
  email?: string;
  telephone?: string;
  fax?: string;
  dateCreation: string;
}
