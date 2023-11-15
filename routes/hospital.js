var mongoose = require('mongoose');

var hospitalSchema = mongoose.Schema({
    ownerId:{
          type: mongoose.Schema.Types.ObjectId, 
          ref:"user"
     },
     BookingId:[{
          type: mongoose.Schema.Types.ObjectId, 
          ref:"booking"
     }],
     Doctors:[{
        type: mongoose.Schema.Types.ObjectId, 
        ref:"doctor"
     }],
     Facilities:[{
        type: mongoose.Schema.Types.ObjectId, 
        ref:"facilities"
     }],
     pic:{
        type:Array,
        default:[]
     },     
     gstin:{
         type:String,
         required:true
     },
     Himg:String,
     HospitalName:String,
     Address:String,
     City:String,
     State:String,
     PinCode:String,
     ContectNumber:String,
     HEmail:String,
     Specialities:String,
     Timing:String,
     Wards:Number,
     ICU:Number,
     OT:Number,
     OPD:Number,
     ER:Number,
     LAB:Number,
     Ambulance:{ type: Boolean, default: false },
     Medical:{ type: Boolean, default: false },
     DI:{ type: Boolean, default: false },
     Canteen:{ type: Boolean, default: false },
     Des:String,
     Hurl:String,
     YOM:{ type: Date, required: true },
     Rating:Number,
     Beds:Number

    //  picId:String,  
},{timestamps:true,})

module.exports = mongoose.model("hospital", hospitalSchema);
