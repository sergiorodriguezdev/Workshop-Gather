import { SignIn, SignUp } from '@clerk/react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import GatherHeader from '../components/gather-header';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function getReturnPath() {
  const candidate = new URLSearchParams(window.location.search).get('returnTo');
  return candidate?.startsWith('/') && !candidate.startsWith('//') ? candidate : '/';
}

function AuthLayout({ children, mode }: { children: React.ReactNode; mode: 'sign-in' | 'sign-up' }) {
  return (
    <div className="gather-app auth-page">
      <div className="grain" aria-hidden="true" />
      <GatherHeader />
      <main className="auth-page-main">
        <section className="auth-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> GOOD THINGS HAPPEN HANDS-ON</div>
          <h1 className="serif">{mode === 'sign-in' ? <>Good to see you <em>again.</em></> : <>Make room for <em>something new.</em></>}</h1>
          <p>{mode === 'sign-in'
            ? 'Sign in to keep your workshop plans together and save your next seat.'
            : 'Create an account to save workshops and keep your plans close.'}</p>
          <Link href="/" className="auth-back-link"><ArrowLeft size={15} /> Keep exploring workshops</Link>
        </section>
        <div className="auth-widget">
          {children}
        </div>
      </main>
      <footer className="site-footer"><Link href="/" className="footer-brand" data-testid="link-footer-home">gather<span>.</span></Link><span>Made for the curious, right here in Brooklyn.</span><span className="footer-year">A LITTLE MORE HUMAN</span></footer>
    </div>
  );
}

export function SignInPage() {
  const returnPath = getReturnPath();
  const redirectUrl = `${basePath}${returnPath}`;
  const signUpUrl = `${basePath}/sign-up?returnTo=${encodeURIComponent(returnPath)}`;

  return (
    <AuthLayout mode="sign-in">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={signUpUrl}
        forceRedirectUrl={redirectUrl}
      />
    </AuthLayout>
  );
}

export function SignUpPage() {
  const returnPath = getReturnPath();
  const redirectUrl = `${basePath}${returnPath}`;
  const signInUrl = `${basePath}/sign-in?returnTo=${encodeURIComponent(returnPath)}`;

  return (
    <AuthLayout mode="sign-up">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={signInUrl}
        forceRedirectUrl={redirectUrl}
      />
    </AuthLayout>
  );
}
