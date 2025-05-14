import React from 'react';
import { FaSearch } from 'react-icons/fa';

interface SearchFieldProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
}

const SearchField: React.FC<SearchFieldProps> = ({
  placeholder = 'Search...',
  value,
  onChange,
  onSearch,
}) => {
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  return (
    <div className="flex items-center border-gray-400 border rounded-xl h-8 px-3 py-2">
      <input
        type="text"
        className="flex-grow outline-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      {onSearch && (
        <button onClick={onSearch} className="ml-2">
          <FaSearch className='hover:to-black'color='gray'/>
        </button>
      )}
    </div>
  );
};

export default SearchField;
