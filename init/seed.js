const mongoose = require("mongoose");
const Listing = require("../models/listing");
const data = require("./data"); // direct array

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlustDB";

mongoose.connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected for Seeding"))
  .catch(err => console.log(err));

const seedDB = async () => {
  try {
    await Listing.deleteMany({});

    const transformedData = data.map(d => ({
      title: d.title,
      description: d.description,
      price: d.price,
      image: d.image,
      location: d.location,
      country: d.country,
      reviews: d.reviews.map(r => r.$oid), // convert to array of strings
      owner: d.owner.$oid,                // convert to string
      geometry: d.geometry,
      category: d.category
    }));

    await Listing.insertMany(transformedData);
    console.log("🎉 Data Inserted Successfully!");
  } catch (err) {
    console.log("❌ Error inserting data:", err);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();
