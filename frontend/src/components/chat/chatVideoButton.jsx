import React from "react";
import gs from "query-string";
import { useLocation, useNavigate } from "react-router-dom";
import { Video, VideoOff } from "lucide-react";

import { ActionTooltip } from "../ActionTooltip";

export const ChatVideoButton = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);

    const isVideo = searchParams.get("video");

    const onClick = () => {
        const url = gs.stringifyUrl({
            url: location.pathname || "",
            query: {
                video: isVideo ? undefined : true,
            },
        }, { skipNull: true });

        navigate(url);
    };

    const Icon = isVideo ? VideoOff : Video;
    const tooltipLabel = isVideo ? "End video call" : "Start Video";

    return (
        <ActionTooltip side="bottom" label={tooltipLabel}>
            <button onClick={onClick} className="hover:opacity-75 transition mr-4">
                <Icon className="h-6 w-6 text-zinc-500" />
            </button>
        </ActionTooltip>
    );
};