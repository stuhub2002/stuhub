/* eslint-disable global-require */
const { default: mongoose } = require("mongoose");


const schema = new mongoose.Schema({
  comment: {
    type: String,
    maxlenght: [100, "comment characters must be less than 100 characters"],
    minlenght: [2, "comment characters must be more than 2 characters"],
  },
  rate: {
    type: Number,
    required:[true,"rate is required"],
    min: [1, "rate must be grater than 1"],
    max: [5, "rate must be less than equal 5"],
  },
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required:[true,"rating must belong to user"]
  },
  course:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "course",
    required:[true,"rating must belong to course"]
  }
});

schema.statics.courseRatingAverageAndQuantity = async function(courseId){
  const course = require("./courseModel");
  const result = await this.aggregate([
    { $match :{ course: courseId} },
    { $group : {
      _id: "$course",
      ratingQuantity: { $sum: 1 },
      avgRating: { $avg: "$rate" },
    }}
  ])
  if(result.length > 0){
    await course.findByIdAndUpdate(courseId, {
      ratingsQuantity: result[0].ratingQuantity,
      ratingsAverage: result[0].avgRating.toFixed(1),
    });
  }else{
    await course.findByIdAndUpdate(courseId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
}

schema.post("save",async function(){
  
 await this.constructor.courseRatingAverageAndQuantity(this.course)
})

schema.post("findOneAndUpdate",async (doc) =>{
  await doc.constructor.courseRatingAverageAndQuantity(doc.course)
 })

 schema.post("findOneAndDelete",async (doc) =>{
  await doc.constructor.courseRatingAverageAndQuantity(doc.course)
 })

const rating = mongoose.model("rating", schema);

module.exports = rating;
