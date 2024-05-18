const { check } = require("express-validator");
const validationMiddleWare = require("../middlewares/validationMiddlewares");
const course = require("../models/courseModel");
const AppError = require("../config/appError");

exports.postRate = [
  check("course")
    .notEmpty()
    .withMessage("rating must belong to course")
    .isMongoId()
    .withMessage("course id is not valid")
    .custom(async (value, { req }) => {
      const data = await course.findById(value);
      if (!data) {
        throw new AppError("no course for this id", 404);
      } else if (data.instructor.toString() === req.user._id.toString()) {
        throw new AppError("you can't rate this course", 404);
      }
      return true;
    }),
  check("user")
    .notEmpty()
    .withMessage("rating must belong to user")
    .isMongoId()
    .withMessage("user id is not valid"),
  check("rate")
    .notEmpty()
    .withMessage("rate is required")
    .isNumeric()
    .withMessage("rate is not valid")
    .custom((value) => {
      if (value < 1 || value > 5) {
        throw new Error("rate must be between 1 and 5");
      }
      return true;
    }),
  check("comment")
    .optional()
    .isLength({ min: 2 })
    .withMessage("comment characters must be more than 2 characters")
    .isLength({ max: 100 })
    .withMessage("comment characters must be less than 100 characters"),
  validationMiddleWare,
];

exports.updateRate = [
  check("id").isMongoId().withMessage("id not valid"),
  check("course")
    .optional()
    .notEmpty()
    .withMessage("rating must belong to course")
    .isMongoId()
    .withMessage("course id is not valid"),
  check("user")
    .optional()
    .notEmpty()
    .withMessage("rating must belong to user")
    .isMongoId()
    .withMessage("user id is not valid"),
  check("rate")
    .optional()
    .notEmpty()
    .withMessage("rate is required")
    .isNumeric()
    .withMessage("rate is not valid")
    .custom((value) => {
      if (value < 1 || value > 5) {
        throw new Error("rate must be between 1 and 5");
      }
      return true;
    }),
  check("comment")
    .optional()
    .isLength({ min: 2 })
    .withMessage("comment characters must be more than 2 characters")
    .isLength({ max: 100 })
    .withMessage("comment characters must be less than 100 characters"),
  validationMiddleWare,
];

exports.checkRateId = [
  check("id")
    .notEmpty()
    .withMessage("rate ID required")
    .isMongoId()
    .withMessage("rate id is not valid"),
  validationMiddleWare,
];
