import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/authSlice";
import membershipReducer from "@/store/membershipSlice";
import volunteerReducer from "@/store/volunteerSlice";
import contentReducer from "@/store/contentSlice";
import { installAuthInterceptors } from "@/lib/authApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    membership: membershipReducer,
    volunteer: volunteerReducer,
    content: contentReducer,
  },
});

installAuthInterceptors(store);
