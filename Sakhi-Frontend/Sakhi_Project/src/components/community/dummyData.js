export const COMMUNITY_CATEGORIES = [
  'All',
  'Career',
  'Education',
  'Sakhi Academy',
  'Job Search',
  'Entrepreneurship',
  'General Discussion',
  'Success Stories',
  'Advice',
  'Technology',
  'Finance',
  'Other'
];

export const INITIAL_DUMMY_POSTS = [
  {
    id: 'post-1',
    author: {
      id: 'user-101',
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      role: 'Software Developer'
    },
    title: 'How did you prepare for your first technical interview?',
    content: 'I have an interview coming up for a Frontend Engineer role next week! I would love to hear about everyone’s experiences, mock interview tips, and how you managed nerves during live coding sessions. Any advice on DSA vs projects focus?',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80',
    category: 'Career',
    likesCount: 24,
    commentsCount: 8,
    isLiked: false,
    isBookmarked: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    id: 'post-2',
    author: {
      id: 'user-102',
      name: 'Ananya Verma',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      role: 'Bootcamp Instructor'
    },
    title: 'Free Webinar: Transitioning from Non-Tech to Full-Stack Web Development',
    content: 'Hi Sakhi Community! We are hosting a live hands-on session this Saturday covering HTML, CSS, React, and Node.js. If you’re self-studying or considering a career pivot, come join us! Questions welcome below.',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000&auto=format&fit=crop&q=80',
    category: 'Education',
    likesCount: 56,
    commentsCount: 19,
    isLiked: true,
    isBookmarked: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
  },
  {
    id: 'post-3',
    author: {
      id: 'user-103',
      name: 'Meera Deshmukh',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
      role: 'Handicraft Artisan & Entrepreneur'
    },
    title: 'My small business reached 500 online orders thanks to Sakhi Network!',
    content: 'Started my eco-friendly home decor store 6 months ago feeling unsure about digital marketing. Thanks to advice shared in this community and Sakhi Academy modules, we just fulfilled our 500th order! Never give up on your dreams, sisters!',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1000&auto=format&fit=crop&q=80',
    category: 'Success Stories',
    likesCount: 112,
    commentsCount: 34,
    isLiked: false,
    isBookmarked: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    id: 'post-4',
    author: {
      id: 'user-104',
      name: 'Dr. Radhika Nair',
      avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150&auto=format&fit=crop&q=80',
      role: 'Financial Literacy Coach'
    },
    title: '5 Financial Habits every working woman should start today',
    content: '1. Create a 6-month emergency fund in a high-yield account\n2. Automate monthly SIP investments\n3. Track subscriptions & recurring expenses\n4. Invest in personal health insurance separate from employer cover\n5. Negotiate your pay with confidence!',
    imageUrl: null,
    category: 'Finance',
    likesCount: 89,
    commentsCount: 15,
    isLiked: false,
    isBookmarked: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  }
];

export const COMMUNITY_RULES = [
  'Be respectful, supportive, and empathetic to all members.',
  'No harassment, hate speech, or offensive content.',
  'No spam, self-promotional clutter, or unauthorized sales link posting.',
  'Protect personal information; respect privacy.',
  'Keep discussions constructive, safe, and helpful.'
];

export const POPULAR_TOPICS = [
  'Career Transition',
  'Tech Interview Prep',
  'Sakhi Academy Courses',
  'Women Entrepreneurship',
  'Financial Independence',
  'Resume Review',
  'Work-Life Balance'
];
