import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ActionTooltip } from "./ActionTooltip";

export const NavigationItem = ({ id, imageUrl, name }) => {
    const params = useParams();
    const navigate = useNavigate();

    function onClick() {
        navigate(`/server/${id}`);
    }

    return (
        <ActionTooltip
            side="right"
            align="center"
            label={name}
            
        >
            <button onClick={onClick} className="group relative flex items-center w-[85px] h-[60px] bg-transparent">
                <div className={cn(
                    "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
                    params?.serverId !== id && "group-hover:h-[20px]",
                    params?.serverId === id ? "h-[36px]" : "h-[8px]"
                )} />
                <div className={cn(
                    "relative group flex h-[48px] w-[48px] rounded-[12px] group-hover:rounded-[8px] transition-all overflow-hidden",
                    params?.serverId === id && "bg-primary/10 text-primary rounded-[8px]"
                )}>
                    <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                </div>
            </button>
        </ActionTooltip>
    );
};
