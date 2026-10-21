// Accès base pour l'école du dimanche.
//
// Toutes les lectures sont bornées à idUtilisateur : une église ne voit que ses
// classes, ses moniteurs et ses enfants.
//
// Les listes renvoient volontairement des libellés joints (nom de la classe, nom du
// membre moniteur) plutôt que de simples identifiants : l'interface affiche des noms,
// et la jointure coûte bien moins qu'un aller-retour par ligne.

import fs from "fs";
import path from "path";

import { _executeSql, _selectSql } from "../../db";
import sqliteDB from "../../db/sqliteDB";
import {
  IClasseEcodim,
  ICulteEcodim,
  IEnfantEcodim,
  IMoniteurEcodim,
  INoteEcodim,
  IEvaluationEcodim,
} from "./interfaces";

// Les images de l'école du dimanche vivent à côté des photos de membres, dans le
// dossier de données — jamais dans la base : une photo en base64 dans une colonne
// alourdit chaque lecture de la liste, même quand on ne l'affiche pas.
export const dossierMedias = (): string => {
  const dossier = path.join(sqliteDB.getSqliteDirectory(), "ecodim-medias");

  if (!fs.existsSync(dossier)) {
    fs.mkdirSync(dossier, { recursive: true });
  }

  return dossier;
};

/** Écrit une image base64 sur disque et retourne le nom de fichier à stocker. */
export const enregistrerImage = (base64: string, prefixe: string): string => {
  const correspondance = String(base64 || "").match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);

  if (!correspondance) {
    throw new Error("Image illisible : envoyez un fichier JPG ou PNG.");
  }

  const extension = correspondance[1].toLowerCase() === "jpeg" ? "jpg" : correspondance[1].toLowerCase();
  const nomFichier = `${prefixe}-${Date.now().toString(36)}.${extension}`;

  fs.writeFileSync(path.join(dossierMedias(), nomFichier), Buffer.from(correspondance[2], "base64"));

  return nomFichier;
};

/** Supprime un fichier image devenu inutile, sans faire échouer l'opération. */
export const supprimerImage = (nomFichier?: string | null): void => {
  if (!nomFichier) {
    return;
  }

  try {
    const chemin = path.join(dossierMedias(), nomFichier);

    if (fs.existsSync(chemin)) {
      fs.unlinkSync(chemin);
    }
  } catch (_error) {
    // Un fichier déjà absent ne doit pas empêcher la suppression de la ligne.
  }
};

const texte = (valeur: unknown): string => String(valeur ?? "").trim();
const nombre = (valeur: unknown): number | null => {
  const converti = Number(valeur);
  return Number.isFinite(converti) && texte(valeur) !== "" ? converti : null;
};

/**
 * Rattachements d'un moniteur, repris de l'ancienne colonne si besoin.
 *
 * Avant que la table de liaison n'existe, la classe du moniteur vivait dans
 * `ecodim_moniteur.idClasseEcodim`. Les lignes saisies a cette epoque n'ont
 * aucun rattachement : on les reprend a la premiere lecture, une fois, plutot
 * que de laisser ces moniteurs disparaitre de leur classe.
 */
const reprendreRattachementsAnciens = async (idUtilisateur: number): Promise<void> => {
  const aReprendre: any = await _selectSql(
    `SELECT moniteur.idMoniteur, moniteur.idClasseEcodim, moniteur.estPrincipal
       FROM ecodim_moniteur moniteur
       LEFT JOIN ecodim_moniteur_classe lien ON lien.idMoniteur = moniteur.idMoniteur
      WHERE moniteur.idUtilisateur = ?
        AND moniteur.idClasseEcodim IS NOT NULL
        AND lien.idMoniteurClasse IS NULL`,
    [idUtilisateur]
  );

  for (const ligne of Array.isArray(aReprendre) ? aReprendre : []) {
    await _executeSql(
      `INSERT INTO ecodim_moniteur_classe
         (idMoniteur, idClasseEcodim, estPrincipal, idUtilisateur)
       VALUES (?,?,?,?)`,
      [ligne.idMoniteur, ligne.idClasseEcodim, ligne.estPrincipal ? 1 : 0, idUtilisateur]
    );
  }
};

// ----------------------------------------------------------------- classes

/**
 * Classes d'une église, avec leurs effectifs et le nom de leur responsable.
 *
 * Le rattachement passe par `ecodim_moniteur_classe` : un moniteur peut encadrer
 * plusieurs classes, et être responsable de l'une sans l'être de l'autre.
 */
export const recupClasses = async (idUtilisateur: number): Promise<any[]> => {
  await reprendreRattachementsAnciens(idUtilisateur);

  const classes: any = await _selectSql(
    `SELECT classe.*,
            (SELECT COUNT(*) FROM ecodim_enfant enfant
              WHERE enfant.idClasseEcodim = classe.idClasseEcodim
                AND COALESCE(enfant.actifEnfant, 1) = 1) AS nombreEnfants,
            (SELECT COUNT(*) FROM ecodim_moniteur_classe lien
               JOIN ecodim_moniteur moniteur ON moniteur.idMoniteur = lien.idMoniteur
              WHERE lien.idClasseEcodim = classe.idClasseEcodim
                AND COALESCE(moniteur.actifMoniteur, 1) = 1) AS nombreMoniteurs,
            (SELECT lien.idMoniteur
               FROM ecodim_moniteur_classe lien
              WHERE lien.idClasseEcodim = classe.idClasseEcodim
                AND lien.estPrincipal = 1
              LIMIT 1) AS idMoniteurResponsable
       FROM ecodim_classe classe
      WHERE classe.idUtilisateur = ?
      ORDER BY classe.ageMin IS NULL, classe.ageMin ASC, classe.libelleClasse ASC`,
    [idUtilisateur]
  );

  const responsables: any = await _selectSql(
    `SELECT lien.idClasseEcodim, membre.nomMembre, membre.prenomMembre
       FROM ecodim_moniteur_classe lien
       JOIN ecodim_moniteur moniteur ON moniteur.idMoniteur = lien.idMoniteur
       LEFT JOIN membre ON membre.idMembre = moniteur.idMembre
      WHERE lien.idUtilisateur = ? AND lien.estPrincipal = 1`,
    [idUtilisateur]
  );

  return (Array.isArray(classes) ? classes : []).map((classe: any) => {
    const responsable = (Array.isArray(responsables) ? responsables : []).find(
      (ligne: any) => Number(ligne.idClasseEcodim) === Number(classe.idClasseEcodim)
    );

    return {
      ...classe,
      nomResponsable: responsable
        ? `${responsable.nomMembre || ''} ${responsable.prenomMembre || ''}`.trim()
        : '',
    };
  });
};

