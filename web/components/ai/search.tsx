'use client';
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  type SyntheticEvent,
  use,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';
import { Loader2, MessageCircleIcon, RefreshCw, SearchIcon, Send, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { buttonVariants } from '../ui/button';
import { useChat, type UseChatHelpers } from '@ai-sdk/react';
import { DefaultChatTransport, type Tool, type UIMessage, type UIToolInvocation } from 'ai';
import { Markdown } from '../markdown';

export type ChatUIMessage = UIMessage<
  never,
  {
    client: {
      location: string;
    };
  }
>;

export type SearchTool = Tool<{ query: string; limit: number }>;

const Context = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  chat: UseChatHelpers<ChatUIMessage>;
} | null>(null);

export function AISearchPanelHeader({
  className,
  nativeControlId,
  ...props
}: ComponentProps<'div'> & { nativeControlId?: string }) {
  const { setOpen } = useAISearchContext();

  return (
    <div
      className={cn(
        'sticky top-0 flex items-start gap-2 border rounded-xl bg-fd-secondary text-fd-secondary-foreground shadow-sm',
        className,
      )}
      {...props}
    >
      <div className="px-3 py-2 flex-1">
        <p className="text-sm font-medium mb-2">Asistente SINAI</p>
        <p className="text-xs text-fd-muted-foreground">
          Las respuestas se basan en las guías disponibles. Verifique los datos importantes.
        </p>
      </div>

      {nativeControlId ? (
        <label
          htmlFor={nativeControlId}
          aria-label="Cerrar asistente"
          className={cn(
            buttonVariants({
              size: 'icon-sm',
              color: 'ghost',
              className: 'text-fd-muted-foreground rounded-full cursor-pointer',
            }),
          )}
        >
          <X />
        </label>
      ) : (
        <button
          aria-label="Cerrar asistente"
          tabIndex={-1}
          className={cn(
            buttonVariants({
              size: 'icon-sm',
              color: 'ghost',
              className: 'text-fd-muted-foreground rounded-full',
            }),
          )}
          onClick={() => setOpen(false)}
        >
          <X />
        </button>
      )}
    </div>
  );
}

export function AISearchInputActions() {
  const { messages, status, setMessages, regenerate } = useChatContext();
  const isLoading = status === 'streaming';

  if (messages.length === 0) return null;

  return (
    <>
      {!isLoading && messages.at(-1)?.role === 'assistant' && (
        <button
          type="button"
          className={cn(
            buttonVariants({
              color: 'secondary',
              size: 'sm',
              className: 'rounded-full gap-1.5',
            }),
          )}
          onClick={() => regenerate()}
        >
          <RefreshCw className="size-4" />
          Reintentar
        </button>
      )}
      <button
        type="button"
        className={cn(
          buttonVariants({
            color: 'secondary',
            size: 'sm',
            className: 'rounded-full',
          }),
        )}
        onClick={() => setMessages([])}
      >
      Limpiar conversación
      </button>
    </>
  );
}

