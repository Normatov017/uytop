import { CheckCircle } from "lucide-react";
import { t } from "../../lib/i18n";

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-green-600 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
      <CheckCircle size={10} /> Tekshirilgan
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    sotuv: "bg-blue-600 text-white",
    ijara: "bg-amber-500 text-white",
    Aktiv: "bg-green-100 text-green-700",
    Moderatsiyada: "bg-amber-100 text-amber-700",
    "Rad etilgan": "bg-red-100 text-red-700",
    Sotilgan: "bg-gray-100 text-gray-600",
  };
  const label: Record<string, string> = { sotuv: t("sale"), ijara: t("rent") };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {label[status] ?? status}
    </span>
  );
}

export { VerifiedBadge, StatusBadge };
