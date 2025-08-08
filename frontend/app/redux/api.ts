import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { RootState } from "./store";
import { GetBaseUrl } from "~/lib/utils";

// import { getAPIUrl } from '../utils/Utils';

const baseQuery = fetchBaseQuery({
  baseUrl: GetBaseUrl(),

  prepareHeaders: (headers, { getState }) => {
    // By default, if we have a token in the store, let's use that for authenticated requests

    const { token } = (getState() as RootState).auth;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// const baseQueryWithRetry = retry(baseQuery, { maxRetries: 6 })

const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "Categories",
    "MenuItem",
    "Orders",
    "Tables",
    "Services",
    "OrderStats",
  ],
  endpoints: () => ({}),
});

export default api;
