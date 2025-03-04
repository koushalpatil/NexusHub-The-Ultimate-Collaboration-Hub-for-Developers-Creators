import React, { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles"
import { useUser } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";
import axios from "axios";

const RoomPage = ({ chatId, video = true, audio = true }) => {
  const { user } = useUser();
  const [token, setToken] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
    
      if (!user?.firstName || !user?.lastName) {
        console.warn("User details not available");
        return;
      }

      const name = `${user.firstName} ${user.lastName}`;

      try {
       
        const apiBaseUrl ='http://localhost:3000';
        
        const res = await axios.get(
          `${apiBaseUrl}/getApitoken`, 
          { 
            params: { 
              room: chatId, 
              username: name 
            } 
          }
        );
        
        
        console.log('Received Token:', res.data.token);
        
        setToken(res.data.token);
      } catch (e) {
        console.error("Error fetching token:", e.response ? e.response.data : e.message);
        setError(`Failed to connect to video call: ${e.message}`);
      }
    };

    fetchToken();
  }, [user?.firstName, user?.lastName, chatId]);

  
  if (error) {
    return (
      <div className="h-full flex flex-col flex-1 justify-center items-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  
  if (!token) {
    return (
      <div className="h-full flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Connecting to video call...
        </p>
      </div>
    );
  }

  
  return (
    <LiveKitRoom
      data-lk-theme="default"
      serverUrl='wss://discord-huyfzfeq.livekit.cloud'
      token={token}
      connect={true}
      video={video}
      audio={audio}
      className="min-h-screen"
    >
      <VideoConference />
    </LiveKitRoom>
  );
};

export default RoomPage;