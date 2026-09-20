import { ChibiDirection, ChibiInfo, HobbyItem, PolaroidItem, QuestItem, SkillItem, SocialLink } from '../types';

export const COSMIC_BG_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpERfw2tjeEwsDa6YafFHhbtHWstEFv275orJs5FqVxQcxNuwu7RWONoaTWF_tsULIfJyNOgEKiBby5Nu9tBjT1JPESKUh-ciYFaIcvBMqXKvhi5fA4H1QluhWOO0w-7J1i3V51KaI5IJZzIV-sJ0HS4FRkeDUaP3gR-21GKZZJl5Q7t3pBELpAY8yMgMS_yz2AwxXhzEgLbxfpBT01cPA07Kes_fdERf9KrFTIXimBn0UBqbVzEgKHFGo3SrSclEUxWc';

export const AVATAR_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_moK1XRHSd3dUCn_Ii8qMTUd75G5KhJFN9HHSb_tLx_K87O6yb4rLvhFDwjHOtyepduVBNHp0sCVnManyhtePsmbtwqfe_PwpqK2-THVia5L5nhWSJXG-Xl6ev1gtCfcybLm3siZhxXBiZtTCdSE0XWPTJY-w23uQ_JiB7hf4ie1yS_zWtaIk9r3CyoKVDsnJtWkycjkn5dFQSPWdNUkwOPq2I8KMuVsgDdTflA86XWMaAvIt-t2QHvSDAsYvt7CCGfY';

export const CANVA_LOGO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKpc8nvqreCP-_U_rUWcYnTmMBKSGwGeiO7t4bCQ9G81EloeRwN5Rw_hQbW4LlvZ_rwH0BayGCmGCPWTNkr4RKD0dKI2SDtt3QhDxSepW10-rMntA0sIYHn6IxB4pR_HvvxAMD0vRG4ZycBMmjTsYGaHZKT3ugKDTJdP_RQW7s3vaDj0gpnvGofE0FJYQMfSEAwCjez0YLZq5Fn31yEMLzAuQOOgWfdllvvItJBtFLma44tgTndPOZ0Dr6znJnY2Yyhu4';

export const CANVA_DIALOG_LOGO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUfI6f9af2wmK1rDiNaM2s5DD01yTwXZmrgLGOLJVOKjlC1nU942f3y1YncwDySgnOIagOMskFQ_V2l7r0Gm4_OaKNYXTUzgWf5g6fJKk6MgCLtmHKzsgBIGllK2UZTMhr5Th4vsM8EhTBp8SHb_v_YtnhwbX8rIBDrYgPyit4yuS52qIYWk4vsCnunmwfP1a_w8-VU6WmqnSiIDu1NdAoJTVp-yaUTWy2-CW9oKfFqTy7hXA1kpHJLFMof4CvAscP_SU';

