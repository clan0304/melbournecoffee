'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Trash2, MapPin, Coffee } from 'lucide-react';
import Instagram from '@/public/assets/instagram.png';
import Google from '@/public/assets/google.png';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';

type Cafe = {
  listId: string;
  name: string;
  description: string;
  relevanceScore: number;
  instagram: string;
  keywords: string[];
  address: string;
};

type Message = {
  role: 'user';
  content: string;
};

export const CafeSearch = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionId(uuidv4());
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [cafes]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'; // Reset height
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`; // Adjust to content
    }
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Clear previous results immediately
    setCafes([]);
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    const newMessage = { role: 'user' as const, content: input };
    const updatedMessages = [...messages, newMessage];

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages, sessionId }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        return;
      }

      // Ensure we only show maximum 6 cafes
      const cafeResults = data.results || data;
      setCafes(cafeResults.slice(0, 6));
      setMessages(updatedMessages);
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
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-3xl sm:text-5xl font-bold text-center mb-4">
          Find Your Perfect Cafe
        </h1>
        <p className="text-gray-500 text-center text-[13px] sm:text-xl lg:text-2xl">
          Discover, explore, and navigate to the best cafes near you.
        </p>
        <p className="text-red-500 text-center text-[11px] sm:text-md mb-16">
          (We currently provide cafes only in the Melbourne area.)
        </p>

        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative mb-12">
            <div className="relative bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col border border-gray-200 hover:border-gray-400 overflow-hidden">
              <Textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Let me recommend you cafes!"
                ref={inputRef}
                className="w-full bg-transparent border-0 focus-visible:ring-0 text-gray-800 placeholder:text-gray-400 resize-none min-h-[48px]"
                style={{ overflow: 'hidden' }} // Hide scrollbar
              />
              <div className="flex justify-end gap-2 py-2 pr-2 bg-white">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={clearResults}
                  className="text-gray-600 hover:opacity-50"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gray-800 text-white hover:bg-gray-700 font-bold"
                >
                  Search
                </Button>
              </div>
            </div>
            {isLoading && (
              <p className="text-gray-500 text-center mt-4">Searching...</p>
            )}
          </form>

          {hasSearched && !isLoading && (
            <div ref={scrollRef} className="grid grid-cols-1 ">
              {cafes.length > 0 ? (
                cafes.map((cafe) => (
                  <CafeCard key={`${cafe.listId}-${cafe.name}`} cafe={cafe} />
                ))
              ) : error ? (
                <Card className="col-span-full bg-red-100 border-red-200">
                  <CardContent className="p-6 text-center text-red-600">
                    {error}
                  </CardContent>
                </Card>
              ) : (
                <div className="col-span-full text-center text-gray-500">
                  No cafes found. Try another search.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CafeCard = ({ cafe }: { cafe: Cafe }) => {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <Coffee className="h-6 w-6 text-gray-500 mr-3" />
          <h3 className="text-lg md:text-xl xl:text-2xl font-bold text-gray-800 line-clamp-1">
            {cafe.name}
          </h3>
        </div>

        <div className="mb-6 min-h-[60px]">
          <div className="flex flex-wrap gap-2">
            {cafe.keywords.map((keyword, index) => (
              <p
                key={index}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {keyword}
              </p>
            ))}
          </div>
        </div>
        <div className="min-h-[20px]">
          <p className="text-[12px] md:text-[16px] lg:text-lg pb-2 text-black italic">
            {cafe.address}
          </p>
        </div>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200">
          <Link
            href={`https://www.google.com/maps/dir/?api=1&destination=${cafe.address}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="secondary"
              className="gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              <MapPin className="h-4 w-4" />
              Directions
            </Button>
          </Link>
          <div className="flex gap-2 items-center">
            {cafe.instagram && (
              <Link
                href={cafe.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src={Instagram}
                  alt="instagram"
                  height={25}
                  width={25}
                  className="hover:scale-110"
                />
              </Link>
            )}
            <Link
              href={`https://www.google.com/search?q=${encodeURIComponent(
                cafe.name
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={Google}
                alt="google"
                height={20}
                width={20}
                className="hover:scale-110"
              />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CafeSearch;
