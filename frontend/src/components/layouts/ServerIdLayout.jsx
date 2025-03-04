import { Outlet, useParams, useNavigate } from "react-router-dom";
import ServerSidebar from "../servers/ServerSidebar";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const ServerIdLayout = () => {
    let { id: serverId } = useParams();
    const navigate = useNavigate();

    const currServer = useSelector((state) => state.server.currServer);
    const currMembers = useSelector((state) => state.member.currMembers);
    const currUser = useSelector((state) => state.user.currUser);

    useEffect(() => {
        console.log("Current server from ServerIdLayout:", currServer);

        if (!currUser || !currMembers || !currServer) {
            navigate('/');
            return;
        }

        if (currMembers.length > 0) {
            const isMember = currMembers.some(member => member.profileId === currUser.id);

            if (!isMember) {
                const timeout = setTimeout(() => navigate('/'), 3000); // Redirect after 3s
                return () => clearTimeout(timeout); // Cleanup function
            } else {
                console.log("Current user is a member of the server.");
            }
        }
    }, [currServer, currUser, currMembers]);

    return (
        <div className="h-full  min-h-screen  ml-4">
            {/* Sidebar for larger screens */}
            <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
                <ServerSidebar serverId={serverId} />
            </div>

            {/* Main Content */}
            <main className="h-full w-full min-h-screen md:pl-60">
                <Outlet />
            </main>
        </div>
    );
};

export default ServerIdLayout;
