import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="glass-panel mx-auto mt-20 max-w-xl space-y-4 p-8 text-center">
      <h1 className="text-4xl font-semibold text-cyan-100">৪০৪ — পথ হারিয়েছে</h1>
      <p className="text-slate-300">
        তুমি যে পাতাটি খুঁজছিলে সেটি এখনো জঙ্গলে তৈরি হয়নি। প্লেগ্রাউন্ড বা পাঠশালা থেকে শুরু করো।
      </p>
      <div className="flex flex-wrap justify-center gap-3 text-sm">
        <Link to="/" className="btn-primary">হোমে ফিরো</Link>
        <Link to="/playground" className="btn-ghost">প্লেগ্রাউন্ডে যাও</Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
