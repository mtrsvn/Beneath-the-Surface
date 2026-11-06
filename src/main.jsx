import React, { useEffect, useId, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const assets = { lake: '/assets/lake.jpg', fisherfolk: '/assets/fisherfolk.jpg', agoncillo: '/assets/agoncillo.jpg', tawilis: '/assets/tawilis.jpg' };
const sections = [ ['discover', 'The tawilis'], ['place', 'Agoncillo'], ['heritage', 'Food & culture'], ['conservation', 'Conservation'], ['visit', 'Visitor guide'] ];

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
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!('IntersectionObserver' in window)) { el.classList.add('visible'); return; }
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); observer.disconnect(); } }, { threshold: 0.08 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return <Tag ref={ref} className={`reveal ${className}`} {...props}>{children}</Tag>;
}
function Label({ number, children }) { return <div className="section-label"><span>{number}</span><i/>{children}</div>; }
function Pill({ href, children, secondary = false, ...props }) { return <a className={`pill${secondary ? ' pill-secondary' : ''}`} href={href} {...props}>{children}<Icon name="arrow" size={18}/></a>; }
function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');
  const navRef = useRef(null), toggleRef = useRef(null), linksRef = useRef(null);
  useEffect(() => {
    const onScroll = () => { setScrolled(window.scrollY > 40); if (window.scrollY < 200) setActive(''); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    const media = window.matchMedia('(min-width: 901px)');
    const onResize = () => { if (media.matches) setOpen(false); };
    media.addEventListener('change', onResize);
    const observer = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id); }, { rootMargin: '-20% 0px -55% 0px' });
    sections.forEach(([id]) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => { window.removeEventListener('scroll', onScroll); media.removeEventListener('change', onResize); observer.disconnect(); };
  }, []);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    linksRef.current?.querySelector('a')?.focus();
    const onKey = e => {
      if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
      if (e.key === 'Tab') {
        const items = [...navRef.current.querySelectorAll('a[href], button:not([tabindex="-1"])')];
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKey); toggleRef.current?.focus(); };
  }, [open]);
  return <nav ref={navRef} className={`nav ${scrolled ? 'scrolled' : ''} ${open ? 'menu-open' : ''}`} aria-label="Main navigation">
    <a className="brand" href="#top" onClick={() => setOpen(false)} aria-label="Beneath the Surface home">Beneath <span>the Surface.</span></a>
    <button className={`menu-overlay ${open ? 'open' : ''}`} aria-label="Close navigation" tabIndex={-1} onClick={() => setOpen(false)}/>
    <div ref={linksRef} className={`navlinks ${open ? 'open' : ''}`} id="mobile-navigation">
      <span className="menu-heading">Explore Agoncillo</span>
      {sections.map(([id, label]) => <a key={id} className={`${active === id ? 'active' : ''} ${id === 'visit' ? 'navcta' : ''}`} href={`#${id}`} aria-current={active === id ? 'location' : undefined} onClick={() => setOpen(false)}>{label}{id === 'visit' && <Icon name="external" size={16}/>}</a>)}
      <span className="menu-location">Agoncillo, Batangas · Philippines</span>
    </div>
    <button ref={toggleRef} className="menu" aria-label={open ? 'Close menu' : 'Open menu'} aria-controls="mobile-navigation" aria-expanded={open} onClick={() => setOpen(v => !v)}><span className="menu-icon"><i/><i/></span></button>
  </nav>;
}
const scenes = [ { src: assets.lake, label: 'The lake' }, { src: assets.fisherfolk, label: 'The people' }, { src: assets.agoncillo, label: 'The place' } ];
function Hero() {
  const [slide, setSlide] = useState(0);
  return <section className="hero" id="top" aria-labelledby="hero-title">
    <div className="photo-stack" aria-hidden="true">{scenes.map((scene, i) => <img key={scene.src} src={scene.src} alt="" className={`photo ${slide === i ? 'active' : ''}`} fetchPriority={i === 0 ? 'high' : 'auto'} decoding="async"/>)}</div>
    <div className="hero-content"><Reveal className="eyebrow"><Icon name="pin" size={15}/>Agoncillo, Batangas · Philippines</Reveal><Reveal as="h1" id="hero-title">Beneath<br/><em>the surface.</em></Reveal><Reveal as="p" className="hero-description">A small fish. A lakeside community.<br/>Discover the stories that make Taal Lake extraordinary.</Reveal><Reveal className="hero-actions"><Pill href="#discover">Discover tawilis</Pill><a className="text-link" href="#visit">Before you visit <Icon name="external" size={18}/></a></Reveal></div>
    <div className="hero-side" aria-hidden="true"><span>A closer look at</span><strong>Taal Lake</strong><span>Nature · People · Heritage</span></div>
    <div className="hero-bottom"><a href="#explore" className="scroll-link"><span className="scroll-circle">↓</span>There’s a story here</a><div className="scene-controls" role="group" aria-label="Choose a landscape photograph">{scenes.map((scene, i) => <button key={scene.src} aria-pressed={slide === i} onClick={() => setSlide(i)}><span>0{i + 1}</span><span>{scene.label}</span></button>)}</div><span className="hero-location"><Icon name="wave" size={18}/>Home of the tawilis</span></div>
  </section>;
}
function Explore() { return <section className="explore-strip" id="explore" aria-label="Explore the website"><div className="explore-intro"><span className="eyebrow">A place worth knowing</span><p>Start with a little curiosity.</p></div>{[{ id:'discover', icon:'wave', name:'Meet the tawilis', sub:'A species found only here' },{ id:'heritage', icon:'pin', name:'Discover local heritage', sub:'Food, culture, and community' },{ id:'visit', icon:'sun', name:'Prepare for your visit', sub:'Simple, thoughtful guidance' }].map(item => <a key={item.id} href={`#${item.id}`} className="explore-link"><span className="explore-icon"><Icon name={item.icon} size={24}/></span><span><strong>{item.name}</strong><small>{item.sub}</small></span><Icon name="external" size={18}/></a>)}</section>; }
function Intro() { return <section className="section intro" id="discover"><div className="intro-copy"><Label number="01">Only in Taal Lake</Label><Reveal as="h2">Small fish.<br/><em>Extraordinary story.</em></Reveal><Reveal as="p" className="lead">Meet tawilis, the world’s only freshwater sardine.</Reveal><Reveal as="p" className="muted"><i>Sardinella tawilis</i> is endemic to Taal Lake in Batangas. Endemic means it occurs naturally in this place, and nowhere else. This small fish is woven into the lake’s food culture, fishing livelihoods, and local identity.</Reveal><Reveal className="fact-row"><div><Icon name="wave"/><strong>Freshwater</strong><span>A sardine with a unique home</span></div><div><Icon name="pin"/><strong>Taal Lake</strong><span>Its only natural habitat</span></div></Reveal><Reveal><a className="inline-link" href="#conservation">Why its protection matters <Icon name="arrow" size={18}/></a></Reveal></div><Reveal as="figure" className="intro-image"><img src={assets.tawilis} alt="Fresh tawilis fish from Batangas" loading="lazy"/><figcaption><span>Meet the species</span><strong>Sardinella tawilis</strong><small>Photo: Lokalpedia</small></figcaption><div className="image-index" aria-hidden="true">01 / TAWILIS</div></Reveal></section>; }
function Story() { return <section className="section story" id="place"><Reveal as="figure" className="story-image"><img src={assets.agoncillo} alt="Taal Lake seen from Agoncillo, Batangas" loading="lazy"/><figcaption><Icon name="pin" size={16}/>Agoncillo, Batangas<small>Photo: Michael Angelo Luna</small></figcaption></Reveal><div className="story-copy"><Label number="02">Life by the lake</Label><Reveal as="h2">More than<br/><em>a beautiful view.</em></Reveal><Reveal as="p" className="lead">A lake that shapes everyday life.</Reveal><Reveal as="p" className="muted">In Agoncillo, tawilis connects the water to the table. Fishing, food preparation, and local selling support community livelihoods, while local dishes and the Tawilis Festival celebrate a shared identity.</Reveal><Reveal as="p" className="muted">Learning from the people who live and work here offers a closer look at the place. Fisheries, like farming, can connect visitors with food, local knowledge, and community life.</Reveal><Reveal className="story-tags"><span>Fishing communities</span><span>Food heritage</span><span>Local traditions</span></Reveal><Reveal><a className="inline-link" href="https://www.agoncillo.gov.ph/tawilis-festival-and-other-events" target="_blank" rel="noopener noreferrer">Read about the Tawilis Festival <Icon name="external" size={18}/><span className="sr-only"> (opens in a new tab)</span></a></Reveal></div></section>; }
function Gallery() { return <section className="section gallery" id="experience"><div className="section-heading"><div><Label number="03">A closer connection</Label><Reveal as="h2">See the place.<br/><em>Know its people.</em></Reveal></div><Reveal as="p" className="muted">From life on the water to the landscape around it, there is more to discover when you know what you’re looking at.</Reveal></div><div className="gallery-grid"><Reveal as="article" className="gallery-card"><div className="gallery-photo"><img src={assets.fisherfolk} alt="Fisherfolk working together on Taal Lake" loading="lazy"/><span className="photo-category">People & livelihood</span></div><div className="gallery-caption"><span>01 / COMMUNITY</span><h3>Stories from the water</h3><p>Discover the knowledge and daily work of lakeside fishing communities. Ask local tourism staff about arranged learning opportunities with fisherfolk.</p></div></Reveal><Reveal as="article" className="gallery-card"><div className="gallery-photo"><img src={assets.lake} alt="Panoramic view of Taal Lake and volcano" loading="lazy"/><span className="photo-category">Landscape & identity</span></div><div className="gallery-caption"><span>02 / LANDSCAPE</span><h3>There is only one Taal</h3><p>The lake is tawilis’ natural home and a shared resource for nearby communities. Enjoy its scenery with respect for the water and the people who depend on it.</p></div></Reveal></div></section>; }

