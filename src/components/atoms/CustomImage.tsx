import Image, { ImageProps } from 'next/image';
import React, { useState } from 'react';

const CustomImage = (props: ImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const { fill, className, ...rest } = props;

  const image = (
    <Image
      {...rest}
      fill={fill}
      onLoadingComplete={() => setLoaded(true)}
      className={
        `${className ?? ''} transition-all duration-700 ease-in-out ` +
        (loaded ? 'opacity-100 blur-0' : 'opacity-60 blur-md')
      }
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