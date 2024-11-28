import { createSlice } from "@reduxjs/toolkit";

const categorySlice = createSlice({
  name: "category",
  initialState: {
    categoryDatas: (() => {
      try {
        const storedData = localStorage.getItem("categoryDatas");
        return storedData ? JSON.parse(storedData) : [];
      } catch (error) {
        console.warn("Error parsing categoryData from localStorage:", error);
        localStorage.removeItem("categoryDatas"); 
        return []; 
      }
    })(),
  },
  reducers: {
    addCategory: (state, action) => {
      const newCategory = {
        ...action.payload,
        id: action.payload.id || Date.now(), 
        createdAt: new Date().toISOString()
      };
      state.categoryDatas.push(newCategory);
      localStorage.setItem("categoryDatas", JSON.stringify(state.categoryDatas));
    },
    updateCategory: (state, action) => {
      const updatedCategory = action.payload;
      state.categoryDatas = state.categoryDatas.map(category => 
        category.id === updatedCategory.id ? updatedCategory : category
      );
      localStorage.setItem("categoryDatas", JSON.stringify(state.categoryDatas));
    },
    setCategories: (state, action) => {
      state.categoryDatas = action.payload.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      // Ensure each category has consistent visibility fields
      const normalizedCategories = action.payload.map(category => ({
        ...category,
        id: category._id || category.id,
        _id: category._id || category.id,
        isVisible: category.isVisible || category.visible || false,
        visible: category.isVisible || category.visible || false
      }));
      
      state.categoryDatas = normalizedCategories;
      localStorage.setItem("categoryDatas", JSON.stringify(normalizedCategories));
    },
    deleteCategory: (state, action) => {
      state.categoryDatas = state.categoryDatas.filter((cat) => cat.id !== action.payload);
      localStorage.setItem("categoryDatas", JSON.stringify(state.categoryDatas));
    },
    clearCategories: (state) => {
      state.categoryDatas = [];
      localStorage.removeItem("categoryDatas");
    },
  },
});

export const { 
  addCategory, 
  updateCategory, 
  deleteCategory, 
  clearCategories, 
  setCategories 
} = categorySlice.actions;

export default categorySlice.reducer;