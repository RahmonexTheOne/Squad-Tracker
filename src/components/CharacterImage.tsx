"use client"; // Cette ligne doit être tout en haut !

import { useState } from 'react';

export default function CharacterImage({ path, fallback }: { path: string, fallback: string }) {
    const [imgSrc, setImgSrc] = useState(path);
    const [isVisible, setIsVisible] = useState(true);

    return (
        <div 
            className="hidden lg:block w-[500px] h-[700px] absolute right-[-50px] bottom-[-150px] z-10 pointer-events-none select-none"
            style={{ display: isVisible ? 'block' : 'none' }}
        >
            <img 
                src={imgSrc}
                alt="Character 3D"
                className="w-full h-full object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                onError={() => {
                    // Si l'image perso plante, on essaie le fallback.
                    // Si le fallback est déjà ce qu'on affiche, on cache tout pour éviter une icône brisée.
                    if (imgSrc === fallback) {
                        setIsVisible(false);
                    } else {
                        setImgSrc(fallback);
                    }
                }}
            />
        </div>
    );
}