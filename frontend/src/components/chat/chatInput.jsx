import { useContext, useState } from "react";
import { Input } from "../ui/input";
import { Plus, Smile } from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";
import FileUploadModal from "../modals/fileUploadModal";
import EmojiPicker from "../emoji-picker";
import { SocketContext } from "@/SocketContext";


const ChatInput = ({ apiUrl, query, name, type, }) => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currUser = useSelector((state) => state.user.currUser);

  const socket = useContext(SocketContext);



  const onSubmit = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    try {
      setLoading(true);

      console.log("channel id - ", query.channelId);
      console.log("serverid - ", query.serverId);
      console.log("content - ", inputValue);
      console.log("current user id - ", currUser.id);


      if (type === "channel") {
        const response = await axios.post(`http://localhost:3000/messages`, {
          channelId: query.channelId,
          serverId: query.serverId,
          content: inputValue,
          profileId: currUser.id,
        });

        socket.emit("chatMessage", response.data.dataToSend);
      }
      else
      {
        const response = await axios.post(`http://localhost:3000/directMessages`, {
          conversationId: query.conversationId,
          content: inputValue,
          profileId: currUser.id,
          otherMember: query.otherMember,
          currMember:query.currMember
        });
        const d1 = {...response.data.dataToSend,otherMemberId:query.otherMember.id};
        socket.emit("directMessage", d1);
      }

      setInputValue("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="fixed bottom-5 w-[80%] mr-2">
      <form onSubmit={onSubmit} className="relative">
        <div className="relative">
          <button
            type="button"
            onClick={handleFileClick}
            className="absolute top-1/2 left-4 transform -translate-y-1/2 h-[24px] w-[24px] bg-zinc-500 hover:bg-zinc-600 transition rounded-full p-1 flex items-center justify-center"
          >
            <Plus className="text-white" />
          </button>

          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder={`Message ${type === "conversation" ? name : "#" + name
              }`}
            className="w-full pl-12 pr-6 py-6 h-12 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200 rounded-lg"
          />
          <div className="absolute top-0 h-full right-0">
            <EmojiPicker
              onChange={(emoji) => setInputValue(`${inputValue}${emoji}`)}
            />
          </div>
        </div>
        <button type="submit" disabled={isLoading} className="hidden"></button>
      </form>

      {isModalOpen && <FileUploadModal setIsModalOpen={setIsModalOpen} />}
    </div>
  );
};

export default ChatInput;