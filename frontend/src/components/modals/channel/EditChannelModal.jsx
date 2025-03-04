import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label"; 
import { useSelector } from "react-redux";
import { DialogContent, DialogHeader, DialogTitle, Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "react-toastify";
import { useUser } from "@clerk/clerk-react";

const EditChannelModal = ({ setIsModalOpen, channel }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [channelData, setChannelData] = useState({
        name: channel?.name || "",
        type: channel?.type || "TEXT", // Default to TEXT if no type is set
    });
    const user = useUser();
    const navigate = useNavigate();
    const currServerId = useSelector((state) => state.server.currServerId);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSubmit = async () => {
        try {
            let dataToSend = {
                ...channelData, user: user
            };
            await axios.patch(`http://localhost:3000/channels/${channel.id}`, dataToSend);
            toast.success("Channel Edited Successfully");
            navigate(`/server/${currServerId}`);
        } catch (error) {
            toast.error("Error while editing channel.");
            console.error("Error updating channel:", error);
        }
    };

    const handleClose = () => {
        setIsModalOpen(false);
        navigate(`/server/${currServerId}`);
        setTimeout(() => {
            window.location.reload();
        }, 10);
    };

    if (!isMounted) {
        return null;
    }

    return (
        <Dialog open onOpenChange={handleClose}>
            <DialogContent className="bg-white text-black p-4 overflow-hidden">
                <DialogHeader className="pt-8 px-6 relative">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Edit Channel
                    </DialogTitle>
                </DialogHeader>
                <div className="p-6">
                    <Label className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Channel Name
                    </Label>
                    <input
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 w-full p-3 text-black focus-visible:ring-offset-0"
                        value={channelData.name}
                        onChange={(e) => setChannelData({ ...channelData, name: e.target.value })}
                    />

                    <Label className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70 mt-4">
                        Channel Type
                    </Label>
                    <select
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 w-full p-3 text-black focus-visible:ring-offset-0"
                        value={channelData.type}
                        onChange={(e) => setChannelData({ ...channelData, type: e.target.value })}
                    >
                        <option value="TEXT">Text</option>
                        <option value="VIDEO">Video</option>
                        <option value="AUDIO">Audio</option>
                    </select>
                </div>
                <Button
                    className="text-xs text-white bg-blue-600 hover:bg-blue-700 font-medium py-2 px-4 rounded-md mt-4 transition duration-200 ease-in-out shadow-md hover:shadow-lg"
                    onClick={handleSubmit}
                >
                    Edit
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default EditChannelModal;
