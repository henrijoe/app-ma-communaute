import functions from "./functions";
import { IGalerieEvenement, IGalerieImagePayload } from "./interfaces";

const ajouterGalerie = async (data: IGalerieEvenement) => functions.ajouterGalerie(data);
const recupGaleriesByUtilisateur = async (idUtilisateur: number) => functions.recupGaleriesByUtilisateur(idUtilisateur);
const modifierGalerie = async (data: IGalerieEvenement) => functions.modifierGalerie(data);
const supprimerGalerie = async (idGalerie: number, idUtilisateur?: number) => functions.supprimerGalerie(idGalerie, idUtilisateur);
const recupImagesGalerie = async (idGalerie: number) => functions.recupImagesGalerie(idGalerie);
const ajouterImagesGalerie = async (payload: { idGalerie: number; idUtilisateur: number; images: IGalerieImagePayload[] }) => functions.ajouterImagesGalerie(payload);
const modifierImageGalerie = async (payload: { idGalerieImage: number; legendeImage: string; idUtilisateur?: number }) => functions.modifierImageGalerie(payload);
const definirCouvertureGalerie = async (payload: { idGalerie: number; idGalerieImage: number; idUtilisateur?: number }) => functions.definirCouvertureGalerie(payload);
const supprimerImageGalerie = async (idGalerieImage: number, idUtilisateur?: number) => functions.supprimerImageGalerie(idGalerieImage, idUtilisateur);
const buildGalerieZip = async (idGalerie: number, idUtilisateur?: number) => functions.buildGalerieZip(idGalerie, idUtilisateur);

export default {
  ajouterGalerie,
  recupGaleriesByUtilisateur,
  modifierGalerie,
  supprimerGalerie,
  recupImagesGalerie,
  ajouterImagesGalerie,
  modifierImageGalerie,
  definirCouvertureGalerie,
  supprimerImageGalerie,
  buildGalerieZip,
};
