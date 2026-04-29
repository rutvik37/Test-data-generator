import express, { Request, Response } from 'express';
import cors from 'cors';
import { faker } from '@faker-js/faker';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT: number = Number(process.env.PORT) || 5001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- MONGODB CONNECTION ---
const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set. Please add it to your .env file or environment variables.');
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// --- USER SCHEMA & MODEL ---
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  passwordPlain: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() },
  profileImage: { type: String, default: '' },
  status: { type: String, default: 'active' },
});

const User = mongoose.model('User', userSchema);

// --- INTERFACES ---
interface SchemaField {
  name: string;
  type: string;
}

interface GenerateRequestBody {
  schema: SchemaField[];
  count: number;
}

type FakeValue = string | number | boolean;

function generateFakeData(type: string): FakeValue {
  switch (type) {
    case 'UUID': return faker.string.uuid();
    case 'First Name': return faker.person.firstName();
    case 'Last Name': return faker.person.lastName();
    case 'Full Name': return faker.person.fullName();
    case 'Email': return faker.internet.email();
    case 'Phone': return faker.phone.number();
    case 'Address': return faker.location.streetAddress();
    case 'City': return faker.location.city();
    case 'Country': return faker.location.country();
    case 'Zip Code': return faker.location.zipCode();
    case 'Company': return faker.company.name();
    case 'Job Title': return faker.person.jobTitle();
    case 'Date (Past)': return faker.date.past().toISOString();
    case 'Date (Future)': return faker.date.future().toISOString();
    case 'Boolean': return faker.datatype.boolean();
    case 'Number': return faker.number.int({ min: 1, max: 1000 });
    case 'Price': return faker.commerce.price();
    case 'Product Name': return faker.commerce.productName();
    case 'Product Category': return faker.commerce.department();
    case 'Username': return faker.internet.username();
    case 'Password': return faker.internet.password();
    case 'String':
    default: return faker.word.sample();
  }
}

app.post('/api/generate', (req: Request<{}, {}, GenerateRequestBody>, res: Response) => {
  try {
    const { schema, count } = req.body;

    if (!schema || !Array.isArray(schema) || schema.length === 0) {
      res.status(400).json({ error: 'Valid schema is required' });
      return;
    }

    const numRecords: number = parseInt(String(count)) || 10;
    const result: Record<string, FakeValue>[] = [];

    for (let i = 0; i < numRecords; i++) {
      const record: Record<string, FakeValue> = {};
      schema.forEach((field: SchemaField) => {
        if (field.name && field.name.trim() !== '') {
          record[field.name] = generateFakeData(field.type);
        }
      });
      result.push(record);
    }

    res.json(result);
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Failed to generate data' });
  }
});

// --- EMAIL CONFIGURATION ---
const EMAIL_USER = 'rutvikhyper@gmail.com';
const EMAIL_PASS = 'qdtvmturgxnfvsdu';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

console.log('⏳ Verifying Email Transporter...');
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email Transporter Error:', error);
    console.log('Note: If you see ETIMEDOUT, your internet/firewall might be blocking the SMTP port.');
  } else {
    console.log('✅ Email Transporter is ready to send messages');
  }
});

const otpStore = new Map<string, { hash: string, expiresAt: number, failedAttempts: number, tempUser?: any }>();
const blockStore = new Map<string, number>();

function generateOTP(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashString(str: string): string {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

// --- AUTH ROUTES ---
app.post('/api/signup', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    if (!isValidUsername(username)) {
      res.status(400).json({ error: 'Username must be 3-20 characters long and can only contain letters, numbers, and underscores.' });
      return;
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      res.status(400).json({ error: 'User already exists with this email.' });
      return;
    }

    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      res.status(400).json({ error: 'Username already taken.' });
      return;
    }

    if (blockStore.has(email)) {
      const blockUntil = blockStore.get(email)!;
      if (Date.now() < blockUntil) {
        res.status(429).json({ error: 'Too many failed attempts. Please try again later.' });
        return;
      } else {
        blockStore.delete(email);
      }
    }

    const otp = generateOTP();
    const hash = hashString(otp);
    const passwordHash = hashString(password);

    otpStore.set(email, {
      hash,
      expiresAt: Date.now() + 5 * 60 * 1000,
      failedAttempts: 0,
      tempUser: { email, username, passwordHash, passwordPlain: password }
    });

    const mailOptions = {
      from: `"Test data generator" <${EMAIL_USER}>`,
      to: email,
      subject: 'Verify your account - Test data generator',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; background-color: #f9fafb; border-radius: 12px;">
          <h2 style="color: #6366f1;">Welcome to Test data generator!</h2>
          <p>Your account has been created successfully.</p>
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p>Your verification code is: <strong style="font-size: 24px; color: #4f46e5; letter-spacing: 2px;">${otp}</strong></p>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions)
      .then(() => console.log(`✅ OTP email sent to: ${email}`))
      .catch((error) => console.error('📧 Email error:', error));
    res.json({ success: true });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to process signup' });
  }
});

