'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/compat/router';
import { AnimatePresence, LazyMotion, domAnimation, m } from 'motion/react';
import { cn } from '@/lib/utils';

const leftMenu = [
  { label: 'Home', href: '/' },
  { label: 'Über Uns', href: '/ueber-uns' },
  { label: 'Shop', href: '/shop' },
];

const rightMenu = [
  { label: 'FAQ', href: '/faq' },
  { label: 'Kontakt', href: '/kontakt' },
  { label: 'Mein Konto', href: '/mein-konto' },
];

const cartLink = { label: 'Warenkorb', href: '/cart' };
const configuratorLink = { label: 'ZUM KONFIGURATOR', href: '/shop' };

function getIsActive(asPath: string, href: string) {
  if (!href) return false;
  if (href.startsWith('#')) return asPath.includes(href);
  if (href === '/') return asPath === '/';
  return asPath.startsWith(href);
}

interface HamburgerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const Hamburger = ({ isOpen, onOpenChange }: HamburgerProps) => {
  const router = useRouter();
  const asPath =
    router?.asPath ??
    (typeof window !== 'undefined' ? window.location.pathname : '/');
  const allLinks = useMemo(
    () => [...leftMenu, ...rightMenu, cartLink, configuratorLink],
    [],
  );

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onOpenChange]);

  return (
    <div className="z-[600] md:hidden">
      <button
        className="inline-flex h-12 w-12 items-center justify-center rounded-full text-white transition hover:bg-white/10"
        data-cy="hamburger"
        data-testid="hamburger"
        onClick={() => onOpenChange(true)}
        aria-expanded={isOpen}
        aria-controls="mobile-menu-sheet"
        aria-label="Menü öffnen"
        type="button"
      >
        <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M4 6h16M4 12h16M4 18h16"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <LazyMotion features={domAnimation}>
        <AnimatePresence>
          {isOpen ? (
            <>
              <m.button
                type="button"
                aria-label="Menü schließen"
                className="fixed inset-0 z-[900] bg-black/35 backdrop-blur-[1px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => onOpenChange(false)}
              />

              <m.div
                id="mobile-menu-sheet"
                className="fixed inset-x-0 bottom-0 z-[950] max-h-[66vh] overflow-y-auto border border-b-0 border-[#DBE9F9] bg-white px-5 pb-5 pt-4 shadow-[0_-26px_60px_rgba(15,43,82,0.28)]"
                style={{ borderTopLeftRadius: '10px', borderTopRightRadius: '10px' }}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              >
                <div className="mb-3 flex justify-center">
                  <Link
                    href="/"
                    onClick={() => onOpenChange(false)}
                    aria-label="Planenadler Home"
                    className="inline-flex items-center rounded-full bg-white px-4 py-2 shadow-md ring-1 ring-[#DBE9F9]"
                  >
                    <Image
                      src="/Planenadlerlogo.png"
                      alt="Planenadler"
                      width={160}
                      height={42}
                      className="h-10 w-auto object-contain"
                      priority
                    />
                  </Link>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm font-bold uppercase tracking-[0.18em] text-[#1F5CAB]">
                    Menü
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    aria-label="Menü schließen"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#DBE9F9] text-[#1F5CAB] transition hover:bg-[#DBE9F9]"
                  >
                    <svg width="14" height="14" viewBox="0 0 12 12" aria-hidden>
                      <path
                        d="M1 1l10 10M11 1L1 11"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>

                <div className="flex flex-col gap-2 pb-2">
                  {allLinks.map((item) => {
                    const isActive = getIsActive(asPath, item.href);
                    return (
                      <Link
                        key={`${item.href}-${item.label}`}
                        href={item.href}
                        onClick={() => onOpenChange(false)}
                        className={cn(
                          'rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#1F5CAB]/80 transition hover:bg-[#DBE9F9] hover:text-[#1F5CAB]',
                          isActive && 'bg-[#DBE9F9] text-[#1F5CAB]',
                          item.href === configuratorLink.href &&
                            'bg-[#1F5CAB] text-white hover:bg-[#0F2B52] hover:text-white',
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </m.div>
            </>
          ) : null}
        </AnimatePresence>
      </LazyMotion>
    </div>
  );
};

export default Hamburger;
