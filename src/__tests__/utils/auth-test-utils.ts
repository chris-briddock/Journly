import { Session, User } from 'next-auth';

/**
 * Extended user type with additional properties
 */
export interface ExtendedUser extends User {
  role?: string;
  isAdmin?: boolean;
  isEditor?: boolean;
}

/**
 * Interface for mock user options
 */
export interface MockUserOptions {
  id?: string;
  name?: string | null; // Allow null to match ExtendedUser
  email?: string | null; // Allow null to match ExtendedUser
  image?: string | null;
  role?: string;
  isAdmin?: boolean;
  isEditor?: boolean;
}

/**
 * Interface for mock session options
 */
export interface MockSessionOptions {
  user?: MockUserOptions | null;
  expires?: string;
  authenticated?: boolean;
}

/**
 * Creates a mock user for testing
 * @param options - Options for the user
 * @returns A mock user object
 */
export function createMockUser(options: MockUserOptions = {}): ExtendedUser {
  const {
    id = 'test-user-id',
    name = 'Test User',
    email = 'test@example.com',
    image = null,
    role = 'user',
    isAdmin = false,
    isEditor = false,
  } = options;

  return {
    id,
    name,
    email,
    image,
    role,
    isAdmin,
    isEditor,
  };
}

/**
 * Creates a mock session for testing
 * @param options - Options for the session
 * @returns A mock session object or null if not authenticated
 */
export function createMockSession(options: MockSessionOptions = {}): Session | null {
  const {
    authenticated = true,
    expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    user = createMockUser(),
  } = options;

  if (!authenticated) {
    return null;
  }

  return {
    user: user as ExtendedUser,
    expires,
  };
}

/**
 * Creates a mock admin user
 * @returns A mock admin user
 */
export function createMockAdminUser(): ExtendedUser {
  return createMockUser({
    id: 'admin-user-id',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    isAdmin: true,
  });
}

/**
 * Creates a mock editor user
 * @returns A mock editor user
 */
export function createMockEditorUser(): ExtendedUser {
  return createMockUser({
    id: 'editor-user-id',
    name: 'Editor User',
    email: 'editor@example.com',
    role: 'editor',
    isEditor: true,
  });
}

/**
 * Creates a mock admin session
 * @returns A mock admin session
 */
export function createMockAdminSession(): Session {
  return createMockSession({
    user: createMockAdminUser(),
  }) as Session;
}

/**
 * Creates a mock editor session
 * @returns A mock editor session
 */
export function createMockEditorSession(): Session {
  return createMockSession({
    user: createMockEditorUser(),
  }) as Session;
}

/**
 * Creates a mock unauthenticated session
 * @returns null
 */
export function createMockUnauthenticatedSession(): null {
  // We know this will return null because authenticated is false
  return createMockSession({ authenticated: false }) as null;
}
