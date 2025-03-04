import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currUser: null, 
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrUser: (state, action) => {
      state.currUser = action.payload; 
    },
  },
});

export const { setCurrUser } = userSlice.actions;
export default userSlice.reducer;
