"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { User } from "lucide-react";
import Image from "next/image";

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export interface MentionListProps {
  items: {
    id: string;
    label: string;
    avatar: string | null;
  }[];
  command: (item: { id: string; label: string }) => void;
}

export const CommentMentionList = forwardRef<MentionListRef, MentionListProps>((props, ref) => {
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
    <div className="bg-background rounded-md shadow-md border border-border overflow-hidden z-50 absolute">
      {props.items.length > 0 ? (
        <div className="p-1 max-h-[250px] overflow-y-auto">
          {props.items.map((item, index) => (
            <button
              key={item.id}
              className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-sm text-sm transition-colors ${
                index === selectedIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => selectItem(index)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {item.avatar ? (
                <Image
                  src={item.avatar}
                  alt={item.label}
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center border border-border">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-muted-foreground">@{item.label}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-3 text-sm text-muted-foreground text-center">
          No users found
        </div>
      )}
    </div>
  );
});

CommentMentionList.displayName = "CommentMentionList";
