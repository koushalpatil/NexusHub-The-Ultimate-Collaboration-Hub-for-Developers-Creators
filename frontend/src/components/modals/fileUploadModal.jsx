import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "../file-upload";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import {
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Dialog,
    DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useSelector } from "react-redux";

const FileUploadModal = ({ setIsModalOpen }) => {
    const { user } = useUser();
    const [formData, setFormData] = useState({
        fileUrl: "", // Changed from imageUrl to fileUrl
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const currServer = useSelector((state)=>state.server.currServer);
    const currChannel = useSelector((state)=>state.channel.currChannel);
    const currUser = useSelector((state)=>state.user.currUser);

    const handleFileUpload = (fileUrl) => {
        setFormData((prev) => ({
            ...prev,
            fileUrl: fileUrl, // Changed from imageUrl to fileUrl
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
    
        try {
            const dataToSend = {
                ...formData,
                channelId: currChannel?.id,
                serverId: currServer?.id,
                profileId: currUser?.id,
                content:""
            };
            
            console.log("DATA TO BE SEND - ",dataToSend);
            
    
            const response = await axios.post("http://localhost:3000/messages", dataToSend, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
    
            setFormData({
                fileUrl: "", 
            });

            setIsModalOpen(false);
    
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setIsModalOpen(false);
    };

    return (
        <Dialog open onOpenChange={handleClose}>
            <DialogContent className="bg-white text-black p-4 overflow-hidden">
                <DialogHeader className="pt-8 px-6 relative">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Add an attachment
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Send a file as message.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-8 px-6">
                        <div className="flex items-center justify-center text-center">
                            <FileUpload onUpload={handleFileUpload} />
                        </div>
                    </div>
                    <DialogFooter className="bg-gray-100 px-6 py-4 mt-7">
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting || !formData.fileUrl} // Changed from imageUrl to fileUrl
                        >
                            {isSubmitting ? "Sending..." : "Send"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default FileUploadModal;