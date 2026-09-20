export type ChibiDirection = 'front' | 'left' | 'back' | 'right';

export interface ChibiInfo {
  img: string;
  label: string;
  quote: string;
  activeBtn: string;
  thumbId: string;
}

export interface SkillItem {
  id: string;
  title: string;
  shortTitle: string;
  level: string;
  badge: string;
  badgeBg: string;
  desc: string;
  iconName: string;
  iconColor: string;
  customType?: 'canva';
}

export interface QuestItem {
  id: string;
  number: string;
  tag: string;
  status: 'CURRENT' | 'CLEARED';
  statusColor: string;
  title: string;
  role: string;
  roleColor: string;
  desc: string;
  reward: string;
  rewardColor: string;
  borderColor: string;
}

export interface HobbyItem {
  id: string;
  icon: string;
  label: string;
  hoverColor: string;
}

export interface PolaroidItem {
  id: string;
  title: string;
  image: string;
  tags: string[];
  badge: string;
  pinColor: string;
  rotation: string;
  badgeColor: string;
  isCustomBg?: boolean;
}

export interface SocialLink {
  name: string;
  handle: string;
  subtitle: string;
  url: string;
  iconColor: string;
  badgeBg: string;
  btnBg: string;
  btnText: string;
  type: 'instagram' | 'facebook' | 'telegram';
}
