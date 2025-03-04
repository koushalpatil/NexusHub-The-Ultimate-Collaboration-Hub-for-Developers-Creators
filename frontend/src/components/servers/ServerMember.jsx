import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx"; 
import UserAvatar from "../UserAvatar"; 
import { cn } from "@/lib/utils";
import { useContext, useEffect } from "react";
import { SocketContext } from "@/SocketContext";

const roleIconMap = {
    'GUEST': null,
    'MODERATOR': <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
    'ADMIN': <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />
};

const ServerMember = ({ member, server }) => {

    const socket = useContext(SocketContext);
   
    const navigate = useNavigate();

    const icon = roleIconMap[member?.role]; // Ensure `member` exists

    const handleMemberClick = ()=>{
        
        
        return navigate(`/server/${server?.id}/conversations/${member?.id}`);
    }

    useEffect(()=>{
    
        
        socket.emit("joinRoom",member.id)
    },[]);

    return (
        <button
            className={clsx(
                "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full transition mb-1 bg-[#2B2D31]  hover:bg-[#2E2F33]"
            )}
            onClick={handleMemberClick}
        >
            <UserAvatar
                src={member?.profile?.imageUrl || ""}
                className="h-8 w-8 md:h-8 md:w-8"
            />
            <p className={cn(
                "font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
               
            )}>
                {member?.profile?.name || "Unknown User"}
            </p>
            {icon}
        </button>
    );
};

export default ServerMember;