app.post('/api/verify-otp', async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (blockStore.has(email) && Date.now() < blockStore.get(email)!) {
    res.status(429).json({ error: 'Too many failed attempts. Try again in 10 minutes.' });
    return;
  }

  const record = otpStore.get(email);
  if (!record) {
    res.status(400).json({ error: 'No pending verification found or OTP expired. Please request a new one.' });
    return;
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    res.status(400).json({ error: 'OTP expired. Request new one.' });
    return;
  }

  if (hashString(otp) !== record.hash) {
    record.failedAttempts += 1;
    if (record.failedAttempts >= 5) {
      blockStore.set(email, Date.now() + 10 * 60 * 1000);
      otpStore.delete(email);
      res.status(429).json({ error: 'Too many failed attempts. You are temporarily blocked for 10 minutes.' });
    } else {
      res.status(400).json({ error: `Invalid OTP. ${5 - record.failedAttempts} attempts remaining.` });
    }
    return;
  }

  // Success — save user to MongoDB
  if (record.tempUser) {
    const newUser = new User({
      id: crypto.randomUUID(),
      email: record.tempUser.email.toLowerCase(),
      username: record.tempUser.username.toLowerCase(),
      passwordHash: record.tempUser.passwordHash,
      passwordPlain: record.tempUser.passwordPlain,
      createdAt: new Date().toISOString(),
    });
    await newUser.save();
    console.log('✅ Saved User to MongoDB:', newUser.email);
  }

  otpStore.delete(email);
  res.json({ success: true, user: record.tempUser ? { email: record.tempUser.email, username: record.tempUser.username } : null });
});

app.post('/api/resend-otp', async (req: Request, res: Response) => {
  try {
    const { email, username } = req.body;

    if (blockStore.has(email) && Date.now() < blockStore.get(email)!) {
      res.status(429).json({ error: 'Too many failed attempts. Try again later.' });
      return;
    }

    const oldRecord = otpStore.get(email);
    const tempUser = oldRecord?.tempUser;

    const otp = generateOTP();
    const hash = hashString(otp);

    otpStore.set(email, {
      hash,
      expiresAt: Date.now() + 5 * 60 * 1000,
      failedAttempts: 0,
      tempUser
    });

    const mailOptions = {
      from: `"Test data generator" <${EMAIL_USER}>`,
      to: email,
      subject: 'New verification code - Test data generator',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; background-color: #f9fafb; border-radius: 12px;">
          <h2 style="color: #6366f1;">Test data generator</h2>
          <p>Hello <strong>${username}</strong>,</p>
          <p>Your new verification code is: <strong style="font-size: 24px; color: #4f46e5; letter-spacing: 2px;">${otp}</strong></p>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions)
      .then(() => console.log(`✅ Resent OTP email to: ${email}`))
      .catch((error) => console.error('📧 Email error:', error));
    res.json({ success: true });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to process resend OTP' });
  }
});

app.post('/api/signin', async (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  console.log('Identifier:', identifier);

  if (!identifier || !password) {
    res.status(400).json({ error: 'Identifier and password are required' });
    return;
  }

  const isEmail = identifier.includes('@');
  const query = isEmail
    ? { email: identifier.toLowerCase() }
    : { username: identifier.toLowerCase() };

  const user = await User.findOne(query);

  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  if (user.status === 'deleted_by_user') {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const isMatch = user.passwordHash === hashString(password);
  if (!isMatch) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  if (user.status === 'deleted_by_admin') {
    res.status(401).json({ error: 'your account was deleted by administrator' });
    return;
  }

  if (user.status === 'deactivated') {
    res.status(401).json({ error: 'Your account has been deactivated by an administrator.' });
    return;
  }

  res.json({ success: true, user: { email: user.email, username: user.username, profileImage: user.profileImage } });
});

app.put('/api/profile', async (req: Request, res: Response) => {
  const { currentEmail, email, username, profileImage } = req.body;

  if (!isValidUsername(username)) {
    res.status(400).json({ error: 'Username must be 3-20 characters long and can only contain letters, numbers, and underscores.' });
    return;
  }

  const user = await User.findOne({ email: currentEmail });
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (email.toLowerCase() !== currentEmail.toLowerCase()) {
    const emailTaken = await User.findOne({ email: email.toLowerCase() });
    if (emailTaken) {
      res.status(400).json({ error: 'Email is already taken by another account.' });
      return;
    }
  }

  const usernameTaken = await User.findOne({
    email: { $ne: currentEmail },
    username: username.toLowerCase()
  });
  if (usernameTaken) {
    res.status(400).json({ error: 'Username is already taken by another account.' });
    return;
  }

  user.email = email;
  user.username = username;
  if (profileImage !== undefined) {
    user.profileImage = profileImage;
  }
  await user.save();

  res.json({ success: true, user: { email, username, profileImage: user.profileImage } });
});

app.delete('/api/profile', async (req: Request, res: Response) => {
  const { currentEmail } = req.body;
  const user = await User.findOne({ email: currentEmail });

  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  user.status = 'deleted_by_user';
  await user.save();
  res.json({ success: true });
});

app.post('/api/verify-status', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.json({ success: true });

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (user.status === 'deleted_by_admin') {
    return res.status(401).json({ error: 'your account was deleted by administrator' });
  }
  if (user.status === 'deactivated') {
    return res.status(401).json({ error: 'Your account has been deactivated by an administrator.' });
  }
  if (user.status === 'deleted_by_user') {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json({ success: true });
});

// --- ADMIN ROUTES ---
app.post('/api/admin/signin', (req: Request, res: Response) => {
  const { email, password, code } = req.body;
  if (code === '5555') {
    res.json({ success: true, user: { role: 'admin' } });
  } else if (email === 'admin@admin.com' && password === 'admin123') {
    res.json({ success: true, user: { role: 'admin' } });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials' });
  }
});

app.get('/api/admin/users', async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, { _id: 0, __v: 0 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.put('/api/admin/users/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const user = await User.findOne({ id });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  user.status = status;
  await user.save();
  res.json({ success: true, user });
});

app.delete('/api/admin/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findOne({ id });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  user.status = 'deleted_by_admin';
  await user.save();
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
