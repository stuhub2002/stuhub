const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { singleImageHandler, resizeImage } = require("../middlewares/uploadMiddleware");
const MainController = require("./mainController");
const user = require("../models/userModel");

exports.setUserId = (req,res,next)=>{
  req.params.id = req.user._id.toString()
  next()
}

exports.hashPassword = async (req, res, next) => {
    if (req.body.password) {
      try {
        const hashedPassword = await bcrypt.hash(req.body.password, 12);
        req.body.password = hashedPassword;
        next();
      } catch (error) {
        return res.status(500).json({ error: "Error hashing password" });
      }
    } else {
      next();
    }
  };

exports.createUser = MainController.postOne(user);
exports.getUsers = MainController.getAll(user);
exports.updateUser = MainController.updateOne(user);
exports.getUser = MainController.getOne(user);
exports.deleteUser = MainController.deleteOne(user);
exports.userImageHandler = singleImageHandler("image")
exports.resizeUserImage = expressAsyncHandler((req,res,next)=>resizeImage(req,res,next,"user"))