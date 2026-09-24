const pptxgen = require('pptxgenjs');
const path = require('path');

const pptx = new pptxgen();

// Set 16:9 widescreen layout (13.333 x 7.5 inches)
pptx.defineLayout({ name: 'WIDE_16_9', width: 13.333, height: 7.5 });
pptx.layout = 'WIDE_16_9';

// Assets directory
const ASSETS = 'c:/Users/user/Downloads/presentation_assets';

// Color Palette
const COLORS = {
  bg: '0B1120',          // Slate 950 deep navy
  cardBg: '131D31',      // Slate 900
  cardBorder: '1E293B',  // Slate 800
  primary: '38BDF8',    // Sky 400
  primaryDark: '0284C7',
  secondary: '818CF8',  // Indigo 400
  accent: '34D399',     // Emerald 400
  warning: 'FBBF24',    // Amber 400
  danger: 'F87171',     // Red 400
  text: 'F8FAFC',
  textMuted: '94A3B8'
};

// Helper for consistent headers
function addSlideHeader(slide, title, category) {
  if (category) {
    slide.addText(category.toUpperCase(), {
      x: 0.8, y: 0.45, w: 10.0, h: 0.3,
      fontSize: 11, fontFace: 'Arial', color: COLORS.primary, bold: true, charSpacing: 2
    });
  }
  slide.addText(title, {
    x: 0.8, y: category ? 0.75 : 0.5, w: 11.7, h: 0.65,
    fontSize: 24, fontFace: 'Arial', color: COLORS.text, bold: true
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: category ? 1.45 : 1.25, w: 1.8, h: 0.05,
    fill: { color: COLORS.primary },
    line: { color: COLORS.primary }
  });
}

// -------------------------------------------------------------
// SLIDE 1: COVER SLIDE (With 3D Network Banner Image)
// -------------------------------------------------------------
let s1 = pptx.addSlide();
s1.background = { color: COLORS.bg };

// Right side 3D hero image
s1.addImage({
  path: `${ASSETS}/banner.jpg`,
  x: 6.8, y: 0.0, w: 6.533, h: 7.5
});

// Left side gradient / dark backdrop overlay
s1.addShape(pptx.ShapeType.rect, {
  x: 0.0, y: 0.0, w: 7.2, h: 7.5,
  fill: { color: COLORS.bg }
});

// Title badge
s1.addShape(pptx.ShapeType.roundRect, {
  x: 0.8, y: 1.2, w: 3.2, h: 0.42,
  rectRadius: 0.1,
  fill: { color: '131D31' },
  line: { color: COLORS.primary, width: 1.5 }
});
s1.addText('🌐 KENGAYTIRILGAN SHAKLI', {
  x: 0.8, y: 1.2, w: 3.2, h: 0.42,
  fontSize: 11, fontFace: 'Arial', color: COLORS.primary, bold: true, align: 'center'
});

s1.addText('2-MAVZU:\nKOMPYUTER\nTARMOQLARI\nASOSLARI', {
  x: 0.8, y: 1.9, w: 6.0, h: 2.8,
  fontSize: 38, fontFace: 'Arial', color: COLORS.text, bold: true, lineSpacingMultiple: 1.05
});

s1.addText('Tarmoq turlari • Topologiyalar • Qurilmalar • IP & MAC\nDNS tizimi • TCP/UDP • Xavfsizlik • CMD Amaliyoti', {
  x: 0.8, y: 4.8, w: 5.8, h: 0.8,
  fontSize: 13, fontFace: 'Arial', color: COLORS.primary, lineSpacingMultiple: 1.2
});

s1.addShape(pptx.ShapeType.roundRect, {
  x: 0.8, y: 5.8, w: 5.8, h: 0.9,
  rectRadius: 0.1,
  fill: { color: '131D31' },
  line: { color: '1E293B', width: 1 }
});
s1.addText('📌 Kurs: Axborot Texnologiyalari va Zamonaviy Tarmoqlar\n🎯 Maqsad: Nazariy bilimlar va amaliy buyruqlar', {
  x: 1.0, y: 5.9, w: 5.4, h: 0.7,
  fontSize: 11, fontFace: 'Arial', color: COLORS.textMuted, lineSpacingMultiple: 1.15
});

// -------------------------------------------------------------
// SLIDE 2: AGENDA / MUNDARIJA
// -------------------------------------------------------------
let s2 = pptx.addSlide();
s2.background = { color: COLORS.bg };
addSlideHeader(s2, 'Dars Rejasi (Mavzu Mundarijasi)', 'Dars Tartibi');

