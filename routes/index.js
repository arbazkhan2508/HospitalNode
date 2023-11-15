var express = require('express');
var router = express.Router();
var userModel = require('./users')
var passport = require('passport')
const localStrategy = require("passport-local");
const crypto = require("crypto");
const multer = require("multer");
const reviewModel = require("./review");
const mailer = require("../nodemailer");
var mongoose = require("mongoose");
var hospitalModel = require('./hospital');
const config = require("../config/config");
var fs = require('fs')


const userimagesupload = multer({ storage: config.userimagesstorage });
const hospitalimagesupload = multer({ storage: config.hospitalstorage });
const hospitalprupload = multer({ storage: config.hospitalimagesstorage });

/* GET home page. */
// route


passport.use(
  new localStrategy(
    {
      usernameField: "email",
      usernameQueryFields: ["email"],
    },
    userModel.authenticate()
  )
);

// googlee authenticate

const GoogleStrategy = require("passport-google-oidc");

require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env["GOOGLE_CLIENT_ID"],
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
      callbackURL: "/oauth2/redirect/google",
      scope: ["email", "profile"],
    },
    async function verify(issuer, profile, cb) {
      console.log(profile);
      let user = await userModel.findOne({ email: profile.emails[0].value });
      if (user) {
        return cb(null, user);
      } else {
        let newUser = await userModel.create({
          name: profile.displayName,
          email: profile.emails[0].value,
        });
        newUser.save();
        return cb(null, newUser);
      }
    }
  )
);

router.get("/login/federated/google", passport.authenticate("google"));

router.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

// googlee authenticate

router.get("/addhospital", async function (req, res, next) {
  if (req.isAuthenticated()) {
    let user = await userModel.findOne({ email: req.user.email });
      res.render("AddHospital", { user: user });
  } else {
    res.redirect("/login");
  }
});

router.post("/create/hospital",isLoggedIn,hospitalimagesupload.array("hospitalPhoto", 5),
  async function (req, res) {
    const loginuser = await userModel.findOne({ email: req.user.email });

    let createHospital = await hospitalModel.create({
      HospitalName: req.body.Hn,
      Address: req.body.Ha,
      City: req.body.Hc,
      State: req.body.Hs,
      PinCode: req.body.Pc,
      ContectNumber: req.body.Hcn,
      HEmail: req.body.He,
      Specialities:req.body.Hsp,
      Timing:req.body.Ht,
      Hurl:req.body.Hurl,
      Rating:req.body.Hr,
      YOM: req.body.YOM,
      gstin:req.body.gstin,
      Des:req.body.Des,
      ownerId: loginuser._id,
      pic: req.files.map((pic) => pic.filename),
    });
    loginuser.Hospitels.push(createHospital);
    await loginuser.save();
    res.redirect("/allhospitals");
  }
);


router.get("/editHospital/:id", async function (req, res) {
  let user = await userModel.findOne({ email: req.user.email });
  let Hospital = await hospitalModel.findOne({ _id: req.params.id });
  res.render("editHospital", { Hospital, user });
});


router.get("/delete/review/:id", async function (req, res) {
  var r =  req.params.id;
  console.log(r,"its delete");
  let user = await userModel.findOne({ email: req.user.email });
  let deleteReview = await reviewModel.findOneAndDelete({_id:req.params.id})
  user.ReviewID.splice(r,1);
  res.redirect('/profile')
});




router.get('/hospitalprofile/:id',async function(req,res){ 
  let hospital = await hospitalModel.findOne({ _id:req.params.id })
  let user = await userModel.findOne({ email: req.user.email })
  res.render("hospital", { user:user,hospital:hospital });
})

router.post("/update/Hospital/:id", isLoggedIn, async function (req, res) {
  hospitalModel
    .findOneAndUpdate(
      { _id: req.params.id },
      {
        HospitalName: req.body.Hn,
        Address: req.body.Ha,
        City: req.body.Hc,
        State: req.body.Hs,
        PinCode: req.body.Hp,
        ContectNumber: req.body.Hcn,
        Specialities:req.body.Hsp,
        Timing:req.body.Ht,
        Beds:req.body.Hbeds,
        Wards:req.body.hw,
        ICU:req.body.HI,
        OT:req.body.Hot,
        OPD:req.body.Hop,
        ER:req.body.Her,
        LAB:req.body.Hl,
        Ambulance:req.body.Amb,
        Medical:req.body.HM,
        DI:req.body.HDi,
        Canteen:req.body.HCan,
        Hurl:req.body.Hurl,
        Rating:req.body.Hrat,
      }
    )
    .then(function () {
      res.redirect("/myhospital");
    });
});

