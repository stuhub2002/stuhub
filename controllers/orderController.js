const expressAsyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });
const Stripe = require("stripe")(process.env.stripe_secret);
const AppError = require("../config/appError");
const course = require("../models/courseModel");
const user = require("../models/userModel");

exports.checkoutSession = expressAsyncHandler(async (req, res, next) => {
  const courseData = await course.findById(req.params.id);
  if (!courseData) {
    return next(new AppError("course not found", 400));
  }
  if (req.user._id.toString() === courseData.instructor.toString()) {
    return next(new AppError("You can't buy your own course", 400));
  }
  const session = await Stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "egp",
          unit_amount: courseData.price * 100,
          product_data: {
            name: courseData.title,
            description: courseData.description,
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    metadata: {
      id: courseData._id.toString(),
    },
    customer_email: req.user.email,
    client_reference_id: req.user._id.toString(),
    success_url: `${req.protocol}://${req.get("host")}/order`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
  });
  res.status(200).json({
    status: "success",
    data: session,
  });
});

exports.webhookCheckout = expressAsyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = Stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.stripe_secret
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    console.log(event.data.object);
    const data = await user.findByIdAndUpdate(
      event.data.object.client_reference_id,
      { $addToSet: { course: event.data.object.metadata.id } },
      { new: true }
    );
    res
      .status(200)
      .json({
        status: "succes",
        message: "The course has been purchased successfully",
        data,
      });
  }
});
