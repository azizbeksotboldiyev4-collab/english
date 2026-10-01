import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  Home, BookOpen, Trophy, GraduationCap, Sparkles, Gamepad2, Clock, User,
  Headphones, Mic, MapPin, Shield, FileText, Languages, BarChart3,
  BookMarked, MessageCircle, X,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAdmin } from '@/hooks/useAdmin';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const MAIN = [
  { to: '/', label: 'Bosh sahifa', icon: Home },
  { to: '/levels', label: 'Darslar', icon: BookOpen },
  { to: '/profile', label: 'Profilim', icon: User },
  { to: '/dashboard', label: 'Dashboard', icon: GraduationCap },
  { to: '/leaderboard', label: 'Reyting', icon: Trophy },
];

const PRACTICE = [
  { to: '/games', label: 'Games', icon: Gamepad2 },
  { to: '/topical-vocabulary', label: "Mavzuli lug'at", icon: BookMarked },
  { to: '/tenses-game', label: 'Zamonlar', icon: Clock },
  { to: '/listening', label: 'Listening', icon: Headphones },
  { to: '/speaking', label: 'Speaking', icon: Mic },
  { to: '/simulation', label: 'Simulyatsiya', icon: MapPin },
];

const AI_TOOLS = [
  { to: '/yordamchi-ustoz', label: 'AI Ustoz', icon: Sparkles },
  { to: '/voice-chat', label: 'Voice Chat', icon: MessageCircle },
  { to: '/essay', label: 'Essay tekshir', icon: FileText },
  { to: '/translator', label: 'Tarjimon', icon: Languages },
  { to: '/analytics', label: 'Tahlil', icon: BarChart3 },
];

export default function AppSidebar() {
  const { state, setOpen, setOpenMobile, isMobile: sidebarIsMobile } = useSidebar();
  const isMobile = useIsMobile();
  const collapsed = state === 'collapsed';
  const { pathname } = useLocation();
  const { isAdmin } = useAdmin();

  const handleNavigate = () => {
    if (isMobile) setOpenMobile(false);
    else setOpen(false);
  };

  const renderItem = (item: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }) => {
    const active = pathname === item.to;
    return (
      <SidebarMenuItem key={item.to}>
        <SidebarMenuButton
          asChild
          isActive={active}
          tooltip={item.label}
          className={cn(
            'h-11 rounded-xl border transition-all duration-200',
            isMobile && [
              active
                ? 'bg-gradient-to-r from-[#6C63FF] to-[#3B82F6] border-transparent text-white shadow-[0_0_20px_-8px_rgba(139,92,246,0.5)] data-[active=true]:text-white [&>svg]:text-white data-[active=true]:[&>svg]:text-white'
                : 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:bg-white/[0.08] hover:text-white hover:border-white/[0.14] [&>svg]:text-slate-400'
            ]
          )}
        >
          <NavLink
            to={item.to}
            onClick={handleNavigate}
            className="flex items-center gap-3 px-3 font-semibold"
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        'border-r border-border',
        isMobile && [
          'border-r border-white/10 bg-slate-950/[0.97]',
          'backdrop-blur-3xl',
          'shadow-[0_0_60px_-15px_rgba(139,92,246,0.22)]'
        ]
      )}
    >
      {/* Ambient glow */}
      {isMobile && (
        <>
          <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#6C63FF]/15 blur-[90px]" />
          <div className="pointer-events-none absolute bottom-12 right-0 h-56 w-56 rounded-full bg-[#3B82F6]/12 blur-[70px]" />
        </>
      )}

      <SidebarHeader
        className={cn(
          'border-b border-border/60 relative z-10',
          isMobile && 'border-white/10 p-4'
        )}
      >
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div
              className={cn(
                'flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-extrabold shadow-soft transition-transform group-hover:scale-105',
                isMobile
                  ? 'h-11 w-11 rounded-full bg-gradient-to-br from-[#6C63FF] via-[#8B5CF6] to-[#FF7A59] shadow-[0_0_24px_-6px_rgba(139,92,246,0.65)]'
                  : 'h-9 w-9'
              )}
            >
              {isMobile ? (
                <span className="text-white font-extrabold text-lg">A</span>
              ) : (
                <span className="text-base">A</span>
              )}
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className={cn('text-base font-extrabold tracking-tight truncate', isMobile && 'text-white')}>
                Azizbek EDU
              </span>
              <span
                className={cn(
                  'text-[10px] font-semibold uppercase tracking-wider',
                  isMobile ? 'text-slate-400' : 'text-muted-foreground'
                )}
              >
                English Academy
              </span>
            </div>
          </Link>

          {isMobile && (
            <button
              onClick={() => setOpenMobile(false)}
              aria-label="Yopish"
              className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent
        className={cn(
          'px-1.5 py-2 relative z-10',
          isMobile && 'px-3 py-4 overflow-y-auto'
        )}
      >
        <SidebarGroup className={cn(isMobile && 'p-0')}> 
          <SidebarGroupLabel
            className={cn(
              'text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70',
              isMobile && 'text-slate-500 mb-1'
            )}
          >
            Asosiy
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">{MAIN.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className={cn(isMobile && 'p-0 mt-4')}>
          <SidebarGroupLabel
            className={cn(
              'text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70',
              isMobile && 'text-slate-500 mb-1'
            )}
          >
            Mashqlar
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">{PRACTICE.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className={cn(isMobile && 'p-0 mt-4')}>
          <SidebarGroupLabel
            className={cn(
              'text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70',
              isMobile && 'text-slate-500 mb-1'
            )}
          >
            AI Vositalar
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">{AI_TOOLS.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup className={cn(isMobile && 'p-0 mt-4')}>
            <SidebarGroupLabel
              className={cn(
                'text-[10px] font-bold uppercase tracking-wider text-amber-600/80',
                isMobile && 'text-amber-400/80 mb-1'
              )}
            >
              Boshqaruv
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/admin'}
                    tooltip="Admin panel"
                    className={cn(
                      'h-11 rounded-xl border transition-all duration-200',
                      isMobile && [
                        pathname === '/admin'
                          ? 'bg-gradient-to-r from-[#6C63FF] to-[#3B82F6] border-transparent text-white shadow-[0_0_20px_-8px_rgba(139,92,246,0.5)] data-[active=true]:text-white [&>svg]:text-white data-[active=true]:[&>svg]:text-white'
                          : 'bg-white/[0.04] border-white/[0.08] text-amber-400 hover:bg-white/[0.08] hover:text-amber-300 hover:border-white/[0.14] [&>svg]:text-amber-400'
                      ]
                    )}
                  >
                    <NavLink to="/admin" onClick={handleNavigate} className="flex items-center gap-3 px-3 font-semibold">
                      <Shield className="h-[18px] w-[18px] shrink-0" />
                      <span>Admin panel</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