router.post("/update/images/:id",isLoggedIn,hospitalimagesupload.array("Hospitalphoto1", 5),
  async function (req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        console.log("not uploaded");
      }
      // pic:req.files.map(pic => pic.filename)

      console.log(req.files, "iysbjbjs");
      const hospitelId = req.params.id;
      const newImages = req.files.map((file) => file.filename);

      // Find the vehicle by ID
      const Hospitel = await hospitalModel.findById(hospitelId);

      // Remove previous images from the public folder
      Hospitel.pic.forEach((image) => {
        fs.unlinkSync(`public/images/uploads/hospitalimages/${image}`);
      });

      Hospitel.pic = [];

      // Update the vehicle's images array with the new images
      Hospitel.pic = newImages;
      await Hospitel.save();

      res.redirect("/myhospital");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  }
);

router.get("/", async function (req, res, next) {
  if (req.isAuthenticated()) {
    let user = await userModel.findOne({ email: req.user.email });
    let allhospitals = await hospitalModel.find().limit(4).skip(0);
    const allreviews = await reviewModel.find().populate('ownerId')
    res.render("home1", { user: user,allhospitals:allhospitals,allreviews:allreviews});
  } else {
    let allhospitals = await hospitalModel.find().limit(4).skip(0);
    const allreviews = await reviewModel.find().populate('ownerId')
    res.render("home1", { user: null ,allhospitals:allhospitals,allreviews:allreviews});
  }
});

router.get('/allhospitals',async function(req,res){
     if (req.isAuthenticated()) {
      let user = await userModel.findOne({ email: req.user.email });
      let allhospitals = await hospitalModel.find();
     res.render('allhospitals',{ user: user,allhospitals:allhospitals})

    } else {
      let allhospitals = await hospitalModel.find();
     res.render('allhospitals',{ user: null,allhospitals:allhospitals });
    }
})
router.get("/profile", async function (req, res, next) {
  let user = await userModel
    .findOne({ email: req.user.email })
  res.render("Myprofile", { user });
});


router.get("/myreviews", async function (req, res, next) {
  let user = await userModel
    .findOne({ email: req.user.email }).populate({
      path: "ReviewID",
      populate: {
        path: "ownerId",
      },
     
    })
       
  res.render("Myreviews", { user});
});

router.post("/update", isLoggedIn, function (req, res) {
  userModel
    .findOneAndUpdate(
      { email: req.user.email },
      {
        name: req.body.name,
        lastname:req.body.lastName,
        contactnumber: req.body.contactnumber,
        email: req.body.email,
        dob: req.body.DOB,
      }
    )
    .then(function () {
      res.redirect("/profile");
    });
});



router.get("/myhospital", async function (req, res, next) {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("Hospitels");
  res.render("Myhospital", { user });
});


// /update photu/

router.post("/uploadphotu",isLoggedIn,userimagesupload.single("filenames"),
  async function (req, res) {
    let user = await userModel.findOne({ email: req.user.email });
    user.userProfileimg = req.file.filename;
    user.save();
    res.redirect("back");
  }
);

// update photu



// /hospital photu/

router.post("/uploadHphotu/:id",isLoggedIn,hospitalprupload.single("Hospitalname"),
  async function (req, res) {
    let hospital = await hospitalModel.findOne({ _id:req.params.id });
    hospital.Himg = req.file.filename;
    hospital.save();
    res.redirect("back");
  }
);

// hospital photu


router.post("/review", isLoggedIn, async function (req, res) {


    let user = await userModel.findOne({ email: req.user.email });
    let createReview = await reviewModel.create({
        ownerId:user._id,
        name:req.body.name,
        review:req.body.message,
    });
    user.ReviewID.push(createReview);
    await user.save();
    res.redirect("/");

});

router.post("/register", function (req, res) {
  var userdata = new userModel({
    name: req.body.name,
    email: req.body.email,
    contactnumber:req.body.phoneNumber,
  });
  userModel.register(userdata, req.body.password).then(function (u) {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/");
    });
  });
});


// /hospital photu/