export const ajouterClasse = async (data: IClasseEcodim): Promise<any> => {
  const doublon: any = await _selectSql(
    "SELECT idClasseEcodim FROM ecodim_classe WHERE idUtilisateur = ? AND LOWER(libelleClasse) = LOWER(?)",
    [data.idUtilisateur, texte(data.libelleClasse)]
  );

  if (Array.isArray(doublon) && doublon.length) {
    throw new Error("Cette classe existe déjà.");
  }

  const resultat: any = await _executeSql(
    `INSERT INTO ecodim_classe
       (libelleClasse, trancheAge, ageMin, ageMax, descriptionClasse, actifClasse, idUtilisateur)
     VALUES (?,?,?,?,?,?,?)`,
    [
      texte(data.libelleClasse),
      texte(data.trancheAge),
      nombre(data.ageMin),
      nombre(data.ageMax),
      texte(data.descriptionClasse),
      data.actifClasse === 0 ? 0 : 1,
      data.idUtilisateur,
    ]
  );

  return resultat?.insertId ?? resultat?.lastID ?? null;
};

export const modifierClasse = async (data: IClasseEcodim): Promise<boolean> => {
  await _executeSql(
    `UPDATE ecodim_classe
        SET libelleClasse = ?, trancheAge = ?, ageMin = ?, ageMax = ?,
            descriptionClasse = ?, actifClasse = ?
      WHERE idClasseEcodim = ? AND idUtilisateur = ?`,
    [
      texte(data.libelleClasse),
      texte(data.trancheAge),
      nombre(data.ageMin),
      nombre(data.ageMax),
      texte(data.descriptionClasse),
      data.actifClasse === 0 ? 0 : 1,
      data.idClasseEcodim,
      data.idUtilisateur,
    ]
  );

  return true;
};

export const supprimerClasse = async (
  idClasseEcodim: number,
  idUtilisateur: number
): Promise<boolean> => {
  const rattaches: any = await _selectSql(
    `SELECT (SELECT COUNT(*) FROM ecodim_enfant WHERE idClasseEcodim = ?) AS enfants,
            (SELECT COUNT(*) FROM ecodim_moniteur_classe WHERE idClasseEcodim = ?) AS moniteurs`,
    [idClasseEcodim, idClasseEcodim]
  );

  const compte = Array.isArray(rattaches) ? rattaches[0] : rattaches;

  // On refuse plutôt que de détacher en silence : des enfants sans classe
  // disparaîtraient des listes sans que personne ne comprenne pourquoi.
  if (Number(compte?.enfants || 0) > 0 || Number(compte?.moniteurs || 0) > 0) {
    throw new Error(
      "Cette classe compte encore des enfants ou des moniteurs. Déplacez-les avant de la supprimer."
    );
  }

  await _executeSql(
    "DELETE FROM ecodim_moniteur_classe WHERE idClasseEcodim = ? AND idUtilisateur = ?",
    [idClasseEcodim, idUtilisateur]
  );

  await _executeSql("DELETE FROM ecodim_classe WHERE idClasseEcodim = ? AND idUtilisateur = ?", [
    idClasseEcodim,
    idUtilisateur,
  ]);

  return true;
};

// --------------------------------------------------------------- moniteurs

/** Les classes encadrees par un moniteur, avec le libelle de chacune. */
export const recupClassesDuMoniteur = (
  idMoniteur: number,
  idUtilisateur: number
): Promise<any[]> =>
  _selectSql(
    `SELECT lien.idClasseEcodim, lien.estPrincipal, classe.libelleClasse
       FROM ecodim_moniteur_classe lien
       LEFT JOIN ecodim_classe classe ON classe.idClasseEcodim = lien.idClasseEcodim
      WHERE lien.idMoniteur = ? AND lien.idUtilisateur = ?
      ORDER BY lien.estPrincipal DESC, classe.libelleClasse ASC`,
    [idMoniteur, idUtilisateur]
  );

export const recupMoniteurs = async (idUtilisateur: number): Promise<any[]> => {
  await reprendreRattachementsAnciens(idUtilisateur);

  const moniteurs: any = await _selectSql(
    `SELECT moniteur.*,
            membre.nomMembre, membre.prenomMembre, membre.contactMembre,
            membre.sexeMembre, membre.photoMembre
       FROM ecodim_moniteur moniteur
       LEFT JOIN membre ON membre.idMembre = moniteur.idMembre
      WHERE moniteur.idUtilisateur = ?
      ORDER BY membre.nomMembre ASC`,
    [idUtilisateur]
  );

  const liens: any = await _selectSql(
    `SELECT lien.idMoniteur, lien.idClasseEcodim, lien.estPrincipal, classe.libelleClasse
       FROM ecodim_moniteur_classe lien
       LEFT JOIN ecodim_classe classe ON classe.idClasseEcodim = lien.idClasseEcodim
      WHERE lien.idUtilisateur = ?
      ORDER BY lien.estPrincipal DESC, classe.libelleClasse ASC`,
    [idUtilisateur]
  );

  // Les classes sont jointes ici plutot que par une requete par moniteur : une
  // liste de vingt moniteurs ferait sinon vingt allers-retours.
  return (Array.isArray(moniteurs) ? moniteurs : []).map((moniteur: any) => {
    const classes = (Array.isArray(liens) ? liens : []).filter(
      (lien: any) => Number(lien.idMoniteur) === Number(moniteur.idMoniteur)
    );

    return {
      ...moniteur,
      classes,
      // Libelles reunis, pour un affichage direct en liste.
      libelleClasse: classes.map((lien: any) => lien.libelleClasse).filter(Boolean).join(', '),
      estResponsable: classes.some((lien: any) => Number(lien.estPrincipal) === 1) ? 1 : 0,
    };
  });
};

/** Remplace d'un bloc les rattachements d'un moniteur. */
const enregistrerClassesDuMoniteur = async (
  idMoniteur: number,
  idUtilisateur: number,
  classes?: { idClasseEcodim: number; estPrincipal?: number }[]
): Promise<void> => {
  if (!Array.isArray(classes)) {
    return;
  }

  await _executeSql(
    "DELETE FROM ecodim_moniteur_classe WHERE idMoniteur = ? AND idUtilisateur = ?",
    [idMoniteur, idUtilisateur]
  );

  for (const classe of classes) {
    const idClasse = nombre(classe?.idClasseEcodim);
    if (!idClasse) continue;

    await _executeSql(
      `INSERT INTO ecodim_moniteur_classe
         (idMoniteur, idClasseEcodim, estPrincipal, idUtilisateur)
       VALUES (?,?,?,?)`,
      [idMoniteur, idClasse, classe?.estPrincipal ? 1 : 0, idUtilisateur]
    );
  }
};

