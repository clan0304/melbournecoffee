/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import axios from 'axios';
import Image from 'next/image';
import Favicon from '@/app/favicon.ico';
import { useCallback, useMemo } from 'react';
import { FaHeart } from 'react-icons/fa';
import { FaMapMarkerAlt } from 'react-icons/fa';

const BASE_URL_PHOTO =
  'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400';

const ListItem = ({ item, cafeList }: any) => {
  const imageUrl =
    item && item.photos && item.photos.length > 0
      ? `${BASE_URL_PHOTO}&photo_reference=${item.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACE_API_KEY}`
      : Favicon;

  const isSaved = useMemo(() => {
    return cafeList.some(
      (cafeItem: { listId: string }) => cafeItem?.listId === item.place_id
    );
  }, [cafeList, item.place_id]);

  const toggleList = useCallback(async () => {
    try {
      let request;

      if (isSaved) {
        request = async () =>
          await axios.delete('/api/list', {
            data: { id: cafeList.id },
          });
      } else {
        request = async () =>
          await axios.post('/api/list', {
            listId: item.place_id,
            name: item.name,

            address: item.formatted_address,
            img: imageUrl,
          });
      }

      await request();

      await axios.get(`/api/list`);
    } catch (error) {
      console.log(error);
    }
  }, [
    isSaved,
    cafeList.id,
    item.place_id,
    item.name,
    item.formatted_address,
    imageUrl,
  ]);

  return (
    <div className="max-w-[400px] min-h-[400px] w-full h-full border-2 border-black flex flex-col rounded-lg">
      <div className="self-center w-full h-1/2 relative aspect-[16/9] rounded-lg">
        <Image
          src={imageUrl}
          alt="List Image"
          fill
          objectFit="cover"
          className="rounded-md"
        />
        <div className="top-1 right-1 absolute">
          <button type="button" onClick={toggleList}>
            <FaHeart size={25} color={`${isSaved ? 'red' : 'white'}`} />
          </button>
        </div>
      </div>
      <div className="flex flex-col w-full h-1/2 pt-2">
        <p className="font-anton text-xl min-h-[60px] pl-2">{item.name}</p>
        <p className="text-sm flex gap-2 px-2">
          <FaMapMarkerAlt className="pt-1" /> {item.formatted_address}
        </p>
        <div className="flex-grow"></div>
      </div>
    </div>
  );
};

export default ListItem;
