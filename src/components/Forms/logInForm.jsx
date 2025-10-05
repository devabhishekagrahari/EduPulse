import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BASE_URL from "../../utils/api";
export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loging, setLoging] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting login form", { email, password });
    setLoging(true);
    try {
      const res = await fetch(`https://edupulse-nim5.onrender.com/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("token", data.token);
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save the token to localStorage
      localStorage.setItem("token", data.token);
      // Optional: Save user info if available
      // localStorage.setItem("user", JSON.stringify(data.user));

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error.message);
      alert(error.message); // or show toast
    }
    setLoging(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className=" min-w-[600px] min-h-[500px] right-0 mr-8 max-w-md dark:bg-zinc-900 space-y-6 p-8"
    >
      <h2 className="text-4xl text-center font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent ">
        Login to Your Account{" "}
      </h2>
      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-blue-500 "
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full px-4 py-2 border !border-blue-600  !bg-white  text-sky-600  rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-blue-500 "
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full px-4 py-2 border !border-blue-600 !bg-white  text-sky-600  rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {/* Login Button */}
      <div>
        <button
          type="submit"
          className="w-full py-2 border !border-teal-600  !bg-gradient-to-r from-blue-400 via-sky-500 to-cyan-400 hover:bg-blue-200 text-white rounded-xl transition duration-200"
        >
          {loging?'Login.....':'Login'}
        </button>
      </div>
      <div className="flex flex-col justify-center ">
        {/* Register Link */}
        <p className="text-sm text-center text-blue-600">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="!text-blue-900 hover:underline dark:text-blue-400"
          >
            Sign Up
          </Link>
        </p>
        <p className="text-sm text-center text-blue-600 ">
          Forget the password?
          <Link
            to="/forget-password"
            className="!text-red-900 mt-2 hover:underline "
          >
            Forget Password
          </Link>
        </p>
      </div>
    </form>
  );
}
