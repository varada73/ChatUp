import type { Conversation } from "../contexts/ConversationContext";
import {create} from "zustand";

type ConversationState = {
    selectedConversation: Conversation | null,
    setSelectedConversation: (conversation: Conversation | null)=>void;
}
export const useConversationStore =create<ConversationState>((set)=>({
    selectedConversation: null,
    setSelectedConversation: (conversation)=>set({selectedConversation: conversation})
}))