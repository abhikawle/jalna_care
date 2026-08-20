import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import doctorModel from './models/doctorModel.js';

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

const providers = [
  {
    name: 'Dr. Nikhil Deshmukh',
    email: 'nikhil@jalnacare.in',
    password: 'JalnaCare@123',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',
    speciality: 'Physiotherapist',
    degree: 'BPTh, MPTh',
    experience: '7 Years',
    about: 'Physiotherapist helping Jalna patients recover mobility, strength, and confidence after injury or illness.',
    fees: 400,
    address: { line1: 'Ambad Road', line2: 'Jalna, Maharashtra', taluka: 'Jalna', village: 'Jalna', city: 'Jalna', state: 'Maharashtra', zipcode: '431203' },
    available: true,
    clinicName: 'MoveWell Physiotherapy Clinic',
    clinicAddress: { line1: 'Ambad Road', city: 'Jalna', state: 'Maharashtra', zipcode: '431203' },
    phoneNumber: '9012345678',
    providerType: 'clinic',
    consultationModes: ['in-clinic', 'video', 'home-visit'],
    homeVisitAvailable: true,
    homeVisitFee: 250,
    serviceRadius: 15,
    verificationStatus: 'verified',
    isVerified: true,
    verificationDate: new Date(),
    avgRating: 4.8,
    totalReviews: 35,
    date: Date.now(),
  },
  {
    name: 'Dr. Aarti Kulkarni',
    email: 'aarti@jalnacare.in',
    password: 'JalnaCare@123',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80',
    speciality: 'General physician',
    degree: 'MBBS, MD (Medicine)',
    experience: '12 Years',
    about: 'Jalna-based family physician helping patients with preventive care, routine consultations, and long-term wellness planning.',
    fees: 450,
    address: { line1: 'Shivaji Nagar', line2: 'Jalna, Maharashtra' },
    available: true,
    clinicName: 'Aarti Family Clinic',
    clinicAddress: { line1: 'Shivaji Nagar', city: 'Jalna', state: 'Maharashtra', zipcode: '431203' },
    phoneNumber: '9876543210',
    providerType: 'individual',
    consultationModes: ['in-clinic', 'video', 'same-day'],
    sameDayAvailable: true,
    verificationStatus: 'verified',
    isVerified: true,
    verificationDate: new Date(),
    avgRating: 4.8,
    totalReviews: 64,
    date: Date.now(),
  },
  {
    name: 'Dr. Sneha Patil',
    email: 'sneha@jalnacare.in',
    password: 'JalnaCare@123',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=900&q=80',
    speciality: 'Gynecologist',
    degree: 'MBBS, DGO',
    experience: '10 Years',
    about: 'Women’s health specialist focused on pregnancy care, reproductive health, and community awareness in Jalna.',
    fees: 600,
    address: { line1: 'Jai Bhavani Road', line2: 'Jalna, Maharashtra' },
    available: true,
    clinicName: 'Sneha Women Care',
    clinicAddress: { line1: 'Jai Bhavani Road', city: 'Jalna', state: 'Maharashtra', zipcode: '431203' },
    phoneNumber: '9123456780',
    providerType: 'clinic',
    consultationModes: ['video', 'in-clinic'],
    sameDayAvailable: false,
    verificationStatus: 'verified',
    isVerified: true,
    verificationDate: new Date(),
    avgRating: 4.9,
    totalReviews: 78,
    date: Date.now(),
  },
  {
    name: 'Dr. Rohan Wagh',
    email: 'rohan@jalnacare.in',
    password: 'JalnaCare@123',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
    speciality: 'Pediatricians',
    degree: 'MBBS, MD (Pediatrics)',
    experience: '8 Years',
    about: 'Child health expert offering infant care, vaccination guidance, developmental reviews, and family consultations.',
    fees: 500,
    address: { line1: 'Gandhi Chowk', line2: 'Jalna, Maharashtra' },
    available: true,
    clinicName: 'LittleBloom Pediatrics',
    clinicAddress: { line1: 'Gandhi Chowk', city: 'Jalna', state: 'Maharashtra', zipcode: '431203' },
    phoneNumber: '9988776655',
    providerType: 'clinic',
    consultationModes: ['in-clinic', 'same-day'],
    sameDayAvailable: true,
    verificationStatus: 'verified',
    isVerified: true,
    verificationDate: new Date(),
    avgRating: 4.7,
    totalReviews: 47,
    date: Date.now(),
  },
  {
    name: 'Dr. Meera Shah',
    email: 'meera@jalnacare.in',
    password: 'JalnaCare@123',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80',
    speciality: 'Dermatologist',
    degree: 'MBBS, MD (Dermatology)',
    experience: '9 Years',
    about: 'Skin and hair specialist helping Jalna residents with acne, allergies, pigmentation, and preventive dermatology care.',
    fees: 700,
    address: { line1: 'Main Road', line2: 'Jalna, Maharashtra' },
    available: true,
    clinicName: 'GlowSkin Clinic',
    clinicAddress: { line1: 'Main Road', city: 'Jalna', state: 'Maharashtra', zipcode: '431203' },
    phoneNumber: '9090909090',
    providerType: 'clinic',
    consultationModes: ['video', 'in-clinic'],
    sameDayAvailable: true,
    verificationStatus: 'verified',
    isVerified: true,
    verificationDate: new Date(),
    avgRating: 4.9,
    totalReviews: 91,
    date: Date.now(),
  }
];

const seedJalnaCareProviders = async () => {
  if (!uri) {
    console.error('MONGO_URI is missing. Set it in backend/.env before running the seed script.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Database connected for JalnaCare seed');

    for (const provider of providers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(provider.password, salt);

      await doctorModel.findOneAndUpdate(
        { email: provider.email },
        { ...provider, password: hashedPassword },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log(`Seeded provider: ${provider.name}`);
    }

    console.log('JalnaCare provider seed complete');
  } catch (error) {
    console.error('Seed failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected');
  }
};

seedJalnaCareProviders();
