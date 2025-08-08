import api from "../api";
import type { Order, OrderData, PaginationType } from "~/types/dataTypes";

interface Filters {
  limit: number;
  offset: number;
  search: string;
  search_table: string;
  ref_code: string;
  tax_enabled: boolean | null;
  payment_status: string;

  created_at: string;
}

interface OrderItemUpdateProps {
  person_name?: string;
  type: string;
  is_paid?: boolean;
  paid_amount?: number;
  order_id: number;
  order_item_id: number;
}

const orderApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<any, OrderData>({
      query: (orderData) => ({
        url: "orders/create/",
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: ["Orders"],
    }),

    getOrders: builder.query<PaginationType<Order>, Filters>({
      query: (data) =>
        `orders/list/?limit=${data.limit}&offset=${data.offset}&search=${data.search}&search_table=${data.search_table}&tax_enabled=${data.tax_enabled}&payment_status=${data.payment_status}&created_at=${data.created_at}&ref_code=${data.ref_code}`,
      providesTags: ["Orders"],
    }),

    getOrderById: builder.query<any, number>({
      query: (id) => `orders/${id}/`,
      providesTags: (result, error, id) => [{ type: "Orders", id }],
    }),

    getPaymentSplit: builder.query<any, number>({
      query: (orderId) => `orders/split-payment/${orderId}/`,
    }),

    updateOrderPayment: builder.mutation<
      any,
      { orderId: number; paymentStatus: string }
    >({
      query: ({ orderId, paymentStatus }) => ({
        url: `orders/${orderId}/update-payment/`,
        method: "PATCH",
        body: { payment_status: paymentStatus },
      }),
      invalidatesTags: ["Orders"],
    }),

    updateOrderItem: builder.mutation<any, OrderItemUpdateProps>({
      query: (data) => ({
        url: `orders/order-item/update/${data.order_item_id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Orders", id: arg.order_item_id },
      ],
    }),

    cancelOrder: builder.mutation<any, number>({
      query: (orderId) => ({
        url: `orders/cancel/${orderId}/`,
        method: "POST",
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderPaymentMutation,
  useGetPaymentSplitQuery,
  useUpdateOrderItemMutation,
  useCancelOrderMutation,
} = orderApi;