function FoodHeritage() {
  return <section className="section food-heritage" id="heritage" aria-labelledby="heritage-title">
    <div className="section-heading"><div><Label number="04">Food, culture, and community</Label><Reveal as="h2" id="heritage-title">The lake,<br/><em>at the table.</em></Reveal></div><Reveal as="p" className="muted">Tawilis is more than a catch. It connects Batangas’ food traditions with the people who fish, prepare, process, and sell it.</Reveal></div>
    <div className="heritage-layout">
      <div className="food-story">
        <Reveal as="p" className="lead">A local food with a community behind it.</Reveal>
        <Reveal as="p" className="muted">Tawilis is traded both fresh and processed. Its journey links fishing communities with food preparation, local products, and markets. Each part of that journey contributes to livelihoods connected to Taal Lake.</Reveal>
        <div className="food-connections">
          <Reveal as="article"><span>01 / THE CATCH</span><h3>Fisherfolk</h3><p>Fishing communities are the first link in the tawilis trade. Their work connects the lake’s fishery resources with local food and income.</p></Reveal>
          <Reveal as="article"><span>02 / THE PRODUCT</span><h3>Preparation & processing</h3><p>Fresh and processed tawilis connect the fishery with food businesses and local products, extending its role beyond the catch itself.</p></Reveal>
          <Reveal as="article"><span>03 / THE CONNECTION</span><h3>Local markets</h3><p>Local selling brings these products to customers and creates links among fisherfolk, producers, and food businesses.</p></Reveal>
        </div>
        <Reveal className="heritage-note"><strong>Explore food culture thoughtfully.</strong><p>Ask local food businesses about their tawilis products, how they are prepared, availability, and prices. Respect fishing restrictions and conservation measures when choosing local food.</p></Reveal>
      </div>
      <Reveal as="aside" className="festival-feature" aria-labelledby="festival-title">
        <span className="eyebrow">Agoncillo’s cultural identity</span><h3 id="festival-title">The Tawilis<br/><em>Festival.</em></h3>
        <p>The Tawilis Festival is associated with Agoncillo’s culture and the harvests of Taal Lake. It reflects the fish’s place in local identity and the community’s connection to the water.</p>
        <p>Tawilis dishes, traditions, local knowledge, and community stories offer different ways to understand this heritage. Ask local tourism staff about opportunities to discover these stories during your visit.</p>
        <a className="inline-link" href="https://www.agoncillo.gov.ph/tawilis-festival-and-other-events" target="_blank" rel="noopener noreferrer">Explore the municipal festival page <Icon name="external" size={18}/><span className="sr-only"> (opens in a new tab)</span></a>
        <small>Confirm festival dates and the event programme with the municipality before making plans.</small>
      </Reveal>
    </div>
  </section>;
}
const learningIdeas = [
  { title: 'Learn from fisherfolk', label: 'Fishing knowledge', text: 'A locally arranged demonstration of permitted fishing practices can introduce the work behind the catch. Ask how fishing rules and seasonal restrictions connect with the long-term care of tawilis.', question: 'Ask about permitted demonstrations and who can guide the activity.' },
  { title: 'Discover food preparation', label: 'Culinary heritage', text: 'Food preparation and culinary demonstrations can connect a tawilis product with local knowledge and Batangas’ food culture. Community stories add context to what reaches the table.', question: 'Ask whether a food demonstration or community food activity can be arranged.' },
  { title: 'Understand the lake', label: 'Conservation learning', text: 'A discussion about the lake can explain tawilis’ unique habitat, pressures on the fishery, pollution prevention, and responsible visitor practices. Learning why the fish needs protection is part of knowing the place.', question: 'Ask about locally led conservation education and lake information.' },
];
function CommunityLearning() {
  return <section className="section community-learning" id="learning" aria-labelledby="learning-title">
    <div className="section-heading"><div><Label number="05">Learn with the community</Label><Reveal as="h2" id="learning-title">Beyond the view.<br/><em>Closer to local life.</em></Reveal></div><Reveal as="p" className="muted">Fishing livelihoods, food, and environmental education can connect a visitor with the place. Here are learning experiences to ask local tourism staff about.</Reveal></div>
    <div className="learning-grid">{learningIdeas.map((idea,i) => <Reveal as="article" className="learning-card" key={idea.title}><span className="learning-number">0{i+1}</span><span className="eyebrow">{idea.label}</span><h3>{idea.title}</h3><p>{idea.text}</p><div className="learning-question">{idea.question}</div></Reveal>)}</div>
    <Reveal className="learning-arrangements"><Icon name="pin" size={20}/><p><strong>Arrange first, participate with permission.</strong> These are ideas for locally coordinated learning, not scheduled or bookable tours listed on this website. Confirm availability, local guidance, and any restrictions before visiting a fishing community.</p></Reveal>
    <Reveal className="craft-feature"><div><span className="eyebrow">Another way to support local creativity</span><h3>Carry the story,<br/><em>care for the species.</em></h3></div><div><p>Locally designed crafts, illustrations, and educational materials can celebrate tawilis and Taal Lake without requiring the fish to be harvested. Ask about locally made options and the stories behind them.</p><a className="inline-link" href="#visit">Read the visitor guide <Icon name="arrow" size={18}/></a></div></Reveal>
  </section>;
}

