import Navbar from "@/components/Navbar";
import ChatSidebar from "@/components/ChatSidebar";
import MainChatPage from "@/components/MainChatPage";

const ChatHome = () => {
  return (
    <div className="w-full h-screen">
      <Navbar />
      <div className="w-full h-[calc(100vh-56px)] flex">
        <ChatSidebar />
        <MainChatPage />
      </div>
    </div>
  );
};

export default ChatHome;
