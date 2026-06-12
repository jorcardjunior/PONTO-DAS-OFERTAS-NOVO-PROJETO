import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { MobileNav } from '@/components/MobileNav';
import { ThemeProvider } from '@/lib/ThemeContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-theme-surface text-theme-primary transition-colors">
        <Sidebar className="hidden md:flex w-64" />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="p-6 overflow-y-auto">
            {children}
          </main>
          <MobileNav className="md:hidden" />
        </div>
      </div>
    </ThemeProvider>
  );
}
