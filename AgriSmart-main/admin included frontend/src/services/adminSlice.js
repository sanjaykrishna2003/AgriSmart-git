import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  admin: {
    name: "Admin",
    email: "admin@agrismart.com",
    role: "Administrator",
    profileImage: null,
  },
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdmin: (state, action) => {
      state.admin = action.payload;
    },

    updateAdminProfile: (state, action) => {
      state.admin = {
        ...state.admin,
        ...action.payload,
      };
    },
  },
});

export const {
  setAdmin,
  updateAdminProfile,
} = adminSlice.actions;

export default adminSlice.reducer;

