export interface DevisLigneRequest {
  descriptionLibre?: string;
  quantite: number;
  prixUnitaireHt: number;
  tvaPct?: number;
  ristournePct?: number;
}

export interface DevisRequest {
  clientId: number;
  lignes: DevisLigneRequest[];
  perimetre?: string;
  offreFonctionnelle?: string;
  offreTechnique?: string;
  conditions?: string;
  planning?: string;
  offrePdfUrl?: string;
}
