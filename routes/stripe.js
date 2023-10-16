const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_KEY);

router.post("/payment", (req, res) => {
  console.log("Received payment request:", req.body);

//   stripe.paymentIntents.create(
//     {
//       payment_method: req.body.tokenId, // Use the PaymentMethod created on the frontend
//       amount: req.body.amount,
//       currency: "usd",
//       automatic_payment_methods: { enabled: true },
//     },
//     (stripeErr, stripeRes) => {
//       if (stripeErr) {
//         console.log("Stripe error:", stripeErr);
//         res.status(500).json(stripeErr);
//       } else {
//         console.log("Stripe response:", stripeRes);
//         res.status(200).json(stripeRes);
//       }
//     }
//   );
// });


stripe.paymentIntents.create(
  {
    payment_method_types: ['card'],  // Specify the payment method type
    payment_method_data: {
      type: 'card',
      card: {
        token: req.body.tokenId,
      },
    },
    amount: req.body.amount,
    currency: 'usd',
    // automatic_payment_methods: { enabled: true },
  },
  (stripeErr, stripeRes) => {
    if (stripeErr) {
      console.log('Stripe error:', stripeErr);
      res.status(500).json(stripeErr);
    } else {
      console.log('Stripe response:', stripeRes);
      res.status(200).json(stripeRes);
    }
  }
)
});
module.exports = router;
