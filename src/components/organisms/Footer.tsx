import React from 'react';

const Footer = () => {
  return (
    <footer className="sticky bottom-0 z-50 w-full bg-ivory shadow-md p-4 mt-8">
      <div className="container mx-auto text-center text-foreground">
        © {new Date().getFullYear()} RAAHI. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
