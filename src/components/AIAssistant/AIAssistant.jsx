import {
  Bot,
  Briefcase,
  FileText,
  Lightbulb,
  Loader2,
  MessageCircle,
  RotateCcw,
  Send,
  Target,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { sendAssistantMessage } from "../../services/assistantService";

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I’m your PathPilot AI Career Copilot. I can help with your roadmap, resume, projects, skills, interviews, and daily learning plan.",
};

const SUGGESTED_PROMPTS = [
  {
    icon: Target,
    label: "Plan my next step",
    prompt:
      "Based on my career goal and progress, what should I focus on next?",
  },
  {
    icon: Briefcase,
    label: "Suggest a project",
    prompt:
      "Suggest one portfolio project that matches my skills and career goal.",
  },
  {
    icon: FileText,
    label: "Improve my resume",
    prompt:
      "Give me practical advice to improve my resume and become more job-ready.",
  },
  {
    icon: Lightbulb,
    label: "Find my skill gap",
    prompt:
      "What important skills am I currently missing for my career goal?",
  },
];

function safelyParseJSON(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function getStoredMessages() {
  const storedMessages = safelyParseJSON(
    localStorage.getItem(
      "pathpilot_assistant_messages"
    ),
    []
  );

  if (!Array.isArray(storedMessages)) {
    return [WELCOME_MESSAGE];
  }

  return storedMessages.length > 0
    ? storedMessages
    : [WELCOME_MESSAGE];
}

function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] =
    useState(getStoredMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] =
    useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const userData = useMemo(
    () =>
      safelyParseJSON(
        localStorage.getItem("pathpilot_user"),
        {}
      ),
    [isOpen]
  );

  const roadmapData = useMemo(() => {
    const storedRoadmap = safelyParseJSON(
      localStorage.getItem("pathpilot_roadmap"),
      {}
    );

    return Array.isArray(storedRoadmap?.phases)
      ? storedRoadmap.phases
      : [];
  }, [isOpen]);

  const resumeAnalysis = useMemo(
    () =>
      safelyParseJSON(
        localStorage.getItem(
          "pathpilot_resume_analysis"
        ),
        null
      ),
    [isOpen]
  );

  useEffect(() => {
    const messagesToStore = messages.slice(-30);

    localStorage.setItem(
      "pathpilot_assistant_messages",
      JSON.stringify(messagesToStore)
    );
  }, [messages]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isSending, isOpen]);

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const submitMessage = async (
    providedMessage
  ) => {
    const message =
      typeof providedMessage === "string"
        ? providedMessage.trim()
        : input.trim();

    if (!message || isSending) {
      return;
    }

    setError("");
    setInput("");

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
    };

    const conversation = messages
      .filter(
        (item) =>
          item.id !== WELCOME_MESSAGE.id
      )
      .slice(-10)
      .map((item) => ({
        role: item.role,
        content: item.content,
      }));

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
    ]);

    setIsSending(true);

    try {
      const reply =
        await sendAssistantMessage({
          message,
          user: userData,
          roadmap: roadmapData,
          resumeAnalysis,
          conversation,
        });

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to get a response."
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitMessage();
  };

  const clearConversation = () => {
    setMessages([WELCOME_MESSAGE]);
    setError("");

    localStorage.removeItem(
      "pathpilot_assistant_messages"
    );
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      submitMessage();
    }
  };

  return (
    <>
      {isOpen && (
        <section
          className="fixed bottom-24 right-4 z-[90] flex h-[min(680px,calc(100vh-120px))] w-[calc(100vw-2rem)] max-w-[420px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 dark:border-slate-700 dark:bg-slate-900"
          aria-label="PathPilot AI Career Copilot"
        >
          <header className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <Bot className="h-6 w-6" />
              </div>

              <div>
                <h2 className="font-bold">
                  PathPilot Copilot
                </h2>

                <p className="flex items-center gap-1.5 text-xs text-indigo-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  AI career assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearConversation}
                className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-white/15"
                aria-label="Clear conversation"
                title="Clear conversation"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-white/15"
                aria-label="Close AI assistant"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-5">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                      message.role === "user"
                        ? "rounded-br-md bg-indigo-600 text-white"
                        : "rounded-bl-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {messages.length === 1 &&
                !isSending && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {SUGGESTED_PROMPTS.map(
                      (item) => {
                        const Icon = item.icon;

                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() =>
                              submitMessage(
                                item.prompt
                              )
                            }
                            className="rounded-2xl border border-slate-200 p-3 text-left transition hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-700 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/30"
                          >
                            <Icon className="mb-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />

                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                              {item.label}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                )}

              {isSending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    PathPilot is thinking...
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                  {error}

                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="ml-2 font-semibold underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-indigo-500 dark:border-slate-700 dark:bg-slate-950">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                onKeyDown={handleKeyDown}
                rows={1}
                maxLength={5000}
                placeholder="Ask about your career..."
                className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              />

              <button
                type="submit"
                disabled={
                  !input.trim() || isSending
                }
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>

            <p className="mt-2 text-center text-[11px] text-slate-400">
              AI guidance may require your own
              judgement.
            </p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() =>
          setIsOpen((current) => !current)
        }
        className="fixed bottom-5 right-4 z-[91] flex h-14 items-center gap-2 rounded-2xl bg-indigo-600 px-4 font-semibold text-white shadow-xl shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-700 sm:right-6"
        aria-label={
          isOpen
            ? "Close PathPilot AI"
            : "Open PathPilot AI"
        }
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}

        <span className="hidden sm:inline">
          {isOpen
            ? "Close"
            : "Ask PathPilot"}
        </span>
      </button>
    </>
  );
}

export default AIAssistant;