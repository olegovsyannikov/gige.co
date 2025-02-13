import { useState, useEffect, useCallback } from 'react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { useStore } from '@nanostores/react';
import { layoutStore } from '../stores/layout';
import {
  Newspaper, Headphones, Download, FileText, Shield, Sun, Moon, Leaf, 
  type LucideIcon
} from 'lucide-react';

// Default navigation items
const defaultNavigation = [
  { title: 'Blog', path: '/blog', icon: Newspaper },
  { title: 'Podcast', path: '/podcast', icon: Headphones },
  { title: 'Docs', path: '/docs', icon: FileText },
];

interface NavigationItem {
  title: string;
  path: string;
  icon?: LucideIcon;
  variant?: 'link' | 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'primary';
}

interface SidebarProps {
  navigation?: NavigationItem[];
  type?: string;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export function Left({ navigation, isOpen, onOpenChange }: SidebarProps) {
  const [mounted, setMounted] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');
  const [sidebarState, setSidebarState] = useState<'closed' | 'open' | 'expanded'>('open');
  const [theme, setTheme] = useState<'dark' | 'light' | 'earth'>('dark');
  const layout = useStore(layoutStore);

  // Use the navigation prop or fall back to default navigation
  const mainNavItems = navigation || defaultNavigation;

  const isMobileDevice = () => window.innerWidth < 640;

  // Handle initial state and resize
  useEffect(() => {
    setMounted(true);
    const isMobile = isMobileDevice();
    setSidebarState(isMobile ? 'closed' : 'open');

    const handleResize = () => {
      const isMobile = isMobileDevice();
      if (isMobile && sidebarState !== 'closed') {
        setSidebarState('closed');
        onOpenChange?.(false);
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [onOpenChange]);

  // Sync with external isOpen prop
  useEffect(() => {
    if (isMobileDevice()) {
      setSidebarState(isOpen ? 'open' : 'closed');
    }
  }, [isOpen]);

  // Handle hover behavior on desktop
  const handleMouseEnter = useCallback(() => {
    if (!isMobileDevice() && sidebarState === 'open') {
      setSidebarState('expanded');
    }
  }, [sidebarState]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobileDevice() && sidebarState === 'expanded') {
      setSidebarState('open');
    }
  }, [sidebarState]);

  const toggleTheme = useCallback(() => {
    setTheme(current => {
      if (current === 'dark') return 'light';
      if (current === 'light') return 'earth';
      return 'dark';
    });
  }, []);

  useEffect(() => {
    // Get the current path without query parameters
    setCurrentPath(window.location.pathname);
  }, []);

  if (!mounted) return null;

  // Hide the sidebar when right panel is in full mode
  if (layout.mode === 'Full') return null;

  return (
    <>
      {/* Mobile backdrop with blur */}
      {isMobileDevice() && sidebarState !== 'closed' && (
        <div
          className="fixed inset-0 bg-[#111111]/80 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => {
            setSidebarState('closed');
            onOpenChange?.(false);
          }}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="complementary"
        aria-label="Main navigation"
        className={cn(
          "fixed left-0 top-0 h-screen z-40",
          "bg-[#222222] border-r border-[#111111]",
          "transition-all duration-300 ease-in-out will-change-transform",
          "transform",
          {
            "-translate-x-full sm:translate-x-0 w-0 sm:w-16": sidebarState === 'closed',
            "translate-x-0 w-16": sidebarState === 'open',
            "translate-x-0 w-[173px]": sidebarState === 'expanded'
          }
        )}
      >
        <nav
          role="navigation"
          aria-label="Primary navigation"
          className={cn(
            "h-full flex flex-col bg-[#040404]",
            sidebarState === 'closed' && "invisible sm:visible"
          )}
        >
          {/* Logo Section */}
          <div className="flex items-center justify-center border-b">
            <Button
              variant="ghost"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : theme === 'earth' ? 'dark' : 'earth'} theme`}
              aria-pressed={theme === 'dark'}
              className={cn(
                "relative w-16 h-16 flex items-center justify-center rounded-none",
                sidebarState === 'expanded' ? "w-full" : "",
                currentPath === '/' ? "bg-white/10" : "hover:bg-white/5",
                "transition-colors duration-200"
              )}
              asChild
            >
              <a href="/" className="flex items-center gap-4">
                <div className="absolute inset-0 flex items-center justify-center w-16 h-16">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <img
                      src="/icon.svg"
                      alt="GIGE.co Logo"
                      className="w-full h-full"
                    />
                  </div>
                </div>
                <span className={cn(
                  "transition-all duration-200 text-white font-medium",
                  sidebarState === 'expanded' ? "opacity-100 pl-4" : "opacity-0 w-0",
                  "truncate"
                )}>
                  GIGE.co
                </span>
              </a>
            </Button>
          </div>

          {/* Navigation Items */}
          <div
            className="flex-1 flex flex-col"
            role="menu"
            aria-label="Main navigation menu"
          >
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.path}
                  role="none"
                >
                  <Button
                    variant="ghost"
                    aria-current={currentPath === item.path ? 'page' : undefined}
                    aria-label={item.title}
                    className={cn(
                      "relative w-16 h-16 flex items-center justify-center rounded-none",
                      sidebarState === 'expanded' ? "w-full" : "",
                      currentPath === item.path ? "bg-white/10" : "hover:bg-white/5",
                      "transition-colors duration-200"
                    )}
                    asChild
                  >
                    <a
                      href={item.path}
                      className="flex items-center gap-4"
                      role="menuitem"
                    >
                      {Icon && (
                        <div className="absolute inset-0 flex items-center justify-center w-16 h-16">
                          <div className="w-8 h-8 flex items-center justify-center">
                            <Icon
                              className="w-full h-full text-white"
                              strokeWidth={1.5}
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                      )}
                      <span className={cn(
                        "transition-all duration-200 text-white",
                        sidebarState === 'expanded' ? "opacity-100 pl-4" : "opacity-0 w-0",
                        "truncate"
                      )}>
                        {item.title}
                      </span>
                    </a>
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Theme Toggle */}
          <div className={cn(
            "flex items-center justify-center",
            sidebarState === 'expanded' ? "border-b border-white/10" : ""
          )}>
            <Button
              variant="ghost"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : theme === 'earth' ? 'dark' : 'earth'} theme`}
              aria-pressed={theme === 'dark'}
              className={cn(
                "w-16 h-16 flex items-center justify-center rounded-none",
                sidebarState === 'expanded' ? "w-full" : "",
                "hover:bg-white/10",
                "focus-visible:ring-1 focus-visible:ring-white",
                "transition-colors duration-200"
              )}
              onClick={toggleTheme}
            >
              <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
                <div className="w-10 h-10 flex items-center justify-center">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-white" strokeWidth={1.5} aria-hidden="true" />
                  ) : theme === 'earth' ? (
                    <Leaf className="w-5 h-5 text-white" strokeWidth={1.5} aria-hidden="true" />
                  ) : (
                    <Sun className="w-5 h-5 text-white" strokeWidth={1.5} aria-hidden="true" />
                  )}
                </div>
              </div>
              <span className={cn(
                "transition-all duration-200 text-white",
                sidebarState === 'expanded' ? "opacity-100 pl-4" : "opacity-0 w-0",
                "truncate"
              )}>
                {theme === 'dark' ? 'Light Mode' : theme === 'earth' ? 'Dark Mode' : 'Earth Mode'}
              </span>
            </Button>
          </div>
        </nav>
      </aside>
    </>
  );
}

export default Left;