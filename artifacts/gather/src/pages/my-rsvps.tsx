import { ArrowRight, CalendarDays, Sparkles } from 'lucide-react';
import { useUser } from '@clerk/react';
import { Link } from 'wouter';
import {
  getListMyRsvpsQueryKey,
  listMyRsvps,
  useListMyRsvps,
} from '@workspace/api-client-react';
import GatherHeader from '../components/gather-header';
import { workshopImageUrl } from '../lib/workshop-image';

export default function MyRsvps() {
  const { user, isLoaded } = useUser();
  const rsvpsQuery = useListMyRsvps({
    query: {
      enabled: isLoaded && Boolean(user),
      queryKey: [...getListMyRsvpsQueryKey(), user?.id ?? 'signed-out'],
      queryFn: () => listMyRsvps(),
    },
  });
  const savedWorkshops = (rsvpsQuery.data ?? []).map((rsvp) => rsvp.workshop);

  return (
    <div className="gather-app">
      <div className="grain" aria-hidden="true" />
      <GatherHeader />

      <main>
        <section className="browse-section my-rsvps-section">
          <div className="section-heading my-rsvps-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> YOUR PLANS</div>
              <h1 className="serif">My <em>RSVPs.</em></h1>
            </div>
            <p className="section-intro">
              {user
                ? `Your workshop plans, ${user.firstName || user.fullName || user.primaryEmailAddress?.emailAddress || 'all in one place'}.`
                : 'Sign in to see the workshops you’ve saved to your Gather account.'}
            </p>
          </div>

          {!isLoaded ? (
            <div className="empty-results" role="status" data-testid="status-rsvps-loading">
              <p>Loading your plans…</p>
            </div>
          ) : !user ? (
            <div className="empty-results" data-testid="gate-my-rsvps-sign-in">
              <Sparkles className="empty-spark" size={24} aria-hidden="true" />
              <h2 className="serif">Your plans start here.</h2>
              <p>Sign in to keep your workshop RSVPs together and see them here.</p>
              <Link href="/sign-in?returnTo=%2Fmy-rsvps" className="text-link" data-testid="link-my-rsvps-sign-in">Sign in <ArrowRight size={15} /></Link>
              <Link href="/sign-up?returnTo=%2Fmy-rsvps" className="text-link" data-testid="link-my-rsvps-sign-up">Create an account <ArrowRight size={15} /></Link>
            </div>
          ) : rsvpsQuery.isLoading ? (
            <div className="empty-results" role="status" data-testid="status-rsvps-loading">
              <p>Loading your plans…</p>
            </div>
          ) : rsvpsQuery.isError ? (
            <div className="empty-results" role="alert" data-testid="error-rsvps-loading">
              <Sparkles className="empty-spark" size={24} aria-hidden="true" />
              <h2 className="serif">We couldn’t load your plans.</h2>
              <p>Please try again in a moment.</p>
              <button type="button" onClick={() => { void rsvpsQuery.refetch(); }} data-testid="button-retry-rsvps">Try again</button>
            </div>
          ) : savedWorkshops.length > 0 ? (
            <>
              <div className="results-note" aria-live="polite" data-testid="text-rsvp-count">
                <span>{savedWorkshops.length} saved {savedWorkshops.length === 1 ? 'gathering' : 'gatherings'}</span>
                <span className="results-city">BROOKLYN, NEW YORK <span className="city-dot" /></span>
              </div>
              <div className="workshop-grid" data-testid="list-customer-rsvps">
                {savedWorkshops.map((workshop, index) => (
                  <Link href={`/workshops/${workshop.id}`} className="workshop-card focus-ring" key={workshop.id} data-testid={`card-rsvp-${workshop.id}`}>
                    <div className="card-image-wrap">
                      <img className="card-image" src={workshopImageUrl(workshop.image)} alt={`${workshop.category} workshop at ${workshop.venue}`} data-testid={`img-rsvp-${workshop.id}`} />
                      <span className="card-category">{workshop.category}</span>
                      <span className="card-number">0{index + 1}</span>
                    </div>
                    <div className="card-body">
                      <div className="card-date" data-testid={`text-rsvp-date-${workshop.id}`}><CalendarDays size={14} /> {workshop.dateLabel} <span className="date-separator">·</span> {workshop.time.split('–')[0]}</div>
                      <h2 className="serif">{workshop.title}</h2>
                      <p className="card-host" data-testid={`text-rsvp-host-${workshop.id}`}>With {workshop.host} <span>·</span> {workshop.venue}</p>
                      <div className="card-bottom">
                        <span className="availability" data-testid={`status-rsvp-saved-${workshop.id}`}>RSVP saved</span>
                        <span className="card-arrow" aria-hidden="true"><ArrowRight size={17} /></span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-results" data-testid="empty-customer-rsvps">
              <Sparkles className="empty-spark" size={24} aria-hidden="true" />
              <h2 className="serif">Nothing saved just yet.</h2>
                <p>When you RSVP to a workshop, it’ll be waiting here in your Gather account.</p>
              <Link href="/" className="text-link" data-testid="link-browse-from-empty">Find a workshop <ArrowRight size={15} /></Link>
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer"><Link href="/" className="footer-brand" data-testid="link-footer-home">gather<span>.</span></Link><span>Made for the curious, right here in Brooklyn.</span><span className="footer-year">A LITTLE MORE HUMAN</span></footer>
    </div>
  );
}
