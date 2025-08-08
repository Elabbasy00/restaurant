import React from "react";
import { useParams } from "react-router";

import ProductDetail from "~/components/product-detail/ProductDetail";
import { useGetProductDetailQuery } from "~/redux/menu-slice/menuSlice"; // You'll need to create this query

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const {
    data: product,
    isLoading,
    error,
  } = useGetProductDetailQuery(slug, { skip: !slug });

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Product Not Found
          </h2>
          <p className="text-red-600">
            We couldn't find the product you're looking for. It may have been
            removed or the URL is incorrect.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <ProductDetail product={product} />
    </div>
  );
}
