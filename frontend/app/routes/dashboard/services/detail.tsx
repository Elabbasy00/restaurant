import React from "react";
import { useParams } from "react-router";
import { useGetServiceBySlugQuery } from "~/redux/services/serviceApi";
import ServiceDetail from "~/components/service-detail/ServiceDetail";

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const {
    data: service,
    isLoading,
    error,
  } = useGetServiceBySlugQuery(slug!, { skip: !slug });

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل تفاصيل الخدمة...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="container mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            خدمة غير موجودة
          </h2>
          <p className="text-red-600">
            لا يمكننا العثور على الخدمة التي تبحث عنها.
          </p>
        </div>
      </div>
    );
  }

  return <ServiceDetail service={service} />;
}