export const ajouterMoniteur = async (data: IMoniteurEcodim): Promise<any> => {
  const doublon: any = await _selectSql(
    "SELECT idMoniteur FROM ecodim_moniteur WHERE idUtilisateur = ? AND idMembre = ?",
    [data.idUtilisateur, data.idMembre]
  );

  if (Array.isArray(doublon) && doublon.length) {
    throw new Error("Ce membre est déjà enregistré comme moniteur.");
  }

  const resultat: any = await _executeSql(
    `INSERT INTO ecodim_moniteur
       (idMembre, idClasseEcodim, estPrincipal, fonctionMoniteur, dateAffectation, actifMoniteur, idUtilisateur)
     VALUES (?,?,?,?,?,?,?)`,
    [
      data.idMembre,
      nombre(data.idClasseEcodim),
      data.estPrincipal ? 1 : 0,
      texte(data.fonctionMoniteur),
      texte(data.dateAffectation) || null,
      data.actifMoniteur === 0 ? 0 : 1,
      data.idUtilisateur,
    ]
  );

  const idMoniteur = resultat?.insertId ?? resultat?.lastID ?? null;

  if (idMoniteur) {
    await enregistrerClassesDuMoniteur(idMoniteur, data.idUtilisateur, data.classes);
  }

  return idMoniteur;
};

export const modifierMoniteur = async (data: IMoniteurEcodim): Promise<boolean> => {
  await _executeSql(
    `UPDATE ecodim_moniteur
        SET idMembre = ?, idClasseEcodim = ?, estPrincipal = ?, fonctionMoniteur = ?,
            dateAffectation = ?, actifMoniteur = ?
      WHERE idMoniteur = ? AND idUtilisateur = ?`,
    [
      data.idMembre,
      nombre(data.idClasseEcodim),
      data.estPrincipal ? 1 : 0,
      texte(data.fonctionMoniteur),
      texte(data.dateAffectation) || null,
      data.actifMoniteur === 0 ? 0 : 1,
      data.idMoniteur,
      data.idUtilisateur,
    ]
  );

  await enregistrerClassesDuMoniteur(
    Number(data.idMoniteur),
    data.idUtilisateur,
    data.classes
  );

  return true;
};

export const supprimerMoniteur = async (
  idMoniteur: number,
  idUtilisateur: number
): Promise<boolean> => {
  // Les rattachements partent avec lui : sans cela, une classe compterait encore
  // un moniteur qui n'existe plus, et refuserait d'être supprimée.
  await _executeSql(
    "DELETE FROM ecodim_moniteur_classe WHERE idMoniteur = ? AND idUtilisateur = ?",
    [idMoniteur, idUtilisateur]
  );

  // Retirer un moniteur ne touche pas au membre : il reste dans l'église.
  await _executeSql("DELETE FROM ecodim_moniteur WHERE idMoniteur = ? AND idUtilisateur = ?", [
    idMoniteur,
    idUtilisateur,
  ]);

  return true;
};

// ----------------------------------------------------------------- enfants

export const recupEnfants = (idUtilisateur: number): Promise<any[]> =>
  _selectSql(
    `SELECT enfant.*, classe.libelleClasse
       FROM ecodim_enfant enfant
       LEFT JOIN ecodim_classe classe ON classe.idClasseEcodim = enfant.idClasseEcodim
      WHERE enfant.idUtilisateur = ?
      ORDER BY enfant.nomEnfant ASC, enfant.prenomEnfant ASC`,
    [idUtilisateur]
  );

/**
 * Les colonnes du dossier enfant, avec la façon d'en extraire la valeur.
 *
 * Les noms de colonnes, les points d'interrogation et les valeurs sont tous dérivés
 * de cette unique liste. Tenus séparément, ils finissent par se décaler d'un cran au
 * premier ajout de champ, et la requête écrit alors chaque donnée dans la colonne
 * voisine sans qu'aucune erreur ne soit levée.
 */
const CHAMPS_ENFANT: { nom: string; valeur: (data: IEnfantEcodim) => any }[] = [
  { nom: "nomEnfant", valeur: (d) => texte(d.nomEnfant) },
  { nom: "prenomEnfant", valeur: (d) => texte(d.prenomEnfant) },
  { nom: "sexeEnfant", valeur: (d) => texte(d.sexeEnfant) },
  { nom: "dateNaissEnfant", valeur: (d) => texte(d.dateNaissEnfant) || null },
  { nom: "lieuNaissEnfant", valeur: (d) => texte(d.lieuNaissEnfant) },
  { nom: "lieuHabitationEnfant", valeur: (d) => texte(d.lieuHabitationEnfant) },
  { nom: "numeroAppartement", valeur: (d) => texte(d.numeroAppartement) },
  { nom: "contactEnfant", valeur: (d) => texte(d.contactEnfant) },
  { nom: "niveauScolaireEnfant", valeur: (d) => texte(d.niveauScolaireEnfant) },
  { nom: "activiteEnfant", valeur: (d) => texte(d.activiteEnfant) },

  // Parent ou tuteur : ces colonnes existaient déjà et portent le tuteur.
  { nom: "nomParentEnfant", valeur: (d) => texte(d.nomParentEnfant) },
  { nom: "contactParentEnfant", valeur: (d) => texte(d.contactParentEnfant) },
  { nom: "emailParentEnfant", valeur: (d) => texte(d.emailParentEnfant) },
  { nom: "adresseParentEnfant", valeur: (d) => texte(d.adresseParentEnfant) },
  { nom: "religionParents", valeur: (d) => texte(d.religionParents) },
  { nom: "tuteurConverti", valeur: (d) => texte(d.tuteurConverti) },

  { nom: "nomPere", valeur: (d) => texte(d.nomPere) },
  { nom: "prenomPere", valeur: (d) => texte(d.prenomPere) },
  { nom: "lieuHabitationPere", valeur: (d) => texte(d.lieuHabitationPere) },
  { nom: "professionPere", valeur: (d) => texte(d.professionPere) },
  { nom: "contactPere", valeur: (d) => texte(d.contactPere) },
  { nom: "pereConverti", valeur: (d) => texte(d.pereConverti) },

  { nom: "nomMere", valeur: (d) => texte(d.nomMere) },
  { nom: "prenomMere", valeur: (d) => texte(d.prenomMere) },
  { nom: "lieuHabitationMere", valeur: (d) => texte(d.lieuHabitationMere) },
  { nom: "professionMere", valeur: (d) => texte(d.professionMere) },
  { nom: "contactMere", valeur: (d) => texte(d.contactMere) },
  { nom: "mereConverti", valeur: (d) => texte(d.mereConverti) },

  { nom: "vitAvec", valeur: (d) => texte(d.vitAvec) },

  { nom: "dateEntreeEcodim", valeur: (d) => texte(d.dateEntreeEcodim) || null },
  { nom: "niveauEntreeEcodim", valeur: (d) => texte(d.niveauEntreeEcodim) },
  { nom: "niveauActuelEcodim", valeur: (d) => texte(d.niveauActuelEcodim) },
  { nom: "dateBaptemeEsprit", valeur: (d) => texte(d.dateBaptemeEsprit) || null },
  { nom: "lieuBaptemeEsprit", valeur: (d) => texte(d.lieuBaptemeEsprit) },
  { nom: "dateSortieEcodim", valeur: (d) => texte(d.dateSortieEcodim) || null },
  { nom: "motifSortieEcodim", valeur: (d) => texte(d.motifSortieEcodim) },
  { nom: "categorieSortieEcodim", valeur: (d) => texte(d.categorieSortieEcodim) },

  { nom: "situationSociale", valeur: (d) => texte(d.situationSociale) },
  { nom: "precisionSituationSociale", valeur: (d) => texte(d.precisionSituationSociale) },

  { nom: "dateDepart", valeur: (d) => texte(d.dateDepart) || null },
  { nom: "motifDepart", valeur: (d) => texte(d.motifDepart) },

  { nom: "idClasseEcodim", valeur: (d) => nombre(d.idClasseEcodim) },
  { nom: "actifEnfant", valeur: (d) => (d.actifEnfant === 0 ? 0 : 1) },
];

