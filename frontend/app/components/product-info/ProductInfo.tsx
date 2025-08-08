import React from "react";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { StarIcon } from "lucide-react";

interface ProductInfoProps {
  name: string;
  price: number | string; // Accept both number and string
  discountPrice?: number | string;
  description?: string;
  sku?: string;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  availability?: "in-stock" | "low-stock" | "out-of-stock";
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
  name,
  price,
  discountPrice,
  description,
  sku,
  rating = 0,
  reviewCount = 0,
  brand,
  availability = "in-stock",
}) => {
  // Convert price and discountPrice to numbers
  const numericPrice =
    typeof price === "string" ? parseFloat(price) : price || 0;
  const numericDiscountPrice =
    discountPrice !== undefined
      ? typeof discountPrice === "string"
        ? parseFloat(discountPrice)
        : discountPrice
      : 0;

  // Check if discount is valid
  const hasDiscount =
    numericDiscountPrice > 0 && numericDiscountPrice < numericPrice;

  // Format availability text and color
  const availabilityConfig = {
    "in-stock": { text: "في المخزون", color: "text-green-600" },
    "low-stock": { text: "محدود", color: "text-amber-600" },
    "out-of-stock": { text: "غير متوفر", color: "text-red-600" },
  };

  // Calculate discount percentage
  const discountPercentage = hasDiscount
    ? Math.round((1 - numericDiscountPrice / numericPrice) * 100)
    : 0;

  // Safe formatting function
  const formatPrice = (value: number) => {
    try {
      return value.toFixed(2);
    } catch (error) {
      console.error("Error formatting price:", error);
      return "0.00";
    }
  };

  return (
    <div className="space-y-5">
      {/* Product name */}
      <div>
        {brand && (
          <div className="text-sm font-medium text-gray-500 mb-1">{brand}</div>
        )}
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {name}
        </h1>
      </div>

      {/* Ratings */}
      {(rating > 0 || reviewCount > 0) && (
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : i < rating
                    ? "text-yellow-400 fill-yellow-400 opacity-50"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          {reviewCount > 0 && (
            <span className="text-sm text-gray-500">
              ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
            </span>
          )}
        </div>
      )}

      {/* Price */}
      <div className="flex items-center gap-3">
        {hasDiscount ? (
          <>
            <span className="text-2xl font-bold text-primary">
              E£{formatPrice(numericDiscountPrice)}
            </span>
            <span className="text-lg text-gray-500 line-through">
              E£{formatPrice(numericPrice)}
            </span>
            <Badge
              variant="outline"
              className="bg-red-50 text-red-600 border-red-200 font-medium"
            >
              {discountPercentage}% خصم
            </Badge>
          </>
        ) : (
          <span className="text-2xl font-bold text-primary">
            E£{formatPrice(numericPrice)}
          </span>
        )}
      </div>

      {/* Availability */}
      <div
        className={`text-sm font-medium ${availabilityConfig[availability].color}`}
      >
        {availabilityConfig[availability].text}
      </div>

      <Separator className="my-4" />

      {/* Description */}
      {description && (
        <div className="prose prose-sm max-w-none text-gray-700">
          <p className="whitespace-pre-line">{description}</p>
        </div>
      )}

      {/* Additional details */}
      <div className="space-y-2">
        {sku && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">رمز المنتج:</span>
            <span className="font-medium">{sku}</span>
          </div>
        )}
      </div>
    </div>
  );
};
