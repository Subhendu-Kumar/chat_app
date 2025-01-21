import Navbar from "@/components/Navbar";
import ChatSidebar from "@/components/ChatSidebar";
import MainChatPage from "@/components/MainChatPage";
import { useAuth } from "@/context/AuthContext";

const ChatHome = () => {
  const { selectedChat } = useAuth();
  return (
    <div className="w-full h-screen">
      <Navbar />
      <div className="w-full h-[calc(100vh-56px)] flex">
        <ChatSidebar />
        {selectedChat ? (
          <MainChatPage />
        ) : (
          <div className="w-[75%] h-full flex items-center justify-center flex-col gap-4">
            <img src="./logo.svg" alt="logo" className="w-20 h-20" />
            <p className="text-xl font-semibold font-serif select-none">
              RelayChat for web
            </p>
            <div className="text-center text-sm">
              <p>Stay connected, anytime, anywhere</p>
              <p>
                Use RelayChat seamlessly across multiple devices without relying
                on your phone being online.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHome;