const agendaItems = [
  { n: '01', t: 'Kompyuter Tarmog\'i nima?', d: 'Ta\'rif, afzalliklar va resurslar almashinuvi' },
  { n: '02', t: 'Tarmoq Turlari (PAN, LAN, MAN, WAN)', d: 'Qamrov maydoni va ko\'lami bo\'yicha tasnif' },
  { n: '03', t: 'Tarmoq Topologiyalari', d: 'Shina, Halqa, Yulduz va Daraxtsimon tuzilmalar' },
  { n: '04', t: 'Asosiy Tarmoq Qurilmalari', d: 'Switch, Router, Modem, Access Point vazifalari' },
  { n: '05', t: 'IP Manzil va MAC Manzil', d: 'Kompyuter pasporti: Fizik va mantiqiy identifikatsiya' },
  { n: '06', t: 'DNS Tizimi (Domain Name System)', d: 'Nomlarni IP ga tarjima qilish 4 bosqichi' },
  { n: '07', t: 'TCP va UDP Protokollari', d: 'Ishonchlilik (TCP) vs Tezkorlik (UDP)' },
  { n: '08', t: 'Xavfsizlik & Mantiqiy IQ Savollar', d: 'Firewall, VPN, DHCP va interaktiv savollar' },
  { n: '09', t: 'Amaliy Topshiriq (CMD / Terminal)', d: 'ipconfig, ping, nslookup, tracert, netstat' }
];

agendaItems.forEach((item, i) => {
  const row = Math.floor(i / 3);
  const col = i % 3;
  const x = 0.8 + col * 4.0;
  const y = 1.7 + row * 1.6;

  s2.addShape(pptx.ShapeType.roundRect, {
    x: x, y: y, w: 3.8, h: 1.4,
    rectRadius: 0.12,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.cardBorder, width: 1 }
  });

  s2.addText(item.n, {
    x: x + 0.2, y: y + 0.15, w: 0.7, h: 0.5,
    fontSize: 22, fontFace: 'Arial', color: COLORS.primary, bold: true
  });

  s2.addText(item.t, {
    x: x + 0.9, y: y + 0.15, w: 2.7, h: 0.5,
    fontSize: 13, fontFace: 'Arial', color: COLORS.text, bold: true
  });

  s2.addText(item.d, {
    x: x + 0.9, y: y + 0.65, w: 2.7, h: 0.65,
    fontSize: 10, fontFace: 'Arial', color: COLORS.textMuted
  });
});

// -------------------------------------------------------------
// SLIDE 3: KOMPYUTER TARMOG'I NIMA?
// -------------------------------------------------------------
let s3 = pptx.addSlide();
s3.background = { color: COLORS.bg };
addSlideHeader(s3, '1. Kompyuter Tarmog\'i Nima?', 'Asosiy Tushuncha');

// Definition card
s3.addShape(pptx.ShapeType.roundRect, {
  x: 0.8, y: 1.7, w: 11.7, h: 1.6,
  rectRadius: 0.12,
  fill: { color: COLORS.cardBg },
  line: { color: COLORS.primary, width: 2 }
});
s3.addText('💡 ASOSIY TA\'RIF:', {
  x: 1.1, y: 1.85, w: 11.0, h: 0.35,
  fontSize: 13, fontFace: 'Arial', color: COLORS.primary, bold: true
});
s3.addText('Kompyuter tarmog‘i — o‘zaro ma’lumot va umumiy resurslar (fayllar, dasturlar, internet aloqasi, printerlar) almashish hamda hamkorlikda foydalanish uchun maxsus aloqa kanallari orqali ulangan kompyuterlar va qurilmalar tizimidir.', {
  x: 1.1, y: 2.25, w: 11.0, h: 0.9,
  fontSize: 15, fontFace: 'Arial', color: COLORS.text, lineSpacingMultiple: 1.2
});

// 3 benefit cards
const benefits = [
  { icon: '📁', title: 'Resurslar Almashinuvi', desc: 'Fayllar, ma\'lumotlar bazasi, korporativ dasturiy ta\'minotni birgalikda boshqarish.' },
  { icon: '🖨️', title: 'Uskunalarni Bo\'lishish', desc: 'Bitta tarmoq printeri yoki serverni butun tashkilot xodimlari umumiy ishlatishi.' },
  { icon: '⚡', title: 'Tezkor Aloqa', desc: 'Elektron pochta, messenjerlar, IP-telefoniya va real vaqtda video anjumanlar o\'tkazish.' }
];

