import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "../file-upload";
import { useUser } from "@clerk/clerk-react";
import {
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Dialog,
    DialogDescription,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import axios from "axios";
import { useSelector } from "react-redux";

const InitialModal = () => {
    const { user } = useUser();
    const [isMounted, setIsMounted] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        imageUrl: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate(); 
    const currServerId = useSelector((state)=>(state.server.currServerId));

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileUpload = (fileUrl) => {
        setFormData((prev) => ({
            ...prev,
            imageUrl: fileUrl,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const dataToSend = {
                ...formData,
                user: user,
            };

            const response = await fetch("http://localhost:3000/server", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSend),
            });

            const data = await response.json();
            console.log("Server data created at supabase: ", data);
           

            setFormData({
                name: "",
                imageUrl: "",
            });
            navigate(`/server/${data.serverId}`);
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        // Close the modal and redirect to homepage
        if(!user)
        {
        navigate("/");
        }
        else
        {
            console.log("Current server id : ",currServerId);
            if(currServerId)
            {
            navigate(`/server/${currServerId}`);
            }
            else
            {
                navigate('/');
            }
        } 
    };

    if (!isMounted) {
        return null;
    }

    return (
        <Dialog open onOpenChange={handleClose}>
            <DialogContent className="bg-white text-black p-4 overflow-hidden">
                <DialogHeader className="pt-8 px-6 relative">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Customize your server
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Give your server a personality with a name and an image. You can
                        always change it later.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-8 px-6">
                        <div className="flex items-center justify-center text-center">
                            <FileUpload onUpload={handleFileUpload} />
                        </div>

                        <div>
                            <label className="uppercase text-xs font-bold text-zinc-500 dark:secondary/70">
                                Server name
                            </label>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                                placeholder="Enter server name"
                            />
                        </div>
                    </div>
                    <DialogFooter className="bg-gray-100 px-6 py-4 mt-7">
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting || !formData.name || !formData.imageUrl}
                        >
                            {isSubmitting ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default InitialModal;
