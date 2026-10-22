import React from 'react';
import { bn } from '../../utils/bengali';
import { SORT_OPTIONS } from '../../constants/areas';

interface ListingSortBarProps {
  count: number;
  currentSort: 'rent' | 'new';
  onSortChange: (sort: 'rent' | 'new') => void;
}

export const ListingSortBar: React.FC<ListingSortBarProps> = ({
  count,
  currentSort,
  onSortChange,
}) => {
  return (
    <div className="bar">
      <div className="count" id="count">
        {count > 0 ? `${bn(count)}টি বাসা পাওয়া গেছে` : ''}
      </div>

      <select
        id="sort"
        aria-label="সাজান"
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value as 'rent' | 'new')}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
