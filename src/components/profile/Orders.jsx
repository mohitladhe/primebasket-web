import { useEffect, useState } from "react";
import { FiPackage, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

function Orders() {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return;
      }

      const res = await fetch(`${API}/api/orders`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch orders");
      }

      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // FORMAT DATE

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // TOGGLE ORDER DETAILS

  const toggleOrder = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex items-center justify-center p-10">
          <p className="text-gray-500 animate-pulse font-medium">
            Loading your orders...
          </p>
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <FiPackage size={28} />
          </div>

          <h3 className="text-lg font-bold text-gray-800">No orders yet</h3>

          <p className="text-gray-500 mt-1">
            When you place an order, it will appear here.
          </p>
        </div>
      )}

      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md"
        >
          {/* HEADER */}

          <div
            onClick={() => toggleOrder(order.id)}
            className="p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
          >
            {/* LEFT */}

            <div className="flex items-center gap-4">
              <div className="bg-green-50 text-green-600 p-3 rounded-xl">
                <FiPackage size={24} />
              </div>

              <div>
                <p className="font-bold text-gray-900">
                  Order #ORD-{order.id.slice(0, 8).toUpperCase()}
                </p>

                <p className="text-sm text-gray-500 font-medium mt-0.5">
                  {formatDate(order.created_at)} · {order.items?.length || 0}{" "}
                  items
                </p>
              </div>
            </div>

            {/* RIGHT */}

            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0">
              <span
                className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide
                  ${order.status === "placed" || order.status === "pending" ? "bg-orange-100 text-orange-700" : ""}
                  ${order.status === "delivered" || order.status === "completed" ? "bg-green-100 text-green-700" : ""}
                  ${order.status === "cancelled" ? "bg-red-100 text-red-700" : ""}
                `}
              >
                {order.status}
              </span>

              <div className="flex items-center gap-4">
                <p className="font-extrabold text-gray-900 text-lg">
                  ₹{Number(order.total).toLocaleString("en-IN")}
                </p>

                <div className="text-gray-400">
                  {expandedOrderId === order.id ? (
                    <FiChevronUp size={20} />
                  ) : (
                    <FiChevronDown size={20} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* EXPANDED DETAILS */}

          {expandedOrderId === order.id && (
            <div className="p-6 pt-0 border-t border-gray-100 bg-gray-50/30">
              <div className="grid md:grid-cols-2 gap-8 mt-6">
                {/* ITEMS */}

                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
                    Items in your order
                  </h4>

                  <div className="space-y-4">
                    {order.items?.map((item, index) => (
                      <div
                        key={index}
                        className="flex gap-4 items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-16 rounded-md object-cover bg-gray-100"
                        />

                        <div className="grow">
                          <p
                            className="text-sm font-semibold text-gray-800 line-clamp-1"
                            title={item.title}
                          >
                            {item.title}
                          </p>

                          <p className="text-sm text-gray-500 mt-1 font-medium">
                            Qty: {item.quantity}
                          </p>
                        </div>

                        <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
                          ₹
                          {(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ADDRESS */}

                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
                    Shipping Address
                  </h4>

                  {order.address ? (
                    <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm text-sm text-gray-600 space-y-1.5">
                      <p className="font-bold text-gray-900 text-base mb-2">
                        {order.address.full_name}
                      </p>

                      <p>{order.address.street}</p>

                      <p>
                        {order.address.city}, {order.address.state}{" "}
                        {order.address.zipcode}
                      </p>

                      {order.address.country && <p>{order.address.country}</p>}

                      <div className="pt-3 mt-3 border-t border-gray-50">
                        <p className="font-medium">
                          <span className="text-gray-400">Phone:</span>{" "}
                          {order.address.phone}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No address details available for this order.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Orders;
