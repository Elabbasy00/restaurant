import React from "react";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import type { VariationType, MenuVariationType } from "~/types/dataTypes";

interface ProductVariationsProps {
  variation: VariationType;
  onChange: (variationId: number, optionId: number, extraPrice: number) => void;
  selectedOption?: number;
}

export const ProductVariations: React.FC<ProductVariationsProps> = ({
  variation,
  onChange,
  selectedOption,
}) => {
  // Guard against undefined or empty menu_variation_info
  if (
    !variation?.menu_variation_info ||
    variation.menu_variation_info.length === 0
  ) {
    return null;
  }

  const handleChange = (optionId: number, extraPrice: string | number) => {
    // Convert extraPrice to number if it's a string
    const numericExtraPrice =
      typeof extraPrice === "string" ? parseFloat(extraPrice) : extraPrice;

    onChange(variation.id, optionId, numericExtraPrice);
  };

  // Format option label with price
  const formatOptionLabel = (option: MenuVariationType) => {
    if (!option) return "";

    const extraPrice =
      typeof option.extra_price === "string"
        ? parseFloat(option.extra_price)
        : option.extra_price;

    return option.value;
  };

  // Format price display
  const formatPrice = (price: string | number) => {
    const numericPrice = typeof price === "string" ? parseFloat(price) : price;
    return numericPrice > 0 ? `+${numericPrice.toFixed(2)}E£` : "";
  };

  // Render different input types based on value_type
  if (variation.value_type === "radio") {
    return (
      <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-900">{variation.name}</h4>
          {variation.required && (
            <span className="text-xs font-medium px-2 py-1 bg-red-50 text-red-600 rounded-full">
              مطلوب
            </span>
          )}
        </div>
        <RadioGroup
          value={selectedOption?.toString()}
          onValueChange={(value) => {
            const option = variation.menu_variation_info.find(
              (opt) => opt.id === parseInt(value)
            );
            if (option) {
              handleChange(option.id, option.extra_price);
            }
          }}
          className="space-y-2"
        >
          {variation.menu_variation_info.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.id.toString()}
                  id={`${variation.id}-${option.id}`}
                  className="text-primary"
                />
                <Label
                  htmlFor={`${variation.id}-${option.id}`}
                  className="cursor-pointer"
                >
                  {formatOptionLabel(option)}
                </Label>
              </div>
              {parseFloat(option.extra_price.toString()) > 0 && (
                <span className="text-sm font-medium text-gray-500">
                  {formatPrice(option.extra_price)}
                </span>
              )}
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  }

  if (variation.value_type === "checkbox") {
    return (
      <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-900">{variation.name}</h4>
          {variation.required && (
            <span className="text-xs font-medium px-2 py-1 bg-red-50 text-red-600 rounded-full">
              مطلوب
            </span>
          )}
        </div>
        <div className="space-y-2">
          {variation.menu_variation_info.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${variation.id}-${option.id}`}
                  checked={selectedOption === option.id}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleChange(option.id, option.extra_price);
                    }
                  }}
                  className="text-primary"
                />
                <Label
                  htmlFor={`${variation.id}-${option.id}`}
                  className="cursor-pointer"
                >
                  {formatOptionLabel(option)}
                </Label>
              </div>
              {parseFloat(option.extra_price.toString()) > 0 && (
                <span className="text-sm font-medium text-gray-500">
                  {formatPrice(option.extra_price)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default fallback for unknown variation types
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
      <h4 className="font-medium text-gray-900">{variation.name}</h4>
      <p className="text-sm text-gray-500 mt-1">
        نوع الخيار غير مدعوم: {variation.value_type}
      </p>
    </div>
  );
};
