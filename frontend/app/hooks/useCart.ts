import { useCallback } from "react";
import { useAppDispatch, useTypedSelector } from "~/redux/store";
import {
  addToCart,
  addServiceToCart, // Import the new action
  updateQuantity,
  removeItem,
  clearCart,
  toggleCart,
  setCartOpen,
  type CartVariationOption,
  type CartServiceBooking,
  setPersonAssignment,
  setItemPaymentStatus,
} from "~/redux/cart/cartSlice";
import type { ProductType, Service } from "~/types/dataTypes";

export const useCart = () => {
  const dispatch = useAppDispatch();
  const cart = useTypedSelector((state) => state.cart);

  // Existing product methods
  const addItem = useCallback(
    (
      product: ProductType,
      quantity: number,
      selectedVariations: CartVariationOption[] = []
    ) => {
      dispatch(addToCart({ product, quantity, selectedVariations }));
    },
    [dispatch]
  );

  // New service methods
  const addService = useCallback(
    (service: Service, quantity: number, booking?: CartServiceBooking) => {
      dispatch(addServiceToCart({ service, quantity, booking }));
    },
    [dispatch]
  );

  // Existing methods remain the same
  const updateItemQuantity = useCallback(
    (itemId: string, quantity: number) => {
      dispatch(updateQuantity({ itemId, quantity }));
    },
    [dispatch]
  );

  const removeCartItem = useCallback(
    (itemId: string) => {
      dispatch(removeItem(itemId));
    },
    [dispatch]
  );

  const emptyCart = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  const toggleCartOpen = useCallback(() => {
    dispatch(toggleCart());
  }, [dispatch]);

  const openCart = useCallback(() => {
    dispatch(setCartOpen(true));
  }, [dispatch]);

  const closeCart = useCallback(() => {
    dispatch(setCartOpen(false));
  }, [dispatch]);

  const assginPerson = useCallback(
    (itemId: string, personName: string) => {
      dispatch(setPersonAssignment({ itemId, name: personName }));
    },
    [dispatch]
  );
  const paymentStatus = useCallback(
    (itemId: string, isPaid: boolean, paidAmount: number) => {
      dispatch(setItemPaymentStatus({ itemId, isPaid, paidAmount }));
    },
    [dispatch]
  );
  // Helper methods to separate products and services
  const getProducts = useCallback(() => {
    return cart.items.filter((item: { type: string }) => item.type === "item");
  }, [cart.items]);

  const getServices = useCallback(() => {
    return cart.items.filter(
      (item: { type: string }) => item.type === "service"
    );
  }, [cart.items]);

  return {
    cart,
    addItem,
    addService, // Export new service method
    updateItemQuantity,
    removeCartItem,
    emptyCart,
    toggleCartOpen,
    openCart,
    closeCart,
    getProducts,
    getServices,
    assginPerson,
    paymentStatus,
  };
};
