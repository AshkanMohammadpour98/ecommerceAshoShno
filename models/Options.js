import { models, model, Schema } from "mongoose";


const optionsSchema = new Schema({
    id: {
        type: String
    },
    label : {
        type : String,
        trim: true,
        minLength: 2,
    },
    value: {
        type: String,
        minLength: 1,
        trim: true
    }
})

const Options = models.Options || model('Options', optionsSchema)

export default Options