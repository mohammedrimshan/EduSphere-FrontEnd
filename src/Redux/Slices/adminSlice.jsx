import { createSlice } from "@reduxjs/toolkit";
import Cookies from 'js-cookie';
const adminSlice = createSlice({
  name: "admin",
  initialState: {
    adminDatas: (() => {
      try {
        const storedData = localStorage.getItem("adminDatas");
        return storedData ? JSON.parse(storedData) : null;
      } catch (error) {
        console.warn("Error parsing adminDatas from localStorage:", error);
        localStorage.removeItem("adminDatas");
        return null;
      }
    })(),
  },
  reducers: {
    loginAdmin: (state, action) => {
      state.adminDatas = action.payload;
      localStorage.setItem("adminDatas", JSON.stringify(action.payload));
    },
    logoutAdmin: (state) => {
      state.adminDatas = null;
      localStorage.removeItem("adminDatas");
      localStorage.removeItem('adminToken'); 
      window.history.replaceState(null, "", "/");
    },
    setAdmin: (state, action) => {
      state.adminDatas = action.payload;
    },
    clearAdmin: (state) => {
      state.adminDatas = null;
    },
  },
});

export const { loginAdmin, logoutAdmin, setAdmin, clearAdmin } = adminSlice.actions;

export default adminSlice.reducer;