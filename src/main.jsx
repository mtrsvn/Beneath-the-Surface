import React, { useEffect, useId, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const assets = { lake: '/assets/lake.jpg', fisherfolk: '/assets/fisherfolk.jpg', agoncillo: '/assets/agoncillo.jpg', tawilis: '/assets/tawilis.jpg' };
const sections = [ ['discover', 'Tawilis'], ['place', 'Agoncillo'], ['conservation', 'Conservation'], ['visit', 'Visitor guide'] ];

function Icon({ name = 'arrow', size = 20, ...props }) {
  const paths = {
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    external: <><path d="M7 17 17 7M7 7h10v10"/></>,
    pin: <><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    wave: <><path d="M2 8c3-4 5 4 8 0s5 4 8 0 4 0 4 0M2 15c3-4 5 4 8 0s5 4 8 0 4 0 4 0"/></>,
    leaf: <><path d="M20 3C9 2 3 7 5 14c2 7 15 7 15-11ZM4 21 15 10"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
function Reveal({ as: Tag = 'div', className = '', children, ...props }) {
  return <Tag className={className || undefined} {...props}>{children}</Tag>;
}
function Label({ number, children }) { return <div className="section-label"><span>{number}</span><i/>{children}</div>; }
function Pill({ href, children, secondary = false, ...props }) { return <a className={`pill${secondary ? ' pill-secondary' : ''}`} href={href} {...props}>{children}<Icon name="arrow" size={18}/></a>; }
function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');
  const navRef = useRef(null), toggleRef = useRef(null), linksRef = useRef(null);
  const restoreFocus = useRef(true);
  function navigateTo(id) {
    restoreFocus.current = false;
    setOpen(false);
    requestAnimationFrame(() => {
      const target = document.getElementById(id);
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  }
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 40);
      let current = '';
      for (const [id] of sections) {
        if (document.getElementById(id)?.getBoundingClientRect().top <= Math.min(180, window.innerHeight * 0.3)) current = id;
      }
      setActive(current);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    const media = window.matchMedia('(min-width: 901px)');
    const onResize = () => { if (media.matches) { restoreFocus.current = false; setOpen(false); } };
    media.addEventListener('change', onResize);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      media.removeEventListener('change', onResize);
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const background = [...document.querySelectorAll('main, footer')].map(el => [el, el.hasAttribute('inert')]);
    background.forEach(([el]) => el.setAttribute('inert', ''));
    document.body.style.overflow = 'hidden';
    linksRef.current?.querySelector('a')?.focus({ preventScroll: true });
    const onKey = e => {
      if (e.key === 'Escape') { e.preventDefault(); restoreFocus.current = true; setOpen(false); }
      if (e.key === 'Tab') {
        const items = [...navRef.current.querySelectorAll('a[href], button:not([tabindex="-1"])')];
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      background.forEach(([el, wasInert]) => { if (!wasInert) el.removeAttribute('inert'); });
      document.removeEventListener('keydown', onKey);
      if (restoreFocus.current) toggleRef.current?.focus({ preventScroll: true });
    };
  }, [open]);
  return <nav ref={navRef} className={`nav ${scrolled ? 'scrolled' : ''} ${open ? 'menu-open' : ''}`} aria-label="Main navigation">
    <a className="brand" href="#top" onClick={() => navigateTo('top')} aria-label="Beneath the Surface home">Beneath <span>the Surface.</span></a>
    <div className={`menu-overlay ${open ? 'open' : ''}`} aria-hidden="true"/>
    <div ref={linksRef} className={`navlinks ${open ? 'open' : ''}`} id="mobile-navigation">
      <span className="menu-heading">Explore Agoncillo</span>
      {sections.map(([id, label]) => <a key={id} className={`${active === id ? 'active' : ''} ${id === 'visit' ? 'navcta' : ''}`} href={`#${id}`} aria-current={active === id ? 'location' : undefined} onClick={() => navigateTo(id)}>{label}{id === 'visit' && <Icon name="arrow" size={16}/>}</a>)}
      <span className="menu-location">Agoncillo, Batangas · Philippines</span>
    </div>
    <button type="button" ref={toggleRef} className="menu" aria-label={open ? 'Close menu' : 'Open menu'} aria-controls="mobile-navigation" aria-expanded={open} onClick={() => { restoreFocus.current = true; setOpen(value => !value); }}><span className="menu-icon"><i/><i/></span></button>
  </nav>;
}
const scenes = [ { src: assets.lake, label: 'The lake' }, { src: assets.fisherfolk, label: 'The people' }, { src: assets.agoncillo, label: 'The place' } ];
function Hero() {
  const [slide, setSlide] = useState(0);
  return <section className="hero" id="top" aria-labelledby="hero-title">
    <div className="photo-stack" aria-hidden="true">{scenes.map((scene, i) => <img key={scene.src} src={scene.src} alt="" className={`photo ${slide === i ? 'active' : ''}`} fetchPriority={i === 0 ? 'high' : 'auto'} decoding="async"/>)}</div>
    <div className="hero-content"><Reveal className="eyebrow"><Icon name="pin" size={15}/>Agoncillo, Batangas · Philippines</Reveal><Reveal as="h1" id="hero-title">Beneath<br/><em>the surface.</em></Reveal><Reveal as="p" className="hero-description">Discover tawilis, the freshwater sardine of Taal Lake, and the fishing communities of Agoncillo, Batangas.</Reveal><Reveal className="hero-actions"><Pill href="#discover">Discover tawilis</Pill><a className="text-link" href="#visit">Before you visit <Icon name="arrow" size={18}/></a></Reveal></div>
    
    <div className="hero-bottom"><a href="#discover" className="scroll-link"><span className="scroll-circle">↓</span>Explore the guide</a><div className="scene-controls" role="group" aria-label="Choose a landscape photograph">{scenes.map((scene, i) => <button type="button" key={scene.src} aria-pressed={slide === i} onClick={() => setSlide(i)}><span>0{i + 1}</span><span>{scene.label}</span></button>)}</div><span className="hero-location"><Icon name="wave" size={18}/>Home of the tawilis</span></div>
  </section>;
}
function Intro() {
  return <section className="section intro" id="discover" aria-labelledby="tawilis-title"><div className="intro-copy"><Label number="01">Only in Taal Lake</Label><h2 id="tawilis-title">Meet<br/><em>the tawilis.</em></h2><p className="lead">The world’s only freshwater sardine.</p><p className="muted"><i>Sardinella tawilis</i> is endemic to Taal Lake in Batangas—it occurs naturally here and nowhere else. It supports local fishing livelihoods and forms part of Batangas’ food culture.</p><a className="inline-link" href="#conservation">Why it needs protection <Icon name="arrow" size={18}/></a></div><figure className="intro-image"><img src={assets.tawilis} width="1800" height="1800" alt="Fresh tawilis fish from Batangas" loading="lazy"/><figcaption><strong>Sardinella tawilis</strong><small>Photo: Lokalpedia</small></figcaption></figure></section>;
}
function Story() {
  return <section className="section story" id="place" aria-labelledby="place-title"><figure className="story-image"><img src={assets.agoncillo} width="960" height="1440" alt="Taal Lake seen from Agoncillo, Batangas" loading="lazy"/><figcaption>Agoncillo, Batangas<small>Photo: Michael Angelo Luna</small></figcaption></figure><div className="story-copy"><Label number="02">Life by the lake</Label><h2 id="place-title">Agoncillo,<br/><em>by Taal Lake.</em></h2><p className="muted">Fishing, food preparation, processing, and local selling connect families’ livelihoods to the lake. Tawilis is traded fresh and processed, linking fisherfolk with local food businesses and markets.</p><div className="place-highlight"><h3>The Tawilis Festival</h3><p>The festival celebrates Agoncillo’s cultural identity and its connection to Taal Lake’s harvests.</p><a className="inline-link" href="https://www.agoncillo.gov.ph/tawilis-festival-and-other-events" target="_blank" rel="noopener noreferrer">Festival information <Icon name="external" size={18}/><span className="sr-only"> (opens in a new tab)</span></a><small>Confirm event dates with the municipality.</small></div></div></section>;
}
const threats = [
  { title: 'Overfishing', text: 'Excessive harvesting puts pressure on tawilis populations.' },
  { title: 'Pollution', text: 'Waste and plastic contamination affect the lake environment.' },
  { title: 'Habitat degradation', text: 'Deteriorating lake conditions put its only natural home at risk.' },
  { title: 'Introduced fish species', text: 'Introduced species add pressure to the lake’s native ecosystem.' },
];
function Conservation() {
  return <section className="section conservation" id="conservation" aria-labelledby="conservation-title"><div><Label number="03">Conservation</Label><h2 id="conservation-title">Protecting tawilis<br/><em>starts with the lake.</em></h2><p className="muted">Tawilis has been assessed as Endangered by the IUCN. Keeping Taal Lake healthy matters to the fish and to the communities who depend on it.</p><a className="inline-link" href="#visit">How to visit responsibly <Icon name="arrow" size={18}/></a></div><div className="conservation-summary"><h3>What puts tawilis at risk?</h3><ul className="threat-list">{threats.map(threat=><li key={threat.title}><strong>{threat.title}</strong><p>{threat.text}</p></li>)}</ul><p className="conservation-reminder">Respect the annual fishing moratorium and seasonal restrictions. Confirm current dates and permitted activities with local fisheries authorities.</p></div></section>;
}
const visitorTips = [
  { title: 'What should I check before visiting?', tag: 'Local arrangements', text: 'Contact Agoncillo’s local tourism office to confirm access, transport, parking, facilities, activity availability, prices, and schedules. Ask about accessibility if needed. Arrange community visits in advance.' },
  { title: 'Can I join a local learning activity?', tag: 'Fisherfolk & food', text: 'Ask tourism staff about permitted fishing demonstrations, food preparation, and lake conservation education. Availability depends on local arrangements and fishing restrictions. Ask permission before taking photos or entering working areas. This website does not accept bookings.' },
  { title: 'How can I visit responsibly?', tag: 'Care for the lake', text: 'Follow the fishing moratorium and local restrictions, keep waste out of the water, take your litter with you, and avoid disturbing wildlife or fishing operations.' },
  { title: 'How can I support local communities?', tag: 'Local products', text: 'Learn about fresh and processed tawilis from local food businesses while respecting fishery restrictions. Ask about locally made crafts, illustrations, and educational souvenirs that celebrate tawilis without requiring the fish to be harvested.' },
];
function FaqItem({ tip, index }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return <article className="guide-item" data-open={open}>
    <h3><button type="button" className="guide-trigger" id={id + '-question'} aria-expanded={open} aria-controls={id + '-answer'} onClick={() => setOpen(value => !value)}>
      <span className="question-number">0{index + 1}</span><span><small>{tip.tag}</small>{tip.title}</span><span className="plus" aria-hidden="true"/>
    </button></h3>
    <div className="guide-answer-panel" id={id + '-answer'} role="region" aria-labelledby={id + '-question'} aria-hidden={!open} inert={!open}>
      <div className="guide-answer-clip"><div className="guide-answer"><p>{tip.text}</p></div></div>
    </div>
  </article>;
}
function VisitorGuide() {
  return <section className="section visitor-guide" id="visit" aria-labelledby="visit-title"><div className="guide-intro"><Label number="04">Visitor guide</Label><h2 id="visit-title">Before<br/><em>you visit.</em></h2><p className="muted">A few practical details for your visit to Agoncillo. Open a question to read more.</p><a className="inline-link" href="https://www.agoncillo.gov.ph/" target="_blank" rel="noopener noreferrer">Agoncillo municipal website <Icon name="external" size={18}/><span className="sr-only"> (opens in a new tab)</span></a><p className="guide-note">Confirm current schedules, rates, and restrictions locally.</p></div><div className="guide-questions">{visitorTips.map((tip,i)=><FaqItem key={tip.title} tip={tip} index={i}/>)}</div></section>;
}
function Footer() { return <footer className="site-footer"><div className="footer-top"><div><a className="brand" href="#top">Beneath <span>the Surface.</span></a><p>Discover tawilis, Agoncillo,<br/>and the heritage of Taal Lake.</p></div><div className="footer-links"><span>Keep exploring</span>{sections.map(([id,label]) => <a href={`#${id}`} key={id}>{label}</a>)}</div><a className="back-top" href="#top" aria-label="Back to top">↑</a></div><div className="footer-bottom"><span>Agoncillo, Batangas · Philippines</span><details className="credits"><summary>Photo credits & further reading <span>+</span></summary><div><p>Photos: <a href="https://commons.wikimedia.org/wiki/File:Panorama_of_Lake_Taal_%26_Volcano,_Philippines.jpg" target="_blank" rel="noopener noreferrer">Ray in Manila</a> · <a href="https://commons.wikimedia.org/wiki/File:Taal_Lake_view_from_Agoncillo,_Batangas.jpg" target="_blank" rel="noopener noreferrer">Michael Angelo Luna</a> · <a href="https://commons.wikimedia.org/wiki/File:Tawilis_(Sardinella_tawilis),_an_endemic_fish_that_can_only_be_found_in_Taal_Lake.jpg" target="_blank" rel="noopener noreferrer">Lokalpedia</a></p><p>Read more: <a href="https://nfrdi.da.gov.ph/2024/07/23/feature-from-science-to-policy-conserving-sardinella-tawilis-in-taal-lake/" target="_blank" rel="noopener noreferrer">DA-NFRDI</a> · <a href="https://doi.org/10.2305/IUCN.UK.2018-2.RLTS.T98836352A143839946.en" target="_blank" rel="noopener noreferrer">IUCN Red List assessment</a></p></div></details></div></footer>; }
function useScrollReveal() {
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches || !window.IntersectionObserver || !window.Element.prototype.animate) return;
    const animations = new Map();
    const observer = new window.IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (motion.matches || entry.target.contains(document.activeElement)) continue;
        const animation = entry.target.animate(
          [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 600, easing: 'cubic-bezier(.22, 1, .36, 1)' }
        );
        animations.set(entry.target, animation);
        animation.onfinish = () => animations.delete(entry.target);
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    document.querySelectorAll('.section > *, .hero-content > *').forEach(el => observer.observe(el));
    const cancelMotion = () => {
      if (!motion.matches) return;
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
      animations.clear();
    };
    const onFocus = event => {
      for (const [el, animation] of animations) {
        if (el.contains(event.target)) { animation.cancel(); animations.delete(el); }
      }
    };
    motion.addEventListener('change', cancelMotion);
    document.addEventListener('focusin', onFocus);
    return () => {
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
      motion.removeEventListener('change', cancelMotion);
      document.removeEventListener('focusin', onFocus);
    };
  }, []);
}

function App() { useScrollReveal(); return <><a className="skip-link" href="#main-content">Skip to content</a><Nav/><main id="main-content" tabIndex={-1}><Hero/><Intro/><Story/><Conservation/><VisitorGuide/></main><Footer/></>; }
createRoot(document.getElementById('root')).render(<App/>);
