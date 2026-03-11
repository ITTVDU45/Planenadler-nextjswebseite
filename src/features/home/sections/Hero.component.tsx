import Image from 'next/image';
import Button from '@/shared/ui/Button.component';
import { PLACEHOLDER_IMAGE_DATA_URL } from '@/shared/lib/functions';

/**
 * Hero-Bild: Eigenes Bild unter public/images/hero.jpg ablegen, dann hier
 * src auf "/images/hero.jpg" umstellen. Sonst wird der Placeholder genutzt.
 */
const HERO_IMAGE_SRC =
  process.env.NEXT_PUBLIC_PLACEHOLDER_LARGE_IMAGE_URL ||
  PLACEHOLDER_IMAGE_DATA_URL;

/**
 * Renders Hero section for Index page
 * @function Hero
 * @returns {JSX.Element} - Rendered component
 */
const Hero = () => (
  <section className="relative w-full h-[50vh] min-h-[280px] max-h-[420px] overflow-hidden">
    {/* Bild und dunkler Overlay – untere Ebene */}
    <div className="absolute inset-0 z-0">
      <Image
        src={HERO_IMAGE_SRC}
        alt="Hero image"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover object-center"
        quality={90}
      />
      <div className="absolute inset-0 bg-black/30" aria-hidden />
    </div>
    {/* Titel und Button – darüber, damit sie lesbar sind */}
    <div className="relative z-10 h-full container mx-auto flex items-center p-4 md:p-6">
      <div className="max-w-xl">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-6 drop-shadow-md">
          Stripete Zig Zag Pute Sett
        </h1>
        <Button
          href="/produkter"
          variant="hero"
        >
          Se Utvalget
        </Button>
      </div>
    </div>
  </section>
);

export default Hero;
