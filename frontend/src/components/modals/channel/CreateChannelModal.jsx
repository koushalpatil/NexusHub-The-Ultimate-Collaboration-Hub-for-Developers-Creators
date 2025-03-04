import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Bounce } from "react-toastify";
import {
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Dialog,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { useSelector, useDispatch } from "react-redux";
import { setCurrServer } from "@/redux/slices/serverSlice";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { toast } from "react-toastify";

const CreateChannelModal = ({ setIsModalOpen,channelType }) => {
    const { user } = useUser();
    const [isMounted, setIsMounted] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        type: channelType, // Default type
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    const [errors, setErrors] = useState(""); // Validation error message

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const currServer = useSelector((state) => state.server.currServer);

   
    

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const validateForm = () => {
        if (!formData.name.trim()) {
            setErrors("Channel name is required.");
            return false;
        }
        if (formData.name.trim().toLowerCase() === "general") {
            setErrors('Channel name cannot be "general".');
            return false;
        }
        setErrors("");
        return true;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        validateForm(); // Validate on input change
    };

    const handleTypeChange = (value) => {
        setFormData((prev) => ({ ...prev, type: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
           
            const dataToSend = {
                ...formData,
                user: user.id,
                serverId: currServer.id 
            };

            console.log("data to be send from create channel modal - ",dataToSend);

            
            
            const response = await fetch(`http://localhost:3000/channel`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSend),
            });
            

            const data = await response.json();
            if (data.channel) {
                console.log("DATA RECEIVED AFTER CHANNEL CREATION IS - ",data.channel);
                toast.success("Channel created Succesfully",{
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                    });
                navigate(`/server/${currServer.id}`);  
                setTimeout(() => {
                    window.location.reload();
                }, 10);
                    
            }

            setFormData({
                name: "",
                type: "TEXT",
            });
        } catch (error) {
            toast.error("Error while creating channel",{
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
                });
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setIsOpen(false);
        if (!user) {
            navigate("/");
        } else {
            navigate(currServer?.id ? `/server/${currServer.id}` : "/");
        }
    };

    if (!isMounted) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white text-black p-4 overflow-hidden">
                <DialogHeader className="pt-8 px-6 relative">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Create Channel
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="space-y-8 px-6">
                        <div>
                            <label className="uppercase text-xs font-bold text-zinc-500 dark:secondary/70">
                                Channel name
                            </label>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className={`bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0 ${errors ? "is-invalid" : ""
                                    }`}
                                placeholder="Enter channel name"
                            />
                            {errors && <div className="text-danger mt-1">{errors}</div>}
                        </div>
                        <div>
                            <label className="uppercase text-xs font-bold text-zinc-500 dark:secondary/70">
                                Channel Type
                            </label>
                            <Select onValueChange={handleTypeChange} value={formData.type}>
                                <SelectTrigger className="bg-zinc-300/50 text-black">
                                    <SelectValue>{formData.type || "Select type"}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TEXT">Text</SelectItem>
                                    <SelectItem value="AUDIO">Audio</SelectItem>
                                    <SelectItem value="VIDEO">Video</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="bg-gray-100 px-6 py-4 mt-7">
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting || !!errors}
                        >
                            {isSubmitting ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateChannelModal;
