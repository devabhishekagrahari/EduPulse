import { TypeAnimation } from "react-type-animation";
import EduPulseLogo from "../assets/EduPulseLogo.png";

export default function LogoScreen() {
  return (
    <div className="flex  min-h-screen flex-col top-0 min-w-[600px] p-12 bg-gradient-to-r from-blue-500 via-sky-400 to-[#27E9F7] text-white">
      <div className="mb-6 flex flex-col justify-center items-center w-full">
        <div className="mb-6 p-4 rounded-xl    bg-gradient-to-r from-blue-500 via-sky-400 to-[#27E9F7] flex justify-center items-center min-w-[120px] min-h-[220px] ">
          <img
            src={EduPulseLogo} // replace with your actual logo path
            alt="SecurePortal Logo"
            className="h-16 min-w-[100px] min-h-[200px]" // adjust height as needed
          />
        </div>
        <div className="flex flex-row justify-center items-center space-x-3">
          <TypeAnimation
            sequence={["🛡️ EduPulse - ", 2000]}
            wrapper="h1"
            cursor={false}
            repeat={Infinity}
            className="text-4xl font-bold bg-clip-text text-white"
          />
          <TypeAnimation
            sequence={["Teachers  Partner ", 2000]}
            wrapper="h3"
            cursor={false}
            repeat={Infinity}
            className="text-2xl font-bold bg-clip-text text-white"
          />
        </div>
      </div>

      {/* Type Animation */}
      <TypeAnimation
        sequence={[
          "Login to Your Account -  Secure Admin Portal",
          2000,
          "Welcome Back 👋",
          2000,
        ]}
        wrapper="h2"
        cursor={true}
        repeat={Infinity}
        className="text-3xl font-semibold bg-clip-text text-white"
      />

      {/* Info below typing text */}
      <p className="mt-6 text-lg max-w-xl">
        Manage users, view analytics, and control access to sensitive systems
        with our secure and reliable admin dashboard. Built with modern tech to
        give you speed, safety, and control.
      </p>
    </div>
  );
}
