import type { SceneId } from "./timeline";

export type Term = {
  en: string;
  ar: string;
  /** reveal time as a fraction of the scene duration (tuned to the voiceover) */
  at: number;
};

export type StageContent = {
  id: SceneId;
  n: number;
  title: string;
  titleAt: number;
  terms: Term[];
};

export const STAGES: StageContent[] = [
  {
    id: "computer",
    n: 1,
    title: "أساسيات الحاسوب",
    titleAt: 0.17,
    terms: [
      { en: "CPU", ar: "المعالج", at: 0.4 },
      { en: "RAM", ar: "الذاكرة", at: 0.52 },
      { en: "Storage", ar: "التخزين", at: 0.63 },
      { en: "Windows", ar: "نظام التشغيل", at: 0.77 },
    ],
  },
  {
    id: "network",
    n: 2,
    title: "أساسيات الشبكات",
    titleAt: 0.19,
    terms: [
      { en: "TCP/IP", ar: "بروتوكولات الاتصال", at: 0.36 },
      { en: "DNS", ar: "نظام أسماء النطاقات", at: 0.5 },
      { en: "HTTP", ar: "نقل صفحات الويب", at: 0.66 },
      { en: "OSI", ar: "النموذج ذو الطبقات السبع", at: 0.8 },
    ],
  },
  {
    id: "os",
    n: 3,
    title: "أنظمة التشغيل",
    titleAt: 0.2,
    terms: [
      { en: "Windows", ar: "ويندوز", at: 0.43 },
      { en: "Linux", ar: "لينكس", at: 0.53 },
      { en: "Files", ar: "إدارة الملفات", at: 0.68 },
      { en: "Permissions", ar: "الصلاحيات", at: 0.86 },
    ],
  },
  {
    id: "programming",
    n: 4,
    title: "البرمجة والأتمتة",
    titleAt: 0.18,
    terms: [
      { en: "Python", ar: "بايثون", at: 0.42 },
      { en: "Bash", ar: "باش", at: 0.52 },
      { en: "PowerShell", ar: "باورشل", at: 0.61 },
    ],
  },
  {
    id: "secfund",
    n: 5,
    title: "أساسيات الأمن السيبراني",
    titleAt: 0.24,
    terms: [
      { en: "CIA Triad", ar: "السرية • السلامة • التوافر", at: 0.42 },
      { en: "Encryption", ar: "التشفير", at: 0.6 },
      { en: "MFA", ar: "التحقق متعدد العوامل", at: 0.7 },
      { en: "IAM", ar: "إدارة الهوية", at: 0.8 },
    ],
  },
  {
    id: "netsec",
    n: 6,
    title: "أمن الشبكات",
    titleAt: 0.04,
    terms: [
      { en: "Firewall", ar: "جدار الحماية", at: 0.24 },
      { en: "VPN", ar: "شبكة خاصة افتراضية", at: 0.42 },
      { en: "IDS", ar: "كشف التسلل", at: 0.6 },
      { en: "IPS", ar: "منع التسلل", at: 0.74 },
    ],
  },
  {
    id: "soc",
    n: 7,
    title: "مركز العمليات الأمنية",
    titleAt: 0.04,
    terms: [
      { en: "SIEM", ar: "إدارة الأحداث الأمنية", at: 0.22 },
      { en: "Log Analysis", ar: "تحليل السجلات", at: 0.38 },
      { en: "Incident Response", ar: "الاستجابة للحوادث", at: 0.58 },
    ],
  },
  {
    id: "hacking",
    n: 8,
    title: "الاختبار الأمني الأخلاقي",
    titleAt: 0.12,
    terms: [
      { en: "OWASP", ar: "أشهر ثغرات الويب", at: 0.42 },
      { en: "Vulnerability Assessment", ar: "تقييم الثغرات", at: 0.6 },
      { en: "Pentesting", ar: "اختبار الاختراق", at: 0.74 },
    ],
  },
  {
    id: "cloud",
    n: 9,
    title: "الأمن السحابي",
    titleAt: 0.07,
    terms: [
      { en: "AWS", ar: "خدمات أمازون السحابية", at: 0.36 },
      { en: "Azure", ar: "منصة مايكروسوفت", at: 0.5 },
      { en: "Cloud IAM", ar: "هويات وصلاحيات السحابة", at: 0.66 },
    ],
  },
  {
    id: "career",
    n: 10,
    title: "التخصصات المهنية",
    titleAt: 0.1,
    terms: [],
  },
];

export const stageById = (id: SceneId) => STAGES.find((s) => s.id === id);

export const CAREERS = [
  { en: "SOC Analyst", ar: "محلل مركز العمليات", at: 0.12 },
  { en: "Penetration Tester", ar: "مختبر اختراق", at: 0.155 },
  { en: "Cloud Security", ar: "أمن السحابة", at: 0.19 },
  { en: "GRC", ar: "الحوكمة والامتثال", at: 0.225 },
  { en: "Digital Forensics", ar: "التحقيق الرقمي", at: 0.26 },
];

export const PROJECTS = [
  { ar: "مختبر SIEM منزلي", at: 0.31 },
  { ar: "تقرير فحص ثغرات", at: 0.35 },
  { ar: "تحليل رسالة تصيّد", at: 0.39 },
  { ar: "Portfolio على GitHub", at: 0.43 },
];
