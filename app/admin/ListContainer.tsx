/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import ListItem from './ListItem';

const ListContainer = ({ lists, cafeList }: any) => {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-10 px-2">
      {lists.map((item: any) => (
        <div
          key={item.place_id}
          className="flex justify-center sm:justify-start"
        >
          <ListItem item={item} cafeList={cafeList} />
        </div>
      ))}
    </div>
  );
};

export default ListContainer;
