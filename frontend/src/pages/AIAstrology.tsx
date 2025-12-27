import {
  AIInput,
  AIInputModelSelect,
  AIInputModelSelectContent,
  AIInputModelSelectItem,
  AIInputModelSelectTrigger,
  AIInputModelSelectValue,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools
} from "@/components/ui/ai-input";
import { SendIcon, LogIn, AlertCircle, Star, X } from 'lucide-react';
import { type FormEventHandler, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  conversationId?: string;
}

interface HoroscopeStatus {
  has_horoscope: boolean;
  request_id: string | null;
  created_at: string | null;
}

interface QuestionStatus {
  questions_asked: number;
  feedback_given: number;
  questions_remaining: number;
  total_limit: number;
  recent_conversations: Array<{
    id: string;
    question: string;
    has_feedback: boolean;
    created_at: string;
  }>;
}

interface BirthDetails {
  date_of_birth: string;
  time_of_birth: string;
  place_of_birth: string;
  latitude?: number;
  longitude?: number;
}

// Simple markdown renderer for AI responses
function renderMarkdown(text: string): React.ReactNode {
  // Split by double newlines for paragraphs
  const paragraphs = text.split(/\n\n+/);
  
  return paragraphs.map((paragraph, pIndex) => {
    // Check for headers
    if (paragraph.startsWith('**') && paragraph.endsWith('**') && !paragraph.slice(2, -2).includes('**')) {
      // Bold header line
      const content = paragraph.slice(2, -2);
      return <h3 key={pIndex} className="font-bold text-lg text-gray-900 mt-4 mb-2">{content}</h3>;
    }
    
    // Process lines within paragraph
    const lines = paragraph.split('\n');
    const processedLines = lines.map((line, lIndex) => {
      // Header with colon (e.g., **User Question**: text)
      const headerMatch = line.match(/^\*\*([^*]+)\*\*:\s*(.*)$/);
      if (headerMatch) {
        return (
          <div key={lIndex} className="mb-2">
            <span className="font-bold text-gray-900">{headerMatch[1]}:</span>{' '}
            <span className="text-gray-700">{headerMatch[2]}</span>
          </div>
        );
      }
      
      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const content = line.trim().slice(2);
        // Process inline bold within bullet
        const parts = content.split(/\*\*([^*]+)\*\*/);
        return (
          <li key={lIndex} className="ml-4 text-gray-700">
            {parts.map((part, i) => 
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            )}
          </li>
        );
      }
      
      // Regular line with inline bold
      const parts = line.split(/\*\*([^*]+)\*\*/);
      if (parts.length > 1) {
        return (
          <p key={lIndex} className="text-gray-700 mb-1">
            {parts.map((part, i) => 
              i % 2 === 1 ? <strong key={i} className="text-gray-900">{part}</strong> : part
            )}
          </p>
        );
      }
      
      // Plain line
      return line.trim() ? <p key={lIndex} className="text-gray-700 mb-1">{line}</p> : null;
    });
    
    // Check if this paragraph contains list items
    const hasListItems = lines.some(l => l.trim().startsWith('- ') || l.trim().startsWith('* '));
    if (hasListItems) {
      return <ul key={pIndex} className="list-disc list-inside mb-3">{processedLines}</ul>;
    }
    
    return <div key={pIndex} className="mb-3">{processedLines}</div>;
  });
}

