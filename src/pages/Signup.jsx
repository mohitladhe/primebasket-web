import { useState } from "react";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import OTPInput from "../components/OTPInput";

const API = import.meta.env.VITE_API_URL;

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);

  const handleSignup = async () => {
    try {
      console.log(name, email, password);

      const res = await fetch(`${API}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      setStep(2);
    } catch (err) {
      console.error("Signup error:", err);

      alert(err.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-6xl w-full grid md:grid-cols-2 bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* LEFT PANEL */}

        <div className="hidden md:flex flex-col justify-center items-center bg-green-500 text-white p-12">
          <div className="flex items-center gap-3 text-3xl font-bold">
            <div className="bg-white text-green-500 w-10 h-10 rounded-full flex items-center justify-center">
              P
            </div>
            PrimeBasket
          </div>

          <h2 className="text-3xl mt-10 font-semibold text-center">
            Join PrimeBasket
          </h2>

          <p className="text-green-100 mt-4 text-center max-w-sm">
            Create your account and explore premium products and exclusive
            deals.
          </p>
        </div>

        {/* RIGHT PANEL */}

        <div className="p-10 md:p-14">
          {step === 1 && (
            <>
              <h2 className="text-3xl font-bold">Create Account</h2>

              <form
                className="mt-8 space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSignup();
                }}
              >
                <div>
                  <label className="text-sm text-gray-600">Full Name</label>

                  <div className="flex items-center border rounded-lg px-3 mt-1">
                    <FaUser className="text-gray-400" />

                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 outline-none"
                      placeholder="Enter name"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Email</label>

                  <div className="flex items-center border rounded-lg px-3 mt-1">
                    <FaEnvelope className="text-gray-400" />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 outline-none"
                      placeholder="Enter email"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Password</label>

                  <div className="flex items-center border rounded-lg px-3 mt-1">
                    <FaLock className="text-gray-400" />

                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 outline-none"
                      placeholder="Create password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600"
                >
                  Sign Up
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-3xl font-bold">Verify Email</h2>

              <p className="text-gray-500 mt-4">
                A confirmation email has been sent to
                <span className="font-semibold"> {email}</span>.
              </p>

              <p className="text-gray-500 mt-2">
                Please check your inbox and click the
                <span className="font-semibold"> \"Confirm your email\"</span>
                link to activate your account.
              </p>

              <p className="text-gray-400 text-sm mt-6">
                Once confirmed, you can return here and login.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Signup;
