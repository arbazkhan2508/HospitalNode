const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
// const findOrCreate = require("mongoose-findorcreate");
mongoose.connect("mongodb://127.0.0.1:27017/hospital")
  .then(function (connected) {
    console.log("connected!");
  })
  .catch((err) => {
    console.log(err);
  });

let userSchema = mongoose.Schema(
  {
    Bookmark: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "booking",
      },
    ],
    BookedvID:[{
       type:mongoose.Schema.Types.ObjectId,
       ref:"vehicle"
    }
    ],
    ReviewID:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"review"
   }
   ],
   Hospitels:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"vehicle"
     }],
     vehicles:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"vehicle"
     }],
    email: {
      type: String,
      require: true,
    },
    name: {
      type: String,
      require: true,
    },
    lastname:{
      type: String,
    },
    userProfileimg: String,
    dob: {
      type: Date,
      require: true,
    },
    contactnumber: Number,
    token: {
      type: String,
      default: "",
    },
    expiringTime: String,
    password: String,
  },
  { timestamps: true }
);
userSchema.plugin(plm, { usernameField: "email" });
// userSchema.plugin(findOrCreate);
module.exports = mongoose.model("user", userSchema);
