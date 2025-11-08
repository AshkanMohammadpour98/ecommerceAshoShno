import { models, model, Schema } from "mongoose";

const userSchema = new Schema({
    id: {
        type: String
    },
    name: {
        type: String,
        minLength: 3,
        trim: true
    },
    lastName: {
        type: String,
        minLength: 3,
        trim: true
    },
    gender : {
        type : String
    },
    dateLogin: {
        type: String
    },
    registerWith: {
        type: Array
    },
    SuggestedCategories: {
        type: Array,
    },
    PurchasedProducts: {
        type: Array
    },
    purchaseInvoice: {
        type: Array
    },
    img: {
        type: String
    },
    address: {
        type: String,
    }
})

const Users = models.Users || model('Users', userSchema)

export default Users