import React from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useCart } from "~/hooks/useCart";
import { cn } from "~/lib/utils";

interface CartIconProps {
  className?: string;
}

export const CartIcon: React.FC<CartIconProps> = ({ className }) => {
  const { cart, toggleCartOpen } = useCart();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("relative", className)}
      onClick={toggleCartOpen}
      aria-label="Open cart"
    >
      <ShoppingBag className="h-4 w-4" />
      {cart.totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {cart.totalItems > 99 ? "99+" : cart.totalItems}
        </span>
      )}
    </Button>
  );
};

export default CartIcon;
