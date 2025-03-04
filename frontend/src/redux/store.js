
import { configureStore } from '@reduxjs/toolkit';
import serverReducer from './slices/serverSlice'; 
import userReducer from './slices/userSlice'; 
import memberReducer from './slices/memberSlice'; 
import channelReducer from './slices/channelSlice';
import onlineUsersReducer from './slices/onlineUsersSlice';
import currMessagesReducer from './slices/currMessages';

const store = configureStore({
  reducer: {
    server: serverReducer, 
    user:userReducer,
    member: memberReducer,
    channel:channelReducer,
    onlineUsers:onlineUsersReducer,
    currMessages:currMessagesReducer
  },
});

export default store;
