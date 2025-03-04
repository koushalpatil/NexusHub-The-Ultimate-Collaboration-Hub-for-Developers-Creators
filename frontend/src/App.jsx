import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/pages/Home";
import "./App.css";
import { ThemeProvider } from "./components/providers/theme-provider";
import { useContext, useEffect } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import InitialModal from "./components/modals/InitialModal";
import { useNavigate } from "react-router-dom";
import ServerPage from "./components/pages/ServerPage";
import ServerLayout from "./components/layouts/ServerLayout";
import { useDispatch, useSelector } from "react-redux";
import { setCurrServer, setServerId } from "./redux/slices/serverSlice";
import ServerIdLayout from "./components/layouts/ServerIdLayout";
import { setCurrUser } from "./redux/slices/userSlice";
import { Bounce } from "react-toastify";
import InviteCode from "./components/pages/InviteCode";
import { setOnlineUsers } from "./redux/slices/onlineUsersSlice";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChannelIdPage from "./components/pages/ChannelIdPage";
import ConversationPage from "./components/pages/conversationPage";
import { setCurrChannel } from "./redux/slices/channelSlice";
import { setCurrMember } from "./redux/slices/memberSlice";
import { SocketContext } from "./SocketContext";

function App() {
    const { user } = useUser();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const currServer = useSelector((state) => state.server.currServer);
    const socket = useContext(SocketContext);

   
    useEffect(() => {
        const sendUserData = async () => {
            try {
                const userData = { user };

                const response = await axios.post("http://localhost:3000/user", userData, {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                });

                if (response.data.redirectUrl) {
                    navigate(response.data.redirectUrl);
                }

                dispatch(setCurrServer(response.data.currServer));
                dispatch(setCurrUser(response.data.user));
                dispatch(setCurrMember(response.data.currMember));
                dispatch(setServerId(response.data.serverId));
                dispatch(setCurrChannel(response.data.currChannel));

                console.log("Current channel from app.jsx using response - ", response.data.currChannel);
            } catch (error) {
                console.error("Error sending user data:", error);
            }
        };

        if (user) {
            sendUserData();
        }
    }, [user, dispatch]);

    
    useEffect(() => {
        if (!socket) return; 

        const handleConnect = () => {
            console.log("----------------user connected to server(ClientSide) - ", socket.id);
        };

        const handleUpdateOnlineList = (users) => {
            dispatch(setOnlineUsers(users));
        };

        
        socket.on("connect", handleConnect);
        if (user) {
            socket.emit("userConnected", user.id);
        }
        socket.on("updateOnlineUsers", handleUpdateOnlineList);

        

       
        return () => {
            socket.off("connect", handleConnect);
            socket.off("updateOnlineUsers", handleUpdateOnlineList);
        };
    }, [socket, user, dispatch]);

   
    useEffect(() => {
        const currentTheme = localStorage.getItem("theme") || "dark";
        document.body.classList.add(currentTheme);
        return () => {
            document.body.classList.remove(currentTheme);
        };
    }, []);


    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/channels/${user.id}`);
                const channels = response.data.channels; 
    
                channels.forEach((channel) => {
                    console.log(";;;;;CHANNEL - ",channel);
                    
                    socket.emit("joinRoom", channel);
                });
            } catch (error) {
                console.error("Error fetching channels:", error);
            }
        };
    
        fetchChannels();
    }, [user]); 
    

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme" attribute="class">
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>

            <SignedIn>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/invite/:inviteCode" element={<InviteCode />} />
                    <Route path="/server" element={<ServerLayout />}>
                        <Route index element={<InitialModal />} />
                        <Route path=":id" element={<ServerIdLayout />}>
                            <Route index element={<ServerPage />} />
                            <Route path="conversations/:memberId" element={<ConversationPage />} />
                            <Route path="channels/:channelId" element={<ChannelIdPage />} />
                        </Route>
                    </Route>
                </Routes>
            </SignedIn>

            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
            />
        </ThemeProvider>
    );
}

export default App;