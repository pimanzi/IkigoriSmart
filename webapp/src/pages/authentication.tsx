import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Leaf, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validateForm = () => {
    const newErrors = { email: '', password: '' };
    if (!formData.email) newErrors.email = t('login.errors.emailRequired');
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email))
      newErrors.email = t('login.errors.emailInvalid');
    if (!formData.password) newErrors.password = t('login.errors.passwordRequired');
    else if (formData.password.length < 8)
      newErrors.password = t('login.errors.passwordMin');
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const onLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user data');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.role !== 'Admin') {
        await supabase.auth.signOut();
        toast.error(t('login.messages.accessDenied'));
        return;
      }

      toast.success(t('login.messages.welcomeBack'));
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(
        error.message === 'Invalid login credentials'
          ? t('login.messages.invalidCredentials')
          : error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      {/* Left Panel - Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 text-white relative overflow-hidden"
        style={{ background: 'var(--brand-main)' }}
      >
        {/* Decorative circles */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-16 left-16 w-40 h-40 rounded-full border-2 border-white" />
          <div className="absolute top-32 left-32 w-64 h-64 rounded-full border border-white" />
          <div className="absolute bottom-20 right-10 w-52 h-52 rounded-full border-2 border-white" />
          <div className="absolute bottom-40 right-28 w-32 h-32 rounded-full border border-white" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="bg-white rounded-2xl p-4 mb-6 shadow-lg">
            <Leaf className="w-10 h-10" style={{ color: 'var(--brand-main)' }} />
          </div>
          <h1 className="text-3xl font-bold mb-2">{t('branding.appName')}</h1>
          <p className="text-white/80 text-base mb-10">{t('branding.tagline')}</p>

          <div className="w-72 h-48 rounded-2xl overflow-hidden mb-10 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop"
              alt="Maize crops"
              className="w-full h-full object-cover"
            />
          </div>

          <div
            className="rounded-xl px-6 py-5 max-w-sm w-full text-center"
            style={{ background: 'rgba(0,0,0,0.15)' }}
          >
            <p className="text-sm font-medium mb-2 leading-relaxed">
              &ldquo;{t('branding.testimonial')}&rdquo;
            </p>
            <p className="text-white/70 text-xs">{t('branding.trustedBy')}</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-4">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--brand-hover)' }}
            >
              <Leaf className="w-4 h-4" style={{ color: 'var(--brand-main)' }} />
            </div>
            <span className="font-bold text-sm" style={{ color: 'var(--brand-main)' }}>
              IkigoriSmart
            </span>
          </div>
          <div className="hidden lg:block" />

          {/* Language flags */}
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('en')}
              className={`w-8 h-6 rounded overflow-hidden border-2 transition-all ${
                language === 'en' ? 'opacity-100' : 'opacity-50 hover:opacity-80'
              }`}
              style={{ borderColor: language === 'en' ? 'var(--brand-main)' : 'transparent' }}
              aria-label="English"
            >
              <img src="https://flagcdn.com/w40/gb.png" alt="English" className="w-full h-full object-cover" />
            </button>
            <button
              onClick={() => setLanguage('kin')}
              className={`w-8 h-6 rounded overflow-hidden border-2 transition-all ${
                language === 'kin' ? 'opacity-100' : 'opacity-50 hover:opacity-80'
              }`}
              style={{ borderColor: language === 'kin' ? 'var(--brand-main)' : 'transparent' }}
              aria-label="Kinyarwanda"
            >
              <img src="https://flagcdn.com/w40/rw.png" alt="Kinyarwanda" className="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-sm">
            {/* Heading */}
            <div className="mb-8">
          
              <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {t('login.welcomeBack')}
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {t('login.signInSubtitle')}
              </p>
            </div>

            <form onSubmit={onLoginSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t('login.emailAddress')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('login.emailPlaceholder')}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                  style={errors.email ? { borderColor: 'var(--error-main)' } : {}}
                />
                {errors.email && (
                  <p className="text-xs" style={{ color: 'var(--error-main)' }}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">
                  {t('login.password')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('login.passwordPlaceholder')}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                    className="pr-10"
                    style={errors.password ? { borderColor: 'var(--error-main)' } : {}}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs" style={{ color: 'var(--error-main)' }}>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full text-white font-semibold py-5"
                style={{ background: 'var(--brand-main)' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('login.signingIn')}
                  </>
                ) : (
                  t('login.loginButton')
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 text-center">
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            &copy; {new Date().getFullYear()} IkigoriSmart &mdash; Admin Dashboard
          </p>
        </div>
      </div>
    </div>
  );
}
