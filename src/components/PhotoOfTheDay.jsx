import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

const PhotoOfTheDay = () => {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const data = await apiFetch('/photo-of-the-day/today', {
          timeout: 10000, // 10 second timeout
          useCache: true,
          cacheTTL: 10 * 60 * 1000 // 10 min cache (photo changes daily)
        });
        if (data && data.image) {
          setPhoto(data);
          // Track view in background (silently fail)
          if (data._id) {
            apiFetch(`/photo-of-the-day/${data._id}/views`, { 
              method: 'POST',
              timeout: 5000 // Short timeout for tracking
            }).catch(() => {
              // Silently fail - tracking is not critical
            });
          }
        }
      } catch (error) {
        // Silently fail - photo is not critical
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();
  }, []);

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (!photo || !photo.image) {
    return null; // Don't show if no photo
  }

  return (
    <section className="mb-10">
      <div className="bg-cleanWhite rounded-lg overflow-hidden shadow-lg border border-subtleGray/70">
        {/* Header */}
        <div className="px-6 py-4 border-b border-subtleGray/50 bg-gradient-to-r from-newsRed/5 to-editorialBlue/5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-gradient-to-b from-newsRed to-editorialBlue rounded-full"></div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-deepCharcoal">
                आजचे फोटो
              </h2>
              <p className="text-xs text-metaGray mt-0.5">
                Photo of the Day
              </p>
            </div>
            {photo.date && (
              <div className="ml-auto">
                <span className="text-xs font-semibold text-newsRed bg-newsRed/10 px-3 py-1 rounded-full">
                  {new Date(photo.date).toLocaleDateString('mr-IN', { 
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Photo */}
        <div className="relative group overflow-hidden">
          <img
            src={photo.image}
            alt={photo.caption || 'Photo of the Day'}
            className="w-full h-[400px] md:h-[500px] lg:h-[600px] object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Caption Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="max-w-4xl">
              <p className="text-lg md:text-xl lg:text-2xl font-semibold text-cleanWhite mb-2 leading-relaxed drop-shadow-lg">
                {photo.caption}
              </p>
              {(photo.photographer || photo.location) && (
                <div className="flex items-center gap-4 text-sm text-cleanWhite/80">
                  {photo.photographer && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {photo.photographer}
                    </span>
                  )}
                  {photo.location && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {photo.location}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PhotoOfTheDay;

