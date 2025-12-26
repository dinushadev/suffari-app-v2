"use client";

import { generateClient } from 'aws-amplify/api';
import { getAuthToken } from '@/lib/messageAuth';
import '@/lib/amplifyConfig'; // Initialize Amplify
import type { Message, MessageList } from '@/types/message';

const client = generateClient();

/**
 * Send a message
 */
export async function sendMessage(bookingId: string, content: string): Promise<Message> {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }

  const mutation = `
    mutation SendMessage($bookingId: ID!, $content: String) {
      sendMessage(bookingId: $bookingId, content: $content, type: TEXT) {
        id
        content
        createdAt
        senderId
        type
      }
    }
  `;

  try {
    const response = await client.graphql({
      query: mutation,
      variables: { bookingId, content },
      authToken: token,
    });

    if ('errors' in response && response.errors && response.errors.length > 0) {
      throw new Error(response.errors[0].message || 'Failed to send message');
    }

    if (!('data' in response) || !response.data) {
      throw new Error('No data returned from sendMessage');
    }

    // Type assertion: after checking for 'data', we know it's GraphQLResult
    const result = response as { data: { sendMessage: Message } };
    return result.data.sendMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Get messages for a booking
 */
export async function getMessages(bookingId: string): Promise<MessageList> {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }

  const query = `
    query GetMessages($bookingId: ID!) {
      getMessages(bookingId: $bookingId) {
        items {
          id
          content
          senderId
          createdAt
          type
        }
        nextToken
      }
    }
  `;

  try {
    const response = await client.graphql({
      query,
      variables: { bookingId },
      authToken: token,
    });

    if ('errors' in response && response.errors && response.errors.length > 0) {
      throw new Error(response.errors[0].message || 'Failed to fetch messages');
    }

    if (!('data' in response) || !response.data) {
      return { items: [], nextToken: null };
    }

    // Type assertion: after checking for 'data', we know it's GraphQLResult
    const result = response as { data: { getMessages?: MessageList } };
    return result.data.getMessages || { items: [], nextToken: null };
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

/**
 * Subscribe to new messages for a booking
 * @param bookingId - The booking ID
 * @param onMessage - Callback function when a new message is received
 * @returns Subscription object with unsubscribe method
 */
export async function subscribeToMessages(
  bookingId: string,
  onMessage: (msg: Message) => void
): Promise<{ unsubscribe: () => void }> {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }

  const subscription = `
    subscription OnMessageReceived($bookingId: ID!) {
      onMessageReceived(bookingId: $bookingId) {
        id
        content
        senderId
        createdAt
        type
      }
    }
  `;

  // Pass auth token for Lambda authorization
  // For subscriptions, graphql returns an observable with subscribe method
  const graphqlResult = client.graphql({
    query: subscription,
    variables: { bookingId },
    authToken: token,
  }) as { subscribe: (handlers: {
    next: (value: { data?: { onMessageReceived?: Message } }) => void;
    error: (error: unknown) => void;
  }) => { unsubscribe: () => void } };
  
  const sub = graphqlResult.subscribe({
    next: ({ data }) => {
      if (data && data.onMessageReceived) {
        onMessage(data.onMessageReceived);
      }
    },
    error: (err) => {
      console.error('Subscription error:', err);
    },
  });

  return {
    unsubscribe: () => {
      sub.unsubscribe();
    },
  };
}

