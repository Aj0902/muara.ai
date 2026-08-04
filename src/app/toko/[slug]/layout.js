import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import StorefrontNavbar from './StorefrontNavbar';
import StorefrontFooter from './StorefrontFooter';
import StorefrontThemeWrapper from './StorefrontThemeWrapper';
import StorefrontCartProvider from './StorefrontCartProvider';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (!store) {
    return { title: 'Toko Tidak Ditemukan' };
  }

  return {
    title: `${store.name} | ${store.tagline || 'Website Resmi'}`,
    description: store.description || 'Selamat datang di website resmi kami!'
  };
}

export default async function StorefrontLayout({ children, params }) {
  const { slug } = await params;

  // Fetch store data
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (!store) {
    notFound();
  }

  return (
    <StorefrontThemeWrapper category={store.category}>
      <StorefrontCartProvider store={store}>
        <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
          <StorefrontNavbar store={store} />
          <main className="flex-1">
            {children}
          </main>
          <StorefrontFooter store={store} />
        </div>
      </StorefrontCartProvider>
    </StorefrontThemeWrapper>
  );
}
