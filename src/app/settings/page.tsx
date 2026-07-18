import { Settings } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50/50 flex flex-col items-center justify-center">
      <Settings size={64} className="text-gray-300 mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-gray-500 mb-8 max-w-md text-center">
        Settings panel is coming soon.
      </p>
      <Link href="/" className="bg-brand-purple text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-brand-teal transition">
        Back to Home
      </Link>
    </div>
  );
}
