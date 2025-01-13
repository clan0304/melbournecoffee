'use client';

import { Cafe } from '@prisma/client';
import axios from 'axios';

import { useEffect, useState } from 'react';

import { SubmitHandler, useForm } from 'react-hook-form';

type Inputs = {
  mycomment: string;
  description: string;
  instagram?: string;
};

interface FormProps {
  onClose: () => void;
  cafeListItem: Cafe;
}

const Form = ({ onClose, cafeListItem }: FormProps) => {
  console.log(cafeListItem);
  const [defaultValues, setDefaultValues] = useState<Inputs>({
    mycomment: cafeListItem.mycomment || '',
    description: cafeListItem.description || '',
    instagram: cafeListItem.instagram || '',
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
        setDefaultValues(response.data);
        reset(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [cafeListItem.listId, reset]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log(data);
    try {
      const response = await axios.put(`/api/list`, {
        listId: cafeListItem.listId,
        description: data.description,
        mycomment: data.mycomment,
        instagram: data.instagram,
      });

      setDefaultValues(response.data);
      reset(response.data);

      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <form
      className="flex flex-col gap-6 p-6 bg-white shadow-md rounded-lg max-w-md mx-auto"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col">
        <label className="mb-2 text-gray-700 font-semibold">Description</label>
        <input
          {...register('description', { required: true, maxLength: 200 })}
          className="border-2 border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
          placeholder="Rate out of 5"
        />
        {errors.description && (
          <span className="text-red-500 text-sm mt-1">
            Comment must be 200 characters or less
          </span>
        )}
      </div>

      <div className="flex flex-col">
        <label className="mb-2 text-gray-700 font-semibold">My Comment</label>
        <textarea
          {...register('mycomment', { required: true, maxLength: 200 })}
          className="border-2 border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
          placeholder="Your comment... (max 50 characters)"
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
          placeholder="Instagram Url"
        />
        {errors.instagram && (
          <span className="text-red-500 text-sm mt-1"></span>
        )}
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
