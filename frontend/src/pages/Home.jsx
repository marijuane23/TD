import React from 'react';
import GreetingAnimation from '../components/GreetingAnimation.jsx';

export function Home() {
  return (
    <div className="flex flex-col">
      {/* Animated Full-Screen Hero Section (Only visible section on first load) */}
      <GreetingAnimation />
    </div>
  );
}

export default Home;
