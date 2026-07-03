import { ChatWindow } from "../../components/ChatWindow/ChatWindow";

import Sidebar from "../../components/Sidebar/Sidebar";
import { SocketProvider } from "../../contexts/SocketContext";


const Chat: React.FC = () => {
   

    
return (
  <SocketProvider>
    <div className="min-h-screen flex bg-gray-100">
      <div className="w-full sm:w-1/3 sm:max-w-[456px] min-h-screen">
        <Sidebar />
      </div>
      <div className="hidden sm:flex flex-1 min-h-screen">
        <ChatWindow />
      </div>
    </div>
  </SocketProvider>
)
}

export default Chat;