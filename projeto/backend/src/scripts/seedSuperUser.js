import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

async function seed() {
  await connectDB();

  const email = String(process.env.SUPER_EMAIL ?? '').trim().toLowerCase();
  const passwordHash = await bcrypt.hash(process.env.SUPER_PASSWORD, 10);

  const exists = await User.findOne({ email });
  if (exists) {
    exists.name = process.env.SUPER_NAME;
    exists.email = email;
    exists.passwordHash = passwordHash;
    exists.role = 'super';
    exists.active = true;
    await exists.save();

    console.log('Super usuário sincronizado com sucesso');
    process.exit(0);
  }

  await User.create({
    name: process.env.SUPER_NAME,
    email,
    passwordHash,
    role: 'super',
    active: true
  });

  console.log('Super usuário criado com sucesso');
  process.exit(0);
}

seed();
