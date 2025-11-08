import { models , model , Schema } from "mongoose";

const blogSchema = new Schema({
    id : {
        type : String
    },
    date : {
        type : String
    },
    views : {
        type : Number
    },
    title : {
        type : String,
        minLength : 3,
        trim : true
    },
    img : {
        type : String
    },
    categorie : {
        type : String
    },
    content :{
        type: String,
        minLength : 3,
        trim : true
    }
})

const Blog = models.Blog || model( 'Blog' , blogSchema )

export default Blog