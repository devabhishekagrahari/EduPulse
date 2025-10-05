import { useState } from "react";
import { Link } from "react-router-dom";

export default function SignUpForm() {
  const [form, setForm] = useState({
    name: "",
    gender: "",
    dob: "",
    phone: "",
    email: "",
    role: "",
    institute: "",
    designation: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting sign-up data:", form);

  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full min-w-[650px] fixed max-h-screen overflow-auto right-0 mr-1 max-w-md dark:bg-zinc-900 space-y-3 p-8"
    >
      <h2 className="text-4xl text-center font-bold bg-gradient-to-r from-teal-400 via-teal-500 to-teal-400 bg-clip-text text-transparent">
        Create Your Admin Account
      </h2>

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-teal-500 dark:text-zinc-300">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={form.name}
          onChange={handleChange}
          className="mt-1 w-full px-4 py-2 border !border-teal-600 !bg-white dark:bg-zinc-800 text-teal-600 dark:text-white rounded-xl"
        />
      </div>

      {/* Gender */}
      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-teal-500 dark:text-zinc-300">
          Gender
        </label>
        <select
          id="gender"
          name="gender"
          value={form.gender}
          onChange={handleChange}
          required
          className="mt-1 w-full px-4 py-2 border !border-teal-600 !bg-white dark:bg-zinc-800 text-teal-600 dark:text-white rounded-xl"
        >
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
      </div>

      {/* DOB */}
      <div>
        <label htmlFor="dob" className="block text-sm font-medium text-teal-500 dark:text-zinc-300">
          Date of Birth
        </label>
        <input
          id="dob"
          name="dob"
          type="date"
          required
          value={form.dob}
          onChange={handleChange}
          className="mt-1 w-full px-4 py-2 border !border-teal-600 !bg-white dark:bg-zinc-800 text-teal-600 dark:text-white rounded-xl"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-teal-500 dark:text-zinc-300">
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          value={form.phone}
          onChange={handleChange}
          className="mt-1 w-full px-4 py-2 border !border-teal-600 !bg-white dark:bg-zinc-800 text-teal-600 dark:text-white rounded-xl"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-teal-500 dark:text-zinc-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          className="mt-1 w-full px-4 py-2 border !border-teal-600 !bg-white dark:bg-zinc-800 text-teal-600 dark:text-white rounded-xl"
        />
      </div>

      {/* Admin Role */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-teal-500 dark:text-zinc-300">
          Admin Role
        </label>
        <select
          id="role"
          name="role"
          required
          value={form.role}
          onChange={handleChange}
          className="mt-1 w-full px-4 py-2 border !border-teal-600 !bg-white dark:bg-zinc-800 text-teal-600 dark:text-white rounded-xl"
        >
          <option value="">Select Role</option>
          <option>Administrator</option>
          <option>Editor</option>
          <option>Reader</option>
          <option>Uploader</option>
        </select>
      </div>

      {/* Institute */}
      <div>
        <label htmlFor="institute" className="block text-sm font-medium text-teal-500 dark:text-zinc-300">
          Institute
        </label>
        <input
          id="institute"
          name="institute"
          type="text"
          required
          value={form.institute}
          onChange={handleChange}
          className="mt-1 w-full px-4 py-2 border !border-teal-600 !bg-white dark:bg-zinc-800 text-teal-600 dark:text-white rounded-xl"
        />
      </div>

      {/* Designation */}
      <div>
        <label htmlFor="designation" className="block text-sm font-medium text-teal-500 dark:text-zinc-300">
          Designation
        </label>
        <input
          id="designation"
          name="designation"
          type="text"
          required
          value={form.designation}
          onChange={handleChange}
          className="mt-1 w-full px-4 py-2 border !border-teal-600 !bg-white dark:bg-zinc-800 text-teal-600 dark:text-white rounded-xl"
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-teal-500 dark:text-zinc-300">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={form.password}
          onChange={handleChange}
          className="mt-1 w-full px-4 py-2 border !border-teal-600 !bg-white dark:bg-zinc-800 text-teal-600 dark:text-white rounded-xl"
        />
      </div>

      {/* Sign Up Button */}
      <div>
        <button
          type="submit"
          className="w-full py-2 border !border-teal-600 !bg-gradient-to-r from-teal-300 via-teal-400 to-teal-200 text-white rounded-xl hover:opacity-90 transition duration-200"
        >
          Create Account
        </button>
      </div>

      {/* Already have an account */}
      <p className="text-sm text-center text-teal-600 dark:text-zinc-400">
        Already have an account?{" "}

        <Link to="/login" className="!text-teal-900 hover:underline dark:text-teal-400">Login</Link>
      </p>
    </form>
  );
}
