const pptxgen = require('pptxgenjs');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';

// Theme colors
const COLORS = {
  bg: '0F172A',         // Slate 900
  cardBg: '1E293B',     // Slate 800
  cardBorder: '334155', // Slate 700
  primary: '38BDF8',   // Sky 400
  secondary: '818CF8', // Indigo 400
  accent: '34D399',    // Emerald 400
  textLight: 'F8FAFC',
  textMuted: '94A3B8',
  warning: 'FBBF24',
  danger: 'F87171'
};

// Slide helper
function createHeader(slide, title, category) {
  if (category) {
    slide.addText(category.toUpperCase(), {
      x: 0.8,
      y: 0.4,
      w: 8.0,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      color: COLORS.primary,
      bold: true,
      charSpacing: 2
    });
  }
  slide.addText(title, {
    x: 0.8,
    y: category ? 0.65 : 0.45,
    w: 11.5,
    h: 0.6,
    fontSize: 22,
    fontFace: 'Arial',
    color: COLORS.textLight,
    bold: true
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: category ? 1.3 : 1.1,
    w: 1.5,
    h: 0.05,
    fill: { color: COLORS.primary },
    line: { color: COLORS.primary }
  });
}

// 1. TITLE SLIDE
let slide1 = pptx.addSlide();
slide1.background = { color: COLORS.bg };

slide1.addShape(pptx.ShapeType.roundRect, {
  x: 0.8, y: 1.2, w: 2.4, h: 0.4,
  rectRadius: 0.1,
  fill: { color: '1E293B' },
  line: { color: COLORS.primary, width: 1 }
});
slide1.addText('🌐 KENGAYTIRILGAN SHAKLI', {
  x: 0.8, y: 1.2, w: 2.4, h: 0.4,
  fontSize: 10, fontFace: 'Arial', color: COLORS.primary, bold: true, align: 'center'
});

slide1.addText('2-MAVZU:\nKOMPYUTER TARMOQLARI\nASOSLARI', {
  x: 0.8, y: 1.8, w: 10.5, h: 2.5,
  fontSize: 38, fontFace: 'Arial', color: COLORS.textLight, bold: true,
  lineSpacingMultiple: 1.1
});

slide1.addText('Tarmoq turlari • Topologiyalar • Qurilmalar • IP/MAC • DNS • TCP/UDP • Xavfsizlik & Amaliyot', {
  x: 0.8, y: 4.5, w: 11.0, h: 0.6,
  fontSize: 14, fontFace: 'Arial', color: COLORS.primary, bold: false
});

slide1.addShape(pptx.ShapeType.roundRect, {
  x: 0.8, y: 5.4, w: 11.7, h: 1.2,
  rectRadius: 0.1,
  fill: { color: '1E293B' },
  line: { color: '334155', width: 1 }
});

slide1.addText('📌 Kurs: Axborot Texnologiyalari va Tarmoqlar   |   🎯 Maqsad: Nazariy & Amaliy ko\'nikmalar', {
  x: 1.0, y: 5.75, w: 11.3, h: 0.5,
  fontSize: 12, fontFace: 'Arial', color: COLORS.textMuted
});

// 2. AGENDA SLIDE
let slide2 = pptx.addSlide();
slide2.background = { color: COLORS.bg };
createHeader(slide2, 'Dars Rejasi (Mavzu Mundarijasi)', 'Kirish');

const topics = [
  { num: '01', title: 'Kompyuter Tarmog\'i nima?', desc: 'Tarmoq tushunchasi va turlari (PAN, LAN, MAN, WAN)' },
  { num: '02', title: 'Tarmoq Topologiyalari', desc: 'Shina, Halqa, Yulduz, Daraxtsimon tuzilmalar' },
  { num: '03', title: 'Asosiy Tarmoq Qurilmalari', desc: 'Switch, Router, Modem, Access Point vazifalari' },
  { num: '04', title: 'IP va MAC Manzillar', desc: 'Jismoniy va mantiqiy identifikatorlar (IPv4 vs IPv6)' },
  { num: '05', title: 'DNS Tizimi & Protokollar', desc: 'DNS ishlashi, TCP va UDP o\'rtasidagi farqlar' },
  { num: '06', title: 'Xavfsizlik & Mantiqiy IQ', desc: 'Firewall, VPN, DHCP va interaktiv jumboqlar' },
  { num: '07', title: 'Amaliy Topshiriq (CMD)', desc: 'ipconfig, ping, nslookup, tracert, netstat' }
];

topics.forEach((t, i) => {
  const row = Math.floor(i / 2);
  const col = i % 2;
  const x = 0.8 + col * 5.9;
  const y = 1.6 + row * 1.35;
  
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: x, y: y, w: 5.6, h: 1.15,
    rectRadius: 0.1,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.cardBorder, width: 1 }
  });
  
  slide2.addText(t.num, {
    x: x + 0.2, y: y + 0.15, w: 0.7, h: 0.8,
    fontSize: 24, fontFace: 'Arial', color: COLORS.primary, bold: true, align: 'center'
  });
  
  slide2.addText(t.title, {
    x: x + 1.0, y: y + 0.15, w: 4.4, h: 0.35,
    fontSize: 14, fontFace: 'Arial', color: COLORS.textLight, bold: true
  });
  
  slide2.addText(t.desc, {
    x: x + 1.0, y: y + 0.52, w: 4.4, h: 0.5,
    fontSize: 10, fontFace: 'Arial', color: COLORS.textMuted
  });
});

