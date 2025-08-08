import { configureStore, type ConfigureStoreOptions } from "@reduxjs/toolkit";
import {
  Provider,
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import cartReducer, { hydrateCart } from "./cart/cartSlice";
import orderReducer from "./order/orderSlice";
import api from "./api";
import { useEffect } from "react";
import authReducer from "./login-slice/login.slice";
// Component to handle cart hydration
const CartHydration = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Hydrate cart from localStorage on initial load
    dispatch(hydrateCart());
  }, [dispatch]);

  return null;
};

export const createStore = (
  options?: ConfigureStoreOptions["preloadedState"] | undefined
) =>
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      cart: cartReducer,
      order: orderReducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
      }).concat(api.middleware),
    ...options,
  });

export const store = createStore();

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <CartHydration />

      {children}
    </Provider>
  );
}

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
