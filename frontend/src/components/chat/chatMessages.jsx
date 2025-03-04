import { useState, useEffect, useContext, useRef } from "react";
import ChatWelcome from "./chatWelcome";
import { Loader2, ServerCrash } from "lucide-react";
import { format } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "axios"; 
import ChatItem from "./ChatItem";
import { addMessage, setMessages } from "@/redux/slices/currMessages";
import { SocketContext } from "@/SocketContext";

const DATE_FORMAT = "d MM yyyy, HH:mm";

// Consider using environment variables for API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ChatMessages = ({
    name, 
    member, 
    chatId, 
    socketQuery, 
    type, 
    socketUrl
}) => {
    const [status, setStatus] = useState("loading");
    const messages = useSelector((state) => state.currMessages.messages);
    const dispatch = useDispatch();
    const { channelId } = useParams(); 
    const socket = useContext(SocketContext);
    const messagesEndRef = useRef(null);
    const currProfile = useSelector((state) => state.user.currUser);
    const currMember = useSelector((state) => state.member.currMember);

    // Fetch messages when component mounts or channelId/type changes
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                if (type === "channel") {
                    const response = await axios.get(`${API_BASE_URL}/messages/${channelId}`);
                    dispatch(setMessages(response.data)); 
                    setStatus("success");
                } else {
                    // Handle other types appropriately (direct messages, etc.)
                    // Placeholder - update based on your app's requirements
                    setStatus("success");
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
                setStatus("error");
            }
        };

        fetchMessages();
    }, [channelId, dispatch, type]);

    // Handle socket message events
    useEffect(() => {
        const handleChatMessage = (newMessage) => {

            console.log("mil gaya lavde - ",newMessage);
            
            const messageWithTimestamp = {
                ...newMessage,
                receivedAt: new Date().toISOString() 
            };
            dispatch(addMessage(messageWithTimestamp));
        };

        socket.on("chatMessage", handleChatMessage);
        socket.on("directMessage", handleChatMessage);
        
        // Clean up both event listeners
        return () => {
            socket.off("chatMessage", handleChatMessage);
            socket.off("directMessage", handleChatMessage);
        };
    }, [socket, dispatch]);

    // Scroll to bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (status === "loading") {
        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
                <p className="text-xs text-zinc-500">Loading messages...</p>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
                <p className="text-xs text-zinc-500">Something went wrong!</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col py-4 overflow-y-auto">
            <div className="flex-1" />
            <ChatWelcome
                type={type}
                name={name}
            />
            <div className="flex flex-col mt-auto">
                {!messages || messages.length === 0 ? ( 
                    <p className="text-center text-zinc-500">No messages yet.</p>
                ) : (
                    messages.map((message) => ( 
                        <ChatItem
                            key={message.id || `${message.content}-${message.createdAt}`}
                            currentMember={member}
                            member={message.member}
                            content={message.content}
                            fileUrl={message.fileUrl}
                            deleted={message.deleted}
                            timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
                            isUpdated={message.updatedAt !== message.createdAt}
                            socketUrl={socketUrl}
                            socketQuery={socketQuery}
                            id={message.id}
                            setMsgs={null} // Removed as it's no longer needed
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default ChatMessages;