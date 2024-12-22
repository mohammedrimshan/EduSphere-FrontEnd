import { createSlice } from '@reduxjs/toolkit';

const quizSlice = createSlice({
  name: 'quizzes',
  initialState: [],
  reducers: {
    addQuiz: (state, action) => {
      const existingIndex = state.findIndex(quiz => quiz.courseId === action.payload.courseId);
      if (existingIndex !== -1) {
        state[existingIndex] = action.payload;
      } else {
        state.push(action.payload);
      }
    },
    updateQuiz: (state, action) => {
      const index = state.findIndex(quiz => quiz.courseId === action.payload.courseId);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
    removeQuiz: (state, action) => {
      return state.filter(quiz => quiz.courseId !== action.payload);
    },
  },
});

export const { addQuiz, updateQuiz, removeQuiz } = quizSlice.actions;

export const selectQuizzes = (state) => state.quizzes;

export default quizSlice.reducer;

