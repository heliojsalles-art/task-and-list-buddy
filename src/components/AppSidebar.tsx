import { CheckSquare, ShoppingCart, Receipt } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Lembretes", url: "/", icon: CheckSquare },
  { title: "Listas de Compras", url: "/shopping", icon: ShoppingCart },
  { title: "Contas", url: "/bills", icon: Receipt },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="glass-strong bg-transparent border-r border-border/30">
        <div className="p-4 pb-2">
          {!collapsed && (
            <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
              📋 Organiza
            </h1>
          )}
          {collapsed && <span className="text-xl">📋</span>}
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="rounded-xl hover:bg-accent/40 transition-all duration-200"
                      activeClassName="glass bg-accent/60 text-accent-foreground font-medium shadow-sm"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
