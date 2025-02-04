import { useNavigate } from "react-router-dom";
import { ActionTooltip } from "./ActionTooltip";
import { Plus } from "lucide-react";

export const NavigationAction = () => {
    const navigate = useNavigate();

    function onClick() {
        navigate('/server');
    }

    return (
        <div className="w-full flex justify-center items-center">
            <ActionTooltip label="Add a server" side="right" align="center">
                <button className="group flex items-center bg-transparent" onClick={onClick}>
                    <div className="flex h-[40px] w-[40px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden items-center justify-center bg-background dark:bg-neutral-700 group-hover:bg-emerald-500">
                        <Plus className="group-hover:text-white transition text-emerald-500" size={25} />
                    </div>
                </button>
            </ActionTooltip>
        </div>
    );
};
