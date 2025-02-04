import { useUser } from "@clerk/clerk-react";
import { Separator } from "./ui/separator";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "./ui/scroll-area";
import { NavigationAction } from './NavigationAction';
import { NavigationItem } from './NavigationItem';
import { ModeToggle } from "./mode-toggle";
import { UserButton } from "@clerk/clerk-react";
export const NavigationSidebar = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [servers, setServers] = useState([]);


    useEffect(() => {
        if (!user) {
            navigate("/");
            return;
        }

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
                console.log("servers related to the user: ", servers);

            } catch (error) {
                console.error("Error fetching data:", error);
                navigate("/");
            }
        };
        fetchData();
    }, [user]);

    return (
        <div className="space-y-4 flex flex-col items-center h-full text-primary w-[85px] dark:bg-[#1E1F22] py-3">
            <NavigationAction />
            <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto"></Separator>
            <ScrollArea className="flex-1 w-full">
                {servers.map((server) => (
                    <div key={server.id} className="mb-4">
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