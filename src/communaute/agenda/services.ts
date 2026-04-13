import functions from "./functions";
import { IAgenda } from "./interfaces";

const ajouterAgenda = (data: IAgenda) => new Promise(async (resolve, reject) => {
  try {
    const idAgenda: any = await functions.ajouterAgenda({ ...data });
    const agenda = await functions.recupAgendaId(idAgenda);
    resolve(agenda?.[0] || agenda);
  } catch (error) {
    reject(error);
  }
});

const recupAgendaByIdUtilsateur = (idUtilisateur: any) => new Promise(async (resolve, reject) => {
  try {
    const agendaByUtilisateur = await functions.recupAgendaByIdUtilsateur(idUtilisateur);
    resolve(agendaByUtilisateur);
  } catch (error) {
    reject(error);
  }
});

const supprimerAgenda = (idAgenda: number) => new Promise(async (resolve, reject) => {
  try {
    await functions.supprimerAgenda(idAgenda);
    resolve({ idAgenda });
  } catch (error) {
    reject(error);
  }
});

const modifierAgenda = (data: IAgenda) => new Promise(async (resolve, reject) => {
  try {
    await functions.modifierAgenda(data);
    resolve(data);
  } catch (error) {
    reject(error);
  }
});

export default {
  ajouterAgenda,
  recupAgendaByIdUtilsateur,
  supprimerAgenda,
  modifierAgenda,
};
