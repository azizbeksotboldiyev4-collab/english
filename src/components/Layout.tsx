import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Flame, Zap, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProgress } from '@/hooks/useProgress';
import { useTheme } from '@/contexts/ThemeContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { progress } = useProgress();
  const { theme, toggle } = useTheme();

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  const userAvatar = user?.user_metadata?.avatar_url || '';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <SidebarInset className="flex flex-col min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-40 h-14 flex items-center gap-2 border-b border-border bg-card/80 backdrop-blur-md px-3 md:px-5">
            <SidebarTrigger className="shrink-0" />

            <Link to="/" className="flex items-center gap-2 group md:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-extrabold text-sm shadow-soft">
                A
              </div>
              <span className="text-base font-extrabold tracking-tight">Azizbek EDU</span>
            </Link>

            <div className="ml-auto flex items-center gap-2 md:gap-3">
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-duo-orange/10 text-duo-orange">
                <Flame className="h-4 w-4" />
                <span className="text-xs font-extrabold">{progress.streak}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-duo-yellow/10 text-duo-yellow">
                <Zap className="h-4 w-4" />
                <span className="text-xs font-extrabold">{progress.xp}</span>
              </div>
              <button
                onClick={toggle}
                aria-label="Theme toggle"
                title={theme === 'dark' ? 'Kunduzgi rejim' : 'Tungi rejim'}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {user ? (
                <div className="flex items-center gap-1.5 pl-1">
                  <Avatar className="h-8 w-8 border-2 border-primary/30">
                    <AvatarImage src={userAvatar} alt={userName} />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground font-bold">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={signOut}
                    className="hidden md:inline-flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="Chiqish"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center rounded-xl bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground shadow-soft hover:bg-primary/90 transition-colors"
                >
                  Kirish
                </Link>
              )}
            </div>
          </header>

          {/* Main */}
          <main className="flex-1 min-w-0">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </main>

          {/* Footer */}
          <footer className="border-t border-border bg-card/40 px-5 py-4 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Azizbek EDU — Ingliz tilini o'zbek tilida o'rganing
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
