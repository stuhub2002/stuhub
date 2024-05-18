const express = require("express");
const controller = require("../controllers/userController");
const validator = require("../validators/userValidator");
const { protect, permissions } = require("../controllers/authController");
const courseRoute = require("./courseRoute");

const router = express.Router();

router.get("/profile", protect,controller.setUserId, validator.checkUserId, controller.getUser);

router.use("/:instructorId/courses", courseRoute);

router.put(
  "/:id",
  protect,
  controller.userImageHandler,
  controller.resizeUserImage,
  validator.updateUser,
  controller.updateUser
);

router.route("/:id").delete(protect,validator.checkUserId, controller.deleteUser);

router.use(protect, permissions("admin"));

router
  .route("/")
  .post(
    controller.userImageHandler,
    controller.resizeUserImage,
    controller.hashPassword,
    validator.createUser,
    controller.createUser
  )
  .get(controller.getUsers);

  router.get("/:id",validator.checkUserId, controller.getUser);


module.exports = router;
