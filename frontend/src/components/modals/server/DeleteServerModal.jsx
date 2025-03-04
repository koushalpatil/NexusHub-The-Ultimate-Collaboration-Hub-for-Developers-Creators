import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Label } from "@radix-ui/react-dropdown-menu";
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
import { Check, Copy, RefreshCw } from "lucide-react";
import { setCurrServer } from "@/redux/slices/serverSlice";


const LeaveServerModal = ({ setIsModalOpen }) => {

    const [isMounted, setIsMounted] = useState(false);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();



    const currUser = useSelector((state) => state.user.currUser);
    const currServer = useSelector((state) => state.server.currServer);

    const navigate = useNavigate();

    const currServerId = useSelector((state) => (state.server.currServerId));

    useEffect(() => {
        setIsMounted(true);
    }, []);



    const handleClose = async () => {
        setIsModalOpen(false);
        navigate(`/server/${currServerId}`); // Navigate first
    };

    const handleLeaveServer = async () => {
        try {
            setLoading(true);

            let response = await axios.delete(`http://localhost:3000/servers/${currServer.id}`);
            console.log("Response from LeaveServerModal - ", response);

            if (!response.data.success) {
                console.error("Failed to leave server:", response.data.error);
                setLoading(false);
                return;
            }

            let res = await axios.get(`http://localhost:3000/servers/${currUser.userId}`);
            let servers = res.data;

            if (!servers || servers.length === 0) {
                navigate('/');
                setTimeout(() => {
                    window.location.reload();
                }, 1);
                setLoading(false);
                return;
            }

            dispatch(setCurrServer(servers[0]));
            navigate(`/server/${servers[0].id}`);
            setTimeout(() => {
                window.location.reload();
            }, 1);
        } catch (error) {
            console.error("Error while leaving server:", error);
        } finally {
            setLoading(false);
        }
    };



    if (!isMounted) {
        return null;
    }

    return (
        <Dialog open onOpenChange={handleClose}>
            <DialogContent className="bg-white text-black p-4 overflow-hidden">
                <DialogHeader className="pt-8 px-6 relative">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Delete Server
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription className="text-center text-zinc-500">
                    Are you sure you want to delete <span className="font-semibold text-indigo-500">{currServer?.name}</span>
                </DialogDescription>
                <DialogFooter className="bg-gray-100 px-6 py-4">
                    <div className="flex items-center justify-between w-full">
                    <Button disabled={loading} variant="outlineBlack" onClick = {handleClose}>
                            Cancel
                        </Button>

                        <Button disabled={loading} variant="primary" onClick={handleLeaveServer} >
                            Confirm
                        </Button>
                    </div>
                </DialogFooter>


            </DialogContent>
        </Dialog>
    );
};

export default LeaveServerModal;
