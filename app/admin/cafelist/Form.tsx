'use client';

import { Cafe } from '@prisma/client';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

const PREDEFINED_KEYWORDS = [
  'Great Coffee',
  'Great Food',
  'Pastries',
  'Tarts',
  'Cakes',
  'Good Vibe',
  'Good For Groups',
];

type Inputs = {
  name: string;
  address: string;
  mycomment?: string;
  description: string;
  instagram?: string;
  keywords: string[];
};

interface FormProps {
  onClose: () => void;
  cafeListItem: Cafe;
}

const Form = ({ onClose, cafeListItem }: FormProps) => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  const [defaultValues, setDefaultValues] = useState<Inputs>({
    name: cafeListItem.name || '',
    address: cafeListItem.address || '',
    mycomment: cafeListItem.mycomment || '',
    description: cafeListItem.description || '',
    instagram: cafeListItem.instagram || '',
    keywords: [],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Inputs>({ defaultValues });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/list/${cafeListItem.listId}`);
        const data = {
          ...response.data,
          keywords: response.data.keywords || [],
        };
        setDefaultValues(data);
        setSelectedKeywords(response.data.keywords || []);
        reset(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [cafeListItem.listId, reset]);

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords((prev) => {
      if (prev.includes(keyword)) {
        return prev.filter((k) => k !== keyword);
      } else {
        return [...prev, keyword];
      }
    });
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const response = await axios.put(`/api/list`, {
        name: data.name,
        address: data.address,
        listId: cafeListItem.listId,
        description: data.description,
        mycomment: data.mycomment,
        instagram: data.instagram,
        keywords: selectedKeywords,
      });

      setDefaultValues({
        ...response.data,
        keywords: response.data.keywords || [],
      });
      reset(response.data);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  return (
    <form
      className="flex flex-col gap-6 p-6 bg-white shadow-md rounded-lg max-w-md mx-auto"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Previous form fields remain the same */}
      <div className="flex flex-col">
        <label className="mb-2 text-gray-700 font-semibold">Name</label>
        <input
          {...register('name', { required: true, maxLength: 200 })}
          className="border-2 border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
          placeholder="Cafe name"
        />
        {errors.name && (
          <span className="text-red-500 text-sm mt-1">
            Name must be 200 characters or less
          </span>
        )}
      </div>

      <div className="flex flex-col">
        <label className="mb-2 text-gray-700 font-semibold">Address</label>
        <input
          {...register('address', { required: true, maxLength: 200 })}
          className="border-2 border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
          placeholder="Cafe address"
        />
        {errors.address && (
          <span className="text-red-500 text-sm mt-1">
            Address must be 200 characters or less
          </span>
        )}
      </div>

      <div className="flex flex-col">
        <label className="mb-2 text-gray-700 font-semibold">Description</label>
        <input
          {...register('description', { required: true, maxLength: 200 })}
          className="border-2 border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
          placeholder="Cafe description"
        />
        {errors.description && (
          <span className="text-red-500 text-sm mt-1">
            Description must be 200 characters or less
          </span>
        )}
      </div>

      <div className="flex flex-col">
        <label className="mb-2 text-gray-700 font-semibold">My Comment</label>
        <textarea
          {...register('mycomment', { required: true, maxLength: 200 })}
          className="border-2 border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
          placeholder="Your comment... (max 200 characters)"
        />
        {errors.mycomment && (
          <span className="text-red-500 text-sm mt-1">
            Comment must be 200 characters or less
          </span>
        )}
      </div>

      <div className="flex flex-col">
        <label className="mb-2 text-gray-700 font-semibold">Instagram</label>
        <input
          {...register('instagram', { maxLength: 200 })}
          className="border-2 border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
          placeholder="Instagram URL"
        />
        {errors.instagram && (
          <span className="text-red-500 text-sm mt-1">
            Instagram URL must be 200 characters or less
          </span>
        )}
      </div>

      {/* New Keywords Selection */}
      <div className="flex flex-col">
        <label className="mb-2 text-gray-700 font-semibold">Keywords</label>
        <div className="flex flex-wrap gap-2">
          {PREDEFINED_KEYWORDS.map((keyword) => (
            <button
              key={keyword}
              type="button"
              onClick={() => toggleKeyword(keyword)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedKeywords.includes(keyword)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {keyword}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
      >
        Submit
      </button>
    </form>
  );
};

export default Form;
