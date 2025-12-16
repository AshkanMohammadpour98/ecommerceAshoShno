import { models, model, Schema } from "mongoose";


const tagsSchema = new Schema({
    id: {
        type: String
    },
    name: {
        type: String,
        minLength: 2,
        trim: true
    }
})

const Tags = models.Tags || model('Tags', tagsSchema)

export default Tags