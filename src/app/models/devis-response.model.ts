// Corrigez vos interfaces pour matcher le backend
export interface DevisLigneResponse {
  id: number;
  descriptionLibre?: string;
  quantite: number; // BigDecimal en Java devient number en TS
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
  dateCreation: string; // ZonedDateTime devient string
  dateValidation?: string; // ZonedDateTime devient string
  totalHt: number; // BigDecimal devient number
  lignes: DevisLigneResponse[];
  perimetre?: string;
  offreFonctionnelle?: string;
  offreTechnique?: string;
  conditions?: string;
  planning?: string;
  offrePdfUrl?: string;
}
