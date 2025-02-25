'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Coffee, MapPin } from 'lucide-react';
import Instagram from '@/public/assets/instagram.png';
import Google from '@/public/assets/google.png';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';

type Cafe = {
  listId: string;
  name: string;
  instagram: string;
  keywords: string[];
  address: string;
  mycomment: string;
};

const ListPage = () => {
  const [cafeList, setCafeList] = useState<Cafe[]>([]);
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([]);
  const [filters, setFilters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const filterOptions = [
    'Great Coffee',
    'Great Food',
    'Pastries',
    'Tarts',
    'Cakes',
    'Good Vibe',
    'Good For Groups',
  ];

  const shuffleArray = (array: Cafe[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const getLists = async () => {
      setIsLoading(true);
      const lists = await axios.get('/api/list');
      const data = lists.data;
      const shuffledData = shuffleArray(data);
      setCafeList(shuffledData);
      setFilteredCafes(shuffledData);
      setIsLoading(false);
    };
    getLists();
  }, []);

  // Update filtered cafes whenever filters change
  useEffect(() => {
    if (filters.length === 0) {
      setFilteredCafes(cafeList); // If no filters are selected, show all cafes
    } else {
      const filtered = cafeList.filter((cafe) =>
        filters.some((filter) => cafe.keywords.includes(filter))
      );
      setFilteredCafes(filtered);
    }
  }, [filters, cafeList]);

  // Handle filter toggle
  const handleFilterToggle = (filter: string) => {
    setFilters((prevFilters) =>
      prevFilters.includes(filter)
        ? prevFilters.filter((f) => f !== filter)
        : [...prevFilters, filter]
    );
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters([]);
  };

  // Prevent menu from closing on checkbox click
  const handleCheckboxSelect = (e: Event) => {
    e.preventDefault();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-16 h-16 text-gray-200 animate-spin fill-indigo-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-10">
        {/* Shadcn Dropdown Menu on the Right */}
        <div className="flex justify-end mb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-40">
                {filters.length > 0
                  ? `${filters.length} filter${filters.length > 1 ? 's' : ''}`
                  : 'Filter'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {filterOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option}
                  checked={filters.includes(option)}
                  onCheckedChange={() => handleFilterToggle(option)}
                  onSelect={handleCheckboxSelect}
                >
                  {option}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleClearFilters}
                onSelect={handleCheckboxSelect}
                className="cursor-pointer flex justify-center clear-filters-item font-semibold" // Unique class
              >
                Clear Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Cafe Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCafes.map((cafe) => (
            <Card
              key={`${cafe.listId}-${cafe.name}`}
              className="bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md flex flex-col"
            >
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex items-center mb-3 min-h-[32px]">
                  <Coffee className="h-5 w-5 text-gray-500 mr-2" />
                  <h3 className="text-lg font-bold text-gray-800 line-clamp-1">
                    {cafe.name}
                  </h3>
                </div>

                <div className="mb-4 min-h-[50px] flex items-start">
                  <div className="flex flex-wrap gap-1">
                    {cafe.keywords.map((keyword, index) => (
                      <p
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs"
                      >
                        {keyword}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="min-h-[20px]">
                  <p className="text-[12px] pb-2">{cafe.address}</p>
                </div>

                <div className="mt-auto pt-3 border-t border-gray-200 flex items-center justify-between">
                  <Link
                    href={`https://www.google.com/maps/dir/?api=1&destination=${cafe.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="secondary"
                      className="gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs px-2 py-1"
                    >
                      <MapPin className="h-3 w-3" />
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListPage;
