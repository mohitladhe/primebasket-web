import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Alert from "../components/Alert";
import { FiStar, FiShoppingCart, FiArrowLeft, FiCheck } from "react-icons/fi";
import { supabase } from "../lib/supabaseClient";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const categories = [
  "All",
  "Electronics",
  "Fashion",
  "Groceries",
  "Home & Kitchen",
  "Beauty",
  "Accessories",
];

function Shop() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState(200000);
  const [sort, setSort] = useState("popular");
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // New state to track the currently viewed product
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ---------------- FETCH PRODUCTS ----------------

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API}/api/products`);
        const data = await res.json();
        const productList = Array.isArray(data) ? data : data.products || [];
        setProducts(productList);
      } catch (err) {
        console.error("Products API error:", err);
        setAlert({
          message: "Failed to load products",
          type: "error",
        });
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  // ---------------- ADD TO CART ----------------

  const addToCart = async (product, e = null) => {
    // Prevent opening product details when clicking the cart button on the grid
    if (e) e.stopPropagation();

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setAlert({
          message: "Please login first",
          type: "error",
        });

        return;
      }

      const res = await fetch(`${API}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          product,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Cart API failed");
      }

      setAlert({
        message: "Product added to cart",
        type: "success",
      });
    } catch (err) {
      console.error("Add to cart error:", err);

      setAlert({
        message: "Failed to add product to cart",
        type: "error",
      });
    }
  };

  // ---------------- FILTER PRODUCTS ----------------

  let filteredProducts = products.filter((product) => {
    const categoryMatch =
      selectedCategory === "All" || product.category === selectedCategory;
    const priceMatch = product.price <= priceRange;
    return categoryMatch && priceMatch;
  });

  // ---------------- SORT ----------------

  if (sort === "priceLow") {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  }

  if (sort === "priceHigh") {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      {/* ALERT OVERLAY */}
      {alert && (
        <div className="fixed top-20 right-5 z-50 animate-fade-in-down">
          <Alert
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      <main className="grow">
        {selectedProduct ? (
          /* =========================================
             PRODUCT DETAILS VIEW
             ========================================= */
          <div className="max-w-6xl mx-auto px-6 py-10 animate-fade-in-up">
            <button
              onClick={() => setSelectedProduct(null)}
              className="flex items-center gap-2 text-gray-500 hover:text-green-600 font-medium transition mb-8 bg-white px-4 py-2 rounded-lg shadow-sm w-max"
            >
              <FiArrowLeft /> Back to Shop
            </button>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
              {/* Left: Image */}
              <div className="md:w-1/2 p-8 bg-gray-50 flex items-center justify-center relative">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.title}
                  className="max-h-125 object-contain mix-blend-multiply drop-shadow-lg"
                />
                {selectedProduct.badge && (
                  <span className="absolute top-6 left-6 bg-green-500 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
                    {selectedProduct.badge}
                  </span>
                )}
              </div>

              {/* Right: Details */}
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <p className="text-sm font-bold text-green-600 uppercase tracking-widest mb-2">
                  {selectedProduct.category}
                </p>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                  {selectedProduct.title}
                </h1>

                <div className="flex items-center gap-2 text-gray-600 mb-6 bg-gray-50 w-max px-3 py-1.5 rounded-lg">
                  <FiStar className="text-yellow-400 fill-current" />
                  <span className="font-semibold text-gray-900">
                    {selectedProduct.rating || "4.5"}
                  </span>
                  <span className="text-sm">
                    ({selectedProduct.reviews || "0"} reviews)
                  </span>
                </div>

                <div className="flex items-end gap-4 mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ₹{selectedProduct.price.toLocaleString()}
                  </span>
                  {(selectedProduct.old_price || selectedProduct.oldPrice) && (
                    <span className="text-xl text-gray-400 line-through font-medium mb-1">
                      ₹
                      {(
                        selectedProduct.old_price || selectedProduct.oldPrice
                      ).toLocaleString()}
                    </span>
                  )}
                  {/* Calculate Discount for details page */}
                  {(selectedProduct.old_price || selectedProduct.oldPrice) && (
                    <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-1 rounded mb-1.5">
                      {Math.round(
                        (((selectedProduct.old_price ||
                          selectedProduct.oldPrice) -
                          selectedProduct.price) /
                          (selectedProduct.old_price ||
                            selectedProduct.oldPrice)) *
                          100,
                      )}
                      % OFF
                    </span>
                  )}
                </div>

                <p className="text-gray-600 leading-relaxed mb-8">
                  {selectedProduct.description ||
                    "This premium product is crafted with the highest quality materials to ensure long-lasting durability and exceptional performance. Perfect for everyday use or as a thoughtful gift."}
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="bg-green-100 text-green-600 p-1 rounded-full">
                      <FiCheck size={14} />
                    </div>
                    In stock and ready to ship
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="bg-green-100 text-green-600 p-1 rounded-full">
                      <FiCheck size={14} />
                    </div>
                    Free shipping on orders over ₹499
                  </div>
                </div>

                <button
                  onClick={() => addToCart(selectedProduct)}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-lg shadow-lg shadow-green-500/30 transition-all transform hover:-translate-y-1 w-full md:w-auto"
                >
                  <FiShoppingCart size={22} />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================
             SHOP GRID VIEW
             ========================================= */
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Shop Products
                </h1>
                <p className="text-gray-500 mt-1">
                  Showing {filteredProducts.length} results
                </p>
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-gray-700 bg-white shadow-sm outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="popular">Most Popular</option>
                <option value="priceLow">Price: Low → High</option>
                <option value="priceHigh">Price: High → Low</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
              {/* SIDEBAR */}
              <div className="space-y-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-max sticky top-24">
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 text-lg border-b pb-2">
                    Category
                  </h3>
                  <ul className="space-y-2.5">
                    {categories.map((cat) => (
                      <li
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`cursor-pointer px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === cat
                            ? "bg-green-50 text-green-700 font-semibold"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {cat}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-4 text-lg border-b pb-2">
                    Price Range
                  </h3>
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full accent-green-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-sm font-medium text-gray-600 mt-3">
                    <span>₹0</span>
                    <span>₹{Number(priceRange).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* PRODUCTS GRID */}
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && (
                  <div className="col-span-full flex justify-center py-20">
                    <p className="text-gray-500 font-medium animate-pulse">
                      Loading amazing products...
                    </p>
                  </div>
                )}

                {!loading && filteredProducts.length === 0 && (
                  <div className="col-span-full bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
                    No products found matching your filters.
                  </div>
                )}

                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col"
                  >
                    <div className="relative h-60 bg-gray-50 flex items-center justify-center p-4 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                      />

                      {product.badge && (
                        <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                          {product.badge}
                        </span>
                      )}

                      {/* Adjusted to accept either old_price or oldPrice based on schema */}
                      {(product.old_price || product.oldPrice) && (
                        <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                          -
                          {Math.round(
                            (((product.old_price || product.oldPrice) -
                              product.price) /
                              (product.old_price || product.oldPrice)) *
                              100,
                          )}
                          %
                        </span>
                      )}

                      {/* Add to Cart Overlay */}
                      <div className="absolute bottom-4 left-0 w-full flex justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <button
                          onClick={(e) => addToCart(product, e)}
                          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-full flex items-center gap-2 shadow-lg font-semibold"
                        >
                          <FiShoppingCart />
                          Add to Cart
                        </button>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col grow">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                        {product.category}
                      </p>

                      <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2 line-clamp-2">
                        {product.title}
                      </h3>

                      <div className="mt-auto">
                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                          <FiStar className="text-yellow-400 fill-current" />
                          <span className="font-semibold text-gray-700">
                            {product.rating || "4.5"}
                          </span>
                          <span>({product.reviews || "0"})</span>
                        </div>

                        <div className="flex items-baseline gap-2">
                          <span className="font-extrabold text-xl text-gray-900">
                            ₹{product.price.toLocaleString()}
                          </span>

                          {(product.old_price || product.oldPrice) && (
                            <span className="text-sm font-medium text-gray-400 line-through">
                              ₹
                              {(
                                product.old_price || product.oldPrice
                              ).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Shop;
