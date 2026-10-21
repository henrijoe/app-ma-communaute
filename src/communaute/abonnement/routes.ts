import express, { Router } from "express";

import controllers from "./controllers";

const abonnementRouter: Router = express.Router();

// Souscription et consultation : réservées à un compte authentifié.
abonnementRouter.post("/abonnement/souscrire", controllers.souscrire);
// Vérification à la demande : indispensable tant qu'aucun webhook n'est joignable
// (test en local), et filet de sécurité ensuite si une notification se perd.
abonnementRouter.get("/abonnement/verifier/:reference", controllers.verifier);
abonnementRouter.get("/abonnement/etat/:idUtilisateur", controllers.etat);

// Notification SasPay : appelée par leurs serveurs, donc sans jeton. L'authenticité
// est établie par la signature HMAC, pas par l'authentification applicative.
abonnementRouter.post("/abonnement/webhook", controllers.webhook);

export default abonnementRouter;
