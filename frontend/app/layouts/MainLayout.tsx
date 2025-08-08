import React from "react";

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col" dir="rtl">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-3">
          {children}
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
