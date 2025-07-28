"use client";

import React from 'react';
import Image from 'next/image';

export interface ResourceLocationCardProps {
  name: string;
  thumbnail: string;
  description: string;
  onClick?: () => void;
}

const ResourceLocationCard: React.FC<ResourceLocationCardProps> = ({ name, thumbnail, description, onClick }) => {
  return (
    <div
      className="bg-white rounded shadow p-4 flex flex-col cursor-pointer hover:shadow-lg transition"
      onClick={onClick}
    >
      <Image
        src={thumbnail}
        alt={name}
        width={320}
        height={160}
        className="w-full h-40 object-cover rounded mb-2"
      />
      <h2 className="text-lg font-semibold mb-1">{name}</h2>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

export default ResourceLocationCard; 