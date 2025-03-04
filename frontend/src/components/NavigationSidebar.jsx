import { useUser } from "@clerk/clerk-react";
import { Separator } from "./ui/separator";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "./ui/scroll-area";
import { NavigationAction } from "./NavigationAction";
import { NavigationItem } from "./NavigationItem";
import { ModeToggle } from "./mode-toggle";
import { UserButton } from "@clerk/clerk-react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrServer, setServerId } from "@/redux/slices/serverSlice";
import { setCurrMember, setCurrMembers } from "@/redux/slices/memberSlice";
import { setCurrChannel } from "@/redux/slices/channelSlice";

export const NavigationSidebar = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [servers, setServers] = useState([]);
    const dispatch = useDispatch();

    const currServer = useSelector((state) => state.server.currServer);
    const currUser = useSelector((state) => state.user.currUser);

    useEffect(() => {
        if (!user || !user.id) return; // Wait until user is defined

        const fetchData = async () => {
            try {
                const profileResponse = await axios.get(`http://localhost:3000/profile/${user.id}`);
                const profile = profileResponse.data;

                if (!profile || !profile.id) {
                    navigate("/");
                    return;
                }

                const serversResponse = await axios.get(`http://localhost:3000/servers/${user.id}`);
                const servers = serversResponse.data;

                if (!servers || servers.length === 0) {
                    navigate("/server");
                    return;
                }
                setServers(servers);

                if (servers.length > 0) {
                    dispatch(setCurrServer(servers[0]));
                    dispatch(setCurrMembers(servers[0].members));
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                navigate("/");
            }
        };

        fetchData();
    }, [user]);

    useEffect(() => {
        if (currServer && currServer.channels?.length > 0) {
            console.log("hii1122626338");
            
            navigate(`/server/${currServer.id}/channels/${currServer.channels[0].id}`);
        }
    }, [currServer]);

    async function handleOnClick(server) {
        dispatch(setCurrServer(server));
        dispatch(setServerId(server.id));
        dispatch(setCurrMembers(server.members));
    
        if (server.channels?.length > 0) {
            dispatch(setCurrChannel(server.channels[0]));
        }
    
        
        if (!currUser || !currUser.id) {
            console.warn("currUser is not set yet");
            return;
        }
    
        try {
            const currMemberResponse = await axios.get(`http://localhost:3000/member/${server.id}/${currUser.id}`);
            dispatch(setCurrMember(currMemberResponse.data));
        } catch (error) {
            console.error("Error fetching member data:", error);
        }
    }
    

    if (!user) {
        return null;
    }

    return (
        <div className="space-y-4 flex flex-col items-center h-full text-primary w-[85px] dark:bg-[#1E1F22] py-3">
            <NavigationAction />
            <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto" />
            <ScrollArea className="flex-1 w-full">
                {servers.map((server) => (
                    <div key={server.id} className="mb-4" onClick={() => handleOnClick(server)}>
                        <NavigationItem id={server.id} imageUrl={server.imageUrl} name={server.name} />
                    </div>
                ))}
            </ScrollArea>
            <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
                <ModeToggle />
                <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                        elements: {
                            avatarBox: "h-[40px] w-[40px]"
                        }
                    }}
                />
            </div>
        </div>
    );
};
