import express, { Router } from "express";

import controllers from "./controllers";

const ecodimRouter: Router = express.Router();

// Les lectures suivent la convention ".../byutilisateur/:idUtilisateur" : le
// middleware d'authentification y reconnaît le périmètre et refuse qu'un compte
// lise les données d'une autre église.

// Classes
ecodimRouter.get("/recupclasseecodimbyutilisateur/:idUtilisateur", controllers.recupClassesByUtilisateur);
ecodimRouter.post("/insererclasseecodim", controllers.ajouterClasse);
ecodimRouter.post("/modifierclasseecodim", controllers.modifierClasse);
ecodimRouter.post("/supprimerclasseecodim", controllers.supprimerClasse);

// Moniteurs
ecodimRouter.get("/recupmoniteurecodimbyutilisateur/:idUtilisateur", controllers.recupMoniteursByUtilisateur);
ecodimRouter.post("/inserermoniteurecodim", controllers.ajouterMoniteur);
ecodimRouter.post("/modifiermoniteurecodim", controllers.modifierMoniteur);
ecodimRouter.post("/supprimermoniteurecodim", controllers.supprimerMoniteur);

// Enfants
ecodimRouter.get("/recupenfantecodimbyutilisateur/:idUtilisateur", controllers.recupEnfantsByUtilisateur);
ecodimRouter.post("/insererenfantecodim", controllers.ajouterEnfant);
ecodimRouter.post("/modifierenfantecodim", controllers.modifierEnfant);
ecodimRouter.post("/supprimerenfantecodim", controllers.supprimerEnfant);

// Activités
ecodimRouter.get("/recupactiviteecodimbyutilisateur/:idUtilisateur", controllers.recupActivitesByUtilisateur);
ecodimRouter.post("/insereractiviteecodim", controllers.ajouterActivite);
ecodimRouter.post("/modifieractiviteecodim", controllers.modifierActivite);
ecodimRouter.post("/supprimeractiviteecodim", controllers.supprimerActivite);

// Médias : photo d'un enfant, images d'une activité.
ecodimRouter.post("/enregistrerphotoenfantecodim", controllers.enregistrerPhotoEnfant);
ecodimRouter.get("/recupimageactiviteecodim/:idActiviteEcodim", controllers.recupImagesActivite);
ecodimRouter.post("/insererimageactiviteecodim", controllers.ajouterImageActivite);
ecodimRouter.post("/supprimerimageactiviteecodim", controllers.supprimerImageActivite);

// Cultes : le cahier de texte, une ligne par dimanche et par classe.
ecodimRouter.get("/recupculteecodimbyutilisateur/:idUtilisateur", controllers.recupCultesByUtilisateur);
ecodimRouter.post("/insererculteecodim", controllers.ajouterCulte);
ecodimRouter.post("/modifierculteecodim", controllers.modifierCulte);
ecodimRouter.post("/supprimerculteecodim", controllers.supprimerCulte);

// Évaluations et notes.
ecodimRouter.get("/recupevaluationecodimbyutilisateur/:idUtilisateur", controllers.recupEvaluationsByUtilisateur);
ecodimRouter.post("/insererevaluationecodim", controllers.ajouterEvaluation);
ecodimRouter.post("/modifierevaluationecodim", controllers.modifierEvaluation);
ecodimRouter.post("/supprimerevaluationecodim", controllers.supprimerEvaluation);
ecodimRouter.get("/recupnoteecodimbyutilisateur/:idUtilisateur", controllers.recupNotesByUtilisateur);
ecodimRouter.post("/enregistrernoteecodim", controllers.enregistrerNotes);

// Assiduité : l'appel nominatif d'une séance, rattaché à son culte.
ecodimRouter.get(
  "/recuppresenceecodimbyutilisateur/:idUtilisateur",
  controllers.recupPresencesByUtilisateur
);
ecodimRouter.post("/enregistrerappelecodim", controllers.enregistrerAppel);

// Inscription d un enfant par QR code. Le depot est PUBLIC (un parent sur son
// telephone) ; la lecture et le traitement des demandes exigent une session.
ecodimRouter.post("/demandeinscriptionenfant", controllers.ajouterDemandeEnfant);
ecodimRouter.get(
  "/demandesinscriptionenfantbyutilisateur/:idUtilisateur",
  controllers.recupDemandesEnfantByUtilisateur
);
ecodimRouter.post("/validerdemandeinscriptionenfant", controllers.validerDemandeEnfant);
ecodimRouter.post("/rejeterdemandeinscriptionenfant", controllers.rejeterDemandeEnfant);

export default ecodimRouter;
