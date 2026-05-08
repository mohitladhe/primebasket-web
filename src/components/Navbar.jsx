import {
  FiSearch,
  FiHeart,
  FiShoppingCart,
  FiUser,
  FiLogOut,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

const API = import.meta.env.VITE_API_URL;

function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          setIsAdmin(false);
          return;
        }

        const res = await fetch(`${API}/api/auth/admin-status`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to check admin status");
        }

        setIsAdmin(data.isAdmin || false);

      } catch (err) {
        console.error("Admin check error:", err);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-green-500 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold">
            P
          </div>
          <h1 className="font-semibold text-lg">PrimeBasket</h1>
        </div>

        {/* Menu */}
        <nav className="hidden md:flex gap-8 text-gray-600">
          <Link to="/" className="hover:text-green-600">
            Home
          </Link>

          <Link to="/shop" className="hover:text-green-600">
            Shop
          </Link>

          <Link to="/shop" className="hover:text-green-600">
            Categories
          </Link>

          <Link to="/shop" className="hover:text-green-600">
            Deals
          </Link>
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-5 text-md text-gray-600">
          {/* <FiSearch />
          <FiHeart /> */}

          {isAdmin && (
            <Link
              to="/admin"
              className="text-green-600 hover:underline"
            >
              Admin
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/dashboard"
              className="text-green-600 hover:underline"
            >
              Dashboard
            </Link>
          )}

          <Link to="/cart">
            <FiShoppingCart />
          </Link>

          {!user ? (
            <Link to="/login">
              <FiUser />
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/profile">
                <FiUser />
              </Link>

              <button onClick={handleLogout}>
                <FiLogOut />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;