export const CHIBI_DATA: Record<ChibiDirection, ChibiInfo> = {
  front: {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAKI0UCOGu997CMJL_uNhNWEKnS8DNyC3dliQD6FzT6I6EYplAto3HS9HvFsXEmi0FIeAarZ4kUuyy3qg8CqWpycEmzB934rMZ6low--5AEA6oOwY7SUfv2UTcxf9-1sto_-UfSA_csz5g3JfMg0X8HErf4QMKZ5erYstnhbRW_PFhWqXXllGrA1SsPhZ2X33G-jvDBNMrDnUE28zVLxa8tV9HJGp-mEAQKuSKDBZrPIvq4hbtTH4DWYlD6CINZCk77J0',
    label: 'GÓC NHÌN: TRƯỚC (FRONT)',
    quote: 'Chào cậu! Tớ là Phương Anh ✨',
    activeBtn: 'btnDirFront',
    thumbId: 'thumbDirFront',
  },
  left: {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6jiOkFhwJVwUoPNAwXO61hjzQ2wggdee4aRE01v_WUsL0ZMRXQLL76ou_78HDNG9sO_5mcE-_kC7OLBQVHrkkUPlCGLlk7Ok6W09YrDxysmR38haVvmnSA2vtVVpRmkyRDIpPuorHzETzvmd8Suor8httBnChXypcnz_tDVzhj80fOa3h0zj_yNgfN-U_SBjrbxi4DGJpfa6CPaZFPaPNNJshEeBAQVUvWRUIfL3dWYg6qrIDwz3KOI6f7r5hEOyM6DI',
    label: 'GÓC NHÌN: TRÁI (LEFT)',
    quote: 'Đi qua trái tìm kẹo ngọt! 🍬',
    activeBtn: 'btnDirLeft',
    thumbId: 'thumbDirLeft',
  },
  back: {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYl_Q4j9XR4rWTnYBOfcC31V48YU_RlC7fpZ9oQoeuOZ_VZV5SNjIQtWaoqWL-FZKKgrSCd8sKSXuQwEekicCI7nxsg8DciXigvCU3RfgoURzDq8fnu61FXlaQAKQMeLtmYOrn3cR6Vrk7i6xtTQrQBj6qU0t2Ot-e9p6tkzwSxQ2NhwgjgG-vdMZh9uicHITMxOoyHr2YL-twQWpV5zJYOLUDOVdgbyEwZA173ujjIJ4MQj0yt-vZVEidHQm5_tLKOI0',
    label: 'GÓC NHÌN: PHÍA SAU (BACK)',
    quote: 'Đang tập trung gõ code nè... 💻',
    activeBtn: 'btnDirBack',
    thumbId: 'thumbDirBack',
  },
  right: {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgebmsmvoEdNaxvg8BCJkg8rJJagf2dD_207IazAIr2goTu8xnC-Eh6BQniDkbiQ-LukCtqin6VnGFDto8CuUvMCQfAvvZca7YSu8nAIyYr_4v9r0tnV3YGR015hZ9-lYTScXQ1FT23iqjalH9T0SN5LPjKFKBPLbsVP1LVqtXgcwN_mZ0THWtf924nCAhwxnyEGVlwUL3QtTqKx3zk3eNI4_dZQPf4hPXO5rtc_vZ2nhbFs_pcJrIgM1Likir9m6Gvxs',
    label: 'GÓC NHÌN: PHẢI (RIGHT)',
    quote: 'Rẽ phải để né bug frontend! 🐞',
    activeBtn: 'btnDirRight',
    thumbId: 'thumbDirRight',
  },
};

export const CHIBI_THUMBS: Record<ChibiDirection, { img: string; label: string }> = {
  front: {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1hNRrWu6EFu-cn85B8lzdiwW3Fl8dsHMDpbFuKIKQ8Z3kOxUzqBXbOW3rfx21VkTlI1lK-j3VjznNCnpfNJNcQTZN3Ttw6qYQRYRSyNIFifehmr60290EsOrB94HseZgh6-HYAsmc3ujpEBonu3T918wU2AQvNHgoWf3sW4GK1X0tsgRV1RGXyI4n9MrRvENFIlM1MMtbHDO1384Xo4A5A1zrZAo3MuE_XsX6bg_4zZp97yy_KG4D9IKbZYVBiUzrVxg',
    label: 'TRƯỚC',
  },
  left: {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDaJXVJXEaHXRz7uP7EWqnpO-7x8NSKiI1JhS2nFsKKkr4BGuVKJF6PWg2V3ntxTCJ36T5FCkqmFZi4egUmct5EsodQH9wQMtnFAyFFpk98gHcB9hFd5_5ThdNPEQVJu5qgShqWS71YmgAU72OzqEwB-VPqmrF6ksYibI0hzZUQ6nRd_okpnleKDUcW5J4xFQXHllt48eD-1nzyNLmvi78HMViquEIxD7tdPy7MIwmlaxG4hAZlJfMmKWBozcAloiikkU',
    label: 'TRÁI',
  },
  right: {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcptFlzKz-hYUJVkL1ZNuQpvkfpCZcBAPv30pw9iBbt42sVt9ar9Bu3Ab_-iHWILCb33xChmjFlg-70aGFE0ttVYvuHXz9poAzPThaDJ2om52i3bHvnlLF3E3e4YskroSlMtDkWJ7WPb11scQW3WZHdM9CZmK12g84QmwcnxYnFmgz5Rx7HIXMTPqN8n5v3L1ZfaGWQZ__H1wQQsGkUvjcr8jdKFKoitqgqwIUMvZ1CCJQq4DOVDLUpDlWjNDrRu-V-ZU',
    label: 'PHẢI',
  },
  back: {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2CkJQmaBqBHKAG4xqwZmSwrPkUi4aHhEIbn1CxphaFO9qmAwJvLSxS9NdrOZNQj08cuj9EQYMnU1yGiddXkx66JyYYEcDBSLL2khobtEskGRYnx_89dZuMKPH2w1DsHEHHi1GEysZm93CR7FeWDn41Va8-eXWtirLNtoFJf2hHixBAIXRCIPoVTLXmkFjeE3E719jFxJHeXRLABPVWZx5rcSWPT3Vo8S4Fmx7Tb9WrAS9ruai_-iKNlWHaPZkKWahFao',
    label: 'SAU',
  },
};

