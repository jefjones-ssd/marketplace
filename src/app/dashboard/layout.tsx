export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-[#F3F8F8]">
      <nav className="w-full bg-[#2C2C2A] text-white">
        <div className="flex items-center justify-between px-5 py-4 sm:px-8">
          <span className="text-lg font-extrabold tracking-tight">Breezee</span>
          <div className="flex items-center gap-5 text-sm font-semibold">
            <a href="/dashboard" className="hover:text-white/70">
              My Listings
            </a>
            <a href="/dashboard/messages" className="hover:text-white/70">
              Messages
            </a>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
