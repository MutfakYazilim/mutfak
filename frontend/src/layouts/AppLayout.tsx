import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, SidebarProvider, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from './sidebar';
import { Home, MessageSquare, BarChart, Settings, Store, LogOut, ClipboardList } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar>
          <SidebarHeader className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                <img
                  src="/lovable-uploads/7e091370-903c-471f-ab91-fe019f038545.png"
                  alt="Frying Pan Logo"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <span className="font-medium">
                {isAdmin ? 'Admin Panel' : 'Restoran Panel'}
              </span>
            </div>
          </SidebarHeader>

          <SidebarContent className="flex-1 py-6 px-4 overflow-y-auto">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/dashboard')} tooltip="Ana Sayfa">
                  <Home className="mr-3" size={20} />
                  <span>Ana Sayfa</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/analytics')} tooltip="Analiz Paneli">
                  <BarChart className="mr-3" size={20} />
                  <span>Analiz Paneli</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/comments')} tooltip="Yorumlar">
                  <MessageSquare className="mr-3" size={20} />
                  <span>Yorumlar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {isAdmin && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate('/admin/restaurants')} tooltip="Restoranlar">
                      <Store className="mr-3" size={20} />
                      <span>Restoranlar</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => navigate('/admin/waitlist')} tooltip="Waitlist">
                      <ClipboardList className="mr-3" size={20} />
                      <span>Waitlist</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}

              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/settings')} tooltip="Ayarlar">
                  <Settings className="mr-3" size={20} />
                  <span>Ayarlar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={logout} tooltip="Çıkış Yap">
                  <LogOut className="mr-3" size={20} />
                  <span>Çıkış Yap</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="w-full overflow-auto">
          {children || <Outlet />}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
