import type { TableArea, Table } from "~/types/dataTypes";
import api from "../api";

const tableApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTableAreas: builder.query<TableArea[], void>({
      query: () => "tables/areas/",
      providesTags: ["Tables"],
    }),

    getTables: builder.query<Table[], void>({
      query: () => "tables/",
      providesTags: ["Tables"],
    }),

    getAvailableTables: builder.query<Table[], number | undefined>({
      query: (areaId) => ({
        url: "tables/available/",
        params: areaId ? { area_id: areaId } : {},
      }),
      providesTags: ["Tables"],
    }),

    updateTableStatus: builder.mutation<
      any,
      { tableId: number; action: string }
    >({
      query: ({ tableId, action }) => ({
        url: `tables/${tableId}/status/`,
        method: "POST",
        body: { action },
      }),
      invalidatesTags: ["Tables"],
    }),

    orderStats: builder.query<any, void>({
      query: () => "orders/stats/",
      providesTags: ["OrderStats"],
    }),
  }),
});

export const {
  useGetTableAreasQuery,
  useGetTablesQuery,
  useGetAvailableTablesQuery,
  useUpdateTableStatusMutation,
  useOrderStatsQuery,
} = tableApi;