const COLONNES_ENFANT = CHAMPS_ENFANT.map((champ) => champ.nom).join(", ");
const PLACEHOLDERS_ENFANT = CHAMPS_ENFANT.map(() => "?").join(",");
const AFFECTATIONS_ENFANT = CHAMPS_ENFANT.map((champ) => `${champ.nom} = ?`).join(", ");

const valeursEnfant = (data: IEnfantEcodim) => CHAMPS_ENFANT.map((champ) => champ.valeur(data));

/**
 * Remplace la photo d'un enfant. L'ancienne est effacée du disque : sans cela, le
 * dossier se remplit de fichiers que plus rien ne référence.
 */
export const enregistrerPhotoEnfant = async (donnees: {
  idEnfantEcodim: number;
  idUtilisateur: number;
  photo: string;
}): Promise<string> => {
  const lignes: any = await _selectSql(
    "SELECT photoEnfant FROM ecodim_enfant WHERE idEnfantEcodim = ? AND idUtilisateur = ?",
    [donnees.idEnfantEcodim, donnees.idUtilisateur]
  );

  if (!Array.isArray(lignes) || !lignes.length) {
    throw new Error("Enfant introuvable.");
  }

  const ancienne = lignes[0]?.photoEnfant;
  const nomFichier = donnees.photo ? enregistrerImage(donnees.photo, `enfant-${donnees.idEnfantEcodim}`) : "";

  await _executeSql(
    "UPDATE ecodim_enfant SET photoEnfant = ? WHERE idEnfantEcodim = ? AND idUtilisateur = ?",
    [nomFichier, donnees.idEnfantEcodim, donnees.idUtilisateur]
  );

  supprimerImage(ancienne);

  return nomFichier;
};

// -------------------------------------------------- images des activités

export const recupImagesActivite = (
  idActiviteEcodim: number,
  idUtilisateur: number
): Promise<any[]> =>
  _selectSql(
    `SELECT * FROM ecodim_activite_image
      WHERE idActiviteEcodim = ? AND idUtilisateur = ?
      ORDER BY idImageActivite DESC`,
    [idActiviteEcodim, idUtilisateur]
  );

export const ajouterImageActivite = async (donnees: {
  idActiviteEcodim: number;
  idUtilisateur: number;
  image: string;
  legende?: string;
}): Promise<string> => {
  const nomFichier = enregistrerImage(donnees.image, `activite-${donnees.idActiviteEcodim}`);

  await _executeSql(
    `INSERT INTO ecodim_activite_image (idActiviteEcodim, fichierImage, legendeImage, idUtilisateur)
     VALUES (?,?,?,?)`,
    [donnees.idActiviteEcodim, nomFichier, texte(donnees.legende), donnees.idUtilisateur]
  );

  return nomFichier;
};

export const supprimerImageActivite = async (
  idImageActivite: number,
  idUtilisateur: number
): Promise<boolean> => {
  const lignes: any = await _selectSql(
    "SELECT fichierImage FROM ecodim_activite_image WHERE idImageActivite = ? AND idUtilisateur = ?",
    [idImageActivite, idUtilisateur]
  );

  await _executeSql(
    "DELETE FROM ecodim_activite_image WHERE idImageActivite = ? AND idUtilisateur = ?",
    [idImageActivite, idUtilisateur]
  );

  supprimerImage(Array.isArray(lignes) && lignes.length ? lignes[0].fichierImage : null);

  return true;
};

/**
 * Décide du nom de fichier à stocker pour la photo d'un enfant.
 *
 * Le formulaire renvoie soit une image en base64 (nouvelle photo), soit le nom de
 * fichier déjà en base (photo inchangée), soit du vide (photo retirée). Sans cette
 * distinction, rouvrir une fiche et l'enregistrer sans toucher à la photo la
 * réécrirait à chaque fois, et le dossier se remplirait de doublons.
 */
const resoudrePhotoEnfant = (
  valeurRecue: string | undefined | null,
  ancienne: string | undefined | null,
  prefixe: string
): { nomFichier: string; aRemplace: boolean } => {
  const valeur = texte(valeurRecue);

  if (valeur.startsWith("data:image/")) {
    return { nomFichier: enregistrerImage(valeur, prefixe), aRemplace: true };
  }

  // Photo inchangée : on garde le fichier existant.
  if (valeur && valeur === texte(ancienne)) {
    return { nomFichier: valeur, aRemplace: false };
  }

  // Vide : la photo a été retirée.
  if (!valeur) {
    return { nomFichier: "", aRemplace: Boolean(texte(ancienne)) };
  }

  return { nomFichier: valeur, aRemplace: false };
};

