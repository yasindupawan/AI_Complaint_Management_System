import { Link, useNavigate } from "react-router-dom";
import {
  BrainCircuit,
  Eye,
  EyeOff,
  Globe2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";
import { useState } from "react";

import { loginUser } from "../api/authApi";

/* =========================================================
   TRANSLATIONS
========================================================= */

const translations = {
  EN: {
    brand: "Public Complaint",
    brandSub: "AI Management System",

    badge: "Secure User Access",

    heroTitle1: "Welcome back to your",
    heroTitle2: "public service portal.",

    heroDescription:
      "Sign in to submit public complaints, track their progress, receive status notifications and manage your complaint history.",

    aiTitle: "AI-Powered Processing",
    aiDescription:
      "Complaints are intelligently analyzed to support efficient processing and routing.",

    trackTitle: "Track Your Complaints",
    trackDescription:
      "View complaint progress and stay informed throughout the resolution process.",

    signIn: "Sign in",
    signInDescription: "Enter your account details to continue.",

    email: "Email Address",
    emailPlaceholder: "Enter your email",

    password: "Password",
    passwordPlaceholder: "Enter your password",

    forgotPassword: "Forgot password?",
    rememberMe: "Remember me",

    signInButton: "Sign In",
    signingIn: "Signing in...",

    noAccount: "Don't have an account?",
    createAccount: "Create an account",

    backHome: "Back to Home",

    emailRequired: "Please enter your email address.",
    passwordRequired: "Please enter your password.",
    loginFailed: "Login failed. Please try again.",
    invalidRole: "Invalid user role received from server.",

    footer:
      "AI-Powered Multilingual Public Complaint Management System",
  },

  "සිං": {
    brand: "මහජන පැමිණිලි",
    brandSub: "AI කළමනාකරණ පද්ධතිය",

    badge: "ආරක්ෂිත පරිශීලක ප්‍රවේශය",

    heroTitle1: "ඔබගේ මහජන සේවා",
    heroTitle2: "ද්වාරයට නැවත සාදරයෙන් පිළිගනිමු.",

    heroDescription:
      "මහජන පැමිණිලි ඉදිරිපත් කිරීමට, ඒවායේ ප්‍රගතිය නිරීක්ෂණය කිරීමට, තත්ත්ව දැනුම්දීම් ලබා ගැනීමට සහ ඔබගේ පැමිණිලි ඉතිහාසය කළමනාකරණය කිරීමට පිවිසෙන්න.",

    aiTitle: "AI මගින් ක්‍රියාත්මක සැකසීම",
    aiDescription:
      "කාර්යක්ෂම සැකසීම සහ අදාළ අංශ වෙත යොමු කිරීම සඳහා පැමිණිලි බුද්ධිමත්ව විශ්ලේෂණය කරයි.",

    trackTitle: "ඔබගේ පැමිණිලි නිරීක්ෂණය කරන්න",
    trackDescription:
      "ඔබගේ පැමිණිල්ලේ ප්‍රගතිය නිරීක්ෂණය කර විසඳුම් ක්‍රියාවලිය පුරා යාවත්කාලීන තොරතුරු ලබා ගන්න.",

    signIn: "පිවිසෙන්න",
    signInDescription:
      "ඉදිරියට යාමට ඔබගේ ගිණුම් තොරතුරු ඇතුළත් කරන්න.",

    email: "ඊමේල් ලිපිනය",
    emailPlaceholder: "ඔබගේ ඊමේල් ලිපිනය ඇතුළත් කරන්න",

    password: "මුරපදය",
    passwordPlaceholder: "ඔබගේ මුරපදය ඇතුළත් කරන්න",

    forgotPassword: "මුරපදය අමතකද?",
    rememberMe: "මාව මතක තබා ගන්න",

    signInButton: "පිවිසෙන්න",
    signingIn: "පිවිසෙමින්...",

    noAccount: "ගිණුමක් නොමැතිද?",
    createAccount: "ගිණුමක් සාදන්න",

    backHome: "මුල් පිටුවට",

    emailRequired: "කරුණාකර ඊමේල් ලිපිනය ඇතුළත් කරන්න.",
    passwordRequired: "කරුණාකර මුරපදය ඇතුළත් කරන්න.",
    loginFailed: "පිවිසීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.",
    invalidRole: "සේවාදායකයෙන් වැරදි පරිශීලක භූමිකාවක් ලැබුණි.",

    footer:
      "AI බලගැන්වූ බහුභාෂා මහජන පැමිණිලි කළමනාකරණ පද්ධතිය",
  },

  தமிழ்: {
    brand: "பொது புகார்கள்",
    brandSub: "AI மேலாண்மை அமைப்பு",

    badge: "பாதுகாப்பான பயனர் அணுகல்",

    heroTitle1: "உங்கள் பொது சேவை",
    heroTitle2: "தளத்திற்கு மீண்டும் வரவேற்கிறோம்.",

    heroDescription:
      "பொது புகார்களை சமர்ப்பிக்கவும், அவற்றின் முன்னேற்றத்தைக் கண்காணிக்கவும், நிலை அறிவிப்புகளைப் பெறவும் மற்றும் உங்கள் புகார் வரலாற்றை நிர்வகிக்கவும் உள்நுழையவும்.",

    aiTitle: "AI ஆதரவு செயலாக்கம்",
    aiDescription:
      "திறமையான செயலாக்கம் மற்றும் சரியான துறைக்கு வழிமாற்றுவதற்கு புகார்கள் அறிவார்ந்த முறையில் பகுப்பாய்வு செய்யப்படுகின்றன.",

    trackTitle: "உங்கள் புகார்களைக் கண்காணிக்கவும்",
    trackDescription:
      "உங்கள் புகாரின் முன்னேற்றத்தைப் பார்த்து தீர்வு செயல்முறை முழுவதும் தகவல்களைப் பெறுங்கள்.",

    signIn: "உள்நுழைக",
    signInDescription:
      "தொடர உங்கள் கணக்கு விவரங்களை உள்ளிடவும்.",

    email: "மின்னஞ்சல் முகவரி",
    emailPlaceholder: "உங்கள் மின்னஞ்சலை உள்ளிடவும்",

    password: "கடவுச்சொல்",
    passwordPlaceholder: "உங்கள் கடவுச்சொல்லை உள்ளிடவும்",

    forgotPassword: "கடவுச்சொல் மறந்துவிட்டதா?",
    rememberMe: "என்னை நினைவில் கொள்க",

    signInButton: "உள்நுழைக",
    signingIn: "உள்நுழைகிறது...",

    noAccount: "கணக்கு இல்லையா?",
    createAccount: "கணக்கை உருவாக்கவும்",

    backHome: "முகப்பிற்கு திரும்பு",

    emailRequired: "மின்னஞ்சல் முகவரியை உள்ளிடவும்.",
    passwordRequired: "கடவுச்சொல்லை உள்ளிடவும்.",
    loginFailed: "உள்நுழைவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.",
    invalidRole: "சேவையகத்திலிருந்து தவறான பயனர் பங்கு பெறப்பட்டது.",

    footer:
      "AI ஆதரவு பன்மொழி பொது புகார் மேலாண்மை அமைப்பு",
  },
};

/* =========================================================
   LOGIN PAGE
========================================================= */

function LoginPage() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState("EN");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const t = translations[language];

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  /* =========================================================
     CLEAR EXISTING AUTH DATA
  ========================================================= */

  const clearAuthentication = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  };

  /* =========================================================
     STORE AUTH DATA
  ========================================================= */

  const storeAuthentication = (token, user, rememberMe) => {
    clearAuthentication();

    const storage = rememberMe
      ? localStorage
      : sessionStorage;

    storage.setItem("token", token);

    storage.setItem(
      "user",
      JSON.stringify(user)
    );
  };

  /* =========================================================
     ROLE BASED REDIRECT
  ========================================================= */

  const redirectUserByRole = (role) => {
    switch (role) {
      case "citizen":
        navigate("/dashboard", {
          replace: true,
        });
        break;

      case "admin":
        navigate("/admin/dashboard", {
          replace: true,
        });
        break;

      case "officer":
        navigate("/officer/dashboard", {
          replace: true,
        });
        break;

      default:
        navigate("/", {
          replace: true,
        });
    }
  };

  /* =========================================================
     LOGIN SUBMIT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");

    if (!formData.email.trim()) {
      setErrorMessage(
        t.emailRequired
      );

      return;
    }

    if (!formData.password) {
      setErrorMessage(
        t.passwordRequired
      );

      return;
    }

    try {
      setIsLoading(true);

      const loginData = {
        email:
          formData.email
            .trim()
            .toLowerCase(),

        password:
          formData.password,
      };

      const response =
        await loginUser(loginData);

      console.log(
        "Login response:",
        response
      );

      if (
        !response?.token ||
        !response?.user
      ) {
        throw {
          success: false,
          message:
            "Invalid login response received from server.",
        };
      }

      const validRoles = [
        "citizen",
        "admin",
        "officer",
      ];

      if (
        !validRoles.includes(
          response.user.role
        )
      ) {
        throw {
          success: false,
          message:
            t.invalidRole,
        };
      }

      storeAuthentication(
        response.token,
        response.user,
        formData.rememberMe
      );

      if (
        response.user
          ?.preferredLanguage
      ) {
        localStorage.setItem(
          "preferredLanguage",
          response.user
            .preferredLanguage
        );
      }

      redirectUserByRole(
        response.user.role
      );
    } catch (error) {
      console.error(
        "Login failed:",
        error
      );

      clearAuthentication();

      if (
        Array.isArray(error?.errors) &&
        error.errors.length > 0
      ) {
        setErrorMessage(
          error.errors
            .map(
              (item) =>
                item.msg ||
                item.message
            )
            .filter(Boolean)
            .join(" ")
        );
      } else {
        setErrorMessage(
          error?.message ||
            t.loginFailed
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================================================
     PAGE
  ========================================================= */

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
              <BrainCircuit size={25} />
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

              <ShieldCheck size={17} />

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

            <div className="mt-10 grid max-w-lg gap-4">

              {/* AI */}

              <div className="flex items-start gap-4 rounded-2xl border border-[#D8E5EC] bg-white/90 p-5 shadow-sm backdrop-blur">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF3F8] text-[#1F5F8B]">
                  <BrainCircuit size={22} />
                </div>

                <div>

                  <h3 className="font-bold text-[#16324A]">
                    {t.aiTitle}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-[#60798C]">
                    {t.aiDescription}
                  </p>

                </div>

              </div>

              {/* TRACKING */}

              <div className="flex items-start gap-4 rounded-2xl border border-[#D8E5EC] bg-white/90 p-5 shadow-sm backdrop-blur">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F6F4] text-[#1B8A8F]">
                  <ShieldCheck size={22} />
                </div>

                <div>

                  <h3 className="font-bold text-[#16324A]">
                    {t.trackTitle}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-[#60798C]">
                    {t.trackDescription}
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              LOGIN SIDE
          ================================================= */}

          <div className="mx-auto w-full max-w-md">

            <Link
              to="/"
              className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#60798C] transition hover:text-[#1B8A8F] lg:hidden"
            >
              <ArrowLeft size={17} />

              {t.backHome}
            </Link>

            <div className="rounded-[28px] border border-[#D8E5EC] bg-white p-7 shadow-xl shadow-[#123B5D]/10 sm:p-9">

              {/* LOGIN HEADER */}

              <div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F6F4] text-[#1B8A8F]">
                  <LockKeyhole size={24} />
                </div>

                <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#16324A]">
                  {t.signIn}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#60798C]">
                  {t.signInDescription}
                </p>

              </div>

              {/* =================================================
                  ERROR MESSAGE
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
                  LOGIN FORM
              ================================================= */}

              <form
                className="mt-8 space-y-5"
                onSubmit={handleSubmit}
              >

                {/* EMAIL */}

                <div>

                  <label
                    htmlFor="email"
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
                      id="email"
                      name="email"
                      type="email"
                      value={
                        formData.email
                      }
                      onChange={
                        handleChange
                      }
                      autoComplete="email"
                      placeholder={
                        t.emailPlaceholder
                      }
                      disabled={isLoading}
                      required
                      className="w-full rounded-xl border border-[#C8D8E2] bg-white py-3.5 pl-11 pr-4 text-sm text-[#16324A] outline-none transition placeholder:text-[#8A9EAC] focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:cursor-not-allowed disabled:bg-[#F1F5F7]"
                    />

                  </div>

                </div>

                {/* PASSWORD */}

                <div>

                  <div className="mb-2 flex items-center justify-between gap-4">

                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-[#425D70]"
                    >
                      {t.password}
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-right text-xs font-semibold text-[#1B8A8F] transition hover:text-[#176D72]"
                    >
                      {t.forgotPassword}
                    </Link>

                  </div>

                  <div className="relative">

                    <LockKeyhole
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9EAC]"
                    />

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        formData.password
                      }
                      onChange={
                        handleChange
                      }
                      autoComplete="current-password"
                      placeholder={
                        t.passwordPlaceholder
                      }
                      disabled={isLoading}
                      required
                      className="w-full rounded-xl border border-[#C8D8E2] bg-white py-3.5 pl-11 pr-12 text-sm text-[#16324A] outline-none transition placeholder:text-[#8A9EAC] focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:cursor-not-allowed disabled:bg-[#F1F5F7]"
                    />

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() =>
                        setShowPassword(
                          (previous) =>
                            !previous
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A9EAC] transition hover:text-[#425D70] disabled:cursor-not-allowed"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >

                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}

                    </button>

                  </div>

                </div>

                {/* REMEMBER ME */}

                <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-[#60798C]">

                  <input
                    name="rememberMe"
                    type="checkbox"
                    checked={
                      formData.rememberMe
                    }
                    onChange={
                      handleChange
                    }
                    disabled={isLoading}
                    className="h-4 w-4 cursor-pointer rounded border-[#C8D8E2] accent-[#1B8A8F]"
                  />

                  <span>
                    {t.rememberMe}
                  </span>

                </label>

                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1F5F8B] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#1F5F8B]/20 transition hover:-translate-y-0.5 hover:bg-[#174D72] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >

                  {isLoading && (
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                  )}

                  {isLoading
                    ? t.signingIn
                    : t.signInButton}

                </button>

              </form>

              {/* REGISTER */}

              <div className="mt-7 border-t border-[#D8E5EC] pt-6 text-center">

                <p className="text-sm leading-6 text-[#60798C]">

                  {t.noAccount}{" "}

                  <Link
                    to="/register"
                    className="font-bold text-[#1B8A8F] transition hover:text-[#176D72]"
                  >
                    {t.createAccount}
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

export default LoginPage;