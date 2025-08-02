import Image, { ImageProps } from 'next/image';
import React, { useState } from 'react';

const PLACEHOLDER_SRC = '/images/placeholder.svg';

const CustomImage = (props: ImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const { fill, className, src, ...rest } = props;

  // Use placeholder if src is empty or error occurred
  const imageSrc = !src || error ? PLACEHOLDER_SRC : src;

  const image = (
    <Image
      {...rest}
      src={imageSrc}
      fill={fill}
      onLoadingComplete={() => setLoaded(true)}
      onError={() => setError(true)}
      className={
        `${className ?? ''} transition-all duration-700 ease-in-out ` +
        (loaded ? 'opacity-100 blur-0' : 'opacity-60 blur-md')
      }
      alt="custom image"
    />
  );

  if (fill) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        {image}
      </div>
    );
  }
  return image;
};

export default CustomImage;