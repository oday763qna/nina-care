
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Loader2, MessageCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'مرحباً بكِ في نينا كير! أنا مستشارتكِ الذكية، كيف يمكنني مساعدتكِ اليوم في اختيار منتجات العناية بجمالكِ؟' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: "أنتِ خبيرة تجميل وعناية بالبشرة في متجر 'نينا كير' (Nina Care). اسمكِ 'مستشارة نينا'. أجيبي باللغة العربية بأسلوب أنثوي، مهني، وودود. قدمي نصائح حول الروتين اليومي للبشرة والمكياج. إذا سألت الزبونة عن منتجات، اقترحي عليها الاهتمام بجودة المنتجات المتوفرة في المتجر.",
        },
      });

      const aiResponse = response.text || "عذراً، واجهت مشكلة في معالجة طلبكِ. هل يمكنكِ إعادة السؤال؟";
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "أعتذر منكِ، يبدو أن هناك ضغطاً على الخدمة حالياً. حاولي مرة أخرى لاحقاً." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-cairo">
      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-pink-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all animate-bounce"
        >
          <Sparkles size={30} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[350px] md:w-[400px] h-[550px] bg-white rounded-[35px] shadow-2xl flex flex-col overflow-hidden border border-pink-50 animate-in fade-in slide-in-from-bottom-10 duration-300">
          {/* Header */}
          <div className="bg-pink-600 p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-black text-sm">مستشارة نينا</h3>
                <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest">AI Beauty Expert</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
              <X size={24} />
            </button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-pink-50/30 no-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-bold leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                  ? 'bg-white text-gray-700 rounded-tr-none' 
                  : 'bg-pink-600 text-white rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-end">
                <div className="bg-pink-200 text-pink-700 p-4 rounded-3xl rounded-tl-none flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-[10px] font-bold">جاري التفكير...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-5 bg-white border-t border-pink-50">
            <div className="relative">
              <input 
                type="text" 
                placeholder="اسألي خبيرتنا عن أي نصيحة..."
                className="w-full p-4 pr-12 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-pink-100 text-xs font-bold transition-all border border-gray-100"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-pink-600 text-white p-2.5 rounded-xl hover:bg-pink-700 transition-colors disabled:opacity-50"
              >
                <Send size={18} className="rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChat;
