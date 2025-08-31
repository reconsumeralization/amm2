'use client';
import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useCookies } from 'react-cookie';
// Stripe integration temporarily disabled due to module resolution issues
// import { loadStripe } from '@stripe/stripe-js';
import { parseISO } from 'date-fns';

// Temporary placeholder until Stripe module resolution is fixed
const stripePromise = Promise.resolve(null);

interface Message {
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

interface ChatbotSettings {
  id: string;
  name: string;
  isActive: boolean;
  tenant: string;
  settings: {
    welcomeMessage: string;
    displayPaths: Array<{ path: string }>;
    allowedRoles: string[];
    aiTriggers: {
      pendingAppointments: boolean;
      staffAvailability: boolean;
      newServices: boolean;
    };
    behavior: {
      autoOpen: boolean;
      typingIndicator: boolean;
      maxRetries: number;
    };
    styles: {
      position: string;
      backgroundColor: string;
      borderRadius: string;
      maxWidth: string;
    };
  };
  integration: {
    openaiApiKey?: string;
    model: string;
    temperature: number;
    maxTokens: number;
  };
}

export default function BookingChatbot({ userId = 'user-id-placeholder', tenantId = 'tenant-id-placeholder' }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState('menu');
  const [bookingData, setBookingData] = useState({
    service: '',
    date: '',
    userId,
    appointmentId: '',
    tenantId,
    staffId: '',
  });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatbotSettings, setChatbotSettings] = useState<ChatbotSettings | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [cookies, setCookie] = useCookies(['chatbot_display']);
  const pathname = usePathname();

