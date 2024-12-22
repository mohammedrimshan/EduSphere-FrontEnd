import { createSlice } from "@reduxjs/toolkit";

const courseSlice = createSlice({
  name: "course",
  initialState: {
    courses: [],
    lessons: {}, // Consider if this empty object is needed since lessons are stored in courses
    offerPrices: {},
    courseDatas: (() => {
      try {
        const storedData = localStorage.getItem("courseDatas");
        return storedData ? JSON.parse(storedData) : [];
      } catch (error) {
        console.warn("Error parsing courseData from localStorage:", error);
        localStorage.removeItem("courseDatas");
        return [];
      }
    })(),
    lessonProgress: (() => {
      try {
        const storedProgress = localStorage.getItem("lessonProgress");
        return storedProgress ? JSON.parse(storedProgress) : {};
      } catch (error) {
        console.warn("Error parsing lessonProgress from localStorage:", error);
        localStorage.removeItem("lessonProgress");
        return {};
      }
    })(),
    loading: false,
    error: null,
  },
  reducers: {
    setCourses: (state, action) => {
      // Handle different input scenarios
      let courses = Array.isArray(action.payload) 
        ? action.payload 
        : action.payload?.courses || [action.payload];
    
      // Determine if this is a tutor context (optional, default to false)
      const isTutor = action.payload?.isTutor || false;
      
      // Filter courses if not in tutor context
      const filteredCourses = isTutor 
        ? courses 
        : courses.filter(course => course.listed);
      
      state.courseDatas = filteredCourses;
      
      // Process lessons if needed
      filteredCourses.forEach((course) => {
        if (course.lessons && Array.isArray(course.lessons)) {
          course.lessons.forEach((lesson) => {
            if (lesson._id) {
              state.lessons[lesson._id] = lesson;
            }
          });
        }
      });
    
      localStorage.setItem("courseDatas", JSON.stringify(filteredCourses));
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    addLessonToCourse: (state, action) => {
      const { courseId, lesson } = action.payload;
      const course = state.courseDatas.find(c => c._id === courseId);
      if (course) {
        course.lessons = course.lessons || []; // Initialize lessons if undefined
        if (!course.lessons.some(l => l._id === lesson._id)) {
          course.lessons.push(lesson);
          localStorage.setItem("courseDatas", JSON.stringify(state.courseDatas));
        }
      }
    },
    updateLesson: (state, action) => {
      const { courseId, lessonId, updatedLesson } = action.payload;
      const course = state.courseDatas.find(c => c._id === courseId);
      if (course && course.lessons) {
        const lessonIndex = course.lessons.findIndex(l => l._id === lessonId);
        if (lessonIndex !== -1) {
          course.lessons[lessonIndex] = updatedLesson;
          localStorage.setItem("courseDatas", JSON.stringify(state.courseDatas));
        } else {
          console.error(`Lesson with ID ${lessonId} not found in course ${courseId}`);
        }
      } else {
        console.error(`Course with ID ${courseId} not found`);
      }
    },
    
    deleteLesson: (state, action) => {
      const { courseId, lessonId } = action.payload;
      // Find and update the specific course
      const course = state.courseDatas.find(c => c._id === courseId);
      if (course && course.lessons) {
        // Remove the lesson from the course's lessons array
        course.lessons = course.lessons.filter(l => l._id !== lessonId);
        // Remove the lesson from the lessons object if it exists
        if (state.lessons[lessonId]) {
          delete state.lessons[lessonId];
        }
        // Update localStorage
        localStorage.setItem("courseDatas", JSON.stringify(state.courseDatas));
      }
    },
    addCourse: (state, action) => {
      // Ensure new course has lessons array
      const newCourse = {
        ...action.payload,
        lessons: action.payload.lessons || []
      };
      state.courseDatas.push(newCourse);
      localStorage.setItem("courseDatas", JSON.stringify(state.courseDatas));
    },
    updateCourse: (state, action) => {
      const updatedCourse = action.payload;
      const courseIndex = state.courseDatas.findIndex(
        course => course._id === updatedCourse._id
      );
      
      if (courseIndex !== -1) {
        // Preserve existing lessons if not included in update
        const existingLessons = state.courseDatas[courseIndex].lessons || [];
        state.courseDatas[courseIndex] = {
          ...updatedCourse,
          lessons: updatedCourse.lessons || existingLessons
        };
        localStorage.setItem("courseDatas", JSON.stringify(state.courseDatas));
      }
    },

    deleteCourse: (state, action) => {
      const id = action.payload;
      state.courseDatas = state.courseDatas.filter(course => course._id !== id);
      localStorage.setItem("courseDatas", JSON.stringify(state.courseDatas));
    },
    clearCourses: (state) => {
      state.courseDatas = [];
      state.lessons = {};
      localStorage.removeItem("courseDatas");
    },
    setLessonsForCourse: (state, action) => {
      const { lessons } = action.payload;
      lessons.forEach(lesson => {
        state.lessons[lesson._id] = lesson;
      });
    },
    setOfferPrice: (state, action) => {
      const { courseId, offerPrice } = action.payload;
      state.offerPrices[courseId] = offerPrice;
    },
    updateLessonProgress: (state, action) => {
      const { lessonId, progress, userId } = action.payload;
      // Store progress by user ID to handle multiple users
      if (!state.lessonProgress[userId]) {
        state.lessonProgress[userId] = {};
      }
      state.lessonProgress[userId][lessonId] = progress;
      // Save to localStorage
      localStorage.setItem("lessonProgress", JSON.stringify(state.lessonProgress));
    },

    // Load progress for a specific user
    loadUserProgress: (state, action) => {
      const userId = action.payload;
      const storedProgress = state.lessonProgress[userId] || {};
      return {
        ...state,
        currentUserProgress: storedProgress
      };
    },

    // Clear progress when user logs out
    clearUserProgress: (state, action) => {
      const userId = action.payload;
      if (state.lessonProgress[userId]) {
        delete state.lessonProgress[userId];
        localStorage.setItem("lessonProgress", JSON.stringify(state.lessonProgress));
      }
    },
  }
});

export const {
  addCourse,
  updateCourse,
  setCourses,
  deleteCourse,
  clearCourses,
  setLoading,
  setError,
  addLessonToCourse,
  updateLesson,
  deleteLesson,
  setOfferPrice ,
  deleteLessonSuccess,
  updateLessonProgress,
  loadUserProgress,
  clearUserProgress
} = courseSlice.actions;

export default courseSlice.reducer;