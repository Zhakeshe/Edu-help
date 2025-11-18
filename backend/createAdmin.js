require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB-ға қосылды');

    // Сіздің email-ңізді енгізіңіз
    const email = 'admin@eduhelp.kz';
    const password = 'admin123';
    const fullName = 'Edu-help Админ';

    // Пайдаланушы бар ма тексеру
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Егер бар болса, админ роліне өзгерту
      existingUser.role = 'admin';
      await existingUser.save();
      console.log(`✅ ${email} - админ роліне өзгертілді!`);
    } else {
      // Егер жоқ болса, жаңа админ жасау
      const admin = await User.create({
        email,
        password,
        fullName,
        role: 'admin'
      });
      console.log(`✅ Жаңа админ жасалды: ${email}`);
      console.log(`   Email: ${email}`);
      console.log(`   Құпия сөз: ${password}`);
    }

    console.log('\n🎉 Дайын! Енді осы email және құпия сөзбен кіре аласыз.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Қате:', error.message);
    process.exit(1);
  }
};

createAdmin();