benefits.forEach((b, i) => {
  const x = 0.8 + i * 4.0;
  s3.addShape(pptx.ShapeType.roundRect, {
    x: x, y: 3.6, w: 3.7, h: 2.9,
    rectRadius: 0.12,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.cardBorder, width: 1 }
  });

  s3.addText(b.icon, {
    x: x + 0.3, y: 3.8, w: 3.1, h: 0.6,
    fontSize: 32, align: 'center'
  });

  s3.addText(b.title, {
    x: x + 0.3, y: 4.5, w: 3.1, h: 0.5,
    fontSize: 15, fontFace: 'Arial', color: COLORS.secondary, bold: true, align: 'center'
  });

  s3.addText(b.desc, {
    x: x + 0.3, y: 5.1, w: 3.1, h: 1.2,
    fontSize: 12, fontFace: 'Arial', color: COLORS.textMuted, align: 'center', lineSpacingMultiple: 1.2
  });
});

// -------------------------------------------------------------
// SLIDE 4: TARMOQ TURLARI (With Visual Diagram Image)
// -------------------------------------------------------------
let s4 = pptx.addSlide();
s4.background = { color: COLORS.bg };
addSlideHeader(s4, 'Tarmoq Turlari (Hajmi va Qamroviga Ko‘ra)', 'Tasnif');

// Embed rendered Network Types Diagram Image!
s4.addImage({
  path: `${ASSETS}/network_types_diagram.png`,
  x: 0.8, y: 1.65, w: 11.7, h: 5.2
});

// -------------------------------------------------------------
// SLIDE 5: TARMOQ TOPOLOGIYALARI (With Infographic Diagram Image)
// -------------------------------------------------------------
let s5 = pptx.addSlide();
s5.background = { color: COLORS.bg };
addSlideHeader(s5, '2. Tarmoq Topologiyalari (Ulanish Shakllari)', 'Arxitektura');

// Left side: Comprehensive Infographic Diagram Image
s5.addImage({
  path: `${ASSETS}/topologies.jpg`,
  x: 0.8, y: 1.65, w: 6.8, h: 5.1
});

// Right side: Topology Descriptions
const topoList = [
  { name: '🚌 Shina (Bus)', desc: 'Barcha qurilmalar bitta umumiy magistral kabelga ketma-ket ulanadi. Kabel uzilsa butun tarmoq to\'xtaydi.' },
  { name: '⭕ Halqa (Ring)', desc: 'Kompyuterlar zanjir kabi bir-biriga yopiq doira bo\'lib ulanadi. Ma\'lumot bir yo\'nalishda aylanadi.' },
  { name: '⭐ Yulduz (Star)', desc: 'Barcha kompyuterlar markaziy Switch\'ga alohida kabel orqali ulanadi. Bitta kabel uzilsa boshqalariga ta\'sir qilmaydi (Standart!).' },
  { name: '🌳 Daraxtsimon (Tree)', desc: 'Bir nechta yulduzli tarmoqlarning ierarxik shoxlanishi. Ko\'p qavatli binolar va korxonalar uchun mos.' }
];

topoList.forEach((t, i) => {
  const y = 1.65 + i * 1.28;
  s5.addShape(pptx.ShapeType.roundRect, {
    x: 7.8, y: y, w: 4.7, h: 1.18,
    rectRadius: 0.1,
    fill: { color: COLORS.cardBg },
    line: { color: t.name.includes('Yulduz') ? COLORS.primary : COLORS.cardBorder, width: t.name.includes('Yulduz') ? 2 : 1 }
  });

  s5.addText(t.name, {
    x: 8.0, y: y + 0.1, w: 4.3, h: 0.35,
    fontSize: 13, fontFace: 'Arial', color: t.name.includes('Yulduz') ? COLORS.primary : COLORS.text, bold: true
  });

  s5.addText(t.desc, {
    x: 8.0, y: y + 0.45, w: 4.3, h: 0.65,
    fontSize: 10, fontFace: 'Arial', color: COLORS.textMuted, lineSpacingMultiple: 1.15
  });
});

// -------------------------------------------------------------
// SLIDE 6: ASOSIY TARMOQ QURILMALARI (With Hardware 3D Image)
// -------------------------------------------------------------
let s6 = pptx.addSlide();
s6.background = { color: COLORS.bg };
addSlideHeader(s6, '3. Asosiy Tarmoq Qurilmalari (Hardware)', 'Uskunalar');

// Left side: Realistic Hardware 3D Image
s6.addImage({
  path: `${ASSETS}/hardware.jpg`,
  x: 0.8, y: 1.65, w: 6.8, h: 5.1
});

