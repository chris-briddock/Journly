"use client";

import { forwardRef, useState, useEffect, useImperativeHandle } from "react";
import { User } from "lucide-react";
import Image from "next/image";

export interface MentionSuggestionProps {
  items: {
    id: string;
    label: string;
    avatar?: string | null;
  }[];
  command: (item: { id: string; label: string }) => void;
}

export interface MentionSuggestionRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const MentionSuggestion = forwardRef<MentionSuggestionRef, MentionSuggestionProps>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
      const item = props.items[index];

      if (item) {
        props.command(item);
      }
    };

    const upHandler = () => {
      setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
      return true;
    };

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % props.items.length);
      return true;
    };

    const enterHandler = () => {
      selectItem(selectedIndex);
      return true;
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          return upHandler();
        }

        if (event.key === "ArrowDown") {
          return downHandler();
        }

        if (event.key === "Enter") {
          return enterHandler();
        }

        return false;
      },
    }));

    useEffect(() => {
      setSelectedIndex(0);
    }, [props.items]);

    if (props.items.length === 0) {
      return null;
    }

    return (
      <div className="bg-background rounded-md shadow-md border border-border overflow-hidden">
        <div className="p-1 max-h-[250px] overflow-y-auto">
          {props.items.map((item, index) => (
            <button
              key={item.id}
              className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded-sm text-sm ${
                index === selectedIndex ? "bg-accent text-accent-foreground" : ""
              }`}
              onClick={() => selectItem(index)}
            >
              {item.avatar ? (
                <Image
                  src={item.avatar}
                  alt={item.label}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-3 h-3" />
                </div>
              )}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }
);

MentionSuggestion.displayName = "MentionSuggestion";
