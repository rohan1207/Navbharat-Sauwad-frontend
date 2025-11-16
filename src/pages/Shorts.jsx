import React from 'react';
import newsData from '../data/newsData.json';

const Shorts = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white text-black text-center py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">शॉर्ट्स</h1>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {newsData.shorts.map((short) => (
            <div
              key={short.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={short.image}
                alt={short.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                  {short.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                  {short.content}
                </p>
                <p className="text-xs text-gray-500">{short.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Shorts;


