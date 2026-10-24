import { ArrowRight, CalendarDays, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { workshops } from '../data/workshops';
import { getSessionRsvpIds } from '../lib/session-rsvps';

export default function MyRsvps() {
  const savedIds = new Set(getSessionRsvpIds());
  const savedWorkshops = workshops.filter((workshop) => savedIds.has(workshop.id));

  return (
    <div className="gather-app">
      <div className="grain" aria-hidden="true" />
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="brand focus-ring" data-testid="link-home-logo" aria-label="Gather home">
            <span className="brand-mark">g</span><span>gather<span className="brand-period">.</span></span>
          </Link>
          <nav className="header-nav" aria-label="Main navigation">
            <Link href="/" data-testid="link-rsvps-browse">Find a workshop</Link>
          </nav>
          <Link href="/my-rsvps" className="nav-session focus-ring" data-testid="link-header-my-rsvps" aria-current="page">My RSVPs</Link>
          <Link href="/" className="nav-cta focus-ring" data-testid="button-explore-workshops">Explore workshops <ArrowRight size={15} /></Link>
        </div>
      </header>

      <main>
        <section className="browse-section my-rsvps-section">
          <div className="section-heading my-rsvps-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> YOUR PLANS</div>
              <h1 className="serif">My <em>RSVPs.</em></h1>
            </div>
            <p className="section-intro">The workshops you’ve saved for this browser session. Your contact details aren’t stored or sent.</p>
          </div>

          {savedWorkshops.length > 0 ? (
            <>
              <div className="results-note" aria-live="polite" data-testid="text-rsvp-count">
                <span>{savedWorkshops.length} saved {savedWorkshops.length === 1 ? 'gathering' : 'gatherings'}</span>
                <span className="results-city">BROOKLYN, NEW YORK <span className="city-dot" /></span>
              </div>
              <div className="workshop-grid" data-testid="list-session-rsvps">
                {savedWorkshops.map((workshop, index) => (
                  <Link href={`/workshops/${workshop.id}`} className="workshop-card focus-ring" key={workshop.id} data-testid={`card-rsvp-${workshop.id}`}>
                    <div className="card-image-wrap">
                      <img className="card-image" src={workshop.image} alt={`${workshop.category} workshop at ${workshop.venue}`} data-testid={`img-rsvp-${workshop.id}`} />
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
            <div className="empty-results" data-testid="empty-session-rsvps">
              <Sparkles className="empty-spark" size={24} aria-hidden="true" />
              <h2 className="serif">Nothing saved just yet.</h2>
              <p>When you RSVP to a workshop, it’ll be waiting here for this browser session.</p>
              <Link href="/" className="text-link" data-testid="link-browse-from-empty">Find a workshop <ArrowRight size={15} /></Link>
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer"><Link href="/" className="footer-brand" data-testid="link-footer-home">gather<span>.</span></Link><span>Made for the curious, right here in Brooklyn.</span><span className="footer-year">A LITTLE MORE HUMAN</span></footer>
    </div>
  );
}
