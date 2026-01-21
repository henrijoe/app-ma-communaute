import { ajvValidator } from "../../helpers/ajvValidator";


const ajouterCelluleValidator = () => {

    const schema = {
        type: "object",
        properties: {
            question: { type: "string", nullable: false, },
            options: { type: "string", nullable: false, },
            correctOption: { type: "string", nullable: false },
            niveau: { type: "string", nullable: false },
            idEglise: { type: "number", nullable: false, maximum: 999},
            idQuestion: { type: "number", nullable: false, minimum: 1, maximum: 999 },
        },
        required: ["question", "options","niveau", "correctOption"],
        additionalProperties: false
    }
    return ajvValidator(schema);
    
};



export default {
    ajouterCelluleValidator,
}