// 3. KOMPYUTER TARMOG'I NIMA?
let slide3 = pptx.addSlide();
slide3.background = { color: COLORS.bg };
createHeader(slide3, '1. Kompyuter Tarmog\'i Nima?', 'Asosiy Tushuncha');

slide3.addShape(pptx.ShapeType.roundRect, {
  x: 0.8, y: 1.6, w: 11.7, h: 1.6,
  rectRadius: 0.15,
  fill: { color: COLORS.cardBg },
  line: { color: COLORS.primary, width: 2 }
});

slide3.addText('💡 TA\'RIF', {
  x: 1.1, y: 1.8, w: 11.0, h: 0.3,
  fontSize: 12, fontFace: 'Arial', color: COLORS.primary, bold: true
});

slide3.addText('Kompyuter tarmog‘i — o‘zaro ma’lumot va resurslar (fayllar, internet, printer) almashish uchun ulangan kompyuterlar va qurilmalar tizimidir.', {
  x: 1.1, y: 2.15, w: 11.0, h: 0.85,
  fontSize: 16, fontFace: 'Arial', color: COLORS.textLight, bold: false
});

const networkBenefits = [
  { title: '📁 Resurslar Almashinuvi', desc: 'Fayllar, dasturlar, ma\'lumotlar bazalarini birgalikda foydalanish.' },
  { title: '🖨 Uskunalarni Bo\'lishish', desc: 'Bitta printerni, skanerni yoki serverni butun jamoa ishlatishi.' },
  { title: '⚡ Tezkor Aloqa', desc: 'Xabarlar, e-mail, video muloqot va onlayn hamkorlik tizimlari.' }
];

networkBenefits.forEach((b, i) => {
  const x = 0.8 + i * 4.0;
  slide3.addShape(pptx.ShapeType.roundRect, {
    x: x, y: 3.5, w: 3.7, h: 3.0,
    rectRadius: 0.15,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.cardBorder, width: 1 }
  });
  
  slide3.addText(b.title, {
    x: x + 0.3, y: 3.8, w: 3.1, h: 0.6,
    fontSize: 15, fontFace: 'Arial', color: COLORS.secondary, bold: true
  });
  
  slide3.addText(b.desc, {
    x: x + 0.3, y: 4.5, w: 3.1, h: 1.7,
    fontSize: 12, fontFace: 'Arial', color: COLORS.textMuted
  });
});

// 4. TARMOQ TURLARI (HAJMIGA KO'RA)
let slide4 = pptx.addSlide();
slide4.background = { color: COLORS.bg };
createHeader(slide4, 'Tarmoq Turlari (Hajmiga Ko\'ra)', 'Klassifikatsiya');

const netTypes = [
  {
    type: 'PAN',
    name: 'Personal Area Network',
    scope: '1 - 10 metr',
    badgeColor: '38BDF8',
    desc: 'Shaxsiy tarmoq. Bir kishi atrofidagi qurilmalar.',
    example: 'Masalan: Bluetooth orqali telefon va naushnik/aqlli soat ulanishi.'
  },
  {
    type: 'LAN',
    name: 'Local Area Network',
    scope: '1 bino / xona',
    badgeColor: '34D399',
    desc: 'Mahalliy tarmoq. Bitta bino yoki xona ichidagi tarmoq.',
    example: 'Masalan: Maktab sinfxonasi, uy yoki ofis tarmog‘i.'
  },
  {
    type: 'MAN',
    name: 'Metropolitan Area Network',
    scope: 'Shahar / Tuman',
    badgeColor: '818CF8',
    desc: 'Shahar miqyosidagi tarmoq.',
    example: 'Masalan: Shahar banklari filiallari yoki kuzatuv kameralar tarmog‘i.'
  },
  {
    type: 'WAN',
    name: 'Wide Area Network',
    scope: 'Global / Butun dunyo',
    badgeColor: 'F472B6',
    desc: 'Global tarmoq. Butun dunyoni bog‘laydi.',
    example: 'Eng katta WAN tarmog‘i — bu butun dunyoni qamrab olgan Internet!'
  }
];

netTypes.forEach((nt, i) => {
  const x = 0.8 + i * 3.0;
  slide4.addShape(pptx.ShapeType.roundRect, {
    x: x, y: 1.6, w: 2.75, h: 5.1,
    rectRadius: 0.15,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.cardBorder, width: 1 }
  });
  
  slide4.addShape(pptx.ShapeType.roundRect, {
    x: x + 0.25, y: 1.9, w: 2.25, h: 0.6,
    rectRadius: 0.1,
    fill: { color: '0F172A' },
    line: { color: nt.badgeColor, width: 2 }
  });
  
  slide4.addText(nt.type, {
    x: x + 0.25, y: 1.9, w: 2.25, h: 0.6,
    fontSize: 20, fontFace: 'Arial', color: nt.badgeColor, bold: true, align: 'center'
  });
  
  slide4.addText(nt.name, {
    x: x + 0.2, y: 2.7, w: 2.35, h: 0.6,
    fontSize: 12, fontFace: 'Arial', color: COLORS.textLight, bold: true, align: 'center'
  });
  
  slide4.addText('Qamrovi: ' + nt.scope, {
    x: x + 0.2, y: 3.3, w: 2.35, h: 0.35,
    fontSize: 10, fontFace: 'Arial', color: COLORS.primary, bold: true, align: 'center'
  });
  
  slide4.addText(nt.desc, {
    x: x + 0.25, y: 3.8, w: 2.25, h: 1.1,
    fontSize: 11, fontFace: 'Arial', color: COLORS.textLight
  });
  
  slide4.addText('📌 ' + nt.example, {
    x: x + 0.25, y: 5.0, w: 2.25, h: 1.4,
    fontSize: 10, fontFace: 'Arial', color: COLORS.textMuted
  });
});

