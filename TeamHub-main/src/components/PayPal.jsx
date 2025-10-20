import React, { useEffect, useRef } from "react";

const PayPal = ({ amount, description, onSuccess }) => {
  const paypalRef = useRef();

  useEffect(() => {
    // prevent multiple script loads
    if (document.getElementById("paypal-sdk")) {
      renderPayPalButtons();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=ASqSkjWfAy5lrX_MojZfzvp9tjlBPhqy2kKhdMz9wAAClWLBEnNAr1E-D9PPhse_DruTLCHEAxe2haYc&currency=USD`;
    script.id = "paypal-sdk";
    script.async = true;
    script.onerror = () => {
      console.error("❌ Failed to load PayPal SDK");
      alert("PayPal script failed to load.");
    };
    script.onload = renderPayPalButtons;

    document.body.appendChild(script);

    function renderPayPalButtons() {
      if (window.paypal && paypalRef.current) {
        window.paypal
          .Buttons({
            style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal" },
            createOrder: (data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    description: description || "Event Payment",
                    amount: {
                      currency_code: "USD",
                      value: amount.toString(),
                    },
                  },
                ],
              });
            },
            onApprove: async (data, actions) => {
              const order = await actions.order.capture();
              console.log("✅ Order approved:", order);
              if (onSuccess) onSuccess(order);
            },
            onError: (err) => {
              console.error("❌ PayPal Checkout error:", err);
              alert("Something went wrong with PayPal payment.");
            },
          })
          .render(paypalRef.current);
      }
    }

    return () => {
      // don't remove script (keep cached), just clear buttons
      if (paypalRef.current) {
        paypalRef.current.innerHTML = "";
      }
    };
  }, [amount, description, onSuccess]);

  return <div ref={paypalRef}></div>;
};

export default PayPal;
