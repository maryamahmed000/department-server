// index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);

// ⭐ إضافة خدمة ملفات الواجهة الأمامية
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