// 5. TARMOQ TOPOLOGIYALARI
let slide5 = pptx.addSlide();
slide5.background = { color: COLORS.bg };
createHeader(slide5, '2. Tarmoq Topologiyalari (Ulanish Shakllari)', 'Arxitektura');

const topologies = [
  {
    icon: '🚌',
    title: 'Shina (Bus) Topologiyasi',
    desc: 'Barcha kompyuterlar bitta umumiy magistral kabelga ketma-ket ulanadi.',
    badge: 'Oddiy / Kam xarajat',
    detail: 'Kabel uzilsa butun tarmoq to\'xtaydi. Kichik tarmoqlarda ishlatilgan.'
  },
  {
    icon: '⭕',
    title: 'Halqa (Ring) Topologiyasi',
    desc: 'Kompyuterlar zanjir kabi bir-biriga ketma-ket ulanib, yopiq halqa hosil qiladi.',
    badge: 'Ketma-ket uzatish',
    detail: 'Ma\'lumot faqat bir yo\'nalishda aylanadi. Bitta nuqta uzilsa halqa uziladi.'
  },
  {
    icon: '⭐',
    title: 'Yulduz (Star) Topologiyasi',
    desc: 'Barcha kompyuterlar markaziy Switch (yoki Router) qurilmasiga ulanadi.',
    badge: 'Eng ko\'p ishlatiladi',
    detail: 'Bitta kabel uzilsa boshqalariga ta\'sir qilmaydi. Zamonaviy tarmoqlar standarti.'
  },
  {
    icon: '🌳',
    title: 'Daraxtsimon (Tree) Topologiyasi',
    desc: 'Bir nechta yulduzli tarmoqlarning ierarxik ravishda bir-biriga ulanishi.',
    badge: 'Ierarxik & Kengaytiriluvchi',
    detail: 'Yirik korxonalar va ko\'p qavatli binolar uchun ideal boshqaruv tuzilmasi.'
  }
];

topologies.forEach((top, i) => {
  const row = Math.floor(i / 2);
  const col = i % 2;
  const x = 0.8 + col * 5.9;
  const y = 1.6 + row * 2.55;
  
  slide5.addShape(pptx.ShapeType.roundRect, {
    x: x, y: y, w: 5.6, h: 2.35,
    rectRadius: 0.15,
    fill: { color: COLORS.cardBg },
    line: { color: top.badge.includes('Eng') ? COLORS.primary : COLORS.cardBorder, width: top.badge.includes('Eng') ? 2 : 1 }
  });
  
  slide5.addText(`${top.icon}  ${top.title}`, {
    x: x + 0.3, y: y + 0.2, w: 5.0, h: 0.45,
    fontSize: 15, fontFace: 'Arial', color: COLORS.textLight, bold: true
  });
  
  slide5.addText(top.desc, {
    x: x + 0.3, y: y + 0.7, w: 5.0, h: 0.7,
    fontSize: 12, fontFace: 'Arial', color: COLORS.primary
  });
  
  slide5.addText(top.detail, {
    x: x + 0.3, y: y + 1.45, w: 5.0, h: 0.7,
    fontSize: 11, fontFace: 'Arial', color: COLORS.textMuted
  });
});

// 6. ASOSIY TARMOQ QURILMALARI
let slide6 = pptx.addSlide();
slide6.background = { color: COLORS.bg };
createHeader(slide6, '3. Asosiy Tarmoq Qurilmalari (Hardware)', 'Uskunalar');

const devices = [
  {
    name: 'Switch (Kommutator)',
    role: 'LAN ichki ulovchisi',
    desc: 'Mahalliy tarmoq (LAN) ichidagi kompyuterlarni kabel orqali bog\'laydi. Ma\'lumotni faqat kerakli qurilmaga MAC manzil bo\'yicha aniq yetkazadi.',
    badge: 'L2 daraja / MAC bilan ishlaydi'
  },
  {
    name: 'Router (Yo\'naltirgich)',
    role: 'Tarmoqlarni bog\'lovchi',
    desc: 'Turli xil tarmoqlarni (masalan, uydagi LAN tarmog\'ini global Internet WAN tarmog\'iga) bir-biriga bog\'laydi va eng maqbul yo\'nalishni (marshrutni) tanlaydi.',
    badge: 'L3 daraja / IP bilan ishlaydi'
  },
  {
    name: 'Modem',
    role: 'Signal o\'zgartiruvchi',
    desc: 'Provayderdan kelayotgan analog yoki optik signalni kompyuter tushunadigan raqamli signalga (va aksincha) aylantirib beradi.',
    badge: 'Modulator / Demodulator'
  },
  {
    name: 'Access Point (AP)',
    role: 'Simsiz kirish nuqtasi',
    desc: 'Kabel orqali kelgan internetni Wi-Fi signali orqali havo orqali tarqatadi, simsiz telefon va noutbuklarni tarmoqqa ulaydi.',
    badge: 'Wi-Fi qamrovi'
  }
];

