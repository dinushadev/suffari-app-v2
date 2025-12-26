"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/data/apiConfig';
import { getMessages, sendMessage, subscribeToMessages } from '@/data/useMessages';
import { MessageBubble, MessageInput } from '@/components/molecules';
import { Loader, ErrorDisplay, FullScreenLoader } from '@/components/atoms';
import { ButtonV2 } from '@/components/atoms';
import type { Message } from '@/types/message';
import { useBookingDetails } from '@/data/useBookingDetails';

export default function MessagePage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  const { data: booking, isLoading: bookingLoading } = useBookingDetails(bookingId);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        router.push('/auth');
        return;
      }
      setUserId(session.user.id);
      setAuthChecked(true);
    };
    checkAuth();
  }, [router]);

  // Load initial messages
  useEffect(() => {
    if (!authChecked || !bookingId) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMessages(bookingId);
        // Sort messages by createdAt timestamp
        const sortedMessages = [...data.items].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sortedMessages);
      } catch (err) {
        console.error('Error loading messages:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [authChecked, bookingId]);

  // Set up subscription
  useEffect(() => {
    if (!authChecked || !bookingId) return;

    let mounted = true;

    const setupSubscription = async () => {
      try {
        const subscription = await subscribeToMessages(bookingId, (newMessage) => {
          if (!mounted) return;
          
          setMessages((prev) => {
            // Check if message already exists (avoid duplicates)
            const exists = prev.some((msg) => msg.id === newMessage.id);
            if (exists) return prev;
            
            // Add new message and sort
            const updated = [...prev, newMessage].sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            return updated;
          });
        });

        if (mounted) {
          subscriptionRef.current = subscription;
        } else {
          subscription.unsubscribe();
        }
      } catch (err) {
        console.error('Error setting up subscription:', err);
        if (mounted) {
          setError(err as Error);
        }
      }
    };

    setupSubscription();

    return () => {
      mounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [authChecked, bookingId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (content: string) => {
    if (!bookingId || sending) return;

    try {
      setSending(true);
      setError(null);
      const newMessage = await sendMessage(bookingId, content);
      
      // Add message to list (subscription will also add it, but this provides immediate feedback)
      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id === newMessage.id);
        if (exists) return prev;
        return [...prev, newMessage].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err as Error);
    } finally {
      setSending(false);
    }
  };

  if (!authChecked || bookingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <FullScreenLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-background p-4">
      <div className="w-full max-w-lg bg-ivory dark:bg-card rounded-3xl shadow-xl overflow-hidden mt-0 sm:mt-8">
        {/* Header */}
        <div className="border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Messages
              </h1>
              {booking && (
                <p className="text-sm text-muted-foreground mt-1">
                  {booking.location?.name || 'Booking'} #{bookingId.slice(0, 8)}
                </p>
              )}
            </div>
            <ButtonV2
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              Back
            </ButtonV2>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4">
            <ErrorDisplay
              error={error}
              onRetry={() => {
                setError(null);
                // Reload messages
                const loadMessages = async () => {
                  try {
                    setLoading(true);
                    const data = await getMessages(bookingId);
                    const sortedMessages = [...data.items].sort(
                      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    );
                    setMessages(sortedMessages);
                  } catch (err) {
                    setError(err as Error);
                  } finally {
                    setLoading(false);
                  }
                };
                loadMessages();
              }}
              onSignIn={() => router.push('/auth')}
            />
          </div>
        )}

        {/* Messages Container */}
        <div className="p-0">
          <div className="h-[500px] overflow-y-auto p-4 bg-background dark:bg-card">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-center">
                  No messages yet.
                  <br />
                  <span className="text-sm">Start the conversation!</span>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    currentUserId={userId}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border bg-background">
          <MessageInput
            onSend={handleSend}
            disabled={loading}
            loading={sending}
          />
        </div>
      </div>
    </div>
  );
}