// Right side: 4 Devices explanations
const devList = [
  { name: 'Switch (Kommutator)', role: 'L2 Daraja • LAN Ichki Ulovchisi', desc: 'LAN ichidagi kompyuterlarni bog\'laydi. Ma\'lumotni faqat kerakli qabul qiluvchiga uning MAC manzili bo\'yicha yuboradi.' },
  { name: 'Router (Yo\'naltirgich)', role: 'L3 Daraja • Tarmoqlarni Bog\'lovchi', desc: 'Turli tarmoqlarni (LAN va tashqi Internet WAN) ulaydi. Paketlar uchun eng maqbul yo\'nalishni (marshrutni) IP bo\'yicha tanlaydi.' },
  { name: 'Modem', role: 'Signal O\'zgartiruvchi (Modulator)', desc: 'Provayderdan keluvchi optik yoki analog signalni kompyuter tushunadigan raqamli signalga aylantiradi.' },
  { name: 'Access Point (AP)', role: 'Wi-Fi Simsiz Kirish Nuqtasi', desc: 'Kabel orqali kelgan tarmoqni simsiz Wi-Fi signallari orqali havo bo\'ylab tarqatadi.' }
];

devList.forEach((d, i) => {
  const y = 1.65 + i * 1.28;
  s6.addShape(pptx.ShapeType.roundRect, {
    x: 7.8, y: y, w: 4.7, h: 1.18,
    rectRadius: 0.1,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.cardBorder, width: 1 }
  });

  s6.addText(d.name, {
    x: 8.0, y: y + 0.1, w: 4.3, h: 0.3,
    fontSize: 13, fontFace: 'Arial', color: COLORS.secondary, bold: true
  });

  s6.addText(d.role, {
    x: 8.0, y: y + 0.38, w: 4.3, h: 0.25,
    fontSize: 9, fontFace: 'Arial', color: COLORS.accent, bold: true
  });

  s6.addText(d.desc, {
    x: 8.0, y: y + 0.62, w: 4.3, h: 0.5,
    fontSize: 10, fontFace: 'Arial', color: COLORS.textMuted
  });
});

// -------------------------------------------------------------
// SLIDE 7: IP VA MAC MANZILLAR (Kompyuter Pasporti)
// -------------------------------------------------------------
let s7 = pptx.addSlide();
s7.background = { color: COLORS.bg };
addSlideHeader(s7, '4. IP Manzil va MAC Manzil (Kompyuter "Pasporti")', 'Identifikatsiya');

// MAC Card (Left)
s7.addShape(pptx.ShapeType.roundRect, {
  x: 0.8, y: 1.7, w: 5.6, h: 5.0,
  rectRadius: 0.12,
  fill: { color: COLORS.cardBg },
  line: { color: COLORS.secondary, width: 2 }
});

s7.addText('🔑 MAC MANZIL (Jismoniy Manzil)', {
  x: 1.1, y: 1.95, w: 5.0, h: 0.4,
  fontSize: 16, fontFace: 'Arial', color: COLORS.secondary, bold: true
});

s7.addText('• Qurilmaning tarmoq kartasiga (NIC) zavodda berilgan o‘zgarmas unikal apparat kodi.\n• Dunyoda har bir qurilmada faqat bitta unikal MAC bo\'ladi.\n• O‘lchami: 48-bit (12 ta o‘n oltilik raqam, 6 juftlik).', {
  x: 1.1, y: 2.45, w: 5.0, h: 1.6,
  fontSize: 12, fontFace: 'Arial', color: COLORS.text, lineSpacingMultiple: 1.2
});

s7.addShape(pptx.ShapeType.roundRect, {
  x: 1.1, y: 4.3, w: 5.0, h: 0.9,
  rectRadius: 0.1,
  fill: { color: '0B1120' },
  line: { color: COLORS.secondary, width: 1 }
});

s7.addText('NAMUNA MAC MANZIL:\n00:1A:2B:3C:4D:5E', {
  x: 1.1, y: 4.4, w: 5.0, h: 0.7,
  fontSize: 13, fontFace: 'Courier New', color: COLORS.primary, bold: true, align: 'center'
});

s7.addText('📌 Switch lokal tarmoq ichida paketni adashmay yetkazish uchun aynan MAC manzilga qaraydi.', {
  x: 1.1, y: 5.4, w: 5.0, h: 0.9,
  fontSize: 11, fontFace: 'Arial', color: COLORS.textMuted, lineSpacingMultiple: 1.15
});

// IP Card (Right)
s7.addShape(pptx.ShapeType.roundRect, {
  x: 6.9, y: 1.7, w: 5.6, h: 5.0,
  rectRadius: 0.12,
  fill: { color: COLORS.cardBg },
  line: { color: COLORS.primary, width: 2 }
});

s7.addText('🌐 IP MANZIL (Mantiqiy Manzil)', {
  x: 7.2, y: 1.95, w: 5.0, h: 0.4,
  fontSize: 16, fontFace: 'Arial', color: COLORS.primary, bold: true
});

