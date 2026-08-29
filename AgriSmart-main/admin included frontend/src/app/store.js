import { configureStore } from "@reduxjs/toolkit";

import adminReducer from "../services/adminSlice";
import officerReducer from "../services/officerSlice";
import schemeReducer from "../services/schemeSlice";

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    officers: officerReducer,
    schemes: schemeReducer,
  },
});

