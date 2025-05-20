import { ReactRenderer } from "@tiptap/react";
import tippy, { Instance, Props } from "tippy.js";
import { MentionList, MentionListRef } from "@/app/components/editor/MentionList";
import { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion";
import { searchUsers } from "../services/getSearchUsers";

// User type definition for mentions
export interface MentionUser {
  id: string;
  label: string;
  avatar: string | null;
}

// Fallback users in case the API fails
const fallbackUsers: MentionUser[] = [
  { id: 'admin', label: 'Admin', avatar: null },
  { id: 'guest', label: 'Guest', avatar: null },
];

export const mentionSuggestion = {
  items: async ({ query }: { query: string }) => {
    try {
      // Fetch users from the API
      const users = await searchUsers(query, 10);

      if (users && users.length > 0) {
        return users.slice(0, 5);
      } else {
        // If no users found or API fails, use fallback users
        if (!query) {
          return fallbackUsers;
        }

        // Filter fallback users based on query
        return fallbackUsers.filter(user =>
          user.label.toLowerCase().includes(query.toLowerCase())
        );
      }
    } catch (error) {
      console.error('Error fetching users for mentions:', error);

      // Return fallback users on error
      if (!query) {
        return fallbackUsers;
      }

      return fallbackUsers.filter(user =>
        user.label.toLowerCase().includes(query.toLowerCase())
      );
    }
  },
  render: () => {
    let component: ReactRenderer<MentionListRef>;
    let popup: Instance<Props>;

    return {
      onStart: (props: SuggestionProps) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        // Get the DOM element to attach tippy to
        const bodyElement = document.querySelector('body');
        if (!bodyElement) return;

        popup = tippy(bodyElement, {
          getReferenceClientRect: () => {
            if (props.clientRect) {
              const rect = props.clientRect();
              if (rect) return rect;
            }
            // Fallback to a default position if clientRect returns null
            return {
              width: 0,
              height: 0,
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              x: 0,
              y: 0,
              toJSON: () => ({})
            };
          },
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate: (props: SuggestionProps) => {
        component.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup.setProps({
          getReferenceClientRect: () => {
            if (props.clientRect) {
              const rect = props.clientRect();
              if (rect) return rect;
            }
            // Fallback to a default position
            return {
              width: 0,
              height: 0,
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              x: 0,
              y: 0,
              toJSON: () => ({})
            };
          },
        });
      },

      onKeyDown: (props: SuggestionKeyDownProps) => {
        if (props.event.key === 'Escape') {
          popup.hide();
          return true;
        }

        return component.ref?.onKeyDown(props) || false;
      },

      onExit: () => {
        popup.destroy();
        component.destroy();
      },
    };
  },
};
