import { searchUsers } from "./api";

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

/**
 * Extract mentions from text (format: @username)
 */
export function extractMentions(text: string): string[] {
  // Match @username pattern (alphanumeric and underscores, min 3 chars)
  const mentionRegex = /@([a-zA-Z0-9_]{3,})/g;
  const matches = text.match(mentionRegex);

  if (!matches) return [];

  // Remove @ symbol and return unique usernames
  return [...new Set(matches.map(match => match.substring(1)))];
}

/**
 * Format comment text to highlight mentions
 */
export function formatCommentWithMentions(text: string): string {
  // Replace @username with styled span
  return text.replace(
    /@([a-zA-Z0-9_]{3,})/g,
    '<span class="comment-mention">@$1</span>'
  );
}

/**
 * Suggestion handler for comment mentions
 */
export const commentMentionSuggestion = {
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

  // We're not using the render function for our implementation
  // This is just a placeholder to match the expected interface
  render: () => {
    return {
      onStart: () => {},
      onUpdate: () => {},
      onKeyDown: () => false,
      onExit: () => {},
    };
  },
};
