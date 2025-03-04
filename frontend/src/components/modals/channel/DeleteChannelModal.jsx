import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    Dialog,
    DialogDescription,
    DialogFooter,
} from "../../ui/dialog";
import { useSelector } from "react-redux";
import { Button } from "../../ui/button";

const DeleteChannelModal = ({ setIsModalOpen, channel }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const currServer = useSelector((state) => state.server.currServer);
    const navigate = useNavigate();
    const currServerId = useSelector((state) => state.server.currServerId);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleClose = () => {
        setIsModalOpen(false);
        navigate(`/server/${currServerId}`);
    };

    const handleDeleteChannel = async () => {
        if (!channel?.id) {
            console.error("Channel ID is missing!");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.delete(`http://localhost:3000/channels/${channel.id}`);

            console.log("Response from DeleteChannelModal - ", response);

            if (!response.data.success) {
                console.error("Failed to delete channel:", response.data.error);
                return;
            }

            navigate(`/server/${currServer?.id}`);
            setTimeout(() => window.location.reload(), 500);
        } catch (error) {
            console.error("Error while deleting channel:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isMounted) {
        return null;
    }

    return (
        <Dialog open onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <DialogContent className="bg-white text-black p-4 overflow-hidden">
                <DialogHeader className="pt-8 px-6 relative">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Delete Channel
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription className="text-center text-zinc-500">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-indigo-500">
                        {channel?.name || "this channel"}?
                    </span>
                </DialogDescription>
                <DialogFooter className="bg-gray-100 px-6 py-4">
                    <div className="flex items-center justify-between w-full">
                        <Button disabled={loading}  onClick={handleClose} variant="outlineBlack">
                            Cancel
                        </Button>
                        <Button disabled={loading} variant="destructive" onClick={handleDeleteChannel}>
                            Confirm
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteChannelModal;
