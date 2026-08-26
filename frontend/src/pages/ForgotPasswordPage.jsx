import { useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  Mail,
  ShieldCheck,
  AlertCircle,
  Globe2,
} from "lucide-react";

import { forgotPassword } from "../api/authApi";

/* =========================================================
   TRANSLATIONS
========================================================= */

const translations = {
  EN: {
    brand: "Public Complaint",
    brandSub: "AI Management System",

    badge: "Secure Account Recovery",

    heroTitle1: "Forgot your password?",
    heroTitle2: "Recover your account securely.",

    heroDescription:
      "Enter the email address associated with your account. We will provide a secure password reset link that can be used to create a new password.",

    secureTitle: "Secure Password Reset",
    secureDescription:
      "Password reset links are temporary and can only be used to update the password for the associated account.",

    resetTitle: "Reset your password",
    resetDescription:
      "Enter the email address registered with your account to continue.",

    email: "Email Address",
    emailPlaceholder: "Enter your registered email",

    sendResetLink: "Send Reset Link",
    processing: "Processing...",

    emailRequired: "Please enter your email address.",

    requestFailed:
      "Unable to process your password reset request.",

    successMessage:
      "If an account exists for this email, password reset instructions have been generated.",

    developmentTitle: "Development Reset Link",
    developmentDescription:
      "Email delivery is not connected yet. Use this temporary link to test the reset-password page.",

    continueReset: "Continue to Reset Password",

    rememberPassword: "Remember your password?",
    signIn: "Sign in",

    backToSignIn: "Back to Sign In",
    backHome: "Back to Home",

    footer:
      "AI-Powered Multilingual Public Complaint Management System",
  },

  "සිං": {
    brand: "මහජන පැමිණිලි",
    brandSub: "AI කළමනාකරණ පද්ධතිය",

    badge: "ආරක්ෂිත ගිණුම් ප්‍රතිසාධනය",

    heroTitle1: "ඔබගේ මුරපදය අමතකද?",
    heroTitle2: "ඔබගේ ගිණුම ආරක්ෂිතව නැවත ලබාගන්න.",

    heroDescription:
      "ඔබගේ ගිණුමට සම්බන්ධ ඊමේල් ලිපිනය ඇතුළත් කරන්න. නව මුරපදයක් සකස් කිරීම සඳහා ආරක්ෂිත මුරපද ප්‍රතිසාධන සබැඳියක් ලබා දෙනු ඇත.",

    secureTitle: "ආරක්ෂිත මුරපද ප්‍රතිසාධනය",
    secureDescription:
      "මුරපද ප්‍රතිසාධන සබැඳි තාවකාලික වන අතර අදාළ ගිණුමේ මුරපදය වෙනස් කිරීම සඳහා පමණක් භාවිතා කළ හැක.",

    resetTitle: "ඔබගේ මුරපදය නැවත සකසන්න",
    resetDescription:
      "ඉදිරියට යාමට ඔබගේ ගිණුමට ලියාපදිංචි කර ඇති ඊමේල් ලිපිනය ඇතුළත් කරන්න.",

    email: "ඊමේල් ලිපිනය",
    emailPlaceholder:
      "ඔබගේ ලියාපදිංචි ඊමේල් ලිපිනය ඇතුළත් කරන්න",

    sendResetLink: "ප්‍රතිසාධන සබැඳිය යවන්න",
    processing: "සකසමින්...",

    emailRequired:
      "කරුණාකර ඔබගේ ඊමේල් ලිපිනය ඇතුළත් කරන්න.",

    requestFailed:
      "මුරපද ප්‍රතිසාධන ඉල්ලීම සකස් කිරීමට නොහැකි විය.",

    successMessage:
      "මෙම ඊමේල් ලිපිනයට ගිණුමක් තිබේ නම්, මුරපද ප්‍රතිසාධන උපදෙස් සකස් කර ඇත.",

    developmentTitle: "සංවර්ධන ප්‍රතිසාධන සබැඳිය",
    developmentDescription:
      "ඊමේල් සේවාව තවම සම්බන්ධ කර නොමැත. මුරපද ප්‍රතිසාධන පිටුව පරීක්ෂා කිරීමට මෙම තාවකාලික සබැඳිය භාවිතා කරන්න.",

    continueReset: "මුරපදය නැවත සැකසීමට යන්න",

    rememberPassword: "ඔබගේ මුරපදය මතකද?",
    signIn: "පිවිසෙන්න",

    backToSignIn: "පිවිසුමට ආපසු යන්න",
    backHome: "මුල් පිටුවට",

    footer:
      "AI බලගැන්වූ බහුභාෂා මහජන පැමිණිලි කළමනාකරණ පද්ධතිය",
  },

  "தமிழ்": {
    brand: "பொது புகார்கள்",
    brandSub: "AI மேலாண்மை அமைப்பு",

    badge: "பாதுகாப்பான கணக்கு மீட்பு",

    heroTitle1: "உங்கள் கடவுச்சொல்லை மறந்துவிட்டீர்களா?",
    heroTitle2: "உங்கள் கணக்கை பாதுகாப்பாக மீட்டெடுக்கவும்.",

    heroDescription:
      "உங்கள் கணக்குடன் இணைக்கப்பட்ட மின்னஞ்சல் முகவரியை உள்ளிடவும். புதிய கடவுச்சொல்லை உருவாக்க பாதுகாப்பான கடவுச்சொல் மீட்டமைப்பு இணைப்பு வழங்கப்படும்.",

    secureTitle: "பாதுகாப்பான கடவுச்சொல் மீட்டமைப்பு",
    secureDescription:
      "கடவுச்சொல் மீட்டமைப்பு இணைப்புகள் தற்காலிகமானவை மற்றும் தொடர்புடைய கணக்கின் கடவுச்சொல்லை மாற்ற மட்டுமே பயன்படுத்த முடியும்.",

    resetTitle: "உங்கள் கடவுச்சொல்லை மீட்டமைக்கவும்",
    resetDescription:
      "தொடர உங்கள் கணக்கில் பதிவு செய்யப்பட்ட மின்னஞ்சல் முகவரியை உள்ளிடவும்.",

    email: "மின்னஞ்சல் முகவரி",
    emailPlaceholder:
      "பதிவு செய்யப்பட்ட மின்னஞ்சலை உள்ளிடவும்",

    sendResetLink: "மீட்டமைப்பு இணைப்பை அனுப்பவும்",
    processing: "செயலாக்கப்படுகிறது...",

    emailRequired:
      "உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடவும்.",

    requestFailed:
      "கடவுச்சொல் மீட்டமைப்பு கோரிக்கையை செயலாக்க முடியவில்லை.",

    successMessage:
      "இந்த மின்னஞ்சலுக்கு கணக்கு இருந்தால், கடவுச்சொல் மீட்டமைப்பு வழிமுறைகள் உருவாக்கப்பட்டுள்ளன.",

    developmentTitle: "Development Reset Link",
    developmentDescription:
      "மின்னஞ்சல் சேவை இன்னும் இணைக்கப்படவில்லை. கடவுச்சொல் மீட்டமைப்பு பக்கத்தை சோதிக்க இந்த தற்காலிக இணைப்பைப் பயன்படுத்தவும்.",

    continueReset: "கடவுச்சொல்லை மீட்டமைக்க தொடரவும்",

    rememberPassword:
      "உங்கள் கடவுச்சொல் நினைவில் உள்ளதா?",
    signIn: "உள்நுழைக",

    backToSignIn: "உள்நுழைவிற்கு திரும்பு",
    backHome: "முகப்பிற்கு திரும்பு",

    footer:
      "AI ஆதரவு பன்மொழி பொது புகார் மேலாண்மை அமைப்பு",
  },
};

