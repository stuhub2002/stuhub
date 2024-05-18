const courseRoute = require("../routes/courseRoute");
const userRoute = require("../routes/userRoute");
const authRoute = require("../routes/authRoute");
const ratingRoute = require("../routes/ratingRoute")
const orderRoute = require("../routes/orderRoute")

const routes = (app) => {
  app.use("/api/v1/course", courseRoute);
  app.use("/api/v1/user", userRoute);
  app.use("/api/v1/auth", authRoute);
  app.use("/api/v1/rating",ratingRoute)
  app.use("/api/v1/order",orderRoute)
};

module.exports = routes;
