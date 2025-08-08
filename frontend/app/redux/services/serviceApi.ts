import type { ServiceCategory, Service } from "~/types/dataTypes";
import api from "../api";

const serviceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getServiceCategories: builder.query<ServiceCategory[], void>({
      query: () => "services/categories/",
      providesTags: ["Services"],
    }),

    getServices: builder.query<Service[], void>({
      query: () => "services/",
      providesTags: ["Services"],
    }),

    getServiceBySlug: builder.query<Service, string>({
      query: (slug) => `services/${slug}/`,
      providesTags: (result, error, slug) => [{ type: "Services", id: slug }],
    }),

    getServiceAvailability: builder.query<
      any,
      { serviceId: number; date: string }
    >({
      query: ({ serviceId, date }) => ({
        url: `services/${serviceId}/availability/`,
        params: { date },
      }),
    }),

    createServiceBooking: builder.mutation<any, any>({
      query: (bookingData) => ({
        url: "services/bookings/",
        method: "POST",
        body: bookingData,
      }),
      invalidatesTags: ["Services"],
    }),
  }),
});

export const {
  useGetServiceCategoriesQuery,
  useGetServicesQuery,
  useGetServiceBySlugQuery,
  useGetServiceAvailabilityQuery,
  useCreateServiceBookingMutation,
} = serviceApi;
