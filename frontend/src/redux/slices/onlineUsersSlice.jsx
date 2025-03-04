import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  onlineUsers: [], 
};

const onlineUsersSlice = createSlice({
  name: "onlineUsers",
  initialState,
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
  },
});

export const { setOnlineUsers } = onlineUsersSlice.actions;
export default onlineUsersSlice.reducer;
