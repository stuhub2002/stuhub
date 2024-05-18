const { check } = require("express-validator");
const validationMiddleWare = require("../middlewares/validationMiddlewares");

exports.checkcourseId = [
    check("id")
      .notEmpty()
      .withMessage("course ID required")
      .isMongoId()
      .withMessage("course id is not valid"),
    validationMiddleWare,
  ];
  