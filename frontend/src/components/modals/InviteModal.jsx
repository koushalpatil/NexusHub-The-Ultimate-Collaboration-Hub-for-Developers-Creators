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
} from "../ui/dialog";
import { useSelector } from "react-redux";
import { Button } from "../ui/button";
import { Check, Copy, RefreshCw } from "lucide-react";
import { setCurrServer } from "@/redux/slices/serverSlice";


const InviteModal = ({ setIsModalOpen }) => {

    const [isMounted, setIsMounted] = useState(false);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    

    
    const currUser = useSelector((state)=>state.user.currUser);
    const currServer = useSelector((state)=>state.server.currServer);

   
    
    const [inviteCode,setInviteCode] = useState(`http://localhost:5173/invite/${currServer.inviteCode}`);

    
   
    

    const navigate = useNavigate();

    const currServerId = useSelector((state) => (state.server.currServerId));

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const onCopy = () => {
        navigator.clipboard.writeText(inviteCode);
        setCopied(true);
        setTimeout(() => { setCopied(false) }, 1000);
    }

    const handleClose = async () => {
        setIsModalOpen(false);
        navigate(`/server/${currServerId}`); // Navigate first
        setTimeout(() => {
            window.location.reload(); // Then reload
        }, 10); // Small delay to let navigation take effect
    };
    

    

  

    const onNew = async () => {
        try {
            setLoading(true);
            const response = await axios.patch(`http://localhost:3000/servers/${currServerId}/invite-code/${currUser.id}`);
            let { inviteCode, server } = response.data;
    
            // Update Redux store with the new server data
            dispatch(setCurrServer(server));
    
            // Directly update inviteCode state using response data
            setInviteCode(`http://localhost:5173/invite/${inviteCode}`);
        } catch (error) {
            console.log(error);
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
                        Invite Friends
                    </DialogTitle>
                </DialogHeader>
                <div className="p-6">
                    <Label className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                        Server invite link
                    </Label>
                    <div className="flex items-center mt-2 gap-x-2">
                        <input
                            className="bg-zinc-300/50 border-0 focus-visible:ring-0 w-full p-3 text-black focus-visible:ring-offset-0"
                            value={inviteCode}
                            readOnly
                        />
                        <Button onClick={onCopy} >
                            {copied ? <Check></Check> : <Copy className="w-4 h-4"></Copy>}

                        </Button>
                    </div>
                    <Button className="text-xs text-zinc-500 mt-4" onClick={onNew}>Generate a new link <RefreshCw className="w-4 h-4 ml-2"></RefreshCw></Button>
                </div>


            </DialogContent>
        </Dialog>
    );
};

export default InviteModal;
