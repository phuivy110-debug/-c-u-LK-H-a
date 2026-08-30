import React from 'react';
import { FAQS } from '../data/faqs';

export const FaqSection: React.FC = () => (
  <section id="faq" className="py-10 bg-white border-y border-slate-100">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-5">
      <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Trước khi mua hàng</h2>
      {FAQS.map(faq => (
        <details key={faq.question} className="border border-slate-200 rounded-2xl p-4 sm:p-5">
          <summary className="font-bold text-slate-800 cursor-pointer">{faq.question}</summary>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
        </details>
      ))}
    </div>
  </section>
);
