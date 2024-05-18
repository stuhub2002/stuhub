const { default: mongoose } = require("mongoose");
const { uploadsModelOptions } = require("../middlewares/uploadMiddleware");

const schema = new mongoose.Schema({
  username: {
    type: String,
    required:[true,"username is required"],
    maxlenght: [30, "username must be less than 30 characters"],
    minlenght: [2, "username must be more than 2 characters"],
  },
  email: {
    type:String,
    required:[true,"user email is required"],
    unique:[true,"user email is unique"],
    minlenght: [10, "user email must be grater than 10 character"],
    maxlenght: [100, "user email must be less than 100 character"],
  },
  password:{
    type: String,
    required:[true,"user password is required"],
    minlenght: [6, "user password must be grater than 15 character"],
  },
  image:String,
  role: {
    type: String,
    default:"user",
    enum: ["user", "admin" ,"instructor"],
  },
  course:[
    {
      type:mongoose.Schema.ObjectId,
      ref:"course"
    }
  ],
  passwordChangeAt:Date,
  passwordResetToken:Number,
  passwordResetExpires:Date,
  passwordReset:Boolean
});

uploadsModelOptions(schema,"user")

const user = mongoose.model("user", schema);

module.exports = user;