import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from '../models/Post.js';
import { connectDB } from '../config/db.js';

dotenv.config();

const samplePosts = [
    {
        author: {
            uid: 'user-101',
            name: 'Priya Sharma',
            email: 'priya@example.com',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
            role: 'Software Developer'
        },
        title: 'How did you prepare for your first technical interview?',
        content: 'I have an interview coming up for a Frontend Engineer role next week! I would love to hear about everyone’s experiences, mock interview tips, and how you managed nerves during live coding sessions. Any advice on DSA vs projects focus?',
        category: 'Career',
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80',
        likes: ['user-102', 'user-103', 'user-104'],
        bookmarks: ['user-102'],
        commentsCount: 8
    },
    {
        author: {
            uid: 'user-102',
            name: 'Ananya Verma',
            email: 'ananya@example.com',
            avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
            role: 'Bootcamp Instructor'
        },
        title: 'Free Webinar: Transitioning from Non-Tech to Full-Stack Web Development',
        content: 'Hi Sakhi Community! We are hosting a live hands-on session this Saturday covering HTML, CSS, React, and Node.js. If you’re self-studying or considering a career pivot, come join us! Questions welcome below.',
        category: 'Education',
        imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000&auto=format&fit=crop&q=80',
        likes: ['user-101', 'user-103', 'user-105', 'user-106'],
        bookmarks: ['user-101'],
        commentsCount: 19
    },
    {
        author: {
            uid: 'user-103',
            name: 'Meera Deshmukh',
            email: 'meera@example.com',
            avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
            role: 'Handicraft Artisan & Entrepreneur'
        },
        title: 'My small business reached 500 online orders thanks to Sakhi Network!',
        content: 'Started my eco-friendly home decor store 6 months ago feeling unsure about digital marketing. Thanks to advice shared in this community and Sakhi Academy modules, we just fulfilled our 500th order! Never give up on your dreams, sisters! 🌸💪',
        category: 'Success Stories',
        imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1000&auto=format&fit=crop&q=80',
        likes: ['user-101', 'user-102', 'user-104', 'user-105', 'user-106', 'user-107'],
        bookmarks: [],
        commentsCount: 34
    },
    {
        author: {
            uid: 'user-104',
            name: 'Dr. Radhika Nair',
            email: 'radhika@example.com',
            avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150&auto=format&fit=crop&q=80',
            role: 'Financial Literacy Coach'
        },
        title: '5 Financial Habits every working woman should start today',
        content: '1. Create a 6-month emergency fund in a high-yield account\n2. Automate monthly SIP investments\n3. Track subscriptions & recurring expenses\n4. Invest in personal health insurance separate from employer cover\n5. Negotiate your pay with confidence!',
        category: 'Finance',
        imageUrl: null,
        likes: ['user-101', 'user-102', 'user-103'],
        bookmarks: ['user-101', 'user-103'],
        commentsCount: 15
    }
];

const seedPosts = async () => {
    try {
        await connectDB();
        console.log('[Seed] Connected to MongoDB...');

        const existingCount = await Post.countDocuments();
        if (existingCount > 0) {
            console.log(`[Seed] Database already contains ${existingCount} posts. Skipping seed.`);
            process.exit(0);
        }

        await Post.insertMany(samplePosts);
        console.log(`[Seed] Successfully seeded ${samplePosts.length} initial community posts!`);
        process.exit(0);
    } catch (error) {
        console.error('[Seed] Error seeding community posts:', error);
        process.exit(1);
    }
};

seedPosts();
