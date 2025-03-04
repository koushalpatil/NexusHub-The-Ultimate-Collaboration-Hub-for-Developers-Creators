import { ShieldAlert, ShieldCheck, Image as ImageIcon, FileIcon, Trash, Edit } from "lucide-react";
import UserAvatar from "../UserAvatar";
import { ActionTooltip } from "../ActionTooltip";
import { useEffect, useState, useContext } from "react";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import axios from "axios";
import { SocketContext } from "@/SocketContext";
import { useUser } from "@clerk/clerk-react";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "@/redux/slices/currMessages";

// Define the MemberRole enum
const MemberRole = {
    GUEST: "GUEST",
    MODERATOR: "MODERATOR",
    ADMIN: "ADMIN"
};

const roleIconMap = {
    "GUEST": null,
    "MODERATOR": <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
    "ADMIN": <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />
};

const ChatItem = ({
    id,
    content,
    member,
    timestamp,
    fileUrl,
    deleted,
    currentMember,
    isUpdated,
    updatedAt,
    createdAt,
    socketUrl,
    socketQuery,
    setMsgs
}) => {
    const fileType = fileUrl?.split(".").pop();
    const socket = useContext(SocketContext);
    const messages = useSelector((state) => state.currMessages.messages);
    
    // Check if message has been edited by comparing updatedAt and createdAt
    const hasBeenEdited = updatedAt && createdAt && new Date(updatedAt) > new Date(createdAt);

    const isAdmin = currentMember.role === MemberRole.ADMIN;
    const isModerator = currentMember.role === MemberRole.MODERATOR;
    const isOwner = currentMember.id === member.id;
    const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
    const canEditMessage = !deleted && isOwner && !fileUrl;
    const isPDF = fileType === "pdf" && fileUrl;
    const isImage = !isPDF && fileUrl;

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [deletedState,setIsDeletedState] = useState(false);

    const { user } = useUser();
    const dispatch = useDispatch();

    const form = useForm({
        defaultValues: {
            content: content
        }
    });

    useEffect(() => {
        // Keep form content updated if the message content changes
        form.reset({ content: content });
    }, [content, form]);

    useEffect(() => {
        // Close edit mode when Escape key is pressed
        const handleKeyDown = (event) => {
            if (event.key === "Escape" || event.keyCode === 27) {
                setIsEditing(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleSubmit = async (data) => {
        if (isLoading || !id) return;

        setIsLoading(true);
        try {
            // Send request to update message
            const response = await axios.patch(`http://localhost:3000/messages/${id}`, {
                content: data.content,
                userId: user.id,
                currentMember: currentMember
            });
            
            // Emit socket event to notify other clients about the update
            socket.emit("messageUpdate", {
                id,
                content: data.content,
                updatedAt: new Date().toISOString(), // Send the updated timestamp
                channelId: socketQuery?.channelId
            });
            
            console.log("Message updated:", response.data);
        } catch (error) {
            console.error("Failed to update message:", error);
        } finally {
            setIsLoading(false);
            setIsEditing(false);
        }
    };


    useEffect(() => {
        const handleUpdateMessage = (data) => {
            const { id, content, updatedAt } = data;
    
            const updatedMessages = messages.map((message) =>
                message.id === id ? { 
                    ...message, 
                    content, 
                    updatedAt: updatedAt || new Date().toISOString() 
                } : message
            );
            
            dispatch(setMessages(updatedMessages));
             
        };

        const handleDeleteMessage = (data) => {
            const { id } = data;
        
           
            const updatedMessages = messages.map((message) =>
                message.id === id ? { ...message, deleted: true } : message
            );
        
            
            dispatch(setMessages(updatedMessages));
            setMsgs(updatedMessages); 
        };


        socket.on("updateMessageData", handleUpdateMessage);

        socket.on("deleteMessageData",handleDeleteMessage);
      
        return () => {
            socket.off("updateMessageData", handleUpdateMessage);
            socket.off("deleteMessageData", handleDeleteMessage);
        };
    }, [socket, dispatch, messages]); 

    const handleDelete = async () => {
        if (isLoading || !id) return;

        setIsLoading(true);
        try {
            
            const response = await axios.delete(`http://localhost:3000/messages/${id}`, {
                data: { userId: user?.id,currentMember:currentMember }
              });


              setIsDeletedState(true);
              
            
            
            socket.emit("messageDelete", {
                id,
                channelId: socketQuery?.channelId
            });
            
            console.log("Message deleted:", response.data);
        } catch (error) {
            console.error("Failed to delete message:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // If message is deleted, show placeholder text
    if (deletedState || deleted) {
        return (
            <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
                <div className="group flex gap-x-2 items-start w-full">
                    <div className="cursor-pointer hover:drop-shadow-md transition">
                        <UserAvatar src={member?.profile?.imageUrl} />
                    </div>
                    <div className="flex flex-col w-full">
                        <div className="flex items-center gap-x-2">
                            <div className="flex items-center">
                                <p className="font-semibold text-sm hover:underline cursor-pointer">
                                    {member?.profile?.name}
                                </p>
                                <ActionTooltip label={member.role}>
                                    {roleIconMap[member?.role]}
                                </ActionTooltip>
                            </div>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                {timestamp}
                            </span>
                        </div>
                        <p className="italic text-zinc-500 dark:text-zinc-400 text-xs mt-1">
                            This message has been deleted
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
            <div className="group flex gap-x-2 items-start w-full">
                <div className="cursor-pointer hover:drop-shadow-md transition">
                    <UserAvatar src={member?.profile?.imageUrl} />
                </div>
                <div className="flex flex-col w-full">
                    <div className="flex items-center gap-x-2">
                        <div className="flex items-center">
                            <p className="font-semibold text-sm hover:underline cursor-pointer">
                                {member?.profile?.name}
                            </p>
                            <ActionTooltip label={member.role}>
                                {roleIconMap[member?.role]}
                            </ActionTooltip>
                        </div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {timestamp}
                        </span>
                    </div>
                    {isImage && (
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48"
                        >
                            <img
                                src={fileUrl}
                                alt={content}
                                className="object-cover w-full h-full"
                            />
                        </a>
                    )}
                    {isPDF && (
                        <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
                            <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
                            >
                                PDF File
                            </a>
                        </div>
                    )}
                    {!fileUrl && !isEditing && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-300">
                            {content}
                            {(isUpdated || hasBeenEdited) && (
                                <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                                    (edited)
                                </span>
                            )}
                        </p>
                    )}
                    {!fileUrl && isEditing && (
                        <>
                            <Form {...form}>
                                <form className="flex items-center w-full gap-x-2 pt-2" onSubmit={form.handleSubmit(handleSubmit)}>
                                    <FormField
                                        name="content"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormControl>
                                                    <div className="relative w-full">
                                                        <Input
                                                            disabled={isLoading}
                                                            className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                                                            placeholder="Edited message"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <Button size="sm" disabled={isLoading} variant="primary" type="submit">
                                        {isLoading ? "Saving..." : "Save"}
                                    </Button>
                                </form>
                            </Form>
                            <span className="text-[10px] mt-1 text-zinc-400">
                                Press escape to cancel, enter to save
                            </span>
                        </>
                    )}
                </div>
            </div>
            {canDeleteMessage && (
                <div className="hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
                    {canEditMessage && (
                        <ActionTooltip label="Edit">
                            <Edit
                                onClick={() => setIsEditing(true)}
                                className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
                            />
                        </ActionTooltip>
                    )}
                    <ActionTooltip label="Delete">
                        <Trash
                            onClick={handleDelete}
                            className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
                        />
                    </ActionTooltip>
                </div>
            )}
        </div>
    );
};

export default ChatItem;