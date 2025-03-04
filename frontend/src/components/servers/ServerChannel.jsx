import { Hash, Video, Mic, Trash, Edit, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ActionTooltip } from "../ActionTooltip";
import { useContext, useEffect, useState } from "react";
import EditChannelModal from "../modals/channel/EditChannelModal";
import DeleteChannelModal from "../modals/channel/DeleteChannelModal";
import { useDispatch } from "react-redux";
import { setCurrChannel } from "@/redux/slices/channelSlice";
import { SocketContext } from "@/SocketContext";


const iconMap = {
    TEXT: Hash,
    VIDEO: Video,
    AUDIO: Mic,
};

const ServerChannel = ({ channel, server, role }) => {

    
   
    const navigate = useNavigate();
    const Icon = iconMap[channel.type] || Hash; 
    const [isEditChannelModalOpen, setEditChannelModalOpen] = useState(false);
    const [isDeleteChannelModalOpen, setDeleteChannelModalOpen] = useState(false);

    const dispatch = useDispatch();

    const handleChannelDelete = (e) => {
        e.stopPropagation(); 
        setDeleteChannelModalOpen(true);
    };

    const handleChannelEdit = (e) => {
        e.stopPropagation(); 
        setEditChannelModalOpen(true);
    };

    const handleChannelClick = () => {
        dispatch(setCurrChannel(channel));  
        navigate(`/server/${server?.id}/channels/${channel?.id}`);
    };

    
    

    return (
        <button
            onClick={handleChannelClick}
            className={cn(
                "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full",
                "bg-[#2B2D31] hover:bg-[#232428] transition mb-1",
            )}
        >
            <Icon className="flex-shrink-0 w-5 h-5 text-zinc-400" />

            <p
                className={cn(
                    "line-clamp-1 font-semibold text-sm text-zinc-400",
                    "group-hover:text-zinc-300 transition",
                )}
            >
                {channel.name}
            </p>

            {channel.name !== "general" && role !== "GUEST" && (
                <div className="ml-auto flex items-center gap-x-2">
                    <ActionTooltip label="Edit">
                        <Edit
                            onClick={handleChannelEdit}
                            className="hidden group-hover:block w-4 h-4 text-zinc-400 hover:text-zinc-300 transition"
                        />
                    </ActionTooltip>
                    <ActionTooltip label="Delete">
                        <Trash
                            onClick={handleChannelDelete}
                            className="hidden group-hover:block w-4 h-4 text-zinc-400 hover:text-zinc-300 transition"
                        />
                    </ActionTooltip>
                </div>
            )}

            {channel.name === "general" && <Lock className="ml-auto w-4 h-4 text-zinc-400" />}

            
            {isEditChannelModalOpen && (
                <EditChannelModal
                    channel={channel}
                    setIsModalOpen={setEditChannelModalOpen}
                />
            )}
            {isDeleteChannelModalOpen && (
                <DeleteChannelModal
                    channel={channel}
                    setIsModalOpen={setDeleteChannelModalOpen}
                />
            )}
        </button>
    );
};

export default ServerChannel;