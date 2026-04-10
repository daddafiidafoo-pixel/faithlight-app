import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, Search, Plus, X } from 'lucide-react';
import { useI18n } from '../components/I18nProvider';
import VoiceMessageRecorder from '../components/messaging/VoiceMessageRecorder';
import VoiceMessageBubble from '../components/messaging/VoiceMessageBubble';

export default function DirectMessages() {
  const { lang } = useI18n();
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [newConversation, setNewConversation] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser) {
          setUser(currentUser);
          loadConversations(currentUser.id);

          // Check premium status
          try {
            const premiumStatus = await base44.functions.invoke('getPremiumStatus', {
              user_id: currentUser.id,
            });
            setIsPremium(premiumStatus?.data?.is_premium || false);
          } catch (error) {
            console.error('Error checking premium:', error);
          }
        }
      } catch {
        alert(lang === 'om' ? 'Galmaa seenuu dhaabbichaa' : 'Please login to use messaging');
      }
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    fetchUser();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadConversations = async (userId) => {
    try {
      // Fetch conversations where user is participant
      const convs = await base44.entities.Conversation?.filter({ participant_ids: userId }) || [];
      setConversations(convs);

      if (convs.length > 0 && !selectedConversation) {
        setSelectedConversation(convs[0]);
        loadMessages(convs[0].id);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const msgs = await base44.entities.Message?.filter({ conversation_id: conversationId }, '-created_date', 100) || [];
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const createNewConversation = async () => {
    if (!recipientEmail.trim()) return;

    setLoading(true);
    try {
      // Create conversation
      const conversation = await base44.entities.Conversation?.create({
        participant_ids: [user.id],
        participant_emails: [user.email, recipientEmail],
        created_by: user.id,
      });

      if (conversation) {
        setConversations([...conversations, conversation]);
        setSelectedConversation(conversation);
        setMessages([]);
        setNewConversation(false);
        setRecipientEmail('');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert(lang === 'om' ? 'Dogoggora uumuu' : 'Error creating conversation');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setLoading(true);
    try {
      const message = await base44.entities.Message?.create({
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        sender_name: user.full_name,
        content: newMessage,
        message_type: 'text',
        is_read: false,
      });

      if (message) {
        setMessages([...messages, message]);
        setNewMessage('');
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert(lang === 'om' ? 'Dogoggora erguu' : 'Error sending message');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceSend = async (voiceData) => {
    if (!selectedConversation) return;

    setLoading(true);
    try {
      const message = await base44.entities.Message?.create({
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        sender_name: user.full_name,
        message_type: 'voice',
        audio_url: voiceData.audio_url,
        audio_duration_sec: voiceData.audio_duration_sec,
        audio_size_bytes: voiceData.audio_size_bytes,
        mime_type: voiceData.mime_type,
        is_read: false,
      });

      if (message) {
        setMessages([...messages, message]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (error) {
      console.error('Error sending voice message:', error);
      alert(lang === 'om' ? 'Dogoggora erguu' : 'Error sending message');
    } finally {
      setLoading(false);
    }
  };

  const handleReportMessage = async (messageId) => {
    try {
      const msg = messages.find(m => m.id === messageId);
      if (msg) {
        // Create content report
        await base44.entities.ContentReport?.create({
          content_type: 'voice_message',
          content_id: messageId,
          reported_by: user.id,
          reason: 'voice_message_violation',
          status: 'pending',
        });
      }
    } catch (error) {
      console.error('Error reporting message:', error);
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      await base44.entities.UserBlock?.create({
        user_id: user.id,
        blocked_user_id: userId,
      });
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant_emails?.some(email => email.includes(searchQuery.toLowerCase()))
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">
              {lang === 'om' ? 'Seenuu dandeessuu dhaabbichaa' : 'Please login to access messaging'}
            </p>
            <Button onClick={() => base44.auth.redirectToLogin()}>
              {lang === 'om' ? 'Seenuun' : 'Login'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen max-w-6xl mx-auto flex">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-[var(--faith-light-primary-dark)] mb-4">
            {lang === 'om' ? 'Seenuu' : 'Messages'}
          </h1>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder={lang === 'om' ? 'Barbaadi' : 'Search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => setNewConversation(true)}
            className="w-full gap-2 bg-[var(--faith-light-primary)] hover:bg-[var(--faith-light-primary-light)]"
          >
            <Plus className="w-4 h-4" />
            {lang === 'om' ? 'Seenuu Haaraa' : 'New Chat'}
          </Button>
        </div>

        {newConversation && (
          <div className="p-4 border-b border-gray-200 bg-blue-50">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">
                {lang === 'om' ? 'Seenuu Haaraa' : 'New Conversation'}
              </h3>
              <button onClick={() => setNewConversation(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder={lang === 'om' ? 'Email' : 'Email address'}
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
              <Button
                onClick={createNewConversation}
                disabled={loading || !recipientEmail.trim()}
                className="w-full bg-[var(--faith-light-primary)] hover:bg-[var(--faith-light-primary-light)]"
              >
                {lang === 'om' ? 'Jalqabuu' : 'Start'}
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => {
                setSelectedConversation(conv);
                loadMessages(conv.id);
              }}
              className={`w-full text-left p-4 border-b border-gray-200 transition-colors ${
                selectedConversation?.id === conv.id
                  ? 'bg-white border-l-4 border-l-[var(--faith-light-primary)]'
                  : 'hover:bg-white'
              }`}
            >
              <div className="font-medium text-gray-900 truncate">
                {conv.participant_emails?.[0] === user.email
                  ? conv.participant_emails?.[1]
                  : conv.participant_emails?.[0]}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {lang === 'om' ? 'Seenuu' : 'Message thread'}
              </div>
            </button>
          ))}

          {filteredConversations.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              {lang === 'om' ? 'Seenuu hin jiru' : 'No conversations'}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">
                {selectedConversation.participant_emails?.[0] === user.email
                  ? selectedConversation.participant_emails?.[1]
                  : selectedConversation.participant_emails?.[0]}
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => {
                // Voice message
                if (msg.message_type === 'voice') {
                  return (
                    <div key={idx}>
                      <VoiceMessageBubble
                        message={msg}
                        isOwn={msg.sender_id === user.id}
                        onReport={handleReportMessage}
                        onBlock={handleBlockUser}
                      />
                    </div>
                  );
                }

                // Text message
                return (
                  <div
                    key={idx}
                    className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.sender_id === user.id
                          ? 'bg-[var(--faith-light-primary)] text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-900 rounded-bl-none'
                      }`}
                    >
                      {msg.sender_id !== user.id && (
                        <div className="text-xs font-semibold mb-1 opacity-75">
                          {msg.sender_name}
                        </div>
                      )}
                      <p className="text-sm break-words">{msg.content}</p>
                      <div className="text-xs mt-1 opacity-70">
                        {new Date(msg.created_date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 flex gap-2 relative">
              <Input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={lang === 'om' ? 'Ergaa barreessi' : 'Type a message...'}
                disabled={loading}
              />
              <VoiceMessageRecorder
                onSend={handleVoiceSend}
                isPremium={isPremium}
                isOnline={isOnline}
              />
              <Button
                type="submit"
                disabled={loading || !newMessage.trim()}
                className="gap-2 bg-[var(--faith-light-primary)] hover:bg-[var(--faith-light-primary-light)]"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Card className="w-80 text-center">
              <CardContent className="pt-6">
                <p className="text-gray-600">
                  {lang === 'om' ? 'Seenuu filadhu' : 'Select a conversation to start'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}