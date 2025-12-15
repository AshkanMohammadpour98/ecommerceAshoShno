import { models, model, Schema } from "mongoose";


const categorySchema = new Schema({
    id: {
        type: String
    },
    name: {
        type: String,
        minLength: 2,
        trim: true
    },
    products: {
        type: Number,
    },
    img: {
        type: String
    }
})

const Categorys = models.Categorys || model('Categorys', categorySchema)

export default Categorys