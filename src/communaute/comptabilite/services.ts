import functions from './functions';
import { IComptabilite } from './interfaces';

const ajouterComptablilite = (data: IComptabilite) =>
  new Promise(async (resolve, reject) => {
    try {
      const comptabiliteId: any = await functions.ajouterComptablilite({ ...data });
      const comptabilite = await functions.recupComptabiliteById(comptabiliteId);
      resolve(comptabilite);
    } catch (error) {
      reject(error);
    }
  });

const recupComptabilite = () =>
  new Promise(async (resolve, reject) => {
    try {
      const comptabilites = await functions.recupComptabilite();
      resolve(comptabilites);
    } catch (error) {
      reject(error);
    }
  });

const recupComptabiliteByUtilisateur = (idUtilisateur: number) =>
  new Promise(async (resolve, reject) => {
    try {
      const comptabilites = await functions.recupComptabiliteByUtilisateur(idUtilisateur);
      resolve(comptabilites);
    } catch (error) {
      reject(error);
    }
  });

const recupComptabiliteSupprimeeByUtilisateur = (idUtilisateur: number) =>
  new Promise(async (resolve, reject) => {
    try {
      const comptabilites = await functions.recupComptabiliteSupprimeeByUtilisateur(idUtilisateur);
      resolve(comptabilites);
    } catch (error) {
      reject(error);
    }
  });

const supprimerComptabilite = (
  idComptabilite: number,
  supprimeParUtilisateur?: number | null,
  motifSuppressionComptabilite?: string | null
) =>
  new Promise(async (resolve, reject) => {
    try {
      const comptabilite = await functions.recupComptabiliteById(idComptabilite);
      const firstRow: any = Array.isArray(comptabilite) ? comptabilite[0] : comptabilite;

      await functions.supprimerComptabilite(idComptabilite, supprimeParUtilisateur, motifSuppressionComptabilite);
      resolve({
        idComptabilite,
        idUtilisateur: Number(firstRow?.idUtilisateur || 0) || null,
        nomComptabilite: firstRow?.nomComptabilite || '',
        supprimeParUtilisateur: supprimeParUtilisateur || null,
        motifSuppressionComptabilite: motifSuppressionComptabilite || 'Suppression depuis la liste comptable',
      });
    } catch (error) {
      reject(error);
    }
  });

const restaurerComptabilite = (idComptabilite: number) =>
  new Promise(async (resolve, reject) => {
    try {
      await functions.restaurerComptabilite(idComptabilite);
      const comptabilite = await functions.recupComptabiliteById(idComptabilite);
      const firstRow: any = Array.isArray(comptabilite) ? comptabilite[0] : comptabilite;
      resolve({
        idComptabilite,
        idUtilisateur: Number(firstRow?.idUtilisateur || 0) || null,
        nomComptabilite: firstRow?.nomComptabilite || '',
        data: comptabilite,
      });
    } catch (error) {
      reject(error);
    }
  });

const supprimerComptabiliteDefinitivement = (idComptabilite: number, nomUtilisateur?: string | null) =>
  new Promise(async (resolve, reject) => {
    try {
      const comptabilite = await functions.recupComptabiliteById(idComptabilite);
      const firstRow: any = Array.isArray(comptabilite) ? comptabilite[0] : comptabilite;
      await functions.supprimerComptabiliteDefinitivement(idComptabilite, nomUtilisateur);
      resolve({
        idComptabilite,
        idUtilisateur: Number(firstRow?.idUtilisateur || 0) || null,
        nomComptabilite: firstRow?.nomComptabilite || '',
      });
    } catch (error) {
      reject(error);
    }
  });

const modifierComptabilite = (data: IComptabilite) =>
  new Promise(async (resolve, reject) => {
    try {
      await functions.modifierComptabilite(data);
      const comptabilite = await functions.recupComptabiliteById(data.idComptabilite);
      resolve(comptabilite);
    } catch (error) {
      reject(error);
    }
  });

export default {
  ajouterComptablilite,
  recupComptabilite,
  recupComptabiliteByUtilisateur,
  recupComptabiliteSupprimeeByUtilisateur,
  supprimerComptabilite,
  restaurerComptabilite,
  supprimerComptabiliteDefinitivement,
  modifierComptabilite,
};
