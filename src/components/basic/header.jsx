import { Link } from "react-router-dom";

export default function Header({ toggleSidebar }) {
  return (
    <div className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 h-12 bg-gradient-to-br from-blue-400 via-sky-500 to-cyan-400 ">
      <button
        onClick={toggleSidebar}
        className=" text-xl h-7 text-white  !bg-blue-500 flex items-center justify-between hover:bg-blue-100 rounded focus:outline-none "
      >
        ☰
      </button>
      <h3 className="text-3xl  text-white  font-bold">🛡️ EduPulse</h3>
    </div>
  );
}
