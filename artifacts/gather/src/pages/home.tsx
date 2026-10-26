import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'wouter';
import { ArrowDown, ArrowRight, CalendarDays, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useListWorkshops } from '@workspace/api-client-react';
import GatherHeader from '../components/gather-header';
import { workshopImageUrl } from '../lib/workshop-image';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('Everything');
  const [search, setSearch] = useState('');
  const workshopsQuery = useListWorkshops();
  const workshops = workshopsQuery.data ?? [];
  const categories = useMemo(
    () => ['Everything', ...Array.from(new Set(workshops.map((workshop) => workshop.category)))],
    [workshops],
  );
  const filtered = useMemo(() => workshops.filter((workshop) => {
    const matchesCategory = activeCategory === 'Everything' || workshop.category === activeCategory;
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || `${workshop.title} ${workshop.category} ${workshop.venue} ${workshop.host}`.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  }), [workshops, activeCategory, search]);

  return (
    <div className="gather-app">
      <div className="grain" aria-hidden="true" />
      <GatherHeader />

      <main>
        <section className="hero">
          <div className="hero-copy fade-up">
            <div className="eyebrow"><span className="eyebrow-line" /> GOOD THINGS HAPPEN HANDS-ON</div>
            <h1 className="serif">Make a thing.<br /><em>Meet your people.</em></h1>
            <p className="hero-description">Small, lovely workshops led by the people who make our city what it is. Come curious. Leave with a story.</p>
            <a href="#workshops" className="hero-link focus-ring" data-testid="button-browse-the-list">Find your next afternoon <ArrowDown size={16} /></a>
          </div>
          <div className="hero-art fade-up-delay">
            {workshops[0] ? (
              <img src={workshopImageUrl(workshops[0].image)} alt="Hands shaping clay on a potter's wheel" data-testid="img-featured-workshop" />
            ) : (
              <div className="hero-image-placeholder" role="status">
                {workshopsQuery.isError ? 'Workshops are temporarily unavailable.' : 'Finding your next gathering…'}
              </div>
            )}
            <div className="hero-sticker"><span>Good<br />with your<br />hands</span><Sparkles size={16} /></div>
            <div className="hero-caption"><span>01 / 04</span><span>Brooklyn, NY</span></div>
          </div>
          <div className="hero-side-note">A little less scrolling.<br />A little more making.</div>
        </section>

        <section id="workshops" className="browse-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> THE GOOD STUFF</div>
              <h2 className="serif">Make room for <em>something new.</em></h2>
            </div>
            <p className="section-intro">A few ways to spend an afternoon well. Thoughtfully small, always taught by a real person.</p>
          </div>

          <div className="browse-controls">
            <div className="category-list" role="group" aria-label="Filter workshops by category">
              {categories.map((category) => (
                <button key={category} type="button" aria-pressed={activeCategory === category} className={`category-pill focus-ring ${activeCategory === category ? 'is-active' : ''}`} onClick={() => setActiveCategory(category)} data-testid={`filter-category-${category.toLowerCase().replaceAll(' ', '-')}`}>
                  {category}
                </button>
              ))}
            </div>
            <label className="search-box">
              <Search size={17} aria-hidden="true" />
              <input type="search" placeholder="Try pottery, flowers..." value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search workshops" data-testid="input-search-workshops" />
              <SlidersHorizontal className="search-tune" size={16} aria-hidden="true" />
            </label>
          </div>

          <div className="results-note" aria-live="polite" data-testid="text-workshop-result-count">
            <span>
              {workshopsQuery.isLoading
                ? 'Finding upcoming gatherings…'
                : workshopsQuery.isError
                  ? 'Workshops are temporarily unavailable.'
                  : filtered.length === 0
                    ? 'Nothing on the table just yet.'
                    : `${filtered.length} upcoming ${filtered.length === 1 ? 'gathering' : 'gatherings'}`}
            </span>
            <span className="results-city">BROOKLYN, NEW YORK <span className="city-dot" /></span>
          </div>

          {workshopsQuery.isLoading ? (
            <div className="empty-results" role="status" data-testid="status-workshops-loading">
              <p>Loading the workshop list…</p>
            </div>
          ) : workshopsQuery.isError ? (
            <div className="empty-results" role="alert" data-testid="error-workshops-loading">
              <h3 className="serif">We couldn’t load the workshops.</h3>
              <p>Please try again in a moment.</p>
              <button type="button" onClick={() => { void workshopsQuery.refetch(); }} data-testid="button-retry-workshops">Try again</button>
            </div>
          ) : filtered.length ? (
            <div className="workshop-grid" data-testid="list-upcoming-workshops">
              {filtered.map((workshop, index) => (
                <Link href={`/workshops/${workshop.id}`} className="workshop-card focus-ring" key={workshop.id} data-testid={`card-workshop-${workshop.id}`}>
                  <div className="card-image-wrap">
                    <img className="card-image" src={workshopImageUrl(workshop.image)} alt={`${workshop.category} workshop at ${workshop.venue}`} data-testid={`img-workshop-${workshop.id}`} />
                    <span className="card-category" style={{ '--category-color': workshop.color } as CSSProperties} data-testid={`text-category-${workshop.id}`}>{workshop.category}</span>
                    <span className="card-number">0{index + 1}</span>
                  </div>
                  <div className="card-body">
                    <div className="card-date" data-testid={`text-date-${workshop.id}`}><CalendarDays size={14} /> {workshop.dateLabel} <span className="date-separator">·</span> {workshop.time.split('–')[0]}</div>
                    <h3 className="serif">{workshop.title}</h3>
                    <p className="card-host" data-testid={`text-host-${workshop.id}`}>With {workshop.host} <span>·</span> {workshop.venue}</p>
                    <div className="card-bottom">
                      <span className={`availability ${workshop.available <= 3 ? 'is-limited' : ''}`} data-testid={`text-availability-${workshop.id}`}>{workshop.available} spots left</span>
                      <span className="card-arrow" aria-hidden="true"><ArrowRight size={17} /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-results" data-testid="empty-workshop-results">
              <Sparkles className="empty-spark" size={24} aria-hidden="true" />
              <h3 className="serif">Nothing just yet.</h3>
              <p>Try another word or category. The good stuff is out there.</p>
              <button type="button" onClick={() => { setSearch(''); setActiveCategory('Everything'); }} data-testid="button-clear-workshop-filters">Clear filters</button>
            </div>
          )}
        </section>

        <section className="about-strip" id="about">
          <div className="about-illustration" aria-hidden="true">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" /><span className="about-seed">g</span>
            <span className="orbit-word orbit-word-one">MAKE</span><span className="orbit-word orbit-word-two">MEET</span>
          </div>
          <div className="about-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> A SMALL INTRODUCTION</div>
            <h2 className="serif">The best way to know a place is to <em>make something in it.</em></h2>
            <p>Gather brings you into the studios, kitchens and back rooms where local makers do their thing. Not a big event. Not a crowd. Just good company and a chance to try.</p>
            <a href="#workshops" className="text-link" data-testid="link-about-browse">Come find a table <ArrowRight size={15} /></a>
          </div>
          <div className="about-footnote"><span>01</span><span>CURIOUS BY NATURE</span></div>
        </section>

        <section className="closing-note">
          <div className="closing-rule" />
          <p className="serif">There’s a seat for you.</p>
          <a href="#workshops" className="closing-link" data-testid="link-closing-explore">See what’s coming up <ArrowRight size={15} /></a>
          <div className="closing-rule" />
        </section>
      </main>
      <footer className="site-footer"><Link href="/" className="footer-brand" data-testid="link-footer-home">gather<span>.</span></Link><span>Made for the curious, right here in Brooklyn.</span><span className="footer-year">A LITTLE MORE HUMAN</span></footer>
    </div>
  );
}
