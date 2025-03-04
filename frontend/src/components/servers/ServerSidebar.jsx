import { useSelector } from "react-redux";
import ServerHeader from "./ServerHeader";
import { ScrollArea } from "../ui/scroll-area";
import ServerSearch from "../ServerSearch";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";
import { Separator } from "../ui/separator";
import ServerSection from '../servers/ServerSection';
import ServerChannel from "./ServerChannel";
import ServerMember from "./ServerMember";

const iconMap = {
    'TEXT': <Hash className="mr-2 h-4 w-4" />,
    'VIDEO': <Video className="mr-2 h-4 w-4" />,
    'AUDIO': <Mic className="mr-2 h-4 w-4" />
};

const roleIconMap = {
    'GUEST': null,
    'MODERATOR': <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />,
    'ADMIN': <ShieldAlert className="h-4 w-4 mr-2 text-rose-500" />
};

const ServerSidebar = () => {
    const currMembers = useSelector((state) => state.member.currMembers) || [];
    const currProfile = useSelector((state) => state.user.currUser) || {};
    const currServer = useSelector((state) => state.server.currServer) || {};

    const currMember = currMembers.find(member => member.profileId === currProfile.id) || {};
    const channels = currServer?.channels || [];

    // Filter channels by type
    const textChannels = channels.filter(channel => channel.type === 'TEXT');
    const videoChannels = channels.filter(channel => channel.type === 'VIDEO');
    const audioChannels = channels.filter(channel => channel.type === 'AUDIO');




    return (
        <div className="flex pl-2 flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
            <ServerHeader role={currMember?.role} />
            <ScrollArea className="mt-2">
                <div className="mt-2">
                    <ServerSearch
                        serverId={currServer?.id}
                        data={[
                            {
                                label: "Text Channels",
                                type: "channel",
                                data: textChannels.map(channel => ({
                                    id: channel.id,
                                    name: channel.name,
                                    icon: iconMap['TEXT'],
                                }))
                            },
                            {
                                label: "Video Channels",
                                type: "channel",
                                data: videoChannels.map(channel => ({
                                    id: channel.id,
                                    name: channel.name,
                                    icon: iconMap['VIDEO'],
                                }))
                            },
                            {
                                label: "Audio Channels",
                                type: "channel",
                                data: audioChannels.map(channel => ({
                                    id: channel.id,
                                    name: channel.name,
                                    icon: iconMap['AUDIO'],
                                }))
                            },
                            {
                                label: "Members",
                                type: "member",
                                data: currMembers.map(member => ({
                                    id: member.id,
                                    name: member.profile?.name || "Unknown",
                                    icon: roleIconMap[member.role] || null,
                                }))
                            }
                        ]}
                    />
                </div>
                <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2"></Separator>
                <div className="space-y-[2px]">
                {!!textChannels?.length && (
                    <div className="mb-2">
                        <ServerSection
                            sectionType="channels"
                            channelType='TEXT'
                            role={currMember?.role}
                            label="Text Channels"
                            className="mb-8"
                            server={currServer}>
                        </ServerSection>
                        {textChannels.map((channel) => (
                            <ServerChannel  key={channel.id} role={currMember?.role} server={currServer} channel={channel} />
                        ))}

                    </div>
                )}
                </div>
                <div className="space-y-[2px]">
                {!!audioChannels?.length && (
                    <div className="mb-2">
                        <ServerSection
                            section="channels"
                            channelType='AUDIO'
                            role={currMember?.role}
                            label="Voice Channels"
                            className="mb-8 "
                            server={currServer}>
                        </ServerSection>
                        {audioChannels.map((channel) => (
                            <ServerChannel  key={channel.id} role={currMember?.role} server={currServer} channel={channel} />
                        ))}

                    </div>
                )}
                </div>
                <div className="space-y-[2px]">
                {!!videoChannels?.length && (
                    <div className="mb-2">
                        <ServerSection
                            section="channels"
                            channelType='VIDEO'
                            role={currMember?.role}
                            label="Video Channels"
                            className="mb-8"
                            server={currServer}>
                        </ServerSection>
                        {videoChannels.map((channel) => (
                            <ServerChannel  key={channel.id} role={currMember?.role} server={currServer} channel={channel} />
                        ))}

                    </div>
                )}
                </div>
                <div className="space-y-[2px]">
                {!!currMembers.length && (
                    <div className="mb-2">
                        <ServerSection
                            section="members"
                           
                            role={currMember?.role}
                            label="Members"
                            className="mb-8"
                            server={currServer}>
                        </ServerSection>
                        {currMembers.map((member) => (
                            <ServerMember member={member} server={currServer}></ServerMember>
                        ))}

                    </div>
                )}
                </div>
            </ScrollArea>
        </div>
    );
};

export default ServerSidebar;
