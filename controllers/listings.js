const Listing = require("../models/listing");

// Mapbox code removed

module.exports.index = async (req, res) => {
  let allListings = await Listing.find();
  res.render("./listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author", select: "username" } })
    .populate({ path: "owner", select: "username" });

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  // Fallback for missing owner or review authors
  if (!listing.owner) listing.owner = { username: "Unknown" };
  listing.reviews.forEach(r => {
    if (!r.author) r.author = { username: "Unknown" };
  });

  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  // Dummy coordinates (Bhopal)
  const geometry = { type: "Point", coordinates: [77.4126, 23.2599] };

  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { filename, url };
  newListing.geometry = geometry;
  await newListing.save();
  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you trying to edit for does not exist!");
    return res.redirect("/listings");
  }
  let imageUrl = listing.image.url.replace("/upload", "/upload/w_250,h_160");
  res.render("listings/edit.ejs", { listing, imageUrl });
};

module.exports.updateListing = async (req, res, next) => {
  let { id } = req.params;

  // Dummy coordinates (Delhi)
  const geometry = { type: "Point", coordinates: [77.1025, 28.7041] };
  req.body.listing.geometry = geometry;

  let updatedListing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    updatedListing.image = { url, filename };
    await updatedListing.save();
  }

  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.filter = async (req, res, next) => {
  let { id } = req.params;
  let allListings = await Listing.find({ category: { $all: [id] } });
  if (allListings.length != 0) {
    res.locals.success = `Listings Filtered by ${id}!`;
    res.render("listings/index.ejs", { allListings });
  } else {
    req.flash("error", `There is no any Listing for ${id}!`);
    res.redirect("/listings");
  }
};

module.exports.search = async (req, res) => {
  let input = req.query.q.trim().replace(/\s+/g, " ");
  if (!input) {
    req.flash("error", "Please enter search query!");
    return res.redirect("/listings");
  }

  let element = input
    .split("")
    .map((c, i, arr) => (i === 0 || arr[i - 1] === " " ? c.toUpperCase() : c.toLowerCase()))
    .join("");

  let allListings = await Listing.find({ title: { $regex: element, $options: "i" } });

  if (allListings.length) {
    res.locals.success = "Listings searched by Title!";
    return res.render("listings/index.ejs", { allListings });
  }

  allListings = await Listing.find({ category: { $regex: element, $options: "i" } }).sort({ _id: -1 });
  if (allListings.length) {
    res.locals.success = "Listings searched by Category!";
    return res.render("listings/index.ejs", { allListings });
  }

  allListings = await Listing.find({ country: { $regex: element, $options: "i" } }).sort({ _id: -1 });
  if (allListings.length) {
    res.locals.success = "Listings searched by Country!";
    return res.render("listings/index.ejs", { allListings });
  }

  allListings = await Listing.find({ location: { $regex: element, $options: "i" } }).sort({ _id: -1 });
  if (allListings.length) {
    res.locals.success = "Listings searched by Location!";
    return res.render("listings/index.ejs", { allListings });
  }

  const intValue = parseInt(element, 10);
  if (!isNaN(intValue)) {
    allListings = await Listing.find({ price: { $lte: intValue } }).sort({ price: 1 });
    if (allListings.length) {
      res.locals.success = `Listings searched by price less than Rs ${intValue}!`;
      return res.render("listings/index.ejs", { allListings });
    }
  }

  req.flash("error", "No listings found based on your search!");
  res.redirect("/listings");
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};

module.exports.reserveListing = async (req, res) => {
  let { id } = req.params;
  req.flash("success", "Reservation Details sent to your Email!");
  res.redirect(`/listings/${id}`);
};
