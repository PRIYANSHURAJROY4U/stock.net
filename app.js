require('dotenv').config()
const express = require("express");
const bodyparser =  require("body-parser");
const ejs =  require("ejs");
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app=express();

app.use(bodyparser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

app.use(session({
  secret:"this is our test",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/info",
    userProfileURL: "https://www.googleapis.com/oauth2/v2/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

mongoose.connect("mongodb://localhost:27017/luserDB");

const userSchema = new mongoose.Schema ({
  email:String,
  name:String,
  password:String,
  googleId:String,
  phoneno:String,
  startupname:String,
  problem:String,
  share:String,
  aboutfounder:String,
  panNO:String,
  additionalinfo:String,
  username:String,
  ureview:String

});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = new mongoose.model("User" ,userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err, user);
    });
});


app.get("/", function(req,res){
  res.render("home")
});

app.get("/register", function(req,res){
  res.render("register")
});


app.get("/auth/google",
  passport.authenticate('google' , {
    scope: [ 'profile' , 'email']
  })
);

app.get("/auth/google/info",
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/info');
  });


  app.get("/login", function(req,res){
    res.render("login")
  });


  app.post("/login",function(req,res){

  const user = new User ({
    username:req.body.username,
    password:req.body.password
  })
    req.login(user,function(err){
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req,res,function(){
          res.redirect("/info");
        });
      }
    });
});

app.get("/info", function(req,res){
  res.render("info")
});

app.post("/register",function(req,res){
  User.register({username:req.body.username},req.body.password,function(err,user){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req,res,function(){
        res.redirect("/info");
      });
    }
  });
  });


  app.post("/login",function(req,res){

  const user = new User ({
    username:req.body.username,
    password:req.body.password
  })
    req.login(user,function(err){
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req,res,function(){
          res.redirect("/info");
        });
      }
    });
});

app.get("/info", function(req,res){
  res.render("info")
});

app.listen(4000,function(){
  console.log("server started on 4000")
});
