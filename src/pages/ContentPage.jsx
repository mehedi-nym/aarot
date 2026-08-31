import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchContentPage } from '../lib/queries';

const fallbackTitles = {
  about: 'আমাদের সম্পর্কে',
  policy: 'নীতিমালা',
};

function applyPageMeta(page, language) {
  if (!page) return;

  const title =
    language === 'bn' ? page.seo_title_bn || page.title_bn : page.seo_title_en || page.title_en;
  const description =
    language === 'bn' ? page.seo_description_bn : page.seo_description_en || page.seo_description_bn;

  if (title) {
    document.title = `${title} | আড়ৎ`;
  }

  if (description) {
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
  }
}

function ContentPage() {
  const location = useLocation();
  const slug = location.pathname.replace(/^\/+/, '') || 'about';
  const [language, setLanguage] = useState('bn');
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    const loadPage = async () => {
      setLoading(true);
      const data = await fetchContentPage(slug);
      if (!isCurrent) return;
      setPage(data);
      setLoading(false);
    };

    loadPage();

    return () => {
      isCurrent = false;
    };
  }, [slug]);

  useEffect(() => {
    applyPageMeta(page, language);
  }, [language, page]);

  const title = page
    ? language === 'bn'
      ? page.title_bn
      : page.title_en || page.title_bn
    : fallbackTitles[slug] || 'পৃষ্ঠা';
  const body = page
    ? language === 'bn'
      ? page.body_bn
      : page.body_en || page.body_bn
    : '';

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Link
        to="/"
        className="inline-flex rounded-full border border-brand-100 bg-white/80 px-4 py-2 text-xs font-black text-brand-700 transition hover:bg-white"
      >
        বাজারে ফিরুন
      </Link>

      <article className="section-shell mt-6 overflow-hidden">
        <div className="border-b border-brand-50 bg-brand-50/70 px-5 py-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-brand-600">
                Aarot
              </p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-ink sm:text-4xl">
                {title}
              </h1>
            </div>

            <div className="inline-flex w-fit rounded-full border border-brand-100 bg-white p-1">
              {[
                { id: 'bn', label: 'বাংলা' },
                { id: 'en', label: 'English' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLanguage(item.id)}
                  className={`rounded-full px-4 py-2 text-xs font-black transition ${
                    language === item.id
                      ? 'bg-brand-600 text-white'
                      : 'text-brand-700 hover:bg-brand-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          {loading ? (
            <div className="space-y-3">
              <div className="h-4 w-2/3 rounded-full bg-brand-100" />
              <div className="h-4 w-full rounded-full bg-brand-100" />
              <div className="h-4 w-5/6 rounded-full bg-brand-100" />
            </div>
          ) : page ? (
            <div className="space-y-5 text-base font-semibold leading-8 text-slate-700">
              {body.split('\n').filter(Boolean).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm font-bold text-slate-500">
              এই পেজের কনটেন্ট এখনো প্রকাশ করা হয়নি।
            </p>
          )}
        </div>
      </article>
    </div>
  );
}

export default ContentPage;