devices.forEach((dev, i) => {
  const row = Math.floor(i / 2);
  const col = i % 2;
  const x = 0.8 + col * 5.9;
  const y = 1.6 + row * 2.55;
  
  slide6.addShape(pptx.ShapeType.roundRect, {
    x: x, y: y, w: 5.6, h: 2.35,
    rectRadius: 0.15,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.cardBorder, width: 1 }
  });
  
  slide6.addText(dev.name, {
    x: x + 0.3, y: y + 0.2, w: 5.0, h: 0.4,
    fontSize: 15, fontFace: 'Arial', color: COLORS.secondary, bold: true
  });
  
  slide6.addText(`Rol: ${dev.role}`, {
    x: x + 0.3, y: y + 0.6, w: 5.0, h: 0.3,
    fontSize: 11, fontFace: 'Arial', color: COLORS.primary, bold: true
  });
  
  slide6.addText(dev.desc, {
    x: x + 0.3, y: y + 0.95, w: 5.0, h: 0.8,
    fontSize: 11, fontFace: 'Arial', color: COLORS.textLight
  });
  
  slide6.addShape(pptx.ShapeType.roundRect, {
    x: x + 0.3, y: y + 1.85, w: 3.5, h: 0.35,
    rectRadius: 0.1,
    fill: { color: '0F172A' },
    line: { color: COLORS.accent, width: 1 }
  });
  
  slide6.addText(dev.badge, {
    x: x + 0.3, y: y + 1.85, w: 3.5, h: 0.35,
    fontSize: 9, fontFace: 'Arial', color: COLORS.accent, bold: true, align: 'center'
  });
});

// 7. IP MANZIL VA MAC MANZIL
let slide7 = pptx.addSlide();
slide7.background = { color: COLORS.bg };
createHeader(slide7, '4. IP Manzil va MAC Manzil (Kompyuter "Pasporti")', 'Identifikatsiya');

// MAC card
slide7.addShape(pptx.ShapeType.roundRect, {
  x: 0.8, y: 1.6, w: 5.6, h: 5.1,
  rectRadius: 0.15,
  fill: { color: COLORS.cardBg },
  line: { color: COLORS.secondary, width: 2 }
});

slide7.addText('🔑 MAC MANZIL (Jismoniy manzil)', {
  x: 1.1, y: 1.9, w: 5.0, h: 0.4,
  fontSize: 15, fontFace: 'Arial', color: COLORS.secondary, bold: true
});

slide7.addText('• Qurilmaning tarmoq kartasiga (NIC) zavodda berilgan o‘zgarmas unikal kod.\n• Dunyoda bitta qurilmada faqat bitta unikal MAC bo\'ladi.\n• O\'lchami: 48-bit (12 ta o\'n oltilik raqam).', {
  x: 1.1, y: 2.4, w: 5.0, h: 1.6,
  fontSize: 12, fontFace: 'Arial', color: COLORS.textLight, lineSpacingMultiple: 1.2
});

slide7.addShape(pptx.ShapeType.roundRect, {
  x: 1.1, y: 4.2, w: 5.0, h: 0.9,
  rectRadius: 0.1,
  fill: { color: '0F172A' },
  line: { color: COLORS.secondary, width: 1 }
});

slide7.addText('MISOL:\n00:1A:2B:3C:4D:5E', {
  x: 1.1, y: 4.3, w: 5.0, h: 0.7,
  fontSize: 13, fontFace: 'Courier New', color: COLORS.primary, bold: true, align: 'center'
});

slide7.addText('📌 Tarmoq ichida (Switch) kompyuterni aniq topish uchun ishlatiladi.', {
  x: 1.1, y: 5.4, w: 5.0, h: 0.9,
  fontSize: 11, fontFace: 'Arial', color: COLORS.textMuted
});

// IP card
slide7.addShape(pptx.ShapeType.roundRect, {
  x: 6.9, y: 1.6, w: 5.6, h: 5.1,
  rectRadius: 0.15,
  fill: { color: COLORS.cardBg },
  line: { color: COLORS.primary, width: 2 }
});

slide7.addText('🌐 IP MANZIL (Mantiqiy manzil)', {
  x: 7.2, y: 1.9, w: 5.0, h: 0.4,
  fontSize: 15, fontFace: 'Arial', color: COLORS.primary, bold: true
});

slide7.addText('• Tarmoqdagi joylashuviga qarab beriladigan va o‘zgarishi mumkin bo‘lgan manzil.\n• Routerlar paketni butun dunyo bo\'ylab yo\'naltirishda IP manzilga qarab ishlaydi.', {
  x: 7.2, y: 2.4, w: 5.0, h: 1.3,
  fontSize: 12, fontFace: 'Arial', color: COLORS.textLight, lineSpacingMultiple: 1.2
});

// IPv4 box
slide7.addShape(pptx.ShapeType.roundRect, {
  x: 7.2, y: 3.8, w: 5.0, h: 1.2,
  rectRadius: 0.1,
  fill: { color: '0F172A' },
  line: { color: COLORS.cardBorder, width: 1 }
});

