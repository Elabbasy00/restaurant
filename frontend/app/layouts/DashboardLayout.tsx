import React from "react";
import { Outlet } from "react-router";
import { ProtectedRoute } from "~/auth/ProtectedRoute";
import { AppSidebar } from "~/components/app-sidebar";
import CartDrawer from "~/components/cart-drawer/CartDrawer";
import Navbar from "~/components/navbar/Navbar";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";

function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ProtectedRoute>
          <Navbar />
          <div className="flex flex-1 flex-col" dir="rtl">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-3">
                <Outlet />
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </SidebarInset>
      <CartDrawer />
    </SidebarProvider>
  );
}

export default DashboardLayout;
