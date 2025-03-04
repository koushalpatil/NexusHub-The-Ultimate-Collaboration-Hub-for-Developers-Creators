import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "../../file-upload";
import { useUser } from "@clerk/clerk-react";
import {
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Dialog,
    DialogDescription,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { useSelector, useDispatch } from "react-redux";
import { setCurrServer } from "@/redux/slices/serverSlice";

const EditServerModal = ({ server, setIsModalOpen }) => {
    const { user } = useUser();
    const [isMounted, setIsMounted] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        imageUrl: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const currServerId = useSelector((state) => state.server.currServerId);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (server) {
            setFormData({
                name: server.name || "",
                imageUrl: server.imageUrl || "",
            });
        }
    }, [server]);

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
            const response = await fetch(`http://localhost:3000/servers/${server?.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    user: { id: user?.id },  // Ensuring correct structure
                }),
            });
    
            console.log("Response from EditServerModal:", response);
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update server.");
            }
    
            const data = await response.json();
            dispatch(setCurrServer(data.server));
    
            setFormData({ name: "", imageUrl: "" });
    
            navigate(`/server/${data.server.id}`);
            setTimeout(() => {
                window.location.reload();
            }, 10);
    
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };
    

    const handleClose = () => {
        if (!user) {
            navigate("/");
        } else {
            if (currServerId) {
                navigate(`/server/${currServerId}`);
            } else {
                navigate("/");
            }
        }
        setIsModalOpen(false);
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
                        Give your server a personality with a name and an image. You can always change it later.
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
                            {isSubmitting ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditServerModal;
