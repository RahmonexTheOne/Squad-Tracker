"use client"; // Obligatoire pour utiliser onError

import { useState } from 'react';

export default function PodiumCharacter({ path, alt }: { path: string, alt: string }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null; // Si l'image plante, on n'affiche rien du tout

  return (
    <img 
      src={path} 
      alt={alt} 
      className="h-64 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] hover:scale-110 transition duration-500" 
      onError={() => setIsVisible(false)} 
    />
  );
}