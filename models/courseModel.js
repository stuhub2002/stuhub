const { default: mongoose } = require("mongoose");
const { uploadsModelOptions } = require("../middlewares/uploadMiddleware");
const rating = require("./ratingModel");

const schema = new mongoose.Schema({
  title: {
    required: [true, "course title is required"],
    type: String,
    maxlenght: [35, "course max length is 35 characters"],
    minlenght: [3, "course minimum length is 3 characters"],
  },
  description: {
    required: [true, "course description is required"],
    type: String,
    maxlenght: [255, "course max length is 255 characters"],
    minlenght: [10, "course minimum length is 10 characters"],
  },
  imageCover: {
    required: [true, "course image cover is required"],
    type: String,
  },
  videos: [String],
  price: {
    required: [true, "course price is required"],
    type: Number,
    min: [1, "minimum course price is 1"],
  },
  instructor:{
    type: mongoose.Schema.ObjectId,
    ref:"user",
    required:[true,"course must have a instructor"]
  },
  ratingsAverage: Number,
  ratingsQuantity: Number,
});

uploadsModelOptions(schema, "course");

schema.post("findOneAndDelete",async(doc)=>{
 await rating.deleteMany({course:doc._id})
})

const course = mongoose.model("course", schema);

module.exports = course;
