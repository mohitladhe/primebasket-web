import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FiTrash2 } from "react-icons/fi";
import { supabase } from "../lib/supabaseClient";
import Alert from "../components/Alert";

const API = import.meta.env.VITE_API_URL;

function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) return;

      const res = await fetch(`${API}/api/cart`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();

      setCart(data);
    } catch (err) {
      console.error(err);

      setAlert({
        message: "Failed to load cart",
        type: "error",
      });
    }

    setLoading(false);
  };

  const addToCart = async (product) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    await fetch(`${API}/api/cart/add`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },

      body: JSON.stringify({
        product,
      }),
    });
  };

  const increaseQty = async (product) => {
    try {
      await addToCart(product);

      await fetchCart();

      setAlert({
        message: "Quantity updated",
        type: "success",
      });
    } catch {
      setAlert({
        message: "Failed to update quantity",
        type: "error",
      });
    }
  };

  const decreaseQty = async (product) => {
    const item = cart.find((i) => i.product_id === product.product_id);

    if (item.quantity === 1) {
      removeItem(product.product_id);

      return;
    }

    const updated = cart.map((i) => {
      if (i.product_id === product.product_id) {
        return {
          ...i,
          quantity: i.quantity - 1,
        };
      }

      return i;
    });

    setCart(updated);
  };

  const removeItem = async (productId) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(`${API}/api/cart/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      await fetchCart();

      setAlert({
        message: "Item removed from cart",
        type: "success",
      });
    } catch (err) {
      console.error(err);

      setAlert({
        message: "Failed to remove item",
        type: "error",
      });
    }
  };

  const clearCart = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(`${API}/api/cart/clear/all`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Clear failed");
      }

      setCart([]);

      setAlert({
        message: "Cart cleared",
        type: "success",
      });
    } catch {
      setAlert({
        message: "Failed to clear cart",
        type: "error",
      });
    }
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const tax = subtotal * 0.08;

  const total = subtotal + tax;

  return (
    <>
      <Navbar />

      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-6">
            {loading && <p>Loading cart...</p>}

            {cart.length === 0 && !loading && (
              <p className="text-gray-500">Your cart is empty</p>
            )}

            {cart.map((item) => (
              <div
                key={item.product_id}
                className="flex items-center justify-between bg-white shadow rounded-xl p-5"
              >
                <div className="flex gap-4 items-center">
                  <img
                    src={item.image}
                    className="w-24 h-24 rounded-lg object-cover"
                  />

                  <div>
                    <h3 className="font-semibold">{item.title}</h3>

                    <p className="text-sm text-gray-500">{item.category}</p>

                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => decreaseQty(item)}
                        className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        -
                      </button>

                      <span className="font-medium">{item.quantity}</span>

                      <button
                        onClick={() => increaseQty(item)}
                        className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <p className="font-semibold text-lg">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>

                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <FiTrash2 size={20} />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex gap-4 mt-6">
              <a
                href="/shop"
                className="bg-gray-100 px-5 py-2 rounded-lg hover:bg-gray-200"
              >
                Continue Shopping
              </a>

              <button
                onClick={clearCart}
                className="text-gray-500 hover:text-red-500"
              >
                Clear Cart
              </button>
            </div>
          </div>

          <div className="bg-white shadow rounded-xl p-6 h-fit">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

            <div className="space-y-3 text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>

              <div className="flex justify-between">
                <span>Tax</span>
                <span>
                  ₹
                  {tax.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <hr />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>

                <span>
                  ₹
                  {total.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <button className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold">
              <a href="/checkout">Proceed to Checkout</a>
            </button>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Free shipping on orders over ₹500
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Cart;