s7.addText('• Tarmoqdagi joriy joylashuvga qarab provayder yoki router tomonidan beriladigan o‘zgaruvchi manzil.\n• Butun jahon bo‘ylab ma\'lumotni global yo‘naltirish uchun zarur.', {
  x: 7.2, y: 2.45, w: 5.0, h: 1.3,
  fontSize: 12, fontFace: 'Arial', color: COLORS.text, lineSpacingMultiple: 1.2
});

// IPv4 Box
s7.addShape(pptx.ShapeType.roundRect, {
  x: 7.2, y: 3.9, w: 5.0, h: 1.1,
  rectRadius: 0.08,
  fill: { color: '0B1120' },
  line: { color: COLORS.cardBorder, width: 1 }
});
s7.addText('IPv4: 192.168.1.15  (32-bit, 4 ta son 0-255)\nTaxminan 4.3 milliard manzil (hozirda tugab bormoqda)', {
  x: 7.4, y: 4.05, w: 4.6, h: 0.8,
  fontSize: 11, fontFace: 'Arial', color: COLORS.accent, lineSpacingMultiple: 1.15
});

// IPv6 Box
s7.addShape(pptx.ShapeType.roundRect, {
  x: 7.2, y: 5.2, w: 5.0, h: 1.2,
  rectRadius: 0.08,
  fill: { color: '0B1120' },
  line: { color: COLORS.cardBorder, width: 1 }
});
s7.addText('IPv6: 2001:0db8:85a3::8a2e:0370:7334\n(Yangi avlod, 128-bit, 340 undecillion cheksiz manzillar)', {
  x: 7.4, y: 5.35, w: 4.6, h: 0.8,
  fontSize: 11, fontFace: 'Arial', color: COLORS.warning, lineSpacingMultiple: 1.15
});

// -------------------------------------------------------------
// SLIDE 8: DNS TIZIMI (With Flowchart Diagram Image)
// -------------------------------------------------------------
let s8 = pptx.addSlide();
s8.background = { color: COLORS.bg };
addSlideHeader(s8, '5. DNS Tizimi (Internetning "Telefon Daftari")', 'Nomlar Tizimi');

// Top Explanation banner
s8.addShape(pptx.ShapeType.roundRect, {
  x: 0.8, y: 1.65, w: 11.7, h: 1.1,
  rectRadius: 0.1,
  fill: { color: COLORS.cardBg },
  line: { color: COLORS.primary, width: 1.5 }
});
s8.addText('Kompyuterlar bir-biri bilan faqat raqamli IP manzil orqali aloqa qiladi (masalan: 142.250.185.206). Biroq odamlar uchun buni eslab qolish qiyin! DNS (Domain Name System) sayt nomini (google.com) kompyuter tushunadigan IP-manzilga aylantirib beruvchi global xizmatdir.', {
  x: 1.0, y: 1.75, w: 11.3, h: 0.9,
  fontSize: 12, fontFace: 'Arial', color: COLORS.text, lineSpacingMultiple: 1.2
});

// Embed DNS Flowchart Image!
s8.addImage({
  path: `${ASSETS}/dns_diagram.png`,
  x: 0.8, y: 2.9, w: 11.7, h: 4.0
});

// -------------------------------------------------------------
// SLIDE 9: TCP VA UDP PROTOKOLLARI (With Comparison Diagram Image)
// -------------------------------------------------------------
let s9 = pptx.addSlide();
s9.background = { color: COLORS.bg };
addSlideHeader(s9, '6. TCP va UDP Protokollari (Ma’lumot Qanday Uzatiladi?)', 'Transport Darajasi');

// Embed TCP vs UDP Comparison Diagram Image!
s9.addImage({
  path: `${ASSETS}/tcp_udp_diagram.png`,
  x: 0.8, y: 1.65, w: 11.7, h: 5.2
});

// -------------------------------------------------------------
// SLIDE 10: TARMOQ XAVFSIZLIGI ASOSLARI (With Security Image)
// -------------------------------------------------------------
let s10 = pptx.addSlide();
s10.background = { color: COLORS.bg };
addSlideHeader(s10, '7. Tarmoq Xavfsizligi Asoslari va DHCP', 'Himoya & Boshqaruv');

// Left side: Security Photo Image
s10.addImage({
  path: `${ASSETS}/security.jpg`,
  x: 0.8, y: 1.65, w: 4.8, h: 5.1
});

