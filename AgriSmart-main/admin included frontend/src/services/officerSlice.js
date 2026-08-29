import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  officers: [
    {
      id: 1,
      name: "Arun Kumar",
      email: "arun@gmail.com",
      district: "Coimbatore",
      status: "Pending",
    },
    {
      id: 2,
      name: "Priya S",
      email: "priya@gmail.com",
      district: "Chennai",
      status: "Pending",
    },
    {
      id: 3,
      name: "Rajesh Kumar",
      email: "rajesh@gmail.com",
      district: "Madurai",
      status: "Verified",
    },
  ],
};

const officerSlice = createSlice({
  name: "officers",
  initialState,

  reducers: {
    setOfficers: (state, action) => {
      state.officers = action.payload;
    },

    approveOfficer: (state, action) => {
      const officer = state.officers.find(
        (officer) => officer.id === action.payload
      );

      if (officer) {
        officer.status = "Verified";
      }
    },

    rejectOfficer: (state, action) => {
      const officer = state.officers.find(
        (officer) => officer.id === action.payload
      );

      if (officer) {
        officer.status = "Rejected";
      }
    },
  },
});

export const {
  setOfficers,
  approveOfficer,
  rejectOfficer,
} = officerSlice.actions;

export default officerSlice.reducer;

