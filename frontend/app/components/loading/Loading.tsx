import React from "react";

function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      <p className="ms-4 text-lg">جار التحميل...</p>
    </div>
  );
}

export default Loading;
