import express from "express";
import Razorpay from "razorpay";

const app = express();
const razorpay = new Razorpay({
  key_id: "YOUR_KEY_ID",
  key_secret: "YOUR_SECRET_KEY",
});

app.post("/create-order", async (req, res) => {
  try {
    const options = {
      amount: 99900, // amount in paise (₹999)
      currency: "INR",
      receipt: "order_rcptid_" + Date.now(),
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(5000, () => console.log("Backend running on port 5000"));
