import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { api } from "../../lib/api";
import type { ApiUser } from "../../lib/types";
import type { Page } from "../types";
import { t } from "../../lib/i18n";
import BackButton from "../components/BackButton";

export default function LoginPage({ onNav, onAuth, goBack }: { onNav: (p: Page) => void; onAuth: (user: ApiUser) => void; goBack: () => void }) {
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await api.login(phoneOrEmail, password);
      api.saveToken(result.access_token);
      onAuth(result.user);
      onNav("dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kirishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (window as any).onTelegramAuth = async (user: any) => {
      try {
        setLoading(true);
        setError("");
        const result = await api.telegramAuth({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name || "",
          username: user.username || "",
          photo_url: user.photo_url || "",
          auth_date: user.auth_date,
          hash: user.hash,
        });
        api.saveToken(result.access_token);
        onAuth(result.user);
        onNav("dashboard");
      } catch (err) {
        setError("Telegram orqali kirishda xatolik. Iltimos, qayta urinib ko'ring.");
      } finally {
        setLoading(false);
      }
    };

    (window as any).handleGoogleCredential = async (response: any) => {
      try {
        setLoading(true);
        setError("");
        const result = await api.googleAuth(response.credential);
        api.saveToken(result.access_token);
        onAuth(result.user);
        onNav("dashboard");
      } catch (err) {
        setError("Google orqali kirishda xatolik. Iltimos, qayta urinib ko'ring.");
      } finally {
        setLoading(false);
      }
    };

    if (googleClientId) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: window.handleGoogleCredential,
          });
          window.google.accounts.id.renderButton(
            document.getElementById("google-signin-btn"),
            { theme: "outline", size: "large", width: "100%", text: "signin_with", shape: "pill" }
          );
        }
      };
      document.body.appendChild(script);
      return () => {
        if (script.parentNode) script.parentNode.removeChild(script);
      };
    }
  }, []);

  const handleTelegramClick = () => {
    setLoading(true);
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", "Uymapbot");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;
    document.body.appendChild(script);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <BackButton onClick={goBack} />
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <MapPin size={22} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Xush kelibsiz</h1>
          <p className="text-sm text-gray-500 mt-1.5">Hisobingizga kiring</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-7">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                Telefon yoki Email
              </label>
              <input
                type="text"
                placeholder="+998 90 123 45 67 yoki email@example.com"
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Parol</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
            {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
            <div className="flex justify-end">
              <button className="text-xs text-green-600 hover:text-green-700 font-medium">
                Parolni unutdingizmi?
              </button>
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {loading ? "Kirilmoqda..." : t("login")}
            </button>
          </div>

          <div className="flex items-center my-5 gap-3">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-xs text-gray-400">yoki</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <div className="flex gap-3">
            {googleClientId ? (
              <div id="google-signin-btn" className="flex-1"></div>
            ) : (
              <button disabled className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-400 flex items-center justify-center gap-2 cursor-not-allowed">
                <span className="font-extrabold text-blue-300">G</span> Google
              </button>
            )}
            <button onClick={handleTelegramClick} disabled={loading}
              className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
              <span className="font-extrabold text-blue-400">T</span> {loading ? "Telegram..." : "Telegram"}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Hisob yo'qmi?{" "}
            <button
              onClick={() => onNav("register")}
              className="text-green-600 font-bold hover:text-green-700"
            >
              {t("register")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
