import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

const normalizeMediaUrl = (value) => {
  const rawValue = String(value || '').trim();
  const markdownMatch = rawValue.match(/\[[^\]]*\]\((https?:\/\/[^)]+)\)/i);
  return markdownMatch?.[1] || rawValue;
};

const getSessionKey = (banner, mediaUrl) =>
  `aarot-promo-seen-${banner?.id || mediaUrl || 'default'}`;

function PromotionalPopup({ banners = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  const banner = useMemo(() => banners[0] || null, [banners]);
  const mediaUrl = normalizeMediaUrl(
    banner?.media_url || banner?.image_url || banner?.video_url || banner?.banner_url
  );

  useEffect(() => {
    if (!banner || !mediaUrl || typeof window === 'undefined') {
      setIsOpen(false);
      return;
    }

    const sessionKey = getSessionKey(banner, mediaUrl);
    const hasSeenPromo = sessionStorage.getItem(sessionKey) === 'true';

    if (hasSeenPromo) {
      setIsOpen(false);
      return;
    }

    sessionStorage.setItem(sessionKey, 'true');
    setIsOpen(true);
  }, [banner, mediaUrl]);

  const isVideo = banner?.media_type === 'video' || /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(mediaUrl);
  const targetUrl = banner?.target_url || banner?.cta_link;
  const altText = banner?.alt_text_bn || banner?.alt_text_en || 'Promotional Banner';

  if (!banner || !mediaUrl) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[180] bg-black/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />

          {/* Dialog Container */}
          <div className="fixed inset-0 z-[190] flex items-center justify-center p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl shadow-2xl bg-black"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Close Button Overlay */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/90 hover:scale-105"
                aria-label="Close modal"
              >
                ✕
              </button>

              {/* Video Player */}
              {isVideo ? (
                <video
                  src={mediaUrl}
                  className="max-h-[65vh] w-auto max-w-full object-contain"
                  controls
                  autoPlay
                  muted
                  playsInline
                  title={altText}
                />
              ) : targetUrl ? (
                /* Clickable Image */
                <a href={targetUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <img
                    src={mediaUrl}
                    alt={altText}
                    className="max-h-[65vh] w-auto max-w-full object-contain"
                  />
                </a>
              ) : (
                /* Standard Image */
                <img
                  src={mediaUrl}
                  alt={altText}
                  className="max-h-[65vh] w-auto max-w-full object-contain"
                />
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default PromotionalPopup;
