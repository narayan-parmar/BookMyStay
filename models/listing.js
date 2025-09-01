const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: Number,
  image: {
    filename: String,
    url: String,
  },
  location: String,
  country: String,
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }], // Review references
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Make owner required
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  category: String
});

// Optional: virtual for map popups (if needed in front-end)
listingSchema.virtual('properties.popUpMarkup').get(function () {
  return `<strong><a href="/listings/${this._id}">${this.title}</a></strong>
          <p>${this.description.substring(0, 50)}...</p>`;
});

module.exports = mongoose.model("Listing", listingSchema);
