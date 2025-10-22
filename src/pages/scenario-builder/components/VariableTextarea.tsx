// src/pages/scenario-builder/components/VariableTextarea.tsx
import { useEffect, useRef, useState } from "react";

type VariableTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  onFocus?: () => void;
  onBlur?: () => void;
};

type VariableBadgeProps = {
  variable: string;
  onRemove?: () => void;
};

function VariableBadge({ variable, onRemove }: VariableBadgeProps) {
  return (
    <span
      style={{
        display: "inline-block",
        backgroundColor: "#e0f2fe",
        border: "1px solid #0ea5e9",
        borderRadius: "16px",
        padding: "2px 8px",
        margin: "0 2px",
        fontSize: "13px",
        fontWeight: "500",
        color: "#0c4a6e",
        cursor: "default",
        fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
        whiteSpace: "nowrap",
        verticalAlign: "baseline",
      }}
      title={`Variable: ${variable}`}
      data-variable={variable}
    >
      {variable}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          style={{
            marginLeft: "4px",
            background: "none",
            border: "none",
            color: "#0c4a6e",
            cursor: "pointer",
            fontSize: "12px",
            padding: "0",
            width: "12px",
            height: "12px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#bae6fd";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          title="Remove variable"
        >
          ×
        </button>
      )}
    </span>
  );
}

export function VariableTextarea({ value, onChange, placeholder, className, style, onFocus, onBlur }: VariableTextareaProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Parse text to separate regular text from variables
  const parseTextWithVariables = (text: string) => {
    const variableRegex = /\{([^}]+)\}/g;
    const parts: (string | { type: 'variable'; content: string })[] = [];
    let lastIndex = 0;
    let match;

    while ((match = variableRegex.exec(text)) !== null) {
      // Add text before the variable
      if (match.index > lastIndex) {
        const textPart = text.slice(lastIndex, match.index);
        if (textPart) {
          parts.push(textPart);
        }
      }

      // Add the variable
      parts.push({ type: 'variable', content: match[1] });
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  // Convert parsed parts back to plain text
  const partsToText = (parts: (string | { type: 'variable'; content: string })[]) => {
    return parts.map(part => {
      if (typeof part === 'string') {
        return part;
      } else {
        return `{${part.content}}`;
      }
    }).join('');
  };

  // Render the content with variables as badges
  const renderContent = () => {
    const parts = parseTextWithVariables(value);

    return parts.map((part, index) => {
      if (typeof part === 'string') {
        return <span key={index}>{part}</span>;
      } else {
        return (
          <VariableBadge
            key={index}
            variable={part.content}
            onRemove={() => {
              // Remove the variable and update the value
              const newParts = parts.filter((_, i) => i !== index);
              const newText = partsToText(newParts);
              onChange(newText);

              // Focus the content after removal
              setTimeout(() => {
                if (contentRef.current) {
                  contentRef.current.focus();
                }
              }, 0);
            }}
          />
        );
      }
    });
  };

  // Handle content changes
  const handleInput = () => {
    if (contentRef.current) {
      const newText = contentRef.current.textContent || '';
      onChange(newText);
    }
  };

  // Handle paste events
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Handle key down events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Enter key to insert new lines
    if (e.key === 'Enter') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '<br>');
    }
  };

  useEffect(() => {
    const content = contentRef.current;
    if (content && isFocused) {
      // Restore cursor position after re-render
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        content.focus();
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, [value, isFocused]);

  return (
    <div
      ref={contentRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      onFocus={() => {
        setIsFocused(true);
        onFocus?.();
      }}
      onBlur={() => {
        setIsFocused(false);
        onBlur?.();
      }}
      style={{
        ...style,
        minHeight: "80px",
        padding: "8px 12px",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        fontSize: "14px",
        fontFamily: "inherit",
        lineHeight: "1.5",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
        outline: "none",
        backgroundColor: "white",
        cursor: "text",
        position: "relative",
      }}
      className={className}
      data-placeholder={placeholder}
      onMouseDown={(e) => {
        // Prevent default to avoid losing focus
        if (e.target === contentRef.current) {
          e.preventDefault();
        }
      }}
    >
      {value ? renderContent() : (
        <span style={{ color: "#9ca3af" }}>{placeholder}</span>
      )}
    </div>
  );
}
