import { useState } from "react";
import Header from "./basic/header";
import Sidebar from "./basic/sidebar";

export default function BaseLayout({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <div className="min-h-screen w-screen flex bg-zinc-100 ">
      <Header toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isOpen} />

      <main className="flex-1 p-4 pt-[60px] transition-all duration-300 overflow-y-auto bg-zinc-100 ">
        <div className="min-h-[calc(100vh-80px)]">{children}</div>
      </main>
    </div>
  );
}
