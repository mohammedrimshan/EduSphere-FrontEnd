
import { createSlice } from '@reduxjs/toolkit';


const applyTheme = (theme) => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};


const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

const initialState = {
  theme: savedTheme, 
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      localStorage.setItem('theme', newTheme); 
      applyTheme(newTheme); 
    },
  },
});

export const { toggleTheme } = themeSlice.actions;

export default themeSlice.reducer;
