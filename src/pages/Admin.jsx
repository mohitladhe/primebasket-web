import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Alert from "../components/Alert";
import imageCompression from "browser-image-compression";

const API = import.meta.env.VITE_API_URL;

const categories = [
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Accessories",
  "Beauty",
  "Groceries",
];

const badges = ["New", "Trending", "Best Seller", "Popular"];

function Admin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [alert, setAlert] = useState(null);

  const [search, setSearch] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/api/admin/products`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data.products || data);
    } catch (err) {
      console.error("Fetch products error:", err);
      setAlert({ message: "Failed to load products", type: "error" });
    }
  };

  useEffect(() => {
    if (!API) {
      setAlert({ message: "API URL not configured", type: "error" });
      return;
    }
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = async (e) => {
    try {
      const file = e.target.files[0];

      if (!file) return;

      setLoading(true);

      // Compress image before upload

      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 1400,
        useWebWorker: true,
        initialQuality: 0.8,
      });

      console.log("Original Size:", (file.size / 1024 / 1024).toFixed(2), "MB");

      console.log(
        "Compressed Size:",
        (compressedFile.size / 1024 / 1024).toFixed(2),
        "MB",
      );

      setImageFile(compressedFile);
    } catch (err) {
      console.error("Image compression error:", err);

      setAlert({
        message: "Failed to process image",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (userId) => {
    if (!imageFile) return form.image || null;

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("userId", userId);

      console.log("Starting image upload...", {
        fileName: imageFile.name,
        fileSize: imageFile.size,
        fileType: imageFile.type,
        userId: userId,
        apiUrl: API,
      });

      const res = await fetch(`${API}/api/admin/upload`, {
        method: "POST",
        body: formData,
      });

      console.log("Upload response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error(
          "Upload failed with status:",
          res.status,
          "Error data:",
          errorData,
        );

        throw new Error(
          errorData?.error ||
            errorData?.details ||
            `Upload failed with status ${res.status}`,
        );
      }

      const data = await res.json();
      console.log("Upload successful. Public URL:", data.publicUrl);

      if (!data.publicUrl) {
        throw new Error("No public URL returned from upload");
      }

      return data.publicUrl;
    } catch (err) {
      console.error("Image upload error:", err);
      throw err;
    }
  };

  const saveProduct = async () => {
    if (!form.title || !form.category || !form.price) {
      setAlert({
        message: "Please fill in all required fields",
        type: "error",
      });
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      console.log("Saving product. User ID:", user.id);

      let imageUrl = form.image;
      if (imageFile) {
        console.log("Image file selected, uploading...");
        imageUrl = await uploadImage(user.id);
      }

      const url = editing
        ? `${API}/api/admin/products/${editing.id}`
        : `${API}/api/admin/products`;

      const method = editing ? "PUT" : "POST";

      console.log("Sending product data to backend:", { method, url });

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          ...form,
          image: imageUrl,
          price: Number(form.price),
          old_price: form.old_price ? Number(form.old_price) : null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || "Failed to save product");
      }

      setAlert({
        message: editing
          ? "Product updated successfully"
          : "Product added successfully",
        type: "success",
      });

      setForm({});
      setEditing(null);
      setImageFile(null);
      await fetchProducts();
    } catch (err) {
      console.error("Save product error:", err);
      setAlert({
        message: err.message || "Failed to save product",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    try {
      const res = await fetch(`${API}/api/admin/products/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || "Delete failed");
      }

      setAlert({ message: "Deleted successfully", type: "success" });
      await fetchProducts();
    } catch (err) {
      console.error("Delete error:", err);
      setAlert({ message: err.message || "Delete failed", type: "error" });
    }
  };

  const editProduct = (product) => {
    setForm(product);
    setEditing(product);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Navbar />

      {alert && (
        <div className="fixed top-20 right-5 z-50 animate-bounce">
          <Alert
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      <main className="grow p-6 md:p-10">
        <div className="max-w-7xl mx-auto space-y-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your store products and inventory.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editing ? "Edit Product" : "Add Product"}
                  </h2>
                  {editing && (
                    <button
                      onClick={() => {
                        setEditing(null);
                        setForm({});
                        setImageFile(null);
                      }}
                      className="text-sm text-gray-500 hover:text-red-500 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <input
                      name="title"
                      value={form.title || ""}
                      onChange={handleChange}
                      placeholder="Product Title"
                      className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <select
                      name="category"
                      value={form.category || ""}
                      onChange={handleChange}
                      className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white"
                    >
                      <option value="" disabled>
                        Select Category
                      </option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      name="price"
                      type="number"
                      value={form.price || ""}
                      onChange={handleChange}
                      placeholder="Price (₹)"
                      className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    />
                    <input
                      name="old_price"
                      type="number"
                      value={form.old_price || ""}
                      onChange={handleChange}
                      placeholder="Old Price (₹)"
                      className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-all border border-gray-300 rounded-lg bg-white"
                    />
                    {imageFile && (
                      <div className="text-xs text-gray-500 mt-2 space-y-1">
                        <p>
                          Selected: {imageFile.name || "compressed-image.jpg"}
                        </p>

                        <p>Size: {(imageFile.size / 1024).toFixed(0)} KB</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {badges.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              badge: tag === form.badge ? "" : tag,
                            })
                          }
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                            form.badge === tag
                              ? "bg-green-500 text-white shadow-md shadow-green-500/40"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={saveProduct}
                    disabled={loading}
                    className="w-full mt-4 bg-green-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-600 focus:ring-4 focus:ring-green-300 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Processing...
                      </>
                    ) : editing ? (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Update
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Add
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition-all">
                <div className="pl-4 pr-2 text-gray-400">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full p-3 outline-none bg-transparent text-gray-700"
                />
              </div>

              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
                  No products found
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
                    >
                      <div className="relative h-48 overflow-hidden bg-gray-100">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}

                        {p.badge && (
                          <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                            {p.badge}
                          </span>
                        )}

                        <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-md">
                          {p.category}
                        </span>
                      </div>

                      <div className="p-5 flex flex-col grow">
                        <h3
                          className="font-semibold text-lg text-gray-900 truncate"
                          title={p.title}
                        >
                          {p.title}
                        </h3>

                        <div className="mt-1 mb-4 flex items-baseline gap-2">
                          <span className="text-xl font-bold text-gray-900">
                            ₹{Number(p.price).toLocaleString("en-IN")}
                          </span>
                          {p.old_price && (
                            <span className="text-sm text-gray-400 line-through">
                              ₹{Number(p.old_price).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>

                        <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => editProduct(p)}
                            className="flex items-center justify-center gap-1 text-sm font-semibold text-blue-500 bg-blue-50 py-2 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="flex items-center justify-center gap-1 text-sm font-semibold text-red-500 bg-red-50 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Admin;
