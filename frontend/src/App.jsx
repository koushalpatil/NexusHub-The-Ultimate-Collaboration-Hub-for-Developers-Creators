import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Routes, Route, Outlet } from "react-router-dom";
import Home from "./components/pages/Home";
import "./App.css";
import { ThemeProvider } from "./components/providers/theme-provider";
import { useEffect } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import InitialModal from "./components/modals/InitialModal";
import { useNavigate } from "react-router-dom";
import ServerPage from "./components/pages/ServerPage";
import ServerLayout from "./components/layouts/ServerLayout";
import { useDispatch } from "react-redux";
import { setServerId } from "./redux/slices/serverSlice";
import ServerIdLayout from "./components/layouts/ServerIdLayout";

function App() {
  const { user } = useUser();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const sendUserData = async () => {
      try {
        const userData = { user };

        const response = await axios.post("http://localhost:3000/user", userData, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });

        if (response.data.redirectUrl) {
          navigate(response.data.redirectUrl);
        }

       dispatch(setServerId(response.data.serverId));
        
        console.log("Server response:", response.data);
      } catch (error) {
        console.error("Error sending user data:", error);
      }
    };

    if (user) {
      sendUserData();
    }
  }, [user]);

  
  useEffect(() => {
   
    const currentTheme = localStorage.getItem('theme') || 'dark'; 
    document.body.classList.add(currentTheme); 
    return () => {
      document.body.classList.remove(currentTheme); 
    };
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme" attribute="class">
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <Routes>
          {/* Home Route */}
          <Route path="/" element={<Home />} />
          {/* All Routes Related to /server */}
          <Route path="/server" element={<ServerLayout />}>
            <Route index element={<InitialModal />} />
            {/* All Routes related to /server/:id */}
            <Route path=":id" element={<ServerIdLayout />} >
              <Route index element={<ServerPage />} />
            </Route>
          </Route>
        </Routes>
      </SignedIn>
    </ThemeProvider>
  );
}

export default App;
