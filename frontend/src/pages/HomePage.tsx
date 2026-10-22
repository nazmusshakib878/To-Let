import React from 'react';
import { SearchPage } from './SearchPage';

// HomePage defaults to the primary SearchPage view in this single-page To-Let architecture
export const HomePage: React.FC<React.ComponentProps<typeof SearchPage>> = (props) => {
  return <SearchPage {...props} />;
};

export default HomePage;
