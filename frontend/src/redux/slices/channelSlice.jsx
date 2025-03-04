import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currChannel: null,
};

const channelSlice = createSlice({
  name: 'channel',
  initialState,
  reducers: {
    setCurrChannel: (state, action) => {
      state.currChannel = action.payload;
    },
  },
});


export const { setCurrChannel } = channelSlice.actions;

export default channelSlice.reducer;
