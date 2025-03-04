import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import { SocketProvider } from "./SocketContext";
import App from "./App.jsx";
import "./index.css";


const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;


if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SocketProvider>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        signUpFallbackRedirectUrl="/"
        signInFallbackRedirectUrl="/"
        navigate={(to) => {
          window.location.href = to;
        }}
        afterSignOutUrl="/"
      >
        <BrowserRouter>
          <Provider store={store}>
            <App />
          </Provider>
        </BrowserRouter>
      </ClerkProvider>
    </SocketProvider>
  </StrictMode>
);