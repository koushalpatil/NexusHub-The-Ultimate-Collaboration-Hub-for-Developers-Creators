import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const ServerPage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const currProfile = useSelector((state)=>state.user.currProfile);
    const currMembers = useSelector((state)=>(state.member.currMembers));
    const currServer = useSelector((state)=>state.server.currServer);
  
    useEffect(()=>{
        if(!currProfile || currMembers.length == 0)
        {
            return navigate('/');
        }
        const isMember = currMembers.find((member)=>{member.profileId == currProfile.id});
        console.log(".................. is member - ",isMember);
        
        if(!isMember)
        {
            return navigate('/');
        }
        const fChannel = currServer.channels[0];
        return navigate(`/server/${id}/channels/${fChannel.id}`);
    },[currMembers,currProfile,currServer]);

    return (
        null
    );
}

export default ServerPage;
