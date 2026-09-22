import React, { useState, useEffect, useRef } from 'react';
import { 
  Headphones, 
  Send, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  MessageSquare, 
  Truck, 
  User, 
  Store, 
  Image as ImageIcon,
  Paperclip,
  X,
  Copy,
  Check,
  Plus,
  History,
  PhoneCall,
  UserCheck,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Maximize2
} from 'lucide-react';
import { UserProfile } from '../types';
import { supabase, uploadSupportAttachment } from '../services/supabase';

export interface SupportChatMessage {
  id: string;
  sender: 'user' | 'support' | 'system';
  senderRole?: 'customer' | 'artisan';
  text: string;
  timestamp: string;
  attachments?: string[]; // Base64 data URLs for photos/files
  isQuickAction?: boolean;
  agentName?: string;
}

export interface SupportTicket {
  id: string;
  orderNumber?: string;
  subject: string;
  status: 'open' | 'in_progress' | 'closed';
  userRole: 'customer' | 'artisan';
  userName: string;
  userPhone?: string;
  createdAt: string;
  lastUpdated: string;
  messages: SupportChatMessage[];
  isHumanHandoffRequested?: boolean;
  assignedAgent?: {
    name: string;
    title: string;
    avatar?: string;
  };
}

interface SupportChatViewProps {
  currentUser: UserProfile | null;
  tickets: SupportTicket[];
  onUpdateTickets: (tickets: SupportTicket[]) => void;
  onNavigateHome: () => void;
  onNavigateDashboard: () => void;
  onNavigateTracking: () => void;
  onOpenAuth: () => void;
}

// Business operating hours config (Cairo Local Time: 09:00 to 23:00)
const BUSINESS_HOURS = {
  startHour: 9, // 9 AM
  endHour: 23,  // 11 PM
  workDays: 'يومياً (السبت إلى الجمعة)',
  hoursText: '9:00 ص - 11:00 م'
};

const OFFICIAL_WHATSAPP_NUMBER = '201275356468'; // Official Yadawy Support Hotline

const COMMON_QUESTIONS = [
  {
    role: 'customer',
    q: '📦 متى يصل طلبي وموعد التسليم؟',
    ans: 'تتولى شركة الشحن الرسمية توصيل الطلبات خلال 3 إلى 5 أيام عمل من استلامها من ورشة الصانع. يمكنك متابعة حالة طلبك برقم الشحنة مباشرة عبر صفحة التتبع.'
  },
  {
    role: 'customer',
    q: '🛡️ ما هو الضمان وطريقة المعاينة عند الاستلام؟',
    ans: 'معاملتك محمية بضمان يدوي 100%. يحق لك فحص ومعاينة القطعة اليدوية بحضور مندوب شركة الشحن قبل سداد المبلغ في حالة الدفع عند الاستلام.'
  },
  {
    role: 'customer',
    q: '📷 استلمت قطعة بها كسر أو تلف، ماذا أفعل؟',
    ans: 'نعتذر جداً عن ذلك! يرجى تصوير القطعة التالفة وإرفاق الصورة هنا عبر زر الكاميرا/المرفقات. سنفتح تذكرة استبدال فوري ويوجه مندوب الشحن لاسترجاعها دون أي تكلفة عليك.'
  },
  {
    role: 'artisan',
    q: '🚚 كيف أقوم بتسليم الطلبات الجاهزة لشركة الشحن؟',
    ans: 'بمجرد انتهائك من تجهيز القطعة وتغليفها، اضغط على زر "تسليم لمندوب شركة الشحن" في لوحة الصانع، وسيصلك مندوبنا لاستلام الطرد مع إيصال رسمي.'
  },
  {
    role: 'artisan',
    q: '💰 متى يتم تحويل مستحقات ومبيعات الورشة؟',
    ans: 'يتم تحويل الأرباح المستحقة لورشتك أسبوعياً فور تأكيد استلام العميل للطلب عبر إنستاباي أو فودافون كاش أو تحويل بنكي حسب بياناتك المسجلة.'
  },
  {
    role: 'all',
    q: '🎨 كيف أطلب تعديل أو تفصيل قطعة خاصة؟',
    ans: 'يمكنك الضغط على "طلب تفصيل وتعديل خاص" في صفحة المنتج أو متجر الصانع. وسيقوم فريق الدعم بمراجعة المواصفات وإرسالها للورشة لتقدير التكلفة والوقت.'
  }
];

