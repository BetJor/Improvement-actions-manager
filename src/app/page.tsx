import { redirect } from 'next-intl/server';

export default function RootPage() {
  redirect('/dashboard');
}
