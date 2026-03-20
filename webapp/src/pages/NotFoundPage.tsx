import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--background)' }}
    >
      {/* Brand accent top bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1"
        style={{ background: 'var(--brand-main)' }}
      />

      <div className="flex flex-col items-center text-center max-w-md">
        {/* Logo */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8"
          style={{ background: 'var(--brand-hover)' }}
        >
          <Leaf className="w-8 h-8" style={{ color: 'var(--brand-main)' }} />
        </div>

        {/* 404 number */}
        <div className="relative mb-6">
          <span
            className="text-[9rem] font-black leading-none select-none"
            style={{ color: 'var(--brand-hover)' }}
          >
            404
          </span>
          <span
            className="absolute inset-0 flex items-center justify-center text-[9rem] font-black leading-none"
            style={{
              WebkitTextStroke: '2px var(--brand-main)',
              color: 'transparent',
            }}
          >
            404
          </span>
        </div>

        {/* Message */}
        <h1
          className="text-2xl font-bold mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          Page not found
        </h1>
        <p
          className="text-base mb-8 leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          The page you're looking for doesn't exist or has been moved. Let's
          get you back on track.
        </p>

        {/* Divider line with brand color */}
        <div
          className="w-12 h-0.5 rounded-full mb-8"
          style={{ background: 'var(--brand-main)' }}
        />

        {/* CTA */}
        <Button
          onClick={() => navigate('/dashboard')}
          className="gap-2 px-6 py-5 text-white font-medium"
          style={{ background: 'var(--brand-main)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* Footer brand label */}
      <p
        className="absolute bottom-6 text-xs"
        style={{ color: 'var(--text-secondary)' }}
      >
        IkigoriSmart &mdash; Admin Dashboard
      </p>
    </div>
  );
}
