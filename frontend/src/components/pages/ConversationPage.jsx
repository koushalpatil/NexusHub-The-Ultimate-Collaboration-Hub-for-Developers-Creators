import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import ChatHeader from "../chat/chatHeader";
import { useEffect, useState } from "react";
import axios from "axios";
import ChatInput from "../chat/chatInput";
import ChatMessages from "../chat/chatMessages";
import { setMessages } from "@/redux/slices/currMessages";
import RoomPage from "../chat/RoomPage";

const ConversationPage = () => {
    let { memberId, id } = useParams();
    const currMember = useSelector((state) => state.member.currMember);
    const currProfile = useSelector((state) => state.user.currUser);
    const [conversation, setConversation] = useState(null);
    const [memberOne, setMemberOne] = useState(null);
    const [otherMember, setOtherMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();

    const [searchParams] = useSearchParams();
    const video = searchParams.get("video");

    useEffect(() => {
        if (!currMember?.id || !currProfile?.id) {
            setLoading(false);
            return;
        } // Ensure valid data before API call

        const fetchConversation = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:3000/conversation/${id}/${currMember.id}/${memberId}`);
                const conversationData = response.data;

                if (conversationData) {
                    setConversation(conversationData);
                    console.log("%%%%%%%%%%%%% - ", conversationData);


                    // Check if memberOne and memberTwo exist in response
                    if (!conversationData.memberOne || !conversationData.memberTwo) {
                        throw new Error("Invalid conversation data: missing member information");
                    }

                    const { memberOne, memberTwo } = conversationData;

                    // Validate member profiles exist
                    if (!memberOne.profile || !memberTwo.profile) {
                        throw new Error("Invalid member data: missing profile information");
                    }

                    if (currProfile.id === memberOne.profileId) {
                        setMemberOne(memberOne);
                        setOtherMember(memberTwo);
                    } else {
                        setMemberOne(memberTwo);
                        setOtherMember(memberOne);
                    }

                    dispatch(setMessages(conversationData.directMessages));


                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching conversation:", error);
                setError(error.message || "Failed to load conversation");
                setLoading(false);
            }
        };

        fetchConversation();

    }, [id, memberId, currMember?.id, currProfile?.id]); // Ensure dependencies are correctly checked

    if (loading) {
        return (
            <div className="bg-white dark:bg-[#313338] flex flex-col h-full w-full items-center justify-center">
                <p className="text-zinc-500">Loading conversation...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-[#313338] flex flex-col h-full w-full items-center justify-center">
                <p className="text-red-500">Error: {error}</p>
            </div>
        );
    }

    // Ensure we have valid data before rendering chat components
    const canRenderChat = otherMember?.profile && conversation?.id && memberOne;

    return (
        <div className="bg-white dark:bg-[#313338] flex flex-col h-full w-full">
            {canRenderChat ? (
                <>
                    <ChatHeader
                        imageUrl={otherMember.profile.imageUrl}
                        name={otherMember.profile.name}
                        serverId={id}
                        type="conversation"
                        userId={otherMember.profile.userId || ""}
                    />

                    {video && (
                        <RoomPage chatId={conversation.id} video={true} audio={true}></RoomPage>
                    )}

                    {!video && (
                        <>
                            <ChatMessages
                                member={currMember}
                                name={otherMember.profile.name}
                                chatId={conversation.id}
                                type="conversation"
                                socketUrl="http://localhost:3000"
                                socketQuery={{
                                    conversationId: conversation.id
                                }}
                            />

                            <ChatInput
                                name={otherMember.profile.name}
                                type="conversation"
                                query={{
                                    conversationId: conversation.id,
                                    otherMember: otherMember,
                                    currMember: memberOne
                                }}
                            />
                        </>
                    )}

                </>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-zinc-500">No conversation found or information is incomplete.</p>
                </div>
            )}
        </div>
    );
};

export default ConversationPage;