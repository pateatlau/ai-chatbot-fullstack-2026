import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import type { Message } from '../api/chatbot.api';
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  message:
    | Message
    | { role: 'user' | 'assistant'; content: string; createdAt?: string };
  isStreaming?: boolean;
}

export function MessageBubble({
  message,
  isStreaming = false,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const timestamp = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div
      className={`${styles.messageWrapper} ${isUser ? styles.userWrapper : styles.aiWrapper}`}
    >
      <div
        className={`${styles.messageBubble} ${isUser ? styles.userBubble : styles.aiBubble}`}
      >
        {isUser ? (
          <div className={styles.messageContent}>{message.content}</div>
        ) : (
          <div className={styles.markdownContent}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';

                  return !inline && language ? (
                    <div className={styles.codeBlock}>
                      <div className={styles.codeBlockHeader}>
                        <span className={styles.codeLanguage}>{language}</span>
                        <button
                          className={styles.copyButton}
                          onClick={() => {
                            navigator.clipboard.writeText(String(children));
                          }}
                        >
                          Copy
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={oneDark}
                        language={language}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: '0 0 8px 8px',
                          fontSize: '14px',
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className={styles.inlineCode} {...props}>
                      {children}
                    </code>
                  );
                },
                p({ children }) {
                  return <p className={styles.paragraph}>{children}</p>;
                },
                ul({ children }) {
                  return <ul className={styles.list}>{children}</ul>;
                },
                ol({ children }) {
                  return <ol className={styles.orderedList}>{children}</ol>;
                },
                li({ children }) {
                  return <li className={styles.listItem}>{children}</li>;
                },
                a({ href, children }) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      {children}
                    </a>
                  );
                },
                blockquote({ children }) {
                  return (
                    <blockquote className={styles.blockquote}>
                      {children}
                    </blockquote>
                  );
                },
                h1({ children }) {
                  return <h1 className={styles.heading1}>{children}</h1>;
                },
                h2({ children }) {
                  return <h2 className={styles.heading2}>{children}</h2>;
                },
                h3({ children }) {
                  return <h3 className={styles.heading3}>{children}</h3>;
                },
                table({ children }) {
                  return <table className={styles.table}>{children}</table>;
                },
                th({ children }) {
                  return <th className={styles.tableHeader}>{children}</th>;
                },
                td({ children }) {
                  return <td className={styles.tableCell}>{children}</td>;
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
            {isStreaming && <span className={styles.cursor}>▊</span>}
          </div>
        )}
        {timestamp && <div className={styles.timestamp}>{timestamp}</div>}
      </div>
    </div>
  );
}
