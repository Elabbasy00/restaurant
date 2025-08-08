import type { Category, ProductType } from "~/types/dataTypes";
import api from "../api";

const menuSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getCategoryList: builder.query<Category[], void>({
      query: () => `menu/categories`,
      providesTags: ["Categories"],
    }),

    getProductDetail: builder.query<ProductType, string | undefined>({
      query: (slug) => `menu/menu-items/${slug}`,
      providesTags: (result, error, slug) => [{ type: "MenuItem", id: slug }],
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetCategoryListQuery, useGetProductDetailQuery } = menuSlice;
