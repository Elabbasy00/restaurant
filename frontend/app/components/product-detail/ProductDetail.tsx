import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { PlusIcon, MinusIcon, ShoppingCart } from "lucide-react";
import type {
  ProductType,
  MenuVariationType,
  VariationType,
} from "~/types/dataTypes";
import { ProductInfo } from "../product-info/ProductInfo";
import ProductGallery from "../product-gallery/ProductGallery";
import { ProductVariations } from "../product-variations/ProductVariations";
import { useCart } from "~/hooks/useCart";
import type { CartVariationOption } from "~/redux/cart/cartSlice";
import { toast } from "sonner";

interface ProductDetailProps {
  product: ProductType;
}

// Create memoized subcomponents to prevent unnecessary re-renders

export const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariations, setSelectedVariations] = useState<
    Record<number, number>
  >({});
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const { addItem, openCart } = useCart();

  // Use the menu_variation directly from the product
  const variations = useMemo(() => {
    return product.menu_variation || [];
  }, [product.menu_variation]);

  // Initialize total price and selected variations
  useEffect(() => {
    // Set initial price (use discount_price if available, otherwise use regular price)
    const basePrice =
      product.discount_price &&
      parseFloat(product.discount_price.toString()) > 0
        ? parseFloat(product.discount_price.toString())
        : parseFloat(product.price.toString());

    setTotalPrice(basePrice);

    // Pre-select required variations with their first option
    const initialSelections: Record<number, number> = {};
    if (variations) {
      variations.forEach((variation) => {
        if (variation.required && variation.menu_variation_info?.length > 0) {
          initialSelections[variation.id] = variation.menu_variation_info[0].id;
        }
      });
    }
    setSelectedVariations(initialSelections);
  }, [product, variations]);

  // Calculate the base price including selected variations
  const calculateBasePrice = useCallback(() => {
    // Start with the product base price
    let basePrice =
      product.discount_price &&
      parseFloat(product.discount_price.toString()) > 0
        ? parseFloat(product.discount_price.toString())
        : parseFloat(product.price.toString());

    // Add extra price for each selected variation
    for (const variationId in selectedVariations) {
      const variation = variations.find((v) => v.id === parseInt(variationId));
      if (variation) {
        const option = variation.menu_variation_info.find(
          (o) => o.id === selectedVariations[parseInt(variationId)]
        );
        if (option) {
          basePrice += parseFloat(option.extra_price.toString());
        }
      }
    }

    return basePrice;
  }, [product, selectedVariations, variations]);

  // Update total price whenever quantity or selections change
  useEffect(() => {
    setTotalPrice(calculateBasePrice() * quantity);
  }, [calculateBasePrice, quantity, selectedVariations]);

  // Handle variation selection change
  const handleVariationChange = useCallback(
    (variationId: number, optionId: number, extraPrice: number) => {
      setSelectedVariations((prev) => ({
        ...prev,
        [variationId]: optionId,
      }));
    },
    []
  );

  const incrementQuantity = useCallback(() => {
    setQuantity((prev) => prev + 1);
  }, []);

  const decrementQuantity = useCallback(() => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  }, []);

  // Prepare gallery images from product data
  const galleryImages = useMemo(() => {
    return [
      product.product_image,
      ...(product?.product_gallery || []).map((item) => item?.image),
    ].filter(Boolean); // Filter out any undefined or null values
  }, [product.product_image, product.product_gallery]);

  // Convert selected variations to the format expected by the cart
  const getCartVariations = useCallback((): CartVariationOption[] => {
    const cartVariations: CartVariationOption[] = [];

    for (const variationId in selectedVariations) {
      const variation = variations.find((v) => v.id === parseInt(variationId));
      if (variation) {
        const option = variation.menu_variation_info.find(
          (o) => o.id === selectedVariations[parseInt(variationId)]
        );
        if (option) {
          cartVariations.push({
            variationId: variation.id,
            variationName: variation.name,
            optionId: option.id,
            optionValue: option.value,
            extraPrice: parseFloat(option.extra_price.toString()),
          });
        }
      }
    }

    return cartVariations;
  }, [selectedVariations, variations]);

  // Handle adding to cart
  const handleAddToCart = useCallback(() => {
    // Check if all required variations are selected
    const missingRequired = variations.filter(
      (v) => v.required && !selectedVariations[v.id]
    );

    if (missingRequired.length > 0) {
      toast.error("Please select options", {
        description: `Please select required options: ${missingRequired
          .map((v) => v.name)
          .join(", ")}`,
      });

      return;
    }

    // Add to cart
    addItem(product, quantity, getCartVariations());

    // Show success message
    toast.success("Added to cart", {
      description: `${quantity} × ${product.name} added to your cart`,
    });

    // Optionally open the cart drawer
    // openCart();
  }, [
    product,
    quantity,
    variations,
    selectedVariations,
    getCartVariations,
    addItem,
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left side - Image Gallery */}
        <div className="rounded-lg overflow-hidden">
          <ProductGallery images={galleryImages} />
        </div>

        {/* Right side - Product Info and Variations */}
        <div className="space-y-6">
          <ProductInfo
            name={product.name}
            price={product.price}
            discountPrice={product.discount_price}
            description={product.description}
            sku={product.sku}
          />

          {/* Variations */}
          {variations && variations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">الخيارات</h3>
              {variations.map((variation) => (
                <ProductVariations
                  key={variation.id}
                  variation={variation}
                  onChange={handleVariationChange}
                  selectedOption={selectedVariations[variation.id]}
                />
              ))}
            </div>
          )}

          {/* Quantity selector */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">الكمية:</span>
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <MinusIcon className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={incrementQuantity}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Total price */}
          <div className="text-xl font-bold">
            إجمالي: {totalPrice.toFixed(2)}L.E
          </div>

          {/* Add to cart button */}
          <Button
            className="w-full flex items-center justify-center gap-2"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5" />
            اضف الى السلة
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
