import express, { Request, Response } from 'express';
import cors from 'cors';
import { faker } from '@faker-js/faker';
import nodemailer from 'nodemailer';

const app = express();
const PORT: number = Number(process.env.PORT) || 5001;

app.use(cors());
app.use(express.json());

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
// IMPORTANT: To send real emails via Gmail, you must use an "App Password"
// 1. Go to your Google Account -> Security -> 2-Step Verification
// 2. Scroll to "App Passwords" and create one for "Mail"
const EMAIL_USER = 'rutvikhyper@gmail.com'; // Change this
const EMAIL_PASS = 'qdtvmturgxnfvsdu';    // Change this

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
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

app.post('/api/signup-email', async (req: Request, res: Response) => {
  try {
    const { email, username } = req.body;
    console.log(`📡 Request to send signup email to: ${email}`);

    const mailOptions = {
      from: `"Test data generator" <${EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Test data generator!',
      text: `Hello ${username}, you are successfully sign up, enjoy!`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; background-color: #f9fafb; border-radius: 12px;">
          <h2 style="color: #6366f1;">Welcome to Test data generator!</h2>
          <p>Hello <strong>${username}</strong>,</p>
          <p>You are successfully sign up, enjoy!</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6b7280;">This is an automated message from the Test data generator.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Real email sent to: ${email}`);
    res.json({ success: true });
  } catch (error) {
    console.error('📧 Email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
