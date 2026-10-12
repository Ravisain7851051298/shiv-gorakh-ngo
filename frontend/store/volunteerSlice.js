import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/authApi";
import getUserFacingError from "@/lib/getUserFacingError";
import { clearSession, login, logout, refreshSession, register } from "@/store/authSlice";

const endpoint = "/api/v1/volunteer";

function getErrorMessage(error) {
  return getUserFacingError(
    error,
    "Unable to complete the volunteer request.",
  );
}

function getProfileFromResponse(data) {
  return data?.volunteer ?? data?.data?.volunteer ?? data?.data ?? data;
}

export const fetchVolunteer = createAsyncThunk(
  "volunteer/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`${endpoint}/me`);
      return getProfileFromResponse(data);
    } catch (error) {
      if (error.response?.status === 404) return null;
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const { profileStatus } = getState().volunteer;
      return profileStatus !== "loading" && profileStatus !== "succeeded";
    },
  },
);

export const registerVolunteer = createAsyncThunk(
  "volunteer/register",
  async (details, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`${endpoint}/register`, details);
      const responseProfile = getProfileFromResponse(data);
      return responseProfile && typeof responseProfile === "object"
        ? responseProfile
        : details;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateVolunteer = createAsyncThunk(
  "volunteer/update",
  async (details, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`${endpoint}/me`, details);
      const responseProfile = getProfileFromResponse(data);
      return {
        ...details,
        ...(responseProfile && typeof responseProfile === "object"
          ? responseProfile
          : {}),
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteVolunteer = createAsyncThunk(
  "volunteer/delete",
  async (_, { rejectWithValue }) => {
    try {
      await api.delete(`${endpoint}/me`);
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

const volunteerSlice = createSlice({
  name: "volunteer",
  initialState,
  reducers: {
    clearVolunteerError(state) {
      state.error = null;
    },
    clearVolunteerProfile(state) {
      state.profile = null;
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchVolunteer.pending, (state) => {
        state.profileStatus = "loading";
        state.error = null;
      })
      .addCase(fetchVolunteer.fulfilled, (state, action) => {
        state.profileStatus = "succeeded";
        state.profile = action.payload;
      })
      .addCase(fetchVolunteer.rejected, (state, action) => {
        state.profileStatus = "failed";
        state.error = action.payload;
      })
      .addCase(registerVolunteer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerVolunteer.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.profileStatus = "succeeded";
      })
      .addCase(registerVolunteer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateVolunteer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVolunteer.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = { ...state.profile, ...action.payload };
        state.profileStatus = "succeeded";
      })
      .addCase(updateVolunteer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteVolunteer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVolunteer.fulfilled, (state) => {
        state.loading = false;
        state.profile = null;
        state.profileStatus = "succeeded";
      })
      .addCase(deleteVolunteer.rejected, (state, action) => {
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

export const { clearVolunteerError, clearVolunteerProfile } = volunteerSlice.actions;
export default volunteerSlice.reducer;
