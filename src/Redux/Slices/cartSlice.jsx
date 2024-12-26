import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInterceptor from '@/axiosInstance';
const API_BASE_URL = "http://localhost:5000/user";
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInterceptor.get(`/user/${userId}/cart`);

      const processedItems = response.data.cart.items.map(item => ({
        ...item,
        courseId: item.courseId || item.course, 
      }));

      return {
        ...response.data.cart,
        items: processedItems
      };
    } catch (error) {
      console.error('Fetch Cart Error:', error);
      return rejectWithValue(error.response?.data || 'Failed to fetch cart');
    }
  }
);

// Add to Cart Thunk
export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async ({ userId, courseId, price, offer_percentage }, { rejectWithValue }) => {
      try {
        const response = await axiosInterceptor.post(`/user/${userId}/cartadd`, {
          courseId,
          price,
          offer_percentage
        });
  
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to add to cart');
        }
  
        const processedItems = response.data.cart.items.map(item => ({
          ...item,
          courseId: item.courseId || item.course,
        }));
  
        return {
          success:true,
          ...response.data.cart,
          items: processedItems,
           message: 'Course added to cart successfully'
        };
      } catch (error) {
        console.error('Add to Cart Error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to add to cart';
        return rejectWithValue(errorMessage);
      }
    }
  );
  
// Remove from Cart Thunk
export const removeFromCart = createAsyncThunk(
    'cart/removeFromCart',
    async ({ userId, courseId }, { rejectWithValue }) => {
      try {
        const response = await axiosInterceptor.delete(`/user/${userId}/cartremove`, {
          data: { courseId }
        });
  
        const processedItems = response.data.cart.items.map(item => ({
          ...item,
          courseId: item.courseId || item.course,
        }));
  
        return {
          success:true,
          ...response.data.cart,
          items: processedItems
        };
      } catch (error) {
        console.error('Remove from Cart Error:', error);
        return rejectWithValue(error.response?.data || 'Failed to remove item');
      }
    }
  );
  

// Clear Cart Thunk
export const clearCart = createAsyncThunk(
    'cart/clearCart',
    async (userId, { rejectWithValue }) => {
      try {
        const response = await axiosInterceptor.delete(`/user/${userId}/cartclear`);
        return response.data.cart;
      } catch (error) {
        console.error('Clear Cart Error:', error);
        return rejectWithValue(error.response?.data || 'Failed to clear cart');
      }
    }
  );

// Cart Slice
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalCartPrice: 0,
    status: 'idle',
    removeStatus: 'idle',
    error: null,
    successMessage: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
    // Fetch Cart Cases
    .addCase(fetchCart.pending, (state) => {
      state.status = 'loading';
      state.error = null;
      state.successMessage = null;
    })
    .addCase(fetchCart.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.items = Array.isArray(action.payload.items) 
        ? action.payload.items 
        : [];
      state.totalCartPrice = action.payload.totalCartPrice || 0;
      state.error = null;
      state.successMessage = action.payload.message || 'Cart fetched successfully';
    })
    .addCase(fetchCart.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || 'Failed to fetch cart';
      state.successMessage = null;
    })

    // Add to Cart Cases
    .addCase(addToCart.pending, (state) => {
      state.status = 'loading';
    })
    .addCase(addToCart.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.items = action.payload.items;
      state.totalCartPrice = action.payload.totalCartPrice;
      state.error = null;
    })
    .addCase(addToCart.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload || 'Failed to add to cart';
    })

    // Remove from Cart Cases
    .addCase(removeFromCart.pending, (state) => {
      state.removeStatus = 'loading';
    })
    .addCase(removeFromCart.fulfilled, (state, action) => {
      state.removeStatus = 'succeeded';
      state.items = action.payload.items;
      state.totalCartPrice = action.payload.totalCartPrice;
      state.error = null;
    })
    .addCase(removeFromCart.rejected, (state, action) => {
      state.removeStatus = 'failed';
      state.error = action.payload || 'Failed to remove item';
    })

    // Clear Cart Cases
    .addCase(clearCart.fulfilled, (state) => {
      state.items = [];
      state.totalCartPrice = 0;
      state.error = null;
    })
    .addCase(clearCart.rejected, (state, action) => {
      console.error("Failed to clear cart:", action.error.message);
    });
}
});
export const { clearMessages } = cartSlice.actions;
export default cartSlice.reducer;

