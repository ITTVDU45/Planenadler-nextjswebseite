'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import Cart from '@/shared/components/Header/Cart.component';

import Hamburger from './Hamburger.component';

/**
 * Navigation for the application.
 * Includes mobile menu.
 */
const Stickynav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav
      id="footer"
      className="fixed inset-x-0 bottom-0 z-[500] w-full overflow-visible bg-transparent lg:hidden"
    >
      <div
        className="relative mt-0 flex w-full items-center justify-between overflow-hidden bg-blue-800 px-6 py-3"
        style={{ borderTopLeftRadius: '10px', borderTopRightRadius: '10px' }}
      >
        <Hamburger isOpen={isMenuOpen} onOpenChange={setIsMenuOpen} />
        {!isMenuOpen ? (
          <Link
            href="/"
            aria-label="Planenadler Home"
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
          >
            <Image
              src="/Planenadlerlogoweiß.png"
              alt="Planenadler"
              width={220}
              height={58}
              className="h-12 w-auto object-contain sm:h-14"
              priority
            />
          </Link>
        ) : null}
      <div
        className="order-3 hidden w-full md:flex md:items-center md:w-auto md:order-1"
        id="menu"
      >
        <ul className="items-center justify-between pt-4 text-base text-gray-700 md:flex md:pt-0">
          <li>
            <Link href="/produkter">
              <span className="inline-block py-2 pr-4 text-xl font-bold no-underline hover:underline">
                Produkter
              </span>
            </Link>
          </li>
          <li>
            <Link href="/kategorier">
              <span className="inline-block py-2 pr-4 text-xl font-bold no-underline hover:underline">
                Kategorier
              </span>
            </Link>
          </li>
        </ul>
      </div>
      <div
        className="order-2 flex items-center gap-2 transition-opacity md:order-3"
        id="nav-content"
      >
        <Link
          href="/mein-konto"
          aria-label="Mein Konto"
          className="inline-flex h-12 w-12 items-center justify-center rounded-full text-white transition hover:bg-white/10"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
            <circle
              cx="12"
              cy="8"
              r="3.2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            />
            <path
              d="M5 19c1.1-3 3.6-4.6 7-4.6s5.9 1.6 7 4.6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </Link>
        <Cart stickyNav />
      </div>
    </div>
    </nav>
  );
};

export default Stickynav;
