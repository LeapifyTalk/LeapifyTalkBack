require("dotenv").config();
const paypal = require("paypal-rest-sdk");

exports.goToPayPal = (course) => {
  paypal.configure({
    mode: "sandbox",
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET,
  });

  var create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:5000/api/courses/success-buy",
      cancel_url: "http://localhost:5000/api/courses/cancel-buy",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: course.course_title,
              price: course.offer_price,
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: course.offer_price,
        },
        description: "This is the payment description.",
      },
    ],
  };

  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      throw error;
    } else {
      console.log("Create Payment Response");
      // console.log(payment);

      return payment;
    }
  });
};
