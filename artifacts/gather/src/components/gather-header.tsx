import { useClerk, useUser } from '@clerk/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function GatherHeader() {
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const customerName = user?.firstName || user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Customer';

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand focus-ring" data-testid="link-home-logo" aria-label="Gather home">
          <span className="brand-mark">g</span><span>gather<span className="brand-period">.</span></span>
        </Link>
        <nav className="header-nav" aria-label="Main navigation">
          <Link href="/" data-testid="link-header-browse">Find a workshop</Link>
          <Link href="/#about" data-testid="link-header-about">Our little idea</Link>
        </nav>
        <div className="header-account">
          {isLoaded && user ? (
            <>
              <span className="nav-user-name" data-testid="text-header-customer-name" title={customerName}>{customerName}</span>
              <Link href="/my-rsvps" className="nav-session focus-ring" data-testid="link-header-my-rsvps">My RSVPs</Link>
              <button
                type="button"
                className="nav-session-button focus-ring"
                onClick={() => { void signOut({ redirectUrl: basePath || '/' }); }}
                data-testid="button-sign-out"
              >
                Sign out
              </button>
            </>
          ) : isLoaded ? (
            <>
              <Link href="/sign-in" className="nav-session focus-ring" data-testid="link-header-sign-in">Sign in</Link>
              <Link href="/sign-up" className="nav-session focus-ring" data-testid="link-header-sign-up">Sign up</Link>
            </>
          ) : (
            <span className="nav-user-name" aria-live="polite">Loading account…</span>
          )}
        </div>
        <Link href="/" className="nav-cta focus-ring" data-testid="button-explore-workshops">
          Explore workshops <ArrowRight size={15} />
        </Link>
      </div>
    </header>
  );
}
