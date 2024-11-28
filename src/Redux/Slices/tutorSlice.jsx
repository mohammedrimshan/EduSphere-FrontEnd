import { createSlice } from "@reduxjs/toolkit";

const tutorSlice = createSlice({
  name: "tutor",
  initialState: {
    tutorData: (() => {
      try {
        const storedData = localStorage.getItem("tutorData");
        return storedData ? JSON.parse(storedData) : null;
      } catch (error) {
        console.warn("Error parsing tutorData from localStorage:", error);
        localStorage.removeItem("tutorData");
        return null;
      }
    })(),
  },
  reducers: {
    loginTutor: (state, action) => {
      state.tutorData = action.payload;
      localStorage.setItem("tutorData", JSON.stringify(action.payload));
    },

    logoutTutor: (state) => {
      state.tutorData = null;
      localStorage.removeItem("tutorData");

      window.history.replaceState(null, "", "/");
    },

    setTutor: (state, action) => {
      state.tutorData = action.payload;
    },

    clearTutor: (state) => {
      state.tutorData = null;
      localStorage.removeItem("tutorData");
    },
    updateTutor: (state, action) => {
      state.tutorData = {
        ...state.tutorData,
        ...action.payload,
        id: action.payload._id || action.payload.id, // Ensure consistent ID field
        profileImage: action.payload.profileImage || state.tutorData.profileImage
      };
      localStorage.setItem("tutorData", JSON.stringify(state.tutorData));
    }
  },
});

export const { loginTutor, logoutTutor, setTutor, clearTutor,updateTutor } =
  tutorSlice.actions;

export default tutorSlice.reducer;
