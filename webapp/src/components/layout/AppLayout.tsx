import { type ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Shield, MessageSquare, Bell, Moon, Sun, Globe, Leaf, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';
import { useLogout } from '@/hooks/useLogout';
import { useTranslation } from 'react-i18next';

const FEEDBACK_COUNT = 5;

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

const navLinks = [
  { path: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { path: '/tutorials', labelKey: 'nav.tutorials', icon: BookOpen },
  { path: '/ipm', labelKey: 'nav.ipm', icon: Shield },
  { path: '/feedbacks', labelKey: 'nav.feedbacks', icon: MessageSquare },
  { path: '/alerts', labelKey: 'nav.alerts', icon: Bell },
];

export function AppLayout({ children, title }: AppLayoutProps) {
  const location = useLocation();
  const { profile } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { logout, isLoggingOut } = useLogout();
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'kin' : 'en');
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-screen w-64 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'var(--sidebar)', borderRight: '1px solid var(--sidebar-border)' }}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--brand-hover)' }}>
              <Leaf className="w-5 h-5" style={{ color: 'var(--brand-main)' }} />
            </div>
            <div>
              <h1 className="font-bold text-lg" style={{ color: 'var(--brand-main)' }}>IkigoriSmart</h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Admin Dashboard</p>
            </div>
          </div>
          <button 
            className="lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
            style={{ color: 'var(--text-primary)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
          {navLinks.map(({ path, labelKey, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link key={path} to={path} className="block cursor-pointer">
                <Button
                  variant="ghost"
                  className="sidebar-nav-btn w-full justify-start mb-1 rounded-lg"
                  style={{
                    background: isActive ? 'var(--brand-hover)' : 'transparent',
                    color: isActive ? 'var(--brand-main)' : 'var(--text-primary)',
                  }}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {t(labelKey)}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
          {profile && (
            <div className="flex items-center gap-3 mb-3">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.first_name} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--brand-hover)', color: 'var(--brand-main)' }}>
                  {profile.first_name[0]}{profile.last_name[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {profile.first_name} {profile.last_name}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                  {profile.email}
                </p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start rounded-lg cursor-pointer"
            style={{ color: 'var(--error-main)' }}
            onClick={() => logout()}
            disabled={isLoggingOut}
          >
            <LogOut className="w-4 h-4 mr-3" />
            {isLoggingOut ? t('common.loading') : t('nav.logout')}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="fixed top-0 right-0 lg:left-64 left-0 h-16 flex items-center justify-between px-6 border-b z-30" style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden" 
              onClick={() => setIsSidebarOpen(true)}
              style={{ color: 'var(--text-primary)' }}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{t(title)}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/feedbacks" className="cursor-pointer">
              <Button variant="ghost" size="icon" className="navbar-icon-btn relative">
                <MessageSquare className="w-5 h-5" />
                {FEEDBACK_COUNT > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none"
                    style={{ background: 'var(--error-main)' }}
                  >
                    {FEEDBACK_COUNT > 99 ? '99+' : FEEDBACK_COUNT}
                  </span>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="navbar-icon-btn" onClick={toggleDarkMode}>
              <Sun className="w-5 h-5 dark:hidden" />
              <Moon className="w-5 h-5 hidden dark:block" />
            </Button>
            <Button variant="ghost" size="icon" className="navbar-icon-btn" onClick={toggleLanguage}>
              <Globe className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="mt-16 p-3 sm:p-4 md:p-6 overflow-x-hidden" style={{ background: 'var(--background)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