export const SupportChatView: React.FC<SupportChatViewProps> = ({
  currentUser,
  tickets,
  onUpdateTickets,
  onNavigateHome: _onNavigateHome,
  onNavigateDashboard: _onNavigateDashboard,
  onNavigateTracking,
  onOpenAuth: _onOpenAuth,
}) => {
  // Determine if user is artisan or customer
  const [activeUserType, setActiveUserType] = useState<'customer' | 'artisan'>(() => {
    return currentUser?.role === 'artisan' ? 'artisan' : 'customer';
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedTicketId, setCopiedTicketId] = useState(false);
  const [showTicketsDrawer, setShowTicketsDrawer] = useState(false);
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);
  const [phoneForCallback, setPhoneForCallback] = useState(currentUser?.phone || '');
  const [callbackRequested, setCallbackRequested] = useState(false);

  // Selected image attachments before sending
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Operating Hours Real-time Check
  const [isLiveSupportOnline, setIsLiveSupportOnline] = useState<boolean>(() => {
    const currentHour = new Date().getHours();
    return currentHour >= BUSINESS_HOURS.startHour && currentHour < BUSINESS_HOURS.endHour;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const currentHour = new Date().getHours();
      setIsLiveSupportOnline(currentHour >= BUSINESS_HOURS.startHour && currentHour < BUSINESS_HOURS.endHour);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Helper to generate a new ticket
  const createNewTicketTemplate = (role: 'customer' | 'artisan', uName: string): SupportTicket => {
    const ticketNum = Math.floor(10000 + Math.random() * 90000);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    return {
      id: `TK-${ticketNum}`,
      subject: role === 'artisan' ? 'استفسار ودعم ورش الحرفيين' : 'مساعدة وخدمة عملاء منصة يدوي',
      status: 'open',
      userRole: role,
      userName: uName,
      createdAt: now.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', year: 'numeric' }),
      lastUpdated: timeStr,
      messages: [
        {
          id: `msg-welcome-1-${Date.now()}`,
          sender: 'support',
          text: `مرحباً بك في مركز الدعم وخدمة عملاء منصة "يَدَوِي" الرسمية! 🌿
تم فتح تذكرة دعم جديدة برقم: #TK-${ticketNum}
نحن متواجدون لمساعدتك في كل ما يخص: شحن المنتجات، المعاينة عند الاستلام، عيوب وكسور المشغولات، أو تحصيل مستحقات الورش.`,
          timestamp: timeStr
        },
        {
          id: `msg-welcome-2-${Date.now()}`,
          sender: 'support',
          text: `💡 يمكنك كتابة استفسارك مباشرة، أو إرفاق صور للمشكلة، أو طلب التحويل لموظف بشري في أي وقت.`,
          timestamp: timeStr
        }
      ]
    };
  };

  // Ensure at least one initial ticket exists if none are passed
  useEffect(() => {
    if (tickets.length === 0) {
      const initialTicket = createNewTicketTemplate(
        currentUser?.role === 'artisan' ? 'artisan' : 'customer',
        currentUser?.name || 'زائر يدوي'
      );
      onUpdateTickets([initialTicket]);
    }
  }, [tickets.length, currentUser]);

  // Active Ticket ID
  const [activeTicketId, setActiveTicketId] = useState<string>(() => {
    try {
      const savedActive = localStorage.getItem('yadawy_active_ticket_id');
      if (savedActive) return savedActive;
    } catch {
      // ignore
    }
    return tickets[0]?.id || 'TK-10001';
  });

  // Get Current Active Ticket
  const currentTicket = tickets.find(t => t.id === activeTicketId) || tickets[0] || { id: 'loading', messages: [], userName: '', subject: '', createdAt: '', lastUpdated: '', status: 'open', userRole: 'customer' };

  useEffect(() => {
    try {
      if (activeTicketId) {
        localStorage.setItem('yadawy_active_ticket_id', activeTicketId);
      }
    } catch {
      // ignore
    }
  }, [activeTicketId]);

  // Scroll to bottom when messages or typing changes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentTicket?.messages, isTyping]);

  // Handle Copy Ticket ID
  const handleCopyTicket = () => {
    if (!currentTicket) return;
    navigator.clipboard.writeText(currentTicket.id);
    setCopiedTicketId(true);
    setTimeout(() => setCopiedTicketId(false), 2000);
  };

  // Create a brand new ticket
  const handleStartNewTicket = () => {
    const newT = createNewTicketTemplate(activeUserType, currentUser?.name || 'زائر يدوي');
    onUpdateTickets([newT, ...tickets]);
    setActiveTicketId(newT.id);
    setShowTicketsDrawer(false);
  };

  // Handle File / Image Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(async (file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار صور فقط (JPG, PNG, WebP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 5 ميجابايت.');
        return;
      }

      // Try uploading to Supabase Storage first for a persistent cloud URL
      const uploadedUrl = await uploadSupportAttachment(file);
      if (uploadedUrl) {
        setSelectedAttachments(prev => [...prev, uploadedUrl]);
      } else {
        // Fallback to local Base64
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          const result = uploadEvent.target?.result as string;
          if (result) {
            setSelectedAttachments(prev => [...prev, result]);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (indexToRemove: number) => {
    setSelectedAttachments(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Send message
  const handleSendMessage = (textToSend?: string, attachmentsToSend?: string[]) => {
    const messageContent = (textToSend || inputMessage).trim();
    const attachments = attachmentsToSend || selectedAttachments;

    if (!messageContent && attachments.length === 0) return;

    const timeString = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const userMsg: SupportChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      senderRole: activeUserType,
      text: messageContent,
      attachments: attachments.length > 0 ? attachments : undefined,
      timestamp: timeString
    };

    // Update active ticket in local state
    onUpdateTickets(tickets.map(t => {
        if (t.id === currentTicket.id) {
          return {
            ...t,
            lastUpdated: timeString,
            messages: [...t.messages, userMsg]
          };
        }
        return t;
      }));

    // Sync ticket & message to Supabase in background
    try {
      supabase.from('support_tickets').upsert({
        id: currentTicket.id,
        subject: currentTicket.subject,
        user_name: currentTicket.userName,
        status: currentTicket.status,
        last_updated: new Date().toISOString()
      }).then(() => {
        supabase.from('support_messages').insert({
          ticket_id: currentTicket.id,
          sender: 'user',
          text: messageContent,
          attachments: attachments
        });
      });
    } catch (err) {
      console.warn('Supabase sync error:', err);
    }

    if (!textToSend) setInputMessage('');
    setSelectedAttachments([]);

    // Bot Auto Response Logic
    setIsTyping(true);
    setTimeout(() => {
      const lower = messageContent.toLowerCase();
      let replyText = '';
      const hasImages = attachments.length > 0;

      if (hasImages) {
        replyText = `📸 تم استلام الصورة بنجاح وإرفاقها بالتذكرة #${currentTicket.id}.
سواء كان الأمر يتعلق بكسر أثناء الشحن، عيب مصنعي، أو فحص جودة:
- تم حفظ الصور وإرسال إشعار فوري لمشرف الجودة واللوجستيات.
- يرجى تزويدنا برقم الشحنة/الطلب إن وجد لبدء إجراءات الاستبدال الفوري بضمان يدوي 100%.`;
      } else if (lower.includes('بشري') || lower.includes('موظف') || lower.includes('خدمة عملاء') || lower.includes('كلمني')) {
        if (isLiveSupportOnline) {
          replyText = `تم تحويل محادثتك الآن لممثل خدمة العملاء البشري. يمكنك أيضاً الضغط على زر "محادثة واتساب الفورية" للتواصل السريع مع الموظف مباشرة برقم تذكرتك #${currentTicket.id}.`;
        } else {
          replyText = `⚠️ نلفت عنايتك إلى أن الدعم البشري المباشر غير متاح حالياً نظراً لانتهاء ساعات العمل الرسمية (${BUSINESS_HOURS.hoursText}).
تذكرتك #${currentTicket.id} مسجلة ومحفوظة بالكامل، وسيقوم الموظف المختص بالتواصل معك في تمام التاسعة صباحاً.`;
        }
      } else if (lower.includes('شحن') || lower.includes('توصيل') || lower.includes('مندوب') || lower.includes('تتبع')) {
        replyText = `شكراً لتواصلك يا فندم بخصوص الشحن.
شركة الشحن المعتمدة تتولى استلام المشغولة اليدوية من الورشة بعد انتهاء الصانع من إعدادها.
تصل الشحنة عادة خلال 3 إلى 5 أيام عمل، وستصلك رسالة قبل وصول المندوب بنصف ساعة.
إذا كان لديك رقم طلب (مثل YD-8914)، اكتبه لي وسأتحقق لك من خط سيره فوراً!`;
      } else if (lower.includes('فلوس') || lower.includes('دفع') || lower.includes('استرجاع') || lower.includes('كاش') || lower.includes('إنستاباي')) {
        replyText = `حقوقك المالية محفوظة بضمان منصة يدوي 100%.
- إذا كنت مشترياً: يتم الدفع عند الاستلام بعد المعاينة أو عبر قنوات الدفع الإلكترونية الآمنة المحمية بنظام الضمان (Escrow).
- إذا كنت صانعاً: يتم تحويل مستحقاتك وأرباحك كل أسبوع عبر إنستاباي أو فودافون كاش أو حسابك البنكي المعتمد فور تسليم الطلب للعميل.`;
      } else if (lower.includes('صانع') || lower.includes('ورشة') || lower.includes('بائع') || lower.includes('حرفي')) {
        replyText = `أهلاً بفناني ومبدعي مصر! 
بصفتنا حلقة الوصل الإدارية واللوجستية، نتابع تجهيز قطعكم اليدوية وتنسيق وصول المندوب لاستلامها، دون الحاجة لتحمل عناء الشحن أو التحصيل. نحن نتكفل بالعملية كاملة حتى وصول المبلغ لحسابكم.`;
      } else if (lower.includes('مشكلة') || lower.includes('كسر') || lower.includes('تالف') || lower.includes('عيب')) {
        replyText = `نعتذر جداً عن أي إزعاج! بصفتنا المشرف والضامن للشحنات:
يرجى إرفاق صورة واضحة للكسر أو العيب عبر زر الكاميرا أسفل الشات مع كتابة رقم الطلب، وسيقوم فريق الدعم الفوري بتوجيه مندوب شركة الشحن لاستبدال القطعة فوراً دون أي مصاريف شحن إضافية عليك.`;
      } else {
        replyText = `تم استلام رسالتك وتحديثها في التذكرة رقم #${currentTicket.id}.
سواء كنت تحتاج لتعديل عنوان الشحن، الاستفسار عن مقاسات، أو متابعة إنتاج ورشتك، يمكنك أيضاً الضغط على "تحويل لموظف بشري" في أي وقت للتحدث المباشر.`;
      }

      const botMsg: SupportChatMessage = {
        id: `support-${Date.now()}`,
        sender: 'support',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };

      onUpdateTickets(tickets.map(t => {
          if (t.id === currentTicket.id) {
            return {
              ...t,
              messages: [...t.messages, botMsg]
            };
          }
          return t;
        }));

      // Sync bot reply to Supabase in background
      try {
        supabase.from('support_messages').insert({
          ticket_id: currentTicket.id,
          sender: 'support',
          text: replyText,
          attachments: []
        }).then();
      } catch {
        // ignore
      }

      setIsTyping(false);
    }, 850);
  };

  // Human Agent Handoff Handler
  const handleRequestHumanAgent = () => {
    const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const assignedAgent = {
      name: 'م. سارة المهدي',
      title: 'أخصائي العناية بالعملاء والضمان'
    };

    const handoffMsg: SupportChatMessage = {
      id: `system-${Date.now()}`,
      sender: 'system',
      text: isLiveSupportOnline
        ? `🟢 تم تحويل التذكرة بنجاح إلى الممثل البشري: (${assignedAgent.name} - ${assignedAgent.title}). يمكنك أيضاً بدء محادثة واتساب فورية معه الآن.`
        : `🟡 تم تسجيل طلب التحويل البشري للتذكرة #${currentTicket.id}. نظراً لأن التوقيت الحالي خارج أوقات العمل الرسمية (${BUSINESS_HOURS.hoursText})، سيقوم ممثل الدعم بمراسلتك في أول ساعات الوردية القادمة.`,
      timestamp: timeStr,
      agentName: assignedAgent.name
    };

    onUpdateTickets(tickets.map(t => {
        if (t.id === currentTicket.id) {
          return {
            ...t,
            status: 'in_progress',
            isHumanHandoffRequested: true,
            assignedAgent,
            messages: [...t.messages, handoffMsg]
          };
        }
        return t;
      }));

    setShowHandoffModal(true);
  };

  // Submit callback phone request
  const handleSubmitCallback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneForCallback.trim()) return;

    setCallbackRequested(true);
    const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const sysMsg: SupportChatMessage = {
      id: `sys-call-${Date.now()}`,
      sender: 'system',
      text: `📞 تم جدولة طلب اتصال هاتفي على الرقم (${phoneForCallback}). سيتواصل معك ممثل خدمة عملاء يدوي خلال أوقات العمل الرسمية.`,
      timestamp: timeStr
    };

    onUpdateTickets(tickets.map(t => {
        if (t.id === currentTicket.id) {
          return {
            ...t,
            userPhone: phoneForCallback,
            messages: [...t.messages, sysMsg]
          };
        }
        return t;
      }));
  };

  const whatsappUrl = `https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `مرحباً منصة يدوي، أرغب في المتابعة مع ممثل خدمة العملاء بخصوص تذكرة الدعم رقم: #${currentTicket.id}`
  )}`;

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-6 sm:py-10 px-4 sm:px-6 text-right font-sans">
      <div className="max-w-4xl mx-auto space-y-5">
        
        {/* Top Header Card */}
        <div className="p-6 rounded-3xl bg-[#254D3F] text-white shadow-xl relative overflow-hidden border border-[#1A372D]">
          {/* Subtle background glow/pattern */}
          <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-[#C97A57]/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                <Headphones className="w-7 h-7 text-[#E6E1D3]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h1 className="font-display font-black text-xl sm:text-2xl text-white">
                    مركز الدعم الفني وتذاكر المساعدة
                  </h1>
                  
                  {/* Real-time Business Hours Badge */}
                  {isLiveSupportOnline ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      الدعم البشري متاح الآن
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-200 border border-amber-400/30">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      خارج ساعات العمل الرسمية
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-[#C5D3CE] max-w-xl leading-relaxed">
                  نظام تذاكر رسمي معتمد لحل مشكلات الطلبات، شحن المشغولات اليدوية، المعاينة والكسور، وضمان مستحقات الورش.
                </p>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              {/* Human Handoff Quick Button */}
              <button
                type="button"
                onClick={handleRequestHumanAgent}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#1F2937] text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                title="طلب التحدث مع ممثل بشري"
              >
                <UserCheck className="w-4 h-4" />
                <span>تحويل لموظف بشري</span>
              </button>

              {/* Tickets History Button */}
              <button
                type="button"
                onClick={() => setShowTicketsDrawer(!showTicketsDrawer)}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-white/15 cursor-pointer"
                title="عرض تذاكري السابقة"
              >
                <History className="w-4 h-4" />
                <span>تذاكري ({tickets.length})</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showTicketsDrawer ? 'rotate-180' : ''}`} />
              </button>

              {/* Track Order Shortcut */}
              <button
                type="button"
                onClick={onNavigateTracking}
                className="px-3 py-2 rounded-xl bg-[#C97A57] hover:bg-[#B36846] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>تتبع شحنة</span>
              </button>
            </div>
          </div>

          {/* Ticket Information Bar */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            
            {/* Active Ticket ID + Copy Button */}
            <div className="flex items-center gap-2 bg-black/25 px-3 py-1.5 rounded-xl border border-white/15">
              <span className="text-[#C5D3CE] text-[11px]">التذكرة الحالية:</span>
              <span className="font-mono font-black text-amber-300 text-sm tracking-wide">#{currentTicket.id}</span>
              <button
                type="button"
                onClick={handleCopyTicket}
                className="p-1 rounded hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="نسخ رقم التذكرة للمتابعة"
              >
                {copiedTicketId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              {copiedTicketId && <span className="text-[10px] text-emerald-300 font-bold">تم النسخ!</span>}
            </div>

            {/* User Mode Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[#C5D3CE] font-bold text-[11px]">الصفة:</span>
              <div className="flex p-0.5 rounded-xl bg-black/20 border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveUserType('customer')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
                    activeUserType === 'customer'
                      ? 'bg-white text-[#254D3F] shadow-xs'
                      : 'text-[#C5D3CE] hover:text-white'
                  }`}
                >
                  <User className="w-3 h-3" />
                  <span>عميل</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveUserType('artisan')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
                    activeUserType === 'artisan'
                      ? 'bg-[#C97A57] text-white shadow-xs'
                      : 'text-[#C5D3CE] hover:text-white'
                  }`}
                >
                  <Store className="w-3 h-3" />
                  <span>صانع / ورشة</span>
                </button>
              </div>
            </div>

            {/* Operating Hours Note */}
            <div className="flex items-center gap-2 text-[11px] text-[#A3B8B0]">
              <Clock className="w-3.5 h-3.5 text-[#C97A57]" />
              <span>مواعيد العمل الرسمية: {BUSINESS_HOURS.hoursText} ({BUSINESS_HOURS.workDays})</span>
            </div>

          </div>
        </div>

        {/* Tickets Drawer / Dropdown */}
        {showTicketsDrawer && (
          <div className="bg-white p-5 rounded-3xl border border-[#E6E1D3] shadow-lg animate-fadeIn">
            <div className="flex items-center justify-between mb-3 border-b border-[#E6E1D3] pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#254D3F]" />
                <h3 className="font-bold text-sm text-[#1F2937]">سجل التذاكر السابقة الخاصة بك</h3>
              </div>
              <button
                type="button"
                onClick={handleStartNewTicket}
                className="px-3 py-1.5 rounded-xl bg-[#254D3F] hover:bg-[#1A372D] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>فتح تذكرة جديدة</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {tickets.map(t => {
                const isActive = t.id === activeTicketId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setActiveTicketId(t.id);
                      setShowTicketsDrawer(false);
                    }}
                    className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                      isActive
                        ? 'border-[#254D3F] bg-[#254D3F]/5 ring-2 ring-[#254D3F]/20'
                        : 'border-[#E6E1D3] bg-[#FDFBF7] hover:border-[#254D3F]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono font-bold text-xs text-[#254D3F]">#{t.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'open' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : t.status === 'in_progress' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {t.status === 'open' ? 'مفتوحة' : t.status === 'in_progress' ? 'قيد المتابعة' : 'مغلقة'}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#1F2937] truncate">{t.subject}</div>
                    <div className="text-[10px] text-[#6B7280] mt-1 flex items-center justify-between">
                      <span>{t.createdAt}</span>
                      <span>{t.messages.length} رسائل</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Chat Main Window */}
        <div className="bg-white rounded-3xl border border-[#E6E1D3] shadow-md overflow-hidden flex flex-col h-[580px]">
          
          {/* Chat Window Banner */}
          <div className="bg-[#F6F4ED] px-5 py-3 border-b border-[#E6E1D3] flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[#1F2937] font-bold">
                <MessageSquare className="w-4 h-4 text-[#254D3F]" />
                <span>تذكرة رقم #{currentTicket.id}</span>
              </div>
              {currentTicket.assignedAgent && (
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>الممثل المخصص: {currentTicket.assignedAgent.name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-[#6B7280]">
                {currentUser ? `المستخدم: ${currentUser.name}` : 'جلسة زائر (يتم الحفظ التلقائي)'}
              </span>
              <button
                type="button"
                onClick={handleStartNewTicket}
                className="text-[11px] text-[#254D3F] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>تذكرة جديدة</span>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#FDFBF7]/60">
            {currentTicket.messages.map((msg) => {
              const isSupport = msg.sender === 'support' || msg.sender === 'admin';
              const isSystem = msg.sender === 'system';

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-3">
                    <div className="max-w-md bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex items-start gap-2 shadow-xs">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="leading-relaxed font-medium">{msg.text}</p>
                        <span className="text-[10px] text-amber-700 block font-mono">{msg.timestamp}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2.5 ${isSupport ? 'justify-start' : 'justify-end'}`}
                >
                  {/* Support Avatar */}
                  {isSupport && (
                    <div className="w-8 h-8 rounded-full bg-[#254D3F] text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                      <Headphones className="w-4 h-4" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-[72%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isSupport
                        ? 'bg-white text-[#1F2937] border border-[#E6E1D3] rounded-br-none shadow-xs'
                        : 'bg-[#254D3F] text-white rounded-bl-none shadow-xs'
                    }`}
                  >
                    {/* Render Image Attachments if present */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mb-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.attachments.map((imgUrl, i) => (
                          <div
                            key={i}
                            className="relative group rounded-xl overflow-hidden border border-black/10 cursor-pointer aspect-video bg-black/5"
                            onClick={() => setPreviewImageModal(imgUrl)}
                          >
                            <img
                              src={imgUrl}
                              alt="مرفق التذكرة"
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Maximize2 className="w-5 h-5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Text content */}
                    {msg.text && <div className="whitespace-pre-line font-body">{msg.text}</div>}

                    {/* Timestamp and sender details */}
                    <div
                      className={`text-[10px] mt-1.5 flex items-center gap-1.5 ${
                        isSupport ? 'text-[#9CA3AF]' : 'text-emerald-200'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {isSupport && <span>• خدمة عملاء يدوي</span>}
                      {!isSupport && (
                        <span>
                          • {msg.senderRole === 'artisan' ? 'صانع' : 'عميل'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {!isSupport && (
                    <div className="w-8 h-8 rounded-full bg-[#C97A57] text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                      {msg.senderRole === 'artisan' ? <Store className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                <div className="w-7 h-7 rounded-full bg-[#254D3F] text-white flex items-center justify-center shrink-0">
                  <Headphones className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-[#E6E1D3] rounded-2xl px-4 py-2 flex items-center gap-1.5 shadow-xs">
                  <span className="text-[11px] text-[#254D3F] font-bold">فريق الدعم يجهز الرد...</span>
                  <span className="w-1.5 h-1.5 bg-[#254D3F] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#254D3F] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-[#254D3F] rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Chips */}
          <div className="px-4 py-2.5 bg-[#F6F4ED] border-t border-[#E6E1D3] overflow-x-auto flex items-center gap-2 no-scrollbar">
            <span className="text-[10px] font-bold text-[#6B7280] shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C97A57]" />
              استفسارات شائعة:
            </span>
            {COMMON_QUESTIONS.filter(q => q.role === 'all' || q.role === activeUserType).map((faq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(faq.q)}
                className="shrink-0 px-3 py-1 rounded-full bg-white border border-[#D5CEBD] text-[#254D3F] hover:bg-[#254D3F] hover:text-white text-[11px] font-bold transition-colors cursor-pointer"
              >
                {faq.q}
              </button>
            ))}
          </div>

          {/* Attachment Preview Tray (Before Sending) */}
          {selectedAttachments.length > 0 && (
            <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 flex items-center gap-3 overflow-x-auto">
              <span className="text-[11px] font-bold text-amber-900 shrink-0 flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5 text-[#C97A57]" />
                الصور المرفقة ({selectedAttachments.length}):
              </span>
              <div className="flex items-center gap-2">
                {selectedAttachments.map((imgSrc, idx) => (
                  <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-amber-300 shrink-0 group">
                    <img src={imgSrc} alt="مرفق" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="حذف الصورة"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 sm:p-4 bg-white border-t border-[#E6E1D3] flex items-center gap-2"
          >
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />

            {/* Attach Image Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-2xl bg-[#F6F4ED] hover:bg-[#EBE7DC] text-[#254D3F] transition-colors cursor-pointer shrink-0 border border-[#E6E1D3]"
              title="إرفاق صور للمشكلة أو الكسر"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* Input Field */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                activeUserType === 'artisan'
                  ? 'اكتب استفسارك بخصوص استلام المندوب، مستحقات الورشة، أو إرفاق صور المشغولات...'
                  : 'اكتب مشكلتك بخصوص الشحن، تلف القطع، أو اضغط رمز الكاميرا لإرفاق صورة...'
              }
              className="flex-1 px-4 py-3 rounded-2xl bg-[#F6F4ED] border border-[#E6E1D3] text-xs sm:text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#254D3F] focus:bg-white transition-all"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!inputMessage.trim() && selectedAttachments.length === 0) || isTyping}
              className="px-5 py-3 rounded-2xl bg-[#254D3F] hover:bg-[#1A372D] disabled:opacity-40 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer shrink-0"
            >
              <span>إرسال</span>
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>

        </div>

        {/* Bottom Informational Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#E6E1D3] flex items-start gap-3 shadow-xs">
            <div className="p-2.5 rounded-xl bg-[#254D3F]/10 text-[#254D3F] shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#1F2937] mb-1">مواعيد الدعم وساعات العمل</h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                الفريق البشري متاح يومياً من 9:00 ص حتى 11:00 م. وخارج هذه الأوقات يتم حفظ تذكرتك فوراً للرد في الصباح.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E6E1D3] flex items-start gap-3 shadow-xs">
            <div className="p-2.5 rounded-xl bg-[#C97A57]/15 text-[#C97A57] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#1F2937] mb-1">توثيق الكسور وبدائل الشحن</h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                ارفع صورة المشكلة بالشات وسيتم توجيه مندوب الاستبدال والتعويض دون تكاليف إضافية عليك.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E6E1D3] flex items-start gap-3 shadow-xs">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#1F2937] mb-1">أمان المعاملات وضمان يدوي</h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                حق المعاينة الكاملة عند الاستلام وحفظ حقوق الحرفيين والمشترين بنظام الضمان المالي المعتمد.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Human Handoff Modal */}
      {showHandoffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-right space-y-4 shadow-2xl border border-[#E6E1D3]">
            <div className="flex items-center justify-between border-b border-[#E6E1D3] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1F2937]">طلب التحويل لموظف بشري</h3>
                  <span className="text-[11px] text-[#6B7280]">تذكرة رقم #{currentTicket.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHandoffModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Operating status note in modal */}
            {isLiveSupportOnline ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1 animate-pulse" />
                <div>
                  <span className="font-bold block mb-0.5">فريق الدعم البشري متاح الآن!</span>
                  <span>متوسط وقت الرد الحالي أقل من دقيقتين.</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">خارج أوقات العمل الرسمية</span>
                  <span>مواعيد العمل: {BUSINESS_HOURS.hoursText}. يمكنك مراسلتنا وسيتم الرد صباحاً في أول الوردية.</span>
                </div>
              </div>
            )}

            {/* Handoff Options */}
            <div className="space-y-3 pt-1">
              {/* Option 1: WhatsApp Direct Link */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-between shadow-md transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  <span>محادثة واتساب الرسمية مع الدعم</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">رد فوري</span>
              </a>

              {/* Option 2: Request Phone Call */}
              <div className="p-4 rounded-2xl bg-[#F6F4ED] border border-[#E6E1D3] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1F2937]">
                  <PhoneCall className="w-4 h-4 text-[#C97A57]" />
                  <span>طلب اتصال هاتفي من ممثل الدعم</span>
                </div>
                {callbackRequested ? (
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>تم تسجيل طلبك بنجاح وسيتصل بك الممثل قريباً.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitCallback} className="flex gap-2">
                    <input
                      type="tel"
                      value={phoneForCallback}
                      onChange={(e) => setPhoneForCallback(e.target.value)}
                      placeholder="رقم الهاتف (مثال: 01012345678)"
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#D5CEBD] text-xs focus:outline-none focus:border-[#254D3F]"
                    />
                    <button
                      type="submit"
                      disabled={!phoneForCallback.trim()}
                      className="px-3 py-2 rounded-xl bg-[#254D3F] hover:bg-[#1A372D] text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                    >
                      طلب اتصال
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-[#E6E1D3] flex justify-end">
              <button
                type="button"
                onClick={() => setShowHandoffModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1F2937] text-xs font-bold transition-colors cursor-pointer"
              >
                الرجوع للشات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Image Lightbox Modal */}
      {previewImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn cursor-pointer"
          onClick={() => setPreviewImageModal(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] w-full rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <img
              src={previewImageModal}
              alt="معاينة الصورة بالحجم الكامل"
              className="w-full h-full object-contain max-h-[85vh] bg-black"
            />
            <button
              type="button"
              onClick={() => setPreviewImageModal(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
