import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { supabase } from "../lib/supabaseClient";
import { FiArrowLeft, FiMapPin, FiCreditCard } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

function Checkout() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const placeOrder = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(`${API}/api/orders/place-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          cart,
          address,
          total,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      navigate("/order-success");
    } catch (err) {
      console.error(err);
      alert("Order failed");
    }
  };

  const fetchData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(`${API}/api/orders/checkout-data`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setCart(data.cart || []);
      setAddress(data.address || null);
    } catch (err) {
      console.error("Checkout fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  if (loading) return <p className="p-10">Loading...</p>;

  return (
    <>
      <Navbar />

      <div className="bg-gray-50 min-h-screen py-10 px-6">
        <div className="max-w-7xl mx-auto">
          {/* BACK */}

          <a
            href="/cart"
            className="flex items-center gap-2 text-gray-500 mb-6"
          >
            <FiArrowLeft />
            Back to Cart
          </a>

          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          {/* STEPS */}

          <div className="flex items-center gap-6 mb-10">
            <Step number={1} text="Shipping" active={step === 1} />
            <Step number={2} text="Payment" active={step === 2} />
            <Step number={3} text="Review" active={step === 3} />
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* LEFT CONTENT */}

            <div className="md:col-span-2">
              {/* STEP 1 SHIPPING */}

              {step === 1 && (
                <div className="bg-white p-6 rounded-xl shadow space-y-6">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <FiMapPin />
                    Shipping Address
                  </h2>

                  {address ? (
                    <div className="border rounded-lg p-4">
                      <p className="font-semibold">{address.full_name}</p>

                      <p className="text-gray-500 text-sm">{address.street}</p>

                      <p className="text-gray-500 text-sm">
                        {address.city}, {address.state} {address.zipcode}
                      </p>

                      <p className="text-gray-500 text-sm">{address.country}</p>
                    </div>
                  ) : (
                    <p className="text-red-500">
                      No default address found. Please add one in Profile.
                    </p>
                  )}

                  <button
                    onClick={() => setStep(2)}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* STEP 2 PAYMENT */}

              {step === 2 && (
                <div className="bg-white p-6 rounded-xl shadow space-y-6">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <FiCreditCard />
                    Payment Method
                  </h2>

                  <div className="border rounded-lg p-4 flex items-center gap-3 border-green-500">
                    <input type="radio" checked readOnly />

                    <span className="font-medium">Razorpay</span>
                  </div>

                  <p className="text-gray-500 text-sm">
                    Secure payment powered by Razorpay.
                  </p>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setStep(1)}
                      className="px-5 py-2 bg-gray-100 rounded-lg"
                    >
                      Back
                    </button>

                    <button
                      onClick={() => setStep(3)}
                      className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 REVIEW */}

              {step === 3 && (
                <div className="bg-white p-6 rounded-xl shadow space-y-6">
                  <h2 className="font-semibold text-lg">Order Review</h2>

                  <div>
                    <h3 className="font-medium mb-2">Shipping To</h3>

                    <p className="text-gray-700">{address?.full_name}</p>

                    <p className="text-gray-500 text-sm">{address?.street}</p>

                    <p className="text-gray-500 text-sm">
                      {address?.city}, {address?.state} {address?.zipcode}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Payment</h3>

                    <p className="text-gray-600">Razorpay</p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Items ({cart.length})</h3>

                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div
                          key={item.product_id}
                          className="flex justify-between items-center border p-4 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={item.image}
                              className="w-14 h-14 rounded object-cover"
                            />

                            <div>
                              <p className="font-medium">{item.title}</p>

                              <p className="text-gray-500 text-sm">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>

                          <p className="font-semibold">
                            ₹
                            {(item.price * item.quantity).toLocaleString(
                              "en-IN",
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setStep(2)}
                      className="px-5 py-2 bg-gray-100 rounded-lg"
                    >
                      Back
                    </button>

                    <button
                      onClick={placeOrder}
                      className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 font-semibold"
                    >
                      Place Order
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ORDER SUMMARY */}

            <div className="bg-white rounded-xl shadow p-6 h-fit">
              <h2 className="font-semibold text-lg mb-6">Summary</h2>

              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        className="w-10 h-10 rounded object-cover"
                      />

                      <span className="text-sm">
                        {item.title} x{item.quantity}
                      </span>
                    </div>

                    <span className="text-sm font-medium">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}

                <hr />

                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>

                <hr />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Checkout;

function Step({ number, text, active }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
          active ? "bg-green-500 text-white" : "bg-gray-200"
        }`}
      >
        {number}
      </div>

      <span className={active ? "font-medium" : "text-gray-500"}>{text}</span>
    </div>
  );
}
