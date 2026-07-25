import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import {
  Bot,
  Briefcase,
  Check,
  Clipboard,
  FileText,
  Lightbulb,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  RefreshCw,
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

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-3 py-2">
        <span className="text-xs font-medium text-slate-400">
          {language || "code"}
        </span>

        <button
          type="button"
          onClick={copyCode}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              Copied
            </>
          ) : (
            <>
              <Clipboard className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "transparent",
          fontSize: "0.75rem",
          lineHeight: "1.5",
        }}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function AIAssistant() {
  const [isOpen, setIsOpen] =
    useState(false);

  const [messages, setMessages] =
    useState(getStoredMessages);

  const [input, setInput] =
    useState("");

  const [isSending, setIsSending] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    copiedMessageId,
    setCopiedMessageId,
  ] = useState(null);

  const [
    typingMessageId,
    setTypingMessageId,
  ] = useState(null);

  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);

  const messagesEndRef =
    useRef(null);

  const inputRef =
    useRef(null);

  const copyTimeoutRef =
    useRef(null);

  const typingTimeoutRef =
    useRef(null);

  const userData = useMemo(
    () =>
      safelyParseJSON(
        localStorage.getItem(
          "pathpilot_user"
        ),
        {}
      ),
    [isOpen]
  );

  const roadmapData = useMemo(() => {
    const storedRoadmap =
      safelyParseJSON(
        localStorage.getItem(
          "pathpilot_roadmap"
        ),
        {}
      );

    return Array.isArray(
      storedRoadmap?.phases
    )
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
    const messagesToStore =
      messages.slice(-30);

    localStorage.setItem(
      "pathpilot_assistant_messages",
      JSON.stringify(
        messagesToStore
      )
    );
  }, [messages]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    messagesEndRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      }
    );
  }, [
    messages,
    isSending,
    isOpen,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const focusTimeout =
      window.setTimeout(() => {
        inputRef.current?.focus();
      }, 150);

    return () => {
      window.clearTimeout(
        focusTimeout
      );
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(
          copyTimeoutRef.current
        );
      }

      if (typingTimeoutRef.current) {
        window.clearTimeout(
          typingTimeoutRef.current
        );
      }
    };
  }, []);

  useEffect(() => {
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onstart = () => {
    setIsListening(true);
  };

  recognition.onend = () => {
    setIsListening(false);
  };

  recognition.onresult = (event) => {
    let transcript = "";

    for (
      let i = event.resultIndex;
      i < event.results.length;
      i++
    ) {
      transcript += event.results[i][0].transcript;
    }

    setInput(transcript);
  };

  recognition.onerror = () => {
    setIsListening(false);
  };

  recognitionRef.current = recognition;
  }, []);

  const toggleVoiceInput = () => {
  if (!recognitionRef.current) {
    alert(
      "Speech recognition isn't supported in this browser."
    );
    return;
  }

  if (isListening) {
    recognitionRef.current.stop();
  } else {
    recognitionRef.current.start();
  }
  };

  const copyMessage = async (
    message
  ) => {
    try {
      await navigator.clipboard.writeText(
        message.content
      );

      setCopiedMessageId(
        message.id
      );

      if (copyTimeoutRef.current) {
        window.clearTimeout(
          copyTimeoutRef.current
        );
      }

      copyTimeoutRef.current =
        window.setTimeout(() => {
          setCopiedMessageId(null);
        }, 2000);
    } catch (copyError) {
      console.error(
        "Unable to copy response:",
        copyError
      );

      setError(
        "Unable to copy this response."
      );
    }
  };

  const submitMessage = async (
    providedMessage,
    options = {}
  ) => {
    const {
      addUserMessage = true,
      conversationOverride = null,
    } = options;

    const message =
      typeof providedMessage ===
      "string"
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

    const conversation =
      conversationOverride ||
      messages
        .filter(
          (item) =>
            item.id !==
            WELCOME_MESSAGE.id
        )
        .slice(-10)
        .map((item) => ({
          role: item.role,
          content: item.content,
        }));

    if (addUserMessage) {
      setMessages(
        (currentMessages) => [
          ...currentMessages,
          userMessage,
        ]
      );
    }

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

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: reply,
      };

      setTypingMessageId(
        assistantMessage.id
      );

      setMessages(
        (currentMessages) => [
          ...currentMessages,
          assistantMessage,
        ]
      );

      if (
        typingTimeoutRef.current
      ) {
        window.clearTimeout(
          typingTimeoutRef.current
        );
      }

      typingTimeoutRef.current =
        window.setTimeout(() => {
          setTypingMessageId(null);
        }, 700);
    } catch (requestError) {
      console.error(
        "Assistant request failed:",
        requestError
      );

      setError(
        requestError.message ||
          "Unable to get a response."
      );
    } finally {
      setIsSending(false);
    }
  };

  const regenerateResponse =
    async (assistantMessageId) => {
      if (isSending) {
        return;
      }

      const assistantIndex =
        messages.findIndex(
          (message) =>
            message.id ===
            assistantMessageId
        );

      if (assistantIndex < 1) {
        return;
      }

      let userMessageIndex =
        assistantIndex - 1;

      while (
        userMessageIndex >= 0 &&
        messages[userMessageIndex]
          .role !== "user"
      ) {
        userMessageIndex -= 1;
      }

      if (userMessageIndex < 0) {
        return;
      }

      const originalUserMessage =
        messages[
          userMessageIndex
        ];

      const conversation =
        messages
          .slice(
            0,
            assistantIndex
          )
          .filter(
            (message) =>
              message.id !==
              WELCOME_MESSAGE.id
          )
          .slice(-10)
          .map((message) => ({
            role: message.role,
            content:
              message.content,
          }));

      setMessages(
        (currentMessages) =>
          currentMessages.filter(
            (message) =>
              message.id !==
              assistantMessageId
          )
      );

      await submitMessage(
        originalUserMessage.content,
        {
          addUserMessage: false,
          conversationOverride:
            conversation,
        }
      );
    };

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();
    submitMessage();
  };

  const handleKeyDown = (
    event
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      submitMessage();
    }
  };

  const clearConversation =
    () => {
      setMessages([
        WELCOME_MESSAGE,
      ]);

      setError("");
      setCopiedMessageId(null);
      setTypingMessageId(null);

      localStorage.removeItem(
        "pathpilot_assistant_messages"
      );
    };
      const renderMarkdownMessage = (
    message
  ) => {
    const isTyping =
      typingMessageId === message.id;

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-2 mt-3 text-lg font-bold text-slate-900 first:mt-0 dark:text-white">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="mb-2 mt-3 text-base font-bold text-slate-900 first:mt-0 dark:text-white">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="mb-1 mt-3 font-bold text-slate-900 first:mt-0 dark:text-white">
              {children}
            </h3>
          ),

          p: ({ children }) => (
            <p className="mb-2 last:mb-0">
              {children}
            </p>
          ),

          ul: ({ children }) => (
            <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">
              {children}
            </ol>
          ),

          li: ({ children }) => (
            <li>{children}</li>
          ),

          strong: ({ children }) => (
            <strong className="font-bold text-slate-900 dark:text-white">
              {children}
            </strong>
          ),

          em: ({ children }) => (
            <em className="italic">
              {children}
            </em>
          ),

          a: ({
            href,
            children,
          }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              {children}
            </a>
          ),

          blockquote: ({
            children,
          }) => (
            <blockquote className="my-3 border-l-4 border-indigo-400 bg-indigo-50 px-3 py-2 italic text-slate-600 dark:bg-indigo-950/30 dark:text-slate-300">
              {children}
            </blockquote>
          ),

          code: ({
           inline,
           className,
           children,
           ...props
          }) => {
            const match =
            /language-(\w+)/.exec(
              className || ""
            );

           const code = String(children).replace(
            /\n$/,
             ""
           );

           if (inline) {
             return (
               <code
                className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-xs text-indigo-700 dark:bg-slate-700 dark:text-indigo-300"
                {...props}
               >
                {children}
               </code>
              );
            }

            return (
             <CodeBlock
               language={
                 match ? match[1] : "text"
               }
               code={code}
             />
           );
          },

          pre: ({ children }) => (
          <>{children}</>
          ),

    

          table: ({
            children,
          }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="min-w-full border-collapse text-xs">
                {children}
              </table>
            </div>
          ),

          th: ({ children }) => (
            <th className="border-b border-r border-slate-300 bg-slate-100 px-3 py-2 text-left font-bold text-slate-900 last:border-r-0 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="border-b border-r border-slate-200 px-3 py-2 last:border-r-0 dark:border-slate-700">
              {children}
            </td>
          ),

          hr: () => (
            <hr className="my-4 border-slate-200 dark:border-slate-700" />
          ),
        }}
      >
        {message.content}
      </ReactMarkdown>
    );
  };

  return (
    <>
      {isOpen && (
        <section
          className="fixed bottom-24 right-4 z-[90] flex h-[min(700px,calc(100vh-120px))] w-[calc(100vw-2rem)] max-w-[440px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 dark:border-slate-700 dark:bg-slate-900"
          aria-label="PathPilot AI Career Copilot"
        >
          <header className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 text-white">
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                  <Bot className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="font-bold">
                    PathPilot Copilot
                  </h2>

                  <p className="flex items-center gap-1.5 text-xs text-indigo-100">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                    AI career assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={
                    clearConversation
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-white/15"
                  aria-label="Clear conversation"
                  title="Clear conversation"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setIsOpen(false)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-white/15"
                  aria-label="Close AI assistant"
                  title="Close assistant"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto bg-slate-50/70 px-4 py-5 dark:bg-slate-950/60">
            <div className="space-y-4">
              {messages.map(
                (message) => {
                  const isUser =
                    message.role ===
                    "user";

                  const isWelcomeMessage =
                    message.id ===
                    WELCOME_MESSAGE.id;

                  return (
                    <div
                      key={message.id}
                      className={`group flex items-start gap-2 ${
                        isUser
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {!isUser && (
                        <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-sm">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-[84%] ${
                          isUser
                            ? "text-right"
                            : ""
                        }`}
                      >
                        <div
                          className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                            isUser
                              ? "rounded-br-md bg-indigo-600 text-left text-white shadow-sm"
                              : "rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          } ${
                            typingMessageId ===
                            message.id
                              ? "animate-pulse"
                              : ""
                          }`}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-wrap">
                              {
                                message.content
                              }
                            </p>
                          ) : (
                            renderMarkdownMessage(
                              message
                            )
                          )}
                        </div>

                        {!isUser &&
                          !isWelcomeMessage && (
                            <div className="mt-1.5 flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() =>
                                  copyMessage(
                                    message
                                  )
                                }
                                className="flex h-8 items-center gap-1 rounded-lg px-2 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
                                title="Copy response"
                              >
                                {copiedMessageId ===
                                message.id ? (
                                  <>
                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Clipboard className="h-3.5 w-3.5" />
                                    Copy
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  regenerateResponse(
                                    message.id
                                  )
                                }
                                disabled={
                                  isSending
                                }
                                className="flex h-8 items-center gap-1 rounded-lg px-2 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
                                title="Regenerate response"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Regenerate
                              </button>
                            </div>
                          )}
                      </div>
                    </div>
                  );
                }
              )}

              {messages.length === 1 &&
                !isSending && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {SUGGESTED_PROMPTS.map(
                      (item) => {
                        const Icon =
                          item.icon;

                        return (
                          <button
                            key={
                              item.label
                            }
                            type="button"
                            onClick={() =>
                              submitMessage(
                                item.prompt
                              )
                            }
                            className="rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/30"
                          >
                            <Icon className="mb-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />

                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                              {
                                item.label
                              }
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                )}

              {isSending && (
                <div className="flex items-start gap-2">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
                    <Bot className="h-4 w-4" />
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
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
                    onClick={() =>
                      setError("")
                    }
                    className="ml-2 font-semibold underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <div
                ref={messagesEndRef}
              />
            </div>
          </div>
                    <form
            onSubmit={handleSubmit}
            className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:focus-within:ring-indigo-900/40">

             <textarea
               ref={inputRef}
               value={input}
               onChange={(event) =>
                setInput(event.target.value)
               }
               onKeyDown={handleKeyDown}
               rows={1}
               maxLength={5000}
               placeholder="Ask anything about your career..."
               className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
             />

              {/* Voice Button */}
             <button
               type="button"
                onClick={toggleVoiceInput}
                className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                 isListening
                 ? "bg-red-500 text-white animate-pulse"
                 : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
               }`}
                title={
                  isListening
                  ? "Stop listening"
                  : "Voice input"
                }
              >
                {isListening ? (
                 <MicOff className="h-5 w-5" />
               ) : (
                 <Mic className="h-5 w-5" />
               )}
             </button>

             {/* Send Button */}
             <button
                type="submit"
                disabled={
                 !input.trim() ||
                 isSending
                }
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                aria-label="Send message"
              >
               {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
               <Send className="h-5 w-5" />
              )}
             </button>

            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>
                Press <strong>Enter</strong> to send
              </span>

              <span>
                {input.length}/5000
              </span>
            </div>

            <p className="mt-2 text-center text-[11px] text-slate-400">
              AI guidance should be reviewed before making
              important career decisions.
            </p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() =>
          setIsOpen((current) => !current)
        }
        className="fixed bottom-5 right-4 z-[91] flex h-14 items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 font-semibold text-white shadow-2xl shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-indigo-500/40 sm:right-6"
        aria-label={
          isOpen
            ? "Close PathPilot AI"
            : "Open PathPilot AI"
        }
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <MessageCircle className="h-5 w-5" />
          )}
        </div>

        <div className="hidden text-left sm:block">
          <p className="text-sm font-semibold">
            PathPilot AI
          </p>

          <p className="text-[11px] text-indigo-100">
            {isOpen
              ? "Close Assistant"
              : "Ask Anything"}
          </p>
        </div>
      </button>
    </>
  );
}

export default AIAssistant;