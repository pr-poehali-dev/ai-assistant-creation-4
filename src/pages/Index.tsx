import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';

type Message = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
};

const MODELS = [
  { id: 'nova', name: 'Nova Pro', desc: 'Универсальная модель', icon: 'Sparkles' },
  { id: 'flux', name: 'Flux Reason', desc: 'Глубокие рассуждения', icon: 'Brain' },
  { id: 'turbo', name: 'Turbo Lite', desc: 'Молниеносные ответы', icon: 'Zap' },
];

const INTEGRATIONS = [
  { name: 'Поиск в вебе', icon: 'Globe', color: '190 95% 55%', active: true },
  { name: 'Календарь', icon: 'Calendar', color: '265 90% 65%', active: true },
  { name: 'Почта Gmail', icon: 'Mail', color: '320 90% 62%', active: false },
  { name: 'Notion', icon: 'FileText', color: '40 95% 60%', active: false },
  { name: 'GitHub', icon: 'Github', color: '210 20% 70%', active: true },
  { name: 'Погода', icon: 'CloudSun', color: '190 95% 55%', active: false },
];

const SUGGESTIONS = [
  { title: 'Составь план', sub: 'на неделю по проекту', icon: 'ListChecks' },
  { title: 'Найди в интернете', sub: 'свежие новости по теме', icon: 'Search' },
  { title: 'Объясни просто', sub: 'сложную концепцию', icon: 'GraduationCap' },
  { title: 'Напиши письмо', sub: 'деловое и вежливое', icon: 'PenLine' },
];

const CHAT_URL = 'https://functions.poehali.dev/aa67ebed-6769-4b20-ad01-f52f6fd9e989';

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState(MODELS[0]);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const send = async (text: string) => {
    if (!text.trim() || thinking) return;
    const userMsg: Message = { id: Date.now(), role: 'user', text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setThinking(true);
    try {
      const res = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model.id,
          messages: history.map((m) => ({ role: m.role, text: m.text })),
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: data.reply || 'Не удалось получить ответ. Проверь, что подключён ключ нейросети.',
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, role: 'assistant', text: 'Ошибка связи с сервером. Попробуй ещё раз.' },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const hasChat = messages.length > 0;

  return (
    <div className="relative min-h-screen overflow-hidden aurora-bg text-foreground">
      <div className="pointer-events-none absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-[hsl(265_90%_65%/0.25)] blur-[120px] animate-float-slow" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[26rem] w-[26rem] rounded-full bg-[hsl(190_95%_55%/0.2)] blur-[120px] animate-float-slow" style={{ animationDelay: '4s' }} />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 lg:flex-row lg:gap-6 lg:px-6">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col gap-4 py-6 lg:flex">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(265_90%_65%)] to-[hsl(190_95%_55%)] glow-ring">
              <Icon name="Orbit" size={22} className="text-white" />
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-none">Aura AI</p>
              <p className="text-xs text-muted-foreground">личный помощник</p>
            </div>
          </div>

          <div className="glass mt-2 rounded-2xl p-3">
            <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Модель</p>
            <div className="flex flex-col gap-1">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModel(m)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-all ${
                    model.id === m.id ? 'bg-primary/15 text-foreground' : 'text-muted-foreground hover:bg-white/5'
                  }`}
                >
                  <Icon name={m.icon} size={18} className={model.id === m.id ? 'text-[hsl(190_95%_60%)]' : ''} />
                  <div>
                    <p className="text-sm font-medium leading-none">{m.name}</p>
                    <p className="text-[11px] opacity-70">{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="glass flex-1 rounded-2xl p-3">
            <p className="mb-2 flex items-center gap-1.5 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Icon name="Plug" size={13} /> Интеграции
            </p>
            <div className="flex flex-col gap-1">
              {INTEGRATIONS.map((it) => (
                <div key={it.name} className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `hsl(${it.color} / 0.15)` }}>
                    <Icon name={it.icon} size={15} style={{ color: `hsl(${it.color})` }} />
                  </div>
                  <span className="flex-1 text-sm">{it.name}</span>
                  <span className={`h-2 w-2 rounded-full ${it.active ? 'bg-[hsl(150_80%_50%)] shadow-[0_0_8px_hsl(150_80%_50%)]' : 'bg-muted'}`} />
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Chat area */}
        <main className="flex flex-1 flex-col py-4 lg:py-6">
          {/* Mobile header */}
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(265_90%_65%)] to-[hsl(190_95%_55%)]">
                <Icon name="Orbit" size={20} className="text-white" />
              </div>
              <p className="font-display text-lg font-bold">Aura AI</p>
            </div>
            <div className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm">
              <Icon name={model.icon} size={14} className="text-[hsl(190_95%_60%)]" />
              {model.name}
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto pr-1">
            {!hasChat ? (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center animate-fade-in">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[hsl(265_90%_65%)] via-[hsl(320_90%_62%)] to-[hsl(190_95%_55%)] glow-ring">
                  <Icon name="Sparkles" size={36} className="text-white" />
                </div>
                <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
                  Привет! Я <span className="text-gradient">Aura</span>
                </h1>
                <p className="mt-3 max-w-md text-muted-foreground">
                  Твой персональный ИИ-помощник с доступом к внешним сервисам. Спроси что угодно или выбери идею ниже.
                </p>
                <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={s.title}
                      onClick={() => send(`${s.title} ${s.sub}`)}
                      style={{ animationDelay: `${i * 80}ms` }}
                      className="glass group flex items-center gap-3 rounded-2xl p-4 text-left opacity-0 animate-scale-in transition-all hover:-translate-y-0.5 hover:border-[hsl(265_90%_65%/0.4)]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 transition-colors group-hover:bg-primary/25">
                        <Icon name={s.icon} size={18} className="text-[hsl(190_95%_60%)]" />
                      </div>
                      <div>
                        <p className="font-medium">{s.title}</p>
                        <p className="text-sm text-muted-foreground">{s.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 py-2">
                {messages.map((m) => (
                  <div key={m.id} className={`flex animate-fade-in gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        m.role === 'user' ? 'bg-secondary' : 'bg-gradient-to-br from-[hsl(265_90%_65%)] to-[hsl(190_95%_55%)]'
                      }`}
                    >
                      <Icon name={m.role === 'user' ? 'User' : 'Sparkles'} size={18} className="text-white" />
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 leading-relaxed ${
                        m.role === 'user' ? 'bg-primary text-primary-foreground' : 'glass'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {thinking && (
                  <div className="flex animate-fade-in gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(265_90%_65%)] to-[hsl(190_95%_55%)]">
                      <Icon name="Sparkles" size={18} className="text-white" />
                    </div>
                    <div className="glass flex items-center gap-1.5 rounded-2xl px-5 py-4">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-2 w-2 rounded-full bg-[hsl(190_95%_60%)]"
                          style={{ animation: 'typing-dot 1.2s infinite', animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="mt-4">
            <div className="glass flex items-end gap-2 rounded-2xl p-2 transition-all focus-within:border-[hsl(265_90%_65%/0.5)] focus-within:glow-ring">
              <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">
                <Icon name="Paperclip" size={20} />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                placeholder="Спроси Aura о чём угодно..."
                className="max-h-32 flex-1 resize-none bg-transparent py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(265_90%_65%)] to-[hsl(190_95%_55%)] text-white transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
              >
                <Icon name="ArrowUp" size={20} />
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Aura может ошибаться. Подключено сервисов: 3 из 6
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;