export default function AIAstrology() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [horoscopeStatus, setHoroscopeStatus] = useState<HoroscopeStatus | null>(null);
  const [questionStatus, setQuestionStatus] = useState<QuestionStatus | null>(null);
  const [showBirthForm, setShowBirthForm] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    date_of_birth: '',
    time_of_birth: '',
    place_of_birth: ''
  });
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';
  
  useEffect(() => {
    if (user) {
      checkHoroscopeStatus();
      checkQuestionStatus();
      checkBirthDetails();
    }
  }, [user]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    if (questionStatus) {
      console.log('Question Status Updated:', {
        questions_remaining: questionStatus.questions_remaining,
        questions_asked: questionStatus.questions_asked,
        feedback_given: questionStatus.feedback_given,
        recent_conversations_count: questionStatus.recent_conversations?.length || 0,
        conversations_without_feedback: questionStatus.recent_conversations?.filter(c => !c.has_feedback).length || 0
      });
    }
  }, [questionStatus]);
  
  const checkHoroscopeStatus = async () => {
    try {
      const storedUser = localStorage.getItem('astro_user');
      if (!storedUser) return;
      
      const userData = JSON.parse(storedUser);
      const response = await axios.get(`${API_BASE}/api/v1/deva/horoscope/status`, {
        headers: {
          'Authorization': `Bearer ${userData.token}`
        }
      });
      
      setHoroscopeStatus(response.data);
    } catch (err: any) {
      console.error('Error checking horoscope status:', err);
    }
  };

  const checkQuestionStatus = async () => {
    try {
      const storedUser = localStorage.getItem('astro_user');
      if (!storedUser) return;
      
      const userData = JSON.parse(storedUser);
      const response = await axios.get(`${API_BASE}/api/v1/deva/question-status`, {
        headers: {
          'Authorization': `Bearer ${userData.token}`
        }
      });
      
      setQuestionStatus(response.data);
    } catch (err: any) {
      console.error('Error checking question status:', err);
    }
  };

  const checkBirthDetails = async () => {
    try {
      const storedUser = localStorage.getItem('astro_user');
      if (!storedUser) return;
      
      const userData = JSON.parse(storedUser);
      const response = await axios.get(`${API_BASE}/api/v1/deva/birth-details`, {
        headers: {
          'Authorization': `Bearer ${userData.token}`
        }
      });
      
      if (response.data.has_details) {
        setBirthDetails(response.data.details);
      }
    } catch (err: any) {
      console.error('Error checking birth details:', err);
    }
  };

  const saveBirthDetails = async () => {
    try {
      const storedUser = localStorage.getItem('astro_user');
      if (!storedUser) return;
      
      const userData = JSON.parse(storedUser);
      await axios.post(
        `${API_BASE}/api/v1/deva/birth-details`,
        birthDetails,
        {
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      toast.success('Birth details saved!');
      setShowBirthForm(false);
    } catch (err: any) {
      toast.error('Failed to save birth details');
      console.error('Error saving birth details:', err);
    }
  };

  const submitFeedback = async () => {
    console.log('submitFeedback called:', { selectedConversation, feedbackRating, feedbackText });
    
    if (!selectedConversation || feedbackRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmittingFeedback(true);

    try {
      const storedUser = localStorage.getItem('astro_user');
      if (!storedUser) {
        toast.error('User not authenticated');
        setSubmittingFeedback(false);
        return;
      }
      
      const userData = JSON.parse(storedUser);
      console.log('Submitting feedback to API...');
      const response = await axios.post(
        `${API_BASE}/api/v1/deva/question-feedback`,
        {
          question_id: selectedConversation,
          rating: feedbackRating,
          feedback_text: feedbackText
        },
        {
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Feedback submitted successfully:', response.data);
      
      toast.success(
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-bold">Feedback Submitted!</p>
            <p className="text-sm">You unlocked 1 more question</p>
          </div>
        </div>,
        { duration: 4000 }
      );
      
      setShowFeedbackModal(false);
      setFeedbackRating(0);
      setFeedbackText('');
      setSelectedConversation(null);
      setSubmittingFeedback(false);
      await checkQuestionStatus();
    } catch (err: any) {
      setSubmittingFeedback(false);
      toast.error(err.response?.data?.detail || 'Failed to submit feedback');
      console.error('Error submitting feedback:', err);
    }
  };
  
  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const message = formData.get('message') as string;
    
    if (!message) return;
    
    if (!user) {
      setError('Please log in to use AI Astrology');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    event.currentTarget.reset();
    
    try {
      const storedUser = localStorage.getItem('astro_user');
      if (!storedUser) {
        throw new Error('User not authenticated');
      }
      
      const userData = JSON.parse(storedUser);
      const response = await axios.post(
        `${API_BASE}/api/v1/deva/chat`,
        {
          question: message,
          request_id: horoscopeStatus?.request_id || null
        },
        {
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const agentMessage: Message = {
        role: 'assistant',
        content: response.data.response || 'No response received',
        timestamp: new Date(),
        conversationId: response.data.conversation_id
      };
      
      setMessages(prev => [...prev, agentMessage]);
      
      if (response.data.status === 'limit_reached') {
        toast.error('Question limit reached! Provide feedback to unlock more.');
      }

      // Small delay to ensure database has committed the conversation
      setTimeout(async () => {
        await checkQuestionStatus();
      }, 500);
      
      if (response.data.questions_remaining <= 1 && response.data.conversation_id) {
        setTimeout(() => {
          toast((t) => (
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-orange-800">⚠️ Running low on questions!</p>
              <p className="text-sm text-gray-700">Rate this response to unlock more</p>
              <button
                onClick={() => {
                  openFeedbackModal(response.data.conversation_id);
                  toast.dismiss(t.id);
                }}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-all"
              >
                Give Feedback Now
              </button>
            </div>
          ), {
            duration: 6000,
            position: 'top-center'
          });
        }, 1500);
      }
      
      if (response.data.status === 'no_data' && !horoscopeStatus?.has_horoscope) {
        setHoroscopeStatus({
          has_horoscope: false,
          request_id: null,
          created_at: null
        });
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Please log in to use AI Astrology');
      } else {
        setError(err.response?.data?.detail || 'Failed to get response from Deva Agent');
      }
      console.error('Error submitting to Deva Agent:', err);
    } finally {
      setLoading(false);
    }
  };

  const openFeedbackModal = (conversationId: string) => {
    console.log('Opening feedback modal for conversation:', conversationId);
    if (!conversationId) {
      toast.error('Invalid conversation ID');
      return;
    }
    setSelectedConversation(conversationId);
    setShowFeedbackModal(true);
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-black mb-4">AI Astrology</h1>
            <p className="text-gray-600">Ask questions about your birth chart and get AI-powered insights</p>
          </div>
          
          {!user && (
            <div className="neo-card p-6 bg-blue-50 border-blue-200 text-center">
              <p className="text-blue-800 mb-4">Please log in to use AI Astrology features</p>
              <button 
                onClick={() => navigate('/auth')}
                className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-br from-gray-800 via-black to-gray-900 text-white rounded-lg hover:shadow-neo-lg transition-all"
              >
                <LogIn size={18} />
                Log In
              </button>
            </div>
          )}

          {user && questionStatus && (
            <div className="neo-card p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Questions Remaining</p>
                  <p className={`text-3xl font-bold ${questionStatus.questions_remaining === 0 ? 'text-red-600' : questionStatus.questions_remaining <= 1 ? 'text-orange-600' : 'text-purple-900'}`}>
                    {questionStatus.questions_remaining}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {questionStatus.questions_asked} asked • {questionStatus.feedback_given} feedback given
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-2">Unlock more questions</p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (questionStatus.recent_conversations && questionStatus.recent_conversations.length > 0) {
                        const unfeedback = questionStatus.recent_conversations.find(c => !c.has_feedback);
                        if (unfeedback) {
                          console.log('Give Feedback button clicked for:', unfeedback.id);
                          openFeedbackModal(unfeedback.id);
                        } else {
                          toast.error('All recent questions have feedback!');
                        }
                      } else {
                        toast.error('No conversations to rate yet!');
                      }
                    }}
                    disabled={!questionStatus.recent_conversations || questionStatus.recent_conversations.filter(c => !c.has_feedback).length === 0}
                    className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                    title={!questionStatus.recent_conversations || questionStatus.recent_conversations.filter(c => !c.has_feedback).length === 0 ? "All questions have been rated" : "Click to give feedback"}
                  >
                    <Star size={16} />
                    Give Feedback
                  </button>
                </div>
              </div>
              
              {questionStatus.recent_conversations && questionStatus.recent_conversations.filter(c => !c.has_feedback).length > 0 && (
                <div className="pt-4 border-t border-purple-200">
                  <p className="text-sm font-semibold text-purple-900 mb-3">
                    💡 {questionStatus.recent_conversations.filter(c => !c.has_feedback).length} question(s) waiting for your feedback
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {questionStatus.recent_conversations
                      .filter(c => !c.has_feedback)
                      .slice(0, 3)
                      .map((conv) => (
                        <div key={conv.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-purple-100">
                          <p className="text-xs text-gray-700 truncate flex-1 mr-2">
                            {conv.question.substring(0, 50)}...
                          </p>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Rate Now clicked for:', conv.id);
                              openFeedbackModal(conv.id);
                            }}
                            className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-full hover:shadow-lg transition-all whitespace-nowrap cursor-pointer"
                            style={{ pointerEvents: 'auto' }}
                          >
                            Rate Now
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {user && questionStatus && questionStatus.questions_remaining === 0 && (
            <div className="neo-card p-6 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-600 mt-1" size={24} />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-900 mb-2">🚫 Chat Limit Reached!</h3>
                  <p className="text-red-700 mb-2">
                    You've used all your questions. Rate your previous conversations to unlock more!
                  </p>
                  <p className="text-sm text-orange-600 mb-4">
                    💡 Tip: You can still provide feedback on any conversation - feedback is always available!
                  </p>
                  {questionStatus.recent_conversations && questionStatus.recent_conversations.filter(c => !c.has_feedback).length > 0 ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const unfeedback = questionStatus.recent_conversations.find(c => !c.has_feedback);
                        if (unfeedback) {
                          console.log('No Questions banner - opening feedback for:', unfeedback.id);
                          openFeedbackModal(unfeedback.id);
                        }
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 cursor-pointer"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <Star size={20} />
                      Rate a Response & Unlock Question
                    </button>
                  ) : (
                    <p className="text-orange-700 font-semibold">
                      ✅ All questions rated! Contact support for more questions.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {user && horoscopeStatus && !horoscopeStatus.has_horoscope && (
            <div className="neo-card p-6 bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-600 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-yellow-800 font-semibold mb-2">No Horoscope Data Found</p>
                  <p className="text-yellow-700 mb-4">
                    You can either generate your full horoscope or provide basic birth details to continue.
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => navigate('/horoscope')}
                      className="px-4 py-2 bg-gradient-to-br from-gray-800 via-black to-gray-900 text-white rounded-lg hover:shadow-neo-lg transition-all"
                    >
                      Generate Full Horoscope
                    </button>
                    <button 
                      onClick={() => setShowBirthForm(!showBirthForm)}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all"
                    >
                      {showBirthForm ? 'Hide' : 'Add Birth Details'}
                    </button>
                  </div>
                </div>
              </div>

              {showBirthForm && (
                <div className="mt-6 p-4 bg-white rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-gray-800 mb-4">Optional Birth Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={birthDetails.date_of_birth}
                        onChange={(e) => setBirthDetails({...birthDetails, date_of_birth: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time of Birth</label>
                      <input
                        type="time"
                        value={birthDetails.time_of_birth}
                        onChange={(e) => setBirthDetails({...birthDetails, time_of_birth: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Place of Birth</label>
                      <input
                        type="text"
                        value={birthDetails.place_of_birth}
                        onChange={(e) => setBirthDetails({...birthDetails, place_of_birth: e.target.value})}
                        placeholder="City, Country"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <button
                    onClick={saveBirthDetails}
                    disabled={!birthDetails.date_of_birth || !birthDetails.time_of_birth || !birthDetails.place_of_birth}
                    className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Details
                  </button>
                </div>
              )}
            </div>
          )}
          
          {error && (
            <div className="neo-card p-4 bg-red-50 border-red-200">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          {messages.length > 0 && (
            <div className="neo-card p-6 space-y-4 max-h-[500px] overflow-y-auto">
              <h2 className="text-xl font-semibold text-black mb-4">Conversation</h2>
              {messages.map((msg, index) => {
                // Check if this conversation has feedback - default to false if not found in recent list
                const conversationInStatus = questionStatus?.recent_conversations?.find(
                  c => c.id === msg.conversationId
                );
                const hasFeedback = conversationInStatus?.has_feedback || false;
                // Show feedback button if: it's an assistant message, has conversationId, and no feedback
                const showFeedbackButton = msg.role === 'assistant' && msg.conversationId && !hasFeedback;
                
                // Debug logging
                if (msg.role === 'assistant') {
                  console.log(`Message ${index}: conversationId=${msg.conversationId}, showFeedbackButton=${showFeedbackButton}, hasFeedback=${hasFeedback}`);
                }
                
                return (
                  <div key={index}>
                    <div 
                      className={`p-4 rounded-lg ${
                        msg.role === 'user' 
                          ? 'bg-blue-50 border border-blue-200 ml-8' 
                          : 'bg-gray-50 border border-gray-200 mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-700">
                            {msg.role === 'user' ? 'You' : 'Deva Agent'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {msg.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        {showFeedbackButton && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Feedback button clicked for:', msg.conversationId);
                              openFeedbackModal(msg.conversationId!);
                            }}
                            className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-xs rounded-full hover:bg-purple-700 transition-all animate-pulse cursor-pointer"
                            style={{ pointerEvents: 'auto' }}
                          >
                            <Star size={12} />
                            Rate Response
                          </button>
                        )}
                        {msg.role === 'assistant' && msg.conversationId && hasFeedback && conversationInStatus && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <Star size={12} className="fill-green-600" />
                            Rated
                          </span>
                        )}
                        {msg.role === 'assistant' && !msg.conversationId && (
                          <span className="text-xs text-gray-400 italic">
                            (No ID - cannot rate)
                          </span>
                        )}
                      </div>
                      <div className="text-gray-800">
                        {msg.role === 'assistant' ? renderMarkdown(msg.content) : <p className="whitespace-pre-wrap">{msg.content}</p>}
                      </div>
                    </div>
                    
                    {showFeedbackButton && questionStatus && questionStatus.questions_remaining <= 1 && (
                      <div className="mt-2 mr-8 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertCircle size={16} className="text-purple-600" />
                            <p className="text-sm text-purple-800">
                              <strong>Running low on questions!</strong> Rate this response to unlock more.
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openFeedbackModal(msg.conversationId!);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all cursor-pointer"
                            style={{ pointerEvents: 'auto' }}
                          >
                            Give Feedback Now
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
          
          <div className="neo-card p-6">
            <AIInput onSubmit={handleSubmit} className="neo-card border-gray-200">
              <AIInputTextarea 
                placeholder={
                  !user 
                    ? "Please log in to ask questions" 
                    : questionStatus && questionStatus.questions_remaining <= 0
                    ? "Question limit reached. Provide feedback to unlock more!"
                    : "Ask your astrology question..."
                } 
                disabled={!user || loading || (questionStatus && questionStatus.questions_remaining <= 0)}
              />
              <AIInputToolbar className="border-t border-gray-200">
                <AIInputTools>
                  <div className="text-sm text-gray-600 px-2">
                    {horoscopeStatus?.has_horoscope && (
                      <span className="text-green-600">✓ Horoscope data available</span>
                    )}
                    {questionStatus && (
                      <span className="ml-3 text-purple-600">
                        {questionStatus.questions_remaining} questions left
                      </span>
                    )}
                  </div>
                </AIInputTools>
                <AIInputSubmit 
                  className="bg-gradient-to-br from-gray-800 via-black to-gray-900 text-white hover:shadow-neo-lg rounded-lg"
                  disabled={!user || loading || (questionStatus && questionStatus.questions_remaining <= 0)}
                >
                  <SendIcon size={16} />
                  {loading && <span className="ml-2">Sending...</span>}
                </AIInputSubmit>
              </AIInputToolbar>
            </AIInput>
          </div>
        </div>
      </div>

      {showFeedbackModal && selectedConversation && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submittingFeedback) {
              setShowFeedbackModal(false);
              setFeedbackRating(0);
              setFeedbackText('');
            }
          }}
        >
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all animate-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Rate Your Experience
              </h2>
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackRating(0);
                  setFeedbackText('');
                }}
                disabled={submittingFeedback}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-4 text-center">How helpful was this response?</p>
              <div className="flex gap-3 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFeedbackRating(star)}
                    disabled={submittingFeedback}
                    className="transition-all hover:scale-125 active:scale-95 disabled:opacity-50"
                  >
                    <Star
                      size={48}
                      className={`${
                        star <= feedbackRating 
                          ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg' 
                          : 'text-gray-300 hover:text-yellow-200'
                      } transition-all`}
                    />
                  </button>
                ))}
              </div>
              {feedbackRating > 0 && (
                <p className="text-center mt-3 text-sm font-semibold text-purple-600 animate-pulse">
                  {feedbackRating === 5 ? '🌟 Excellent!' : feedbackRating === 4 ? '😊 Great!' : feedbackRating === 3 ? '👍 Good' : feedbackRating === 2 ? '😐 Okay' : '😕 Needs Improvement'}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments (Optional)
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                disabled={submittingFeedback}
                placeholder="Share your thoughts to help us improve..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none disabled:opacity-50"
              />
            </div>

            <button
              onClick={submitFeedback}
              disabled={feedbackRating === 0 || submittingFeedback}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white font-bold text-lg rounded-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              {submittingFeedback ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Star size={20} className="fill-white" />
                  Submit & Unlock 1 Question
                </>
              )}
            </button>
            
            <p className="text-xs text-center text-gray-500 mt-4">
              💡 Each feedback unlocks 1 additional question
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
