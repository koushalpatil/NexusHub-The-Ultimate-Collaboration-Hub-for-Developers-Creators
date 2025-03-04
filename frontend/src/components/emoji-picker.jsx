import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Smile } from "lucide-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

const EmojiPicker = ({ onChange }) => {
  return (
    <Popover>
      <PopoverTrigger>
        <Smile
          className="
            text-zinc-500 
            dark:text-zinc-400 
            hover:text-zinc-600 
            dark:hover:text-zinc-300
            transition"
        />
      </PopoverTrigger>
      <PopoverContent
        side="right"
        sideOffset={40}
        className="bg-transparent border-none shadow-none drop-shadow-none mb-16"
      >
        <Picker data={data} onEmojiSelect={(emoji) => onChange(emoji.native)} />
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;