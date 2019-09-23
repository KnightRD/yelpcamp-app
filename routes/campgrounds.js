// REQUIRE NPM PACKAGES AND ROUTER
var express = require("express"),
	router = express.Router();

// REQUIRE MODELS
var Campground = require("../models/campground"),
	Comment = require("../models/comment");

// REQUIRE MIDDLEWARE
// in the middleware dir - it will auto pull the file index.js (special name)
var middleware = require("../middleware");

// RESTful routing: INDEX ROUTE - displays all campgrounds
router.get("/", function (req, res) {
// 	retrieve all campgrounds from database
	Campground.find({}, function (err, allCampgrounds) {
		if (err) {
			console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds: allCampgrounds});
		}
	});
});

// NEW CAMPGROUND - renders new campground form
// RESTful routing: NEW route - show form to create new campground 
// follows REST convention - route for form that relates to campgrounds - both get and post
router.get("/new", middleware.isLoggedIn, function (req, res) {
	res.render("campgrounds/new");
});

// SAVE CAMPGROUND - handles logic for saving and posting new campground
// RESTful routing: CREATE route - add new campground to db
// follows REST convention - that .get route is the same as the .post route - these are different routes get/post but we can named them the same thing
router.post("/", middleware.isLoggedIn, function (req, res) {
	// var newCampground = {
	// 	name: req.body.name,
	// 	image: req.body.image,
	// 	description: req.body.description,
	// 	author: {
	// 		id: req.user._id,
	// 		username: req.user.username
	// 	}
	// }
	// Campground.create(newCampground, function (err, campground) {
	// The above is replaced by line below and campgroud.author etc after else statement
	Campground.create(req.body.campground, function (err, campground) {
		if (err) {
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			campground.author.id = req.user._id;
			campground.author.username = req.user.username;
			campground.save();
			req.flash("success", "Successfully added campground!");
			res.redirect("/campgrounds");
		}
	});
});

// RESTful routing: SHOW ROUTE - detailed view of one campground
router.get("/:id", function (req, res) {
// 	adding .populate.exec to show all associated comments
	Campground.findById(req.params.id).populate("comments").exec(function (err, campground) {
		if (err || !campground) {
			req.flash("error", "Campground not found!");
			res.redirect("back");
		} else {
			res.render("campgrounds/show", {campground: campground});
		}
	});
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function (req, res) {
	Campground.findById(req.params.id, function (err, campground) {
		if (err) {
			res.redirect("/campgrounds");
		} else {
			res.render("campgrounds/edit", {campground: campground});
		}
	});
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function (req, res) {
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, updatedCampground) {
		if (err) {
			res.redirect("/campgrounds");
		} else {
			req.flash("success", "Campground updated!");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
	Campground.findByIdAndRemove(req.params.id, function (err, campground) {
		if (err) {
			console.log(err);
		} else {
			// removes comments associated with deleted campground - not exactly sure how this code works
			Comment.deleteMany( {_id: { $in: campground.comments } }, function (err) {
				if (err) {
					console.log(err);
				} else {
					req.flash("success", "Campground deleted!");
					res.redirect("/campgrounds");	
				}
			});
		};
	});
});

module.exports = router;