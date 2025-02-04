import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ServerPage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();

  

    return (
        <div>
            Server id: {id}
        </div>
    );
}

export default ServerPage;
