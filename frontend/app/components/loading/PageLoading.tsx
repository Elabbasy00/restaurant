import React from "react";

function PageLoading({ text }: { text: string }) {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">{text}</p>
      </div>
    </div>
  );
}

export default PageLoading;
