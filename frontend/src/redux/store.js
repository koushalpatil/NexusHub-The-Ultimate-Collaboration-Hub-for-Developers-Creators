
import { configureStore } from '@reduxjs/toolkit';
import serverReducer from './slices/serverSlice'; 

const store = configureStore({
  reducer: {
    server: serverReducer, 
  },
});

export default store;
