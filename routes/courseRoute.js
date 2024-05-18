const express = require("express");
const controller = require("../controllers/coursecontroller");
const validator = require("../validators/courseValidator");
const { protect, permissions } = require("../controllers/authController");
const ratingRoute = require("./ratingRoute");

const router = express.Router({ mergeParams: true });

router.get("/", controller.getcourses);

router.get("/:id", validator.checkcourseId, controller.getcourse);

router.use("/:courseId/ratings", ratingRoute);

router.use(protect);

router.delete(
  "/:id",
  permissions("instructor", "admin"),
  validator.checkcourseId,
  controller.deletecourse
);

router.delete(
  "/video/:id",
  permissions("instructor", "admin"),
  validator.removeVideoValidator,
  controller.removeVideo
);

router.use(permissions("instructor"));

router.post(
  "/",
  controller.courseDataHandler,
  controller.resizecourseFiles,
  controller.setUserId,
  validator.postcourse,
  controller.postcourse
);
router
  .route("/:id")
  .put(
    controller.courseDataHandler,
    controller.resizecourseFiles,
    validator.updatecourse,
    controller.updatecourse
  );

router
  .route("/video/:id")
  .post(
    controller.courseDataHandler,
    controller.resizecourseFiles,
    validator.postVideo,
    controller.postVideo
  )
  .put(validator.updateVideoNameValidator, controller.updateVideoName);

module.exports = router;
