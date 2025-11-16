import React from 'react';
import { Link } from 'react-router-dom';
import newsData from '../data/newsData.json';

const Articles = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white text-black text-center py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">लेख</h1>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsData.articles.map((article) => (
            <Link
              key={article.id}
              to={`/article/${article.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {article.content}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{article.author}</span>
                  <span>{article.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Articles;


