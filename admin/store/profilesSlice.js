import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { contentApi } from "@/lib/authApi";

function requestError(error) {
  return error.response?.data?.message || error.message || "Unable to complete the request.";
}

function createProfileThunks(resource) {
  const collectionUrl = `/admin/${resource}/`;

  return {
    fetchAll: createAsyncThunk(`${resource}/fetchAll`, async (params = {}, { rejectWithValue }) => {
      try {
        const { data } = await contentApi.get(collectionUrl, { params });
        console.log("data", data);
        return data;
      } catch (error) {
        return rejectWithValue(requestError(error));
      }
    }),
    fetchById: createAsyncThunk(`${resource}/fetchById`, async (id, { rejectWithValue }) => {
      try {
        const { data } = await contentApi.get(`${collectionUrl}${encodeURIComponent(id)}/`);
        return data;
      } catch (error) {
        return rejectWithValue(requestError(error));
      }
    }),
    update: createAsyncThunk(`${resource}/update`, async ({ id, changes }, { rejectWithValue }) => {
      try {
        const { data } = await contentApi.patch(`${collectionUrl}${encodeURIComponent(id)}/`, changes);
        return { id, data };
      } catch (error) {
        return rejectWithValue(requestError(error));
      }
    }),
    remove: createAsyncThunk(`${resource}/remove`, async (id, { rejectWithValue }) => {
      try {
        await contentApi.delete(`${collectionUrl}${encodeURIComponent(id)}/`);
        return id;
      } catch (error) {
        return rejectWithValue(requestError(error));
      }
    }),
  };
}

function getPayload(response) {
  let payload = response?.data ?? response;
  if (payload?.data !== undefined) payload = payload.data;
  return payload;
}

function unwrapProfile(response) {
  const payload = getPayload(response);
  return payload?.profile ?? payload?.volunteer ?? payload?.membership ?? payload?.item ?? payload;
}

function unwrapProfiles(response) {
  const payload = getPayload(response);
  const records = Array.isArray(payload)
    ? payload
    : payload?.profiles ?? payload?.items ?? payload?.results ?? payload?.volunteers ?? payload?.memberships ?? [];
  const pagination = payload?.pagination ?? payload?.meta ?? response?.pagination ?? response?.meta ?? {};
  return { records, pagination };
}

function profileId(profile) {
  const id = profile?._id ?? profile?.id;
  return id == null ? undefined : String(id);
}

function createProfileSlice(name, thunks) {
  const slice = createSlice({
    name,
    initialState: {
      items: [],
      currentProfile: null,
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      loading: false,
      detailLoading: false,
      mutationLoading: false,
      error: null,
    },
    reducers: {
      clearProfileError(state) {
        state.error = null;
      },
      clearCurrentProfile(state) {
        state.currentProfile = null;
      },
    },
    extraReducers(builder) {
      builder
        .addCase(thunks.fetchAll.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(thunks.fetchAll.fulfilled, (state, action) => {
          const result = unwrapProfiles(action.payload);
          state.items = result.records;
          state.pagination = { ...state.pagination, ...result.pagination };
          state.loading = false;
        })
        .addCase(thunks.fetchAll.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        })
        .addCase(thunks.fetchById.pending, (state) => {
          state.detailLoading = true;
          state.currentProfile = null;
          state.error = null;
        })
        .addCase(thunks.fetchById.fulfilled, (state, action) => {
          state.currentProfile = unwrapProfile(action.payload);
          state.detailLoading = false;
        })
        .addCase(thunks.fetchById.rejected, (state, action) => {
          state.detailLoading = false;
          state.error = action.payload || action.error.message;
        })
        .addCase(thunks.update.pending, (state) => {
          state.mutationLoading = true;
          state.error = null;
        })
        .addCase(thunks.update.fulfilled, (state, action) => {
          const updated = unwrapProfile(action.payload.data);
          const id = profileId(updated) ?? String(action.payload.id);
          const index = state.items.findIndex((item) => profileId(item) === id);
          if (index !== -1) state.items[index] = updated;
          if (profileId(state.currentProfile) === id) state.currentProfile = updated;
          state.mutationLoading = false;
        })
        .addCase(thunks.update.rejected, (state, action) => {
          state.mutationLoading = false;
          state.error = action.payload || action.error.message;
        })
        .addCase(thunks.remove.pending, (state) => {
          state.mutationLoading = true;
          state.error = null;
        })
        .addCase(thunks.remove.fulfilled, (state, action) => {
          const deletedId = String(action.payload);
          state.items = state.items.filter((item) => profileId(item) !== deletedId);
          if (profileId(state.currentProfile) === deletedId) state.currentProfile = null;
          if (state.pagination && typeof state.pagination.total === "number") {
            state.pagination.total = Math.max(0, state.pagination.total - 1);
          }
          state.mutationLoading = false;
        })
        .addCase(thunks.remove.rejected, (state, action) => {
          state.mutationLoading = false;
          state.error = action.payload || action.error.message;
        });
    },
  });

  return { reducer: slice.reducer, actions: slice.actions };
}

export const volunteerThunks = createProfileThunks("volunteers");
export const membershipThunks = createProfileThunks("memberships");

const volunteerSlice = createProfileSlice("volunteers", volunteerThunks);
const membershipSlice = createProfileSlice("memberships", membershipThunks);

export const {
  fetchAll: fetchVolunteers,
  fetchById: fetchVolunteerById,
  update: updateVolunteer,
  remove: deleteVolunteer,
} = volunteerThunks;
export const {
  fetchAll: fetchMemberships,
  fetchById: fetchMembershipById,
  update: updateMembership,
  remove: deleteMembership,
} = membershipThunks;

export const { clearProfileError: clearVolunteerError, clearCurrentProfile: clearCurrentVolunteer } = volunteerSlice.actions;
export const { clearProfileError: clearMembershipError, clearCurrentProfile: clearCurrentMembership } = membershipSlice.actions;

export const volunteerReducer = volunteerSlice.reducer;
export const membershipReducer = membershipSlice.reducer;
