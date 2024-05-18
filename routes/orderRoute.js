const express = require("express")
const { checkcourseId } = require("../validators/orderValidator")
const { checkoutSession, webhookCheckout } = require("../controllers/orderController")
const { protect } = require("../controllers/authController")

const router = express.Router()

router.post("/checkoutSession/:id",protect,checkcourseId,checkoutSession)

router.post("/webhookCheckout",webhookCheckout)

module.exports = router