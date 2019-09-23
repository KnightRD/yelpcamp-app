// REQUIRE NPM PACKAGES AND ROUTER
var express = require("express"),
	router = express.Router(),
	passport = require("passport");

// REQUIRE MODELS
var User = require("../models/user");

// ROOT ROUTE
router.get("/", function (req, res) {
	res.render("landing");
});

// AUTH ROUTES
// RENDER REGISTRATION FORM
router.get("/register", function (req, res) {
	res.render("register");
});

// HANDLE SIGNUP LOGIC
router.post("/register", function (req, res) {
	// creates new user that saves username, and a hash of the password
	var newUser = new User({username: req.body.username})
	User.register(newUser, req.body.password, function (err, user) {
		if (err){
			req.flash("error", err.message);
			return res.redirect("/register");
		}
		passport.authenticate("local")(req, res, function() {
			req.flash("success", "Welcome to YelpCamp, " + user.username);
			res.redirect("/campgrounds");
		});
	});
});

// RENDER LOGIN FORM
router.get("/login", function (req, res) {
	res.render("login");
});

// HANDLE LOGIN LOGIC
router.post("/login", passport.authenticate("local", {
	successRedirect: "/campgrounds",
	failureRedirect: "/login"
	}), function (req, res) {
});

// LOGOUT ROUTE
router.get("/logout", function (req, res) {
	req.logout();
	req.flash("success", "Successfully logged out!");
	res.redirect("/");
});

module.exports = router;