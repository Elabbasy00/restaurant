import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { toast } from "sonner";
import axiosInstance, { setAxiosAuthToken } from "~/lib/axiosInstance";
import { isAxiosError, toastOnError } from "~/lib/utils";
import type { APIErrorType, User, UserCredential } from "~/types/dataTypes";

interface State {
  user: User | null;
  error: unknown;
  isAuthenticated: boolean;
  token: string;
  AuthSuccessLoading: boolean;
  loading: boolean;
  permissionsLoaded: boolean;
  initialized: boolean; // Add this to track if auth has been initialized
}

export const authSuccess = createAsyncThunk(
  "auth/setToken",
  async (token: string) => {
    setAxiosAuthToken(token);
    localStorage.setItem("token", token);
    return token;
  }
);

export const getCurrentUser = createAsyncThunk(
  "auth/getUser",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.get("auth/me/");
      dispatch(setCurrentUser(response.data));
      return response.data;
    } catch (error: unknown) {
      // Don't dispatch logout here to avoid infinite loops
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAxiosAuthToken("");

      if (isAxiosError(error) && error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("خطأ غير معروف حدث");
    }
  }
);

export const setCurrentUser = createAsyncThunk(
  "auth/setUser",
  async (user: User) => {
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  }
);

export const unSetCurrentUser = createAsyncThunk("auth/unSetUser", async () => {
  setAxiosAuthToken("");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
});

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("auth/jwt/logout/");
      dispatch(unSetCurrentUser());
      return response.data;
    } catch (error: unknown) {
      dispatch(unSetCurrentUser());
      if (isAxiosError(error) && error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("خطأ غير معروف حدث");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (userData: UserCredential, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("auth/jwt/login/", userData);

      const { access } = response.data;
      setAxiosAuthToken(access);
      dispatch(authSuccess(access));

      // Get user data after successful login
      await dispatch(getCurrentUser()).unwrap();

      toast.success("تم تسجيل الدخول بنجاح");
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.data) {
        toastOnError(error.response.data as APIErrorType);
      }
      dispatch(unSetCurrentUser());
      if (isAxiosError(error) && error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("خطأ غير معروف حدث");
    }
  }
);

export const ChangeUserPassword = createAsyncThunk(
  "auth/ChangeUserPassword",
  async (newPass: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "auth/users/set_password/",
        newPass
      );
      toast.success("تم تغيير كلمة المرور بنجاح");
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("خطأ غير معروف حدث");
    }
  }
);

export const ChangeUserDetail = createAsyncThunk(
  "auth/ChangeUserDetail",
  async (userInfo: Record<string, unknown>, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.put("auth/me/", userInfo);
      toast.success("تم تعديل المعلومات بنجاح");
      dispatch(getCurrentUser());
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue("خطأ غير معروف حدث");
    }
  }
);

const initialState: State = {
  loading: false,
  error: null,
  user: null,
  isAuthenticated: false,
  token: "",
  AuthSuccessLoading: false,
  permissionsLoaded: false,
  initialized: false,
};

const authReducer = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Add action to mark auth as initialized
    setInitialized: (state) => {
      state.initialized = true;
    },
    // Add action to clear errors
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.token = "";
        state.permissionsLoaded = false;
        state.user = null;
      })
      .addCase(authSuccess.pending, (state) => {
        state.AuthSuccessLoading = true;
      })
      .addCase(authSuccess.fulfilled, (state, action) => {
        state.token = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        state.AuthSuccessLoading = false;
      })
      .addCase(authSuccess.rejected, (state) => {
        state.AuthSuccessLoading = false;
        state.isAuthenticated = false;
        state.token = "";
        state.initialized = true;
      })
      .addCase(getCurrentUser.pending, (state) => {
        // Don't set loading if we're already authenticated
        if (!state.isAuthenticated) {
          state.AuthSuccessLoading = true;
        }
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.error = null;
        state.loading = false;
        state.AuthSuccessLoading = false;
        state.user = action.payload;
        state.permissionsLoaded = true;
        state.initialized = true;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
        state.AuthSuccessLoading = false;
        state.user = null;
        state.permissionsLoaded = false;
        state.isAuthenticated = false;
        state.token = "";
        state.initialized = true;
      })
      .addCase(logout.fulfilled, () => {
        return { ...initialState, initialized: true };
      })
      .addCase(unSetCurrentUser.fulfilled, () => {
        return { ...initialState, initialized: true };
      });
  },
});

export const { setInitialized, clearError } = authReducer.actions;
export default authReducer.reducer;
