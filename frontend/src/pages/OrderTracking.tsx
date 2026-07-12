import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../components/Toast';
import { 
  MapPin, 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  Send, 
  ChevronRight, 
  Clock, 
  ShoppingBag,
  User
} from 'lucide-react';
import io from 'socket.io-client';

export const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Chat window state
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [typedMessage, setTypedMessage] = useState('');
  
  // Real-time animation coordinates
  const [riderCoords, setRiderCoords] = useState<{ x: number; y: number }>({ x: 30, y: 150 });
  const [statusProgress, setStatusProgress] = useState(0);

  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    // 1. Fetch Order Details Initially
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const data = await api.getOrderById(id);
        setOrder(data);
        updateStatusProgress(data.orderStatus);
      } catch (err) {
        showToast('Failed to load tracking details.', 'error');
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // 2. Setup Socket.io Connection
    socketRef.current = io('http://localhost:5000');
    
    socketRef.current.emit('join_order', id);

    socketRef.current.on('status_changed', (updatedOrder: any) => {
      setOrder(updatedOrder);
      updateStatusProgress(updatedOrder.orderStatus);
      showToast(`Order status updated: ${updatedOrder.orderStatus.toUpperCase()}`, 'info');
    });

    socketRef.current.on('rider_moved', (partner: any) => {
      setOrder((prev: any) => prev ? { ...prev, deliveryPartner: partner } : prev);
      // Map coordinates to SVG dimensions (e.g. from lat/lng to grid points)
      // Standard interpolation
      const xPercent = ((partner.lng - 72.8311) / (72.8500 - 72.8311)) * 300 + 30;
      const yPercent = 150 - ((partner.lat - 21.1702) / (21.1900 - 21.1702)) * 100;
      setRiderCoords({ x: xPercent, y: yPercent });
    });

    socketRef.current.on('receive_message', (msg: any) => {
      setMessages((prev) => [...prev, msg]);
      
      // Auto reply mock from rider
      if (msg.sender === 'user') {
        setTimeout(() => {
          const replies = [
            "Sure, arriving in a few minutes!",
            "I'm at the signal. Traffic is a bit slow.",
            "Picked up your hot food! Coming fast.",
            "I have arrived at your building gate.",
            "Thanks for the tip!"
          ];
          const randomReply = replies[Math.floor(Math.random() * replies.length)];
          const mockReply = {
            id: Math.random().toString(),
            sender: 'rider',
            text: randomReply,
            timestamp: new Date().toISOString()
          };
          setMessages((prev) => [...prev, mockReply]);
        }, 3000);
      }
    });

    // 3. Fallback client-side simulated loop (if socket server is down)
    const fallbackTimer = setInterval(async () => {
      if (!id) return;
      try {
        const data = await api.getOrderById(id);
        setOrder(data);
        updateStatusProgress(data.orderStatus);
        
        // If status is on_the_way and rider exists
        if (data.orderStatus === 'on_the_way' && data.deliveryPartner) {
          const xPercent = ((data.deliveryPartner.lng - 72.8311) / (72.8500 - 72.8311)) * 300 + 30;
          const yPercent = 150 - ((data.deliveryPartner.lat - 21.1702) / (21.1900 - 21.1702)) * 100;
          setRiderCoords({ x: xPercent, y: yPercent });
        }
      } catch (err) {
        // Suppress warning log
      }
    }, 4000);

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      clearInterval(fallbackTimer);
    };
  }, [id, navigate, showToast]);

  const updateStatusProgress = (status: string) => {
    const progressMap: { [key: string]: number } = {
      placed: 10,
      accepted: 30,
      preparing: 50,
      picked_up: 70,
      on_the_way: 85,
      delivered: 100
    };
    setStatusProgress(progressMap[status] || 0);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const data = {
      orderId: id || '',
      sender: 'user' as const,
      text: typedMessage.trim()
    };

    if (socketRef.current) {
      socketRef.current.emit('send_message', data);
    } else {
      // Local fallback push
      const localMsg = {
        id: Math.random().toString(),
        sender: 'user' as const,
        text: typedMessage.trim(),
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, localMsg]);
    }
    setTypedMessage('');
  };

  const handleCallDriver = () => {
    showToast(`Calling rider Rajesh Kumar at +91 98765 00112...`, 'info');
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse py-10">
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  if (!order) return null;

  const steps = [
    { label: 'Placed', status: 'placed' },
    { label: 'Accepted', status: 'accepted' },
    { label: 'Preparing', status: 'preparing' },
    { label: 'Picked Up', status: 'picked_up' },
    { label: 'On The Way', status: 'on_the_way' },
    { label: 'Delivered', status: 'delivered' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      {/* Left Column: Map & Timeline */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* 1. Interactive SVG Map */}
        <div className="glass rounded-3xl border border-slate-100 dark:border-slate-800 p-6 relative overflow-hidden h-96 shadow-lg">
          <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 px-4 py-2 rounded-xl text-xs font-bold shadow-md border border-slate-100 dark:border-slate-800/80">
            📍 Real-time Rider Coordinates
          </div>

          {/* SVG Map Illustration */}
          <svg className="w-full h-full bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800" viewBox="0 0 400 200">
            {/* Grid Map Gridlines */}
            <path d="M 0 50 L 400 50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <path d="M 0 100 L 400 100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <path d="M 0 150 L 400 150" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            
            {/* Streets / Roads Grid */}
            <path d="M 30 150 Q 150 20 250 150 T 360 50" fill="none" stroke="rgba(255, 77, 0, 0.15)" strokeWidth="8" strokeLinecap="round" />
            <path d="M 30 150 Q 150 20 250 150 T 360 50" fill="none" stroke="rgba(255, 77, 0, 0.4)" strokeWidth="2" strokeDasharray="5,5" strokeLinecap="round" />

            {/* Restaurant Marker */}
            <g transform="translate(30, 150)">
              <circle r="12" fill="#ff4d00" opacity="0.3" className="animate-ping" />
              <circle r="8" fill="#ff4d00" />
              <text y="4" font-size="10" text-anchor="middle" fill="white">🏪</text>
              <text y="24" font-size="8" font-weight="bold" text-anchor="middle" fill="#ff4d00">Restaurant</text>
            </g>

            {/* Customer Home Marker */}
            <g transform="translate(360, 50)">
              <circle r="12" fill="#6366f1" opacity="0.3" className="animate-ping" />
              <circle r="8" fill="#6366f1" />
              <text y="4" font-size="10" text-anchor="middle" fill="white">🏠</text>
              <text y="-14" font-size="8" font-weight="bold" text-anchor="middle" fill="#6366f1">You</text>
            </g>

            {/* Moving Rider Marker */}
            {order.orderStatus === 'on_the_way' && (
              <g transform={`translate(${riderCoords.x}, ${riderCoords.y})`}>
                <circle r="14" fill="#22c55e" opacity="0.3" className="animate-ping" />
                <circle r="10" fill="#22c55e" />
                <text y="4" font-size="12" text-anchor="middle" fill="white">🛵</text>
                <text y="-16" font-size="8" font-weight="bold" text-anchor="middle" fill="#22c55e">Rider</text>
              </g>
            )}
          </svg>
        </div>

        {/* 2. Timeline Progress */}
        <div className="glass rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Tracking Progress</h4>
            <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full uppercase">
              {order.orderStatus.replace('_', ' ')}
            </span>
          </div>

          {/* Graphical timeline */}
          <div className="relative pt-4 pb-2">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 rounded-full"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-brand to-emerald-500 -translate-y-1/2 rounded-full transition-all duration-500"
              style={{ width: `${statusProgress}%` }}
            ></div>

            <div className="flex justify-between relative z-10">
              {steps.map((step) => {
                const isActive = statusProgress >= (step.status === 'placed' ? 10 : step.status === 'accepted' ? 30 : step.status === 'preparing' ? 50 : step.status === 'picked_up' ? 70 : step.status === 'on_the_way' ? 85 : 100);
                return (
                  <div key={step.status} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center text-xs transition-all ${
                      isActive 
                        ? 'border-brand bg-white dark:bg-slate-900 text-brand font-black' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400'
                    }`}>
                      {isActive ? '✓' : ''}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-2">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Right Column: Driver Details & Live Chat */}
      <div className="space-y-6">
        
        {/* 1. Rider details card */}
        <div className="glass rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Delivery Partner</h4>
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 12 mins away
            </span>
          </div>

          {order.deliveryPartner ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={order.deliveryPartner.avatar}
                  alt={order.deliveryPartner.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-brand"
                />
                <div>
                  <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">{order.deliveryPartner.name}</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Professional Food Deliverer</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCallDriver}
                  className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-brand/10 hover:text-brand rounded-xl transition-colors text-slate-700 dark:text-slate-300"
                  title="Call Rider"
                >
                  <Phone className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={() => setChatOpen(!chatOpen)}
                  className={`p-2.5 rounded-xl transition-colors ${
                    chatOpen 
                      ? 'bg-brand text-white shadow-md' 
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-brand/10 hover:text-brand text-slate-700 dark:text-slate-300'
                  }`}
                  title="Chat with Rider"
                >
                  <MessageSquare className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-2 flex items-center justify-center gap-2 text-xs text-slate-400">
              <span className="animate-spin w-4 h-4 border-2 border-slate-300 border-t-brand rounded-full"></span>
              Finding delivery partner near restaurant...
            </div>
          )}
        </div>

        {/* 2. Socket.io Chat Widget Overlay/Panel */}
        {chatOpen && (
          <div className="glass rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-96 shadow-xl animate-in slide-in-from-bottom-4 duration-300">
            
            {/* Chat header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-bold">Chat with {order.deliveryPartner?.name || 'Rider'}</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
              {messages.length === 0 ? (
                <div className="text-center text-[10px] text-slate-400 py-20">
                  No messages yet. Send a note to the driver.
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender === 'user';
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs font-semibold leading-relaxed ${
                        isMe 
                          ? 'bg-brand text-white rounded-tr-none' 
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-800/80 flex gap-2">
              <input
                type="text"
                placeholder="Send instructions..."
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-brand/40 outline-none"
              />
              <button 
                type="submit"
                className="bg-brand text-white p-2 rounded-xl hover:bg-brand-dark transition-all flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        )}

      </div>

    </div>
  );
};
