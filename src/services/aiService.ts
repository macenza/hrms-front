import apiClient from './apiClient';

export interface ChatMessage {
    user_message: string;
    assistant_response: string;
}

export interface Conversation {
    conversation_id: string;
    title: string;
}

export const aiService = {
    /**
     * Create a new conversation session
     */
    createConversation: async (): Promise<{ conversation_id: string }> => {
        const response = await apiClient.post('/ai/conversations');
        return response.data.data;
    },

    /**
     * List all conversations for the authenticated user
     */
    listConversations: async (): Promise<Conversation[]> => {
        const response = await apiClient.get('/ai/conversations');
        return response.data.data.conversations;
    },

    /**
     * Get chat history for a specific conversation session
     */
    getConversationHistory: async (id: string): Promise<ChatMessage[]> => {
        const response = await apiClient.get(`/ai/conversations/${id}`);
        return response.data.data.messages;
    },

    /**
     * Delete a conversation session
     */
    deleteConversation: async (id: string): Promise<{ message: string }> => {
        const response = await apiClient.delete(`/ai/conversations/${id}`);
        return response.data.data;
    },

    /**
     * Rename a conversation title
     */
    renameConversation: async (id: string, title: string): Promise<{ message: string }> => {
        const response = await apiClient.patch(`/ai/conversations/${id}`, { title });
        return response.data.data;
    },

    /**
     * Send a chat message with optional slash command context trigger
     */
    sendMessage: async (
        conversation_id: string,
        message: string,
        slashCommand?: string
    ): Promise<{ response: string; conversation_id: string; message_id: string }> => {
        const response = await apiClient.post('/ai/chat', {
            conversation_id,
            message,
            slashCommand
        });
        return response.data.data;
    }
};
