import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ProductType, Service } from "~/types/dataTypes";

// Update CartVariationOption to be more generic
export interface CartVariationOption {
  variationId: number;
  variationName: string;
  optionId: number;
  optionValue: string;
  extraPrice: number;
}

// Add service booking info
export interface CartServiceBooking {
  id: number;
  scheduledTime: string;
  customerName: string;
  customerPhone: string;
  notes: string;
}

// Update CartItem to support both products and services
export interface CartItem {
  id: string; // Unique identifier for cart item
  type: "item" | "service"; // Add type to distinguish
  productId?: number; // Optional for products
  serviceId?: number; // Optional for services
  name: string;
  price: number;
  basePrice: number;
  quantity: number;
  image: string;
  slug: string;
  selectedVariations: CartVariationOption[];
  // Service-specific fields
  requiresBooking?: boolean;
  booking?: CartServiceBooking;
  categoryName?: string;
  person_name?: string;
  // Payment tracking for items
  itemPaymentStatus?: { isPaid: boolean; paidAmount: number };
}

// Rest of your existing CartState interface remains the same
interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  tax: number;
  taxRate: number;
  shipping: number;
  total: number;
  isOpen: boolean;
}

// Update helper functions
const generateCartItemId = (
  type: "item" | "service",
  id: number,
  selectedVariations: CartVariationOption[] = [],
  bookingTime?: string
): string => {
  const variationIds = selectedVariations
    .map((v) => `${v.variationId}-${v.optionId}`)
    .sort()
    .join("-");

  const bookingId = bookingTime ? `-${new Date(bookingTime).getTime()}` : "";

  return `${type}-${id}${variationIds ? `-${variationIds}` : ""}${bookingId}`;
};

// Rest of your existing helper functions remain the same
const recalculateCart = (state: CartState): void => {
  state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  state.subtotal = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  state.tax = state.subtotal * (state.taxRate / 100);
  state.total = state.subtotal + state.tax + state.shipping;
};

const saveCartToStorage = (state: CartState): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("cart", JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
};

