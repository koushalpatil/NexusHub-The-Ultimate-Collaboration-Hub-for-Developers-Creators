import { Menu, Hash } from "lucide-react";
import MobileToggle from "../mobile-toggle";
import UserAvatar from "../UserAvatar";
import { SocketIndicator } from "../SocketIndicator";
import { ChatVideoButton } from "./chatVideoButton";
const ChatHeader = ({ serverId, name, type, imageUrl,userId }) => {
    
    
    

    return (
        <div className="text-md font-semibold px-3 flex items-center h-12 w-full border-neutral-200 
        dark:border-neutral-800 border-b-2">
            <MobileToggle serverId={serverId}></MobileToggle>
            {type === "channel" && (
                <Hash className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mr-2" />
            )}

            {type === "conversation" && (
                <UserAvatar src={imageUrl} className="h-8 w-8 md:h-8 md:w-8 mr-2"></UserAvatar>
            )}

            <p className="font-semibold text-md text-black dark:text-white">
                {name}
            </p>
            {type == "conversation" &&
                <div className="ml-auto flex items-center">
                    {type==="conversation" && (
                        <ChatVideoButton></ChatVideoButton>
                    )}
                    <SocketIndicator userId={userId} ></SocketIndicator>
                </div>
            }

        </div>
    );
}

export default ChatHeader;