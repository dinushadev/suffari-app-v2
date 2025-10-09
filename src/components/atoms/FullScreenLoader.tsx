import React from 'react';
import Loader from './Loader';

const FullScreenLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <Loader />
    </div>
  );
};

export default FullScreenLoader;
