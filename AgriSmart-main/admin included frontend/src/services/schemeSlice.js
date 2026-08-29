import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  schemes: [
    {
      id: 1,
      title: "PM Kisan Samman Nidhi",
      category: "Financial Support",
      description:
        "Financial assistance for eligible farmers to support agricultural activities.",
      status: "Active",
    },
    {
      id: 2,
      title: "Crop Insurance Scheme",
      category: "Crop Insurance",
      description:
        "Provides financial protection to farmers against crop losses.",
      status: "Active",
    },
  ],
};

const schemeSlice = createSlice({
  name: "schemes",
  initialState,

  reducers: {
    setSchemes: (state, action) => {
      state.schemes = action.payload;
    },

    addScheme: (state, action) => {
      state.schemes.push({
        id: Date.now(),
        ...action.payload,
        status: "Active",
      });
    },

    deleteScheme: (state, action) => {
      state.schemes = state.schemes.filter(
        (scheme) => scheme.id !== action.payload
      );
    },

    updateScheme: (state, action) => {
      const updatedScheme = action.payload;

      const index = state.schemes.findIndex(
        (scheme) => scheme.id === updatedScheme.id
      );

      if (index !== -1) {
        state.schemes[index] = updatedScheme;
      }
    },
  },
});

export const {
  setSchemes,
  addScheme,
  deleteScheme,
  updateScheme,
} = schemeSlice.actions;

export default schemeSlice.reducer;

