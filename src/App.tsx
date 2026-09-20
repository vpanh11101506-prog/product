import React, { useState, useEffect } from 'react';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { HobbiesZone } from './components/HobbiesZone';
import { SkillInventory } from './components/SkillInventory';
import { SocialModal } from './components/SocialModal';
import { TopNav } from './components/TopNav';
import { PixelCanvasBackground } from './components/PixelCanvasBackground';
import { AdminModals } from './components/AdminModals';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { COSMIC_BG_URL } from './data/portfolioData';
import { playRetroBeep } from './utils/audioSynth';

export default function App() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Global sound effect: phát tiếng bíp khi nhấn bất kỳ nút bấm, link hoặc thẻ tương tác nào
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactiveElement = target.closest('button, a, [role="button"], input[type="file"], .pixel-slot, .dpad-btn');
      if (interactiveElement) {
        // Nếu là nút gửi tim hoặc bồ câu hoặc mua/nhận thì âm bíp coin leng keng, còn lại là âm bíp giòn tan
        const text = interactiveElement.textContent?.toLowerCase() || '';
        if (text.includes('tim') || text.includes('love') || text.includes('tải') || text.includes('ghim')) {
          playRetroBeep('coin');
        } else if (text.includes('x') || text.includes('hủy') || text.includes('gỡ')) {
          playRetroBeep('pop');
        } else {
          playRetroBeep('beep');
        }
      }
    };

    window.addEventListener('click', handleGlobalClick, { capture: true });
    return () => window.removeEventListener('click', handleGlobalClick, { capture: true });
  }, []);

  const handleOpenContact = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsContactModalOpen(true);
  };

  const handleCloseContact = () => {
    setIsContactModalOpen(false);
  };

  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="crt-scanlines text-[#eaddff] font-['Space_Mono'] antialiased min-h-screen relative overflow-x-hidden bg-[#0b0717]">
          {/* Full-Page Pixel Cosmic Space Background */}
          <div
            className="fixed inset-0 w-full h-full bg-cover bg-center opacity-45 pointer-events-none z-0 pixelated-render"
            style={{
              backgroundImage: `url('${COSMIC_BG_URL}')`,
              backgroundAttachment: 'fixed',
            }}
          />

          {/* Dynamic Animated Floating Pixel Canvas (Pixel bay bay lơ lửng) */}
          <PixelCanvasBackground />

          {/* Top HUD Nav */}
          <TopNav onOpenContact={handleOpenContact} />

          {/* Main Canvas Content */}
          <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 space-y-12 relative z-10">
            <HeroSection onOpenContact={handleOpenContact} />
            <SkillInventory />
            <HobbiesZone />
          </main>

          {/* Retro Social Popup Modal */}
          <SocialModal isOpen={isContactModalOpen} onClose={handleCloseContact} />

          {/* Admin Login & Password Modals */}
          <AdminModals />

          {/* Arcade Footer */}
          <Footer onOpenContact={handleOpenContact} />
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
}