export const ajouterEnfant = async (data: IEnfantEcodim): Promise<any> => {
  const resultat: any = await _executeSql(
    `INSERT INTO ecodim_enfant (${COLONNES_ENFANT}, idUtilisateur)
     VALUES (${PLACEHOLDERS_ENFANT},?)`,
    [...valeursEnfant(data), data.idUtilisateur]
  );

  const idEnfantEcodim = resultat?.insertId ?? resultat?.lastID ?? null;

  // La photo ne peut être nommée qu'une fois l'identifiant connu, comme pour un membre.
  const photoRecue = texte((data as any).photoEnfant);

  if (idEnfantEcodim && photoRecue.startsWith("data:image/")) {
    const nomFichier = enregistrerImage(photoRecue, `enfant-${idEnfantEcodim}`);
    await _executeSql(
      "UPDATE ecodim_enfant SET photoEnfant = ? WHERE idEnfantEcodim = ? AND idUtilisateur = ?",
      [nomFichier, idEnfantEcodim, data.idUtilisateur]
    );
  }

  return idEnfantEcodim;
};

export const modifierEnfant = async (data: IEnfantEcodim): Promise<boolean> => {
  const lignes: any = await _selectSql(
    "SELECT photoEnfant FROM ecodim_enfant WHERE idEnfantEcodim = ? AND idUtilisateur = ?",
    [data.idEnfantEcodim, data.idUtilisateur]
  );

  if (!Array.isArray(lignes) || !lignes.length) {
    throw new Error("Enfant introuvable.");
  }

  const ancienne = lignes[0]?.photoEnfant;
  const { nomFichier, aRemplace } = resoudrePhotoEnfant(
    (data as any).photoEnfant,
    ancienne,
    `enfant-${data.idEnfantEcodim}`
  );

  await _executeSql(
    `UPDATE ecodim_enfant SET ${AFFECTATIONS_ENFANT}
      WHERE idEnfantEcodim = ? AND idUtilisateur = ?`,
    [...valeursEnfant(data), data.idEnfantEcodim, data.idUtilisateur]
  );

  await _executeSql(
    "UPDATE ecodim_enfant SET photoEnfant = ? WHERE idEnfantEcodim = ? AND idUtilisateur = ?",
    [nomFichier, data.idEnfantEcodim, data.idUtilisateur]
  );

  // L'ancien fichier n'est effacé qu'une fois la base à jour : si l'écriture échoue,
  // mieux vaut un fichier orphelin qu'une fiche pointant vers un fichier disparu.
  if (aRemplace) {
    supprimerImage(ancienne);
  }

  return true;
};

export const supprimerEnfant = async (
  idEnfantEcodim: number,
  idUtilisateur: number
): Promise<boolean> => {
  const lignes: any = await _selectSql(
    "SELECT photoEnfant FROM ecodim_enfant WHERE idEnfantEcodim = ? AND idUtilisateur = ?",
    [idEnfantEcodim, idUtilisateur]
  );

  await _executeSql("DELETE FROM ecodim_enfant WHERE idEnfantEcodim = ? AND idUtilisateur = ?", [
    idEnfantEcodim,
    idUtilisateur,
  ]);

  supprimerImage(Array.isArray(lignes) && lignes.length ? lignes[0].photoEnfant : null);

  return true;
};

// --------------------------------------------------------------- activités

export const recupActivites = (idUtilisateur: number): Promise<any[]> =>
  _selectSql(
    `SELECT activite.*, classe.libelleClasse,
            dirigeant.nomMembre AS nomDirigeant, dirigeant.prenomMembre AS prenomDirigeant,
            enseignant.nomMembre AS nomEnseignant, enseignant.prenomMembre AS prenomEnseignant
       FROM ecodim_activite activite
       LEFT JOIN ecodim_classe classe ON classe.idClasseEcodim = activite.idClasseEcodim
       LEFT JOIN ecodim_moniteur moniteurDirigeant
              ON moniteurDirigeant.idMoniteur = activite.idMoniteurDirigeant
       LEFT JOIN membre dirigeant ON dirigeant.idMembre = moniteurDirigeant.idMembre
       LEFT JOIN ecodim_moniteur moniteurEnseignant
              ON moniteurEnseignant.idMoniteur = activite.idMoniteurEnseignant
       LEFT JOIN membre enseignant ON enseignant.idMembre = moniteurEnseignant.idMembre
      WHERE activite.idUtilisateur = ?
      ORDER BY activite.dateDebutActivite DESC, activite.idActiviteEcodim DESC`,
    [idUtilisateur]
  );

const valeursActivite = (data: any) => [
  texte(data.titreActivite),
  texte(data.typeActivite),
  texte(data.descriptionActivite),
  texte(data.lieuActivite),
  texte(data.dateDebutActivite) || null,
  texte(data.dateFinActivite) || null,
  texte(data.heureDebutActivite),
  texte(data.heureFinActivite),
  nombre(data.idClasseEcodim),
  nombre(data.idMoniteurDirigeant),
  nombre(data.idMoniteurEnseignant),
  texte(data.textesBibliques),
  Number(data.nombreFilles) || 0,
  Number(data.nombreGarcons) || 0,
  texte(data.statutActivite) || "Planifiee",
  data.actifActivite === 0 ? 0 : 1,
];

