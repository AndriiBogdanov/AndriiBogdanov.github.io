/**
 * Единственный источник правды для контента визитки.
 * Контакты хранятся закодированными: в собранном HTML нет plaintext-адреса
 * и номера — ссылки собираются в браузере. Это тормозит автоматические
 * скраперы, но не прячет контакт от человека, открывшего исходник.
 */

export const profile = {
  name: 'Andrii Bogdanov',
  nameLines: ['Andrii', 'Bogdanov'],
  role: 'Web Developer & Designer',
  location: 'Berlin, Germany',
  intro:
    'I design and build digital experiences for businesses, brands and creators.',
  skills: [
    'Web Development',
    'UI/UX',
    'Digital Design',
    'SEO',
    'Integrations & Automation',
  ],
  siteUrl: 'https://andriibogdanov.github.io',
} as const;

/** base64 — разворачивается только на клиенте */
export const encoded = {
  phonePrimary: 'KzQ5MTUyMzY2NzU3NjM=', // +49 …
  phoneSecondary: 'KzM4MDczMTUxNzkzNw==', // +380 …
  email: 'YW5kcmV5Ym9nZGFub3YyMDA2QGdtYWlsLmNvbQ==',
  whatsapp: 'NDkxNTIzNjY3NTc2Mw==', // digits only, for wa.me
} as const;

export const social = {
  linkedin: 'https://www.linkedin.com/in/andrii-bogdanov-382429302',
  instagram: 'https://www.instagram.com/yuohonov',
} as const;

export type Project = {
  id: string;
  num: string;
  title: string;
  kind: string;
  description: string;
  url: string;
  badge?: string;
};

export const selectedWork: Project[] = [
  {
    id: 'danov',
    num: '01',
    title: 'Danov Music',
    kind: 'Recording studio · Berlin',
    description:
      'Website, brand presentation and booking flow for a Berlin recording studio: services, equipment, artist roster and blog, running in four languages.',
    url: 'https://www.danovmusic.com/',
  },
  {
    id: 'crng',
    num: '02',
    title: 'CRNG Records',
    kind: 'Electronic music label · Ukraine',
    description:
      'Design and development for an underground techno and house label: artists, releases, events and editorial, with a custom backend the team runs itself.',
    url: 'https://www.crngrecords.com/',
  },
  {
    id: 'klapp',
    num: '03',
    title: 'KLAPP Ukraine',
    kind: 'E-commerce & professional beauty platform',
    description:
      'Redesign and full-stack development for the official Ukrainian representative of KLAPP, including a large product catalogue and a professional customer area.',
    url: 'https://klapp.ua/',
    badge: 'UA website',
  },
];

export const moreWork: Project[] = [
  {
    id: 'hauptstaedterinnen',
    num: '04',
    title: '#DIEHauptstädterinnen',
    kind: 'Business network for female leaders · Berlin',
    description: '',
    url: 'https://xn--die-hauptstdterinnen-lzb.de/',
    badge: 'DE website',
  },
  {
    id: 'smartmaster',
    num: '05',
    title: 'Smart Master',
    kind: 'Renovation & engineering · Costa Blanca',
    description: '',
    url: 'https://smart-master.es/',
  },
  {
    id: 'nadiia',
    num: '06',
    title: 'Nadiia Sheremetieva',
    kind: 'Opera singer, dramatic-lyric soprano',
    description: '',
    url: 'https://nadiia-sheremetieva.com/',
  },
];
