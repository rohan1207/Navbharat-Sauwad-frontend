import React, { useState } from 'react';
import newsData from '../data/newsData.json';

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);

  const categories = [
    { id: 'all', name: 'सर्व' },
    { id: 'csr', name: 'CSR' },
    { id: 'accreditation', name: 'प्रमाणपत्र' },
    { id: 'events', name: 'कार्यक्रम' },
  ];

  const getImages = () => {
    if (selectedCategory === 'all') {
      return [
        ...newsData.gallery.csr.map((img) => ({ ...img, type: 'csr' })),
        ...newsData.gallery.accreditation.map((img) => ({ ...img, type: 'accreditation' })),
        ...newsData.gallery.events.map((img) => ({ ...img, type: 'events' })),
      ];
    }
    return newsData.gallery[selectedCategory].map((img) => ({
      ...img,
      type: selectedCategory,
    }));
  };

  return (
    <div className="min-h-screen bg-subtleGray">
      <section className="bg-cleanWhite text-deepCharcoal py-6 border-b border-subtleGray">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold">गॅलरी</h1>
          <span className="hidden sm:inline text-xs text-metaGray uppercase tracking-wide">
            Photos & Moments
          </span>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-newsRed to-editorialBlue text-cleanWhite'
                  : 'bg-cleanWhite text-slateBody hover:bg-subtleGray border border-subtleGray'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {getImages().map((image) => (
            <div
              key={image.id}
              onClick={() => setSelectedImage(image)}
              className="bg-cleanWhite rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
            >
              <img
                src={image.image}
                alt={image.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-deepCharcoal mb-1">{image.title}</h3>
                <p className="text-sm text-slateBody">{image.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl w-full">
            <img
              src={selectedImage.image}
              alt={selectedImage.title}
              className="w-full rounded-lg"
            />
            <div className="bg-cleanWhite p-4 mt-4 rounded-lg">
              <h3 className="text-xl font-bold text-deepCharcoal mb-2">
                {selectedImage.title}
              </h3>
              <p className="text-slateBody">{selectedImage.date}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;


