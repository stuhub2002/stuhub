const express = require("express");
const { protect, permissions } = require("../controllers/authController");
const controller = require("../controllers/ratingController");
const validator = require("../validators/ratingValidator");

const router = express.Router({mergeParams:true});

router.get("/", controller.getratings);

router.delete("/admin/:id",protect,permissions("admin"), validator.checkRateId, controller.deleteRate);

router.use(protect,permissions("user","instructor"));

router
  .route("/:id")
  .put(validator.updateRate, controller.updateRate)
  .delete(validator.checkRateId, controller.deleteUserRate);

router.post(
  "/",
  controller.setUserId,
  validator.postRate,
  controller.postRate
);



module.exports = router;
