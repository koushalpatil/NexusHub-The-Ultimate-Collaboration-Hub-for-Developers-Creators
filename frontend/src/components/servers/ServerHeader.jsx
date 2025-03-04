import { ChevronDown, LogOut, PlusCircle, Settings, Trash, Users, UserPlus } from "lucide-react"; // Added UserPlus
import { DropdownMenu, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from "../ui/dropdown-menu";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import InviteModal from "../modals/InviteModal";
import EditServerModal from "../modals/server/EditServerModal";
import MembersModal from "../modals/MembersModal";
import DeleteServerModal from "../modals/server/DeleteServerModal";
import CreateChannelModal from "../modals/channel/CreateChannelModal";
import LeaveServerModal from "../modals/server/LeaveServerModal";

const ServerHeader = ({ role }) => {
    console.log("Role from serverheader is - ", role);

    const isAdmin = role === 'ADMIN';
    const isModerator = role === 'MODERATOR';
    const server = useSelector((state) => state.server.currServer);
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isManageMembersOpen, setManageMembersOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isCreateChannelModalOpen, setCreateChannelModalOpen] = useState(false);
    const [isLeaveModalOpen, setLeaveModalOpen] = useState(false);

    console.log("Server from ServerHeader is : ", server);

    useEffect(() => {
        if (!server) {
            navigate('/');
        }
    }, [server, navigate]);

    const handleInviteClick = () => {
        setIsModalOpen(true);
    };

    const handleEditClick = () => {
        setEditModalOpen(true);
    };

    const handleManageAccounts = () => {
        setManageMembersOpen(true);
    };

    const handleDeleteServer = () => {
        setDeleteModalOpen(true);
    };

    const handleCreateChannel = () => {
        setCreateChannelModalOpen(true);
    };

    const handleLeaveChannel = ()=>{
        setLeaveModalOpen(true);
    }

    return (
        <>
            {/* Dropdown Menu for Server Options */}
            <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none" asChild>
                    <button className="w-full text-md font-semibold px-3 flex
                    items-center h-12 border-neutral-200
                    dark:border-neutral-800 border-b-2 hover:bg-zinc-700/10
                    dark:hover:bg-zinc-700/50 transition">
                        {server && server.name ? server.name : "No Server Name"}
                        <ChevronDown className="h-5 w-5 ml-auto"></ChevronDown>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 text-xs font-medium 
                        text-black dark:text-neutral-400 space-y-[2px]">

                    {(isModerator || isAdmin) && (
                        <DropdownMenuItem onClick={handleInviteClick} className="text-indigo-600 dark:text-indigo-400
        px-3 py-2 text-sm cursor-pointer">
                            Invite People
                            <UserPlus className="h-4 w-4 ml-auto" />
                        </DropdownMenuItem>
                    )}

                    {isAdmin && (
                        <DropdownMenuItem onClick={handleEditClick} className="px-3 py-2 text-sm cursor-pointer">
                            Server Settings
                            <Settings className="h-4 w-4 ml-auto" />
                        </DropdownMenuItem>
                    )}

                    {isAdmin && (
                        <DropdownMenuItem onClick={handleManageAccounts} className="px-3 py-2 text-sm cursor-pointer">
                            Manage Accounts
                            <Users className="h-4 w-4 ml-auto" />
                        </DropdownMenuItem>
                    )}

                    {(isModerator || isAdmin) && (
                        <DropdownMenuItem onClick={handleCreateChannel} className="px-3 py-2 text-sm cursor-pointer">
                            Create Channel
                            <PlusCircle className="h-4 w-4 ml-auto" />
                        </DropdownMenuItem>
                    )}

                    {isModerator && <DropdownMenuSeparator />}

                    {isAdmin && (
                        <DropdownMenuItem onClick={handleDeleteServer} className="text-rose-500 px-3 py-2 text-sm cursor-pointer">
                            Delete Server
                            <Trash className="h-4 w-4 ml-auto" />
                        </DropdownMenuItem>
                    )}

                    {!isAdmin && (
                        <DropdownMenuItem onClick={handleLeaveChannel} className="text-rose-500 px-3 py-2 text-sm cursor-pointer">
                            Leave Server
                            <LogOut className="h-4 w-4 ml-auto" />
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Invite Modal */}
            {isModalOpen && <InviteModal setIsModalOpen={setIsModalOpen} />}

            {/* Edit Server Modal */}
            {isEditModalOpen && <EditServerModal server={server} setIsModalOpen={setEditModalOpen} />}

            {/* Manage Members Modal */}
            {isManageMembersOpen && <MembersModal server={server} setIsModalOpen={setManageMembersOpen} />}

            {/* Delete Server Modal */}
            {isDeleteModalOpen && <DeleteServerModal setIsModalOpen={setDeleteModalOpen} />}

            {/* Create Channel Modal */}
            {isCreateChannelModalOpen && <CreateChannelModal channelType="TEXT"  setIsModalOpen={setCreateChannelModalOpen} />}

             {/* Leave Server Modal */}
             {isLeaveModalOpen && <LeaveServerModal  setIsModalOpen={setLeaveModalOpen} />}
        </>
    );
};

export default ServerHeader;