slide7.addText('IPv4: 192.168.1.15  (4 ta son, 32-bit)\nTaxminan 4.3 milliard manzil (hozir tugab bormoqda)', {
  x: 7.4, y: 3.95, w: 4.6, h: 0.9,
  fontSize: 11, fontFace: 'Arial', color: COLORS.accent
});

// IPv6 box
slide7.addShape(pptx.ShapeType.roundRect, {
  x: 7.2, y: 5.2, w: 5.0, h: 1.2,
  rectRadius: 0.1,
  fill: { color: '0F172A' },
  line: { color: COLORS.cardBorder, width: 1 }
});

slide7.addText('IPv6: 2001:0db8:85a3::8a2e:0370:7334\n(Yangi avlod, 128-bit, cheksiz miqdordagi manzillar)', {
  x: 7.4, y: 5.35, w: 4.6, h: 0.9,
  fontSize: 11, fontFace: 'Arial', color: COLORS.warning
});

// 8. DNS TIZIMI
let slide8 = pptx.addSlide();
slide8.background = { color: COLORS.bg };
createHeader(slide8, '5. DNS Tizimi (Internetning "Telefon Daftari")', 'Nomlar Tizimi');

slide8.addShape(pptx.ShapeType.roundRect, {
  x: 0.8, y: 1.6, w: 11.7, h: 1.5,
  rectRadius: 0.15,
  fill: { color: COLORS.cardBg },
  line: { color: COLORS.cardBorder, width: 1 }
});

slide8.addText('❓ Nega DNS kerak?', {
  x: 1.1, y: 1.8, w: 11.0, h: 0.35,
  fontSize: 14, fontFace: 'Arial', color: COLORS.primary, bold: true
});

slide8.addText('Kompyuterlar bir-biri bilan faqat IP manzillar orqali muloqot qiladi (masalan, 142.250.185.206). Biroq insonlar uchun murakkab raqamlarni eslab qolish qiyin!\nDNS (Domain Name System) — sayt nomini (google.com) kompyuter tushunadigan IP-manzilga aylantirib beruvchi xizmatdir.', {
  x: 1.1, y: 2.2, w: 11.0, h: 0.8,
  fontSize: 12, fontFace: 'Arial', color: COLORS.textLight
});

// DNS Flow Chart Boxes
const dnsSteps = [
  { step: '1-qadam', label: 'Foydalanuvchi', desc: 'Brauzerga yozadi:\ngoogle.com', color: '38BDF8' },
  { step: '2-qadam', label: 'DNS Server', desc: 'Telefon daftardan qidiradi:\ngoogle.com = ?', color: '818CF8' },
  { step: '3-qadam', label: 'IP Qaytariladi', desc: 'IP Manzil topildi:\n142.250.185.206', color: 'FBBF24' },
  { step: '4-qadam', label: 'Veb Server', desc: 'Brauzer serverga ulanadi va sayt ochiladi!', color: '34D399' }
];

dnsSteps.forEach((s, i) => {
  const x = 0.8 + i * 2.95;
  slide8.addShape(pptx.ShapeType.roundRect, {
    x: x, y: 3.5, w: 2.7, h: 3.0,
    rectRadius: 0.15,
    fill: { color: COLORS.cardBg },
    line: { color: s.color, width: 2 }
  });
  
  slide8.addText(s.step.toUpperCase(), {
    x: x + 0.2, y: 3.7, w: 2.3, h: 0.3,
    fontSize: 10, fontFace: 'Arial', color: s.color, bold: true, align: 'center'
  });
  
  slide8.addText(s.label, {
    x: x + 0.2, y: 4.1, w: 2.3, h: 0.4,
    fontSize: 14, fontFace: 'Arial', color: COLORS.textLight, bold: true, align: 'center'
  });
  
  slide8.addText(s.desc, {
    x: x + 0.2, y: 4.6, w: 2.3, h: 1.5,
    fontSize: 11, fontFace: 'Arial', color: COLORS.textMuted, align: 'center'
  });
});

// 9. TCP VA UDP PROTOKOLLARI
let slide9 = pptx.addSlide();
slide9.background = { color: COLORS.bg };
createHeader(slide9, '6. TCP va UDP Protokollari (Ma’lumot Qanday Uzatiladi?)', 'Transport Darajasi');

slide9.addText('Ma’lumotlar tarmoq bo‘ylab kichik bo\'laklar — PAKETLAR ko‘rinishida uzatiladi:', {
  x: 0.8, y: 1.45, w: 11.7, h: 0.4,
  fontSize: 12, fontFace: 'Arial', color: COLORS.textMuted
});

// TCP Card
slide9.addShape(pptx.ShapeType.roundRect, {
  x: 0.8, y: 1.9, w: 5.6, h: 4.8,
  rectRadius: 0.15,
  fill: { color: COLORS.cardBg },
  line: { color: COLORS.accent, width: 2 }
});

slide9.addText('🛡 TCP (Transmission Control Protocol)', {
  x: 1.1, y: 2.1, w: 5.0, h: 0.4,
  fontSize: 15, fontFace: 'Arial', color: COLORS.accent, bold: true
});

slide9.addText('KONSEPSIYA: ISHONCHLI USUL (Reliable)', {
  x: 1.1, y: 2.5, w: 5.0, h: 0.3,
  fontSize: 11, fontFace: 'Arial', color: COLORS.primary, bold: true
});

