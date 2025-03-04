import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
};

const currMessagesSlice = createSlice({
  name: "currMessages",
  initialState,
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      
      
    },
    
  },
});

export const { setMessages, addMessage, clearMessages } = currMessagesSlice.actions;
export default currMessagesSlice.reducer;
