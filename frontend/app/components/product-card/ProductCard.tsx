import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Link } from "react-router";
import type { ProductType } from "~/types/dataTypes";
import { FaCartPlus } from "react-icons/fa6";
import { useCart } from "~/hooks/useCart";
import { toast } from "sonner";

function ProductCard({ product }: { product: ProductType }) {
  const { addItem } = useCart();
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Add to cart with default quantity of 1 and no variations
    addItem(product, 1, []);

    // Show success message
    toast.success("Added to cart", {
      description: `${product.name} added to your cart`,
    });
  };

  return (
    <Card
      key={product.id}
      className="w-full p-0 bg-white shadow-md rounded-xl duration-500 hover:shadow-lg"
    >
      <Link to={`/dashboard/menu/${product.slug}`}>
        <CardHeader className="p-0">
          <img
            src={product.product_image}
            alt={product.name}
            className="h-48 w-full object-cover rounded-t-xl"
          />
        </CardHeader>

        <CardContent className="px-4 py-3">
          <p className="text-lg font-bold text-black truncate block capitalize">
            {product.name}
          </p>
          <span className="text-gray-400 mr-3 uppercase text-xs">
            {product.description.substring(0, 80)}...
          </span>

          <div className="flex items-center justify-between mt-2">
            <p className="text-lg font-semibold text-primary">
              {product.price} L.E
            </p>{" "}
            <Button
              onClick={handleAddToCart}
              size="sm"
              variant="outline"
              className="cursor-pointer"
            >
              <FaCartPlus /> اضافة الي السلة
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

export default ProductCard;
