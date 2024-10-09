import React from 'react';

export function Footer() {
  return (
    <footer className="bg-green-800 text-white py-6 mt-8">
      <div className="container mx-auto px-4">
        <p>
          This form is based on the 'Surplus Soil Information Sheet' featured in the document:
        </p>
        <p className="font-semibold mt-2">
          <a href="https://www.wasteminz.org.nz/files/CLM/Technical%20Guidelines%20for%20Characterising%20Surplus%20Soil%20for%20Disposal_Sep%202024_FINAL_2.0.pdf" className="text-green-200 hover:text-green-100">
            Technical Guidelines: Characterising Surplus Soil for Disposal
          </a>
        </p>
        <p>
          Waste Management Institute New Zealand Incorporated (WasteMINZ) September 2024
        </p>
        <p className="mt-4">
          <a 
            href="https://www.linkedin.com/in/tdgwilson/" 
            className="text-green-200 hover:text-green-100 inline-flex items-center"
          >
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.25c-.97 0-1.75-.78-1.75-1.75s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.75-1.75 1.75zm13.5 11.25h-3v-5.5c0-1.38-.02-3.16-1.93-3.16-1.93 0-2.23 1.51-2.23 3.06v5.6h-3v-10h2.88v1.36h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.58v5.6z"/>
            </svg>
            Made with ❤️ by Tom
          </a>
          <a 
            href="https://github.com/thunderwilson/soilhub" 
            className="text-green-200 hover:text-green-100 inline-flex items-center ml-4"
          >
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.165c-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.775.42-1.305.763-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.467-2.38 1.235-3.22-.123-.305-.535-1.53.117-3.18 0 0 1.008-.322 3.3 1.23.957-.266 1.98-.4 3-.405 1.02.005 2.043.14 3 .405 2.29-1.552 3.297-1.23 3.297-1.23.653 1.65.24 2.875.118 3.18.77.84 1.235 1.91 1.235 3.22 0 4.61-2.803 5.62-5.475 5.92.43.37.823 1.1.823 2.22v3.293c0 .32.22.694.825.577C20.565 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Free and Open Source
          </a>
        </p>
      </div>
    </footer>
  );
}