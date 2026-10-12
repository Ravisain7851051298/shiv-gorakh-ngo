import { createAsyncThunk } from "@reduxjs/toolkit";
import { contentApi } from "@/lib/authApi";

function requestError(error) {
  return error.response?.data?.message || error.message || "Unable to complete the request.";
}

export function createContentThunks(resource) {
  return {
    fetchAll: createAsyncThunk(`${resource}/fetchAll`, async (params = {}, { rejectWithValue }) => {
      try {
        const { data } = await contentApi.get(`/${resource}/all`, { params });
        return data;
      } catch (error) {
        return rejectWithValue(requestError(error));
      }
    }),
    fetchById: createAsyncThunk(`${resource}/fetchById`, async (id, { rejectWithValue }) => {
      try {
        const { data } = await contentApi.get(`/${resource}/${id}`);
        return data;
      } catch (error) {
        return rejectWithValue(requestError(error));
      }
    }),
    create: createAsyncThunk(`${resource}/create`, async (body, { rejectWithValue }) => {
      try {
        const { data } = await contentApi.post(`/${resource}/create`, body);
        return data;
      } catch (error) {
        return rejectWithValue(requestError(error));
      }
    }),
    update: createAsyncThunk(`${resource}/update`, async ({ id, body }, { rejectWithValue }) => {
      try {
        const { data } = await contentApi.patch(`/${resource}/${id}`, body);
        return { id, data };
      } catch (error) {
        return rejectWithValue(requestError(error));
      }
    }),
    remove: createAsyncThunk(`${resource}/remove`, async (id, { rejectWithValue }) => {
      try {
        await contentApi.delete(`/${resource}/${id}`);
        return id;
      } catch (error) {
        return rejectWithValue(requestError(error));
      }
    }),
  };
}

export function createImageFormData(fields, files = []) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value));
    }
  });
  files.forEach((file) => formData.append("images", file));
  return formData;
}
