import React from 'react';

export function Footer() {
  return (
    <footer className="bg-green-800 text-white py-6 mt-8">
      <div className="container mx-auto px-4">
        <p>
          This form is based on the 'Surplus Soil Information Sheet' featured in the document:
        </p>
        <p className="font-semibold mt-2">
          Technical Guidelines: Characterising Surplus Soil for Disposal
        </p>
        <p>
          Waste Management Institute New Zealand Incorporated (WasteMINZ) September 2024
        </p>
        <p className="mt-4">
          <a 
            href="https://linkedin.com" 
            className="text-green-200 hover:text-green-100 inline-flex items-center"
          >
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.25c-.97 0-1.75-.78-1.75-1.75s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.75-1.75 1.75zm13.5 11.25h-3v-5.5c0-1.38-.02-3.16-1.93-3.16-1.93 0-2.23 1.51-2.23 3.06v5.6h-3v-10h2.88v1.36h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.58v5.6z"/>
            </svg>
            Made with ❤️ by Tom Wilson
          </a>
        </p>
      </div>
    </footer>
  );
}