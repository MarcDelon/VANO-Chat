"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function IntroPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirige vers /login après 2.5 secondes
    const timer = setTimeout(() => {
      router.push('/login');
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-between overflow-hidden w-full h-full z-50">
      
      {/* Push the logo to the center */}
      <div className="flex-1" />

      {/* Center Logo */}
      <div className="flex flex-col items-center justify-center">
        {/* Removed fixed background/borders for transparent image support */}
        <div className="w-28 h-28 relative flex items-center justify-center">
          <Image 
            src="/NOVA.png" 
            alt="NOVA Logo" 
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* "from NOVA" text at the bottom */}
      <div className="flex-1 flex flex-col justify-end pb-12">
        <div className="flex flex-col items-center">
          <span className="text-[#8e8e8e] text-sm mb-1 font-medium">from</span>
          <div className="flex items-center justify-center">
            {/* Gradient text similar to the screenshot's Meta logo */}
            <span className="bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-transparent bg-clip-text font-bold text-2xl tracking-wide flex items-center">
              <svg className="w-6 h-6 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#paint0_linear)"/>
                <path d="M2 17L12 22L22 17" stroke="url(#paint0_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="url(#paint0_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="paint0_linear" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#f09433"/>
                    <stop offset="0.5" stopColor="#dc2743"/>
                    <stop offset="1" stopColor="#bc1888"/>
                  </linearGradient>
                </defs>
              </svg>
              NOVA
            </span>
          </div>
        </div>
      </div>
      
    </div>
  );
}
