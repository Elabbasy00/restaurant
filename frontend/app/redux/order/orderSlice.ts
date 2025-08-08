import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  Table,
  Service,
  CartService,
  PersonAssignment,
} from "~/types/dataTypes";

interface OrderState {
  selectedTable: Table | null;
  customerInfo: {
    name: string;
    phone: string;
  };
  taxEnabled: boolean;

  currentOrderId: number | null;
  // Services in cart
  services: CartService[];
  // Person assignments for items
  itemPersonAssignments: Record<string, PersonAssignment>;
  // Payment tracking for items
  itemPaymentStatus: Record<string, { isPaid: boolean; paidAmount: number }>;
  // Payment tracking for services
  servicePaymentStatus: Record<string, { isPaid: boolean; paidAmount: number }>;
}

const initialState: OrderState = {
  selectedTable: null,

  customerInfo: {
    name: "",
    phone: "",
  },
  taxEnabled: true,

  currentOrderId: null,
  services: [],
  itemPersonAssignments: {},
  itemPaymentStatus: {},
  servicePaymentStatus: {},
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setSelectedTable: (state, action: PayloadAction<Table | null>) => {
      state.selectedTable = action.payload;
    },

    setCustomerInfo: (
      state,
      action: PayloadAction<Partial<typeof initialState.customerInfo>>
    ) => {
      state.customerInfo = { ...state.customerInfo, ...action.payload };
    },

    setTaxEnabled: (state, action: PayloadAction<boolean>) => {
      state.taxEnabled = action.payload;
    },

    setCurrentOrderId: (state, action: PayloadAction<number | null>) => {
      state.currentOrderId = action.payload;
    },

    // Service management
    addService: (state, action: PayloadAction<Omit<CartService, "id">>) => {
      const service = {
        ...action.payload,
        id: `service-${action.payload.serviceId}-${Date.now()}`,
      };
      state.services.push(service);
    },

    updateServiceQuantity: (
      state,
      action: PayloadAction<{ serviceId: string; quantity: number }>
    ) => {
      const service = state.services.find(
        (s) => s.id === action.payload.serviceId
      );
      if (service) {
        service.quantity = action.payload.quantity;
      }
    },

    removeService: (state, action: PayloadAction<string>) => {
      state.services = state.services.filter((s) => s.id !== action.payload);
      delete state.servicePaymentStatus[action.payload];
    },

    updateServiceNotes: (
      state,
      action: PayloadAction<{ serviceId: string; notes: string }>
    ) => {
      const service = state.services.find(
        (s) => s.id === action.payload.serviceId
      );
      if (service) {
        service.notes = action.payload.notes;
      }
    },

    // Person assignments
    setItemPersonAssignment: (
      state,
      action: PayloadAction<{ itemId: string; person: PersonAssignment }>
    ) => {
      state.itemPersonAssignments[action.payload.itemId] =
        action.payload.person;
    },

    setServicePersonAssignment: (
      state,
      action: PayloadAction<{ serviceId: string; person: PersonAssignment }>
    ) => {
      const service = state.services.find(
        (s) => s.id === action.payload.serviceId
      );
      if (service) {
        service.personAssignment = action.payload.person;
      }
    },

    // Payment tracking
    setItemPaymentStatus: (
      state,
      action: PayloadAction<{
        itemId: string;
        isPaid: boolean;
        paidAmount: number;
      }>
    ) => {
      state.itemPaymentStatus[action.payload.itemId] = {
        isPaid: action.payload.isPaid,
        paidAmount: action.payload.paidAmount,
      };
    },

    deleteCartItem: (state, action: PayloadAction<string>) => {
      state.services = state.services.filter((s) => s.id !== action.payload);
    },

    setServicePaymentStatus: (
      state,
      action: PayloadAction<{
        serviceId: string;
        isPaid: boolean;
        paidAmount: number;
      }>
    ) => {
      state.servicePaymentStatus[action.payload.serviceId] = {
        isPaid: action.payload.isPaid,
        paidAmount: action.payload.paidAmount,
      };
    },

    resetOrder: (state) => {
      return initialState;
    },
  },
});

export const {
  setSelectedTable,

  setCustomerInfo,
  setTaxEnabled,

  setCurrentOrderId,
  addService,
  updateServiceQuantity,
  removeService,
  updateServiceNotes,
  setItemPersonAssignment,
  setServicePersonAssignment,
  setItemPaymentStatus,
  setServicePaymentStatus,
  resetOrder,
} = orderSlice.actions;

export default orderSlice.reducer;
