"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  User,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  Menu,
  X,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { subscribeToAuthChanges, logoutUser } from "@/lib/firebase/client";
import { revokeSession } from "@/lib/actions/auth.action";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SharedLayoutProps {
  children: React.ReactNode;
}

export default function SharedLayout({ children }: SharedLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  const [user, setUser] = useState<{
    email: string | null;
    displayName: string | null;
  } | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const initializeTheme = () => {
      try {
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        const shouldBeDark =
          savedTheme === "dark" || (!savedTheme && prefersDark);

        setIsDarkMode(shouldBeDark);
        setIsThemeLoaded(true);

        if (shouldBeDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } catch (error) {
        console.error("Error initializing theme:", error);
        setIsThemeLoaded(true);
      }
    };

    initializeTheme();
  }, []);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });
        // Check if user is admin
        setIsAdmin(firebaseUser.email === "admin@web.com");
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    try {
      if (newTheme) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      await revokeSession();
      toast.success("Successfully signed out");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to sign out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Determine page type for different header styles
  const isLoginPage = pathname === "/login";
  const isDashboardPage = pathname === "/dashboard";
  const isAdminPage = pathname === "/dashboard/admin";
  const isHomePage = pathname === "/";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Dark Mode Toggle Button */}
      {isThemeLoaded && (
        <button
          onClick={toggleTheme}
          className="fixed top-20 right-4 z-[60] p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
          aria-label={
            isDarkMode ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5 text-yellow-500" />
          ) : (
            <Moon className="h-5 w-5 text-gray-600" />
          )}
        </button>
      )}

      {/* Header */}
      <header className="border-b border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-8 bg-green-500 rounded-sm"></div>
                <div className="w-2 h-6 bg-green-400 rounded-sm"></div>
                <div className="w-2 h-10 bg-green-600 rounded-sm"></div>
                <div className="w-2 h-4 bg-green-300 rounded-sm"></div>
              </div>
              <span className="text-lg lg:text-xl font-bold text-gray-800 dark:text-white tracking-wider">
                GOLDNETINTERNATIONAL
              </span>
            </Link>

            {/* Navigation - Different for each page type */}
            {isLoginPage ? (
              <Link href="/">
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Home</span>
                </Button>
              </Link>
            ) : (
              <>
                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center space-x-8">
                  <Link
                    href="/"
                    className={`font-medium transition-colors ${
                      isHomePage
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
                    }`}
                  >
                    Home
                  </Link>
                  {isHomePage && (
                    <>
                      <a
                        href="#"
                        className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors"
                      >
                        About
                      </a>
                      <a
                        href="#"
                        className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors"
                      >
                        Services
                      </a>
                      <a
                        href="#"
                        className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors"
                      >
                        Trading
                      </a>
                      <a
                        href="#"
                        className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors"
                      >
                        Contact
                      </a>
                    </>
                  )}
                  {isDashboardPage && !isAdminPage && (
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      Dashboard
                    </span>
                  )}
                  {isAdminPage && (
                    <span className="text-green-600 dark:text-green-400 font-medium flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </span>
                  )}
                </nav>

                {/* Desktop User Menu */}
                <div className="hidden lg:flex items-center space-x-4">
                  {user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-2"
                        >
                          <User className="h-4 w-4" />
                          <span className="max-w-32 truncate">
                            {user.email}
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem disabled>
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium">Signed in as</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                            {isAdmin && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                <Shield className="h-3 w-3 mr-1" />
                                Admin
                              </span>
                            )}
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {isHomePage && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href="/dashboard">Dashboard</Link>
                            </DropdownMenuItem>
                            {isAdmin && (
                              <DropdownMenuItem asChild>
                                <Link
                                  href="/dashboard/admin"
                                  className="flex items-center"
                                >
                                  <Shield className="mr-2 h-4 w-4" />
                                  Admin Dashboard
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {isDashboardPage && !isAdminPage && isAdmin && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link
                                href="/dashboard/admin"
                                className="flex items-center"
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Admin Dashboard
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {isAdminPage && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href="/dashboard">Regular Dashboard</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>
                            {isLoggingOut ? "Signing out..." : "Sign out"}
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link href="/login">
                      <Button
                        variant="outline"
                        className="bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        Login
                      </Button>
                    </Link>
                  )}
                  {isHomePage && (
                    <Button className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                      Get Started
                    </Button>
                  )}
                </div>

                {/* Mobile Hamburger Menu */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          {!isLoginPage && (
            <div
              className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
                isMobileMenuOpen
                  ? "max-h-[500px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <nav className="py-4 space-y-4 border-t border-gray-100 dark:border-gray-800 pb-safe">
                <Link
                  href="/"
                  className={`block font-medium transition-colors py-2 ${
                    isHomePage
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
                  }`}
                >
                  Home
                </Link>
                {isHomePage && (
                  <>
                    <a
                      href="#"
                      className="block text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors py-2"
                    >
                      About
                    </a>
                    <a
                      href="#"
                      className="block text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors py-2"
                    >
                      Services
                    </a>
                    <a
                      href="#"
                      className="block text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors py-2"
                    >
                      Trading
                    </a>
                    <a
                      href="#"
                      className="block text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors py-2"
                    >
                      Contact
                    </a>
                  </>
                )}
                {isDashboardPage && !isAdminPage && (
                  <span className="block text-green-600 dark:text-green-400 font-medium py-2">
                    Dashboard
                  </span>
                )}
                {isAdminPage && (
                  <span className="block text-green-600 dark:text-green-400 font-medium py-2 flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </span>
                )}
                <div className="flex flex-col space-y-3 pt-4 pb-4">
                  {user ? (
                    <div className="space-y-3">
                      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Signed in as
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.email}
                        </p>
                        {isAdmin && (
                          <span className="inline-flex items-center px-2 py-1 mt-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </span>
                        )}
                      </div>
                      {isHomePage && (
                        <>
                          <Link href="/dashboard">
                            <Button
                              variant="outline"
                              className="w-full bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              Dashboard
                            </Button>
                          </Link>
                          {isAdmin && (
                            <Link href="/dashboard/admin">
                              <Button
                                variant="outline"
                                className="w-full bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center space-x-2"
                              >
                                <Shield className="h-4 w-4" />
                                <span>Admin Dashboard</span>
                              </Button>
                            </Link>
                          )}
                        </>
                      )}
                      {isDashboardPage && !isAdminPage && isAdmin && (
                        <Link href="/dashboard/admin">
                          <Button
                            variant="outline"
                            className="w-full bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center space-x-2"
                          >
                            <Shield className="h-4 w-4" />
                            <span>Admin Dashboard</span>
                          </Button>
                        </Link>
                      )}
                      {isAdminPage && (
                        <Link href="/dashboard">
                          <Button
                            variant="outline"
                            className="w-full bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            Regular Dashboard
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="outline"
                        className="w-full bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        {isLoggingOut ? "Signing out..." : "Sign out"}
                      </Button>
                    </div>
                  ) : (
                    <Link href="/login">
                      <Button
                        variant="outline"
                        className="w-full bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        Login
                      </Button>
                    </Link>
                  )}
                  {isHomePage && (
                    <Button className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                      Get Started
                    </Button>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      {children}
    </div>
  );
}
