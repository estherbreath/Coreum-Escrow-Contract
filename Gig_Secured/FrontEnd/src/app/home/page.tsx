import React from 'react';
import dynamic from 'next/dynamic';

const HomeFeatures = dynamic(() => import('../../features/Home/HomeFeatures'), {
  ssr: false,
});

export default function page() {
  return <HomeFeatures />;
}
