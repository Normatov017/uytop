import { Eye } from "lucide-react";

export default function StatsBadge({ views, phoneClicks }: { views: number; phoneClicks?: number }) {
  return (
    <div className="flex items-center gap-1 text-[10px] text-gray-400">
      <Eye size={10} />
      {views}
      {phoneClicks !== undefined && phoneClicks > 0 && (
        <span className="ml-1">📞 {phoneClicks}</span>
      )}
    </div>
  );
}
