import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, BookOpen, BarChart3, ClipboardCheck, MessageSquare,
  Shield, Settings, HelpCircle, LogOut, GraduationCap,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Courses", url: "/courses", icon: BookOpen },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Assessments", url: "/assessments", icon: ClipboardCheck },
  { title: "Messages", url: "/messages", icon: MessageSquare },
];

const adminItems = [{ title: "Admin Tools", url: "/admin", icon: Shield }];

const secondaryItems = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help & Support", url: "/help", icon: HelpCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { role, profile, signOut } = useAuth();
  const isActive = (u: string) => path === u || path.startsWith(u + "/");

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <div className="flex h-full flex-col bg-gradient-sidebar text-sidebar-foreground">
        <SidebarHeader className="border-b border-sidebar-border/40">
          <Link to="/dashboard" className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-primary shadow-elevated">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="flex flex-col leading-tight">
                <span className="font-display text-base font-bold tracking-tight">WAASS</span>
                <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
                  Academic System
                </span>
              </div>
            )}
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-1">
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/50">Main</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground hover:bg-sidebar-accent text-sidebar-foreground/80"
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {role === "admin" && (
            <SidebarGroup>
              {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/50">Admin</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground hover:bg-sidebar-accent text-sidebar-foreground/80"
                      >
                        <Link to={item.url}>
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/50">System</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {secondaryItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground hover:bg-sidebar-accent text-sidebar-foreground/80"
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border/40 p-2">
          {!collapsed && profile && (
            <div className="mb-2 rounded-lg bg-sidebar-accent/50 px-3 py-2">
              <div className="truncate text-sm font-medium">{profile.full_name || "User"}</div>
              <div className="truncate text-xs text-sidebar-foreground/60 capitalize">{role ?? ""}</div>
            </div>
          )}
          <SidebarMenuButton
            onClick={signOut}
            className="hover:bg-destructive/20 hover:text-destructive-foreground text-sidebar-foreground/80"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Logout</span>}
          </SidebarMenuButton>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
