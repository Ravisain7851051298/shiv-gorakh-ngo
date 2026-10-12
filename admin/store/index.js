import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/authSlice";
import eventReducer from "@/store/eventsSlice";
import galleryReducer from "@/store/galleriesSlice";
import storyReducer from "@/store/storiesSlice";
import programReducer from "@/store/programsSlice";
import blogReducer from "@/store/blogsSlice";
import campaignReducer from "@/store/campaignsSlice";
import certificateReducer from "@/store/certificatesSlice";
import missionVisionReducer from "@/store/missionVisionSlice";
import serviceReducer from "@/store/servicesSlice";
import { membershipReducer, volunteerReducer } from "@/store/profilesSlice";
import { installAuthInterceptors } from "@/lib/authApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventReducer,
    galleries: galleryReducer,
    stories: storyReducer,
    programs: programReducer,
    services: serviceReducer,
    blogs: blogReducer,
    campaigns: campaignReducer,
    certificates: certificateReducer,
    missionVision: missionVisionReducer,
    volunteers: volunteerReducer,
    memberships: membershipReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: { ignoredActionPaths: ["meta.arg"] },
    }),
});

installAuthInterceptors(store);