const StorageKeyInput = '__ai_search_input';
export function AISearchInput(props: ComponentProps<'form'>) {
  const { status, sendMessage, stop } = useChatContext();
  const [input, setInput] = useState(() => (
    typeof window === 'undefined' ? '' : window.localStorage.getItem(StorageKeyInput) ?? ''
  ));
  const isLoading = status === 'streaming' || status === 'submitted';

  const onStart = (e?: SyntheticEvent) => {
    e?.preventDefault();
    const message = input.trim();
    if (message.length === 0) return;

    void sendMessage({
      role: 'user',
      parts: [
        {
          type: 'data-client',
          data: {
            location: location.href,
          },
        },
        {
          type: 'text',
          text: message,
        },
      ],
    });
    setInput('');
    localStorage.removeItem(StorageKeyInput);
  };

  useEffect(() => {
    if (isLoading) document.getElementById('nd-ai-input')?.focus();
  }, [isLoading]);

  return (
    <form {...props} className={cn('flex items-start pe-2', props.className)} onSubmit={onStart}>
      <Input
        value={input}
        placeholder={isLoading ? 'SINAI está respondiendo…' : 'Escriba una pregunta'}
        autoFocus
        className="p-3"
        disabled={status === 'streaming' || status === 'submitted'}
        onChange={(e) => {
          setInput(e.target.value);
          localStorage.setItem(StorageKeyInput, e.target.value);
        }}
        onKeyDown={(event) => {
          if (!event.shiftKey && event.key === 'Enter') {
            onStart(event);
          }
        }}
      />
      {isLoading ? (
        <button
          key="bn"
          type="button"
          className={cn(
            buttonVariants({
              color: 'secondary',
              className: 'transition-all rounded-full mt-2 gap-2',
            }),
          )}
          onClick={stop}
        >
          <Loader2 className="size-4 animate-spin text-fd-muted-foreground" />
          Detener respuesta
        </button>
      ) : (
        <button
          key="bn"
          type="submit"
          className={cn(
            buttonVariants({
              color: 'primary',
              className: 'transition-all rounded-full mt-2',
            }),
          )}
          disabled={input.length === 0}
        >
          <Send className="size-4" />
        </button>
      )}
    </form>
  );
}