/* =========================================================
   FORGOT PASSWORD PAGE
========================================================= */

function ForgotPasswordPage() {
  const [language, setLanguage] = useState("EN");

  const [email, setEmail] = useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  // Development only:
  // Remove this when real email delivery is connected.
  const [resetUrl, setResetUrl] =
    useState("");

  const t = translations[language];

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setResetUrl("");

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorMessage(
        t.emailRequired
      );

      return;
    }

    try {
      setIsLoading(true);

      const response =
        await forgotPassword(
          normalizedEmail
        );

      setSuccessMessage(
        response?.message ||
          t.successMessage
      );

      if (response?.resetUrl) {
        setResetUrl(
          response.resetUrl
        );
      }
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      setErrorMessage(
        error?.message ||
          t.requestFailed
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F9FB] text-[#16324A]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-[#D8E5EC] bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">

          {/* LOGO */}

          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#123B5D] text-white shadow-md shadow-[#123B5D]/15">
              <BrainCircuit
                size={25}
              />
            </div>

            <div className="leading-tight">

              <p className="text-[17px] font-bold text-[#16324A]">
                {t.brand}
              </p>

              <p className="text-xs font-medium text-[#1B8A8F]">
                {t.brandSub}
              </p>

            </div>
          </Link>

          {/* LANGUAGE SELECTOR */}

          <div className="flex items-center gap-1 rounded-lg border border-[#D8E5EC] bg-[#F6F9FB] p-1">

            <Globe2
              size={16}
              className="ml-2 hidden text-[#60798C] sm:block"
            />

            {[
              "EN",
              "සිං",
              "தமிழ்",
            ].map((item) => (

              <button
                key={item}
                type="button"
                disabled={isLoading}
                onClick={() =>
                  setLanguage(item)
                }
                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                  language === item
                    ? "bg-white text-[#1F5F8B] shadow-sm"
                    : "text-[#60798C] hover:text-[#16324A]"
                }`}
              >
                {item}
              </button>

            ))}

          </div>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="relative overflow-hidden">

        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#DCECF4]/80 blur-3xl" />

        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#DDF3EE]/70 blur-3xl" />

        <div className="relative mx-auto grid min-h-[calc(100vh-78px)] max-w-7xl items-center gap-16 px-5 py-12 lg:grid-cols-2 lg:px-8">

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="hidden lg:block">

            <div className="inline-flex items-center gap-2 rounded-full border border-[#B9DDDA] bg-[#E8F6F4] px-4 py-2 text-sm font-semibold text-[#1B8A8F]">

              <ShieldCheck
                size={17}
              />

              {t.badge}

            </div>

            <h1 className="mt-7 max-w-xl text-5xl font-extrabold leading-[1.15] tracking-tight text-[#16324A]">

              {t.heroTitle1}

              <span className="mt-1 block text-[#1B8A8F]">
                {t.heroTitle2}
              </span>

            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-[#60798C]">
              {t.heroDescription}
            </p>

            <div className="mt-10 max-w-lg">

              <div className="flex items-start gap-4 rounded-2xl border border-[#D8E5EC] bg-white/90 p-5 shadow-sm backdrop-blur">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F6F4] text-[#1B8A8F]">

                  <KeyRound
                    size={22}
                  />

                </div>

                <div>

                  <h3 className="font-bold text-[#16324A]">
                    {t.secureTitle}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-[#60798C]">
                    {t.secureDescription}
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              FORM SIDE
          ================================================= */}

          <div className="mx-auto w-full max-w-md">

            <Link
              to="/login"
              className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#60798C] transition hover:text-[#1B8A8F] lg:hidden"
            >
              <ArrowLeft
                size={17}
              />

              {t.backToSignIn}
            </Link>

            <div className="rounded-[28px] border border-[#D8E5EC] bg-white p-7 shadow-xl shadow-[#123B5D]/10 sm:p-9">

              {/* HEADER */}

              <div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F6F4] text-[#1B8A8F]">
                  <KeyRound
                    size={24}
                  />
                </div>

                <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#16324A]">
                  {t.resetTitle}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#60798C]">
                  {t.resetDescription}
                </p>

              </div>

              {/* =================================================
                  ERROR
              ================================================= */}

              {errorMessage && (

                <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0"
                  />

                  <p>
                    {errorMessage}
                  </p>

                </div>

              )}

              {/* =================================================
                  SUCCESS
              ================================================= */}

              {successMessage && (

                <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">

                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0"
                  />

                  <p>
                    {successMessage}
                  </p>

                </div>

              )}

              {/* =================================================
                  DEVELOPMENT RESET LINK
              ================================================= */}

              {resetUrl && (

                <div className="mt-4 rounded-xl border border-[#B9DDDA] bg-[#F2FAF8] p-4">

                  <p className="text-xs font-bold uppercase tracking-wide text-[#176D72]">
                    {t.developmentTitle}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#60798C]">
                    {t.developmentDescription}
                  </p>

                  <a
                    href={resetUrl}
                    className="mt-3 inline-flex items-center gap-2 break-all text-sm font-bold text-[#1B8A8F] transition hover:text-[#176D72]"
                  >

                    <KeyRound
                      size={16}
                    />

                    {t.continueReset}

                  </a>

                </div>

              )}

              {/* =================================================
                  FORM
              ================================================= */}

              <form
                className="mt-7"
                onSubmit={handleSubmit}
              >

                <label
                  htmlFor="forgotPasswordEmail"
                  className="mb-2 block text-sm font-semibold text-[#425D70]"
                >
                  {t.email}
                </label>

                <div className="relative">

                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9EAC]"
                  />

                  <input
                    id="forgotPasswordEmail"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(
                        event.target.value
                      );

                      if (errorMessage) {
                        setErrorMessage("");
                      }
                    }}
                    placeholder={
                      t.emailPlaceholder
                    }
                    autoComplete="email"
                    required
                    disabled={isLoading}
                    className="w-full rounded-xl border border-[#C8D8E2] bg-white py-3.5 pl-11 pr-4 text-sm text-[#16324A] outline-none transition placeholder:text-[#8A9EAC] focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:cursor-not-allowed disabled:bg-[#F1F5F7]"
                  />

                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1F5F8B] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#1F5F8B]/20 transition hover:-translate-y-0.5 hover:bg-[#174D72] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >

                  {isLoading ? (
                    <>
                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                      />

                      {t.processing}
                    </>
                  ) : (
                    <>
                      <Mail
                        size={18}
                      />

                      {t.sendResetLink}
                    </>
                  )}

                </button>

              </form>

              {/* =================================================
                  LOGIN LINK
              ================================================= */}

              <div className="mt-7 border-t border-[#D8E5EC] pt-6 text-center">

                <p className="text-sm leading-6 text-[#60798C]">

                  {t.rememberPassword}{" "}

                  <Link
                    to="/login"
                    className="font-bold text-[#1B8A8F] transition hover:text-[#176D72]"
                  >
                    {t.signIn}
                  </Link>

                </p>

              </div>

            </div>

            <p className="mt-5 px-4 text-center text-xs leading-5 text-[#8A9EAC]">
              {t.footer}
            </p>

          </div>

        </div>

      </main>

    </div>
  );
}

export default ForgotPasswordPage;