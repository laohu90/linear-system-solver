import React from 'react';
import { ShieldCheck, Lock, HardDrive, EyeOff, BookOpen, CheckCircle } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface PrivacyViewProps {
  lang?: Language;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({ lang = 'en' }) => {
  const t = translations[lang];
  const isZh = lang === 'zh';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {t.privacyHeading}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.privacySub}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isZh ? '100% 浏览器本地运算' : '100% In-Browser Computation'}</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>{isZh ? '无个人身份信息收集' : 'Zero PII Collection'}</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-800 border border-purple-200 font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-purple-600" />
            <span>{isZh ? '符合 COPPA / FERPA 教育规范' : 'COPPA & FERPA Educational Compliant'}</span>
          </span>
        </div>
      </div>

      {/* Policy Details Cards */}
      <div className="space-y-4">
        {/* Section 1 */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <HardDrive className="w-4 h-4 text-blue-600" />
            <h3>{t.privacyP1Title}</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
            {t.privacyP1Text}
          </p>
        </div>

        {/* Section 2 */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <EyeOff className="w-4 h-4 text-emerald-600" />
            <h3>{t.privacyP2Title}</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
            {t.privacyP2Text}
          </p>
        </div>

        {/* Section 3 */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Lock className="w-4 h-4 text-amber-600" />
            <h3>{t.privacyP3Title}</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
            {t.privacyP3Text}
          </p>
        </div>

        {/* Section 4 */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <h3>{t.privacyP4Title}</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
            {t.privacyP4Text}
          </p>
        </div>
      </div>

      {/* Contact & Terms Note */}
      <div className="p-4 bg-slate-100 rounded-xl border border-slate-200/80 text-xs text-slate-500 text-center leading-relaxed">
        {isZh
          ? '本隐私政策自 2026 年 10 月起生效。如有关于隐私安全或学术使用的疑问，欢迎查阅开源代码或与我们交流。'
          : 'This Privacy Policy is effective as of October 2026. For questions regarding student privacy or non-commercial classroom usage, please consult the open source repository.'}
      </div>
    </div>
  );
};
