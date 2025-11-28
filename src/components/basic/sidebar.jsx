import {
  FilePlus,
  FileText,
  PlusCircle,
  Search,
  LayoutDashboard,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Sidebar({ isOpen }) {
  return (
    <div
      className={`flex flex-col justify-between pt-20 top-0 left-0 min-h-screen 
        bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 
        transition-all duration-300
        ${isOpen ? "w-48" : "w-16"}
      `}
    >
      {/* Top nav */}
      <nav className="flex flex-col space-y-4 p-2 font-semibold">
        <Link
          to="/generate-paper"
          className="flex items-center space-x-2 bg-white rounded-xl p-3 hover:bg-teal-50"
        >
          <FilePlus size={20} className="text-blue-400" />
          {isOpen && <span className="text-zinc-800">Generate</span>}
        </Link>

        <Link
          to="/view-paper"
          className="flex items-center space-x-2 bg-white rounded-xl p-3 hover:bg-teal-50"
        >
          <FileText size={20} className="text-blue-400" />
          {isOpen && <span className="text-zinc-800">View Paper</span>}
        </Link>

        <Link
          to="/add-question"
          className="flex items-center space-x-2 bg-white rounded-xl p-3 hover:bg-teal-50"
        >
          <PlusCircle size={20} className="text-blue-400" />
          {isOpen && <span className="text-zinc-800">Add Question</span>}
        </Link>

        <Link
          to="/view-question"
          className="flex items-center space-x-2 bg-white rounded-xl p-3 hover:bg-teal-50"
        >
          <Search size={20} className="text-blue-400" />
          {isOpen && <span className="text-zinc-800">View Questions</span>}
        </Link>

        <Link
          to="/dashboard"
          className="flex items-center space-x-2 bg-white rounded-xl p-3 hover:bg-teal-50"
        >
          <LayoutDashboard size={20} className="text-blue-400" />
          {isOpen && <span className="text-zinc-800">Dashboard</span>}
        </Link>

        <Link
          to="/automated-paper"
          className="flex items-center space-x-2 bg-white rounded-xl p-3 hover:bg-teal-50"
        >
          <LayoutDashboard size={20} className="text-blue-400" />
          {isOpen && <span className="text-zinc-800">Generate Random Quiz</span>}
        </Link>
      </nav>

      {/* Bottom nav */}
      <div className="flex flex-col space-y-4 p-2 font-semibold mb-6">
        {/* <Link
          to="/profile"
          className="flex items-center space-x-2 bg-white rounded-xl p-3 hover:bg-teal-50"
        >
          <User size={20} className="text-teal-400" />
          {isOpen && <span className="text-zinc-800">Profile</span>}
        </Link>

        <Link
          to="/settings"
          className="flex items-center space-x-2 bg-white rounded-xl p-3 hover:bg-teal-50"
        >
          <Settings size={20} className="text-teal-400" />
          {isOpen && <span className="text-zinc-800">Settings</span>}
        </Link> */}

        <Link
          to="/login"
          className="flex items-center space-x-2 bg-white rounded-xl p-3 hover:bg-teal-50"
        >
          <LogOut size={20} className="text-red-500" />
          {isOpen && <span className="text-red-600">Logout</span>}
        </Link>
      </div>
    </div>
  );
}
