import functions from "./membre/functions";
import functions_cellule from "./cellule/functions";
import functions_groupe from "./groupe/functions";
import functions_comptabilite from "./comptabilite/functions";
import functions_departement from "./departement/functions";
import functions_nouvelle_ame from "./nouvelle_ame/functions";
import functions_utilisateur from "./utlisateur/functions";
import { IMembre } from "./membre/interfaces";
import { INouvelleAme } from "./nouvelle_ame/interfaces";
import { IResponsable } from "./responsabilite/interfaces";
import { IComptabilite } from "./comptabilite/interfaces";
import { IDepartement } from "./departement/interfaces";
import { IGroupe } from "./groupe/interfaces";


// La fonction prend l'id d'un utilisateur en paramètre et retourne une Promise

const getDataEglise = (idUtilisateur: number) => {

    // La fonction retourne une nouvelle Promise avec les fonctions resolve et reject
    return new Promise(async (resolve, reject) => {
        try {
            // Récupération des données de l'utilisateur à partir d'une fonction externe
            const utilisateur: any = await functions_utilisateur.recupUtilisateurById(idUtilisateur)

            // Récupération des données de membres, nouvelles âmes, cellules, groupes, départements et comptabilités
            const membres = await functions.recupMembre()
            const nouvelle_ame = await functions_nouvelle_ame.recupNouvelleAme()
            const cellules = await functions_cellule.recupCellule()
            const groupes = await functions_groupe.recupGroupe()
            const departements = await functions_departement.recupDepartement()
            const comptabilites = await functions_comptabilite.recupComptabilite()

            // Filtrage des données en fonction de l'id de l'utilisateur
            const newMembre = (membres as IMembre[]).filter((item: IMembre) => item.idUtilisateur === utilisateur[0].idUtilisateur);
            const newAme = (nouvelle_ame as INouvelleAme[]).filter((item: INouvelleAme) => item.idUtilisateur === utilisateur[0].idUtilisateur);
            const newCellule = (cellules as IResponsable[]).filter((item: IResponsable) => item.idUtilisateur === utilisateur[0].idUtilisateur);
            const newGroupe = (groupes as IGroupe[]).filter((item: IGroupe) => item.idUtilisateur === utilisateur[0].idUtilisateur);
            const newComptabilite = (comptabilites as IComptabilite[]).filter((item: IComptabilite) => item.idUtilisateur === utilisateur[0].idUtilisateur);
            const newDepartement = (departements as IDepartement[]).filter((item: IDepartement) => item.idUtilisateur === utilisateur[0].idUtilisateur);

            // Création d'un objet résultat contenant les données filtrées
            const result =
            {
                idUtilisateur: utilisateur[0].idUtilisateur,
                nomTemple: utilisateur[0].nomTemple,
                nomUtilisateur: utilisateur[0].nomUtilisateur,
                prenomUtilisateur: utilisateur[0].prenomUtilisateur,
                telephoneUtilisateur: utilisateur[0].telephoneUtilisateur,
                password: utilisateur[0].password,
                confirmPassword: utilisateur[0].confirmPassword,
                email: utilisateur[0].email,
                
                Membres: newMembre,
                nouvelleAmes: newAme,
                Cellules: newCellule,
                Groupes: newGroupe,
                Departements: newDepartement,
                Comptabilites: newComptabilite,
            }

            // Résolution de la Promise avec l'objet résultat
            resolve(result)
        } catch (error) {
            // Rejet de la Promise en cas d'erreur
            reject(error);
        }
    });
};

export default {
    getDataEglise
}