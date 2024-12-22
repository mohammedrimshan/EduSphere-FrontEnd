import axiosInterceptor from "@/axiosInstance";

export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await axiosInterceptor.post('/auth/refresh', { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    
    return accessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Redirect to login or handle as needed
    return null;
  }
};