slide9.addText('• Har bir paket yetib borganini tasdiq (ACK) orqali tekshiradi.\n• Agar yo\'lda birorta paket yo‘qolsa, uni qaytadan yuboradi.\n• Paketlar qabul qiluvchi tomonda to\'g\'ri ketma-ketlikda yig\'iladi.\n• Biroz sekinroq, lekin 100% aniqlik kafolatlangan.', {
  x: 1.1, y: 2.85, w: 5.0, h: 1.8,
  fontSize: 11, fontFace: 'Arial', color: COLORS.textLight, lineSpacingMultiple: 1.2
});

slide9.addShape(pptx.ShapeType.roundRect, {
  x: 1.1, y: 4.9, w: 5.0, h: 1.5,
  rectRadius: 0.1,
  fill: { color: '0F172A' },
  line: { color: COLORS.cardBorder, width: 1 }
});

slide9.addText('Qayerda ishlatiladi:\n✅ Web-saytlar (HTTP/HTTPS)\n✅ Fayl yuklab olish (FTP)\n✅ Elektron pochta (SMTP, IMAP)\n(Har bir harf va bit muhim bo\'lgan joyda)', {
  x: 1.25, y: 5.0, w: 4.7, h: 1.3,
  fontSize: 10, fontFace: 'Arial', color: COLORS.textMuted
});

// UDP Card
slide9.addShape(pptx.ShapeType.roundRect, {
  x: 6.9, y: 1.9, w: 5.6, h: 4.8,
  rectRadius: 0.15,
  fill: { color: COLORS.cardBg },
  line: { color: COLORS.warning, width: 2 }
});

slide9.addText('⚡ UDP (User Datagram Protocol)', {
  x: 7.2, y: 2.1, w: 5.0, h: 0.4,
  fontSize: 15, fontFace: 'Arial', color: COLORS.warning, bold: true
});

slide9.addText('KONSEPSIYA: TEZKOR USUL (Speed First)', {
  x: 7.2, y: 2.5, w: 5.0, h: 0.3,
  fontSize: 11, fontFace: 'Arial', color: COLORS.warning, bold: true
});

slide9.addText('• Paket yetib borganini tekshirmaydi, tasdiq kutmaydi.\n• Paket yo\'qolsa, uni qayta yuborib o\'tirmaydi, keyingisiga o\'tadi.\n• Ulanish o\'rnatishga vaqt sarflamaydi — maksimal tezlik!\n• Yo\'qotishlar bo\'lishi mumkin, lekin kechikish (ping) minimal.', {
  x: 7.2, y: 2.85, w: 5.0, h: 1.8,
  fontSize: 11, fontFace: 'Arial', color: COLORS.textLight, lineSpacingMultiple: 1.2
});

slide9.addShape(pptx.ShapeType.roundRect, {
  x: 7.2, y: 4.9, w: 5.0, h: 1.5,
  rectRadius: 0.1,
  fill: { color: '0F172A' },
  line: { color: COLORS.cardBorder, width: 1 }
});

slide9.addText('Qayerda ishlatiladi:\n✅ Onlayn o‘yinlar (CS, Dota, PUBG)\n✅ Video muloqot (Zoom, Telegram qo\'ng\'iroq)\n✅ Jonli efirlar (Live Stream)\n(Sekundning ulushlari muhim bo\'lgan joyda)', {
  x: 7.35, y: 5.0, w: 4.7, h: 1.3,
  fontSize: 10, fontFace: 'Arial', color: COLORS.textMuted
});

// 10. TARMOQ XAVFSIZLIGI ASOSLARI
let slide10 = pptx.addSlide();
slide10.background = { color: COLORS.bg };
createHeader(slide10, '7. Tarmoq Xavfsizligi va Muhim Xizmatlar', 'Xavfsizlik & Boshqaruv');

const secCards = [
  {
    icon: '🧱',
    title: 'Firewall (Brandmauer)',
    subtitle: 'Himoya Devori',
    color: 'F87171',
    desc: 'Tarmoqqa kirayotgan va chiqayotgan trafikni qat\'iy qoidalar asosida doimiy nazorat qiladi. Ruxsatsiz ulanishlar, xakerlik hujumlari va virusli paketlarni filtrlab, bloklaydi.'
  },
  {
    icon: '🔒',
    title: 'VPN (Virtual Private Network)',
    subtitle: 'Shaxsiy Shifrlangan Tunnel',
    color: '38BDF8',
    desc: 'Ommaviy yoki himoyalanmagan tarmoqda ma\'lumotlarni shifrlaydi. Haqiqiy IP manzilni yashirib, foydalanuvchi ma\'lumotlarining xavfsiz va maxfiy uzatilishini ta\'minlaydi.'
  },
  {
    icon: '⚙️',
    title: 'DHCP (Dynamic Host Config)',
    subtitle: 'Avtomatik Manzil Tarqatuvchi',
    color: '34D399',
    desc: 'Tarmoqqa yangi ulangan har bir qurilmaga (noutbuk, telefon, planshet) avtomatik ravishda erkin IP manzil, tarmoq niqobi (Subnet mask) va shlyuz manzilini taqsimlovchi protokol.'
  }
];

