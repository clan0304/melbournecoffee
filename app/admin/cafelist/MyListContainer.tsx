import { Cafe } from '@prisma/client';
import React from 'react';
import MyListItem from './MyListItem';

interface MyListContainerProps {
  cafeList: Cafe[];
}

const MyListContainer = ({ cafeList }: MyListContainerProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {cafeList.map((item: Cafe) => (
        <div key={item.id} className="flex justify-center sm:justify-start">
          <MyListItem cafeListItem={item} />
        </div>
      ))}
    </div>
  );
};

export default MyListContainer;
