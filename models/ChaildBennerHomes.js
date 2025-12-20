import { models , model , Schema } from "mongoose";

const chaildBennerHomeSchema = new Schema(
    {
    
       // id فرانت
       id: {
         type: String,
        //  required: true,
        //  unique: true,
         index: true,
       },
   
       title: {
         type: String,
         required: true,
         trim: true,
         minlength: 3,
       },
   
       categorie: {
         type: String,
         required: true,
         trim: true,
       },
   
       count: {
         type: Number,
         default: 0,
         min: 0,
       },
   
       reviews: {
         type: Number,
         default: 0,
         min: 0,
         max: 5,
       },
   
       price: {
         type: Number,
         required: true,
         min: 0,
       },
   
    //    discountedPrice: {
    //      type: Number,
    //      default: 0,
    //      min: 0,
    //    },
   
       hasDiscount: {
         type: Boolean,
         default: false,
       },
   
       date: {
         type: String, // چون شمسیه
         required: true,
       },
   
       SuggestedCategories: {
         type: [String],
         default: [],
       },
       descriptionBenner : {
        type : String
       },
   
       imgs: {
         thumbnails: {
           type: [String],
          
         },
         previews: {
           type: [String],
           
         },
       }
     
},
{
    timestamps: true,
  }
)

const ChaildBennerHomes = models.ChaildBennerHomes || model( 'ChaildBennerHomes' , chaildBennerHomeSchema )

export default ChaildBennerHomes