function List({ focusMessageId, ...props }: Omit<ComponentProps<'div'>, 'dir'> & { focusMessageId?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focusMessageId || !containerRef.current) return;

    const frame = requestAnimationFrame(() => {
      const container = containerRef.current;
      const message = Array.from(container?.querySelectorAll<HTMLElement>('[data-ai-message-id]') ?? [])
        .find((element) => element.dataset.aiMessageId === focusMessageId);

      if (!container || !message) return;

      const top = message.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 12;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      container.scrollTo({
        top: Math.max(0, top),
        behavior: reducedMotion ? 'auto' : 'smooth',
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [focusMessageId]);

  return (
    <div
      ref={containerRef}
      {...props}
      className={cn('fd-scroll-container overflow-y-auto min-w-0 flex flex-col', props.className)}
    >
      {props.children}
    </div>
  );
}

function Input(props: ComponentProps<'textarea'>) {
  const ref = useRef<HTMLDivElement>(null);
  const shared = cn('col-start-1 row-start-1', props.className);

  return (
    <div className="grid flex-1">
      <textarea
        id="nd-ai-input"
        {...props}
        className={cn(
          'resize-none bg-transparent placeholder:text-fd-muted-foreground focus-visible:outline-none',
          shared,
        )}
      />
      <div ref={ref} className={cn(shared, 'break-all invisible')}>
        {`${props.value?.toString() ?? ''}\n`}
      </div>
    </div>
  );
}

const roleName: Record<string, string> = {
  user: 'usted',
  assistant: 'SINAI',
};

function Message({
  message,
  showSearchActivity = false,
  ...props
}: { message: ChatUIMessage; showSearchActivity?: boolean } & ComponentProps<'div'>) {
  let markdown = '';
  const searchCalls: UIToolInvocation<SearchTool>[] = [];

  for (const part of message.parts ?? []) {
    if (part.type === 'text') {
      markdown += part.text;
      continue;
    }

    if (part.type.startsWith('tool-')) {
      const toolName = part.type.slice('tool-'.length);
      const p = part as UIToolInvocation<Tool>;

      if (toolName !== 'search' || !p.toolCallId) continue;
      searchCalls.push(p);
    }
  }

  return (
    <div onClick={(e) => e.stopPropagation()} {...props}>
      <p
        className={cn(
          'mb-1 text-sm font-medium text-fd-muted-foreground',
          message.role === 'assistant' && 'text-fd-primary',
        )}
      >
        {roleName[message.role] ?? 'unknown'}
      </p>
      <div className="prose text-sm">
        <Markdown text={markdown} />
      </div>

      {showSearchActivity && searchCalls.map((call) => {
        return (
          <div
            key={call.toolCallId}
            role="status"
            className="flex flex-row gap-2 items-center mt-3 rounded-lg border bg-fd-secondary text-fd-muted-foreground text-xs p-2"
          >
            <SearchIcon className="size-4" />
            {call.state === 'output-error' || call.state === 'output-denied' ? (
              <p className="text-fd-error">{call.errorText ?? 'Failed to search'}</p>
            ) : (
              <p>{!call.output ? 'Buscando en las guías…' : `${call.output.length} guías consultadas`}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function AISearch({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const chat = useChat<ChatUIMessage>({
    id: 'search',
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  return (
    <Context value={useMemo(() => ({ chat, open, setOpen }), [chat, open])}>{children}</Context>
  );
}

export function AISearchTrigger({
  position = 'default',
  className,
  nativeControlId,
  ...props
}: ComponentProps<'button'> & { position?: 'default' | 'float'; nativeControlId?: string }) {
  const { open, setOpen } = useAISearchContext();
  const triggerClassName = cn(
    position === 'float' && [
      'fixed bottom-4 gap-3 w-24 inset-e-[calc(--spacing(4)+var(--removed-body-scroll-bar-size,0px))] shadow-lg [z-index:60] transition-[translate,opacity]',
      open && 'translate-y-10 opacity-0',
    ],
    className,
  );

  if (nativeControlId) {
    return (
      <label
        htmlFor={nativeControlId}
        className={cn('sinai-ai-trigger cursor-pointer', triggerClassName)}
        onPointerEnter={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          event.currentTarget.style.setProperty('--sinai-ripple-x', `${event.clientX - bounds.left}px`);
          event.currentTarget.style.setProperty('--sinai-ripple-y', `${event.clientY - bounds.top}px`);
        }}
        onPointerMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          event.currentTarget.style.setProperty('--sinai-ripple-x', `${event.clientX - bounds.left}px`);
          event.currentTarget.style.setProperty('--sinai-ripple-y', `${event.clientY - bounds.top}px`);
        }}
      >
        {props.children}
      </label>
    );
  }

  return (
    <button
      data-state={open ? 'open' : 'closed'}
      className={triggerClassName}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {props.children}
    </button>
  );
}

export function AISearchPanel({ nativeControlId }: { nativeControlId?: string }) {
  const { open, setOpen } = useAISearchContext();
  const [actualOpen, setActualOpen] = useState(open);
  const panelRef = useRef<HTMLDivElement>(null);
  useHotKey();

  useEffect(() => {
    if (!nativeControlId) return;

    const control = document.getElementById(nativeControlId) as HTMLInputElement | null;
    if (!control) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!control.checked || !(event.target instanceof Node)) return;
      if (panelRef.current?.contains(event.target)) return;

      const trigger = event.target instanceof Element
        ? event.target.closest(`label[for="${nativeControlId}"]`)
        : null;

      // El disparador ya alterna el checkbox de forma nativa.
      if (trigger) return;

      control.checked = false;
      control.dispatchEvent(new Event('change', { bubbles: true }));
    };

    document.addEventListener('pointerdown', closeOnOutsidePress);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePress);
  }, [nativeControlId]);

  if (open && !actualOpen) setActualOpen(open);

  if (nativeControlId) {
    return (
      <div
        ref={panelRef}
        className={cn(
          'sinai-ai-panel overflow-hidden z-30 bg-fd-card text-fd-card-foreground [--ai-chat-width:400px] 2xl:[--ai-chat-width:460px]',
          'fixed inset-y-4 inset-e-4 max-lg:inset-x-2 border rounded-2xl shadow-xl lg:w-(--ai-chat-width)',
        )}
      >
        <div className="flex flex-col size-full p-2 lg:p-3 lg:w-(--ai-chat-width)">
          <AISearchPanelHeader nativeControlId={nativeControlId} />
          <AISearchPanelList className="flex-1" />
          <div className="rounded-xl border bg-fd-secondary text-fd-secondary-foreground shadow-sm has-focus-visible:shadow-md">
            <AISearchInput />
            <div className="flex items-center gap-1.5 p-1 empty:hidden">
              <AISearchInputActions />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
        @keyframes ask-ai-open {
          from {
            translate: 100% 0;
          }
          to {
            translate: 0 0;
          }
        }
        @keyframes ask-ai-close {
          from {
            width: var(--ai-chat-width);
          }
          to {
            width: 0px;
          }
        }`}
      </style>
      {actualOpen && (
        <div
          className={cn(
            'fixed inset-0 [z-index:60] backdrop-blur-xs bg-fd-overlay lg:hidden',
            open ? 'animate-fd-fade-in' : 'animate-fd-fade-out',
          )}
          onClick={() => setOpen(false)}
          onAnimationEnd={() => {
            if (!open) flushSync(() => setActualOpen(false));
          }}
        />
      )}
      {actualOpen && (
        <div
          className={cn(
            'overflow-hidden z-30 bg-fd-card text-fd-card-foreground [--ai-chat-width:400px] 2xl:[--ai-chat-width:460px]',
            'fixed inset-y-4 inset-e-4 [z-index:70] max-lg:inset-x-2 border rounded-2xl shadow-xl lg:w-(--ai-chat-width)',
            open
              ? 'animate-fd-dialog-in lg:animate-[ask-ai-open_200ms]'
              : 'animate-fd-dialog-out lg:animate-[ask-ai-close_200ms]',
          )}
          onAnimationEnd={() => {
            if (!open) flushSync(() => setActualOpen(false));
          }}
        >
          <div className="flex flex-col size-full p-2 lg:p-3 lg:w-(--ai-chat-width)">
            <AISearchPanelHeader />
            <AISearchPanelList className="flex-1" />
            <div className="rounded-xl border bg-fd-secondary text-fd-secondary-foreground shadow-sm has-focus-visible:shadow-md">
              <AISearchInput />
              <div className="flex items-center gap-1.5 p-1 empty:hidden">
                <AISearchInputActions />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function AISearchPanelList({ className, style, ...props }: ComponentProps<'div'>) {
  const chat = useChatContext();
  const messages = chat.messages.filter((msg) => msg.role !== 'system');
  const isResponding = chat.status === 'streaming' || chat.status === 'submitted';
  const activeMessageId = isResponding ? messages.at(-1)?.id : undefined;

  return (
    <List
      focusMessageId={activeMessageId}
      className={cn('py-4 overscroll-contain', className)}
      style={{
        maskImage:
          'linear-gradient(to bottom, transparent, white 1rem, white calc(100% - 1rem), transparent 100%)',
        ...style,
      }}
      {...props}
    >
      {messages.length === 0 ? (
        <div className="text-sm text-fd-muted-foreground/80 size-full flex flex-col items-center justify-center text-center gap-2">
          <MessageCircleIcon fill="currentColor" stroke="none" />
          <p onClick={(e) => e.stopPropagation()}>Escriba una pregunta para iniciar.</p>
        </div>
      ) : (
        <div className="flex flex-col px-3 gap-4">
          {chat.error && (
            <div className="p-2 bg-fd-secondary text-fd-secondary-foreground border rounded-lg">
              <p className="text-xs text-fd-muted-foreground mb-1">
                Request Failed: {chat.error.name}
              </p>
              <p className="text-sm">{chat.error.message}</p>
            </div>
          )}
          {messages.map((item) => (
            <Message
              key={item.id}
              message={item}
              data-ai-message-id={item.id}
              showSearchActivity={activeMessageId === item.id}
            />
          ))}
        </div>
      )}
    </List>
  );
}

export function useHotKey() {
  const { open, setOpen } = useAISearchContext();

  const onKeyPress = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      setOpen(false);
      e.preventDefault();
    }

    if (e.key === '/' && (e.metaKey || e.ctrlKey) && !open) {
      setOpen(true);
      e.preventDefault();
    }
  });

  useEffect(() => {
    window.addEventListener('keydown', onKeyPress);
    return () => window.removeEventListener('keydown', onKeyPress);
  }, []);
}

export function useAISearchContext() {
  return use(Context)!;
}

function useChatContext() {
  return use(Context)!.chat;
}
