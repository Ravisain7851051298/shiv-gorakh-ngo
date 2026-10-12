import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/authApi";
import getUserFacingError from "@/lib/getUserFacingError";
import { clearSession, login, logout, refreshSession, register } from "@/store/authSlice";

const profileEndpoint = "/api/v1/membership/me";

function getErrorMessage(error) {
  return getUserFacingError(
    error,
    "Unable to complete the membership request.",
  );
}

function getMembershipFromResponse(data) {
  return data?.membership ?? data?.data?.membership ?? data?.data ?? data;
}

export const fetchMembership = createAsyncThunk(
  "membership/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(profileEndpoint);
      return getMembershipFromResponse(data);
    } catch (error) {
      if (error.response?.status === 404) return null;
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const { profileStatus } = getState().membership;
      return profileStatus !== "loading" && profileStatus !== "succeeded";
    },
  },
);

export const registerMembership = createAsyncThunk(
  "membership/register",
  async (details, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/v1/membership/register", details);
      const responseMembership = getMembershipFromResponse(data);
      return responseMembership && typeof responseMembership === "object"
        ? responseMembership
        : details;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateMembership = createAsyncThunk(
  "membership/update",
  async (details, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(profileEndpoint, details);
      const responseMembership = getMembershipFromResponse(data);
      return {
        ...details,
        ...(responseMembership && typeof responseMembership === "object"
          ? responseMembership
          : {}),
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteMembership = createAsyncThunk(
  "membership/delete",
  async (_, { rejectWithValue }) => {
    try {
      await api.delete(profileEndpoint);
      return true;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const initialState = {
  profile: null,
  profileStatus: "idle",
  loading: false,
  error: null,
};

const membershipSlice = createSlice({
  name: "membership",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchMembership.pending, (state) => {
        state.profileStatus = "loading";
        state.error = null;
      })
      .addCase(fetchMembership.fulfilled, (state, action) => {
        state.profileStatus = "succeeded";
        state.profile = action.payload;
      })
      .addCase(fetchMembership.rejected, (state, action) => {
        state.profileStatus = "failed";
        state.error = action.payload;
      })
      .addCase(registerMembership.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerMembership.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.profileStatus = "succeeded";
      })
      .addCase(registerMembership.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateMembership.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMembership.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = { ...state.profile, ...action.payload };
        state.profileStatus = "succeeded";
      })
      .addCase(updateMembership.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteMembership.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMembership.fulfilled, (state) => {
        state.loading = false;
        state.profile = null;
        state.profileStatus = "succeeded";
      })
      .addCase(deleteMembership.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearSession, () => initialState)
      .addCase(logout.fulfilled, () => initialState)
      .addCase(logout.rejected, () => initialState)
      .addCase(login.fulfilled, () => initialState)
      .addCase(register.fulfilled, () => initialState)
      .addCase(refreshSession.fulfilled, () => initialState);
  },
});

export default membershipSlice.reducer;
