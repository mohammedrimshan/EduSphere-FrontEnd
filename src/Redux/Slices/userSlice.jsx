import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
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
      localStorage.setItem("userDatas", JSON.stringify(action.payload));
    },
    logoutUser: (state) => {
      state.userDatas = null;
      localStorage.removeItem("userDatas");
      window.history.replaceState(null, '', '/'); 
    },
    setUser: (state, action) => {
      state.userDatas = action.payload;
    },
    clearUser: (state) => {
      state.userDatas = null;
    },
    updateUser: (state, action) => {
      state.userDatas = { ...state.userDatas, ...action.payload };
      localStorage.setItem("userDatas", JSON.stringify(state.userDatas));
    },
  },
});

export const { loginUser, logoutUser, setUser, clearUser, updateUser } = userSlice.actions;

export default userSlice.reducer;
