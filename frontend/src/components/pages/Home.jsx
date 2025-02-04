import {  UserButton } from "@clerk/clerk-react";
import { ModeToggle } from "../mode-toggle";
const Home = () => {
    return ( 
        <div>
            <UserButton />
            <ModeToggle />
            Home Page
        </div>
     );
}
 
export default Home;