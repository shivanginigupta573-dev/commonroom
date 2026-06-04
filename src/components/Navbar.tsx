import Link from "next/link";
export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b bg-white">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-900" />
        <h1 className="text-xl font-bold text-blue-900">
          CommonRoom
        </h1>
      </div>

      <div className="hidden md:flex gap-8 text-sm font-medium">
        <a href="#">Marketplace</a>
        <a href="#">Borrow</a>
        <a href="#">Lost & Found</a>
        <a href="#">Notices</a>
      </div>

      <Link
        href="/create"
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          Post Item
</Link>
    </nav>
  );
}