secCards.forEach((c, i) => {
  const x = 0.8 + i * 4.0;
  slide10.addShape(pptx.ShapeType.roundRect, {
    x: x, y: 1.6, w: 3.7, h: 5.1,
    rectRadius: 0.15,
    fill: { color: COLORS.cardBg },
    line: { color: c.color, width: 2 }
  });
  
  slide10.addText(`${c.icon}`, {
    x: x + 0.3, y: 1.9, w: 3.1, h: 0.6,
    fontSize: 28, fontFace: 'Arial', align: 'center'
  });
  
  slide10.addText(c.title, {
    x: x + 0.3, y: 2.6, w: 3.1, h: 0.6,
    fontSize: 14, fontFace: 'Arial', color: COLORS.textLight, bold: true, align: 'center'
  });
  
  slide10.addText(c.subtitle, {
    x: x + 0.3, y: 3.2, w: 3.1, h: 0.35,
    fontSize: 11, fontFace: 'Arial', color: c.color, bold: true, align: 'center'
  });
  
  slide10.addText(c.desc, {
    x: x + 0.3, y: 3.7, w: 3.1, h: 2.7,
    fontSize: 11, fontFace: 'Arial', color: COLORS.textMuted, lineSpacingMultiple: 1.2
  });
});

// 11. DOSKA UCHUN IQ / MANTIQIY JUMBOQLAR
let slide11 = pptx.addSlide();
slide11.background = { color: COLORS.bg };
createHeader(slide11, '🧠 Doska Uchun IQ / Mantiqiy Jumboqlar', 'Interaktiv Savol-Javob');

// Question 1
slide11.addShape(pptx.ShapeType.roundRect, {
  x: 0.8, y: 1.6, w: 5.6, h: 5.1,
  rectRadius: 0.15,
  fill: { color: COLORS.cardBg },
  line: { color: COLORS.warning, width: 2 }
});

slide11.addText('❓ 1-Mantiqiy Savol: Paketlar Yo\'qolishi', {
  x: 1.1, y: 1.8, w: 5.0, h: 0.4,
  fontSize: 13, fontFace: 'Arial', color: COLORS.warning, bold: true
});

slide11.addText('Vaziyat: Kompyuter 100 MB faylni tarmoq orqali yubormoqchi. Tarmoq uni 1 MB dan qilib 100 ta paketga bo‘lib yuboradi. Yo‘lda 45-paket yo‘qolib qoldi. Nima sodir bo‘ladi?', {
  x: 1.1, y: 2.3, w: 5.0, h: 1.3,
  fontSize: 11, fontFace: 'Arial', color: COLORS.textLight, lineSpacingMultiple: 1.2
});

slide11.addShape(pptx.ShapeType.roundRect, {
  x: 1.1, y: 3.7, w: 5.0, h: 2.8,
  rectRadius: 0.1,
  fill: { color: '0F172A' },
  line: { color: COLORS.cardBorder, width: 1 }
});

slide11.addText('💡 TO\'G\'RI JAVOB:', {
  x: 1.3, y: 3.85, w: 4.6, h: 0.3,
  fontSize: 11, fontFace: 'Arial', color: COLORS.accent, bold: true
});

slide11.addText('🔴 Agar UDP bo‘lsa: Yo‘qolgan paketga umuman e’tibor bermaydi, davom etadi. Natijada fayl yoki rasm buzilib ochiladi.\n\n🟢 Agar TCP bo‘lsa: Yo‘qolgan 45-paketni darhol sezadi, qabul qiluvchi uni qaytadan so‘rab oladi va faylni 100% butun holatda yig‘ib beradi.', {
  x: 1.3, y: 4.2, w: 4.6, h: 2.1,
  fontSize: 10, fontFace: 'Arial', color: COLORS.textLight, lineSpacingMultiple: 1.2
});

// Question 2
slide11.addShape(pptx.ShapeType.roundRect, {
  x: 6.9, y: 1.6, w: 5.6, h: 5.1,
  rectRadius: 0.15,
  fill: { color: COLORS.cardBg },
  line: { color: COLORS.primary, width: 2 }
});

slide11.addText('❓ 2-Mantiqiy Savol: DNS va IP Manzil', {
  x: 7.2, y: 1.8, w: 5.0, h: 0.4,
  fontSize: 13, fontFace: 'Arial', color: COLORS.primary, bold: true
});

slide11.addText('Vaziyat: Internet o\'chmagan, lekin brauzerga "google.com" deb yozsangiz sayt ochilmayapti. Biroq "142.250.185.206" deb yozsangiz sayt darhol ochilyapti. Muammo qayerda?', {
  x: 7.2, y: 2.3, w: 5.0, h: 1.3,
  fontSize: 11, fontFace: 'Arial', color: COLORS.textLight, lineSpacingMultiple: 1.2
});

slide11.addShape(pptx.ShapeType.roundRect, {
  x: 7.2, y: 3.7, w: 5.0, h: 2.8,
  rectRadius: 0.1,
  fill: { color: '0F172A' },
  line: { color: COLORS.cardBorder, width: 1 }
});

slide11.addText('💡 TO\'G\'RI JAVOB:', {
  x: 7.4, y: 3.85, w: 4.6, h: 0.3,
  fontSize: 11, fontFace: 'Arial', color: COLORS.accent, bold: true
});

