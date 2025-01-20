'use client';

import { Cafe } from '@prisma/client';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm, useFieldArray } from 'react-hook-form';

type Inputs = {
  mycomment: string;
  description: string;
  instagram?: string;
  keywords: { value: string }[];
};

interface FormProps {
  onClose: () => void;
  cafeListItem: Cafe;
}

const Form = ({ onClose, cafeListItem }: FormProps) => {
  const [defaultValues, setDefaultValues] = useState<Inputs>({
    mycomment: cafeListItem.mycomment || '',
    description: cafeListItem.description || '',
    instagram: cafeListItem.instagram || '',
    keywords: [{ value: '' }], // Start with one empty field
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
  } = useForm<Inputs>({ defaultValues });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'keywords',
  });

  // Watch keywords to check their values
  const keywords = watch('keywords');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/list/${cafeListItem.listId}`);
        const data = {
          ...response.data,
          keywords: response.data.keywords?.length
            ? response.data.keywords.map((keyword: string) => ({
                value: keyword,
              }))
            : [{ value: '' }], // Ensure at least one empty field
        };
        setDefaultValues(data);
        reset(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [cafeListItem.listId, reset]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const keywords = data.keywords
        .map((k) => k.value)
        .filter((value) => value.trim() !== '');

      const response = await axios.put(`/api/list`, {
        address: cafeListItem.address,
        listId: cafeListItem.listId,
        description: data.description,
        mycomment: data.mycomment,
        instagram: data.instagram,
        keywords: keywords,
      });

      setDefaultValues({
        ...response.data,
        keywords: response.data.keywords?.length
          ? response.data.keywords.map((keyword: string) => ({
              value: keyword,
            }))
          : [{ value: '' }],
      });
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
      {/* Description Field */}
      <div className="flex flex-col">
        <label className="mb-2 text-gray-700 font-semibold">Description</label>
        <input
          {...register('description', { required: true, maxLength: 200 })}
          className="border-2 border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
          placeholder="Rate out of 5"
        />
        {errors.description && (
          <span className="text-red-500 text-sm mt-1">
            Description must be 200 characters or less
          </span>
        )}
      </div>

      {/* My Comment Field */}
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

      {/* Instagram Field */}
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

      {/* Keywords Field */}
      <div className="flex flex-col">
        <label className="mb-2 text-gray-700 font-semibold">Keywords</label>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(`keywords.${index}.value` as const, {
                  maxLength: 50,
                })}
                className="flex-1 border-2 border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter keyword"
              />
              <div className="flex gap-2">
                {/* Show Add button if there are fewer than 5 fields and current field has a value */}
                {keywords[index]?.value.trim() !== '' && fields.length < 5 && (
                  <button
                    type="button"
                    onClick={() => append({ value: '' })}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Add
                  </button>
                )}
                {/* Show Remove button if there's more than one field and current field has a value */}
                {keywords[index]?.value.trim() !== '' && fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
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
