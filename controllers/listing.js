const Listing = require("../models/listing.js");


module.exports.index = async (req, res) => {
    const { search, category } = req.query;
    let allListings;
    
    if(search) {
        allListings = await Listing.find({
            $or: [
                { country: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
                { title: { $regex: search, $options: "i" } },
            ]
        });
    } else if(category) {
        allListings = await Listing.find({ category });
    } else {
        allListings = await Listing.find({});
    }
    
    res.render("listings/index.ejs", { allListings, search: search || "", category: category || "" });
};

module.exports.renderNewForm = (req,res)=>{
  res.render("listings/new.ejs");

}

module.exports.showListing = async(req,res) =>{
  let {id} = req.params;
  const listing = await Listing.findById(id).populate({
    path: "reviews",
    populate:{
      path:"author",
    },
  })
    .populate("owner");
  if(!listing){
    req.flash("error","Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs",{listing});
};


module.exports.createListing = async(req, res, next) => {
    let coordinates = [77.2090, 28.6139]; // default New Delhi
    
    try {
        let loc = req.body.listing.location.trim();
        let country = req.body.listing.country.trim();
        let locationQuery = loc.includes(country) ? loc : loc + ", " + country;
        let response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationQuery)}&format=json&limit=1`,
            {
                headers: {
                    'User-Agent': 'WanderlustApp/1.0' 
                }
            }
        );
        let data = await response.json();
        if(data.length > 0) {
            coordinates = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
        }
    } catch(e) {
        console.log("Geocoding failed, using default coordinates");
    }

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.image = {url, filename};
    newListing.owner = req.user._id;
    newListing.geometry = { type: "Point", coordinates };
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};


module.exports.renderEditForm = async (req,res) => {
  let {id} = req.params;
  const listing = await Listing.findById(id);
  if(!listing){
    req.flash("error","Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250")

  res.render("listings/edit.ejs",{listing , originalImageUrl});

}


module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{ ...req.body.listing});

    if(typeof req.file != "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url , filename};
    await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};


module.exports.destroyListing = async (req,res) => {
  let {id} = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success" , "Listing Deleted!");
  res.redirect("/listings");
};