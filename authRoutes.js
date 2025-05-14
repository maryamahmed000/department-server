const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// بيانات تسجيل الدخول
const users = [
  { username: 'civil_lead', password: 'Civ@2024!', role: 'civil' },
  { username: 'electrical_', password: 'Elec@2024!', role: 'electrical' },
  { username: 'mech_anical', password: 'Mech@2024!', role: 'mechanical' },
  { username: 'arc_', password: 'Arch@2024!', role: 'architecture' },
  { username: '@science', password: 'Sci@2024!', role: 'science' },
  { username: 'hr_admin', password: 'HR@2024!', role: 'hr' },
];

// تسجيل الدخول (مسموح فقط من يوم 14 إلى 17)
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const found = users.find(user => user.username === username && user.password === password);

  if (!found) {
    return res.json({ success: false });
  }

  const today = new Date();
  const day = today.getDate();

  // السماح بالدخول فقط بين يوم 14 إلى 17
  if (day < 14 || day > 17) {
    return res.status(403).json({ success: false, message: '🚫 غير مسموح بالدخول في هذا اليوم.' });
  }

  res.json({ success: true, role: found.role });
});

// حفظ التقييمات ومنع تكرار نفس الاسم وتصنيف صحيح للألقاب
router.post('/submit-evaluation', (req, res) => {
  console.log("📥 البيانات المستلمة:", req.body);

  const { department, evaluations } = req.body;

  try {
    const evaluationsDir = path.join(__dirname, 'evaluations');
    if (!fs.existsSync(evaluationsDir)) fs.mkdirSync(evaluationsDir);

    // منع التكرار بين الجدولين
    const seenNames = new Set();
    const uniqueFilter = (group) => {
      return group.filter(item => {
        if (seenNames.has(item.name)) return false;
        seenNames.add(item.name);
        return true;
      });
    };

    const professors = uniqueFilter(
      evaluations.filter(item =>
        item.title.includes('أستاذ') || (item.title.includes('مدرس') && !item.title.includes('مساعد'))
      )
    );

    const assistants = uniqueFilter(
      evaluations.filter(item =>
        (
          (item.title.includes('مساعد') && !item.title.includes('أستاذ')) || 
          item.title.includes('معيد')
        )
      )
    );

    const cleanData = (group) =>
      group.map(person => ({
        id: person.id,
        name: person.name,
        title: person.title,
        الالتزام: person.الالتزام,
        الجودة: person.الجودة,
        النشاط: person.النشاط,
        المعاملة: person.المعاملة
      }));

    const sheet1 = XLSX.utils.json_to_sheet(cleanData(professors));
    const sheet2 = XLSX.utils.json_to_sheet(cleanData(assistants));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet1, 'الأساتذة والمدرسون');
    XLSX.utils.book_append_sheet(workbook, sheet2, 'الهيئة المعاونة');

    const filePath = path.join(evaluationsDir, `evaluations_${department}.xlsx`);
    XLSX.writeFile(workbook, filePath);

    res.json({ success: true, message: 'تم حفظ البيانات بنجاح' });
  } catch (err) {
    console.error("❌ الخطأ أثناء الحفظ:", err);
    res.status(500).json({ success: false, message: 'فشل في الحفظ' });
  }
});

// إرسال البيانات لـ HR
router.get('/evaluations/:department', (req, res) => {
  const { department } = req.params;
  const filePath = path.join(__dirname, 'evaluations', `evaluations_${department}.xlsx`);
  try {
    if (!fs.existsSync(filePath)) return res.json([]);
    const workbook = XLSX.readFile(filePath);
    const result = {};

    workbook.SheetNames.forEach(sheetName => {
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      result[sheetName] = data;
    });

    res.json(result);
  } catch (err) {
    console.error('❌ خطأ أثناء قراءة الملف:', err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