// Right side: 3 Security Pillars
const secList = [
  {
    icon: '🧱',
    title: 'Firewall (Brandmauer)',
    badge: 'Himoya Devori',
    color: COLORS.danger,
    desc: 'Tarmoqqa kirayotgan va chiqayotgan butun trafikni xavfsizlik qoidalari asosida nazorat qiladi. Ruxsatsiz ulanishlarni, xakerlik hujumlarini va zararli paketlarni darhol bloklaydi.'
  },
  {
    icon: '🔒',
    title: 'VPN (Virtual Private Network)',
    badge: 'Shaxsiy Shifrlangan Tunnel',
    color: COLORS.primary,
    desc: 'Ommaviy va ochiq tarmoqlarda ma\'lumotlarni shifrlaydi. Haqiqiy IP manzilni yashirib, maxfiy va xavfsiz himoyalangan kanal yaratadi.'
  },
  {
    icon: '⚙️',
    title: 'DHCP Xizmati',
    badge: 'Avtomatik IP Taqsimlovchi',
    color: COLORS.accent,
    desc: 'Tarmoqqa yangi ulangan qurilmalarga (noutbuk, telefon) qo\'lda sozlamasdan, avtomatik tarzda bo\'sh IP manzil, subnet mask va shlyuz manzilini taqsimlovchi protokol.'
  }
];

secList.forEach((s, i) => {
  const y = 1.65 + i * 1.72;
  s10.addShape(pptx.ShapeType.roundRect, {
    x: 5.9, y: y, w: 6.6, h: 1.58,
    rectRadius: 0.1,
    fill: { color: COLORS.cardBg },
    line: { color: s.color, width: 1.5 }
  });

  s10.addText(`${s.icon}  ${s.title}`, {
    x: 6.1, y: y + 0.12, w: 4.5, h: 0.35,
    fontSize: 14, fontFace: 'Arial', color: COLORS.text, bold: true
  });

  s10.addShape(pptx.ShapeType.roundRect, {
    x: 10.4, y: y + 0.12, w: 1.9, h: 0.32,
    rectRadius: 0.08,
    fill: { color: '0B1120' },
    line: { color: s.color, width: 1 }
  });
  s10.addText(s.badge, {
    x: 10.4, y: y + 0.12, w: 1.9, h: 0.32,
    fontSize: 8, fontFace: 'Arial', color: s.color, bold: true, align: 'center'
  });

  s10.addText(s.desc, {
    x: 6.1, y: y + 0.52, w: 6.2, h: 0.95,
    fontSize: 10.5, fontFace: 'Arial', color: COLORS.textMuted, lineSpacingMultiple: 1.2
  });
});

// -------------------------------------------------------------
// SLIDE 11: 1-MANTIQIY SAVOL (Paketlar yo'qolishi) - ZERO CLIPPING!
// -------------------------------------------------------------
let s11 = pptx.addSlide();
s11.background = { color: COLORS.bg };
addSlideHeader(s11, '🧠 1-Mantiqiy Jumboq: Paketlar Yo\'qolishi', 'Interaktiv Bosqich');

// Question Card
s11.addShape(pptx.ShapeType.roundRect, {
  x: 0.8, y: 1.7, w: 11.7, h: 1.8,
  rectRadius: 0.12,
  fill: { color: COLORS.cardBg },
  line: { color: COLORS.warning, width: 2 }
});

s11.addText('❓ VAZIYAT:', {
  x: 1.1, y: 1.85, w: 11.0, h: 0.35,
  fontSize: 13, fontFace: 'Arial', color: COLORS.warning, bold: true
});

s11.addText('Kompyuter 100 MB hajmdagi faylni tarmoq orqali yubormoqchi. Tarmoq uni 1 MB dan qilib 100 ta paketga bo‘lib jo‘natadi. Yo‘lda 45-paket yo‘qolib qoldi.\nNima sodir bo‘ladi?', {
  x: 1.1, y: 2.25, w: 11.0, h: 1.1,
  fontSize: 15, fontFace: 'Arial', color: COLORS.text, lineSpacingMultiple: 1.25
});

// Answer Cards (Side-by-side)
// UDP Answer
s11.addShape(pptx.ShapeType.roundRect, {
  x: 0.8, y: 3.8, w: 5.7, h: 2.8,
  rectRadius: 0.12,
  fill: { color: COLORS.cardBg },
  line: { color: COLORS.danger, width: 2 }
});

s11.addText('🔴 AGAR UDP PROTOKOLI BO‘LSA:', {
  x: 1.1, y: 4.0, w: 5.1, h: 0.4,
  fontSize: 14, fontFace: 'Arial', color: COLORS.danger, bold: true
});

s11.addText('• Yo‘qolgan 45-paketga umuman e’tibor bermaydi, jo‘natishni davom ettiradi.\n• Qabul qiluvchi tomonda fayl yoki rasm buzilib ochiladi, yo butunlay ochilmaydi.\n• Chunki UDP tasdiq kutmaydi va qayta yuborish mexanizmiga ega emas.', {
  x: 1.1, y: 4.5, w: 5.1, h: 1.8,
  fontSize: 12, fontFace: 'Arial', color: COLORS.text, lineSpacingMultiple: 1.25
});

