import { Outlet } from "react-router-dom";

import AssistantWidget from "./AssistantWidget";
import Footer from "./Footer";
import Header from "./Header";

export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bagh-nebula text-slate-100">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 sm:gap-8 md:gap-10 px-3 sm:px-4 py-6 sm:py-8 md:py-10 pb-24 sm:pb-10">
        <Outlet />
      </main>
      <Footer />
      <AssistantWidget />
    </div>
  );
}

export default SiteLayout;
