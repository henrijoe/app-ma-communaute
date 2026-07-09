import { ajvValidator } from "../../helpers/ajvValidator";


const ajouterResponsabiliteValidator = () => {

    const schema = {
        type: "object",
        properties: {
            libelleResponsabilite: { type: "string", nullable: false, },
            descriptionResponsabilite: { type: "string", nullable: false, },
            idUtilisateur: { type: "number", nullable: false, maximum: 999},
        },
        required: ["libelleResponsabilite"],
        additionalProperties: false
    }
    return ajvValidator(schema);
    
};

const modifierResponsabiliteValidator = () => {
    const schema = {
        type: "object",
        properties: {
            idResponsabilite: { type: "number", nullable: false, maximum: 999 },
            libelleResponsabilite: { type: "string", nullable: false, },
            descriptionResponsabilite: { type: "string", nullable: false, },
            idUtilisateur: { type: "number", nullable: false, maximum: 999 },
        },
        required: ["idResponsabilite", "libelleResponsabilite"],
        additionalProperties: false
    }
    return ajvValidator(schema);
};



export default {
    ajouterResponsabiliteValidator,
    modifierResponsabiliteValidator,
}