// Load cart from localStorage (keep existing function)
const loadCartFromStorage = (): CartState | null => {
  if (typeof window === "undefined") return null;
  try {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch (error) {
    console.error("Failed to load cart from localStorage:", error);
  }
  return null;
};

const initialState: CartState = loadCartFromStorage() || {
  items: [],
  totalItems: 0,
  subtotal: 0,
  tax: 0,
  taxRate: 14,
  shipping: 0,
  total: 0,
  isOpen: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Keep your existing addToCart for products
    addToCart: (
      state,
      action: PayloadAction<{
        product: ProductType;
        quantity: number;
        selectedVariations: CartVariationOption[];
      }>
    ) => {
      const { product, quantity, selectedVariations } = action.payload;

      const basePrice =
        product.discount_price &&
        parseFloat(product.discount_price.toString()) > 0
          ? parseFloat(product.discount_price.toString())
          : parseFloat(product.price.toString());

      let itemPrice = basePrice;
      selectedVariations.forEach((variation) => {
        itemPrice += variation.extraPrice;
      });

      const cartItemId = generateCartItemId(
        "item",
        product.id,
        selectedVariations
      );

      const existingItemIndex = state.items.findIndex(
        (item) => item.id === cartItemId
      );

      if (existingItemIndex >= 0) {
        state.items[existingItemIndex].quantity += quantity;
      } else {
        state.items.push({
          id: cartItemId,
          type: "item",
          productId: product.id,
          name: product.name,
          price: itemPrice,
          basePrice: basePrice,
          quantity,
          image: product.product_image,
          slug: product.slug,
          selectedVariations,
        });
      }

      recalculateCart(state);
      saveCartToStorage(state);
    },

    // Add new action for services
    addServiceToCart: (
      state,
      action: PayloadAction<{
        service: Service;
        quantity: number;
        booking?: CartServiceBooking;
      }>
    ) => {
      const { service, quantity, booking } = action.payload;

      const servicePrice = parseFloat(service.price.toString());

      // For booking services, each booking is unique even for the same service
      const cartItemId = generateCartItemId(
        "service",
        service.id,
        [],
        booking?.scheduledTime
      );

      // For booking services, don't combine items - each booking is separate
      if (service.requires_booking || booking) {
        state.items.push({
          id: cartItemId,
          type: "service",
          serviceId: service.id,
          name: service.name,
          price: servicePrice,
          basePrice: servicePrice,
          quantity,
          image: service.image || "",
          slug: service.slug,
          selectedVariations: [],
          requiresBooking: service.requires_booking,
          booking,
        });
      } else {
        // For non-booking services, check if already exists
        const existingItemIndex = state.items.findIndex(
          (item) => item.id === cartItemId
        );

        if (existingItemIndex >= 0) {
          state.items[existingItemIndex].quantity += quantity;
        } else {
          state.items.push({
            id: cartItemId,
            type: "service",
            serviceId: service.id,
            name: service.name,
            price: servicePrice,
            basePrice: servicePrice,
            quantity,
            image: service.image || "",
            slug: service.slug,
            selectedVariations: [],
            requiresBooking: service.requires_booking,
          });
        }
      }

      recalculateCart(state);
      saveCartToStorage(state);
    },

    // Keep all your existing reducers
    updateQuantity: (
      state,
      action: PayloadAction<{ itemId: string; quantity: number }>
    ) => {
      const { itemId, quantity } = action.payload;
      const itemIndex = state.items.findIndex((item) => item.id === itemId);

      if (itemIndex >= 0) {
        if (quantity > 0) {
          state.items[itemIndex].quantity = quantity;
        } else {
          state.items.splice(itemIndex, 1);
        }
        recalculateCart(state);
        saveCartToStorage(state);
      }
    },

    removeItem: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
      recalculateCart(state);
      saveCartToStorage(state);
    },

    clearCart: (state) => {
      state.items = [];
      recalculateCart(state);
      saveCartToStorage(state);
    },

    updateShipping: (state, action: PayloadAction<number>) => {
      state.shipping = action.payload;
      recalculateCart(state);
      saveCartToStorage(state);
    },

    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },

    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },

    hydrateCart: (state) => {
      const savedCart = loadCartFromStorage();
      if (savedCart) {
        state.items = savedCart.items;
        state.totalItems = savedCart.totalItems;
        state.subtotal = savedCart.subtotal;
        state.tax = savedCart.tax;
        state.taxRate = savedCart.taxRate;
        state.shipping = savedCart.shipping;
        state.total = savedCart.total;
        state.isOpen = false;
      }
    },

    setPersonAssignment: (
      state,
      action: PayloadAction<{ itemId: string; name: string }>
    ) => {
      const itemIndex = state.items.findIndex(
        (item) => item.id === action.payload.itemId
      );

      state.items[itemIndex].person_name = action.payload.name;
      saveCartToStorage(state);
    },
    setItemPaymentStatus: (
      state,
      action: PayloadAction<{
        itemId: string;
        isPaid: boolean;
        paidAmount: number;
      }>
    ) => {
      const itemIndex = state.items.findIndex(
        (item) => item.id === action.payload.itemId
      );

      state.items[itemIndex].itemPaymentStatus = {
        isPaid: action.payload.isPaid,
        paidAmount: action.payload.paidAmount,
      };

      saveCartToStorage(state);
    },
  },
});

export const {
  addToCart,
  addServiceToCart, // Export the new action
  updateQuantity,
  removeItem,
  clearCart,
  updateShipping,
  toggleCart,
  setCartOpen,
  hydrateCart,
  setPersonAssignment,
  setItemPaymentStatus,
} = cartSlice.actions;

export default cartSlice.reducer;
