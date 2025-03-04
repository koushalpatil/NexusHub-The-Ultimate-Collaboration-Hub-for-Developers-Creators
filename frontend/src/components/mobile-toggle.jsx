import { Menu } from "lucide-react";
import { Sheet,SheetContent,SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { NavigationSidebar } from "./NavigationSidebar";
import ServerSidebar from "./servers/ServerSidebar";

const MobileToggle = ({serverId}) => {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                <Menu></Menu>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 flex gap-0">
                <div className="w-[72px]">
                    <NavigationSidebar></NavigationSidebar>
                </div>
                <ServerSidebar serverId={serverId}></ServerSidebar>
            </SheetContent>
        </Sheet>
    );
}
 
export default MobileToggle;