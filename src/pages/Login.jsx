import { useState } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const API = import.meta.env.VITE_API_URL;

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Save session into Supabase client

      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      // redirect after login

      navigate("/");
    } catch (err) {
      console.error("Login error:", err);

      alert(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-6xl w-full grid md:grid-cols-2 bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* LEFT SIDE */}

        <div className="hidden md:flex flex-col justify-center items-center bg-green-500 text-white p-12">
          <div className="text-4xl font-bold flex items-center gap-3">
            <div className="bg-white text-green-500 w-10 h-10 rounded-full flex items-center justify-center font-bold">
              P
            </div>
            PrimeBasket
          </div>

          <h2 className="text-3xl font-semibold mt-10 text-center">
            Welcome Back!
          </h2>

          <p className="text-green-100 mt-4 text-center max-w-sm">
            Sign in to continue shopping and explore our premium collection.
          </p>

          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da"
            className="rounded-xl mt-10 shadow-md"
          />
        </div>

        {/* RIGHT SIDE */}

        <div className="p-10 md:p-14">
          <h2 className="text-3xl font-bold text-gray-800">Login</h2>

          <p className="text-gray-500 mt-2">
            Enter your credentials to access your account.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            {/* EMAIL */}

            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>

              <div className="flex items-center border rounded-lg px-3 mt-1 focus-within:border-green-500">
                <FaEnvelope className="text-gray-400" />

                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-3 outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div>
              <label className="text-sm font-medium text-gray-600">
                Password
              </label>

              <div className="flex items-center border rounded-lg px-3 mt-1 focus-within:border-green-500">
                <FaLock className="text-gray-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="w-full p-3 outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-sm text-green-500"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* REMEMBER */}

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                Remember me
              </label>

              <a className="text-green-500 hover:underline">
                Forgot Password ?
              </a>
            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* REGISTER */}

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account ?
            <Link to="/signup">
              <span className="text-green-500 cursor-pointer">Sign up</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
