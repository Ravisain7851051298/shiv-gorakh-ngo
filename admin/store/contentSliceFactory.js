import { createSlice } from "@reduxjs/toolkit";

function unwrapEntity(response) {
  const body = response?.data?.data ?? response?.data ?? response;
  return (
    body?.item ??
    body?.program ??
    body?.blog ??
    body?.campaign ??
    body?.certificate ??
    body?.story ??
    body?.gallery ??
    body?.gallary ??
    body?.event ??
    body
  );
}

function unwrapList(response) {
  const payload = response?.data ?? response;
  const body = payload?.data ?? payload;
  const records = Array.isArray(body)
    ? body
    : body?.items ??
      body?.results ??
      body?.programs ??
      body?.blogs ??
      body?.news ??
      body?.campaigns ??
      body?.certificates ??
      body?.stories ??
      body?.galleries ??
      body?.gallaries ??
      body?.events ??
      [];
  const pagination =
    body?.pagination ??
    body?.meta ??
    payload?.pagination ??
    payload?.meta ??
    response?.pagination ??
    response?.meta ??
    {};
  return { records, pagination };
}

function getEntityId(entity) {
  const id = entity?._id ?? entity?.id;
  return id === undefined || id === null ? undefined : String(id);
}

export function createContentSlice({ name, thunks }) {
  const slice = createSlice({
    name,
    initialState: {
      items: [],
      currentItem: null,
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      loading: false,
      detailLoading: false,
      mutationLoading: false,
      error: null,
    },
    reducers: {
      clearContentError(state) {
        state.error = null;
      },
      clearCurrentItem(state) {
        state.currentItem = null;
      },
    },
    extraReducers(builder) {
      builder
        .addCase(thunks.fetchAll.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(thunks.fetchAll.fulfilled, (state, action) => {
          const { records, pagination } = unwrapList(action.payload);
          state.items = records;
          state.pagination = { ...state.pagination, ...pagination };
          state.loading = false;
        })
        .addCase(thunks.fetchAll.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload || action.error.message;
        })
        .addCase(thunks.fetchById.pending, (state) => {
          state.detailLoading = true;
          state.error = null;
        })
        .addCase(thunks.fetchById.fulfilled, (state, action) => {
          state.currentItem = unwrapEntity(action.payload);
          state.detailLoading = false;
        })
        .addCase(thunks.fetchById.rejected, (state, action) => {
          state.detailLoading = false;
          state.error = action.payload || action.error.message;
        })
        .addCase(thunks.create.pending, (state) => {
          state.mutationLoading = true;
          state.error = null;
        })
        .addCase(thunks.create.fulfilled, (state, action) => {
          const created = unwrapEntity(action.payload);
          if (created && getEntityId(created) !== undefined) state.items.unshift(created);
          state.currentItem = created;
          state.mutationLoading = false;
        })
        .addCase(thunks.create.rejected, (state, action) => {
          state.mutationLoading = false;
          state.error = action.payload || action.error.message;
        })
        .addCase(thunks.update.pending, (state) => {
          state.mutationLoading = true;
          state.error = null;
        })
        .addCase(thunks.update.fulfilled, (state, action) => {
          const updated = unwrapEntity(action.payload.data);
          const id = getEntityId(updated) ?? String(action.payload.id);
          const index = state.items.findIndex((item) => getEntityId(item) === id);
          if (index !== -1) state.items[index] = updated;
          if (getEntityId(state.currentItem) === id) state.currentItem = updated;
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
          state.items = state.items.filter((item) => getEntityId(item) !== String(action.payload));
          if (getEntityId(state.currentItem) === String(action.payload)) state.currentItem = null;
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
