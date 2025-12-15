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
    role : {
        type : String,
        enum: ["user", "admin"],   // فقط این دو مقدار مجاز هستند
        default : "user"
    },
    dateLogin: {
        type: String
    },
    phone : {
        type : String,
        unique : true
    },
    email : {
        type : String,
        unique : true
    },
    gender : {
        type : String,
        required : true
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
    },
    password : {
        required : true,
        type : String
    }
})

const Users = models.Users || model('Users', userSchema)

export default Users