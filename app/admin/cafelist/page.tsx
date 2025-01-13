'use client';

import { Cafe } from '@prisma/client';
import axios from 'axios';
import { useEffect, useState } from 'react';
import MyListContainer from './MyListContainer';

const CafeListPage = () => {
  const [cafeList, setCafeList] = useState<Cafe[]>([]);

  useEffect(() => {
    const getCafeList = async () => {
      const list = await axios.get('/api/list');
      setCafeList(list.data);
    };

    getCafeList();
  }, []);

  return <MyListContainer cafeList={cafeList} />;
};

export default CafeListPage;
