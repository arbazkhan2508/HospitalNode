var mongoose = require('mongoose');

var reviewSchema = mongoose.Schema({
     ownerId:{
          type: mongoose.Schema.Types.ObjectId, 
          ref:"user"
     },
     name:String,
     review:String

},{timestamps:true,})

module.exports = mongoose.model("review", reviewSchema);
