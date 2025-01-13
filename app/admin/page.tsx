/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import SearchBar from './SearchBar';
import ListContainer from './ListContainer';
import Link from 'next/link';
import { Cafe } from '@prisma/client';

export default function AdminPage() {
  const [googleLists, setGoogleLists] = useState<any[]>([]);
  const [cafeList, setCafeList] = useState<Cafe[]>([]);

  useEffect(() => {
    getGoogleLists('Cafe in Melbourne');
  }, []);

  const getGoogleLists = async (value: string) => {
    const res = await axios.get(`/api/google-place-api?q=${value}`);
    setGoogleLists(res.data.resp.results);
  };

  useEffect(() => {
    const getCafeList = async () => {
      const response = await axios.get('/api/list');
      setCafeList(response.data);
    };

    getCafeList();
  }, []);

  return (
    <section className="flex flex-col w-full h-full">
      <SearchBar userInput={(value: string) => getGoogleLists(value)} />
      <Link href="/admin/cafelist">
        <div className="flex justify-end pr-2">
          <button className="bg-slate-900 rounded-lg px-5 py-1 text-white font-semibold">
            Check Cafe List
          </button>
        </div>
      </Link>
      <ListContainer lists={googleLists} cafeList={cafeList} />
    </section>
  );
}