export const SKILL_ITEMS: SkillItem[] = [
  {
    id: 'time-mgmt',
    title: 'Quản Lý Thời Gian (Time Management)',
    shortTitle: 'Quản Lý Thời Gian',
    level: 'Cấp độ: Điều Phối (Lv.92)',
    badge: 'ĐIỀU PHỐI',
    badgeBg: 'bg-[#f6c833] text-[#120a21]',
    desc: 'Kỹ năng lập kế hoạch tiến độ, ưu tiên công việc logic, phân bổ thời gian hiệu quả và đảm bảo dự án luôn vận hành trơn tru đúng kỳ hạn.',
    iconName: 'schedule',
    iconColor: 'text-[#f6c833]',
  },
  {
    id: 'ai-tech',
    title: 'Công Nghệ AI (AI Specialist)',
    shortTitle: 'Công Nghệ AI',
    level: 'Cấp độ: Sáng Tạo (Lv.90)',
    badge: 'AI SPECIAL',
    badgeBg: 'bg-[#45b7d1] text-[#120a21]',
    desc: 'Tận dụng sức mạnh của các mô hình AI tiên tiến trong phân tích, tự động hoá tổng hợp thông tin và tối ưu hoá năng suất làm việc vượt trội.',
    iconName: 'smart_toy',
    iconColor: 'text-[#45b7d1]',
  },
  {
    id: 'teamwork',
    title: 'Làm Việc Nhóm (Team Collaboration)',
    shortTitle: 'Làm Việc Nhóm',
    level: 'Cấp độ: Đồng Đội (Lv.95)',
    badge: 'TEAMWORK',
    badgeBg: 'bg-[#26c281] text-[#120a21]',
    desc: 'Khả năng gắn kết đồng đội, lắng nghe tích cực, giao tiếp truyền cảm hứng và phối hợp đa nhiệm giải quyết các thử thách chung.',
    iconName: 'groups',
    iconColor: 'text-[#26c281]',
  },
  {
    id: 'it-basic',
    title: 'Tin Học Cơ Bản (Digital Essentials)',
    shortTitle: 'Tin Học Cơ Bản',
    level: 'Cấp độ: Vững chắc (Lv.88)',
    badge: 'DIGITAL',
    badgeBg: 'bg-[#d93876] text-[#120a21]',
    desc: 'Nắm vững kỹ năng mềm máy tính, phần mềm tin học văn phòng, xử lý văn bản, bảng tính và quản trị dữ liệu linh hoạt.',
    iconName: 'computer',
    iconColor: 'text-[#d93876]',
  },
  {
    id: 'speech',
    title: 'Kỹ Năng Thuyết Trình (Pitching)',
    shortTitle: 'Thuyết Trình',
    level: 'Cấp độ: Tự tin (Lv.85)',
    badge: 'SPEECH',
    badgeBg: 'bg-[#f6c833] text-[#120a21]',
    desc: 'Khả năng truyền đạt ý tưởng mạch lạc, thuyết trình trước đám đông và truyền cảm hứng với phong thái tự tin, cuốn hút.',
    iconName: 'record_voice_over',
    iconColor: 'text-[#f6c833]',
  },
  {
    id: 'canva',
    title: 'Thiết Kế Canva (Visual Design)',
    shortTitle: 'Canva',
    level: 'Cấp độ: Thành thạo (Lv.90)',
    badge: 'SOFT SKILL',
    badgeBg: 'bg-[#45b7d1] text-[#120a21]',
    desc: 'Làm chủ bộ công cụ thiết kế đồ họa Canva: thiết kế ấn phẩm truyền thông, bài thuyết trình, infographic và visual content bắt mắt, chuyên nghiệp.',
    iconName: 'palette',
    iconColor: 'text-[#45b7d1]',
    customType: 'canva',
  },
];

