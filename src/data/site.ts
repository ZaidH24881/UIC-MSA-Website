export const site = {
  name: 'MSA at UIC',
  fullName: 'Muslim Student Association at UIC',
  email: 'uicmsa@gmail.com',
  timezone: 'America/Chicago',
  memberUrl: 'https://uic.campusgroups.com/msa/club_signup',
  groupFormUrl: 'https://cglink.me/2gA/s94866',
  whatsappUrl: 'https://chat.whatsapp.com/CiVJsIGeJBnEqopCHOceMv?mode=ems_wa_c',
  linksUrl: 'https://linktr.ee/msaatuic',
  instagramFollowers: '5,000+',
  socials: [
    { name: 'Instagram', url: 'https://www.instagram.com/msa.at.uic/' },
    { name: 'YouTube', url: 'https://www.youtube.com/@msaatuic' },
    { name: 'Facebook', url: 'https://www.facebook.com/MSAatUIC' },
    { name: 'TikTok', url: 'https://www.tiktok.com/@msaatuic' },
    { name: 'X / Twitter', url: 'https://twitter.com/MSAatUIC' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/groups/11829083/' },
  ],
};

export const navigation = [
  { label: 'Events', url: '/events/' },
  { label: 'Prayer', url: '/prayer/' },
  { label: 'Community', url: '/community/' },
  { label: 'Resources', url: '/resources/' },
  { label: 'About', url: '/about/' },
];

type PrayerInfo = {
  receivedAt: string;
  source: string;
  sessions: { label: string; time: string }[];
  location: string;
  weeklyLocation: string | null;
  locationUrl?: string;
  weeklyDirections?: string;
  daily: {
    verified: boolean;
    location: string | null;
    hours: string | null;
    directions: string | null;
    accessibilityDirections?: string;
    locationUrl?: string;
  };
  exception: { message: string; expiresAt: string } | null;
};
export const prayer: PrayerInfo = {
  receivedAt: '2026-09-11',
  source: 'Announcement supplied by MSA for this website',
  sessions: [
    { label: 'First prayer', time: '1:05 PM' },
    { label: 'Second prayer', time: '3:05 PM' },
  ],
  location: 'Location announced weekly',
  weeklyLocation: null,
  daily: { 
	verified: true, 
	location: 'SCE 315', 
	hours: 'Monday–Friday · 11:00 AM–9:00 PM', 
	directions: 'الحمد لله, our daily prayer space is available in SCE 315. Take the escalators to the 2nd floor of SCE and continue straight, passing Amazon on your right. Continue until you reach the elevators on your left. Take the elevator to the 3rd floor, make two lefts, and continue down the hallway.',
  	accessibilityDirections: 'Separate brothers’ and sisters’ entrances are available.',
	},
	exception: null,
};

export const donations = {
  enabled: true,
  approvedAt: '2026-09-11',
  source: 'Recipients supplied and authorized in the website implementation request',
  purpose: 'Support MSA community programming, gatherings, and Ramadan iftars.',
  methods: [
    {
      name: 'Zelle',
      recipient: 'sojeongpark83@gmail.com',
      alternative: null,
      url: null,
      instruction: 'In your banking app, choose Zelle and use this email address.',
    },
    {
      name: 'Venmo',
      recipient: '@sojeong_07',
      alternative: 'sojeongpark83@gmail.com',
      url: null,
      instruction: 'Find this recipient in the Venmo app using the handle or email.',
    },
    {
      name: 'PayPal',
      recipient: 'paypal.me/sjpark83',
      alternative: '2488434318',
      url: 'https://paypal.me/sjpark83',
      instruction: 'Give through PayPal, or use the phone number below to find the recipient.',
    },
  ],
};

type Involvement = {
  status: 'open' | 'closed' | 'unconfirmed';
  title: string;
  description: string;
  statusMessage: string;
  opportunities: {
    title: string;
    description: string;
    status: 'open' | 'closed';
    url: string | null;
    deadline: string | null;
  }[];
};
export const involvement: Involvement = {
  status: 'unconfirmed',
  title: 'Make a little time. Make a difference.',
  description:
    'Help bring MSA gatherings and initiatives to life. Committees give students a way to contribute their time, ideas, and care to the community.',
  statusMessage:
    'Current committee openings have not been announced here. Email the team to ask how you can help.',
  opportunities: [],
};

export const resourceLinks = [
  {
    title: 'Prayer on campus',
    description: 'Jumu’ah updates and daily prayer information.',
    url: '/prayer/',
    icon: 'sun',
  },
  {
    title: 'Student success',
    description: 'Study habits, campus support, and finding your rhythm.',
    url: '/resources/student-success/',
    icon: 'book',
  },
  {
    title: 'Getting to campus',
    description: 'Official commuting tools and U-Pass information.',
    url: '/resources/transportation/',
    icon: 'map',
  },
  {
    title: 'Finding halal food',
    description: 'Resources to help you check before you eat.',
    url: '/resources/halal-food/',
    icon: 'heart',
  },
  {
    title: 'Lectures & recordings',
    description: 'Keep learning with MSA talks and khutbahs.',
    url: '/resources/lectures/',
    icon: 'play',
  },
  {
    title: 'On the bookshelf',
    description: 'Explore the MSA community’s reading list.',
    url: '/resources/books/',
    icon: 'book',
  },
];
