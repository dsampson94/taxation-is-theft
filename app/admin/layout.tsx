import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — TIT Tax',
  description: 'Admin dashboard',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
