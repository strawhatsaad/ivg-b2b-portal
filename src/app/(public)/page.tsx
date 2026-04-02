'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// ──────────────────────────────────────────────────────────
// Magnetic Button Component for Premium Interactive Feel
// ──────────────────────────────────────────────────────────
const MagneticButton = ({ children, className, href }: { children: React.ReactNode, className: string, href: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    // Only apply magnetic effect on devices with pointers (desktops)
    if (window.matchMedia("(any-hover: hover)").matches) {
      let xTo: any, yTo: any;

      // Dynamically import GSAP
      import('gsap').then(({ default: gsap }) => {
        if (!textRef.current) return;
        xTo = gsap.quickTo(textRef.current, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
        yTo = gsap.quickTo(textRef.current, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });
      });

      const handleMouseMove = (e: MouseEvent) => {
        if (!containerRef.current || !xTo || !yTo) return;
        const { clientX, clientY } = e;
        const { height, width, left, top } = containerRef.current.getBoundingClientRect();
        const x = clientX - (left + width / 2);
        const y = clientY - (top + height / 2);
        xTo(x * 0.15);
        yTo(y * 0.15);
      };

      const handleMouseLeave = () => {
        if (xTo) xTo(0);
        if (yTo) yTo(0);
      };

      const container = containerRef.current;
      container?.addEventListener("mousemove", handleMouseMove);
      container?.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        container?.removeEventListener("mousemove", handleMouseMove);
        container?.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  return (
    <div className="magnetic-btn-wrapper" ref={containerRef}>
      <Link href={href} className={className} ref={textRef}>
        {children}
      </Link>
    </div>
  );
};

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  const container = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const scrubTextRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let timeline: any = null;
    let triggers: any[] = [];

    const initGSAP = async () => {
      try {
        const { default: gsap } = await import('gsap');
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        gsap.registerPlugin(ScrollTrigger);

        let ctx = gsap.context(() => {
          timeline = gsap.timeline();
          timeline.from('.hero-content > *', {
            y: 100,
            opacity: 0,
            duration: 1.5,
            stagger: 0.2,
            ease: 'power4.out',
            delay: 0.1
          });

          triggers.push(
            ScrollTrigger.create({
              animation: gsap.to(heroRef.current, {
                opacity: 0,
                y: -150,
                scale: 0.9,
                ease: 'none',
              }),
              trigger: '.hero-section',
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            })
          );

          if (scrubTextRef.current) {
            const chars = scrubTextRef.current.querySelectorAll('.scrub-word');

            triggers.push(
              ScrollTrigger.create({
                animation: gsap.to(chars, {
                  opacity: 1,
                  stagger: 0.1,
                  ease: 'none',
                }),
                trigger: '.scrub-section',
                start: 'top 60%',
                end: 'bottom 50%',
                scrub: 1,
              })
            );
          }

          triggers.push(
            ScrollTrigger.create({
              animation: gsap.to('.timeline-parallax-bg', {
                yPercent: 30,
                ease: 'none',
              }),
              trigger: '.timeline-section',
              start: 'top bottom',
              end: 'bottom top',
              scrub: true
            })
          );

          const cards = gsap.utils.toArray('.feature-card');
          cards.forEach((card: any) => {
            triggers.push(
              ScrollTrigger.create({
                animation: gsap.from(card, {
                  y: 100,
                  opacity: 0,
                  duration: 1.2,
                  ease: 'expo.out',
                }),
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              })
            );
          });
        }, container);

        return () => ctx.revert();
      } catch (err) {
        console.warn('GSAP initialization dropped by container cleanup:', err);
      }
    };

    const cleanup = initGSAP();

    return () => {
      if (timeline) timeline.kill();
      triggers.forEach(t => t.kill());
    };
  }, []);

  const scrubString = "We engineer premium e-liquids defining the modern global vaping experience. Quality, consistency, and unparalleled flavour profiles for wholesale distribution in over 100 countries.";
  const words = scrubString.split(' ');

  return (
    <div className="home-landing" ref={container}>

      {/* 1. Hero Section */}
      <section className="hero-section">
        <video
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay" />
        <div className="hero-content" ref={heroRef}>
          <h1 className="hero-title">
            Vape Great<br /><span>With IVG.</span>
          </h1>
          <div className="hero-ctas">
            <MagneticButton href="/register" className="magnetic-btn magnetic-btn--primary">
              Apply to Trade
            </MagneticButton>
            <MagneticButton href="/dashboard" className="magnetic-btn magnetic-btn--secondary">
              Go to Dashboard
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* 2. Text Scrub Animation Section */}
      <section className="scrub-section">
        <div className="scrub-text-container">
          <h2 className="scrub-headline" ref={scrubTextRef}>
            {words.map((word, idx) => (
              <React.Fragment key={idx}>
                <span className="scrub-word">{word}</span>
                {idx < words.length - 1 && ' '}
              </React.Fragment>
            ))}
          </h2>
        </div>
      </section>

      {/* 3. Standalone Parallax Timeline */}
      <section className="timeline-section">
        <img src="/ivg-timeline.png" alt="IVG Timeline" className="timeline-parallax-bg" />
      </section>

      {/* 4. Bento Features Grid */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <h3>Premium Inventory Access</h3>
            <p>Direct allocations of high-demand e-liquids, disposables, and hardware, shipped directly from our primary distribution hubs.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <h3>Architectural Dashboard</h3>
            <p>Manage credit limits, utilize dynamic reporting, and monitor order volume analytics instantly.</p>
          </div>
          <div className="feature-card">
             <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <h3>Tiered Credit Accounts</h3>
            <p>Seamless net-30 payment options strictly configured for verified compliance partners globally.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <h3>Intelligent Forecasting</h3>
            <p>Predictive analytics alerting you to restock quantities before seasonal surges affect your region&apos;s supply chain.</p>
          </div>
        </div>
      </section>

      {/* 5. Bottom Final CTA */}
      <section className="cta-section">
        <div className="cta-box">
          <h2>Transform Your Supply Chain</h2>
          <p>Join over thousands of global distributors partnered with IVG for unparalleled service and margins.</p>
          <div className="hero-ctas">
            <MagneticButton href="/register" className="magnetic-btn magnetic-btn--primary">
              Apply to Trade Today
            </MagneticButton>
          </div>
        </div>
      </section>

    </div>
  );
}
