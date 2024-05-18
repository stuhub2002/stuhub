const { check } = require("express-validator");
const validationMiddleWare = require("../middlewares/validationMiddlewares");
const AppError = require("../config/appError");
const courseModel = require("../models/courseModel");

exports.postcourse = [
  check("instructor")
    .notEmpty()
    .withMessage("course must have a instructor")
    .isMongoId()
    .withMessage("instructor id is not valid"),
  check("title")
    .notEmpty()
    .withMessage("course title is required")
    .isLength({ max: 35 })
    .withMessage("course max length is 35 characters")
    .isLength({ min: 3 })
    .withMessage("course minimum length is 3 characters"),
  check("description")
    .notEmpty()
    .withMessage("course description is required")
    .isLength({ max: 255 })
    .withMessage("course max length is 255 characters")
    .isLength({ min: 10 })
    .withMessage("course minimum length is 10 characters"),
  check("imageCover").notEmpty().withMessage("course image Cover is required"),
  check("videos")
    .notEmpty()
    .withMessage("please choose an video at least")
    .isArray()
    .withMessage("videos must be array"),
  check("price")
    .notEmpty()
    .withMessage("course price is required")
    .isLength({ min: 1 })
    .withMessage("minimum course price is 1"),
  check("ratingsAverage")
    .optional()
    .custom((value) => {
      if (value) {
        throw new AppError("you cant add rating AV in your course");
      }
    }),
  check("ratingsQuantity")
    .optional()
    .custom((value) => {
      if (value) {
        throw new AppError("you cant add rating Quantity in your course");
      }
    }),
  validationMiddleWare,
];

exports.postVideo = [
  check("id")
    .notEmpty()
    .withMessage("Course ID is required")
    .isMongoId()
    .withMessage("Invalid Course ID format")
    .custom(async (value, { req }) => {
      const courseData = await courseModel.findById(value);
      if (!courseData) {
        throw new AppError("Course not found", 404);
      }
      if (courseData.instructor.toString() !== req.user._id.toString()) {
        throw new AppError("you are not allowed to update this course", 404);
      }
      return true;
    }),
  check("video")
    .notEmpty()
    .withMessage("video is required")
    .isString()
    .withMessage("video name must be a string")
    .custom((value) => {
      if (!value.endsWith(".mp4")) {
        throw new AppError("only videos allowed", 404);
      }
      return true;
    }),
  validationMiddleWare,
];

exports.updateVideoNameValidator = [
  check("id")
    .notEmpty()
    .withMessage("Course ID is required")
    .isMongoId()
    .withMessage("Invalid Course ID format"),
  check("oldVideoName")
    .notEmpty()
    .withMessage("Old video name is required")
    .isString()
    .withMessage("Old video name must be a string"),
  check("newVideoName")
    .notEmpty()
    .withMessage("New video name is required")
    .isString()
    .withMessage("New video name must be a string")
    .custom((value) => {
      if (!value.endsWith(".mp4")) {
        throw new AppError("only videos allowed", 404);
      }
      return true;
    }),
  validationMiddleWare,
];

exports.removeVideoValidator = [
  check("id")
    .notEmpty()
    .withMessage("Course ID is required")
    .isMongoId()
    .withMessage("Invalid Course ID format"),
  check("videoName")
    .notEmpty()
    .withMessage("Video name is required")
    .isString()
    .withMessage("Video name must be a string"),
  validationMiddleWare,
];

exports.updatecourse = [
  check("title")
    .optional()
    .notEmpty()
    .withMessage("course title is required")
    .isLength({ max: 35 })
    .withMessage("course max length is 35 characters")
    .isLength({ min: 3 })
    .withMessage("course minimum length is 3 characters"),
  check("description")
    .optional()
    .notEmpty()
    .withMessage("course description is required")
    .isLength({ max: 255 })
    .withMessage("course max length is 255 characters")
    .isLength({ min: 10 })
    .withMessage("course minimum length is 10 characters"),
  check("imageCover")
    .optional()
    .notEmpty()
    .withMessage("course image Cover is required"),
  check("videos")
    .optional()
    .isArray()
    .withMessage("videos must be an array")
    .notEmpty()
    .withMessage("please choose an video at least")
    .custom((value) => {
      if (value.length < 1) {
        throw new AppError("course must have one video at least", 404);
      }
      const valueFillter = value.filter((v) => !v.endsWith(".mp4"));
      if (valueFillter.length > 1) {
        throw new AppError("invalid course videos", 404);
      }
      return true;
    }),
  check("price")
    .optional()
    .notEmpty()
    .withMessage("course price is required")
    .isLength({ min: 1 })
    .withMessage("minimum course price is 1"),
  check("ratingsAverage")
    .optional()
    .custom((value) => {
      if (value) {
        throw new AppError("you cant add rating AV in your course");
      }
    }),
  check("ratingsQuantity")
    .optional()
    .custom((value) => {
      if (value) {
        throw new AppError("you cant add rating Quantity in your course");
      }
    }),
  validationMiddleWare,
];

exports.checkcourseId = [
  check("id")
    .notEmpty()
    .withMessage("course ID required")
    .isMongoId()
    .withMessage("course id is not valid")
    .custom(async (value, { req }) => {
      const courseData = await courseModel.findById(value);
      if (!courseData) {
        throw new AppError("Course not found", 404);
      }
      if (
        courseData.instructor.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        throw new AppError("you are not allowed to access this course", 404);
      }
      return true;
    }),
  validationMiddleWare,
];
