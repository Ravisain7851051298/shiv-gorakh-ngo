import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/authApi";
import getUserFacingError from "@/lib/getUserFacingError";

function getErrorMessage(error) {
  return getUserFacingError(error, "Unable to complete the request.");
}

export const register = createAsyncThunk(
  "auth/register",
  async (details, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/v1/auth/register", details);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/v1/auth/login", credentials);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const refreshSession = createAsyncThunk(
  "auth/refreshSession",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/v1/auth/refresh-token");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/api/v1/auth/logout");
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (formDataOrData, { rejectWithValue }) => {
    try {
      const isFormData = typeof FormData !== "undefined" && formDataOrData instanceof FormData;
      const config = isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
      const { data } = await api.patch("/api/v1/auth/profile", formDataOrData, config);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/v1/auth/forgot-password", { email });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password, confirmPassword }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/v1/auth/reset-password", {
        token,
        password,
        confirmPassword,
      });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const initialState = {
  user: null,
  accessToken: null,
  initialized: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(state, action) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.initialized = true;
      state.error = null;
    },
    clearSession(state) {
      state.user = null;
      state.accessToken = null;
      state.initialized = true;
      state.loading = false;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.initialized = true;
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.initialized = true;
        state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.initialized = true;
      })
      .addCase(refreshSession.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.initialized = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.initialized = true;
        state.loading = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.user = null;
        state.accessToken = null;
        state.initialized = true;
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAuthError, clearSession, setSession } = authSlice.actions;
export default authSlice.reducer;
