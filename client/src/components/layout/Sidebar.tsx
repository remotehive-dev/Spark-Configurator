import { useState } from "react";
import { Link } from "wouter";
import { 
  LayoutDashboard, 
  Calculator, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  X,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

export function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Only show sidebar on admin routes
  if (!location.startsWith("/admin")) return null;

  const toggleSidebar = () => setIsOpen(!isOpen);

  const navItems = [
    { icon: LayoutDashboard, label: "Admin Dashboard", href: "/admin" },
    { icon: Users, label: "Lead Database", href: "/admin" },
    { icon: Settings, label: "System Settings", href: "/admin" },
  ];

  return (
    <>
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={toggleSidebar}>
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-sidebar-border transform transition-transform duration-200 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
            <div className="flex items-center gap-2 font-bold text-xl text-primary">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                PS
              </div>
              PlanetSpark
            </div>
          </div>

          <div className="px-6 py-4">
             <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2">
                <ShieldCheck className="h-3 w-3" /> Admin Panel
             </div>
          </div>

          <div className="flex-1 px-4 space-y-2">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors",
                  location === item.href 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground hover:bg-muted"
                )}>
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </div>
              </Link>
            ))}
          </div>

          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground cursor-pointer">
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
