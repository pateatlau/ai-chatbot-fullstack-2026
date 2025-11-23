import DataLoader from 'dataloader';

/**
 * DataLoaders for batching queries and preventing N+1 problems
 * Batches requests to subgraphs to improve performance
 */

export interface DataLoaders {
  userLoader: DataLoader<string, any>;
  conversationLoader: DataLoader<string, any>;
  messageLoader: DataLoader<string, any>;
}

/**
 * Create dataloaders for the current request
 * Each request gets its own dataloader instances to prevent cache pollution
 */
export function createDataLoaders(): DataLoaders {
  return {
    /**
     * Batch load users by ID
     * Prevents N+1 queries when fetching users in lists
     */
    userLoader: new DataLoader(async (userIds: readonly string[]) => {
      console.log(`[DataLoader] Batching ${userIds.length} users`);

      // Map user IDs to promises (would call auth-service in real scenario)
      // For now, return mock data
      return userIds.map((id) => ({
        id,
        email: `user-${id}@example.com`,
        name: `User ${id}`,
        role: 'USER',
      }));
    }),

    /**
     * Batch load conversations by ID
     * Prevents N+1 queries when fetching conversations in lists
     */
    conversationLoader: new DataLoader(
      async (conversationIds: readonly string[]) => {
        console.log(
          `[DataLoader] Batching ${conversationIds.length} conversations`
        );

        // Map conversation IDs to promises (would call chatbot-service in real scenario)
        // For now, return mock data
        return conversationIds.map((id) => ({
          id,
          userId: 'user-123',
          title: `Conversation ${id}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
      }
    ),

    /**
     * Batch load messages by ID
     * Prevents N+1 queries when fetching messages in lists
     */
    messageLoader: new DataLoader(async (messageIds: readonly string[]) => {
      console.log(`[DataLoader] Batching ${messageIds.length} messages`);

      // Map message IDs to promises (would call chatbot-service in real scenario)
      // For now, return mock data
      return messageIds.map((id) => ({
        id,
        conversationId: 'conv-123',
        role: 'assistant',
        content: `Message ${id}`,
        tokenCount: 50,
        createdAt: new Date(),
      }));
    }),
  };
}
