import { redirect } from 'next/navigation';

export default function ApiDocsLayout() {
  // Redirect to new /swagger route
  redirect('/swagger');
}
