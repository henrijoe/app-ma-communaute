import { ajvValidator } from "../../helpers/ajvValidator";


const ajouterGroupeValidator = () => {

    const schema = {
        type: "object",
        properties: {
            libelleGroupe: { type: "string", nullable: false, },
            descriptionGroupe: { type: "string", nullable: false, },
            responsableGroupe: { type: "string", nullable: false, },
            idUtilisateur: { type: "number", nullable: false, maximum: 999},
        },
        required: ["libelleGroupe",],
        additionalProperties: false
    }
    return ajvValidator(schema);
    
};
const modifierGroupeValidator = () => {

    const schema = {
        type: "object",
        properties: {
            idGroupe: { type: "number", nullable: false, maximum: 999},
            libelleGroupe: { type: "string", nullable: false, },
            descriptionGroupe: { type: "string", nullable: false, },
            responsableGroupe: { type: "string", nullable: false, },
            idUtilisateur: { type: "number", nullable: false, maximum: 999},
        },
        required: ["libelleGroupe",],
        additionalProperties: false
    }
    return ajvValidator(schema);
    
};



export default {
    ajouterGroupeValidator,
    modifierGroupeValidator,
}