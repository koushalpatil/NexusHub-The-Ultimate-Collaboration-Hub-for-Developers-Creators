import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currServerId: null, 
  currServer:null,
 
};

const serverSlice = createSlice({
  name: 'server', 
  initialState,
  reducers: {
    setServerId: (state, action) => {
      state.currServerId = action.payload;
    },
    setCurrServer: (state, action) => {
      state.currServer = action.payload;
    },
  },
});

export const { setServerId,setCurrServer,triggerRerender } = serverSlice.actions;

export default serverSlice.reducer;
