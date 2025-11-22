import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import {
  GET_CONVERSATIONS,
  GET_CONVERSATION,
  GET_CHAT_STATS,
  SEARCH_CONVERSATIONS,
  CREATE_CONVERSATION,
  UPDATE_CONVERSATION,
  DELETE_CONVERSATION,
  SEND_MESSAGE,
  DELETE_MESSAGE,
} from '../queries';

/**
 * Hook to fetch paginated list of conversations
 */
export function useConversations(page = 1, limit = 10) {
  return useQuery(GET_CONVERSATIONS, {
    variables: {
      input: { page, limit },
    },
    pollInterval: 0, // Don't poll by default
    errorPolicy: 'all',
  });
}

/**
 * Hook to fetch a single conversation with its messages
 */
export function useConversation(id: string | null) {
  return useQuery(GET_CONVERSATION, {
    variables: { id },
    skip: !id, // Skip query if no ID provided
    errorPolicy: 'all',
  });
}

/**
 * Hook to fetch chat statistics
 */
export function useChatStats() {
  return useQuery(GET_CHAT_STATS, {
    pollInterval: 30000, // Poll every 30 seconds
    errorPolicy: 'all',
  });
}

/**
 * Hook to search conversations
 */
export function useSearchConversations(query: string, page = 1, limit = 10) {
  return useQuery(SEARCH_CONVERSATIONS, {
    variables: {
      query,
      input: { page, limit },
    },
    skip: !query, // Skip if no search query
    errorPolicy: 'all',
  });
}

/**
 * Hook to create a new conversation
 */
export function useCreateConversation() {
  const client = useApolloClient();
  const [createConversation] = useMutation(CREATE_CONVERSATION, {
    onCompleted: () => {
      // Refetch conversations list after creating new one
      client.refetchQueries({
        include: [GET_CONVERSATIONS],
      });
    },
    errorPolicy: 'all',
  });

  return (title?: string) => {
    return createConversation({
      variables: {
        input: { title: title || 'New Conversation' },
      },
    });
  };
}

/**
 * Hook to update a conversation (e.g., rename)
 */
export function useUpdateConversation() {
  const client = useApolloClient();
  const [updateConversation] = useMutation(UPDATE_CONVERSATION, {
    onCompleted: (data) => {
      if (data?.updateConversation?.conversation?.id) {
        // Refetch both the conversations list and the specific conversation
        client.refetchQueries({
          include: [GET_CONVERSATIONS, GET_CONVERSATION],
        });
      }
    },
    errorPolicy: 'all',
  });

  return (id: string, title: string) => {
    return updateConversation({
      variables: {
        id,
        input: { title },
      },
    });
  };
}

/**
 * Hook to delete a conversation
 */
export function useDeleteConversation() {
  const client = useApolloClient();
  const [deleteConversation] = useMutation(DELETE_CONVERSATION, {
    onCompleted: () => {
      // Refetch conversations list after deletion
      client.refetchQueries({
        include: [GET_CONVERSATIONS],
      });
    },
    errorPolicy: 'all',
  });

  return (id: string) => {
    return deleteConversation({
      variables: { id },
    });
  };
}

/**
 * Hook to send a message in a conversation
 */
export function useSendMessage() {
  const client = useApolloClient();
  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onCompleted: (data) => {
      if (data?.sendMessage?.conversationId) {
        // Refetch conversation to get updated messages
        client.refetchQueries({
          include: [GET_CONVERSATION],
        });

        // Also refetch stats
        client.refetchQueries({
          include: [GET_CHAT_STATS],
        });
      }
    },
    errorPolicy: 'all',
  });

  return (conversationId: string, content: string) => {
    return sendMessage({
      variables: {
        conversationId,
        input: { content },
      },
    });
  };
}

/**
 * Hook to delete a message from a conversation
 */
export function useDeleteMessage() {
  const client = useApolloClient();
  const [deleteMessage] = useMutation(DELETE_MESSAGE, {
    onCompleted: (data) => {
      if (data?.deleteMessage?.success) {
        // Refetch conversation to get updated messages
        client.refetchQueries({
          include: [GET_CONVERSATION],
        });
      }
    },
    errorPolicy: 'all',
  });

  return (conversationId: string, messageId: string) => {
    return deleteMessage({
      variables: {
        conversationId,
        messageId,
      },
    });
  };
}
