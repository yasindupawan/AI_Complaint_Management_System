import { useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import {
  resetPassword,
} from "../api/authApi";

/* =========================================================
   TRANSLATIONS
========================================================= */

const translations = {
  EN: {
    brand: "Public Complaint",
    brandSub: "AI Management System",

    badge: "Secure Password Reset",

    heroTitle1: "Create a new password.",
    heroTitle2: "Secure your account again.",

    heroDescription:
      "Choose a new password for your account. After the password is successfully changed, the current reset link can no longer be used.",

    protectTitle: "Protect Your Account",
    protectDescription:
      "Use a password with at least 8 characters and avoid reusing a password that you use for another account.",

    formTitle: "Set new password",
    formDescription:
      "Enter and confirm your new password below.",

    newPassword: "New Password",
    newPasswordPlaceholder:
      "Enter your new password",

    confirmPassword: "Confirm New Password",
    confirmPasswordPlaceholder:
      "Enter your new password again",

    minimumCharacters:
      "Minimum 8 characters.",

    resetButton: "Reset Password",
    resetting: "Resetting Password...",

    invalidToken:
      "The password reset link is invalid. Please request a new reset link.",

    passwordTooShort:
      "Password must contain at least 8 characters.",

    passwordMismatch:
      "Passwords do not match.",

    resetSuccess:
      "Password reset successfully. You can now sign in.",

    resetFailed:
      "Unable to reset your password. The reset link may be invalid or expired.",

    returnTo: "Return to",
    signIn: "Sign in",

    backToSignIn:
      "Back to Sign In",

    footer:
      "AI-Powered Multilingual Public Complaint Management System",
  },

  "සිං": {
    brand: "මහජන පැමිණිලි",
    brandSub: "AI කළමනාකරණ පද්ධතිය",

    badge: "ආරක්ෂිත මුරපද ප්‍රතිසාධනය",

    heroTitle1: "නව මුරපදයක් සාදන්න.",
    heroTitle2:
      "ඔබගේ ගිණුම නැවත ආරක්ෂා කරන්න.",

    heroDescription:
      "ඔබගේ ගිණුම සඳහා නව මුරපදයක් තෝරන්න. මුරපදය සාර්ථකව වෙනස් කළ පසු වත්මන් ප්‍රතිසාධන සබැඳිය නැවත භාවිතා කළ නොහැක.",

    protectTitle: "ඔබගේ ගිණුම ආරක්ෂා කරන්න",
    protectDescription:
      "අවම වශයෙන් අක්ෂර 8ක් සහිත මුරපදයක් භාවිතා කරන්න. වෙනත් ගිණුමකට භාවිතා කරන මුරපදයක් නැවත භාවිතා නොකරන්න.",

    formTitle: "නව මුරපදය සකසන්න",
    formDescription:
      "ඔබගේ නව මුරපදය ඇතුළත් කර නැවත තහවුරු කරන්න.",

    newPassword: "නව මුරපදය",
    newPasswordPlaceholder:
      "ඔබගේ නව මුරපදය ඇතුළත් කරන්න",

    confirmPassword:
      "නව මුරපදය තහවුරු කරන්න",
    confirmPasswordPlaceholder:
      "නව මුරපදය නැවත ඇතුළත් කරන්න",

    minimumCharacters:
      "අවම වශයෙන් අක්ෂර 8ක් තිබිය යුතුය.",

    resetButton: "මුරපදය නැවත සකසන්න",
    resetting:
      "මුරපදය නැවත සකසමින්...",

    invalidToken:
      "මුරපද ප්‍රතිසාධන සබැඳිය වලංගු නොවේ. කරුණාකර නව ප්‍රතිසාධන සබැඳියක් ඉල්ලන්න.",

    passwordTooShort:
      "මුරපදය අවම වශයෙන් අක්ෂර 8ක් තිබිය යුතුය.",

    passwordMismatch:
      "මුරපද දෙක සමාන නොවේ.",

    resetSuccess:
      "මුරපදය සාර්ථකව නැවත සකසා ඇත. දැන් ඔබට පිවිසිය හැක.",

    resetFailed:
      "මුරපදය නැවත සකස් කළ නොහැක. ප්‍රතිසාධන සබැඳිය වලංගු නොවිය හැක හෝ කල් ඉකුත් වී ඇත.",

    returnTo: "ආපසු",
    signIn: "පිවිසෙන්න",

    backToSignIn:
      "පිවිසුමට ආපසු යන්න",

    footer:
      "AI බලගැන්වූ බහුභාෂා මහජන පැමිණිලි කළමනාකරණ පද්ධතිය",
  },

  "தமிழ்": {
    brand: "பொது புகார்கள்",
    brandSub: "AI மேலாண்மை அமைப்பு",

    badge: "பாதுகாப்பான கடவுச்சொல் மீட்டமைப்பு",

    heroTitle1:
      "புதிய கடவுச்சொல்லை உருவாக்கவும்.",
    heroTitle2:
      "உங்கள் கணக்கை மீண்டும் பாதுகாக்கவும்.",

    heroDescription:
      "உங்கள் கணக்கிற்கான புதிய கடவுச்சொல்லை தேர்வு செய்யவும். கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்ட பிறகு தற்போதைய மீட்டமைப்பு இணைப்பை மீண்டும் பயன்படுத்த முடியாது.",

    protectTitle:
      "உங்கள் கணக்கை பாதுகாக்கவும்",

    protectDescription:
      "குறைந்தது 8 எழுத்துகள் கொண்ட கடவுச்சொல்லை பயன்படுத்தவும். மற்றொரு கணக்கில் பயன்படுத்தும் கடவுச்சொல்லை மீண்டும் பயன்படுத்த வேண்டாம்.",

    formTitle:
      "புதிய கடவுச்சொல்லை அமைக்கவும்",

    formDescription:
      "புதிய கடவுச்சொல்லை உள்ளிட்டு உறுதிப்படுத்தவும்.",

    newPassword:
      "புதிய கடவுச்சொல்",

    newPasswordPlaceholder:
      "புதிய கடவுச்சொல்லை உள்ளிடவும்",

    confirmPassword:
      "புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும்",

    confirmPasswordPlaceholder:
      "புதிய கடவுச்சொல்லை மீண்டும் உள்ளிடவும்",

    minimumCharacters:
      "குறைந்தது 8 எழுத்துகள்.",

    resetButton:
      "கடவுச்சொல்லை மீட்டமைக்கவும்",

    resetting:
      "கடவுச்சொல் மீட்டமைக்கப்படுகிறது...",

    invalidToken:
      "கடவுச்சொல் மீட்டமைப்பு இணைப்பு தவறானது. புதிய மீட்டமைப்பு இணைப்பை கோரவும்.",

    passwordTooShort:
      "கடவுச்சொல் குறைந்தது 8 எழுத்துகள் கொண்டிருக்க வேண்டும்.",

    passwordMismatch:
      "கடவுச்சொற்கள் பொருந்தவில்லை.",

    resetSuccess:
      "கடவுச்சொல் வெற்றிகரமாக மீட்டமைக்கப்பட்டது. இப்போது உள்நுழையலாம்.",

    resetFailed:
      "கடவுச்சொல்லை மீட்டமைக்க முடியவில்லை. மீட்டமைப்பு இணைப்பு தவறானதாகவோ அல்லது காலாவதியானதாகவோ இருக்கலாம்.",

    returnTo: "திரும்ப",
    signIn: "உள்நுழைக",

    backToSignIn:
      "உள்நுழைவிற்கு திரும்பு",

    footer:
      "AI ஆதரவு பன்மொழி பொது புகார் மேலாண்மை அமைப்பு",
  },
};

/* =========================================================
   RESET PASSWORD PAGE
========================================================= */

function ResetPasswordPage() {
  const navigate =
    useNavigate();

  const { token } =
    useParams();

  const [
    language,
    setLanguage,
  ] = useState("EN");

  const [
    formData,
    setFormData,
  ] = useState({
    password: "",
    confirmPassword: "",
  });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const t =
    translations[language];

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!token) {
      setErrorMessage(
        t.invalidToken
      );

      return;
    }

    if (
      formData.password.length <
      8
    ) {
      setErrorMessage(
        t.passwordTooShort
      );

      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setErrorMessage(
        t.passwordMismatch
      );

      return;
    }

    try {
      setIsLoading(true);

      const response =
        await resetPassword(
          token,
          {
            password:
              formData.password,

            confirmPassword:
              formData.confirmPassword,
          }
        );

      setSuccessMessage(
        response?.message ||
          t.resetSuccess
      );

      setFormData({
        password: "",
        confirmPassword: "",
      });

      setTimeout(
        () => {
          navigate(
            "/login",
            {
              replace: true,
            }
          );
        },
        2000
      );
    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      setErrorMessage(
        error?.message ||
          t.resetFailed
      );
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
                disabled={
                  isLoading
                }
                onClick={() =>
                  setLanguage(
                    item
                  )
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
                    {t.protectTitle}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-[#60798C]">
                    {t.protectDescription}
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              RESET FORM
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

              {/* FORM HEADER */}

              <div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F6F4] text-[#1B8A8F]">
                  <LockKeyhole
                    size={24}
                  />
                </div>

                <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#16324A]">
                  {t.formTitle}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#60798C]">
                  {t.formDescription}
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
                  FORM
              ================================================= */}

              <form
                onSubmit={
                  handleSubmit
                }
                className="mt-7 space-y-5"
              >

                {/* NEW PASSWORD */}

                <div>

                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-[#425D70]"
                  >
                    {t.newPassword}
                  </label>

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
                      placeholder={
                        t.newPasswordPlaceholder
                      }
                      autoComplete="new-password"
                      minLength={8}
                      required
                      disabled={
                        isLoading ||
                        Boolean(
                          successMessage
                        )
                      }
                      className="w-full rounded-xl border border-[#C8D8E2] bg-white py-3.5 pl-11 pr-12 text-sm text-[#16324A] outline-none transition placeholder:text-[#8A9EAC] focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:cursor-not-allowed disabled:bg-[#F1F5F7]"
                    />

                    <button
                      type="button"
                      disabled={
                        isLoading
                      }
                      onClick={() =>
                        setShowPassword(
                          (previous) =>
                            !previous
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A9EAC] transition hover:text-[#425D70] disabled:cursor-not-allowed"
                    >

                      {showPassword ? (
                        <EyeOff
                          size={18}
                        />
                      ) : (
                        <Eye
                          size={18}
                        />
                      )}

                    </button>

                  </div>

                  <p className="mt-2 text-xs text-[#8A9EAC]">
                    {t.minimumCharacters}
                  </p>

                </div>

                {/* CONFIRM PASSWORD */}

                <div>

                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-[#425D70]"
                  >
                    {t.confirmPassword}
                  </label>

                  <div className="relative">

                    <LockKeyhole
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9EAC]"
                    />

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        formData.confirmPassword
                      }
                      onChange={
                        handleChange
                      }
                      placeholder={
                        t.confirmPasswordPlaceholder
                      }
                      autoComplete="new-password"
                      minLength={8}
                      required
                      disabled={
                        isLoading ||
                        Boolean(
                          successMessage
                        )
                      }
                      className="w-full rounded-xl border border-[#C8D8E2] bg-white py-3.5 pl-11 pr-12 text-sm text-[#16324A] outline-none transition placeholder:text-[#8A9EAC] focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:cursor-not-allowed disabled:bg-[#F1F5F7]"
                    />

                    <button
                      type="button"
                      disabled={
                        isLoading
                      }
                      onClick={() =>
                        setShowConfirmPassword(
                          (previous) =>
                            !previous
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A9EAC] transition hover:text-[#425D70] disabled:cursor-not-allowed"
                    >

                      {showConfirmPassword ? (
                        <EyeOff
                          size={18}
                        />
                      ) : (
                        <Eye
                          size={18}
                        />
                      )}

                    </button>

                  </div>

                </div>

                {/* RESET BUTTON */}

                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    Boolean(
                      successMessage
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1F5F8B] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#1F5F8B]/20 transition hover:-translate-y-0.5 hover:bg-[#174D72] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >

                  {isLoading ? (
                    <>
                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                      />

                      {t.resetting}
                    </>
                  ) : (
                    <>
                      <KeyRound
                        size={18}
                      />

                      {t.resetButton}
                    </>
                  )}

                </button>

              </form>

              {/* =================================================
                  SIGN IN LINK
              ================================================= */}

              <div className="mt-7 border-t border-[#D8E5EC] pt-6 text-center">

                <p className="text-sm leading-6 text-[#60798C]">

                  {t.returnTo}{" "}

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

export default ResetPasswordPage;