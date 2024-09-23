'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const MaterialDescriptionFormComponent = dynamic(
  () => import('~/components/material-description-form').then(mod => mod.MaterialDescriptionFormComponent),
  { ssr: false }
);

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MaterialDescriptionFormComponent />
    </Suspense>
  );
}
