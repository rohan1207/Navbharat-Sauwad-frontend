import React from 'react';
import { Link } from 'react-router-dom';
import newsData from '../data/newsData.json';

const Blogs = () => {
  return (
    <div className="min-h-screen bg-subtleGray">
      <section className="bg-cleanWhite text-deepCharcoal py-6 border-b border-subtleGray">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold">ब्लॉग</h1>
          <span className="hidden sm:inline text-xs text-metaGray uppercase tracking-wide">
            Voices & Columns
          </span>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsData.blogs.map((blog) => (
            <Link
              key={blog.id}
              to={`/blog/${blog.id}`}
              className="bg-cleanWhite rounded-lg border border-subtleGray/80 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col"
            >
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-deepCharcoal mb-2 line-clamp-2">
                  {blog.title}
                </h3>
                <p className="text-sm text-slateBody mb-3 line-clamp-3">
                  {blog.content}
                </p>
                <div className="flex justify-between items-center text-xs text-metaGray">
                  <span>{blog.author}</span>
                  <span>{blog.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Blogs;


