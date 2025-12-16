import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { supabaseServer } from '@/lib/supabaseServer';

/**
 * Cache previous messages for a chat using React's cache()
 * This deduplicates calls within the same request/render
 * Perfect for RAG where we might fetch messages multiple times
 */
export const getCachedMessages = cache(async (chatId: string) => {
    console.log(`[Cache] Fetching messages for chat: ${chatId}`);

    const { data } = await supabaseServer
        .from('messages')
        .select('role, content')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
        .limit(10);

    return data || [];
});

/**
 * Cache user's chat history with 30-second revalidation
 * Reduces database load for frequently accessed history
 */
export const getCachedChatHistory = unstable_cache(
    async (userId: string) => {
        console.log(`[Cache] Fetching chat history for user: ${userId}`);

        const { data, error } = await supabaseServer
            .from('query_history')
            .select('id, question, answer, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        return data || [];
    },
    ['chat-history'],
    {
        revalidate: 30, // Cache for 30 seconds
        tags: ['chat-history']
    }
);

/**
 * Cache user's document metadata with 60-second revalidation
 * Documents don't change frequently, safe to cache
 */
export const getCachedUserDocuments = unstable_cache(
    async (userId: string) => {
        console.log(`[Cache] Fetching documents for user: ${userId}`);

        const { data, error } = await supabaseServer
            .from('documents_metadata')
            .select('*')
            .eq('user_id', userId)
            .order('uploaded_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },
    ['user-documents'],
    {
        revalidate: 60, // Cache for 1 minute
        tags: ['user-documents']
    }
);

/**
 * Cache user's chats list with 30-second revalidation
 * Frequently accessed, changes only when new chat is created
 */
export const getCachedUserChats = unstable_cache(
    async (userId: string) => {
        console.log(`[Cache] Fetching chats for user: ${userId}`);

        const { data, error } = await supabaseServer
            .from('chats')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },
    ['user-chats'],
    {
        revalidate: 30,
        tags: ['user-chats']
    }
);

/**
 * Helper to invalidate cache tags
 * Use after mutations (create, update, delete)
 */
export async function invalidateUserCache(userId: string, type: 'chats' | 'documents' | 'history') {
    const { revalidateTag } = require('next/cache');
    // Map the type to the actual tag used in unstable_cache
    const tagMap = {
        chats: 'user-chats',
        documents: 'user-documents',
        history: 'chat-history',
    };
    revalidateTag(tagMap[type]);
}
