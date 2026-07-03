import type React  from "react";
import { EllipsisVertical } from "lucide-react";
import { useConversationStore } from "../../store/conversatonStore";

const ChatHeader :React.FC=()=>{
    const {selectedConversation} = useConversationStore();
    return <>
    <div className="p-4 border-b border-gray-200 flex items-center justify-between ">
        <div className="flex items-center space-x-3">
            <div>
                <h2 className="font-semibold">{selectedConversation?.friend?.username}</h2>
                <p className={`${selectedConversation?.friend.online ? 'text-sm text-green-500':'text-sm text-gray-500'}`}>
                    {selectedConversation?.friend.online?'Online':'Offline'}

                </p>


            </div>


        </div>
        <div className="flexspace-x-4">
            <button className="text-gray-500 hover:text-gray-700 cursor-pointer">
                <EllipsisVertical className="size-[16px]"/>
            </button>

        </div>


    </div>
    </>

}
export default ChatHeader;