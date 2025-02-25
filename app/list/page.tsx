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
      const lists = await axios.get('/api/list');
      const data = lists.data;
      const shuffledData = shuffleArray(data);
      setCafeList(shuffledData);
      setFilteredCafes(shuffledData); // Initially show all cafes
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
