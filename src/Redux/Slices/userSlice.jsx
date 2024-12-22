import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    accessToken: localStorage.getItem("token") || null,
    userDatas: (() => {
      try {
        const storedData = localStorage.getItem("userDatas");
        return storedData ? JSON.parse(storedData) : null;
      } catch (error) {
        console.warn("Error parsing userDatas from localStorage:", error);
        localStorage.removeItem("userDatas");
        return null;
      }
    })(),
  },
  reducers: {
    loginUser: (state, action) => {
      state.userDatas = action.payload;
      state.accessToken = localStorage.getItem("token");
      localStorage.setItem("userDatas", JSON.stringify(action.payload));
    },
    logoutUser: (state) => {
      state.userDatas = null;
      state.accessToken = null;
      localStorage.removeItem("userDatas");
      localStorage.removeItem("token");
      window.history.replaceState(null, '', '/'); 
    },
    setUser: (state, action) => {
      state.userDatas = action.payload;
    },
    clearUser: (state) => {
      state.userDatas = null;
      state.accessToken = null;
      localStorage.removeItem("token");
    },
    updateUser: (state, action) => {
      state.userDatas = { ...state.userDatas, ...action.payload };
      localStorage.setItem("userDatas", JSON.stringify(state.userDatas));
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      localStorage.setItem("token", action.payload);
    },
  },
});

export const { 
  loginUser, 
  logoutUser, 
  setUser, 
  clearUser, 
  updateUser,
  setAccessToken 
} = userSlice.actions;

export default userSlice.reducer;