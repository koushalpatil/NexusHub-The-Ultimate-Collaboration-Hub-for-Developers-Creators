import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ChatHeader from "../chat/chatHeader";
import ChatInput from "../chat/chatInput";
import ChatMessages from "../chat/chatMessages";
import { useContext, useEffect } from "react";
import { setMessages } from "@/redux/slices/currMessages";
import { SocketContext } from "@/SocketContext";
import RoomPage from "../chat/RoomPage";

const ChannelIdPage = () => {
    const { channelId, id } = useParams();
    const navigate = useNavigate();
    const currUser = useSelector((state) => state.user.currUser);
    const currMember = useSelector((state) => state.member.currMember);
    const currServer = useSelector((state) => state.server.currServer);
    const currChannel = useSelector((state) => state.channel.currChannel);
    const socket = useContext(SocketContext);
    const dispatch = useDispatch();




    if (!currChannel || !currUser) {
        return navigate('/');
    }

    return (
        <div className="bg-white w-full min-h-screen dark:bg-[#313338] flex flex-col h-full">
            <ChatHeader
                name={currChannel.name}
                serverId={currChannel.serverId}
                type="channel"

            />
            {currChannel.type === 'TEXT' &&
                (<>
                    <div className="flex-1">
                        <ChatMessages chatId={currChannel.id} member={currMember} name={currChannel.name} type="channel" socketQuery={{ channelId: currChannel.id, serverId: currServer.id }} socketUrl="http://localhost:3000" >

                        </ChatMessages>
                    </div>
                    <ChatInput
                        name={currChannel.name}
                        type="channel"
                        apiUrl="/api/socket/messages"
                        query={
                            {
                                channelId: currChannel.id,
                                serverId: currChannel.serverId
                            }
                        }>

                    </ChatInput>
                </>)}

            {currChannel.type === 'AUDIO' && (
                <RoomPage className="min-h-screen" username={currUser.name} chatId={currChannel.id} video={false} audio={true}></RoomPage>
            )}

            {currChannel.type === 'VIDEO' && (
                <RoomPage className="min-h-screen"  username={currUser.name} chatId={currChannel.id} video={true} audio={false}></RoomPage>
            )}


        </div>
    );
}

export default ChannelIdPage;