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
import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuPortal,DropdownMenuSeparator,DropdownMenuSub,DropdownMenuSubContent,DropdownMenuTrigger,DropdownMenuSubTrigger} from "../ui/dropdown-menu";
import { useSelector } from "react-redux";
import { Button } from "../ui/button";
import { Check, Copy, Gavel, Loader2, MoreVertical, RefreshCw, Shield, ShieldQuestion } from "lucide-react";
import { setCurrServer } from "@/redux/slices/serverSlice";
import { DialogDescription } from "@radix-ui/react-dialog";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import UserAvatar from "../UserAvatar";
import { ShieldAlert,ShieldCheck } from "lucide-react";


const MembersModal = ({ setIsModalOpen, server }) => {

    const [isMounted, setIsMounted] = useState(false);
    const dispatch = useDispatch();



    const currUser = useSelector((state) => state.user.currUser);
    const currServer = useSelector((state) => state.server.currServer);









    const navigate = useNavigate();

    const currServerId = useSelector((state) => (state.server.currServerId));
    const [loadingId,setLoadingId] = useState("");

    useEffect(() => {
        setIsMounted(true);
    }, []);


    console.log("Server from MemberModal is : ",server);
    const handleClose = async () => {
        setIsModalOpen(false);
        navigate(`/server/${currServerId}`); // Navigate first
        setTimeout(() => {
            window.location.reload(); // Then reload
        }, 1); // Small delay to let navigation take effect
    };


    if (!isMounted) {
        return null;
    }
    const roleIconMap = {
        "GUEST": null,
        "MODERATOR": <ShieldCheck className="h-4 w-4 ml-2
          text-indigo-500" />,
        "ADMIN": <ShieldAlert className="h-4 w-4 
          text-rose-500" />
      }

      const onRoleChange = async (memberId, role) => {
        try {
          setLoadingId(memberId);

          const res = await axios.patch( `http://localhost:3000/members/${memberId}`, { role,currUser });

          navigate(`/server/${server.id}`);
          
          setTimeout(() => {
            window.location.reload(); 
        }, 10); 
          
      
        } catch (error) {
          console.log("error while updating rolw from memebers modal: ",error);
      
        } finally {
          setLoadingId("");
      
        }
      };

      const handleKickClick = async(memberId)=>{
        try
        {
            setLoadingId(memberId);
            const response = await axios.delete(`http://localhost:3000/members/${memberId}`, {
                data: { currUser }
              });
              
            navigate(`/server/${server.id}`);
            setTimeout(() => {
                window.location.reload(); 
            }, 10); 
        }
        catch(error)
        {
            console.log("error while kicking member from memebers modal: ",error);
        }
        finally{
            setLoadingId("");
        }
      }

    return (
        <Dialog open onOpenChange={handleClose}>
            <DialogContent className="bg-white text-black p-4 overflow-hidden">
                <DialogHeader className="pt-8 px-6 relative">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Manage Members
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        {server?.members?.length} members
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="mt-8 max-h-[420px] pr-6">
                    {server?.members?.map((member) => (
                        <div key={member.id} className="flex items-center gap-x-2 mb-6">
                            <UserAvatar src={member.profile.imageUrl}></UserAvatar>
                            <div className="flex flex-col gap-y-1">
                                <div className="text-xs font-semibold gap-x-1 flex items-center">
                                    {member.profile.name}
                                    {roleIconMap[member.role]}
                                </div>
                                <p className="text-xs text-zinc-500">
                                    {member.profile.email}
                                </p>
                            </div>
                            {server.profileId !== member.profileId && loadingId!==member.id && 
                            (
                                <div className="ml-auto">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <MoreVertical className="h-4 w-4 text-zinc-500"></MoreVertical>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="left">
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger className="flex items-center">
                                                    <ShieldQuestion className="w-4 h-4 mr-2"></ShieldQuestion>
                                                    <span>Role</span>
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuPortal>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuItem onClick={()=>{onRoleChange(member.id,"GUEST")}}>
                                                            <Shield className="h- w-4 mr-2">
                                                            </Shield>Guest{member.role == 'GUEST' && (<Check className="h-4 w-4 ml-auto"></Check>)}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={()=>{onRoleChange(member.id,"MODERATOR")}}>
                                                            <ShieldCheck className="h- w-4 mr-2">
                                                            </ShieldCheck>Moderator{member.role == 'MODERATOR' && (<Check className="h-4 w-4 ml-auto"></Check>)}
                                                        </DropdownMenuItem>

                                                    </DropdownMenuSubContent>
                                                </DropdownMenuPortal>
                                            </DropdownMenuSub>
                                            <DropdownMenuSeparator></DropdownMenuSeparator>
                                            <DropdownMenuItem onClick={()=>{handleKickClick(member.id)}}>
                                                <Gavel className="h-4 w-4 mr-2"></Gavel>
                                                Kick
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                            {loadingId===member.id && (
                                <Loader2 className="text-zinc-500 ml-auto w-4 h-4 animate-spin"></Loader2>
                            )}
                        </div>
                    ))}

                </ScrollArea>



            </DialogContent>
        </Dialog>
    );
};

export default MembersModal;
