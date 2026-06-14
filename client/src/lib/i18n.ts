export type Language = "en" | "bm" | "zh" | "iban";

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: "EN",
  bm: "BM",
  zh: "中文",
  iban: "IBAN",
};

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  bm: "Bahasa Malaysia",
  zh: "中文",
  iban: "Bahasa Iban",
};

const STORAGE_KEY = "kobis_lang";

export function getSavedLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ["en", "bm", "zh", "iban"].includes(saved)) return saved as Language;
  } catch {}
  return "en";
}

export function saveLanguage(lang: Language) {
  try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
}

type Translations = {
  nav: {
    features: string;
    howItWorks: string;
    pricing: string;
    signIn: string;
    startFree: string;
  };
  hero: {
    badge: string;
    headline1: string;
    headline2: string;
    poweredBy: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trust: string;
    badge1Title: string;
    badge1Sub: string;
    badge2Title: string;
    badge2Sub: string;
    badge3Title: string;
    badge3Sub: string;
  };
  features: {
    label: string;
    title: string;
    subtitle: string;
    items: { title: string; desc: string }[];
  };
  howItWorks: {
    label: string;
    title: string;
    subtitle: string;
    steps: { title: string; desc: string }[];
  };
  pricing: {
    label: string;
    title: string;
    subtitle: string;
    freeBanner: string;
    monthly: { label: string; price: string; period: string; desc: string; features: string[]; cta: string };
    annual: { label: string; badge: string; price: string; period: string; originalPrice: string; desc: string; features: string[]; cta: string };
    payPerUse: { label: string; price: string; period: string; desc: string; features: string[]; cta: string };
    testerCode: string;
    testerCta: string;
    testerSub: string;
  };
  cta: {
    title: string;
    subtitle: string;
    button: string;
  };
  footer: {
    logoSub: string;
    innovated: string;
    language: string;
    copyright: string;
  };
  dashboard: {
    title: string;
    newMeeting: string;
    noMeetings: string;
    columns: { title: string; status: string; date: string; duration: string; actions: string };
    viewNotes: string;
    status: { pending: string; joining: string; in_progress: string; processing: string; completed: string; failed: string };
  };
  profile: {
    title: string;
    displayName: string;
    email: string;
    avatar: string;
    save: string;
    saved: string;
  };
  newMeeting: {
    title: string;
    urlLabel: string;
    urlPlaceholder: string;
    botNameLabel: string;
    botNamePlaceholder: string;
    avatarLabel: string;
    deploy: string;
    deploying: string;
    success: string;
  };
  subscription: {
    title: string;
    currentPlan: string;
    promoCode: string;
    promoPlaceholder: string;
    applyPromo: string;
    cancel: string;
    activate: string;
  };
};

