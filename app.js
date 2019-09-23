// REQUIRE NPM PACKAGES
var express = require("express"),
	app = express(),
	mongoose = require("mongoose"),
	bodyParser = require("body-parser"),
	passport = require("passport"),
	LocalStrategy = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose"),
	methodOverride = require("method-override"),
	flash = require("connect-flash"),
	session = require('express-session'),
	MongoStore = require('connect-mongo')(session);

// REQUIRE MODELS
var Campground = require("./models/campground"),
	Comment = require("./models/comment"),
	User = require("./models/user");

// REQUIRE ROUTES
var commentRoutes = require("./routes/comments"),
	campgroundRoutes = require("./routes/campgrounds"),
	indexRoutes = require("./routes/index");

// DOTENV CONFIG
var dotenv = require("dotenv");
dotenv.config();

// MONGOOSE CONFIG
// This now takes the URI from .env for local env (uses local database) and the URI from heroku defined (production database) 
var URI = process.env.URI;
mongoose.connect(URI, {
	useNewUrlParser: true,
	useCreateIndex: true
});
// stop findAndModify deprecation warnings
mongoose.set('useFindAndModify', false);

// EXPRESS CONFIG (ejs, body-parser, public dir for stylesheets etc)
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// SESSION SETUP stops memorystore / leak message on production deployment
// uses database to hold session info - use cookie-session if no database
app.use(session({
	secret: "Rusty wins cutest dog",
	resave: false,
	saveUninitialized: false,
	store: new MongoStore({ mongooseConnection: mongoose.connection }),
	// sets cookie time to one hour in ms
	cookie: { maxAge: 60 * 60 * 1000 }
}));

// PASSPORT CONFIG
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// MIDDLEWARE
// passes through {currentUser: res.user}, for every route/view
app.use(function (req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

// USE IMPORTED ROUTES
// add first arguement as part of route declaration - then delete repeated declaration in route dir files.
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

// Notes
// app.use - use on every route etc

// SERVER LISTEN
var port = process.env.PORT || 3000;
app.listen(port);