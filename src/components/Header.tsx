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
            href="mailto:tom@soilhub.nz" 
            className="text-green-200 hover:text-green-100 inline-flex items-center"
          >
            <Mail className="mr-2 h-4 w-4" />
            Feedback
          </a>

        </p>
      </div>
    </header>
  );
}