// TCP Answer
s11.addShape(pptx.ShapeType.roundRect, {
  x: 6.8, y: 3.8, w: 5.7, h: 2.8,
  rectRadius: 0.12,
  fill: { color: COLORS.cardBg },
  line: { color: COLORS.accent, width: 2 }
});

s11.addText('🟢 AGAR TCP PROTOKOLI BO‘LSA:', {
  x: 7.1, y: 4.0, w: 5.1, h: 0.4,
  fontSize: 14, fontFace: 'Arial', color: COLORS.accent, bold: true
});

s11.addText('• Qabul qiluvchi kompyuter 45-paket yetib kelmaganini darhol sezadi (ACK yo‘qligi).\n• Jo‘natuvchidan faqat 45-paketni qaytadan yuborishni so‘raydi.\n• Natijada fayl 100% to‘liq va butun holatda xatosiz yig‘ib beriladi!', {
  x: 7.1, y: 4.5, w: 5.1, h: 1.8,
  fontSize: 12, fontFace: 'Arial', color: COLORS.text, lineSpacingMultiple: 1.25
});

// -------------------------------------------------------------
// SLIDE 12: 2-MANTIQIY SAVOL (DNS va IP Manzil) - ZERO CLIPPING!
// -------------------------------------------------------------
let s12 = pptx.addSlide();
s12.background = { color: COLORS.bg };
addSlideHeader(s12, '🧠 2-Mantiqiy Jumboq: DNS va IP Manzil', 'Interaktiv Bosqich');

// Question Card
s12.addShape(pptx.ShapeType.roundRect, {
  x: 0.8, y: 1.7, w: 11.7, h: 1.8,
  rectRadius: 0.12,
  fill: { color: COLORS.cardBg },
  line: { color: COLORS.primary, width: 2 }
});

s12.addText('❓ VAZIYAT:', {
  x: 1.1, y: 1.85, w: 11.0, h: 0.35,
  fontSize: 13, fontFace: 'Arial', color: COLORS.primary, bold: true
});

s12.addText('Internet tarmog‘i o‘chmagan, simlar butun. Biroq brauzerga "google.com" deb yozsangiz sayt ochilmayapti. Lekin uning o‘rniga to‘g‘ridan-to‘g‘ri "142.250.185.206" deb yozsangiz sayt darhol ochilyapti.\nMuammo qayerda?', {
  x: 1.1, y: 2.25, w: 11.0, h: 1.1,
  fontSize: 15, fontFace: 'Arial', color: COLORS.text, lineSpacingMultiple: 1.25
});

// Solution Container
s12.addShape(pptx.ShapeType.roundRect, {
  x: 0.8, y: 3.8, w: 11.7, h: 2.8,
  rectRadius: 0.12,
  fill: { color: COLORS.cardBg },
  line: { color: COLORS.accent, width: 2 }
});

s12.addText('💡 TO‘G‘RI JAVOB VA TAHLIL:', {
  x: 1.1, y: 4.0, w: 11.0, h: 0.4,
  fontSize: 15, fontFace: 'Arial', color: COLORS.accent, bold: true
});

s12.addText('🔍 Muammo: Kompyuterdagi DNS server sozlamasi buzilgan yoki provayderning DNS serveri vaqtincha ishlamayapti.\n\n🌐 Tushuntirish: Kompyuter internetga to‘liq ulangan va ma\'lumot almashmoqda. Biroq odamlar tushunadigan so‘zlarni ("google.com") kompyuter tushunadigan raqamlarga ("142.250.185.206") o‘girib beruvchi "telefon daftari" (DNS) javob bermayapti.\n\n🛠️ Yechim: Tarmoq sozlamalarida DNS manzilini universal serverlarga almashtirish: 8.8.8.8 (Google DNS) yoki 1.1.1.1 (Cloudflare DNS).', {
  x: 1.1, y: 4.45, w: 11.0, h: 2.0,
  fontSize: 12.5, fontFace: 'Arial', color: COLORS.text, lineSpacingMultiple: 1.25
});

// -------------------------------------------------------------
// SLIDE 13: AMALIY TOPSHIRIQ (CMD Terminal)
// -------------------------------------------------------------
let s13 = pptx.addSlide();
s13.background = { color: COLORS.bg };
addSlideHeader(s13, '💡 Amaliy Topshiriq (Terminal / CMD Buyruqlari)', 'Amaliy Mashg‘ulot');

s13.addText('Klaviaturada Win + R tugmalarini bosing, "cmd" deb yozing va Enter bosing:', {
  x: 0.8, y: 1.5, w: 11.7, h: 0.35,
  fontSize: 12, fontFace: 'Arial', color: COLORS.textMuted
});

