import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getEvents, getGalleries, getStories } from "@/lib/contentService";

export const fetchGalleries = createAsyncThunk(
  "content/fetchGalleries",
  async (params, { rejectWithValue }) => {
    const res = await getGalleries(params);
    if (!res.success) return rejectWithValue(res.error);
    return res;
  }
);

export const fetchStories = createAsyncThunk(
  "content/fetchStories",
  async (params, { rejectWithValue }) => {
    const res = await getStories(params);
    if (!res.success) return rejectWithValue(res.error);
    return res;
  }
);

export const fetchEvents = createAsyncThunk(
  "content/fetchEvents",
  async (params, { rejectWithValue }) => {
    const res = await getEvents(params);
    if (!res.success) return rejectWithValue(res.error);
    return res;
  }
);

const initialState = {
  galleries: { items: [], loading: false, error: null, loaded: false },
  stories: { items: [], loading: false, error: null, loaded: false },
  events: { items: [], loading: false, error: null, loaded: false },
};

const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Galleries
      .addCase(fetchGalleries.pending, (state) => {
        state.galleries.loading = true;
        state.galleries.error = null;
      })
      .addCase(fetchGalleries.fulfilled, (state, action) => {
        state.galleries.loading = false;
        state.galleries.items = action.payload.items;
        state.galleries.loaded = true;
      })
      .addCase(fetchGalleries.rejected, (state, action) => {
        state.galleries.loading = false;
        state.galleries.error = action.payload || "Failed to load galleries";
      })
      // Stories
      .addCase(fetchStories.pending, (state) => {
        state.stories.loading = true;
        state.stories.error = null;
      })
      .addCase(fetchStories.fulfilled, (state, action) => {
        state.stories.loading = false;
        state.stories.items = action.payload.items;
        state.stories.loaded = true;
      })
      .addCase(fetchStories.rejected, (state, action) => {
        state.stories.loading = false;
        state.stories.error = action.payload || "Failed to load stories";
      })
      // Events
      .addCase(fetchEvents.pending, (state) => {
        state.events.loading = true;
        state.events.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.events.loading = false;
        state.events.items = action.payload.items;
        state.events.loaded = true;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.events.loading = false;
        state.events.error = action.payload || "Failed to load events";
      });
  },
});

export default contentSlice.reducer;
