import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel,
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarHeader
} from '@/components/ui/sidebar';
import { 
  BarChart3, 
  Briefcase, 
  CreditCard, 
  FileText, 
  LogOut, 
  Settings,
  Shield
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

interface AppSidebarProps {
  userRole: 'admin' | 'staff' | 'accountant';
  onLogout: () => void;
}

export default function AppSidebar({ userRole, onLogout }: AppSidebarProps) {
  const [location] = useLocation();

  // Role-based navigation items
  const getMenuItems = () => {
    const baseItems = [
      { title: 'Jobs', url: '/jobs', icon: Briefcase, roles: ['admin', 'staff'] },
      { title: 'Summary', url: '/summary', icon: BarChart3, roles: ['admin', 'accountant'] },
      { title: 'Reports', url: '/reports', icon: FileText, roles: ['admin', 'accountant'] }
    ];

    const adminItems = [
      { title: 'Expenses', url: '/expenses', icon: CreditCard, roles: ['admin'] },
      { title: 'Audit Log', url: '/audit', icon: Shield, roles: ['admin'] }
    ];

    return [...baseItems, ...adminItems].filter(item => 
      item.roles.includes(userRole)
    );
  };

  return (
    <Sidebar data-testid=\"sidebar-main\">
      <SidebarHeader className=\"border-b border-sidebar-border px-6 py-4\">
        <h1 className=\"text-xl font-bold text-sidebar-primary\">QikMech Finance</h1>
        <p className=\"text-sm text-sidebar-foreground/70 capitalize\">{userRole} Dashboard</p>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {getMenuItems().map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url}>
                      <item.icon className=\"h-4 w-4\" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className=\"mt-auto\">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href=\"/settings\" data-testid=\"nav-settings\">
                    <Settings className=\"h-4 w-4\" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Button 
                  variant=\"ghost\" 
                  className=\"w-full justify-start p-2 h-auto\" 
                  onClick={onLogout}
                  data-testid=\"button-logout\"
                >
                  <LogOut className=\"h-4 w-4 mr-2\" />
                  <span>Logout</span>
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}