const express = require("express");
const router = express.Router();

const productRouter = require("./products.route");
const authRouter = require("./auth.route");
const chatRouter = require("./chats.route");
const mypageRouter = require("./mypage.route");

router.use("/product", [productRouter]);
router.use("/auth", [authRouter]);
router.use("/chat", [chatRouter]);
router.use("/mypage", [mypageRouter]);

module.exports = router;
