import React, { useState } from 'react';
import { CANVA_DIALOG_LOGO_URL, CANVA_LOGO_URL } from '../data/portfolioData';
import { SkillItem } from '../types';
import { spawnPixelBurst } from '../utils/fx';
import { useLanguage } from '../context/LanguageContext';
import { getBilingualSkillItems, TRANSLATIONS } from '../utils/translations';

export const SkillInventory: React.FC = () => {
  const { language, isVi } = useLanguage();
  const t = TRANSLATIONS[language].skills;
  const skillItems = getBilingualSkillItems(isVi);
  const [selectedSkillId, setSelectedSkillId] = useState<string>(skillItems[0].id);

  const selectedSkill = skillItems.find((s) => s.id === selectedSkillId) || skillItems[0];

  const handleSelectSkill = (skill: SkillItem, e: React.MouseEvent) => {
    setSelectedSkillId(skill.id);
    spawnPixelBurst(e.clientX, e.clientY, 6);
  };

  return (
    <section className="space-y-4" id="skills">
      {/* Header */}
      <div className="flex items-center justify-between border-b-[3px] border-[#5a3696] pb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#f6c833] text-2xl">inventory_2</span>
          <h2 className="text-xl md:text-2xl font-['Space_Grotesk'] text-[#f6c833] arcade-glow-gold uppercase font-bold">
            {t.sectionTitle}
          </h2>
        </div>
        <span className="font-['Space_Mono'] text-xs bg-[#f6c833] text-[#120a21] font-bold px-3 py-1 border-[2px] border-black shadow-[2px_2px_0px_#0a0514]">
          {t.slotsInUse}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Backpack Grid */}
        <div className="lg:col-span-7 bg-[#1f1730]/95 border-[3px] border-[#5a3696] p-5 pixel-box-md">
          <div className="flex items-center justify-between mb-4 border-b-2 border-[#5a3696] pb-2">
            <span className="font-['Space_Mono'] text-xs text-[#f6c833] font-bold">
              {t.magicBackpack}
            </span>
            <span className="font-['Space_Mono'] text-xs text-[#d1c5ad]">{t.weight}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" id="inventorySlotGrid">
            {skillItems.map((item) => {
              const isActive = selectedSkill.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={(e) => handleSelectSkill(item, e)}
                  className={`pixel-slot bg-[#231b34] hover:bg-[#2e263f] p-3 flex flex-col items-center justify-center gap-2 aspect-square transition-all ${
                    isActive ? 'active-slot border-[#f6c833] outline-2 outline-[#f6c833]' : ''
                  }`}
                >
                  {item.customType === 'canva' ? (
                    <div className="w-9 h-9 flex items-center justify-center">
                      <img
                        src={CANVA_LOGO_URL}
                        alt="Canva Logo"
                        className="w-9 h-9 object-contain drop-shadow-[0_0_6px_rgba(0,196,204,0.5)]"
                      />
                    </div>
                  ) : (
                    <span className={`material-symbols-outlined ${item.iconColor} text-3xl`}>
                      {item.iconName}
                    </span>
                  )}
                  <span className="font-['Space_Mono'] text-xs text-[#f3eeff] text-center font-bold">
                    {item.shortTitle}
                  </span>
                  <span
                    className={`text-[9px] font-['Space_Mono'] ${item.badgeBg} font-bold px-1 uppercase`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}

            {/* Locked Slots */}
            <div className="pixel-slot bg-[#120a21]/60 border-dashed border-[#5a3696]/50 p-3 flex flex-col items-center justify-center gap-1 opacity-50 aspect-square select-none">
              <span className="material-symbols-outlined text-[#9a907a] text-2xl">lock</span>
              <span className="font-['Space_Mono'] text-[10px] text-[#9a907a]">{t.expansion}</span>
            </div>
            <div className="pixel-slot bg-[#120a21]/60 border-dashed border-[#5a3696]/50 p-3 flex flex-col items-center justify-center gap-1 opacity-50 aspect-square select-none">
              <span className="material-symbols-outlined text-[#9a907a] text-2xl">lock</span>
              <span className="font-['Space_Mono'] text-[10px] text-[#9a907a]">{t.locked}</span>
            </div>
          </div>
        </div>

        {/* Skill Dialogue Box */}
        <div className="lg:col-span-5 bg-[#1f1730]/95 rpg-dialogue-box p-6 flex flex-col justify-between relative">
          <div>
            <div className="inline-block bg-[#f6c833] text-[#120a21] font-bold font-['Space_Mono'] text-[11px] px-2.5 py-0.5 border-2 border-black -mt-9 mb-4 uppercase shadow-[2px_2px_0px_#0a0514]">
              {isVi ? 'PHƯƠNG ANH WORLD +' : 'PHUONG ANH WORLD +'}
            </div>
            <div className="flex items-center justify-between border-b-2 border-[#5a3696] pb-2 mb-4">
              <div className="flex items-center gap-2">
                {selectedSkill.customType === 'canva' ? (
                  <img
                    src={CANVA_DIALOG_LOGO_URL}
                    alt="Canva"
                    className="w-6 h-6 object-contain"
                  />
                ) : (
                  <span className={`material-symbols-outlined ${selectedSkill.iconColor}`}>
                    {selectedSkill.iconName}
                  </span>
                )}
                <span className="font-['Space_Mono'] text-xs text-[#f6c833] uppercase font-bold">
                  {t.gearInfo}
                </span>
              </div>
              <span className="font-['Space_Mono'] text-xs text-[#d93876] font-bold">
                {selectedSkill.level}
              </span>
            </div>
            <h3 className="text-lg font-['Space_Grotesk'] text-[#f6c833] font-bold">
              {selectedSkill.title}
            </h3>
            <p className="font-['Space_Mono'] text-sm text-[#f3eeff] mt-3 leading-relaxed">
              "{selectedSkill.desc}"
            </p>
          </div>

          <div className="mt-6 pt-4 border-t-2 border-dashed border-[#5a3696] flex items-center justify-between">
            <span className="font-['Space_Mono'] text-xs text-[#d1c5ad] font-bold">
              {t.clickToView}
            </span>
            <span className="font-['Space_Mono'] text-xs text-[#f6c833] font-bold">{t.continue}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
