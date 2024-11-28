// features/sidebar/sidebarSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeItem: localStorage.getItem('activeMenuItem') || 'Dashboard'
};

export const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    setActiveItem: (state, action) => {
      state.activeItem = action.payload;
      localStorage.setItem('activeMenuItem', action.payload);
    },
    initializeFromPath: (state, action) => {
      const path = action.payload;
      const menuItems = [
        { name: 'Dashboard', path: '/admin/dashboard' },
        { name: 'Category', path: '/admin/category' },
        { name: 'Students', path: '/admin/students' },
        { name: 'Orders', path: '/admin/orders' },
        { name: 'Tutors', path: '/admin/tutors' },
        { name: 'Courses', path: '/admin/courses' },
      ];
      
      const matchingItem = menuItems.find(item => item.path === path);
      if (matchingItem) {
        state.activeItem = matchingItem.name;
        localStorage.setItem('activeMenuItem', matchingItem.name);
      }
    }
  }
});

export const { setActiveItem, initializeFromPath } = sidebarSlice.actions;
export const selectActiveItem = (state) => state.sidebar.activeItem;
export default sidebarSlice.reducer;