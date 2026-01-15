import React from "react";

const Footer = () => {
  return (
    <footer className="sticky bottom-0 z-40 w-full bg-background text-foreground shadow-md p-4 mt-8 border-t border-border">
      <div className="container mx-auto text-center">
        © {new Date().getFullYear()} RAAHI. All rights reserved. Built with care
        for conscious travelers.
        <div className="mt-2">
          <a
            href="https://raahi.io/terms"
            className="text-foreground hover:text-foreground/80 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
