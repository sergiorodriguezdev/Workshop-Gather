import { useState, type FormEvent } from 'react';
import { useUser } from '@clerk/react';
import { Link, useParams } from 'wouter';
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, MapPin, Sparkles, Users } from 'lucide-react';
import { getWorkshop, workshops } from '../data/workshops';
import { addCustomerRsvp, getCustomerRsvpIds } from '../lib/customer-rsvps';
import GatherHeader from '../components/gather-header';
import NotFound from './not-found';

export default function WorkshopDetail() {
  const params = useParams<{ id: string }>();
  const workshop = getWorkshop(params.id ?? '');
  const { user, isLoaded } = useUser();
  const [localConfirmation, setLocalConfirmation] = useState<{ userId: string; workshopId: string } | null>(null);

  if (!workshop) return <NotFound />;

  const isConfirmed = Boolean(
    user && (
      getCustomerRsvpIds(user.id).includes(workshop.id) ||
      (localConfirmation?.userId === user.id && localConfirmation.workshopId === workshop.id)
    ),
  );

  const submitRsvp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    addCustomerRsvp(user.id, workshop.id);
    setLocalConfirmation({ userId: user.id, workshopId: workshop.id });
  };

  const returnToWorkshop = `/workshops/${workshop.id}`;

  return (
    <div className="gather-app">
      <div className="grain" aria-hidden="true" />
      <GatherHeader />

      <main className="detail-page">
        <Link href="/" className="back-link focus-ring" data-testid="link-back-to-list"><ArrowLeft size={16} /> All workshops</Link>
        <section className="detail-hero">
          <div className="detail-image-wrap">
            <img src={workshop.image} alt={`${workshop.title} at ${workshop.venue}`} data-testid={`img-detail-${workshop.id}`} />
            <span className="detail-image-label">{workshop.category} / BROOKLYN</span>
          </div>
          <div className="detail-intro">
            <div className="eyebrow"><span className="eyebrow-line" /> A GATHERING WITH {workshop.host.toUpperCase()}</div>
            <h1 className="serif" data-testid={`text-workshop-title-${workshop.id}`}>{workshop.title}<span className="title-dot">.</span></h1>
            <p className="detail-deck" data-testid={`text-description-${workshop.id}`}>{workshop.description}</p>
            <div className="detail-host" data-testid={`text-host-${workshop.id}`}><div className="host-monogram">{workshop.host.split(' ').map((part) => part[0]).join('')}</div><div><strong>{workshop.host}</strong><span>{workshop.hostNote}</span></div></div>
          </div>
        </section>

        <div className="detail-content">
          <div className="detail-main">
            <section className="what-to-know">
              <div className="eyebrow"><span className="eyebrow-line" /> THE PLAN</div>
              <h2 className="serif">A little time, <em>well spent.</em></h2>
              <p className="detail-body">{workshop.description} Come as you are; everything you need to get started will be waiting at the table. There’s room to ask questions, try again, and enjoy the company along the way.</p>
              <div className="included-list">
                <h3>Waiting for you</h3>
                {workshop.includes.map((item, index) => <div className="included-item" key={item} data-testid={`text-included-${workshop.id}-${index}`}><span className="included-check"><Check size={13} /></span>{item}</div>)}
              </div>
            </section>
            <section className="host-note">
              <span className="host-quote-mark">“</span>
              <p className="serif">You don’t need to know what you’re doing. That’s the whole point.</p>
              <span className="host-quote-by">— {workshop.host}</span>
            </section>
            <section className="venue-card">
              <div className="venue-heading"><div className="eyebrow"><span className="eyebrow-line" /> THE PLACE</div><span className="venue-number">01 / 01</span></div>
              <div className="venue-details"><div><h3 className="serif">{workshop.venue}</h3><p><MapPin size={15} /> {workshop.address}</p></div><span className="venue-marker"><MapPin size={18} /></span></div>
              <div className="venue-note">A neighborhood studio, just how we like it.</div>
            </section>
          </div>

          <aside className="rsvp-card" aria-label="Workshop RSVP">
            <div className="rsvp-topline"><span>YOUR AFTERNOON, SORTED</span><span className="rsvp-status"><i /> {workshop.available} SPOTS LEFT</span></div>
            <h2 className="serif">Save your<br /><em>seat.</em></h2>
            <div className="event-facts">
              <div data-testid={`text-event-date-${workshop.id}`}><CalendarDays size={17} /><span><strong>{workshop.dateLong}</strong><small>{workshop.time}</small></span></div>
              <div data-testid={`text-event-duration-${workshop.id}`}><Clock3 size={17} /><span><strong>{workshop.duration}</strong><small>Easy pace, no rush</small></span></div>
              <div data-testid={`text-event-venue-${workshop.id}`}><MapPin size={17} /><span><strong>{workshop.venue}</strong><small>{workshop.address}</small></span></div>
              <div data-testid={`text-event-availability-${workshop.id}`}><Users size={17} /><span><strong>Small group</strong><small>{workshop.available} of {workshop.capacity} places still open</small></span></div>
            </div>
            {!isLoaded ? (
              <div className="rsvp-auth-gate" role="status" data-testid="status-rsvp-auth-loading">
                Checking your account…
              </div>
            ) : !user ? (
              <div className="rsvp-auth-gate" data-testid="gate-rsvp-sign-in">
                <p>Sign in to save your seat and keep your plans together under My RSVPs.</p>
                <Link href={`/sign-in?returnTo=${encodeURIComponent(returnToWorkshop)}`} className="rsvp-submit focus-ring" data-testid="link-rsvp-sign-in">
                  Sign in to RSVP <ArrowRight size={16} />
                </Link>
                <Link href={`/sign-up?returnTo=${encodeURIComponent(returnToWorkshop)}`} className="text-link" data-testid="link-rsvp-sign-up">
                  Create an account <ArrowRight size={14} />
                </Link>
              </div>
            ) : isConfirmed ? (
              <div className="rsvp-success" role="status" data-testid="status-rsvp-confirmed">
                <span className="success-mark"><Check size={20} /></span>
                <h3 className="serif">You’re on the list, {user.firstName || user.fullName?.split(' ')[0] || user.primaryEmailAddress?.emailAddress || 'friend'}.</h3>
                <p>This workshop is saved to your Gather account on this device. No contact details are stored here.</p>
                <Link href="/my-rsvps" className="text-link" data-testid="link-view-my-rsvps">View My RSVPs <ArrowRight size={14} /></Link>
              </div>
            ) : (
              <form className="rsvp-form" onSubmit={submitRsvp} noValidate>
                <button type="submit" className="rsvp-submit focus-ring" data-testid="button-submit-rsvp">Save my seat <ArrowRight size={16} /></button>
                <p className="privacy-note">Saved to your account on this device. No contact details are stored here.</p>
              </form>
            )}
            <div className="rsvp-bottom">GOOD COMPANY, GUARANTEED <Sparkles size={14} aria-hidden="true" /></div>
          </aside>
        </div>

        <section className="more-workshops">
          <div><div className="eyebrow"><span className="eyebrow-line" /> KEEP WANDERING</div><h2 className="serif">More good things <em>to try.</em></h2></div>
          <div className="more-list">{workshops.filter((item) => item.id !== workshop.id).slice(0, 2).map((item) => <Link href={`/workshops/${item.id}`} className="more-link focus-ring" key={item.id} data-testid={`link-related-workshop-${item.id}`}><span>{item.dateLabel}</span><strong className="serif">{item.title}</strong><ArrowRight size={17} /></Link>)}</div>
        </section>
      </main>
      <footer className="site-footer"><Link href="/" className="footer-brand" data-testid="link-footer-home">gather<span>.</span></Link><span>Made for the curious, right here in Brooklyn.</span><span className="footer-year">A LITTLE MORE HUMAN</span></footer>
    </div>
  );
}