export const ajouterActivite = async (data: any): Promise<any> => {
  const resultat: any = await _executeSql(
    `INSERT INTO ecodim_activite
       (titreActivite, typeActivite, descriptionActivite, lieuActivite, dateDebutActivite,
        dateFinActivite, heureDebutActivite, heureFinActivite, idClasseEcodim,
        idMoniteurDirigeant, idMoniteurEnseignant, textesBibliques, nombreFilles,
        nombreGarcons, statutActivite, actifActivite, idUtilisateur)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [...valeursActivite(data), data.idUtilisateur]
  );

  return resultat?.insertId ?? resultat?.lastID ?? null;
};

export const modifierActivite = async (data: any): Promise<boolean> => {
  await _executeSql(
    `UPDATE ecodim_activite
        SET titreActivite = ?, typeActivite = ?, descriptionActivite = ?, lieuActivite = ?,
            dateDebutActivite = ?, dateFinActivite = ?, heureDebutActivite = ?,
            heureFinActivite = ?, idClasseEcodim = ?, idMoniteurDirigeant = ?,
            idMoniteurEnseignant = ?, textesBibliques = ?, nombreFilles = ?,
            nombreGarcons = ?, statutActivite = ?, actifActivite = ?
      WHERE idActiviteEcodim = ? AND idUtilisateur = ?`,
    [...valeursActivite(data), data.idActiviteEcodim, data.idUtilisateur]
  );

  return true;
};

export const supprimerActivite = async (
  idActiviteEcodim: number,
  idUtilisateur: number
): Promise<boolean> => {
  // Les images suivent l'activité : laisser les fichiers derrière remplirait le
  // dossier de photos que plus aucune ligne ne référence.
  const images: any = await _selectSql(
    "SELECT fichierImage FROM ecodim_activite_image WHERE idActiviteEcodim = ? AND idUtilisateur = ?",
    [idActiviteEcodim, idUtilisateur]
  );

  await _executeSql(
    "DELETE FROM ecodim_activite_image WHERE idActiviteEcodim = ? AND idUtilisateur = ?",
    [idActiviteEcodim, idUtilisateur]
  );

  await _executeSql(
    "DELETE FROM ecodim_activite WHERE idActiviteEcodim = ? AND idUtilisateur = ?",
    [idActiviteEcodim, idUtilisateur]
  );

  (Array.isArray(images) ? images : []).forEach((image: any) => supprimerImage(image?.fichierImage));

  return true;
};

// ------------------------------------------------------------------ cultes

/**
 * Les colonnes du cahier de texte, avec la facon d'en extraire la valeur.
 *
 * Comme pour le dossier enfant, les noms de colonnes, les points d'interrogation
 * et les valeurs derivent tous de cette unique liste : tenus separement, ils se
 * decalent d'un cran au premier champ ajoute, et la requete ecrit alors chaque
 * donnee dans la colonne voisine sans qu'aucune erreur ne soit levee.
 */
const CHAMPS_CULTE: { nom: string; valeur: (data: ICulteEcodim) => any }[] = [
  { nom: "dateCulte", valeur: (d) => texte(d.dateCulte) },
  { nom: "idClasseEcodim", valeur: (d) => nombre(d.idClasseEcodim) },

  { nom: "idMoniteurDirigeant", valeur: (d) => nombre(d.idMoniteurDirigeant) },
  { nom: "nomDirigeantExterne", valeur: (d) => texte(d.nomDirigeantExterne) },
  { nom: "sujetsPriere", valeur: (d) => texte(d.sujetsPriere) },
  { nom: "chantsCulte", valeur: (d) => texte(d.chantsCulte) },

  { nom: "idMoniteurEnseignant", valeur: (d) => nombre(d.idMoniteurEnseignant) },
  { nom: "nomEnseignantExterne", valeur: (d) => texte(d.nomEnseignantExterne) },
  { nom: "leconDuJour", valeur: (d) => texte(d.leconDuJour) },
  { nom: "passageBiblique", valeur: (d) => texte(d.passageBiblique) },
  { nom: "resumePredication", valeur: (d) => texte(d.resumePredication) },
  { nom: "versetOr", valeur: (d) => texte(d.versetOr) },

  { nom: "montantOffrande", valeur: (d) => Number(d.montantOffrande) || 0 },
  { nom: "nombreFilles", valeur: (d) => Number(d.nombreFilles) || 0 },
  { nom: "nombreGarcons", valeur: (d) => Number(d.nombreGarcons) || 0 },

  { nom: "nomSignatureEnseignant", valeur: (d) => texte(d.nomSignatureEnseignant) },
  { nom: "nomSignatureResponsable", valeur: (d) => texte(d.nomSignatureResponsable) },
  { nom: "nomSignatureDirection", valeur: (d) => texte(d.nomSignatureDirection) },

  { nom: "observationsCulte", valeur: (d) => texte(d.observationsCulte) },
];

const COLONNES_CULTE = CHAMPS_CULTE.map((champ) => champ.nom).join(", ");
const PLACEHOLDERS_CULTE = CHAMPS_CULTE.map(() => "?").join(",");
const AFFECTATIONS_CULTE = CHAMPS_CULTE.map((champ) => `${champ.nom} = ?`).join(", ");

const valeursCulte = (data: ICulteEcodim) => CHAMPS_CULTE.map((champ) => champ.valeur(data));

/**
 * Cultes d'une église, du plus récent au plus ancien : on consulte le cahier de
 * texte pour revoir le dernier dimanche, pas celui de l'année passée.
 *
 * Les noms du dirigeant et de l'enseignant sont joints ici plutôt que recomposés
 * côté client : la liste doit afficher des noms sans un aller-retour par ligne.
 */
export const recupCultes = (idUtilisateur: number): Promise<any[]> =>
  _selectSql(
    `SELECT culte.*,
            classe.libelleClasse,
            dirigeant.nomMembre AS nomDirigeant, dirigeant.prenomMembre AS prenomDirigeant,
            enseignant.nomMembre AS nomEnseignant, enseignant.prenomMembre AS prenomEnseignant
       FROM ecodim_culte culte
       LEFT JOIN ecodim_classe classe ON classe.idClasseEcodim = culte.idClasseEcodim
       LEFT JOIN ecodim_moniteur moniteurDirigeant
              ON moniteurDirigeant.idMoniteur = culte.idMoniteurDirigeant
       LEFT JOIN membre dirigeant ON dirigeant.idMembre = moniteurDirigeant.idMembre
       LEFT JOIN ecodim_moniteur moniteurEnseignant
              ON moniteurEnseignant.idMoniteur = culte.idMoniteurEnseignant
       LEFT JOIN membre enseignant ON enseignant.idMembre = moniteurEnseignant.idMembre
      WHERE culte.idUtilisateur = ?
      ORDER BY culte.dateCulte DESC, culte.idCulteEcodim DESC`,
    [idUtilisateur]
  );

export const ajouterCulte = async (data: ICulteEcodim): Promise<any> => {
  if (!texte(data.dateCulte)) {
    throw new Error("La date du culte est requise.");
  }

  // Un même dimanche ne se tient qu'une fois par classe : deux saisies pour la même
  // date signalent presque toujours une double transcription du cahier.
  const doublon: any = await _selectSql(
    `SELECT idCulteEcodim FROM ecodim_culte
      WHERE idUtilisateur = ? AND dateCulte = ? AND idClasseEcodim IS ?`,
    [data.idUtilisateur, texte(data.dateCulte), nombre(data.idClasseEcodim)]
  );

  if (Array.isArray(doublon) && doublon.length) {
    throw new Error("Un culte est déjà enregistré pour cette classe à cette date.");
  }

  const resultat: any = await _executeSql(
    `INSERT INTO ecodim_culte (${COLONNES_CULTE}, idUtilisateur)
     VALUES (${PLACEHOLDERS_CULTE},?)`,
    [...valeursCulte(data), data.idUtilisateur]
  );

  return resultat?.insertId ?? resultat?.lastID ?? null;
};

export const modifierCulte = async (data: ICulteEcodim): Promise<boolean> => {
  if (!texte(data.dateCulte)) {
    throw new Error("La date du culte est requise.");
  }

  await _executeSql(
    `UPDATE ecodim_culte SET ${AFFECTATIONS_CULTE}
      WHERE idCulteEcodim = ? AND idUtilisateur = ?`,
    [...valeursCulte(data), data.idCulteEcodim, data.idUtilisateur]
  );

  return true;
};

export const supprimerCulte = async (
  idCulteEcodim: number,
  idUtilisateur: number
): Promise<boolean> => {
  await _executeSql(
    "DELETE FROM ecodim_culte WHERE idCulteEcodim = ? AND idUtilisateur = ?",
    [idCulteEcodim, idUtilisateur]
  );

  return true;
};

// ------------------------------------------------------------- évaluations

/**
 * Évaluations d'une église, de la plus récente à la plus ancienne.
 *
 * Chaque évaluation appartient à une classe. Une évaluation régionale ou
 * nationale, passée par toute l'école, se traduit par une évaluation par classe :
 * les notes d'une classe ne se comparent qu'entre elles, et le classement se fait
 * classe par classe.
 */
/**
 * Remet d'aplomb les évaluations créées avant la table de rattachement.
 *
 * Deux héritages à reprendre, une seule fois :
 *
 * 1. une évaluation dont la classe vivait dans `idClasseEcodim` n'a aucun
 *    rattachement : on le crée ;
 * 2. une évaluation commune à toute l'école avait été **dupliquée par classe**,
 *    ce qui donnait autant de colonnes que de classes pour un même devoir. On
 *    refond ces copies en une seule évaluation rattachée à toutes leurs classes.
 *
 * Le regroupement n'opère que sur des copies **identiques** en tout point —
 * intitulé, type, date, coefficient, barème, année. Deux évaluations qui
 * diffèrent sur un seul de ces champs sont deux épreuves distinctes.
 */
const reprendreRattachementsEvaluations = async (idUtilisateur: number): Promise<void> => {
  // --- 1. Les évaluations sans rattachement
  const sansLien: any = await _selectSql(
    `SELECT evaluation.idEvaluation, evaluation.idClasseEcodim
       FROM ecodim_evaluation evaluation
       LEFT JOIN ecodim_evaluation_classe lien ON lien.idEvaluation = evaluation.idEvaluation
      WHERE evaluation.idUtilisateur = ?
        AND evaluation.idClasseEcodim IS NOT NULL
        AND lien.idEvaluationClasse IS NULL`,
    [idUtilisateur]
  );

  for (const ligne of Array.isArray(sansLien) ? sansLien : []) {
    await _executeSql(
      `INSERT INTO ecodim_evaluation_classe (idEvaluation, idClasseEcodim, idUtilisateur)
       VALUES (?,?,?)`,
      [ligne.idEvaluation, ligne.idClasseEcodim, idUtilisateur]
    );
  }

  // --- 2. Les copies identiques, à refondre en une seule évaluation
  const toutes: any = await _selectSql(
    `SELECT idEvaluation, libelleEvaluation, typeEvaluation, dateEvaluation,
            coefficient, noteSur, anneeEcclesiastique
       FROM ecodim_evaluation
      WHERE idUtilisateur = ?
      ORDER BY idEvaluation ASC`,
    [idUtilisateur]
  );

  const groupes = new Map<string, any[]>();

  (Array.isArray(toutes) ? toutes : []).forEach((evaluation: any) => {
    const empreinte = [
      evaluation.libelleEvaluation,
      evaluation.typeEvaluation,
      evaluation.dateEvaluation,
      evaluation.coefficient,
      evaluation.noteSur,
      evaluation.anneeEcclesiastique,
    ].join("|");

    groupes.set(empreinte, [...(groupes.get(empreinte) || []), evaluation]);
  });

  for (const groupe of Array.from(groupes.values())) {
    if (groupe.length < 2) {
      continue;
    }

    const [survivante, ...copies] = groupe;

    for (const copie of copies) {
      // Les rattachements et les notes migrent avant la suppression : une note
      // orpheline ne se rattraperait plus.
      await _executeSql(
        "UPDATE ecodim_evaluation_classe SET idEvaluation = ? WHERE idEvaluation = ? AND idUtilisateur = ?",
        [survivante.idEvaluation, copie.idEvaluation, idUtilisateur]
      );

      await _executeSql(
        "UPDATE ecodim_note SET idEvaluation = ? WHERE idEvaluation = ? AND idUtilisateur = ?",
        [survivante.idEvaluation, copie.idEvaluation, idUtilisateur]
      );

      await _executeSql(
        "DELETE FROM ecodim_evaluation WHERE idEvaluation = ? AND idUtilisateur = ?",
        [copie.idEvaluation, idUtilisateur]
      );
    }
  }
};

/** Remplace d'un bloc les classes concernées par une évaluation. */
const enregistrerClassesEvaluation = async (
  idEvaluation: number,
  idUtilisateur: number,
  classes?: (number | string)[]
): Promise<void> => {
  if (!Array.isArray(classes)) {
    return;
  }

  await _executeSql(
    "DELETE FROM ecodim_evaluation_classe WHERE idEvaluation = ? AND idUtilisateur = ?",
    [idEvaluation, idUtilisateur]
  );

  for (const classe of classes) {
    const idClasse = nombre(classe);
    if (!idClasse) continue;

    await _executeSql(
      `INSERT INTO ecodim_evaluation_classe (idEvaluation, idClasseEcodim, idUtilisateur)
       VALUES (?,?,?)`,
      [idEvaluation, idClasse, idUtilisateur]
    );
  }
};

const valeursEvaluation = (data: IEvaluationEcodim) => [
  texte(data.libelleEvaluation),
  texte(data.typeEvaluation) || "Locale",
  texte(data.dateEvaluation) || null,
  Number(data.coefficient) > 0 ? Number(data.coefficient) : 1,
  Number(data.noteSur) > 0 ? Number(data.noteSur) : 20,
  texte(data.anneeEcclesiastique),
];

/** Les classes d'une évaluation doivent exister et être au moins une. */
const classesValides = (data: IEvaluationEcodim): number[] => {
  const retenues = (Array.isArray(data.classes) ? data.classes : [])
    .map((classe) => nombre(classe))
    .filter((idClasse): idClasse is number => Boolean(idClasse));

  if (!retenues.length) {
    throw new Error("Choisissez au moins une classe pour l'évaluation.");
  }

  return retenues;
};

/**
 * Évaluations d'une église, de la plus récente à la plus ancienne.
 *
 * Une évaluation est **une** épreuve, rattachée à une ou plusieurs classes. Une
 * évaluation régionale passée par toute l'école reste une seule ligne : la
 * dupliquer par classe donnerait autant de colonnes pour un même devoir.
 */
export const recupEvaluations = async (idUtilisateur: number): Promise<any[]> => {
  await reprendreRattachementsEvaluations(idUtilisateur);

  const evaluations: any = await _selectSql(
    `SELECT * FROM ecodim_evaluation
      WHERE idUtilisateur = ?
      ORDER BY dateEvaluation DESC, idEvaluation DESC`,
    [idUtilisateur]
  );

  const liens: any = await _selectSql(
    `SELECT lien.idEvaluation, lien.idClasseEcodim, classe.libelleClasse
       FROM ecodim_evaluation_classe lien
       LEFT JOIN ecodim_classe classe ON classe.idClasseEcodim = lien.idClasseEcodim
      WHERE lien.idUtilisateur = ?`,
    [idUtilisateur]
  );

  return (Array.isArray(evaluations) ? evaluations : []).map((evaluation: any) => {
    const sesClasses = (Array.isArray(liens) ? liens : []).filter(
      (lien: any) => Number(lien.idEvaluation) === Number(evaluation.idEvaluation)
    );

    return {
      ...evaluation,
      classes: sesClasses.map((lien: any) => Number(lien.idClasseEcodim)),
      libelleClasse: sesClasses
        .map((lien: any) => lien.libelleClasse)
        .filter(Boolean)
        .join(', '),
    };
  });
};

export const ajouterEvaluation = async (data: IEvaluationEcodim): Promise<any> => {
  if (!texte(data.libelleEvaluation)) {
    throw new Error("L'intitulé de l'évaluation est requis.");
  }

  const classes = classesValides(data);

  const resultat: any = await _executeSql(
    `INSERT INTO ecodim_evaluation
       (libelleEvaluation, typeEvaluation, dateEvaluation, coefficient,
        noteSur, anneeEcclesiastique, idUtilisateur)
     VALUES (?,?,?,?,?,?,?)`,
    [...valeursEvaluation(data), data.idUtilisateur]
  );

  const idEvaluation = resultat?.insertId ?? resultat?.lastID ?? null;

  if (idEvaluation) {
    await enregistrerClassesEvaluation(idEvaluation, data.idUtilisateur, classes);
  }

  return idEvaluation;
};

export const modifierEvaluation = async (data: IEvaluationEcodim): Promise<boolean> => {
  if (!texte(data.libelleEvaluation)) {
    throw new Error("L'intitulé de l'évaluation est requis.");
  }

  const classes = classesValides(data);

  await _executeSql(
    `UPDATE ecodim_evaluation
        SET libelleEvaluation = ?, typeEvaluation = ?, dateEvaluation = ?,
            coefficient = ?, noteSur = ?, anneeEcclesiastique = ?
      WHERE idEvaluation = ? AND idUtilisateur = ?`,
    [...valeursEvaluation(data), data.idEvaluation, data.idUtilisateur]
  );

  await enregistrerClassesEvaluation(Number(data.idEvaluation), data.idUtilisateur, classes);

  return true;
};

export const supprimerEvaluation = async (
  idEvaluation: number,
  idUtilisateur: number
): Promise<boolean> => {
  // Les notes et les rattachements suivent l'évaluation : laissés derrière, ils
  // fausseraient les moyennes en pointant vers une évaluation disparue.
  await _executeSql("DELETE FROM ecodim_note WHERE idEvaluation = ? AND idUtilisateur = ?", [
    idEvaluation,
    idUtilisateur,
  ]);

  await _executeSql(
    "DELETE FROM ecodim_evaluation_classe WHERE idEvaluation = ? AND idUtilisateur = ?",
    [idEvaluation, idUtilisateur]
  );

  await _executeSql(
    "DELETE FROM ecodim_evaluation WHERE idEvaluation = ? AND idUtilisateur = ?",
    [idEvaluation, idUtilisateur]
  );

  return true;
};

/** Toutes les notes de l'église : la grille les répartit ensuite par enfant. */
export const recupNotes = (idUtilisateur: number): Promise<any[]> =>
  _selectSql("SELECT * FROM ecodim_note WHERE idUtilisateur = ?", [idUtilisateur]);

/**
 * Enregistre d'un bloc les notes saisies dans la grille.
 *
 * Une note vide efface la ligne plutôt que d'enregistrer une chaîne vide : une
 * absence de note et un zéro ne sont pas la même chose, et un zéro fantôme
 * ferait chuter la moyenne d'un enfant qui n'a simplement pas composé.
 */
export const enregistrerNotes = async (donnees: {
  idUtilisateur: number;
  notes: INoteEcodim[];
}): Promise<number> => {
  const notes = Array.isArray(donnees.notes) ? donnees.notes : [];
  let enregistrees = 0;

  for (const note of notes) {
    const idEvaluation = nombre(note?.idEvaluation);
    const idEnfantEcodim = nombre(note?.idEnfantEcodim);

    if (!idEvaluation || !idEnfantEcodim) {
      continue;
    }

    const valeur = texte(note?.valeurNote);

    await _executeSql(
      "DELETE FROM ecodim_note WHERE idEvaluation = ? AND idEnfantEcodim = ? AND idUtilisateur = ?",
      [idEvaluation, idEnfantEcodim, donnees.idUtilisateur]
    );

    if (valeur !== "") {
      await _executeSql(
        `INSERT INTO ecodim_note (idEvaluation, idEnfantEcodim, valeurNote, idUtilisateur)
         VALUES (?,?,?,?)`,
        [idEvaluation, idEnfantEcodim, valeur, donnees.idUtilisateur]
      );
      enregistrees += 1;
    }
  }

  return enregistrees;
};

export default {
  recupClasses,
  ajouterClasse,
  modifierClasse,
  supprimerClasse,
  recupMoniteurs,
  ajouterMoniteur,
  modifierMoniteur,
  supprimerMoniteur,
  recupEnfants,
  ajouterEnfant,
  modifierEnfant,
  supprimerEnfant,
  recupActivites,
  ajouterActivite,
  modifierActivite,
  supprimerActivite,
  enregistrerPhotoEnfant,
  recupImagesActivite,
  ajouterImageActivite,
  supprimerImageActivite,
  recupCultes,
  ajouterCulte,
  modifierCulte,
  supprimerCulte,
  recupEvaluations,
  ajouterEvaluation,
  modifierEvaluation,
  supprimerEvaluation,
  recupNotes,
  enregistrerNotes,
};