slide11.addText('🔍 Muammo: Kompyuterda DNS server sozlamasi buzilgan yoki provayderning DNS serveri ishlamayapti.\n\n🌐 Tushuntirish: Kompyuter tarmoqqa to\'g\'ridan-to\'g\'ri ulangan, biroq nomlarni IP ga tarjima qilib beruvchi "telefon daftari" (DNS) javob bermayapti. Yechim: 8.8.8.8 (Google DNS) yoki 1.1.1.1 o\'rnatish.', {
  x: 7.4, y: 4.2, w: 4.6, h: 2.1,
  fontSize: 10, fontFace: 'Arial', color: COLORS.textLight, lineSpacingMultiple: 1.2
});

// 12. AMALIY TOPSHIRIQ (TERMINAL / CMD)
let slide12 = pptx.addSlide();
slide12.background = { color: COLORS.bg };
createHeader(slide12, '💡 Amaliy Topshiriq (Terminal / CMD orqali)', 'Amaliy Mashg\'ulot');

slide12.addText('Klaviaturada Win + R tugmalarini bosing, "cmd" deb yozing va Enter bosing:', {
  x: 0.8, y: 1.45, w: 11.7, h: 0.35,
  fontSize: 12, fontFace: 'Arial', color: COLORS.textMuted
});

const cmdCommands = [
  { cmd: 'ipconfig /all', purpose: 'Kompyuterning IP, MAC va DNS manzillarini to\'liq ko‘rish.' },
  { cmd: 'ping google.com', purpose: 'Google serveri bilan aloqani va javob tezligini (ms) tekshirish.' },
  { cmd: 'nslookup google.com', purpose: 'Sayt domeniga tegishli IP manzilni aniqlash (DNS qanday ishlayotganini ko\'rish).' },
  { cmd: 'tracert google.com', purpose: 'Paket kompyuteringizdan Google serverigacha qaysi routerlar orqali o‘tayotganini kuzatish.' },
  { cmd: 'netstat -an', purpose: 'Hozirda kompyuterga ulangan barcha tarmoq ulanishlari va portlarni ko\'rish.' }
];

cmdCommands.forEach((c, i) => {
  const y = 1.95 + i * 0.95;
  slide12.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: y, w: 11.7, h: 0.8,
    rectRadius: 0.1,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.cardBorder, width: 1 }
  });
  
  slide12.addShape(pptx.ShapeType.roundRect, {
    x: 1.0, y: y + 0.15, w: 3.3, h: 0.5,
    rectRadius: 0.08,
    fill: { color: '0F172A' },
    line: { color: COLORS.primary, width: 1 }
  });
  
  slide12.addText(`> ${c.cmd}`, {
    x: 1.1, y: y + 0.18, w: 3.1, h: 0.45,
    fontSize: 11, fontFace: 'Courier New', color: COLORS.accent, bold: true
  });
  
  slide12.addText(c.purpose, {
    x: 4.5, y: y + 0.2, w: 7.8, h: 0.45,
    fontSize: 11, fontFace: 'Arial', color: COLORS.textLight
  });
});

// 13. XULOSA
let slide13 = pptx.addSlide();
slide13.background = { color: COLORS.bg };
createHeader(slide13, 'Xulosa va Q&A (Savol-Javob)', 'Yakun');

slide13.addShape(pptx.ShapeType.roundRect, {
  x: 0.8, y: 1.6, w: 11.7, h: 3.5,
  rectRadius: 0.15,
  fill: { color: COLORS.cardBg },
  line: { color: COLORS.primary, width: 1 }
});

const summaryBullets = [
  '✅ Kompyuter tarmoqlari ma\'lumot va resurslarni birgalikda ishlatish uchun zarur.',
  '✅ Tarmoqlar miqyosiga qarab PAN, LAN, MAN va WAN turlariga bo\'linadi.',
  '✅ Switch LAN ichida MAC manzil bilan, Router esa global tarmoqda IP manzil bilan ishlaydi.',
  '✅ DNS inson tushunadigan nomlarni raqamli IP manzillarga o\'girib beradi.',
  '✅ TCP ishonchlilik va aniqlik kafolati, UDP esa maksimal tezlik vositasi.',
  '✅ Tarmoq xavfsizligida Firewall va VPN eng asosiy himoya qalqonlaridir.'
];

summaryBullets.forEach((bullet, i) => {
  slide13.addText(bullet, {
    x: 1.2, y: 1.9 + i * 0.5, w: 10.9, h: 0.45,
    fontSize: 13, fontFace: 'Arial', color: COLORS.textLight
  });
});

slide13.addShape(pptx.ShapeType.roundRect, {
  x: 0.8, y: 5.4, w: 11.7, h: 1.2,
  rectRadius: 0.15,
  fill: { color: '1E293B' },
  line: { color: COLORS.accent, width: 2 }
});

slide13.addText('💬 E\'tiboringiz uchun rahmat! Savollaringiz bormi?', {
  x: 0.8, y: 5.75, w: 11.7, h: 0.5,
  fontSize: 18, fontFace: 'Arial', color: COLORS.accent, bold: true, align: 'center'
});

const outputPath = 'c:/Users/user/Downloads/educontrol/Kompyuter_Tarmoqlari_Asoslari.pptx';
pptx.writeFile({ fileName: outputPath }).then(() => {
  console.log('PPTX created successfully at: ' + outputPath);
}).catch(err => {
  console.error('Error creating PPTX:', err);
});
