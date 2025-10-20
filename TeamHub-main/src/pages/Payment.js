import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PayPal from "../components/PayPal";
import "./Payment.css";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [eventData, setEventData] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const data =
      location.state?.eventData ||
      JSON.parse(sessionStorage.getItem("eventFormData") || "{}");

    if (!data || Object.keys(data).length === 0) {
      navigate("/create-event");
      return;
    }
    
    // Debug: Log the eventData to see the structure
    console.log("Event Data Structure:", data);
    setEventData(data);
  }, [location, navigate]);

  const handleCancel = () => {
    sessionStorage.removeItem("eventFormData");
    navigate("/events");
  };

  const calculateTotal = () => {
    const basePrice = 99;
    const additionalFeatures = 0;
    return basePrice + additionalFeatures;
  };

  const handlePaymentSuccess = async (order) => {
    try {
      const saveResponse = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...eventData,
          payment: {
            paymentGateway: "PayPal",
            transactionStatus: "Success",
          },
        }),
      });
      console.log("Save Event Response:", saveResponse);
      
      if (saveResponse.ok) {
        sessionStorage.removeItem("eventFormData");
        navigate("/events", {
          state: { message: "🎉 Event created successfully!", type: "success" },
        });
      } else {
        const err = await saveResponse.json();
        alert("❌ Event creation failed after PayPal payment.\n" + err.message);
      }
    } catch (error) {
      console.error("Error saving event after PayPal:", error);
      alert("❌ Something went wrong while creating the event.");
    }
  };

  // Helper function to format date safely
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  if (!eventData) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <h1>Complete Your Payment</h1>
          <p>Secure payment for event creation</p>
        </div>

        <div className="payment-content">
          {/* Left Side: Order Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="event-details">
              <h4>{eventData.title || "Event Name"}</h4>
              <p><strong>Category:</strong> {eventData.category || "Not specified"}</p>
              <p><strong>Date:</strong> {formatDate(eventData.dates?.eventStart)}</p>
              <p><strong>Mode:</strong> {eventData.eventLogistics?.eventMode || "Not specified"}</p>
              <p><strong>Location:</strong> {eventData.location || "Not specified"}</p>
              {eventData.participantRules?.maxParticipants && (
                <p><strong>Max Participants:</strong> {eventData.participantRules.maxParticipants}</p>
              )}
              {eventData.participantRules?.registrationFee > 0 && (
                <p><strong>Registration Fee:</strong> ₹{eventData.participantRules.registrationFee}</p>
              )}
            </div>

            <div className="pricing">
              <div className="price-row">
                <span>Event Creation Fee</span>
                <span>₹99</span>
              </div>
              <div className="price-row">
                <span>Platform Fee</span>
                <span>₹0</span>
              </div>
              <div className="price-row total">
                <span>Total Amount</span>
                <span>₹{calculateTotal()}</span>
              </div>
            </div>
          </div>

          {/* Right Side: PayPal Button */}
          <div className="payment-form">
            <h3>Pay Securely with PayPal</h3>
            <div className="payment-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>

              <PayPal
                amount={calculateTotal()}
                onSuccess={handlePaymentSuccess}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