    const checkVisibility = useCallback(async (settingsData: ChatbotSettings['settings']) => {
    try {
      // Check path restrictions
      const displayPaths = settingsData.displayPaths || [];
      const isAllowedPath = displayPaths.some(({ path }: { path: string }) =>
        pathname ? pathname.startsWith(path) : false
      );

      if (!isAllowedPath) {
        setIsVisible(false);
        return;
      }

      // Check role restrictions
      const allowedRoles = settingsData.allowedRoles || ['customer', 'staff'];
      const userRes = await fetch(`/api/users/${userId}`);
      if (!userRes.ok) throw new Error('Failed to fetch user');
      const user = await userRes.json();
      const userRole = user?.role || 'customer';

      if (!allowedRoles.includes(userRole)) {
        setIsVisible(false);
        return;
      }

      // AI-driven triggers
      const aiTriggers = settingsData.aiTriggers;
      if (aiTriggers) {
        let shouldShow = true;

        if (aiTriggers.pendingAppointments) {
          const appointmentsRes = await fetch(`/api/appointments?where[tenant][equals]=${tenantId}&where[user][equals]=${userId}&where[status][equals]=pending`);
          const appointmentsData = await appointmentsRes.json();
          shouldShow = shouldShow && appointmentsData.docs.length > 0;
        }

        if (aiTriggers.staffAvailability) {
          const staffRes = await fetch(`/api/users?where[role][equals]=staff&where[tenant][equals]=${tenantId}&where[status][equals]=available`);
          const staffData = await staffRes.json();
          shouldShow = shouldShow && staffData.docs.length > 0;
        }

        if (shouldShow && !cookies.chatbot_display) {
          const aiRes = await fetch('/api/ai/chatbot-visibility', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              tenantId,
              pathname: pathname || '',
              context: { appointments: appointments.length, staff: staff.length }
            }),
          });

          if (aiRes.ok) {
            const { show } = await aiRes.json();
            shouldShow = shouldShow && show;
          }
        }

        if (shouldShow) {
          setCookie('chatbot_display', 'true', { path: '/', maxAge: 3600 });
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } else {
        setIsVisible(true);
      }

    } catch (err) {
      console.error('Error checking visibility:', err);
      setIsVisible(false);
    }
  }, [pathname, userId, tenantId, cookies, setCookie, setIsVisible, appointments.length, staff.length]);

  // Load chatbot settings and initialize
  useEffect(() => {
    const initializeChatbot = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch chatbot settings from collection
        const chatbotRes = await fetch(`/api/chatbots?tenantId=${tenantId}&isActive=true`);
        if (!chatbotRes.ok) throw new Error('Failed to load chatbot settings');
        const chatbotData = await chatbotRes.json();

        if (!chatbotData.success || !chatbotData.data.docs.length) {
          setIsVisible(false);
          return;
        }

        const chatbot = chatbotData.data.docs[0];
        setChatbotSettings(chatbot);

        // Check if chatbot is active
        if (!chatbot.isActive) {
          setIsVisible(false);
          return;
        }

        // Create or find existing conversation
        const conversationRes = await fetch('/api/chatbot-conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: userId,
            chatbot: chatbot.id,
            tenant: tenantId,
            channel: 'web_chat',
          }),
        });

        if (conversationRes.ok) {
          const conversationData = await conversationRes.json();
          if (conversationData.success) {
            setConversationId(conversationData.data.conversationId);
          }
        }

        // Set welcome message
        const welcomeMessage = chatbot.settings?.welcomeMessage ||
          'Hello! How can I help you today? (book, reschedule, cancel, suggest times, assign staff, clock in/out)';

        setMessages([{
          text: welcomeMessage,
          sender: 'bot',
          timestamp: new Date()
        }]);

        // Check visibility based on settings
        await checkVisibility(chatbot.settings);

      } catch (err) {
        console.error('Error initializing chatbot:', err);
        setError('Failed to initialize chatbot');
      } finally {
        setIsLoading(false);
      }
    };

    initializeChatbot();
  }, [tenantId, pathname, userId, checkVisibility]);



  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch(`/api/appointments?where[tenant][equals]=${tenantId}&where[user][equals]=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch appointments');
      const data = await res.json();
      setAppointments(data.docs || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments');
    }
  }, [tenantId, userId]);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch(`/api/users?where[role][equals]=staff&where[tenant][equals]=${tenantId}`);
      if (!res.ok) throw new Error('Failed to fetch staff');
      const data = await res.json();
      setStaff(data.docs || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setError('Failed to load staff');
    }
  }, [tenantId]);

  const fetchServices = useCallback(async () => {
    try {
      // Fetch services from API
      const res = await fetch('/api/business-documentation');
      if (!res.ok) throw new Error('Failed to fetch services');
      const data = await res.json();
      setServices(data.docs.map((doc: any) => ({ name: doc.title, description: doc.description || '' })));
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services');
    }
  }, []);

  // Fetch data
  useEffect(() => {
    if (isVisible) {
      fetchAppointments();
      fetchStaff();
      fetchServices();
    }
  }, [isVisible, tenantId, userId, fetchAppointments, fetchServices, fetchStaff]);

  const addMessage = (text: string, sender: 'bot' | 'user') => {
    setMessages(prev => [...prev, { text, sender, timestamp: new Date() }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    addMessage(userMessage, 'user');
    setInput('');
    setIsLoading(true);
    setError(null);

    // Save user message to collection
    if (chatbotSettings && conversationId) {
      await fetch('/api/chat-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: userMessage,
          sender: userId,
          senderType: 'user',
          chatbot: chatbotSettings.id,
          tenant: tenantId,
          conversationId,
          messageType: 'text',
        }),
      });
    }

    try {
      const response = await fetch('/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          step,
          bookingData,
          appointments,
          staff,
          services,
          userId,
          tenantId,
          chatbotSettings: chatbotSettings?.settings,
          conversationId,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      if (data.error) {
        addMessage(`Sorry, I encountered an error: ${data.error}`, 'bot');

        // Save bot error message to collection
        if (chatbotSettings && conversationId) {
          await fetch('/api/chat-messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: `Sorry, I encountered an error: ${data.error}`,
              sender: chatbotSettings.id,
              senderType: 'bot',
              chatbot: chatbotSettings.id,
              tenant: tenantId,
              conversationId,
              messageType: 'text',
            }),
          });
        }
      } else {
        addMessage(data.response, 'bot');

        // Save bot response to collection
        if (chatbotSettings && conversationId) {
          await fetch('/api/chat-messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: data.response,
              sender: chatbotSettings.id,
              senderType: 'bot',
              chatbot: chatbotSettings.id,
              tenant: tenantId,
              conversationId,
              messageType: 'text',
              responseTime: data.responseTime,
              confidence: data.confidence,
              intent: data.intent,
              tags: data.tags || [],
            }),
          });
        }

        if (data.action) {
          await handleAction(data.action, data.actionData);
        }
        
        if (data.step) {
          setStep(data.step);
        }
        
        if (data.bookingData) {
          setBookingData(prev => ({ ...prev, ...data.bookingData }));
        }
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      addMessage('Sorry, I\'m having trouble right now. Please try again later.', 'bot');
      setError('Failed to process message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: string, actionData: any) => {
    try {
      switch (action) {
        case 'book_appointment':
          await bookAppointment(actionData);
          break;
        case 'reschedule_appointment':
          await rescheduleAppointment(actionData);
          break;
        case 'cancel_appointment':
          await cancelAppointment(actionData);
          break;
        case 'clock_in':
          await clockIn(actionData);
          break;
        case 'clock_out':
          await clockOut(actionData);
          break;
        case 'assign_staff':
          await assignStaff(actionData);
          break;
        case 'generate_hair_preview':
          await generateHairPreview(actionData);
          break;
        default:
          console.log('Unknown action:', action);
      }
    } catch (error) {
      console.error('Action error:', error);
      addMessage('Sorry, I couldn\'t complete that action. Please try again.', 'bot');
    }
  };

  const bookAppointment = async (data: any) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          tenantId,
          userId,
        }),
      });

      if (!res.ok) throw new Error('Failed to book appointment');
      
      const appointment = await res.json();
      addMessage(`Great! Your appointment has been booked for ${new Date(data.date).toLocaleDateString()} at ${new Date(data.date).toLocaleTimeString()}.`, 'bot');
      
      // Update appointments list
      await fetchAppointments();
      
      // Add loyalty points if applicable
      // Loyalty points integration can be added later if needed
    } catch (error) {
      throw error;
    }
  };

  const rescheduleAppointment = async (data: any) => {
    try {
      const res = await fetch(`/api/appointments/${data.appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: data.date,
          tenantId,
        }),
      });

      if (!res.ok) throw new Error('Failed to reschedule appointment');
      
      addMessage(`Your appointment has been rescheduled to ${new Date(data.date).toLocaleDateString()} at ${new Date(data.date).toLocaleTimeString()}.`, 'bot');
      await fetchAppointments();
    } catch (error) {
      throw error;
    }
  };

  const cancelAppointment = async (data: any) => {
    try {
      const res = await fetch(`/api/appointments/${data.appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
          tenantId,
        }),
      });

      if (!res.ok) throw new Error('Failed to cancel appointment');
      
      addMessage('Your appointment has been cancelled.', 'bot');
      await fetchAppointments();
    } catch (error) {
      throw error;
    }
  };

  const clockIn = async (data: any) => {
    try {
      const res = await fetch('/api/admin/staff-schedules/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'in',
          staffId: data.staffId || userId,
          tenantId,
        }),
      });

      if (!res.ok) throw new Error('Failed to clock in');
      
      addMessage('You have been clocked in successfully.', 'bot');
    } catch (error) {
      throw error;
    }
  };

  const clockOut = async (data: any) => {
    try {
      const res = await fetch('/api/admin/staff-schedules/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'out',
          staffId: data.staffId || userId,
          tenantId,
        }),
      });

      if (!res.ok) throw new Error('Failed to clock out');
      
      addMessage('You have been clocked out successfully.', 'bot');
    } catch (error) {
      throw error;
    }
  };

  const assignStaff = async (data: any) => {
    try {
      const res = await fetch(`/api/appointments/${data.appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff: data.staffId,
          tenantId,
        }),
      });

      if (!res.ok) throw new Error('Failed to assign staff');
      
      addMessage('Staff has been assigned to your appointment.', 'bot');
      await fetchAppointments();
    } catch (error) {
      throw error;
    }
  };

  const generateHairPreview = async (data: any) => {
    try {
      const res = await fetch('/api/features/hair-simulator/hair-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageId: data.imageId,
          prompt: data.prompt,
          userId,
          tenantId,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate hair preview');
      
      const result = await res.json();
      addMessage(`Here's your hair preview: ${result.url}`, 'bot');
    } catch (error) {
      throw error;
    }
  };

  if (!isVisible) return null;

  const chatbotStyles: any = chatbotSettings?.settings?.styles || {};
  const position = chatbotStyles.position || 'bottom-right';
  const backgroundColor = chatbotStyles.backgroundColor || '#ffffff';
  const borderRadius = chatbotStyles.borderRadius || '8px';
  const maxWidth = chatbotStyles.maxWidth || '400px';

  return (
    <div
      className={`fixed ${position === 'bottom-right' ? 'bottom-4 right-4' : 
                  position === 'bottom-left' ? 'bottom-4 left-4' :
                  position === 'top-right' ? 'top-4 right-4' : 'top-4 left-4'} z-50`}
      style={{ maxWidth }}
    >
      <div
        className="bg-white border border-gray-200 rounded-lg shadow-lg"
        style={{ backgroundColor, borderRadius }}
      >
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 rounded-t-lg">
          <h3 className="text-lg font-semibold">ModernMen Assistant</h3>
          <p className="text-sm text-gray-300">How can I help you today?</p>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-3">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-start">
              <div className="bg-red-100 text-red-800 px-3 py-2 rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}