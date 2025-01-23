'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Trash2, Instagram, ExternalLink, MapPin, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

type Cafe = {
  listId: string;
  name: string;
  description: string;
  relevanceScore: number;
  instagram: string;
  keywords: string[];
  address: string;
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
    <div className="min-h-screen bg-gradient-to-b to-slate-950 from-slate-900 text-white">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold text-center mb-4">
          Find Your Perfect Cafe
        </h1>
        <p className="text-zinc-400 text-center text-xl">
          Discover, explore, and navigate to the best cafes near you.
        </p>
        <p className="text-zinc-300 text-center text-md mb-16">
          (We currently provide cafes only in the Melbourne area.)
        </p>

        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative mb-12">
            <div className="relative items-center flex gap-2 p-1 bg-zinc-800/70 rounded-lg backdrop-blur-sm">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearResults}
                className="text-zinc-400 hover:text-zinc-100"
              >
                <Trash2 className="h-5 w-5" color="white" />
              </Button>
              <Textarea
                value={input}
                onChange={handleInputChange}
                placeholder="I will recommend you the best cafe for you!"
                ref={inputRef}
                className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-zinc-100 placeholder:text-zinc-500 resize-none"
                rows={1}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-white hover:opacity-70 text-slate-900 font-bold"
              >
                Search
              </Button>
            </div>
          </form>

          {hasSearched && (
            <div
              ref={scrollRef}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {cafes.map((cafe) => (
                <CafeCard key={cafe.listId} cafe={cafe} />
              ))}

              {isLoading && (
                <Card className="col-span-full bg-zinc-800/50 border-zinc-700">
                  <CardContent className="p-6 text-center text-zinc-400">
                    Searching for cafes...
                  </CardContent>
                </Card>
              )}

              {error && (
                <Card className="col-span-full bg-red-900/20 border-red-800">
                  <CardContent className="p-6 text-center text-red-400">
                    {error}
                  </CardContent>
                </Card>
              )}

              {!error && cafes.length === 0 && !isLoading && (
                <div className="col-span-full text-center text-zinc-400">
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
    <Card className="bg-zinc-800/50 border-zinc-700 backdrop-blur-sm transition-all">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <Coffee className="h-6 w-6 text-zinc-400 mr-3" />
          <h3 className="text-2xl font-bold text-zinc-100 line-clamp-1">
            {cafe.name}
          </h3>
        </div>

        <div className="mb-6 min-h-[100px]">
          <div className="flex flex-wrap gap-2">
            {cafe.keywords.map((keyword, index) => (
              <p
                key={index}
                className="bg-white text-zinc-700 px-5 py-1 rounded-full"
              >
                {keyword}
              </p>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-700">
          <Link
            href={`https://www.google.com/maps/dir/?api=1&destination=${cafe.address}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" className="gap-2">
              <MapPin className="h-4 w-4" />
              Directions
            </Button>
          </Link>
          <div className="flex gap-2">
            {cafe.instagram && (
              <Link
                href={cafe.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-pink-400 hover:text-pink-300 hover:bg-pink-400/20"
                >
                  <Instagram className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <Link
              href={`https://www.google.com/search?q=${encodeURIComponent(
                cafe.name
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
              >
                <ExternalLink className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CafeSearch;
