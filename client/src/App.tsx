import {
  Route,
  Routes,
  Navigate,
  BrowserRouter as Router,
} from "react-router-dom";
import Signin from "./pages/auth/Signin";
import Signup from "./pages/auth/Signup";
import ChatHome from "./pages/chat/ChatHome";
import { useAuth } from "./context/AuthContext";
import { Toaster } from "./components/ui/toaster";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        <Route
          path=""
          element={
            isAuthenticated ? (
              <Navigate to="/chats" />
            ) : (
              <Navigate to="/auth/signin" />
            )
          }
        />
        <Route
          path="/auth/signin"
          element={isAuthenticated ? <Navigate to="/chats" /> : <Signin />}
        />
        <Route
          path="/auth/signup"
          element={isAuthenticated ? <Navigate to="/chats" /> : <Signup />}
        />
        <Route
          path="/chats"
          element={
            isAuthenticated ? <ChatHome /> : <Navigate to="/auth/signin" />
          }
        />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
