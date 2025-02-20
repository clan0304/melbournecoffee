'use client';

import { Cafe } from '@prisma/client';
import axios from 'axios';
import React, { useState } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import MyListModal from './MyListModal';

interface MyListItemProps {
  cafeListItem: Cafe;
}

const MyListItem = ({ cafeListItem }: MyListItemProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const deleteList = async () => {
    try {
      await axios.delete('/api/list', {
        data: { id: cafeListItem.id },
      });

      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="max-w-[400px] min-h-[400px] w-full h-full border-2 border-black flex flex-col rounded-lg">
      <div className="flex flex-col w-full h-1/2 pt-2">
        {cafeListItem.name && (
          <p className="font-anton text-xl min-h-[60px] pl-2">
            {cafeListItem.name}
          </p>
        )}

        {cafeListItem.address && (
          <p className="text-sm flex gap-2 px-2">
            <FaMapMarkerAlt className="pt-1" /> {cafeListItem.address}
          </p>
        )}

        <div className="flex-grow"></div>
        <div>
          <button
            className=" bg-green-500 w-full py-1 hover:opacity-70 font-semibold text-white"
            onClick={() => setIsModalOpen(true)}
          >
            Edit
          </button>
          <button
            className=" bg-red-500 w-full py-1 rounded-b-md hover:opacity-70 font-semibold text-white"
            onClick={deleteList}
          >
            Delete
          </button>
        </div>
        {isModalOpen && (
          <MyListModal
            cafeListItem={cafeListItem}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default MyListItem;
