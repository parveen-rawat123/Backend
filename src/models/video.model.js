import mongoose, { Schema } from "mongoose";
 import aggregatePaginate from "mongoose-aggregate-paginate-v2"

const vidioSchema = new Schema({
  videoFile : {
    type :  String , // cloudinarry
    required : true
  },
  thumbnail :{
    typem : String,
    required : true
  },
  title : {
    type: String,
    required: true
  },
  description : {
    type: String,
    required: true
  },
  duration : {
    type: Number,
    required : true
  },
  views : {
    type: Number,
    default : 0
  },
  isPublished : {
    type: Boolean,
    default : true
  },
  owner : {
    type: Schema.Types.ObjectId,
    ref : "User"
  }
}, {timestamps : true})


vidioSchema.plugin(aggregatePaginate);

export const Video = mongoose.model("Video", vidioSchema)