export const QUEST_ITEMS: QuestItem[] = [
  {
    id: 'quest-03',
    number: '03',
    tag: 'QUEST #03 • HIỆN TẠI',
    status: 'CURRENT',
    statusColor: 'bg-[#d93876] text-[#120a21]',
    title: 'Dự Án Tối Ưu Hóa Quy Trình Với AI',
    role: 'Trưởng Nhóm Điều Phối / Lead Coordinator',
    roleColor: 'text-[#26c281]',
    desc: 'Ứng dụng các công cụ AI thế hệ mới để tự động hóa tổng hợp dữ liệu, rút ngắn thời gian làm việc nhóm và lên kế hoạch quản lý tiến độ chuẩn xác.',
    reward: '+3,500 XP • AI Specialist Badge',
    rewardColor: 'text-[#f6c833]',
    borderColor: 'hover:border-[#d93876]',
  },
  {
    id: 'quest-02',
    number: '02',
    tag: 'QUEST #02 • HOÀN THÀNH',
    status: 'CLEARED',
    statusColor: 'bg-[#45b7d1] text-[#120a21]',
    title: 'Dự Án Nhóm',
    role: 'Trưởng Nhóm Dự Án (Project Lead)',
    roleColor: 'text-[#45b7d1]',
    desc: 'Linh hoạt kết nối các thành viên, phân bổ tài nguyên và quản lý thời gian đa nhiệm (Multitasking) giúp dự án về đích đúng hạn với kết quả xuất sắc.',
    reward: '+2,800 XP • Synergy Crystal',
    rewardColor: 'text-[#45b7d1]',
    borderColor: 'hover:border-[#45b7d1]',
  },
  {
    id: 'quest-01',
    number: '01',
    tag: 'QUEST #01 • HOÀN THÀNH',
    status: 'CLEARED',
    statusColor: 'bg-[#26c281] text-[#120a21]',
    title: 'E-Commerce Fundamentals',
    role: 'E-Commerce Certification',
    roleColor: 'text-[#26c281]',
    desc: 'Hoàn thành xuất sắc khóa học E-Commerce: xây dựng mô hình sàn thương mại điện tử, thiết kế landing page bán lẻ và tối ưu quy trình thanh toán số.',
    reward: '+2,200 XP • Foundation Scroll',
    rewardColor: 'text-[#f6c833]',
    borderColor: 'hover:border-[#26c281]',
  },
];

export const HOBBY_ITEMS: HobbyItem[] = [
  { id: 'game', icon: 'sports_esports', label: 'Chơi Game', hoverColor: 'hover:border-[#f6c833]' },
  { id: 'cat', icon: 'pets', label: 'Nuôi Mèo', hoverColor: 'hover:border-[#26c281]' },
  { id: 'love', icon: 'favorite', label: 'Người Thân & Bạn Bè', hoverColor: 'hover:border-[#d93876]' },
  { id: 'learn', icon: 'auto_awesome', label: 'Học Điều Mới', hoverColor: 'hover:border-[#f6c833]' },
  { id: 'music', icon: 'headphones', label: 'Nghe Nhạc', hoverColor: 'hover:border-[#45b7d1]' },
  { id: 'friends', icon: 'groups', label: 'Gặp Gỡ Bạn Bè', hoverColor: 'hover:border-[#26c281]' },
];

export const POLAROID_ITEMS: PolaroidItem[] = [];

export const SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'Instagram',
    handle: '@sevv.ills',
    subtitle: 'PHOTOS & DAILY',
    url: 'https://www.instagram.com/sevv.ills/',
    iconColor: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]',
    badgeBg: 'bg-[#d93876] text-white',
    btnBg: 'bg-[#d93876] hover:bg-[#ef4444]',
    btnText: 'MỞ TRANG',
    type: 'instagram',
  },
  {
    name: 'Facebook',
    handle: 'Phương Anh',
    subtitle: 'CONNECT & CHAT',
    url: 'https://www.facebook.com/phuong.anhh.896572/',
    iconColor: 'bg-[#1877f2]',
    badgeBg: 'bg-[#45b7d1] text-[#120a21]',
    btnBg: 'bg-[#45b7d1] hover:bg-[#38a0b8]',
    btnText: 'MỞ TRANG',
    type: 'facebook',
  },
  {
    name: 'Telegram',
    handle: '@sevvills',
    subtitle: 'DIRECT MESSAGE',
    url: 'https://t.me/sevvills',
    iconColor: 'bg-[#229ed9]',
    badgeBg: 'bg-[#26c281] text-[#120a21]',
    btnBg: 'bg-[#26c281] hover:bg-[#1fa16a]',
    btnText: 'MỞ TRANG',
    type: 'telegram',
  },
];
