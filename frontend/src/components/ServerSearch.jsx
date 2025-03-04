import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { CommandItem, CommandGroup, CommandDialog, CommandEmpty, CommandList } from "cmdk";
import { CommandInput } from "./ui/command";
import { useNavigate } from "react-router-dom";
import { Separator } from "./ui/separator";

const ServerSearch = ({ data, serverId }) => {  
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const down = (e) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const onClick = ({ id, type }) => {
        setOpen(false);
        if (type === "member") {
            return navigate(`/servers/${serverId}/conversations/${id}`);
        }
        if (type === "channel") {
            return navigate(`/servers/${serverId}/channels/${id}`);
        }
    };

    return (
        <>
            <button 
                onClick={() => setOpen(true)} 
                className="group px-2 py-2 rounded-md flex items-center gap-x-2 w-full
                hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition"
            >
                <Search className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-indigo-500 transition-colors" />
                <p className="font-semibold text-base text-gray-600 dark:text-gray-300 
                    group-hover:text-indigo-500 transition-colors">
                    Search
                </p>
                <kbd className="pointer-events-none ml-auto inline-flex h-6 select-none items-center 
                    gap-1 rounded bg-gray-200 dark:bg-gray-600 px-2 font-mono text-[11px] 
                    font-semibold text-gray-800 dark:text-gray-300 shadow-sm">
                    <span className="text-xs">CTRL</span>K
                </kbd>
            </button>

            <CommandDialog 
                open={open} 
                onOpenChange={setOpen}
                className="fixed top-0 left-0 w-full h-full z-[9999] bg-opacity-60 backdrop-blur-lg
                flex items-center justify-center transition-all duration-300"
            >
                <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
                    <CommandInput 
                        placeholder="Search all channels and members" 
                        className="w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    />
                    <CommandList className="mt-6 space-y-8">
                        <CommandEmpty className="text-gray-500 dark:text-gray-400 text-center py-4">
                            No Results Found
                        </CommandEmpty>

                        {/* Text Channels Group */}
                        <CommandGroup heading="Text Channels" className="text-gray-800 mt-4 dark:text-gray-300 space-y-2">
                            {data.filter(group => group.label === "Text Channels")[0]?.data.map(({ id, icon, name }) => (
                                <CommandItem 
                                    key={id} 
                                    onSelect={() => onClick({ id, type: "channel" })} 
                                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    
                                    <span>{name}</span>
                                    {icon}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2"></Separator>

                        {/* Video Channels Group */}
                        <CommandGroup heading="Video Channels" className="text-gray-800 mt-4 dark:text-gray-300 space-y-2">
                            {data.filter(group => group.label === "Video Channels")[0]?.data.map(({ id, icon, name }) => (
                                <CommandItem 
                                    key={id} 
                                    onSelect={() => onClick({ id, type: "channel" })} 
                                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {icon}
                                    <span>{name}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2"></Separator>

                        {/* Audio Channels Group */}
                        <CommandGroup heading="Audio Channels" className="text-gray-800 mt-4 dark:text-gray-300 space-y-2">
                            {data.filter(group => group.label === "Audio Channels")[0]?.data.map(({ id, icon, name }) => (
                                <CommandItem 
                                    key={id} 
                                    onSelect={() => onClick({ id, type: "channel" })} 
                                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {icon}
                                    <span>{name}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2"></Separator>

                        {/* Members Group */}
                        <CommandGroup heading="Members" className="text-gray-800 dark:text-gray-300 mt-4 space-y-2">
                            {data.filter(group => group.label === "Members")[0]?.data.map(({ id, icon, name }) => (
                                <CommandItem 
                                    key={id} 
                                    onSelect={() => onClick({ id, type: "member" })} 
                                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {icon}
                                    <span>{name}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                       
                    </CommandList>
                </div>
            </CommandDialog>
        </>
    );
}

export default ServerSearch;
