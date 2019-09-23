// REQUIRE NPM PACKAGES AND ROUTER
var express = require("express"),
// 	mergeParams: true allows :id to be read from url (I don't fully understand this)
	router = express.Router({mergeParams: true});

// REQUIRE MODELS
var Campground = require("../models/campground"),
	Comment = require("../models/comment");

// REQUIRE MIDDLEWARE
// in the middleware dir - it will auto pull the file index.js (special name)
var middleware = require("../middleware");

// NEW COMMENT - renders new comment form for the current campground
router.get("/new", middleware.isLoggedIn, function (req, res) {
		Campground.findById(req.params.id, function (err, campground) {
		if (err) {
			console.log(err);
		} else {
			res.render("comments/new", {campground: campground});
		}
	});
});

// SAVE COMMENT - handles logic for saving and posting comments
// add isLoggedIn for both get and post routes. You could post data using postman or query strings
router.post("/", middleware.isLoggedIn, function (req, res) {
	// req.body.comment = req.sanitize(req.body.comment);
	Campground.findById(req.params.id, function (err, campground) {
		if (err) {
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			Comment.create(req.body.comment, function (err, comment) {
				if (err) {
				console.log(err);
				} else {
					// add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					campground.comments.push(comment);
					campground.save();
					req.flash("success", "Successfully added comment!");
					res.redirect("/campgrounds/" + req.params.id,);
				}
			});
		}
	});
});

// EDIT COMMENT
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {
	Campground.findById(req.params.id, function (err, campground) {
		if(err || !campground) {
			req.flash("success", "Campground not found!");
			return res.redirect("back");
		}
		Comment.findById(req.params.comment_id, function (err, comment) {
			if (err) {
				res.redirect("/campgrounds");
			} else {
				res.render("comments/edit", {comment: comment, campground_id: req.params.id})
			}
		})
	});
});
	

// UPDATE COMMENT
router.put("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, comment) {
		if (err) {
			res.redirect("back");
		} else {
			req.flash("success", "Comment updated!");
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
});

// DESTROY COMMENT
router.delete("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
	Comment.findByIdAndRemove(req.params.comment_id, function (err) {
		if (err) {
			console.log(err);
		} else {
			req.flash("success", "Comment deleted!");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

module.exports = router;