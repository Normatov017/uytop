import { ChevronLeft } from "lucide-react";

export default function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
    >
      <ChevronLeft size={18} /> Orqaga
    </button>
  );
}
