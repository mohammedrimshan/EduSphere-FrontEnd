export const setPersistedAuth = (userDatas) => {
    localStorage.setItem('userDatas', JSON.stringify(userDatas));
  };
  
  export const getPersistedAuth = () => {
    const userData = localStorage.getItem('userDatas');
    return userData ? JSON.parse(userData) : null;
  };
  
  export const clearPersistedAuth = () => {
    localStorage.removeItem('userDatas');
  };