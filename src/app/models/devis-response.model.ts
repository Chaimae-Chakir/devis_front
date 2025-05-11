export interface DevisLigneResponse {
  id: number;
  descriptionLibre?: string;
  quantite: number;
  prixUnitaireHt: number;
  tvaPct?: number;
  ristournePct?: number;
}

export interface DevisResponse {
  id: number;
  numero: string;
  clientId: number;
  clientNom: string;
  statut: string;
  dateCreation: string;
  dateValidation?: string;
  totalHt: number;
  lignes: DevisLigneResponse[];
  perimetre?: string;
  offreFonctionnelle?: string;
  offreTechnique?: string;
  conditions?: string;
  planning?: string;
  offrePdfUrl?: string;
}
export interface DevisPageResponse {
  devis: DevisResponse[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
  totalElements: number;
}
