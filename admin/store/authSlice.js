import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/lib/authApi";

function errorMessage(error) {
  return error.response?.data?.message || error.message || "Unable to complete the request.";
}

function validateSession(data) {
  if (data?.success === false) {
    throw new Error(data.message || "Authentication request failed.");
  }
  if (!data?.user || typeof data.accessToken !== "string" || !data.accessToken) {
    throw new Error(data?.message || "The authentication server returned an invalid session.");
  }
  return { user: data.user, accessToken: data.accessToken };
}

export const adminLogin = createAsyncThunk("auth/adminLogin", async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/login", credentials);
    return validateSession(data);
  } catch (error) {
    return rejectWithValue(errorMessage(error));
  }
});

export const adminRegister = createAsyncThunk("auth/adminRegister", async ({ adminSecret, ...details }, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/register", details, {
      headers: { "x-admin-secret-key": adminSecret },
    });
    return validateSession(data);
  } catch (error) {
    return rejectWithValue(errorMessage(error));
  }
});

export const refreshSession = createAsyncThunk("auth/refreshSession", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/refresh-token");
    return validateSession(data);
  } catch (error) {
    return rejectWithValue(errorMessage(error));
  }
});

export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await api.post("/logout");
  } catch (error) {
    return rejectWithValue(errorMessage(error));
  }
});

export const forgotPassword = createAsyncThunk("auth/forgotPassword", async ({ email }, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/forgot-password", { email });
    return data;
  } catch (error) {
    return rejectWithValue(errorMessage(error));
  }
});

export const resetPassword = createAsyncThunk("auth/resetPassword", async ({ token, password, confirmPassword }, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/reset-password", { token, password, confirmPassword });
    return data;
  } catch (error) {
    return rejectWithValue(errorMessage(error));
  }
});

export const updateProfile = createAsyncThunk("auth/updateProfile", async (formDataOrData, { rejectWithValue }) => {
  try {
    const isFormData = typeof FormData !== "undefined" && formDataOrData instanceof FormData;
    const config = isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
    const { data } = await api.patch("/profile", formDataOrData, config);
    return data;
  } catch (error) {
    return rejectWithValue(errorMessage(error));
  }
});

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
  },
  extraReducers(builder) {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.initialized = true;
        state.loading = false;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(adminRegister.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminRegister.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.initialized = true;
        state.loading = false;
      })
      .addCase(adminRegister.rejected, (state, action) => {
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
        state.loading = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.initialized = true;
      })
      .addCase(logout.rejected, (state, action) => {
        state.user = null;
        state.accessToken = null;
        state.initialized = true;
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

export const { clearSession, setSession } = authSlice.actions;
export default authSlice.reducer;
