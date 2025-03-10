import { Outlet } from "react-router-dom";
import {NavigationSidebar} from "../NavigationSidebar";

const ServerLayout = () => {
    return (
        <div className="min-h-screen w-full">
            <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
                <NavigationSidebar></NavigationSidebar>
            </div>
            <main className="md:pl-[72px] w-full h-full">
                <Outlet></Outlet>
            </main>
        </div>
    );
}
 
export default ServerLayout;