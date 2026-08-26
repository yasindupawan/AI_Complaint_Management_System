import { Link, useNavigate } from "react-router-dom";
import {
  BrainCircuit,
  Eye,
  EyeOff,
  Globe2,
  LockKeyhole,
  Mail,
  User,
  Languages,
  UserPlus,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";
import { useState } from "react";

import { registerUser } from "../api/authApi";

/* =========================================================
   TRANSLATIONS
========================================================= */

const translations = {
  EN: {
    brand: "Public Complaint",
    brandSub: "AI Management System",

    badge: "Citizen Registration",

    heroTitle1: "Create your account and",
    heroTitle2: "make your voice heard.",

    heroDescription:
      "Create a citizen account to report public service issues, track complaint progress and receive important status notifications.",

    easyTitle: "Easy Complaint Reporting",
    easyDescription:
      "Submit public complaints with issue details, location information and supporting images.",

    smartTitle: "Smart Complaint Management",
    smartDescription:
      "AI helps classify complaints and supports efficient processing and routing.",

    trackTitle: "Track Every Update",
    trackDescription:
      "Follow the progress of your complaints throughout the resolution process.",

    register: "Create Account",
    registerDescription:
      "Enter your details below to create your citizen account.",

    fullName: "Full Name",
    fullNamePlaceholder: "Enter your full name",

    email: "Email Address",
    emailPlaceholder: "Enter your email",

    password: "Password",
    passwordPlaceholder: "Create a password",

    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Enter your password again",

    preferredLanguage: "Preferred Language",

    english: "English",
    sinhala: "සිංහල",
    tamil: "தமிழ்",

    termsStart: "I agree to the",
    terms: "Terms and Conditions",
    and: "and",
    privacy: "Privacy Policy",

    createButton: "Create Account",
    creatingButton: "Creating Account...",

    alreadyAccount: "Already have an account?",
    signIn: "Sign in",

    backHome: "Back to Home",

    passwordMismatch: "Passwords do not match.",
    termsRequired:
      "Please accept the Terms and Conditions and Privacy Policy.",
    registrationSuccess:
      "Account created successfully. Redirecting to login...",

    footer:
      "AI-Powered Multilingual Public Complaint Management System",
  },

  "සිං": {
    brand: "මහජන පැමිණිලි",
    brandSub: "AI කළමනාකරණ පද්ධතිය",

    badge: "පුරවැසි ලියාපදිංචිය",

    heroTitle1: "ඔබගේ ගිණුම සාදා",
    heroTitle2: "ඔබගේ හඬ ඉදිරිපත් කරන්න.",

    heroDescription:
      "මහජන සේවා ගැටලු වාර්තා කිරීමට, පැමිණිලි ප්‍රගතිය නිරීක්ෂණය කිරීමට සහ වැදගත් තත්ත්ව දැනුම්දීම් ලබා ගැනීමට පුරවැසි ගිණුමක් සාදන්න.",

    easyTitle: "පහසු පැමිණිලි වාර්තා කිරීම",
    easyDescription:
      "ගැටලුවේ විස්තර, ස්ථාන තොරතුරු සහ අදාළ ඡායාරූප සමඟ මහජන පැමිණිලි ඉදිරිපත් කරන්න.",

    smartTitle: "බුද්ධිමත් පැමිණිලි කළමනාකරණය",
    smartDescription:
      "AI තාක්ෂණය පැමිණිලි වර්ගීකරණයට සහ කාර්යක්ෂම සැකසීම හා යොමු කිරීම සඳහා සහාය වේ.",

    trackTitle: "සෑම යාවත්කාලීනයක්ම නිරීක්ෂණය කරන්න",
    trackDescription:
      "විසඳුම් ක්‍රියාවලිය පුරා ඔබගේ පැමිණිලිවල ප්‍රගතිය නිරීක්ෂණය කරන්න.",

    register: "ගිණුමක් සාදන්න",
    registerDescription:
      "ඔබගේ පුරවැසි ගිණුම නිර්මාණය කිරීමට පහත තොරතුරු ඇතුළත් කරන්න.",

    fullName: "සම්පූර්ණ නම",
    fullNamePlaceholder: "ඔබගේ සම්පූර්ණ නම ඇතුළත් කරන්න",

    email: "ඊමේල් ලිපිනය",
    emailPlaceholder: "ඔබගේ ඊමේල් ලිපිනය ඇතුළත් කරන්න",

    password: "මුරපදය",
    passwordPlaceholder: "මුරපදයක් සාදන්න",

    confirmPassword: "මුරපදය තහවුරු කරන්න",
    confirmPasswordPlaceholder: "මුරපදය නැවත ඇතුළත් කරන්න",

    preferredLanguage: "කැමති භාෂාව",

    english: "English",
    sinhala: "සිංහල",
    tamil: "தமிழ்",

    termsStart: "මම",
    terms: "නියමයන් සහ කොන්දේසි",
    and: "සහ",
    privacy: "පෞද්ගලිකත්ව ප්‍රතිපත්තිය",

    createButton: "ගිණුම සාදන්න",
    creatingButton: "ගිණුම නිර්මාණය කරමින්...",

    alreadyAccount: "දැනටමත් ගිණුමක් තිබේද?",
    signIn: "පිවිසෙන්න",

    backHome: "මුල් පිටුවට",

    passwordMismatch: "මුරපද දෙක සමාන නොවේ.",
    termsRequired:
      "කරුණාකර නියමයන් සහ කොන්දේසි හා පෞද්ගලිකත්ව ප්‍රතිපත්තිය පිළිගන්න.",
    registrationSuccess:
      "ගිණුම සාර්ථකව නිර්මාණය විය. පිවිසුම් පිටුවට යොමු කරමින්...",

    footer:
      "AI බලගැන්වූ බහුභාෂා මහජන පැමිණිලි කළමනාකරණ පද්ධතිය",
  },

  "தமிழ்": {
    brand: "பொது புகார்கள்",
    brandSub: "AI மேலாண்மை அமைப்பு",

    badge: "குடிமக்கள் பதிவு",

    heroTitle1: "உங்கள் கணக்கை உருவாக்கி",
    heroTitle2: "உங்கள் குரலை வெளிப்படுத்துங்கள்.",

    heroDescription:
      "பொது சேவை பிரச்சினைகளைப் புகாரளிக்கவும், புகார் முன்னேற்றத்தைக் கண்காணிக்கவும் மற்றும் முக்கிய நிலை அறிவிப்புகளைப் பெறவும் குடிமக்கள் கணக்கை உருவாக்கவும்.",

    easyTitle: "எளிதான புகார் பதிவு",
    easyDescription:
      "பிரச்சினை விவரங்கள், இருப்பிட தகவல் மற்றும் ஆதாரப் படங்களுடன் பொது புகார்களை சமர்ப்பிக்கவும்.",

    smartTitle: "அறிவார்ந்த புகார் மேலாண்மை",
    smartDescription:
      "AI புகார்களை வகைப்படுத்தவும் திறமையான செயலாக்கம் மற்றும் வழிமாற்றத்திற்கு உதவுகிறது.",

    trackTitle: "ஒவ்வொரு புதுப்பிப்பையும் கண்காணிக்கவும்",
    trackDescription:
      "தீர்வு செயல்முறை முழுவதும் உங்கள் புகார்களின் முன்னேற்றத்தைக் கண்காணிக்கவும்.",

    register: "கணக்கை உருவாக்கவும்",
    registerDescription:
      "உங்கள் குடிமக்கள் கணக்கை உருவாக்க கீழே உள்ள விவரங்களை உள்ளிடவும்.",

    fullName: "முழு பெயர்",
    fullNamePlaceholder: "உங்கள் முழு பெயரை உள்ளிடவும்",

    email: "மின்னஞ்சல் முகவரி",
    emailPlaceholder: "உங்கள் மின்னஞ்சலை உள்ளிடவும்",

    password: "கடவுச்சொல்",
    passwordPlaceholder: "கடவுச்சொல்லை உருவாக்கவும்",

    confirmPassword: "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
    confirmPasswordPlaceholder: "கடவுச்சொல்லை மீண்டும் உள்ளிடவும்",

    preferredLanguage: "விருப்பமான மொழி",

    english: "English",
    sinhala: "සිංහල",
    tamil: "தமிழ்",

    termsStart: "நான்",
    terms: "விதிமுறைகள் மற்றும் நிபந்தனைகள்",
    and: "மற்றும்",
    privacy: "தனியுரிமைக் கொள்கை",

    createButton: "கணக்கை உருவாக்கவும்",
    creatingButton: "கணக்கு உருவாக்கப்படுகிறது...",

    alreadyAccount: "ஏற்கனவே கணக்கு உள்ளதா?",
    signIn: "உள்நுழைக",

    backHome: "முகப்பிற்கு திரும்பு",

    passwordMismatch: "கடவுச்சொற்கள் பொருந்தவில்லை.",
    termsRequired:
      "விதிமுறைகள் மற்றும் தனியுரிமைக் கொள்கையை ஏற்றுக்கொள்ளவும்.",
    registrationSuccess:
      "கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது. உள்நுழைவு பக்கத்திற்கு செல்கிறது...",

    footer:
      "AI ஆதரவு பன்மொழி பொது புகார் மேலாண்மை அமைப்பு",
  },
};

/* =========================================================
   REGISTER PAGE
========================================================= */

function RegisterPage() {
  const navigate = useNavigate();

  const [language, setLanguage] = useState("EN");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    preferredLanguage: "english",
    acceptedTerms: false,
  });

  const t = translations[language];

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  /* =========================================================
     REGISTER SUBMIT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setErrorMessage(
        t.passwordMismatch
      );

      return;
    }

    if (!formData.acceptedTerms) {
      setErrorMessage(
        t.termsRequired
      );

      return;
    }

    try {
      setIsLoading(true);

      const registrationData = {
        fullName:
          formData.fullName.trim(),

        email:
          formData.email
            .trim()
            .toLowerCase(),

        password:
          formData.password,

        preferredLanguage:
          formData.preferredLanguage,
      };

      const response =
        await registerUser(
          registrationData
        );

      console.log(
        "Registration response:",
        response
      );

      setSuccessMessage(
        response?.message ||
          t.registrationSuccess
      );

      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        preferredLanguage:
          "english",
        acceptedTerms: false,
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error(
        "Registration failed:",
        error
      );

      if (
        Array.isArray(
          error?.errors
        ) &&
        error.errors.length > 0
      ) {
        setErrorMessage(
          error.errors
            .map(
              (item) =>
                item.msg ||
                item.message
            )
            .join(" ")
        );
      } else {
        setErrorMessage(
          error?.message ||
            "Registration failed. Please try again."
        );
      }
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

              <UserPlus size={17} />

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

            {/* FEATURE CARDS */}

            <div className="mt-9 grid max-w-lg gap-4">

              {/* EASY COMPLAINT REPORTING */}

              <div className="flex items-start gap-4 rounded-2xl border border-[#D8E5EC] bg-white/90 p-5 shadow-sm backdrop-blur">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF3F8] text-[#1F5F8B]">
                  <UserPlus size={22} />
                </div>

                <div>

                  <h3 className="font-bold text-[#16324A]">
                    {t.easyTitle}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-[#60798C]">
                    {t.easyDescription}
                  </p>

                </div>

              </div>

              {/* AI */}

              <div className="flex items-start gap-4 rounded-2xl border border-[#D8E5EC] bg-white/90 p-5 shadow-sm backdrop-blur">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F6F4] text-[#1B8A8F]">
                  <BrainCircuit
                    size={22}
                  />
                </div>

                <div>

                  <h3 className="font-bold text-[#16324A]">
                    {t.smartTitle}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-[#60798C]">
                    {t.smartDescription}
                  </p>

                </div>

              </div>

              {/* TRACKING */}

              <div className="flex items-start gap-4 rounded-2xl border border-[#D8E5EC] bg-white/90 p-5 shadow-sm backdrop-blur">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2
                    size={22}
                  />
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
              REGISTER FORM
          ================================================= */}

          <div className="mx-auto w-full max-w-lg">

            <Link
              to="/"
              className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#60798C] transition hover:text-[#1B8A8F] lg:hidden"
            >

              <ArrowLeft size={17} />

              {t.backHome}

            </Link>

            <div className="rounded-[28px] border border-[#D8E5EC] bg-white p-7 shadow-xl shadow-[#123B5D]/10 sm:p-9">

              {/* FORM HEADER */}

              <div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F6F4] text-[#1B8A8F]">
                  <UserPlus size={24} />
                </div>

                <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#16324A]">
                  {t.register}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#60798C]">
                  {t.registerDescription}
                </p>

              </div>

              {/* =================================================
                  ALERTS
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
                className="mt-7 space-y-5"
                onSubmit={handleSubmit}
              >

                {/* FULL NAME */}

                <div>

                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-semibold text-[#425D70]"
                  >
                    {t.fullName}
                  </label>

                  <div className="relative">

                    <User
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9EAC]"
                    />

                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={
                        formData.fullName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder={
                        t.fullNamePlaceholder
                      }
                      autoComplete="name"
                      required
                      disabled={isLoading}
                      className="w-full rounded-xl border border-[#C8D8E2] bg-white py-3.5 pl-11 pr-4 text-sm text-[#16324A] outline-none transition placeholder:text-[#8A9EAC] focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:cursor-not-allowed disabled:bg-[#F1F5F7]"
                    />

                  </div>

                </div>

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
                      placeholder={
                        t.emailPlaceholder
                      }
                      autoComplete="email"
                      required
                      disabled={isLoading}
                      className="w-full rounded-xl border border-[#C8D8E2] bg-white py-3.5 pl-11 pr-4 text-sm text-[#16324A] outline-none transition placeholder:text-[#8A9EAC] focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:cursor-not-allowed disabled:bg-[#F1F5F7]"
                    />

                  </div>

                </div>

                {/* PASSWORDS */}

                <div className="grid gap-5 sm:grid-cols-2">

                  {/* PASSWORD */}

                  <div>

                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-semibold text-[#425D70]"
                    >
                      {t.password}
                    </label>

                    <div className="relative">

                      <LockKeyhole
                        size={18}
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
                          t.passwordPlaceholder
                        }
                        autoComplete="new-password"
                        required
                        disabled={isLoading}
                        className="w-full rounded-xl border border-[#C8D8E2] bg-white py-3.5 pl-11 pr-11 text-sm text-[#16324A] outline-none transition placeholder:text-[#8A9EAC] focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:cursor-not-allowed disabled:bg-[#F1F5F7]"
                      />

                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A9EAC] transition hover:text-[#425D70]"
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
                        size={18}
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
                        required
                        disabled={isLoading}
                        className="w-full rounded-xl border border-[#C8D8E2] bg-white py-3.5 pl-11 pr-11 text-sm text-[#16324A] outline-none transition placeholder:text-[#8A9EAC] focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:cursor-not-allowed disabled:bg-[#F1F5F7]"
                      />

                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A9EAC] transition hover:text-[#425D70]"
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

                </div>

                {/* PREFERRED LANGUAGE */}

                <div>

                  <label
                    htmlFor="preferredLanguage"
                    className="mb-2 block text-sm font-semibold text-[#425D70]"
                  >
                    {t.preferredLanguage}
                  </label>

                  <div className="relative">

                    <Languages
                      size={19}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9EAC]"
                    />

                    <select
                      id="preferredLanguage"
                      name="preferredLanguage"
                      value={
                        formData.preferredLanguage
                      }
                      onChange={
                        handleChange
                      }
                      disabled={isLoading}
                      className="w-full appearance-none rounded-xl border border-[#C8D8E2] bg-white py-3.5 pl-11 pr-4 text-sm text-[#16324A] outline-none transition focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:cursor-not-allowed disabled:bg-[#F1F5F7]"
                    >

                      <option value="english">
                        {t.english}
                      </option>

                      <option value="sinhala">
                        {t.sinhala}
                      </option>

                      <option value="tamil">
                        {t.tamil}
                      </option>

                    </select>

                  </div>

                </div>

                {/* TERMS */}

                <label className="flex cursor-pointer items-start gap-3">

                  <input
                    name="acceptedTerms"
                    type="checkbox"
                    checked={
                      formData.acceptedTerms
                    }
                    onChange={
                      handleChange
                    }
                    disabled={isLoading}
                    className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-[#C8D8E2] accent-[#1B8A8F]"
                  />

                  <span className="text-sm leading-6 text-[#60798C]">

                    {t.termsStart}{" "}

                    <button
                      type="button"
                      className="font-semibold text-[#1B8A8F] transition hover:text-[#176D72]"
                    >
                      {t.terms}
                    </button>{" "}

                    {t.and}{" "}

                    <button
                      type="button"
                      className="font-semibold text-[#1B8A8F] transition hover:text-[#176D72]"
                    >
                      {t.privacy}
                    </button>

                  </span>

                </label>

                {/* CREATE ACCOUNT */}

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
                    ? t.creatingButton
                    : t.createButton}

                </button>

              </form>

              {/* LOGIN LINK */}

              <div className="mt-7 border-t border-[#D8E5EC] pt-6 text-center">

                <p className="text-sm text-[#60798C]">

                  {t.alreadyAccount}{" "}

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

export default RegisterPage;