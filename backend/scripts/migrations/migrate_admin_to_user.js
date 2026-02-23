const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Admin = require('../../models/Admin');
const User = require('../../models/User');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const apply = process.argv.includes('--apply');

async function run() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI табылмады');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const admins = await Admin.find({});
  const report = {
    totalAdmins: admins.length,
    wouldCreateUsers: 0,
    wouldPromoteUsers: 0,
    createdUsers: 0,
    promotedUsers: 0
  };

  for (const admin of admins) {
    const existingUser = await User.findOne({ email: admin.email.toLowerCase() });

    if (!existingUser) {
      report.wouldCreateUsers += 1;
      if (apply) {
        await User.create({
          fullName: admin.username || 'Админ',
          email: admin.email.toLowerCase(),
          authMethod: 'otp',
          role: 'admin'
        });
        report.createdUsers += 1;
      }
      continue;
    }

    if (existingUser.role !== 'admin') {
      report.wouldPromoteUsers += 1;
      if (apply) {
        existingUser.role = 'admin';
        await existingUser.save();
        report.promotedUsers += 1;
      }
    }
  }

  console.log('=== migrate_admin_to_user ===');
  console.log('mode:', apply ? 'APPLY' : 'DRY-RUN');
  console.log(JSON.stringify(report, null, 2));

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('Migration error:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
