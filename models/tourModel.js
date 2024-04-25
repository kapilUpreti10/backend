const mongoose = require("mongoose");

//   defining simple schema which is simple validator for the feild to be added in database which will be defined by mongoose model
const tourSchema = new mongoose.Schema({
  id:{
    required:true,
    unique:true,
    type:Number,
  },
  name: {
    type: String,
    required: true,
    maxlength:[40,"name cannot exceed 40 characters"],
    minlength:[3,"name cannot be less than 3 characters"],
    trim:true,
  },
  duration: Number,
  maxGroupSize:Number,
  difficulty:{
    enum:["difficult","medium","easy"],
  
},
  ratingsAverage:{
    type:Number,
    min:0,
    max:5
  },
  ratingsQuantity:Number,
  price:Number,
  summary:{
    type:String,
    trim:true,
  },
  description:String,
  imageCover:{
    type:String,
    trim:true,
  },
  images:[String],
  startDates:[String]
});

const Tour = mongoose.model("Tour", tourSchema, "e");

module.exports = Tour;
