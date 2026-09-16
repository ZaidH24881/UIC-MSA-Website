export type ResourceLink = {
  label: string;
  url: string;
};

export type ResourceSection = {
  title: string;
  body: string;
  links?: ResourceLink[];
};

export type ResourcePage = {
  slug: string;
  title: string;
  intro: string;
  sections: ResourceSection[];
  reviewedAt: string;
  sourceUrls: string[];
};

// reviewedAt records the content and destination review, not a guarantee that
// third-party schedules, certification status, or video availability will persist.
export const resources: ResourcePage[] = [
  {
    slug: 'student-success',
    title: 'Student success',
    intro:
      'A few steady habits and the right support can make campus life easier. Start here for help with studying, coursework, and writing.',
    sections: [
      {
        title: 'Make room for the work',
        body: 'Put deadlines from each syllabus into one calendar. Plan regular study time, attend class, and bring specific questions to office hours. Start assignments early enough to ask for help.',
      },
      {
        title: 'Find tutoring for your subject',
        body: "UIC's tutoring directory brings together support across campus. Look up your subject to find the right center, available formats, and current appointment or drop-in options.",
        links: [
          { label: 'Find UIC tutoring', url: 'https://tutoring.uic.edu/tutoring-by-subject/' },
        ],
      },
      {
        title: 'Work on your writing',
        body: "The UIC Writing Center offers free individual support for UIC students. Bring a class assignment, research project, personal statement, or another piece of writing, and check the center's current booking options.",
        links: [{ label: 'Visit the Writing Center', url: 'https://writingcenter.uic.edu/' }],
      },
      {
        title: 'Build a study routine',
        body: 'The Academic Center for Excellence offers coaching and academic skills support. It can help you navigate university life, develop study strategies, and connect with other campus resources.',
        links: [{ label: 'Explore ACE support', url: 'https://ace.uic.edu/' }],
      },
      {
        title: 'Ask your community',
        body: 'Fellow MSA students can share their experience with classes and campus life. Reach out to make a connection, and use your academic advisor for decisions about degree requirements.',
        links: [{ label: 'Email MSA', url: 'mailto:uicmsa@gmail.com' }],
      },
    ],
    reviewedAt: '2026-09-11',
    sourceUrls: [
      'https://msaatuic.org/student-success',
      'https://tutoring.uic.edu/tutoring-by-subject/',
      'https://writingcenter.uic.edu/',
      'https://ace.uic.edu/',
      'https://msaatuic.org/contact',
    ],
  },
  {
    slug: 'transportation',
    title: 'Getting around Chicago',
    intro:
      'Plan your commute with current university and transit information, whether you travel across campus or across the city.',
    sections: [
      {
        title: 'Check your U-PASS status',
        body: "UIC's U-PASS program is optional and requires eligible students to opt in. The CTA pass covers CTA buses and trains during eligible enrolled terms; U-PASS+ adds eligible Metra travel. Review the ID Center's current eligibility, fees, deadlines, and coverage before choosing a pass.",
        links: [
          {
            label: 'Check UIC U-PASS information',
            url: 'https://idcenter.uic.edu/cta-u-pass/about-u-pass/',
          },
        ],
      },
      {
        title: 'Plan a CTA trip',
        body: "Use CTA's trip-planning tools for your starting point, destination, and travel time. Check current service information before leaving, especially when connecting with another train or bus.",
        links: [
          { label: 'Plan your CTA journey', url: 'https://www.transitchicago.com/planatrip/' },
        ],
      },
      {
        title: 'Travel between campus locations',
        body: 'UIC Transportation publishes campus transit information, including bus routes and services. Check its current route maps and operating details when planning travel between university locations.',
        links: [{ label: 'Explore UIC transportation', url: 'https://transportation.uic.edu/' }],
      },
    ],
    reviewedAt: '2026-09-11',
    sourceUrls: [
      'https://idcenter.uic.edu/cta-u-pass/about-u-pass/',
      'https://www.transitchicago.com/planatrip/',
      'https://transportation.uic.edu/',
    ],
  },
  {
    slug: 'halal-food',
    title: 'Finding halal food',
    intro:
      "Explore Chicago-area food options through halal certifiers' own directories, with details you can check for the location you plan to visit.",
    sections: [
      {
        title: 'HFSAA Chicago directory',
        body: 'The Halal Food Standards Alliance of America links to certified restaurants, meat markets, and dining halls by region. Start with its Chicago page and review the business and location shown in the directory.',
        links: [
          { label: 'Explore HFSAA Chicago', url: 'https://www.hfsaa.org/chicago' },
          { label: 'Browse HFSAA regions', url: 'https://www.hfsaa.org/chapters' },
        ],
      },
      {
        title: 'HMS Chicago-area directory',
        body: 'Halal Monitoring Services lists restaurants and stores with current HMS-certified or reinstated status. Its Chicago-area directory includes addresses and certification details for individual locations, including businesses in nearby suburbs.',
        links: [
          { label: 'Find HMS-certified locations', url: 'https://hmsusa.org/halal/chicago-il' },
        ],
      },
      {
        title: 'Check the place you will visit',
        body: "These links were reviewed on September 11, 2026. The verification basis is each certifier's own directory. Before visiting, check the exact branch, current certification, menu, and hours; ask the business about any requirements that matter to you.",
      },
    ],
    reviewedAt: '2026-09-11',
    sourceUrls: [
      'https://www.hfsaa.org/',
      'https://www.hfsaa.org/chapters',
      'https://www.hfsaa.org/chicago',
      'https://hmsusa.org/halal/chicago-il',
    ],
  },
  {
    slug: 'books',
    title: 'Books to explore',
    intro:
      "Selections from MSA's reading list, spanning biography, faith, memoir, and history. Follow the book links for edition details.",
    sections: [
      {
        title: 'The Sealed Nectar',
        body: 'By Safiur Rahman al-Mubarakpuri. A biography of the Prophet Muhammad, also known as Ar-Raheeq Al-Makhtum, for readers exploring his life and the early Muslim community.',
        links: [
          {
            label: 'View the Darussalam edition',
            url: 'https://darussalam.com/the-sealed-nectar-deluxe-colour/',
          },
        ],
      },
      {
        title: 'Milestones',
        body: "By Sayyid Qutb. Essays presenting the author's views on the Quran, Islamic society, and religious change. Also published under the Arabic title Ma'alim fi al-Tariq.",
        links: [
          {
            label: 'View the digitized edition',
            url: 'https://books.google.com/books?id=NPnXAAAAMAAJ',
          },
        ],
      },
      {
        title: "Don't Forget Us Here",
        body: "By Mansoor Adayfi, with Antonio Aiello. A memoir of Adayfi's years at Guantanamo, told through his experience of detention, relationships, and efforts to preserve a sense of self.",
        links: [
          {
            label: "Read the publisher's overview",
            url: 'https://www.hachettebookgroup.com/titles/mansoor-adayfi/dont-forget-us-here/9780306923869/',
          },
        ],
      },
      {
        title: 'The Autobiography of Malcolm X',
        body: 'By Malcolm X, as told to Alex Haley. Malcolm X recounts his life, his changing religious outlook, and his work in the struggle for Black freedom.',
        links: [
          {
            label: "Explore the publisher's edition",
            url: 'https://www.penguinrandomhouse.com/books/106490/the-autobiography-of-malcolm-x-by-malcolm-x-as-told-to-alex-haley/',
          },
        ],
      },
      {
        title: 'A Peace to End All Peace',
        body: "By David Fromkin. A history of the Ottoman Empire's collapse and the political decisions that shaped the modern Middle East, focused on the years around the First World War.",
        links: [
          {
            label: 'View the Macmillan edition',
            url: 'https://us.macmillan.com/books/9780805088090/apeacetoendallpeace/',
          },
        ],
      },
      {
        title: 'Revolution by the Book: The Rap Is Live',
        body: 'By Imam Jamil Al-Amin. Reflections on worship, faith, and personal change, organized around aspects of Islamic belief and practice.',
        links: [
          {
            label: 'Explore the book preview',
            url: 'https://books.google.com/books?id=QJS95M97ljcC',
          },
        ],
      },
    ],
    reviewedAt: '2026-09-11',
    sourceUrls: [
      'https://msaatuic.org/miscellaneous',
      'https://darussalam.com/the-sealed-nectar-deluxe-colour/',
      'https://books.google.com/books?id=NPnXAAAAMAAJ',
      'https://www.hachettebookgroup.com/titles/mansoor-adayfi/dont-forget-us-here/9780306923869/',
      'https://www.penguinrandomhouse.com/books/106490/the-autobiography-of-malcolm-x-by-malcolm-x-as-told-to-alex-haley/',
      'https://us.macmillan.com/books/9780805088090/apeacetoendallpeace/',
      'https://books.google.com/books?id=QJS95M97ljcC',
    ],
  },
  {
    slug: 'lectures',
    title: 'Recorded talks',
    intro:
      'Continue learning with talks and khutbahs from MSA at UIC. Each recording opens on YouTube; if a video becomes unavailable, browse the MSA channel for other recordings.',
    sections: [
      {
        title: '40 Hadith of Imam Al-Nawawi: Hadith #4',
        body: "A session in MSA's study of Imam al-Nawawi's hadith collection.",
        links: [
          { label: 'Watch the hadith session', url: 'https://www.youtube.com/watch?v=YMnviZwJcHE' },
        ],
      },
      {
        title: 'Seeking True Power and Honor Through Faith',
        body: "A Jumu'ah khutbah at UIC by Brother Yunis Froukh.",
        links: [{ label: 'Watch the khutbah', url: 'https://www.youtube.com/watch?v=h9lVJnCdN78' }],
      },
      {
        title: 'Quran Exploration | Fall 2022',
        body: 'An archived MSA playlist for exploring the Quran across multiple sessions.',
        links: [
          {
            label: 'Open the Quran exploration playlist',
            url: 'https://www.youtube.com/playlist?list=PLW9e0tJf9Uln3LoYMBUgsJQmfAnaYjvoZ',
          },
        ],
      },
      {
        title: "Tafseer ul-Qur'an in Revelation Order",
        body: 'A Quran commentary session with Shaykh Asim Kazi.',
        links: [
          {
            label: 'Watch the tafseer session',
            url: 'https://www.youtube.com/watch?v=3iU7MPpjplA',
          },
        ],
      },
      {
        title: 'Gaza Eyewitness to Genocide',
        body: 'A recorded talk with Dr. Abdur Rafay, published by MSA at UIC.',
        links: [
          {
            label: "Watch Dr. Abdur Rafay's talk",
            url: 'https://www.youtube.com/watch?v=KJnwgr3j2rs',
          },
        ],
      },
      {
        title: 'Lebanon and Iran: A Growing Strike Zone',
        body: 'A recorded talk by Shaykh Shirazi, published by MSA at UIC.',
        links: [
          {
            label: "Watch Shaykh Shirazi's talk",
            url: 'https://www.youtube.com/watch?v=cnI-El9cLWU',
          },
        ],
      },
      {
        title: 'Find more recordings',
        body: "Browse MSA's YouTube channel for more talks and khutbahs, or choose another recording if a link is no longer available.",
        links: [{ label: 'Visit MSA at UIC on YouTube', url: 'https://www.youtube.com/@MSAatUIC' }],
      },
    ],
    reviewedAt: '2026-09-11',
    sourceUrls: [
      'https://msaatuic.org/lectures',
      'https://www.youtube.com/watch?v=YMnviZwJcHE',
      'https://www.youtube.com/watch?v=h9lVJnCdN78',
      'https://www.youtube.com/playlist?list=PLW9e0tJf9Uln3LoYMBUgsJQmfAnaYjvoZ',
      'https://www.youtube.com/watch?v=3iU7MPpjplA',
      'https://www.youtube.com/watch?v=KJnwgr3j2rs',
      'https://www.youtube.com/watch?v=cnI-El9cLWU',
      'https://www.youtube.com/@MSAatUIC',
    ],
  },
];
