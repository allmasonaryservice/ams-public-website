/**
 * Section entrance animations — gentle fade + slide up on scroll.
 * Relies on window.__gsap + window.__ScrollTrigger set by BaseLayout.
 */

function initSectionTransitions(gsap: any, ScrollTrigger: any) {
  const mobile = window.innerWidth < 768;
  const yFrom = mobile ? 30 : 48;
  const dur   = mobile ? 0.75 : 0.9;

  const sections = [
    '#why-choose-us',
    '#services-section',
    '#about-section',
    '#recent-projects',
    '#tool-mortar',
    '#free-tools-strip',
    '#testimonials',
    '#service-areas',
    '#cta-banner',
  ];

  sections.forEach(sel => {
    const el = document.querySelector<HTMLElement>(sel);
    if (!el) return;

    gsap.fromTo(
      el,
      { opacity: 0, y: yFrom },
      {
        opacity: 1,
        y: 0,
        duration: dur,
        ease: 'power2.out',
        clearProps: 'opacity,y,willChange',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
      }
    );
  });
}

window.addEventListener(
  'animations:ready',
  () => {
    const gsap          = (window as any).__gsap;
    const ScrollTrigger = (window as any).__ScrollTrigger;
    if (gsap && ScrollTrigger) initSectionTransitions(gsap, ScrollTrigger);
  },
  { once: true }
);
