export interface IActualite {
    titre1: string,
    titre2: string,
    paragraphe1: string,
    paragraphe2: string,
    dateActualite: string,
    base64Image: string

}

export interface IVersions {
    versionNumber: string,
    versionDescription?: string[],
    VersionDescriptionJson: string[],
    versionFileLocation: string,
    versionDate: string
}

export interface IApplication {
    idApp?: number;
    libApp: string;
    descriptionApp: string;
    logoApp: string;
    paragraphe1: string;
    paragraphe2: string;
    paragraphe3: string;
    paragraphe4: string;
    paragraphe5: string;
    paragraphe6: string;
    checkListe: string;
    idAppImage: number;
    libAppImage: string;
    appImageBase64Images: string[];
}
export interface IMembre {
    idMembre: number;
    prenomMembre: string;
    nomMembre: string;
    dateNaissMembre: string;
    lieuNaissMembre: string;
    capaciteSpirituelleMembre: string;
    dateConversionMembre: string;
    dateBaptemeMembre: string;
    dateMariageMembre: string;
    situationMatrimonialeMembre:string;
    nationaliteMembre:string;
    contactMembre:string;
    fonctionMembre:string;
    nombreEnfantMembre:number;
    photoMembre:string;
    sexeMembre:string;
    emailMembre:string;
    habitationMembre:string;
    lieuBaptemeEauMembre:string;
    nomCompletParent:string;
    contactParentMembre:string;
    lieuTravailMembre:string;
    ethnieMembre:string;
    residenceMembre:string;
    dateBaptemeSaintEspritMembre:Date;
    baptemeSaintEspritMembre:string;
    civiliteMembre:string;
    egliseOrigineMembre:string;
    responsabiliteMembre:string;
    baptemeEauMembre:string;
    nomPrenomParentMembre:string;
    idEglise:number;
    idNiveauEtude:number;
    idCellule:number
  }
  // Interface IEglise
export interface IEglise {
  idEglise: number;
  nomEglise: string;
  idComptabilite: number;
}

export interface INiveau_etude {
  idNiveauEtude: number;
  libelleNiveauEtude: string;
}
export interface ICellule {
  idCellule: number;
  nomCellule: string;
  lieuCellule: string;
  nombreMembreCellule: string;
}

export interface IComptabilite {
  idComptabilite:number,
  nomComptabilite:string;
  entreeComptabilite:string;
  sortieComptabilite:string;
  dateComptabilite:string
  observationComptabilite:string
}
export interface IDepartement {
  idDepartement:number,
  idUtilisateur:number,
  libelleLongDepartement:string;
  libelleCourtDepartement:string;
  sloganDepartement:string;
  responsableDepartement:string;
}


