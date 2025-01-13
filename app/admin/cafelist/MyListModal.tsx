import { Cafe } from '@prisma/client';
import Form from './Form';

interface MyListModalProps {
  onClose: () => void;
  cafeListItem: Cafe;
}

const MyListModal = ({ onClose, cafeListItem }: MyListModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-lg  rounded-lg relative p-10">
        <button
          className="absolute top-2 right-3 text-3xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
        <Form onClose={onClose} cafeListItem={cafeListItem} />
      </div>
    </div>
  );
};

export default MyListModal;