const cmdList = [
  { cmd: 'ipconfig /all', purpose: 'Kompyuterning to‘liq IP, jismoniy MAC va DNS server manzillarini ko‘rish.' },
  { cmd: 'ping google.com', purpose: 'Google serveri bilan aloqa va paket yetib borish tezligini (ms) tekshirish.' },
  { cmd: 'nslookup google.com', purpose: 'Sayt domeniga tegishli IP manzilni aniqlash (DNS qanday ishlayotganini ko‘rish).' },
  { cmd: 'tracert google.com', purpose: 'Paket kompyuteringizdan servergacha qaysi routerlar orqali o‘tayotganini kuzatish.' },
  { cmd: 'netstat -an', purpose: 'Hozirda kompyuteringizga ulangan barcha tarmoq ulanishlari va ochiq portlarni ko‘rish.' }
];

cmdList.forEach((c, i) => {
  const y = 2.0 + i * 0.95;
  s13.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: y, w: 11.7, h: 0.82,
    rectRadius: 0.08,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.cardBorder, width: 1 }
  });

  s13.addShape(pptx.ShapeType.roundRect, {
    x: 1.0, y: y + 0.15, w: 3.5, h: 0.52,
    rectRadius: 0.06,
    fill: { color: '0B1120' },
    line: { color: COLORS.primary, width: 1 }
  });

  s13.addText(`> ${c.cmd}`, {
    x: 1.1, y: y + 0.18, w: 3.3, h: 0.45,
    fontSize: 12, fontFace: 'Courier New', color: COLORS.accent, bold: true
  });

  s13.addText(c.purpose, {
    x: 4.8, y: y + 0.2, w: 7.4, h: 0.45,
    fontSize: 11.5, fontFace: 'Arial', color: COLORS.text
  });
});

// -------------------------------------------------------------
// SLIDE 14: XULOSA VA Q&A
// -------------------------------------------------------------
let s14 = pptx.addSlide();
s14.background = { color: COLORS.bg };
addSlideHeader(s14, 'Xulosa va Q&A (Savol-Javob)', 'Yakun');

s14.addShape(pptx.ShapeType.roundRect, {
  x: 0.8, y: 1.7, w: 11.7, h: 3.6,
  rectRadius: 0.12,
  fill: { color: COLORS.cardBg },
  line: { color: COLORS.primary, width: 1.5 }
});

const summaryPoints = [
  '✅ Kompyuter tarmoqlari ma\'lumot va uskunaviy resurslarni birgalikda boshqarish uchun zarur.',
  '✅ Tarmoqlar qamroviga ko‘ra: PAN (shaxsiy), LAN (bino), MAN (shahar), WAN (global internet).',
  '✅ Eng zamonaviy, xatoliklarga bardoshli topologiya — bu Yulduz (Star) topologiyasidir.',
  '✅ Switch lokal tarmoqda MAC manzil bilan, Router esa global tarmoqda IP manzil bilan ishlaydi.',
  '✅ DNS inson tushunadigan nomlarni raqamli IP ga aylantiruvchi qidiruv tizimidir.',
  '✅ TCP — 100% aniqlik va butunlik kafolati, UDP — minimal kechikish va maksimal tezlik.',
  '✅ Firewall va VPN tarmoq xavfsizligining eng asosiy qalqonlaridir.'
];

summaryPoints.forEach((pt, i) => {
  s14.addText(pt, {
    x: 1.2, y: 1.95 + i * 0.46, w: 10.9, h: 0.42,
    fontSize: 12.5, fontFace: 'Arial', color: COLORS.text
  });
});

s14.addShape(pptx.ShapeType.roundRect, {
  x: 0.8, y: 5.6, w: 11.7, h: 1.2,
  rectRadius: 0.12,
  fill: { color: '131D31' },
  line: { color: COLORS.accent, width: 2 }
});

s14.addText('💬 E\'tiboringiz uchun rahmat! Savollaringiz bormi?', {
  x: 0.8, y: 5.95, w: 11.7, h: 0.5,
  fontSize: 20, fontFace: 'Arial', color: COLORS.accent, bold: true, align: 'center'
});

// Save to destination files
const dest1 = 'c:/Users/user/Downloads/Kompyuter_Tarmoqlari_Asoslari_Pro.pptx';
const dest2 = 'c:/Users/user/Downloads/educontrol/Kompyuter_Tarmoqlari_Asoslari_Pro.pptx';

pptx.writeFile({ fileName: dest1 }).then(() => {
  console.log('Saved to:', dest1);
  return pptx.writeFile({ fileName: dest2 });
}).then(() => {
  console.log('Saved to:', dest2);
  console.log('All slides created with zero clipping and high-res images!');
}).catch(err => {
  console.error('Error:', err);
});
