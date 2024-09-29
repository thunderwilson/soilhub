import React from 'react';

export function Instructions() {
  return (
    <div className="bg-white bg-opacity-90 rounded-lg shadow-xl p-6 space-y-4">
      <h2 className="text-2xl font-bold text-green-800">Instructions</h2>
      <ol className="list-decimal list-inside space-y-2">
        <li>Complete the relevant fields below to describe your consignment(s) of surplus soil.</li>
        <li>Compose an email in the Email Submission section and click preview to review.</li>
        <li>Click Send Email to send the contents of your form to the destination address.</li>
      </ol>
    </div>
  );
}