const translations: Record<Language, Translations> = {
  en: {
    nav: { features: "Features", howItWorks: "How it works", pricing: "Pricing", signIn: "Sign in", startFree: "Start free" },
    hero: {
      badge: "AI AGENT MEETING ASSISTANT — BETA",
      headline1: "Clone yourself.",
      headline2: "Never miss a meeting.",
      poweredBy: "✦ Powered by KOBIS AI Prodigy Team ✦",
      description: "Deploy an AI Agent to your Zoom and Google Meet calls. It attends, transcribes, and delivers intelligent summaries — so you can focus on what actually matters.",
      ctaPrimary: "Start free — first month on us →",
      ctaSecondary: "See how it works",
      trust: "No credit card required · First 30 days free · Cancel anytime",
      badge1Title: "Zoom & Google Meet",
      badge1Sub: "Supported Platforms",
      badge2Title: "AI-Powered Transcription",
      badge2Sub: "Real-time · Speaker ID",
      badge3Title: "Secure & Private",
      badge3Sub: "Your data, your control",
    },
    features: {
      label: "CAPABILITIES",
      title: "Everything you need. Nothing you don't.",
      subtitle: "A focused set of powerful features designed to reclaim your time and keep you informed.",
      items: [
        { title: "AI Agent Joins For You", desc: "Your personalised AI Agent enters Zoom or Google Meet with your name and photo — no manual attendance needed." },
        { title: "Real-Time Transcription", desc: "Every word captured with speaker identification, timestamps, and high accuracy across accents and languages." },
        { title: "AI-Powered Summaries", desc: "Instantly get executive summaries, key highlights, and extracted action items — ready the moment the meeting ends." },
        { title: "Searchable Notes", desc: "Full-text search across all your meeting transcripts and notes. Find any decision or discussion in seconds." },
        { title: "Export Anywhere", desc: "Download your notes as polished PDFs or plain text. Share with your team or archive for compliance." },
        { title: "Meeting Analytics", desc: "Track duration, participant counts, and meeting frequency. Understand where your time really goes." },
      ],
    },
    howItWorks: {
      label: "PROCESS",
      title: "Up and running in 60 seconds",
      subtitle: "Three simple steps to deploy your AI Agent to any meeting.",
      steps: [
        { title: "Paste your meeting link", desc: "Copy the Zoom or Google Meet URL and paste it into MeetingClone. Takes 5 seconds." },
        { title: "Confirm your AI Agent's identity", desc: "Set the AI Agent's display name and upload an avatar so participants know who it represents." },
        { title: "Receive your notes", desc: "The AI Agent joins, records, and delivers a full transcript with AI summary and action items." },
      ],
    },
    pricing: {
      label: "PRICING",
      title: "Simple, honest pricing",
      subtitle: "Three plans. First month completely free. Or use a tester code.",
      freeBanner: "🎉 First month FREE — No credit card required for free trial",
      monthly: { label: "MONTHLY", price: "RM 50", period: "/month", desc: "Unlimited meetings. Billed monthly. Cancel anytime.", features: ["Unlimited meetings", "Real-time transcription", "AI summaries & action items", "PDF & text export", "Priority support"], cta: "Get started free →" },
      annual: { label: "ANNUAL", badge: "✦ Best Value ✦", price: "RM 300", period: "/year", originalPrice: "RM 600/year", desc: "Unlimited meetings. Save RM 300 vs monthly billing.", features: ["Everything in Monthly", "Save 50% vs monthly", "Annual receipt for claims", "Dedicated support", "Early access to new features"], cta: "Get started free →" },
      payPerUse: { label: "PAY PER USE", price: "RM 10", period: "/meeting", desc: "No subscription. Pay only when you use it.", features: ["No monthly commitment", "Full AI Agent features", "Transcription & summary", "Export notes", "Top up anytime"], cta: "Get started free →" },
      testerCode: "Have a tester code? Use it free!",
      testerCta: "Sign in to redeem →",
      testerSub: "Then from RM 10/meeting or RM 50/month. Cancel anytime.",
    },
    cta: { title: "Your time is worth more.", subtitle: "Join professionals who've reclaimed their schedule with MeetingClone.", button: "Start your free month →" },
    footer: { logoSub: "AI MEETING ASSISTANT", innovated: "Innovated By KOBIS AI Prodigy Team", language: "LANGUAGE", copyright: "© 2026 MeetingClone by KOBIS Berhad. All rights reserved. Innovated By KOBIS AI Prodigy Team" },
    dashboard: { title: "My Meetings", newMeeting: "New Meeting", noMeetings: "No meetings yet. Deploy your first AI Agent!", columns: { title: "Title", status: "Status", date: "Date", duration: "Duration", actions: "Actions" }, viewNotes: "View Notes", status: { pending: "Pending", joining: "Joining", in_progress: "In Progress", processing: "Processing", completed: "Completed", failed: "Failed" } },
    profile: { title: "Profile Settings", displayName: "Display Name", email: "Email", avatar: "Avatar", save: "Save Changes", saved: "Saved!" },
    newMeeting: { title: "New Meeting", urlLabel: "Meeting URL", urlPlaceholder: "https://zoom.us/j/... or https://meet.google.com/...", botNameLabel: "Bot Display Name", botNamePlaceholder: "AI Agent", avatarLabel: "Bot Avatar URL (optional)", deploy: "Deploy AI Agent", deploying: "Deploying...", success: "AI Agent deployed successfully!" },
    subscription: { title: "Subscription", currentPlan: "Current Plan", promoCode: "Tester Code", promoPlaceholder: "Enter your code", applyPromo: "Apply", cancel: "Cancel Subscription", activate: "Activate Plan" },
  },

  bm: {
    nav: { features: "Ciri-ciri", howItWorks: "Cara Kerja", pricing: "Harga", signIn: "Log masuk", startFree: "Mula percuma" },
    hero: {
      badge: "PEMBANTU MESYUARAT AI — BETA",
      headline1: "Klon diri anda.",
      headline2: "Jangan terlepas mesyuarat.",
      poweredBy: "✦ Dikuasakan oleh Pasukan KOBIS AI Prodigy ✦",
      description: "Hantar Ejen AI ke panggilan Zoom dan Google Meet anda. Ia hadir, transkripsi, dan menghantar ringkasan pintar — supaya anda boleh fokus pada perkara yang benar-benar penting.",
      ctaPrimary: "Mula percuma — bulan pertama percuma →",
      ctaSecondary: "Lihat cara kerjanya",
      trust: "Tiada kad kredit diperlukan · 30 hari pertama percuma · Batal bila-bila masa",
      badge1Title: "Zoom & Google Meet",
      badge1Sub: "Platform Disokong",
      badge2Title: "Transkripsi Berkuasa AI",
      badge2Sub: "Masa nyata · ID Penutur",
      badge3Title: "Selamat & Peribadi",
      badge3Sub: "Data anda, kawalan anda",
    },
    features: {
      label: "KEUPAYAAN",
      title: "Semua yang anda perlukan. Tiada yang tidak perlu.",
      subtitle: "Set ciri-ciri berkuasa yang direka untuk menjimatkan masa anda.",
      items: [
        { title: "Ejen AI Hadir Untuk Anda", desc: "Ejen AI peribadi anda memasuki Zoom atau Google Meet dengan nama dan foto anda — tiada kehadiran manual diperlukan." },
        { title: "Transkripsi Masa Nyata", desc: "Setiap perkataan dirakam dengan pengenalan penutur, cap masa, dan ketepatan tinggi." },
        { title: "Ringkasan Berkuasa AI", desc: "Dapatkan ringkasan eksekutif, sorotan utama, dan item tindakan yang diekstrak dengan segera." },
        { title: "Nota Boleh Dicari", desc: "Carian teks penuh merentasi semua transkrip dan nota mesyuarat anda." },
        { title: "Eksport ke Mana-mana", desc: "Muat turun nota anda sebagai PDF atau teks biasa. Kongsi dengan pasukan anda." },
        { title: "Analitik Mesyuarat", desc: "Jejak tempoh, bilangan peserta, dan kekerapan mesyuarat." },
      ],
    },
    howItWorks: {
      label: "PROSES",
      title: "Berjalan dalam 60 saat",
      subtitle: "Tiga langkah mudah untuk menghantar Ejen AI anda ke mana-mana mesyuarat.",
      steps: [
        { title: "Tampal pautan mesyuarat anda", desc: "Salin URL Zoom atau Google Meet dan tampalkan ke MeetingClone. Ambil masa 5 saat." },
        { title: "Sahkan identiti Ejen AI anda", desc: "Tetapkan nama paparan Ejen AI dan muat naik avatar supaya peserta tahu siapa yang diwakilinya." },
        { title: "Terima nota anda", desc: "Ejen AI menyertai, merakam, dan menghantar transkrip penuh dengan ringkasan AI dan item tindakan." },
      ],
    },
    pricing: {
      label: "HARGA",
      title: "Harga mudah dan jujur",
      subtitle: "Tiga pelan. Bulan pertama percuma sepenuhnya. Atau gunakan kod penguji.",
      freeBanner: "🎉 Bulan pertama PERCUMA — Tiada kad kredit diperlukan",
      monthly: { label: "BULANAN", price: "RM 50", period: "/bulan", desc: "Mesyuarat tanpa had. Bil bulanan. Batal bila-bila masa.", features: ["Mesyuarat tanpa had", "Transkripsi masa nyata", "Ringkasan AI & item tindakan", "Eksport PDF & teks", "Sokongan keutamaan"], cta: "Mula percuma →" },
      annual: { label: "TAHUNAN", badge: "✦ Nilai Terbaik ✦", price: "RM 300", period: "/tahun", originalPrice: "RM 600/tahun", desc: "Mesyuarat tanpa had. Jimat RM 300 berbanding bil bulanan.", features: ["Semua dalam Bulanan", "Jimat 50% berbanding bulanan", "Resit tahunan untuk tuntutan", "Sokongan khusus", "Akses awal ke ciri baharu"], cta: "Mula percuma →" },
      payPerUse: { label: "BAYAR IKUT GUNA", price: "RM 10", period: "/mesyuarat", desc: "Tiada langganan. Bayar hanya apabila anda gunakannya.", features: ["Tiada komitmen bulanan", "Ciri Ejen AI penuh", "Transkripsi & ringkasan", "Eksport nota", "Tambah nilai bila-bila masa"], cta: "Mula percuma →" },
      testerCode: "Ada kod penguji? Gunakannya percuma!",
      testerCta: "Log masuk untuk tebus →",
      testerSub: "Kemudian dari RM 10/mesyuarat atau RM 50/bulan. Batal bila-bila masa.",
    },
    cta: { title: "Masa anda lebih berharga.", subtitle: "Sertai profesional yang telah mendapatkan semula jadual mereka dengan MeetingClone.", button: "Mulakan bulan percuma anda →" },
    footer: { logoSub: "PEMBANTU MESYUARAT AI", innovated: "Dibangunkan Oleh Pasukan KOBIS AI Prodigy", language: "BAHASA", copyright: "© 2026 MeetingClone oleh KOBIS Berhad. Hak cipta terpelihara. Dibangunkan Oleh Pasukan KOBIS AI Prodigy" },
    dashboard: { title: "Mesyuarat Saya", newMeeting: "Mesyuarat Baharu", noMeetings: "Tiada mesyuarat lagi. Hantar Ejen AI pertama anda!", columns: { title: "Tajuk", status: "Status", date: "Tarikh", duration: "Tempoh", actions: "Tindakan" }, viewNotes: "Lihat Nota", status: { pending: "Menunggu", joining: "Menyertai", in_progress: "Sedang Berlangsung", processing: "Memproses", completed: "Selesai", failed: "Gagal" } },
    profile: { title: "Tetapan Profil", displayName: "Nama Paparan", email: "E-mel", avatar: "Avatar", save: "Simpan Perubahan", saved: "Disimpan!" },
    newMeeting: { title: "Mesyuarat Baharu", urlLabel: "URL Mesyuarat", urlPlaceholder: "https://zoom.us/j/... atau https://meet.google.com/...", botNameLabel: "Nama Paparan Bot", botNamePlaceholder: "Ejen AI", avatarLabel: "URL Avatar Bot (pilihan)", deploy: "Hantar Ejen AI", deploying: "Menghantar...", success: "Ejen AI berjaya dihantar!" },
    subscription: { title: "Langganan", currentPlan: "Pelan Semasa", promoCode: "Kod Penguji", promoPlaceholder: "Masukkan kod anda", applyPromo: "Guna", cancel: "Batal Langganan", activate: "Aktifkan Pelan" },
  },

  zh: {
    nav: { features: "功能", howItWorks: "使用方法", pricing: "价格", signIn: "登录", startFree: "免费开始" },
    hero: {
      badge: "AI 会议助手 — 测试版",
      headline1: "克隆您自己。",
      headline2: "永不错过会议。",
      poweredBy: "✦ 由 KOBIS AI Prodigy 团队提供支持 ✦",
      description: "将 AI 代理部署到您的 Zoom 和 Google Meet 通话中。它出席、转录并提供智能摘要 — 让您专注于真正重要的事情。",
      ctaPrimary: "免费开始 — 第一个月免费 →",
      ctaSecondary: "了解工作原理",
      trust: "无需信用卡 · 前 30 天免费 · 随时取消",
      badge1Title: "Zoom 和 Google Meet",
      badge1Sub: "支持的平台",
      badge2Title: "AI 驱动转录",
      badge2Sub: "实时 · 说话人识别",
      badge3Title: "安全私密",
      badge3Sub: "您的数据，您的控制",
    },
    features: {
      label: "功能特点",
      title: "您需要的一切，仅此而已。",
      subtitle: "一套专注的强大功能，旨在为您节省时间并让您保持知情。",
      items: [
        { title: "AI 代理为您出席", desc: "您的个性化 AI 代理以您的名字和照片进入 Zoom 或 Google Meet — 无需手动出席。" },
        { title: "实时转录", desc: "每个词都被捕获，具有说话人识别、时间戳和跨口音的高准确性。" },
        { title: "AI 驱动摘要", desc: "立即获得执行摘要、关键亮点和提取的行动项目 — 会议结束时即刻准备好。" },
        { title: "可搜索笔记", desc: "在所有会议记录和笔记中进行全文搜索。在几秒钟内找到任何决定或讨论。" },
        { title: "随处导出", desc: "将您的笔记下载为精美的 PDF 或纯文本。与您的团队共享或存档以供合规。" },
        { title: "会议分析", desc: "跟踪持续时间、参与者人数和会议频率。了解您的时间真正花在哪里。" },
      ],
    },
    howItWorks: {
      label: "使用流程",
      title: "60 秒内启动运行",
      subtitle: "三个简单步骤，将您的 AI 代理部署到任何会议。",
      steps: [
        { title: "粘贴您的会议链接", desc: "复制 Zoom 或 Google Meet URL 并将其粘贴到 MeetingClone 中。只需 5 秒钟。" },
        { title: "确认您的 AI 代理身份", desc: "设置 AI 代理的显示名称并上传头像，让参与者知道它代表谁。" },
        { title: "接收您的笔记", desc: "AI 代理加入、录制并提供完整的转录文本，附带 AI 摘要和行动项目。" },
      ],
    },
    pricing: {
      label: "价格",
      title: "简单、诚实的定价",
      subtitle: "三个计划。第一个月完全免费。或使用测试代码。",
      freeBanner: "🎉 第一个月免费 — 免费试用无需信用卡",
      monthly: { label: "月度", price: "RM 50", period: "/月", desc: "无限次会议。按月计费。随时取消。", features: ["无限次会议", "实时转录", "AI 摘要和行动项目", "PDF 和文本导出", "优先支持"], cta: "免费开始 →" },
      annual: { label: "年度", badge: "✦ 最佳价值 ✦", price: "RM 300", period: "/年", originalPrice: "RM 600/年", desc: "无限次会议。与月度计费相比节省 RM 300。", features: ["月度计划的所有内容", "与月度相比节省 50%", "年度收据用于报销", "专属支持", "新功能早期访问"], cta: "免费开始 →" },
      payPerUse: { label: "按次付费", price: "RM 10", period: "/次会议", desc: "无需订阅。仅在使用时付费。", features: ["无月度承诺", "完整 AI 代理功能", "转录和摘要", "导出笔记", "随时充值"], cta: "免费开始 →" },
      testerCode: "有测试代码？免费使用！",
      testerCta: "登录兑换 →",
      testerSub: "然后从 RM 10/次会议或 RM 50/月起。随时取消。",
    },
    cta: { title: "您的时间更有价值。", subtitle: "加入已经用 MeetingClone 重新掌控日程的专业人士。", button: "开始您的免费月份 →" },
    footer: { logoSub: "AI 会议助手", innovated: "由 KOBIS AI Prodigy 团队创新", language: "语言", copyright: "© 2026 MeetingClone 由 KOBIS Berhad 提供。保留所有权利。由 KOBIS AI Prodigy 团队创新" },
    dashboard: { title: "我的会议", newMeeting: "新建会议", noMeetings: "还没有会议。部署您的第一个 AI 代理！", columns: { title: "标题", status: "状态", date: "日期", duration: "时长", actions: "操作" }, viewNotes: "查看笔记", status: { pending: "等待中", joining: "加入中", in_progress: "进行中", processing: "处理中", completed: "已完成", failed: "失败" } },
    profile: { title: "个人资料设置", displayName: "显示名称", email: "电子邮件", avatar: "头像", save: "保存更改", saved: "已保存！" },
    newMeeting: { title: "新建会议", urlLabel: "会议 URL", urlPlaceholder: "https://zoom.us/j/... 或 https://meet.google.com/...", botNameLabel: "机器人显示名称", botNamePlaceholder: "AI 代理", avatarLabel: "机器人头像 URL（可选）", deploy: "部署 AI 代理", deploying: "部署中...", success: "AI 代理部署成功！" },
    subscription: { title: "订阅", currentPlan: "当前计划", promoCode: "测试代码", promoPlaceholder: "输入您的代码", applyPromo: "应用", cancel: "取消订阅", activate: "激活计划" },
  },

  iban: {
    nav: { features: "Ciri-ciri", howItWorks: "Kemaya Bekerja", pricing: "Rega", signIn: "Masuk", startFree: "Mula Percuma" },
    hero: {
      badge: "PEMBANTU MESYUARAT AI — BETA",
      headline1: "Klon diri nuan.",
      headline2: "Enda ketinggalan mesyuarat.",
      poweredBy: "✦ Dikuasakan oleh Pasukan KOBIS AI Prodigy ✦",
      description: "Hantar Ejen AI ke panggilan Zoom enggau Google Meet nuan. Ia hadir, transkripsi, enggau ngirumkan ringkasan pintar — meri nuan fokus ba perkara ti betul-betul penting.",
      ctaPrimary: "Mula percuma — bulan pertama percuma →",
      ctaSecondary: "Meda kemaya bekerja",
      trust: "Enda perlu kad kredit · 30 hari pertama percuma · Batal bila-bila masa",
      badge1Title: "Zoom & Google Meet",
      badge1Sub: "Platform Ti Disokong",
      badge2Title: "Transkripsi Berkuasa AI",
      badge2Sub: "Masa nyata · ID Penutur",
      badge3Title: "Selamat & Peribadi",
      badge3Sub: "Data nuan, kawalan nuan",
    },
    features: {
      label: "KEUPAYAAN",
      title: "Semua ti nuan perlu. Enda lebih.",
      subtitle: "Set ciri-ciri berkuasa ti direka meri nuan jimat masa.",
      items: [
        { title: "Ejen AI Hadir Ganti Nuan", desc: "Ejen AI nuan masuk Zoom tauka Google Meet enggau nama enggau gambar nuan — enda perlu hadir manual." },
        { title: "Transkripsi Masa Nyata", desc: "Tiap-tiap perkataan dirakam enggau pengenalan penutur, cap masa, enggau ketepatan tinggi." },
        { title: "Ringkasan Berkuasa AI", desc: "Dapati ringkasan eksekutif, sorotan utama, enggau item tindakan ti diekstrak enggau segera." },
        { title: "Nota Ulih Dicari", desc: "Carian teks penuh merentasi semua transkrip enggau nota mesyuarat nuan." },
        { title: "Eksport Ka Mana-mana", desc: "Muat turun nota nuan selaku PDF tauka teks biasa. Kongsi enggau pasukan nuan." },
        { title: "Analitik Mesyuarat", desc: "Jejak tempoh, bilangan peserta, enggau kekerapan mesyuarat." },
      ],
    },
    howItWorks: {
      label: "PROSES",
      title: "Bejalan dalam 60 saat",
      subtitle: "Tiga langkah mudah ngirumkan Ejen AI nuan ka mesyuarat.",
      steps: [
        { title: "Tampal pautan mesyuarat nuan", desc: "Salin URL Zoom tauka Google Meet lalu tampalka ka MeetingClone. Ambil masa 5 saat." },
        { title: "Sahkan identiti Ejen AI nuan", desc: "Tetapka nama paparan Ejen AI enggau muat naik avatar meri peserta nemu sapa ti diwakilinya." },
        { title: "Terima nota nuan", desc: "Ejen AI menyertai, merakam, enggau ngirumkan transkrip penuh enggau ringkasan AI enggau item tindakan." },
      ],
    },
    pricing: {
      label: "REGA",
      title: "Rega ti mudah enggau jujur",
      subtitle: "Tiga pelan. Bulan pertama percuma sepenuhnya. Tauka guna kod penguji.",
      freeBanner: "🎉 Bulan pertama PERCUMA — Enda perlu kad kredit",
      monthly: { label: "BULANAN", price: "RM 50", period: "/bulan", desc: "Mesyuarat enda terbatas. Bil bulanan. Batal bila-bila masa.", features: ["Mesyuarat enda terbatas", "Transkripsi masa nyata", "Ringkasan AI & item tindakan", "Eksport PDF & teks", "Sokongan keutamaan"], cta: "Mula percuma →" },
      annual: { label: "TAHUNAN", badge: "✦ Nilai Terbaik ✦", price: "RM 300", period: "/taun", originalPrice: "RM 600/taun", desc: "Mesyuarat enda terbatas. Jimat RM 300 berbanding bil bulanan.", features: ["Semua dalam Bulanan", "Jimat 50% berbanding bulanan", "Resit tahunan untuk tuntutan", "Sokongan khusus", "Akses awal ka ciri baru"], cta: "Mula percuma →" },
      payPerUse: { label: "BAYAR IKUT GUNA", price: "RM 10", period: "/mesyuarat", desc: "Enda perlu langganan. Bayar aja apabila nuan gunakannya.", features: ["Enda ada komitmen bulanan", "Ciri Ejen AI penuh", "Transkripsi & ringkasan", "Eksport nota", "Tambah nilai bila-bila masa"], cta: "Mula percuma →" },
      testerCode: "Ada kod penguji? Gunakannya percuma!",
      testerCta: "Masuk ngga tebus →",
      testerSub: "Kemudian dari RM 10/mesyuarat tauka RM 50/bulan. Batal bila-bila masa.",
    },
    cta: { title: "Masa nuan lebih berharga.", subtitle: "Sertai profesional ti udah dapati semula jadual nuan enggau MeetingClone.", button: "Mulaka bulan percuma nuan →" },
    footer: { logoSub: "PEMBANTU MESYUARAT AI", innovated: "Dibangunkan Oleh Pasukan KOBIS AI Prodigy", language: "BAHASA", copyright: "© 2026 MeetingClone oleh KOBIS Berhad. Hak cipta terpelihara. Dibangunkan Oleh Pasukan KOBIS AI Prodigy" },
    dashboard: { title: "Mesyuarat Aku", newMeeting: "Mesyuarat Baru", noMeetings: "Enda ada mesyuarat lagi. Hantar Ejen AI pertama nuan!", columns: { title: "Tajuk", status: "Status", date: "Tarikh", duration: "Tempoh", actions: "Tindakan" }, viewNotes: "Meda Nota", status: { pending: "Nunggu", joining: "Menyertai", in_progress: "Sedang Berlangsung", processing: "Memproses", completed: "Selesai", failed: "Gagal" } },
    profile: { title: "Tetapan Profil", displayName: "Nama Paparan", email: "E-mel", avatar: "Avatar", save: "Simpan Perubahan", saved: "Disimpan!" },
    newMeeting: { title: "Mesyuarat Baru", urlLabel: "URL Mesyuarat", urlPlaceholder: "https://zoom.us/j/... tauka https://meet.google.com/...", botNameLabel: "Nama Paparan Bot", botNamePlaceholder: "Ejen AI", avatarLabel: "URL Avatar Bot (pilihan)", deploy: "Hantar Ejen AI", deploying: "Ngirumkan...", success: "Ejen AI berjaya dihantar!" },
    subscription: { title: "Langganan", currentPlan: "Pelan Semasa", promoCode: "Kod Penguji", promoPlaceholder: "Masukkan kod nuan", applyPromo: "Guna", cancel: "Batal Langganan", activate: "Aktifkan Pelan" },
  },
};

export function useTranslations(lang: Language) {
  return translations[lang] ?? translations.en;
}

export default translations;
