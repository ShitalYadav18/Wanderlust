
const mongoose = require("mongoose");
const ExpressError = require("../utils/ExpressError.js");

const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req,res,next)=>{

  let { id } = req.params;

 
  if(!mongoose.Types.ObjectId.isValid(id)){
    throw new ExpressError(400,"Invalid Listing ID");
  }

  let listing = await Listing.findById(id);

  
  if(!listing){
    throw new ExpressError(404,"Listing Not Found");
  }

  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  console.log(newReview);

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();
  req.flash("success" , "New Review Created!");

  res.redirect(`/listings/${listing._id}`);
}


module.exports.destroyReview = async(req,res) => {
  let{id,reviewId} = req.params;

  await Listing.findByIdAndUpdate(id,{$pull : {reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);
  req.flash("success" , "Review Deleted!");
  res.redirect(`/listings/${id}`);
};