router.get("/singleH/:id",isLoggedIn, async function (req, res){
  // if (req.isAuthenticated()) {
  //   let user = await userModel.findOne({ email: req.user.email });
  //   let hospital = await hospitalModel.findOne({ _id: req.params.id });
  //   res.render("singleH", { hospital: hospital, user: user });
  // } else {
  //   let hospital = await hospitalModel.findOne({ _id: req.params.id });
  //   res.render("singleH", { hospital: hospital, user: null });
  // }
    let user = await userModel.findOne({ email: req.user.email });
    let hospital = await hospitalModel.findOne({ _id: req.params.id });
    res.render("singleH", { hospital: hospital, user: user });

});



router.get("/search/:value", async function (req, res) {
  const regex = new RegExp(req.params.value, "i");
  const users = await hospitalModel.find({
    $or: [{ HospitalName: regex }, { State: regex }, { City: regex },],
  });
  res.json({ avail: users });
});



router.get('/searchhospital/:name', async (req, res) => {
  const searchQuery = req.params.name;
   if (req.isAuthenticated()) {
    try {
      const searchRegex = new RegExp(searchQuery, 'i'); // 'i' flag for case-insensitive search
  
      // const hospitals = await hospitalModel.find({ City: searchRegex },{ HospitalName: searchRegex },{ State: searchRegex });
      const hospitals = await hospitalModel.find({ 
        $or: [{ HospitalName: searchRegex }, { City: searchRegex },{ State: searchRegex }],
       });
      let user = await userModel.findOne({email:req.user.email})
      //  const loggedInUserEmail = req.user.email;
  
      //  const loggedInUser = await userModel.findOne({ email: loggedInUserEmail });
  
      if (hospitals.length === 0) {
        return res.status(404).json({ message: 'No hospitals found with the given name.' });
      }
       res.render('searchhospital',{hospitals:hospitals,user:user})
    } catch (error) {
      return res.status(500).json({ message: 'Error while searching hospitals.' });
    }
  } else {
    try {
      const searchRegex = new RegExp(searchQuery, 'i'); // 'i' flag for case-insensitive search
  
      // const hospitals = await hospitalModel.find({ City: searchRegex },{ HospitalName: searchRegex },{ State: searchRegex });
      const hospitals = await hospitalModel.find({ 
        $or: [{ HospitalName: searchRegex }, { City: searchRegex },{ State: searchRegex }],
       });

      if (hospitals.length === 0) {
        return res.status(404).json({ message: 'No hospitals found with the given name.' });
      }
       res.render('searchhospital',{hospitals:hospitals,user:user})
    } catch (error) {
      return res.status(500).json({ message: 'Error while searching hospitals.' });
    }
  }

  
});




// forgot pass

router.get("/forgot", function (req, res) {
  res.render("forgot");
});

router.post("/forgot", async function (req, res) {
  let user = await userModel.findOne({ email: req.body.email });
  if (user) {
    crypto.randomBytes(17, async function (err, buff) {
      var rnstr = buff.toString("hex");
      (user.token = rnstr), (user.expiringTime = Date.now() + 3000000);
      await user.save();
      mailer(req.body.email, user._id,user.name, rnstr).then(function () {
        console.log("send mail!");
      });
    });
  } else {
    res.send("no account!");
  }
});

router.get("/reset/:userid/:token", async function (req, res) {
  let user = await userModel.findOne({ _id: req.params.userid });

  if (user.token === req.params.token && user.expiringTime > Date.now()) {
    res.render("newpass", { id: req.params.userid });
  } else {
    res.send("link expired!");
  }
});

router.post("/reset/:id", async function (req, res) {
  let user = await userModel.findOne({ _id: req.params.id });
  user.setPassword(req.body.newpassword, async function () {
    user.otp = "";
    await user.save();
    res.redirect("/");
  });
});

// forgot pass


// {/* <input type="file" multiple="" class="form-control" id="images" accept="image/*" name="images"></input> */}

router.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  }),
  function (req, res) {}
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.clearCookie("connect.sid");
    delete req.session;
    res.redirect("/");
  });
});

// / route

router.get("/login", function (req, res) {
  res.render("login",{user:null});
});


router.get("/sign", function (req, res) {
  res.render("sign",{user:null});
});



function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}

function isLoggedout(req, res, next) {
  if (req) {
    res.redirect("/home");
  } else {
    return next();
  }
}


module.exports = router;
