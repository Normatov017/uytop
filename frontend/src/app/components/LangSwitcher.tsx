import { getLang, setLang, type Lang } from "../../lib/i18n";
import { useState } from "react";

const LANGS: { code: Lang; label: string }[] = [
  { code: "uz", label: "O'" },
  { code: "ru", label: "Ру" },
  { code: "en", label: "En" },
];

export default function LangSwitcher() {
  const [lang, setLangState] = useState(getLang());

  return (
    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-xs">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => {
            setLang(l.code);
            setLangState(l.code);
          }}
          className={`px-2 py-1 font-semibold transition-colors ${
            lang === l.code ? "bg-green-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
