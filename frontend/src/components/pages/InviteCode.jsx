import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
const InviteCode = () => {
    let{inviteCode} = useParams();
    const navigate = useNavigate();

    let {user} = useUser();
    useEffect(() => {
        const fetchInvite = async () => {
          try {
            const response = await axios.get(`http://localhost:3000/invite/${inviteCode}/${user.id}`);
            let message = response.data.message; // Extract message correctly
            let server = response.data.server;
      
            if (message === "Invalid invite code.") {
              navigate('/');
              setTimeout(() => {
                window.location.reload(); 
            }, 1); 
            } else if (message === "Profile not found.") {
                navigate('/');
                setTimeout(() => {
                  window.location.reload(); 
              }, 1); 
            } else if (message === "Joined successfully!") {
              navigate(`/server/${server.id}`);
              setTimeout(() => {
                window.location.reload(); 
            }, 1); 
            } else {
                navigate('/');
                setTimeout(() => {
                  window.location.reload(); 
              }, 1); 
            }
          } catch (error) {
            console.error("Error fetching invite:", error);
          }
        };
      
        fetchInvite();
      }, []);
    return (
        <div>Invite Page</div>
    );
}
 
export default InviteCode;