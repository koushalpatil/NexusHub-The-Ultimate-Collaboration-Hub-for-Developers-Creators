import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currMembers: [], 
  currMember:{}
};

const memberSlice = createSlice({
  name: "member",
  initialState,
  reducers: {
    setCurrMembers: (state, action) => {
      state.currMembers = action.payload;
      
    },
    setCurrMember: (state, action) => {
      state.currMember = action.payload;
      
    },
  },
});

export const { setCurrMembers,setCurrMember } = memberSlice.actions;

export default memberSlice.reducer;
