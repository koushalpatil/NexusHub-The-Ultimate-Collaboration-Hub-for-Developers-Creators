import { Tooltip,TooltipProvider,TooltipTrigger,TooltipContent } from "@radix-ui/react-tooltip";
export const ActionTooltip = ({label,children,side,align}) => {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={50}>
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                <TooltipContent side={side} align={align}>
                    <p className="font-semibold text-sm capitalize">
                        {label.toLowerCase()}
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

