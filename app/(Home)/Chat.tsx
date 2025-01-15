'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import Instagram from '@/public/assets/instagram.png';
import Image from 'next/image';

type Cafe = {
  listId: string;
  name: string;
  description: string;
  relevanceScore: number;
  instagram: string;
};

export const CafeSearch = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [cafes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: input }],
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setCafes(data);
    } catch (error) {
      setError(`${error} Something went wrong. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setCafes([]);
    setInput('');
    setError(null);
    setHasSearched(false);
  };

  return (
    <div className="flex flex-col gap-3 pt-20 px-10">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <button
          type="button"
          onClick={clearResults}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <FaTrash />
        </button>
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Search cafes..."
          ref={inputRef}
          className="flex-1 p-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={isLoading}
        >
          Search
        </button>
      </form>

      {hasSearched && (
        <div
          ref={scrollRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 auto-rows-fr"
        >
          {cafes.map((cafe) => (
            <div key={cafe.listId} className="h-full">
              <CafeCard cafe={cafe} />
            </div>
          ))}

          {isLoading && (
            <div className="p-4 bg-gray-100 rounded">
              Searching for cafes...
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>
          )}

          {!error && cafes.length === 0 && !isLoading && (
            <div className="col-span-full flex items-center justify-center gap-3 text-gray-500">
              No cafes found. Try another search.
            </div>
          )}
        </div>
      )}

      {!hasSearched && (
        <div className="flex h-full items-center justify-center gap-3 text-gray-500">
          Search for cafes using AI...
        </div>
      )}
    </div>
  );
};

const CafeCard = ({ cafe }: { cafe: Cafe }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col ${
        isExpanded ? 'h-auto' : 'h-64'
      }`}
    >
      <div className="p-6 flex flex-col h-full">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
          {cafe.name}
        </h3>
        <div className="flex flex-col flex-grow">
          <p
            className={`text-gray-600 mb-2 ${isExpanded ? '' : 'line-clamp-3'}`}
          >
            {cafe.description}
          </p>
          {cafe.description.split(' ').length > 20 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium mb-2"
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>
        <div className="flex items-center justify-between mt-auto pt-4">
          <Link
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
              cafe.name
            )}`}
            className="inline-block"
          >
            <button className="bg-black text-white font-semibold px-4 py-2 rounded-full transition-colors duration-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50">
              Find Direction
            </button>
          </Link>
          {cafe.instagram && (
            <Link href={cafe.instagram}>
              <Image
                src={Instagram}
                alt="Instagram"
                width={40}
                height={40}
                className="w-10 h-10"
              />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
export default CafeSearch;
