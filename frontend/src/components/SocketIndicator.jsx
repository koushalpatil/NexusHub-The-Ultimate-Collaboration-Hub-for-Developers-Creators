import { useSelector } from "react-redux";
import { Badge } from "./ui/badge";

export const SocketIndicator = ({userId}) => {
  
  const onlineUsers = useSelector((state) => state.onlineUsers.onlineUsers);


  console.log("online users - ",onlineUsers);
  
  
  
  
  if (!userId || !onlineUsers) return null; 

  if (!onlineUsers.includes(userId)) { 
    return (
      <Badge variant="outline" className="bg-yellow-600 text-white border-none">
        Fallback: Polling every 1s
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-emerald-600 text-white border-none">
      Live: Real Time Updates every 1s
    </Badge>
  );
};
