// src/components/dialogue/DialogueBox.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

export interface DialogueChoice {
  id: string;
  text: string;
  nextNodeId?: string;
  requirement?: string;
  action?: () => void;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  choices?: DialogueChoice[];
}

// Types exported separately

interface DialogueBoxProps {
  node: DialogueNode | null;
  onComplete?: () => void;
  onChoice?: (choice: DialogueChoice) => void;
  typingSpeed?: number;
}

export default function DialogueBox({
  node,
  onComplete,
  onChoice,
  typingSpeed = 30,
}: DialogueBoxProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChoices, setShowChoices] = useState(false);

  // Use ref for stable callback reference
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!node) {
      setDisplayedText('');
      setShowChoices(false);
      return;
    }

    setDisplayedText('');
    setIsTyping(true);
    setShowChoices(false);

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < node.text.length) {
        setDisplayedText(node.text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        setShowChoices(true);
        onCompleteRef.current?.();
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [node, typingSpeed]);

  const handleChoice = useCallback((choice: DialogueChoice) => {
    if (choice.action) {
      choice.action();
    }
    onChoice?.(choice);
  }, [onChoice]);

  const handleSkip = useCallback(() => {
    if (isTyping && node) {
      setDisplayedText(node.text);
      setIsTyping(false);
      setShowChoices(true);
    }
  }, [isTyping, node]);

  if (!node) return null;

  return (
    <div className="dialogue-box" onClick={handleSkip}>
      <div className="speaker-name">{node.speaker}</div>
      <div className="dialogue-text">
        {displayedText}
        {isTyping && <span className="cursor">▌</span>}
      </div>
      
      {showChoices && node.choices && node.choices.length > 0 && (
        <div className="choices-container">
          {node.choices.map((choice) => (
            <button
              key={choice.id}
              className="choice-button"
              onClick={(e) => {
                e.stopPropagation();
                handleChoice(choice);
              }}
            >
              {choice.text}
            </button>
          ))}
        </div>
      )}

      {!isTyping && (!node.choices || node.choices.length === 0) && (
        <div className="continue-hint">Click to continue...</div>
      )}

      <style jsx>{`
        .dialogue-box {
          background: linear-gradient(180deg, #0d0d1a 0%, #1a1a2e 100%);
          border: 3px solid #4a4a6a;
          padding: 1.25rem;
          min-height: 160px;
          display: flex;
          flex-direction: column;
          cursor: pointer;
        }

        .speaker-name {
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: #7fdbca;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #2d2d44;
        }

        .dialogue-text {
          font-family: 'Courier New', monospace;
          font-size: 0.9375rem;
          color: #ecf0f1;
          line-height: 1.6;
          flex: 1;
        }

        .cursor {
          animation: blink 0.8s infinite;
          color: #7fdbca;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        .choices-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #2d2d44;
        }

        .choice-button {
          background: #0f0f1a;
          border: 2px solid #3d3d5c;
          color: #ecf0f1;
          padding: 0.75rem 1rem;
          font-family: 'Courier New', monospace;
          font-size: 0.8125rem;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
        }

        .choice-button:hover {
          border-color: #7fdbca;
          background: #1a1a2e;
        }

        .continue-hint {
          font-size: 0.75rem;
          color: #636e72;
          text-align: right;
          margin-top: 0.75rem;
        }
      `}</style>
    </div>
  );
}
