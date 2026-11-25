import React from 'react';
import { FAQS } from '../data/faqs';

export const FaqSection: React.FC = () => (
  <section id="faq" className="py-10 bg-[#111827] border-y border-slate-800">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-5">
      <div>
        <div className="text-xs font-extrabold uppercase tracking-wider text-[#FACC15] mb-1">
          Giải đáp nhanh
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
          Câu hỏi thường gặp trước khi đặt hàng
        </h2>
      </div>
      <div className="space-y-3">
        {FAQS.map((faq) => (
          <details
            key={faq.question}
            className="border border-slate-800 bg-[#0F172A] rounded-2xl p-4 sm:p-5 group"
          >
            <summary className="font-bold text-white cursor-pointer flex items-center justify-between gap-3">
              <span>{faq.question}</span>
              <span className="text-[#FACC15] text-xs font-bold shrink-0">+</span>
            </summary>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
);
