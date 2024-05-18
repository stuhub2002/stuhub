const { check } = require("express-validator");
const validationMiddleWare = require("../middlewares/validationMiddlewares");
const AppError = require("../config/appError");
const user = require("../models/userModel");

exports.createUser = [
  check("username")
    .notEmpty()
    .withMessage("username is required")
    .isLength({ max: 30 })
    .withMessage("username max length is 30 characters")
    .isLength({ min: 2 })
    .withMessage("username minimum length is 2 characters"),
  check("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password minimum length is 6 characters"),
  check("email")
    .notEmpty()
    .withMessage("email is required")
    .isLength({ max: 30 })
    .withMessage("email must be grater than 10 character")
    .isLength({ min: 2 })
    .withMessage("email must be less than 100 character")
    .isEmail()
    .withMessage("unvalid email format")
    .custom(async (value) => {
      const data = await user.findOne({ email: value });
      if (data) {
        throw new AppError("email already exists", 409);
      } else {
        return true;
      }
    }),
  check("role")
    .optional()
    .isString()
    .withMessage("role should be a string")
    .custom((value) => {
      if (value !== "admin" || value !== "user") {
        return new AppError("only user and admin allowed in role", 405);
      }
      return true;
    }),
  validationMiddleWare,
];

exports.updateUser = [
  check("username")
    .optional()
    .notEmpty()
    .withMessage("username is required")
    .isLength({ max: 30 })
    .withMessage("username max length is 30 characters")
    .isLength({ min: 2 })
    .withMessage("username minimum length is 2 characters"),
  check("password")
    .optional()
    .custom(async () => {
      throw new AppError("you can not change  user password from here", 404);
    }),
    check("course")
    .optional()
    .custom(async () => {
      throw new AppError("you can not change  user password from here", 404);
    }),
  check("email")
    .optional()
    .notEmpty()
    .withMessage("email is required")
    .isLength({ max: 30 })
    .withMessage("email must be grater than 10 character")
    .isLength({ min: 2 })
    .withMessage("email must be less than 100 character")
    .isEmail()
    .withMessage("unvalid email format"),
  check("role")
    .optional()
    .isString()
    .withMessage("role should be a string")
    .custom((value, { req }) => {
      if (req.user.role !== "admin") {
        throw new AppError("only admin can change role", 405);
      }
      if (value === "admin" || value === "user" || value === "instructor") {
        return true;
      }
      throw new AppError("only user and admin allowed in role", 405);
    }),
  validationMiddleWare,
];

exports.checkUserId = [
  check("id")
    .notEmpty()
    .withMessage("user ID required")
    .isMongoId()
    .withMessage("course id is not valid").custom((value,{req})=>{
      if(req.user.role !== "admin" && req.user._id.toString() !== value.toString()) {
        throw new AppError("you can not access other user", 405);
      }
      return true
    }),
  validationMiddleWare,
];
