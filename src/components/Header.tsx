import React from 'react';
import { Mail } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-green-800 text-white py-6">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">Surplus Soil Information Sheet</h1>
        <p className="mb-2">
          This form provides a simple template for desribing surplus soil consignments. Receiving facilities may require more, or different, information than the inputs on this form. 
        </p>
        <p className="mb-2">
          Feedback is invited to help improve practices and build tools to support the management of surplus soil.
        </p>
        <p>
          <a 
            href="mailto:tom@sephira.nz" 
            className="text-green-200 hover:text-green-100 inline-flex items-center"
          >
            <Mail className="mr-2 h-4 w-4" />
            Feedback
          </a>
          <a 
            href="https://github.com" 
            className="text-green-200 hover:text-green-100 inline-flex items-center ml-4"
          >
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.165c-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.775.42-1.305.763-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.467-2.38 1.235-3.22-.123-.305-.535-1.53.117-3.18 0 0 1.008-.322 3.3 1.23.957-.266 1.98-.4 3-.405 1.02.005 2.043.14 3 .405 2.29-1.552 3.297-1.23 3.297-1.23.653 1.65.24 2.875.118 3.18.77.84 1.235 1.91 1.235 3.22 0 4.61-2.803 5.62-5.475 5.92.43.37.823 1.1.823 2.22v3.293c0 .32.22.694.825.577C20.565 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Free and Open Source
          </a>
        </p>
      </div>
    </header>
  );
}