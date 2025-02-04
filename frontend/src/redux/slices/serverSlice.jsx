
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currServerId: null, 
};

const serverSlice = createSlice({
  name: 'server', 
  initialState,
  reducers: {
    setServerId: (state, action) => {
      state.currServerId = action.payload;
    },
  },
});

export const { setServerId } = serverSlice.actions;

export default serverSlice.reducer;
