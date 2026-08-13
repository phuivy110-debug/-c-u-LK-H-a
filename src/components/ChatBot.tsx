import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Product } from '../types';
import {
  Bot,
  Send,
  X,
  Sparkles,
  Trash2,
  ExternalLink,
  Fish,
  User,
  Info,
  ShoppingCart,
  MessageCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  recommendedProducts?: Product[];
}

interface ChatBotProps {
  products: Product[];
}

const QUICK_QUESTIONS = [
  '🎣 Tư vấn cần câu đài 5H đập chết rô chép giá mềm?',
  '🐟 Mồi cám chép LK Hòa kết hợp thính thế nào nhạy nhất?',
  '⚡ Cần Lure LK HSSV / Sinh viên giá bao nhiêu?',
  '🎁 Hôm nay có sản phẩm nào đang ưu đãi nhất?',
];

const MODEL_OPTIONS = [
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', desc: 'Nhanh & Thông Minh' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', desc: 'Chính Xác & Tốt' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', desc: 'Tốc Độ Cao' },
];

export const ChatBot: React.FC<ChatBotProps> = ({ products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcomeToast, setShowWelcomeToast] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-3.6-flash');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        'Xin chào Bác! 🎣 Em là **Trợ Lý Tư Vấn Đồ Câu LK Hòa**.\n\nBác đang tìm mua cần câu cá (5H/6H/Lure), máy câu, mồi cám chép rô hay phụ kiện gì hôm nay? Hãy gõ từ khóa hoặc chọn câu hỏi gợi ý bên dưới nhé!',
      timestamp: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeToast(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setShowWelcomeToast(false);
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const matchedInputProducts = useMemo(() => {
    if (!inputMessage.trim() || inputMessage.trim().length < 2) return [];

    const query = inputMessage.toLowerCase().trim();
    const keywords = query
      .split(/\s+/)
      .map((k) => k.replace(/[^a-z0-9đàáảãạăằắtẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/gi, ''))
      .filter((k) => k.length >= 2);

    if (keywords.length === 0) return [];

    return products
      .filter((product) => {
        const name = (product.name || '').toLowerCase();
        const category = (product.category || '').toLowerCase();
        const desc = (product.description || '').toLowerCase();

        return keywords.some(
          (kw) => name.includes(kw) || category.includes(kw) || desc.includes(kw)
        );
      })
      .slice(0, 4);
  }, [inputMessage, products]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const queryLower = textToSend.toLowerCase();
    const matchedProds = products
      .filter((p) => {
        const name = (p.name || '').toLowerCase();
        const category = (p.category || '').toLowerCase();
        return (
          queryLower.split(/\s+/).some((kw) => kw.length >= 2 && (name.includes(kw) || category.includes(kw))) ||
          (queryLower.includes('5h') && name.includes('5h')) ||
          (queryLower.includes('mồi') && (category.includes('mồi') || name.includes('mồi'))) ||
          (queryLower.includes('cần') && category.includes('cần'))
        );
      })
      .slice(0, 3);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!customText) setInputMessage('');
    setIsLoading(true);

    try {
      const apiPayloadMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiPayloadMessages,
          products,
          selectedModel,
        }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Dạ em chưa rõ câu hỏi, Bác nói rõ hơn giúp em nhé!',
        timestamp: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        recommendedProducts: matchedProds.length > 0 ? matchedProds : undefined,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Bot response error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Có chút gián đoạn kết nối AI: ${
          err.message || 'Chưa nhận được phản hồi.'
        }\n\nBác hãy thử gửi lại câu hỏi nhé!`,
        timestamp: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        recommendedProducts: matchedProds.length > 0 ? matchedProds : undefined,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content:
          'Đã làm mới cuộc hội thoại! 🎣 Em có thể tư vấn gì cho Bác về đồ câu cá LK Hòa hôm nay ạ?',
        timestamp: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
  };

  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');

    return lines.map((line, lineIdx) => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const parts = line.split(urlRegex);

      return (
        <React.Fragment key={lineIdx}>
          {lineIdx > 0 && <br />}
          {parts.map((part, partIdx) => {
            if (part.match(urlRegex)) {
              return (
                <a
                  key={partIdx}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#EE4D2D] hover:underline font-bold bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200 text-xs my-0.5 break-all no-underline"
                >
                  <ShoppingCart className="w-3 h-3 text-[#EE4D2D]" />
                  <span>Xem trên sàn</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              );
            }

            const boldRegex = /\*\*(.*?)\*\*/g;
            const subParts = [];
            let lastIdx = 0;
            let match;

            while ((match = boldRegex.exec(part)) !== null) {
              if (match.index > lastIdx) {
                subParts.push(part.substring(lastIdx, match.index));
              }
              subParts.push(
                <strong key={`b-${match.index}`} className="font-extrabold text-slate-900">
                  {match[1]}
                </strong>
              );
              lastIdx = boldRegex.lastIndex;
            }

            if (lastIdx < part.length) {
              subParts.push(part.substring(lastIdx));
            }

            return <span key={partIdx}>{subParts.length > 0 ? subParts : part}</span>;
          })}
        </React.Fragment>
      );
    });
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
        <AnimatePresence>
          {!isOpen && showWelcomeToast && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="bg-slate-900 text-white rounded-2xl p-3.5 shadow-2xl border border-slate-700/80 max-w-[280px] sm:max-w-[320px] relative text-xs"
            >
              <button
                onClick={() => setShowWelcomeToast(false)}
                className="absolute top-2 right-2 text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
                title="Đóng thông báo"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EE4D2D] flex items-center justify-center text-white font-bold shrink-0 shadow-md">
                  <Fish className="w-5 h-5 text-yellow-200" />
                </div>
                <div>
                  <div className="font-black text-yellow-300 text-[11px] uppercase tracking-wide flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Trợ lý LK Hòa Chào Bác!
                  </div>
                  <p className="text-slate-200 mt-1 leading-relaxed text-[11px]">
                    Bác cần tư vấn chọn <strong className="text-white">cần câu đài (5H/6H)</strong>, mồi cám chép rô hay <strong className="text-orange-400">tra cứu sản phẩm</strong> hôm nay?
                  </p>

                  <button
                    onClick={() => {
                      setIsOpen(true);
                      setShowWelcomeToast(false);
                    }}
                    className="mt-2.5 w-full bg-gradient-to-r from-[#EE4D2D] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md text-[11px] uppercase tracking-wider"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Hỏi Ngay Với AI</span>
                  </button>
                </div>
              </div>

              <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-slate-900" />
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsOpen(true);
              setShowWelcomeToast(false);
            }}
            className="group bg-gradient-to-r from-[#EE4D2D] to-orange-600 text-white rounded-full p-3.5 sm:px-5 sm:py-3.5 shadow-2xl hover:shadow-orange-500/40 border-2 border-white/80 flex items-center gap-3 cursor-pointer relative"
          >
            <div className="relative flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Fish className="w-5 h-5 text-yellow-300 animate-bounce" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
            </div>

            <div className="hidden sm:block text-left">
              <div className="text-xs font-black uppercase tracking-wider text-yellow-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Trợ Lý AI LK Hòa
              </div>
              <div className="text-xs font-bold leading-tight text-white">Hỏi đáp đồ câu 24/7</div>
            </div>

            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-300 border border-white"></span>
            </span>
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 w-[calc(100vw-24px)] sm:w-[420px] h-[600px] max-h-[88vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 z-50 flex flex-col overflow-hidden"
          >
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-700/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EE4D2D] text-white flex items-center justify-center font-bold shadow-md relative">
                  <Fish className="w-6 h-6 text-yellow-200" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    <span>Trợ Lý Đồ Câu LK Hòa</span>
                    <span className="bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 text-[10px] px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wide">
                      AI Powered
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                    <span>Mô hình:</span>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-slate-200 text-[10px] rounded px-1 py-0.5 focus:outline-hidden font-mono cursor-pointer"
                    >
                      {MODEL_OPTIONS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  title="Làm mới trò chuyện"
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Đóng chat"
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-amber-50 border-b border-amber-200/60 px-4 py-2 text-[11px] text-amber-900 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5 font-medium truncate">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Hỗ trợ tự động kết nối {products.length} sản phẩm đồ câu</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 text-xs">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${
                      isUser ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-[11px] ${
                        isUser
                          ? 'bg-slate-800'
                          : 'bg-gradient-to-tr from-[#EE4D2D] to-orange-500 shadow-xs'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-xs space-y-2 ${
                        isUser
                          ? 'bg-[#EE4D2D] text-white rounded-tr-xs font-medium'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs leading-relaxed'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{renderFormattedText(msg.content)}</div>

                      {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 space-y-2 mt-2">
                          <div className="text-[10px] font-extrabold uppercase text-[#EE4D2D] flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Gợi ý sản phẩm phù hợp:
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {msg.recommendedProducts.map((prod) => (
                              <div
                                key={prod.id}
                                className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-orange-50/50 border border-slate-200 rounded-xl transition-all"
                              >
                                {prod.imageUrl && (
                                  <img
                                    src={prod.imageUrl}
                                    alt={prod.name}
                                    className="w-11 h-11 object-cover rounded-lg shrink-0 border border-slate-200"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-slate-900 text-[11px] truncate">
                                    {prod.name}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[#EE4D2D] font-black text-xs">
                                      {prod.referencePrice ? `${prod.referencePrice.toLocaleString('vi-VN')}đ` : 'Kiểm tra giá'}
                                    </span>
                                  </div>
                                </div>
                                <a
                                  href={prod.shopeeUrl || prod.tiktokUrl || '#'}
                                  target="_blank"
                                  rel="sponsored nofollow noopener noreferrer"
                                  className="bg-[#EE4D2D] hover:bg-orange-600 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg shrink-0 flex items-center gap-1 no-underline uppercase"
                                >
                                  <span>Xem</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div
                        className={`text-[9px] text-right font-mono mt-1 ${
                          isUser ? 'text-orange-200' : 'text-slate-400'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#EE4D2D] text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3 shadow-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#EE4D2D] animate-ping" />
                    <span className="text-xs text-slate-600 font-medium">
                      Trợ lý LK Hòa đang suy nghĩ...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <AnimatePresence>
              {matchedInputProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-orange-50/90 border-t border-orange-200 p-2.5 shrink-0 overflow-hidden"
                >
                  <div className="text-[10px] font-extrabold text-orange-900 uppercase tracking-wide flex items-center gap-1 mb-1.5">
                    <Sparkles className="w-3 h-3 text-[#EE4D2D]" />
                    <span>Gợi ý theo từ khóa "{inputMessage.trim()}":</span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
                    {matchedInputProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSendMessage(`Tôi muốn tư vấn về ${p.name}`)}
                        className="bg-white border border-orange-200 hover:border-[#EE4D2D] p-1.5 rounded-xl flex items-center gap-2 shrink-0 max-w-[200px] cursor-pointer shadow-xs transition-all group"
                      >
                        {p.imageUrl && (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-8 h-8 rounded-lg object-cover shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-[10px] text-slate-900 truncate group-hover:text-[#EE4D2D]">
                            {p.name}
                          </div>
                          <div className="text-[#EE4D2D] font-extrabold text-[10px]">
                            {p.referencePrice ? `${p.referencePrice.toLocaleString('vi-VN')}đ` : 'Kiểm tra giá'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Gợi ý:
              </span>
              {QUICK_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  disabled={isLoading}
                  className="bg-slate-100 hover:bg-orange-50 hover:text-[#EE4D2D] hover:border-orange-200 border border-slate-200 text-slate-700 text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer font-medium shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="p-3 bg-white border-t border-slate-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Gõ từ khóa (ví dụ: cần 5H, mồi chép, máy lure...)"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#EE4D2D] focus:bg-white transition-all font-medium"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-[#EE4D2D] hover:bg-orange-600 disabled:bg-slate-300 text-white rounded-xl p-2.5 transition-all shadow-sm cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