function Conservation() { return <section className="section conservation" id="conservation"><div className="conservation-intro"><Label number="06">A shared responsibility</Label><Reveal as="h2">One lake.<br/><em>A shared future.</em></Reveal><Reveal as="p" className="lead">Protect the home.<br/>Protect the story.</Reveal><Reveal as="p" className="muted">Tawilis lives naturally only in Taal Lake. Caring for this habitat protects the fish and supports the communities connected to it.</Reveal><Reveal className="conservation-seal"><Icon name="leaf" size={26}/><span>Leave the lake<br/><strong>better understood.</strong></span></Reveal></div><div className="conservation-list"><Reveal as="article"><span className="item-number">01</span><div><h3>A unique freshwater home</h3><p>Its limited natural range makes Taal Lake especially important to tawilis’ survival. The health of the fish and the health of the water are closely connected.</p></div></Reveal><Reveal as="article"><span className="item-number">02</span><div><h3>A habitat under pressure</h3><p>Tawilis has been assessed as Endangered by the IUCN. Overfishing, pollution, habitat degradation, and introduced fish species threaten the fish and its environment.</p></div></Reveal><Reveal as="article"><span className="item-number">03</span><div><h3>Respect the fishing moratorium</h3><p>The annual fishing moratorium and seasonal restrictions are part of managing the tawilis fishery. Confirm current dates and permitted activities with fisheries authorities, and make sure any demonstration follows those rules.</p></div></Reveal><Reveal as="article"><span className="item-number">04</span><div><h3>Small choices matter</h3><p>Keep waste out of the water and help prevent pollution. Choose locally arranged activities that support community livelihoods, respect local guidance, and care for the habitat.</p></div></Reveal><a className="inline-link" href="#visit">Make your visit a thoughtful one <Icon name="arrow" size={18}/></a></div></section>; }
const visitorTips = [
  { title: 'What should I confirm before visiting?', tag: 'Plan ahead', text: 'Contact Agoncillo’s local tourism office to confirm access, available activities, schedules, prices, transport, parking, and visitor facilities. Ask about accessibility if you need assistance. Arrange any community visit in advance.' },
  { title: 'Can I learn from local fisherfolk?', tag: 'Community visits', text: 'Ask local tourism staff about arranged learning opportunities and permitted demonstrations. Listen to fisherfolk’s stories, ask permission before photographing people or entering working areas, and avoid interrupting their work.' },
  { title: 'What fishing restrictions should I respect?', tag: 'Protect the fishery', text: 'Respect the annual fishing moratorium and other seasonal restrictions. Confirm current dates and permitted activities with local fisheries authorities. Choose educational activities that follow conservation measures and avoid disturbing wildlife.' },
  { title: 'How can I help keep the lake clean?', tag: 'Leave with care', text: 'Take your litter with you, use proper waste bins, and keep waste out of the water. Bring reusable items where practical. Protecting water quality helps protect the habitat tawilis depends on.' },
  { title: 'What is tawilis’ connection to local food?', tag: 'Food heritage', text: 'Tawilis dishes are part of Batangas’ culinary heritage, and the fish is traded both fresh and processed. Fishing, food preparation, and local selling support community livelihoods. Ask local businesses about availability and prices while respecting rules that protect the fishery.' },
  { title: 'How else can I support local communities?', tag: 'Local creativity', text: 'Look for locally made crafts, illustrations, and educational souvenirs. These can celebrate tawilis and support local creativity without requiring the fish to be harvested. Respect local guidance and share what you learn about the lake responsibly.' },
];
function FaqItem({ tip, index }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return <article className="guide-item" data-open={open}>
    <h3><button className="guide-trigger" id={id + '-question'} aria-expanded={open} aria-controls={id + '-answer'} onClick={() => setOpen(value => !value)}>
      <span className="question-number">0{index + 1}</span><span><small>{tip.tag}</small>{tip.title}</span><span className="plus" aria-hidden="true"/>
    </button></h3>
    <div className="guide-answer-panel" id={id + '-answer'} role="region" aria-labelledby={id + '-question'} aria-hidden={!open} inert={!open}>
      <div className="guide-answer-clip"><div className="guide-answer"><p>{tip.text}</p></div></div>
    </div>
  </article>;
}
function VisitorGuide() { return <section className="section visitor-guide" id="visit"><div className="guide-intro"><Label number="07">Your visitor guide</Label><Reveal as="h2">A little planning.<br/><em>A better visit.</em></Reveal><Reveal as="p" className="muted">Practical answers for a visit that respects the place, its people, and its natural heritage.</Reveal><Reveal className="destination-card"><div><span>Your destination</span><strong>Agoncillo, Batangas</strong><p>Taal Lake · Philippines</p></div></Reveal><Reveal><a className="inline-link" href="https://www.agoncillo.gov.ph/" target="_blank" rel="noopener noreferrer">Agoncillo municipal website <Icon name="external" size={18}/><span className="sr-only"> (opens in a new tab)</span></a></Reveal><Reveal as="p" className="guide-note">Confirm current arrangements with local tourism staff. Activity availability, rates, and access may vary.</Reveal></div><div className="guide-questions">{visitorTips.map((tip,i) => <FaqItem key={tip.title} tip={tip} index={i}/>)}<div className="guide-footnote"><Icon name="leaf" size={18}/><p>Community visits and demonstrations need local arrangements and permission. Photos on this page do not guarantee a bookable activity.</p></div></div></section>; }
function Footer() { return <footer className="site-footer"><div className="footer-top"><div><a className="brand" href="#top">Beneath <span>the Surface.</span></a><p>Discover tawilis, Agoncillo,<br/>and the heritage of Taal Lake.</p></div><div className="footer-links"><span>Keep exploring</span>{sections.map(([id,label]) => <a href={`#${id}`} key={id}>{label}</a>)}</div><a className="back-top" href="#top" aria-label="Back to top">↑</a></div><div className="footer-bottom"><span>Agoncillo, Batangas · Philippines</span><details className="credits"><summary>Photo credits & further reading <span>+</span></summary><div><p>Photos: <a href="https://commons.wikimedia.org/wiki/File:Panorama_of_Lake_Taal_%26_Volcano,_Philippines.jpg" target="_blank" rel="noopener noreferrer">Ray in Manila</a> · <a href="https://commons.wikimedia.org/wiki/File:Taal_Lake_view_from_Agoncillo,_Batangas.jpg" target="_blank" rel="noopener noreferrer">Michael Angelo Luna</a> · <a href="https://commons.wikimedia.org/wiki/File:Tawilis_(Sardinella_tawilis),_an_endemic_fish_that_can_only_be_found_in_Taal_Lake.jpg" target="_blank" rel="noopener noreferrer">Lokalpedia</a></p><p>Read more: <a href="https://nfrdi.da.gov.ph/2024/07/23/feature-from-science-to-policy-conserving-sardinella-tawilis-in-taal-lake/" target="_blank" rel="noopener noreferrer">DA-NFRDI</a> · <a href="https://doi.org/10.2305/IUCN.UK.2018-2.RLTS.T98836352A143839946.en" target="_blank" rel="noopener noreferrer">IUCN Red List assessment</a></p></div></details></div></footer>; }
function App() { return <><a className="skip-link" href="#main-content">Skip to content</a><Nav/><main id="main-content"><Hero/><Explore/><Intro/><Story/><Gallery/><FoodHeritage/><CommunityLearning/><Conservation/><VisitorGuide/></main><Footer/></>; }
createRoot(document.getElementById('root')).render(<App/>);
