import React from 'react';
import newsData from '../data/newsData.json';

const Shorts = () => {
  return (
    <div className="min-h-screen bg-subtleGray">
      <section className="bg-cleanWhite text-deepCharcoal py-6 border-b border-subtleGray">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold">शॉर्ट्स</h1>
          <span className="hidden sm:inline text-xs text-metaGray uppercase tracking-wide">
            Quick Reads
          </span>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {newsData.shorts.map((short) => (
            <div
              key={short.id}
              className="bg-cleanWhite rounded-lg border border-subtleGray/80 overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <img
                src={short.image}
                alt={short.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-bold text-deepCharcoal mb-2 line-clamp-2">
                  {short.title}
                </h3>
                <p className="text-sm text-slateBody mb-2 line-clamp-3">
                  {short.content}
                </p>
                <p className="text-xs text-metaGray">{short.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Shorts;


