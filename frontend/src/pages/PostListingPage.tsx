import React from 'react';
import { PostListingForm } from '../components/forms/PostListingForm';

interface PostListingPageProps {
  onSuccess: (listingId: number, deletionToken: string) => void;
  showToast: (msg: string) => void;
}

export const PostListingPage: React.FC<PostListingPageProps> = ({
  onSuccess,
  showToast,
}) => {
  return (
    <section id="post" role="tabpanel" aria-labelledby="t2">
      <PostListingForm onSuccess={onSuccess} onErrorToast={showToast} />
    </section>
  );
};
