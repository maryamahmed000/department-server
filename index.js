// index.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./authRoutes');

const app = express(); // ✅ تعريف app قبل استخدامه

app.use(cors()); // ✅ تفعيل CORS للسماح بالاتصال من الواجهة
app.use(express.json()); // ✅ لتحليل JSON من الطلبات

// ✅ استخدام المسارات (Routes)
app.use('/api', authRoutes);

// ✅ تشغيل السيرفر
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
