import { useState } from "react";
import { ActionTooltip } from "../ActionTooltip";
import { useNavigate } from "react-router-dom";
import CreateChannelModal from "../modals/channel/CreateChannelModal";
import MembersModal from "../modals/MembersModal";
import { Plus, Settings } from "lucide-react"; 
import { useSelector } from "react-redux";

const ServerSection = ({ label, role, section, channelType, server }) => {
    const [isTextModalOpen, setTextModalOpen] = useState(false);
    const [isMemberModalOpen, setMemberModalOpen] = useState(false);

    const handleTextClick = () => {
        setTextModalOpen(true);
    };

    const handleMemberClick = () => {
        setMemberModalOpen(true);
    };

    
    

    return (
        <>
            <div className="flex items-center justify-between py-2 ">
                <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
                    {label}
                </p>
                {role !== "GUEST" && section === "channels" && (
                    <ActionTooltip label="Create Channel" side="top">
                        <button
                            onClick={handleTextClick}
                            className="text-zinc-500 hover:text-zinc-600 bg-[#2B2D31] dark:text-zinc-400 dark:hover:text-zinc-300 transition"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </ActionTooltip>
                )}
                {role === "ADMIN" && section === "members" && (
                    <ActionTooltip label="Manage Members" side="top">
                        <button
                            onClick={handleMemberClick}
                            className="text-zinc-500 hover:text-zinc-600 bg-[#2B2D31] dark:text-zinc-400 dark:hover:text-zinc-300 transition"
                        >
                            <Settings className="h-4 w-4" />
                        </button>
                    </ActionTooltip>
                )}
            </div>

            {isTextModalOpen && <CreateChannelModal channelType={channelType} setIsModalOpen={setTextModalOpen} />}
            {isMemberModalOpen && <MembersModal server={server}  setIsModalOpen={setMemberModalOpen} />}
        </>
    );
};

export default ServerSection;
