import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { useCart } from "~/hooks/useCart";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { Link } from "react-router";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { CartItem } from "~/redux/cart/cartSlice";

export const CartDrawer: React.FC = () => {
  const { cart, updateItemQuantity, removeCartItem, emptyCart, closeCart } =
    useCart();

  return (
    <Sheet open={cart.isOpen} onOpenChange={closeCart}>
      <SheetContent className="flex flex-col w-full sm:max-w-md" side="right">
        <SheetHeader className="px-1">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            السلة ({cart.totalItems} items)
          </SheetTitle>
        </SheetHeader>

        {cart.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-12">
            <ShoppingBag className="h-12 w-12 text-gray-300" />
            <div className="text-center">
              <h3 className="text-lg font-medium">سلةك فارغة</h3>
              <p className="text-sm text-gray-500 mt-1">
                أضف عناصر إلى سلة التسوق لرؤيةها هنا.
              </p>
            </div>
            <SheetClose asChild>
              ث<Button>مواصلة التسوق</Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-1 -mx-1">
              <div className="space-y-4 py-0 px-3">
                {cart.items.map((item: CartItem) => (
                  <div
                    key={item.id}
                    className="flex items-start space-x-3 border-b pb-4"
                  >
                    <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/dashboard/menu/${item.slug}`}
                        className="font-medium text-sm hover:underline line-clamp-1"
                        onClick={closeCart}
                      >
                        {item.name}
                      </Link>

                      {/* Variations */}
                      {item.selectedVariations.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {item.selectedVariations.map((variation) => (
                            <div
                              key={`${variation.variationId}-${variation.optionId}`}
                              className="text-xs text-gray-500"
                            >
                              {variation.variationName}: {variation.optionValue}
                              {variation.extraPrice > 0 && (
                                <span className="ml-1">
                                  (+${variation.extraPrice.toFixed(2)})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateItemQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateItemQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {(item.price * item.quantity).toFixed(2)} L.E
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => removeCartItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t mb-4  pt-2 px-3 ">
              {/* Order summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">المجموع</span>
                  <span>{cart.subtotal.toFixed(2)}L.E</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    ضريبة ({((cart.taxRate * 100) / 100).toFixed(0)}%)
                  </span>
                  <span>{cart.tax.toFixed(2)}L.E</span>
                </div>
                {cart.shipping > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">الشحن</span>
                    <span>{cart.shipping.toFixed(2)}L.E</span>
                  </div>
                )}
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>المجموع</span>
                  <span>{cart.total.toFixed(2)} L.E</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col space-y-2">
                <Link to="/dashboard/checkout">
                  <Button className="w-full">الدفع</Button>
                </Link>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={closeCart}
                    asChild
                  >
                    <SheetClose>مواصلة التسوق</SheetClose>
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                    onClick={emptyCart}
                  >
                    حذف السلة
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
