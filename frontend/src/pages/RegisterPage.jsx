import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  BrainCircuit,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe2,
  Languages,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Send,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";

import {
  registerUser,
  sendRegistrationOtp,
  verifyRegistrationOtp,
} from "../api/authApi";

/* =========================================================
   CONSTANTS
========================================================= */

const OTP_LENGTH = 6;
const OTP_RESEND_SECONDS = 60;

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
      "Create a verified citizen account to report public service issues, track complaint progress and receive important status notifications.",

    easyTitle: "Verified Citizen Registration",
    easyDescription:
      "Your email address is securely verified using a one-time verification code before account creation.",

    smartTitle: "Smart Complaint Management",
    smartDescription:
      "AI helps classify complaints and supports efficient processing and routing.",

    trackTitle: "One NIC, One Account",
    trackDescription:
      "Each citizen NIC can only be associated with one citizen account to improve account integrity.",

    register: "Create Account",
    registerDescription:
      "Enter your details, verify your email address and create your citizen account.",

    fullName: "Full Name",
    fullNamePlaceholder: "Enter your full name",

    nic: "NIC Number",
    nicPlaceholder: "Example: 200012345678 or 991234567V",
    nicHint:
      "Enter a valid Sri Lankan old or new NIC number.",

    email: "Email Address",
    emailPlaceholder: "Enter your email",

    sendOtp: "Send OTP",
    sendingOtp: "Sending...",
    resendOtp: "Resend OTP",
    resendIn: "Resend in",

    otp: "Verification OTP",
    otpPlaceholder: "Enter 6-digit OTP",

    verifyOtp: "Verify OTP",
    verifyingOtp: "Verifying...",

    emailVerified: "Email Verified",
    verified: "Verified",

    otpSent:
      "Verification OTP has been sent to your email address.",

    password: "Password",
    passwordPlaceholder: "Create a password",

    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Enter your password again",

    passwordHint:
      "Password must contain at least 8 characters.",

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

    verifyEmailFirst:
      "Verify your email to enable account creation.",

    alreadyAccount: "Already have an account?",
    signIn: "Sign in",

    backHome: "Back to Home",

    fullNameRequired:
      "Please enter your full name.",

    nicRequired:
      "Please enter your NIC number.",

    invalidNic:
      "Please enter a valid Sri Lankan NIC number.",

    emailRequired:
      "Please enter your email address.",

    invalidEmail:
      "Please enter a valid email address.",

    otpRequired:
      "Please enter the 6-digit OTP.",

    passwordRequired:
      "Please enter a password.",

    passwordTooShort:
      "Password must contain at least 8 characters.",

    passwordMismatch:
      "Passwords do not match.",

    termsRequired:
      "Please accept the Terms and Conditions and Privacy Policy.",

    emailNotVerified:
      "Please verify your email address before creating your account.",

    emailChanged:
      "Email address changed. Please verify the new email address.",

    otpSendFailed:
      "Unable to send verification OTP.",

    otpVerifyFailed:
      "Unable to verify OTP.",

    registrationFailed:
      "Registration failed. Please try again.",

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
      "මහජන සේවා ගැටලු වාර්තා කිරීමට, පැමිණිලි ප්‍රගතිය නිරීක්ෂණය කිරීමට සහ වැදගත් තත්ත්ව දැනුම්දීම් ලබා ගැනීමට තහවුරු කළ පුරවැසි ගිණුමක් සාදන්න.",

    easyTitle: "තහවුරු කළ පුරවැසි ලියාපදිංචිය",
    easyDescription:
      "ගිණුම නිර්මාණය කිරීමට පෙර එක් වරක් භාවිතා කරන OTP කේතයක් මගින් ඔබගේ ඊමේල් ලිපිනය ආරක්ෂිතව තහවුරු කරයි.",

    smartTitle: "බුද්ධිමත් පැමිණිලි කළමනාකරණය",
    smartDescription:
      "AI තාක්ෂණය පැමිණිලි වර්ගීකරණයට සහ කාර්යක්ෂම සැකසීම හා යොමු කිරීම සඳහා සහාය වේ.",

    trackTitle: "එක් NIC එකකට එක් ගිණුමක්",
    trackDescription:
      "ගිණුම් ආරක්ෂාව වැඩි කිරීම සඳහා එක් පුරවැසි NIC අංකයකින් එක් ගිණුමක් පමණක් සාදාගත හැක.",

    register: "ගිණුමක් සාදන්න",
    registerDescription:
      "ඔබගේ තොරතුරු ඇතුළත් කර, ඊමේල් ලිපිනය තහවුරු කර පුරවැසි ගිණුම සාදන්න.",

    fullName: "සම්පූර්ණ නම",
    fullNamePlaceholder:
      "ඔබගේ සම්පූර්ණ නම ඇතුළත් කරන්න",

    nic: "ජාතික හැඳුනුම්පත් අංකය",
    nicPlaceholder:
      "උදා: 200012345678 හෝ 991234567V",
    nicHint:
      "වලංගු පැරණි හෝ නව ශ්‍රී ලාංකික NIC අංකයක් ඇතුළත් කරන්න.",

    email: "ඊමේල් ලිපිනය",
    emailPlaceholder:
      "ඔබගේ ඊමේල් ලිපිනය ඇතුළත් කරන්න",

    sendOtp: "OTP යවන්න",
    sendingOtp: "යවමින්...",
    resendOtp: "OTP නැවත යවන්න",
    resendIn: "නැවත යවන්න",

    otp: "තහවුරු කිරීමේ OTP",
    otpPlaceholder:
      "ඉලක්කම් 6ක OTP එක ඇතුළත් කරන්න",

    verifyOtp: "OTP තහවුරු කරන්න",
    verifyingOtp: "තහවුරු කරමින්...",

    emailVerified: "ඊමේල් ලිපිනය තහවුරු කර ඇත",
    verified: "තහවුරු කර ඇත",

    otpSent:
      "තහවුරු කිරීමේ OTP එක ඔබගේ ඊමේල් ලිපිනයට යවා ඇත.",

    password: "මුරපදය",
    passwordPlaceholder: "මුරපදයක් සාදන්න",

    confirmPassword: "මුරපදය තහවුරු කරන්න",
    confirmPasswordPlaceholder:
      "මුරපදය නැවත ඇතුළත් කරන්න",

    passwordHint:
      "මුරපදය අවම වශයෙන් අක්ෂර 8ක් විය යුතුය.",

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

    verifyEmailFirst:
      "ගිණුම සෑදීම සක්‍රීය කිරීමට ඊමේල් ලිපිනය තහවුරු කරන්න.",

    alreadyAccount: "දැනටමත් ගිණුමක් තිබේද?",
    signIn: "පිවිසෙන්න",

    backHome: "මුල් පිටුවට",

    fullNameRequired:
      "කරුණාකර සම්පූර්ණ නම ඇතුළත් කරන්න.",

    nicRequired:
      "කරුණාකර NIC අංකය ඇතුළත් කරන්න.",

    invalidNic:
      "කරුණාකර වලංගු ශ්‍රී ලාංකික NIC අංකයක් ඇතුළත් කරන්න.",

    emailRequired:
      "කරුණාකර ඊමේල් ලිපිනය ඇතුළත් කරන්න.",

    invalidEmail:
      "කරුණාකර වලංගු ඊමේල් ලිපිනයක් ඇතුළත් කරන්න.",

    otpRequired:
      "කරුණාකර ඉලක්කම් 6ක OTP එක ඇතුළත් කරන්න.",

    passwordRequired:
      "කරුණාකර මුරපදයක් ඇතුළත් කරන්න.",

    passwordTooShort:
      "මුරපදය අවම වශයෙන් අක්ෂර 8ක් විය යුතුය.",

    passwordMismatch:
      "මුරපද දෙක සමාන නොවේ.",

    termsRequired:
      "කරුණාකර නියමයන් සහ කොන්දේසි හා පෞද්ගලිකත්ව ප්‍රතිපත්තිය පිළිගන්න.",

    emailNotVerified:
      "ගිණුම සෑදීමට පෙර ඔබගේ ඊමේල් ලිපිනය තහවුරු කරන්න.",

    emailChanged:
      "ඊමේල් ලිපිනය වෙනස් කර ඇත. නව ඊමේල් ලිපිනය නැවත තහවුරු කරන්න.",

    otpSendFailed:
      "OTP එක යැවීමට නොහැකි විය.",

    otpVerifyFailed:
      "OTP එක තහවුරු කිරීමට නොහැකි විය.",

    registrationFailed:
      "ලියාපදිංචිය අසාර්ථකයි. නැවත උත්සාහ කරන්න.",

    registrationSuccess:
      "ගිණුම සාර්ථකව නිර්මාණය විය. පිවිසුම් පිටුවට යොමු කරමින්...",

    footer:
      "AI බලගැන්වූ බහුභාෂා මහජන පැමිණිලි කළමනාකරණ පද්ධතිය",
  },

  தமிழ்: {
    brand: "பொது புகார்கள்",
    brandSub: "AI மேலாண்மை அமைப்பு",

    badge: "குடிமக்கள் பதிவு",

    heroTitle1: "உங்கள் கணக்கை உருவாக்கி",
    heroTitle2: "உங்கள் குரலை வெளிப்படுத்துங்கள்.",

    heroDescription:
      "பொது சேவை பிரச்சினைகளைப் புகாரளிக்கவும், புகார் முன்னேற்றத்தைக் கண்காணிக்கவும் மற்றும் முக்கிய நிலை அறிவிப்புகளைப் பெறவும் சரிபார்க்கப்பட்ட குடிமக்கள் கணக்கை உருவாக்கவும்.",

    easyTitle: "சரிபார்க்கப்பட்ட குடிமக்கள் பதிவு",
    easyDescription:
      "கணக்கு உருவாக்குவதற்கு முன் ஒருமுறை பயன்படுத்தப்படும் OTP மூலம் உங்கள் மின்னஞ்சல் முகவரி பாதுகாப்பாக சரிபார்க்கப்படும்.",

    smartTitle: "அறிவார்ந்த புகார் மேலாண்மை",
    smartDescription:
      "AI புகார்களை வகைப்படுத்தவும் திறமையான செயலாக்கம் மற்றும் வழிமாற்றத்திற்கு உதவுகிறது.",

    trackTitle: "ஒரு NIC - ஒரு கணக்கு",
    trackDescription:
      "கணக்கு நம்பகத்தன்மையை மேம்படுத்த ஒவ்வொரு குடிமக்கள் NIC எண்ணுக்கும் ஒரு கணக்கு மட்டுமே அனுமதிக்கப்படுகிறது.",

    register: "கணக்கை உருவாக்கவும்",
    registerDescription:
      "உங்கள் விவரங்களை உள்ளிட்டு, மின்னஞ்சலை சரிபார்த்து குடிமக்கள் கணக்கை உருவாக்கவும்.",

    fullName: "முழு பெயர்",
    fullNamePlaceholder:
      "உங்கள் முழு பெயரை உள்ளிடவும்",

    nic: "NIC எண்",
    nicPlaceholder:
      "உதாரணம்: 200012345678 அல்லது 991234567V",
    nicHint:
      "செல்லுபடியாகும் பழைய அல்லது புதிய இலங்கை NIC எண்ணை உள்ளிடவும்.",

    email: "மின்னஞ்சல் முகவரி",
    emailPlaceholder:
      "உங்கள் மின்னஞ்சலை உள்ளிடவும்",

    sendOtp: "OTP அனுப்பவும்",
    sendingOtp: "அனுப்பப்படுகிறது...",
    resendOtp: "OTP மீண்டும் அனுப்பவும்",
    resendIn: "மீண்டும் அனுப்ப",

    otp: "சரிபார்ப்பு OTP",
    otpPlaceholder:
      "6 இலக்க OTP ஐ உள்ளிடவும்",

    verifyOtp: "OTP சரிபார்க்கவும்",
    verifyingOtp: "சரிபார்க்கப்படுகிறது...",

    emailVerified:
      "மின்னஞ்சல் சரிபார்க்கப்பட்டது",
    verified: "சரிபார்க்கப்பட்டது",

    otpSent:
      "சரிபார்ப்பு OTP உங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்டது.",

    password: "கடவுச்சொல்",
    passwordPlaceholder:
      "கடவுச்சொல்லை உருவாக்கவும்",

    confirmPassword:
      "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
    confirmPasswordPlaceholder:
      "கடவுச்சொல்லை மீண்டும் உள்ளிடவும்",

    passwordHint:
      "கடவுச்சொல் குறைந்தது 8 எழுத்துகள் கொண்டிருக்க வேண்டும்.",

    preferredLanguage: "விருப்பமான மொழி",

    english: "English",
    sinhala: "සිංහල",
    tamil: "தமிழ்",

    termsStart: "நான்",
    terms: "விதிமுறைகள் மற்றும் நிபந்தனைகள்",
    and: "மற்றும்",
    privacy: "தனியுரிமைக் கொள்கை",

    createButton: "கணக்கை உருவாக்கவும்",
    creatingButton:
      "கணக்கு உருவாக்கப்படுகிறது...",

    verifyEmailFirst:
      "கணக்கு உருவாக்க மின்னஞ்சலை சரிபார்க்கவும்.",

    alreadyAccount:
      "ஏற்கனவே கணக்கு உள்ளதா?",
    signIn: "உள்நுழைக",

    backHome: "முகப்பிற்கு திரும்பு",

    fullNameRequired:
      "முழு பெயரை உள்ளிடவும்.",

    nicRequired:
      "NIC எண்ணை உள்ளிடவும்.",

    invalidNic:
      "செல்லுபடியாகும் இலங்கை NIC எண்ணை உள்ளிடவும்.",

    emailRequired:
      "மின்னஞ்சல் முகவரியை உள்ளிடவும்.",

    invalidEmail:
      "செல்லுபடியாகும் மின்னஞ்சல் முகவரியை உள்ளிடவும்.",

    otpRequired:
      "6 இலக்க OTP ஐ உள்ளிடவும்.",

    passwordRequired:
      "கடவுச்சொல்லை உள்ளிடவும்.",

    passwordTooShort:
      "கடவுச்சொல் குறைந்தது 8 எழுத்துகள் கொண்டிருக்க வேண்டும்.",

    passwordMismatch:
      "கடவுச்சொற்கள் பொருந்தவில்லை.",

    termsRequired:
      "விதிமுறைகள் மற்றும் தனியுரிமைக் கொள்கையை ஏற்றுக்கொள்ளவும்.",

    emailNotVerified:
      "கணக்கை உருவாக்குவதற்கு முன் உங்கள் மின்னஞ்சலை சரிபார்க்கவும்.",

    emailChanged:
      "மின்னஞ்சல் முகவரி மாற்றப்பட்டது. புதிய மின்னஞ்சலை மீண்டும் சரிபார்க்கவும்.",

    otpSendFailed:
      "சரிபார்ப்பு OTP ஐ அனுப்ப முடியவில்லை.",

    otpVerifyFailed:
      "OTP ஐ சரிபார்க்க முடியவில்லை.",

    registrationFailed:
      "பதிவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.",

    registrationSuccess:
      "கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது. உள்நுழைவு பக்கத்திற்கு செல்கிறது...",

    footer:
      "AI ஆதரவு பன்மொழி பொது புகார் மேலாண்மை அமைப்பு",
  },
};

/* =========================================================
   VALIDATION HELPERS
========================================================= */

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidSriLankanNic = (nic) => {
  const cleanedNic = nic
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();

  /*
   * Old NIC:
   * 9 digits + V/X
   *
   * New NIC:
   * 12 digits
   */
  const oldNicPattern = /^\d{9}[VX]$/;
  const newNicPattern = /^\d{12}$/;

  return (
    oldNicPattern.test(cleanedNic) ||
    newNicPattern.test(cleanedNic)
  );
};

/* =========================================================
   REGISTER PAGE
========================================================= */

function RegisterPage() {
  const navigate = useNavigate();

  const [language, setLanguage] =
    useState("EN");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [
    isSendingOtp,
    setIsSendingOtp,
  ] = useState(false);

  const [
    isVerifyingOtp,
    setIsVerifyingOtp,
  ] = useState(false);

  const [otpSent, setOtpSent] =
    useState(false);

  const [otp, setOtp] =
    useState("");

  const [
    isEmailVerified,
    setIsEmailVerified,
  ] = useState(false);

  const [
    verifiedEmail,
    setVerifiedEmail,
  ] = useState("");

  const [
    resendSeconds,
    setResendSeconds,
  ] = useState(0);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    otpMessage,
    setOtpMessage,
  ] = useState("");

  const [formData, setFormData] =
    useState({
      fullName: "",
      nic: "",
      email: "",
      password: "",
      confirmPassword: "",
      preferredLanguage: "english",
      acceptedTerms: false,
    });

  const t = translations[language];

  /* =========================================================
     NORMALISED VALUES
  ========================================================= */

  const normalizedEmail = useMemo(
    () =>
      formData.email
        .trim()
        .toLowerCase(),
    [formData.email]
  );

  const normalizedNic = useMemo(
    () =>
      formData.nic
        .trim()
        .replace(/\s+/g, "")
        .toUpperCase(),
    [formData.nic]
  );

  /* =========================================================
     OTP RESEND TIMER
  ========================================================= */

  useEffect(() => {
    if (resendSeconds <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setResendSeconds((previous) =>
        previous > 0
          ? previous - 1
          : 0
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [resendSeconds]);

  /* =========================================================
     ACCOUNT BUTTON STATUS
  ========================================================= */

  const canCreateAccount =
    isEmailVerified &&
    verifiedEmail === normalizedEmail &&
    formData.fullName.trim().length >= 2 &&
    isValidSriLankanNic(normalizedNic) &&
    formData.password.length >= 8 &&
    formData.confirmPassword.length >= 8 &&
    formData.password ===
      formData.confirmPassword &&
    formData.acceptedTerms &&
    !isLoading;

  /* =========================================================
     CLEAR ALERTS
  ========================================================= */

  const clearAlerts = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  /* =========================================================
     RESET EMAIL VERIFICATION
  ========================================================= */

  const resetEmailVerification = (
    message = ""
  ) => {
    setIsEmailVerified(false);
    setVerifiedEmail("");
    setOtpSent(false);
    setOtp("");
    setOtpMessage(message);
    setResendSeconds(0);
  };

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    const newValue =
      type === "checkbox"
        ? checked
        : value;

    setFormData((previous) => ({
      ...previous,

      [name]:
        name === "nic"
          ? String(newValue).toUpperCase()
          : newValue,
    }));

    /*
     * Changing the email after verification
     * invalidates the previous verification.
     */
    if (name === "email") {
      const newEmail = String(value)
        .trim()
        .toLowerCase();

      if (
        isEmailVerified &&
        newEmail !== verifiedEmail
      ) {
        resetEmailVerification(
          t.emailChanged
        );
      }
    }

    clearAlerts();
  };

  /* =========================================================
     SEND REGISTRATION OTP
  ========================================================= */

  const handleSendOtp = async () => {
    clearAlerts();
    setOtpMessage("");

    if (!normalizedEmail) {
      setErrorMessage(
        t.emailRequired
      );
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setErrorMessage(
        t.invalidEmail
      );
      return;
    }

    if (resendSeconds > 0) {
      return;
    }

    try {
      setIsSendingOtp(true);

      const response =
        await sendRegistrationOtp(
          normalizedEmail
        );

      setOtpSent(true);
      setIsEmailVerified(false);
      setVerifiedEmail("");
      setOtp("");

      /*
       * Backend currently returns
       * resendAfterSeconds: 60.
       *
       * If unavailable, default to 60 seconds.
       */
      setResendSeconds(
        Number(
          response?.resendAfterSeconds
        ) || OTP_RESEND_SECONDS
      );

      setOtpMessage(
        response?.message ||
          t.otpSent
      );
    } catch (error) {
      console.error(
        "Send registration OTP failed:",
        error
      );

      setErrorMessage(
        error?.message ||
          t.otpSendFailed
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  /* =========================================================
     VERIFY REGISTRATION OTP
  ========================================================= */

  const handleVerifyOtp = async () => {
    clearAlerts();

    if (!normalizedEmail) {
      setErrorMessage(
        t.emailRequired
      );
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setErrorMessage(
        t.invalidEmail
      );
      return;
    }

    if (
      !new RegExp(
        `^\\d{${OTP_LENGTH}}$`
      ).test(otp.trim())
    ) {
      setErrorMessage(
        t.otpRequired
      );
      return;
    }

    try {
      setIsVerifyingOtp(true);

      const response =
        await verifyRegistrationOtp(
          normalizedEmail,
          otp.trim()
        );

      if (
        response?.verified === true ||
        response?.success === true
      ) {
        setIsEmailVerified(true);
        setVerifiedEmail(
          normalizedEmail
        );

        setOtpMessage(
          response?.message ||
            t.emailVerified
        );
      } else {
        setErrorMessage(
          response?.message ||
            t.otpVerifyFailed
        );
      }
    } catch (error) {
      console.error(
        "Verify registration OTP failed:",
        error
      );

      setIsEmailVerified(false);
      setVerifiedEmail("");

      setErrorMessage(
        error?.message ||
          t.otpVerifyFailed
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  /* =========================================================
     REGISTER USER
  ========================================================= */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    clearAlerts();

    /* ---------------------------------------------------------
       FULL NAME
    --------------------------------------------------------- */

    if (
      formData.fullName
        .trim()
        .length < 2
    ) {
      setErrorMessage(
        t.fullNameRequired
      );
      return;
    }

    /* ---------------------------------------------------------
       NIC
    --------------------------------------------------------- */

    if (!normalizedNic) {
      setErrorMessage(
        t.nicRequired
      );
      return;
    }

    if (
      !isValidSriLankanNic(
        normalizedNic
      )
    ) {
      setErrorMessage(
        t.invalidNic
      );
      return;
    }

    /* ---------------------------------------------------------
       EMAIL
    --------------------------------------------------------- */

    if (!normalizedEmail) {
      setErrorMessage(
        t.emailRequired
      );
      return;
    }

    if (
      !isValidEmail(
        normalizedEmail
      )
    ) {
      setErrorMessage(
        t.invalidEmail
      );
      return;
    }

    /* ---------------------------------------------------------
       EMAIL VERIFICATION
    --------------------------------------------------------- */

    if (
      !isEmailVerified ||
      verifiedEmail !==
        normalizedEmail
    ) {
      setErrorMessage(
        t.emailNotVerified
      );
      return;
    }

    /* ---------------------------------------------------------
       PASSWORD
    --------------------------------------------------------- */

    if (!formData.password) {
      setErrorMessage(
        t.passwordRequired
      );
      return;
    }

    if (
      formData.password.length < 8
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

    /* ---------------------------------------------------------
       TERMS
    --------------------------------------------------------- */

    if (
      !formData.acceptedTerms
    ) {
      setErrorMessage(
        t.termsRequired
      );
      return;
    }

    /* ---------------------------------------------------------
       CREATE ACCOUNT
    --------------------------------------------------------- */

    try {
      setIsLoading(true);

      const registrationData = {
        fullName:
          formData.fullName.trim(),

        nic: normalizedNic,

        email:
          normalizedEmail,

        password:
          formData.password,

        preferredLanguage:
          formData.preferredLanguage,
      };

      const response =
        await registerUser(
          registrationData
        );

      setSuccessMessage(
        response?.message ||
          t.registrationSuccess
      );

      /*
       * Clear form after successful registration.
       */
      setFormData({
        fullName: "",
        nic: "",
        email: "",
        password: "",
        confirmPassword: "",
        preferredLanguage:
          "english",
        acceptedTerms: false,
      });

      setOtp("");
      setOtpSent(false);
      setIsEmailVerified(false);
      setVerifiedEmail("");
      setOtpMessage("");
      setResendSeconds(0);

      /*
       * Redirect citizen to login.
       */
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
        const validationMessages =
          error.errors
            .map(
              (item) =>
                item?.msg ||
                item?.message
            )
            .filter(Boolean)
            .join(" ");

        setErrorMessage(
          validationMessages ||
            t.registrationFailed
        );

        return;
      }

      setErrorMessage(
        error?.message ||
          t.registrationFailed
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

          {/* LANGUAGE SWITCHER */}

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

        <div className="relative mx-auto grid min-h-[calc(100vh-78px)] max-w-7xl items-start gap-16 px-5 py-12 lg:grid-cols-2 lg:px-8">

          {/* =================================================
              LEFT INFORMATION
          ================================================= */}

          <div className="hidden pt-12 lg:block">

            <div className="inline-flex items-center gap-2 rounded-full border border-[#B9DDDA] bg-[#E8F6F4] px-4 py-2 text-sm font-semibold text-[#1B8A8F]">

              <UserPlus
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

            <div className="mt-9 grid max-w-lg gap-4">

              <FeatureCard
                icon={
                  <ShieldCheck
                    size={22}
                  />
                }
                iconClass="bg-[#EAF3F8] text-[#1F5F8B]"
                title={
                  t.easyTitle
                }
                description={
                  t.easyDescription
                }
              />

              <FeatureCard
                icon={
                  <BrainCircuit
                    size={22}
                  />
                }
                iconClass="bg-[#E8F6F4] text-[#1B8A8F]"
                title={
                  t.smartTitle
                }
                description={
                  t.smartDescription
                }
              />

              <FeatureCard
                icon={
                  <BadgeCheck
                    size={22}
                  />
                }
                iconClass="bg-emerald-50 text-emerald-600"
                title={
                  t.trackTitle
                }
                description={
                  t.trackDescription
                }
              />

            </div>

          </div>

          {/* =================================================
              REGISTRATION FORM
          ================================================= */}

          <div className="mx-auto w-full max-w-xl">

            <Link
              to="/"
              className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#60798C] transition hover:text-[#1B8A8F] lg:hidden"
            >
              <ArrowLeft
                size={17}
              />

              {t.backHome}
            </Link>

            <div className="rounded-[28px] border border-[#D8E5EC] bg-white p-7 shadow-xl shadow-[#123B5D]/10 sm:p-9">

              {/* FORM HEADER */}

              <div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F6F4] text-[#1B8A8F]">
                  <UserPlus
                    size={24}
                  />
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
                onSubmit={
                  handleSubmit
                }
              >

                {/* =================================================
                    FULL NAME + NIC
                ================================================= */}

                <div className="grid gap-5 sm:grid-cols-2">

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
                        minLength={2}
                        maxLength={100}
                        disabled={
                          isLoading
                        }
                        className="w-full rounded-xl border border-[#C8D8E2] bg-white py-3.5 pl-11 pr-4 text-sm text-[#16324A] outline-none transition placeholder:text-[#8A9EAC] focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:bg-[#F1F5F7]"
                      />

                    </div>

                  </div>

                  {/* NIC */}

                  <div>

                    <label
                      htmlFor="nic"
                      className="mb-2 block text-sm font-semibold text-[#425D70]"
                    >
                      {t.nic}
                    </label>

                    <div className="relative">

                      <BadgeCheck
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9EAC]"
                      />

                      <input
                        id="nic"
                        name="nic"
                        type="text"
                        value={
                          formData.nic
                        }
                        onChange={
                          handleChange
                        }
                        placeholder={
                          t.nicPlaceholder
                        }
                        autoComplete="off"
                        required
                        maxLength={12}
                        disabled={
                          isLoading
                        }
                        className="w-full rounded-xl border border-[#C8D8E2] bg-white py-3.5 pl-11 pr-4 text-sm uppercase text-[#16324A] outline-none transition placeholder:normal-case placeholder:text-[#8A9EAC] focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:bg-[#F1F5F7]"
                      />

                    </div>

                    <p className="mt-1.5 text-xs leading-5 text-[#8A9EAC]">
                      {t.nicHint}
                    </p>

                  </div>

                </div>

                {/* =================================================
                    EMAIL VERIFICATION
                ================================================= */}

                <div className="rounded-2xl border border-[#D8E5EC] bg-[#F8FBFC] p-4 sm:p-5">

                  <div className="flex items-center justify-between gap-3">

                    <div>

                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-[#425D70]"
                      >
                        {t.email}
                      </label>

                      {isEmailVerified && (
                        <div className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">

                          <CheckCircle2
                            size={14}
                          />

                          {t.emailVerified}

                        </div>
                      )}

                    </div>

                    {isEmailVerified && (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                        ✓ {t.verified}
                      </span>
                    )}

                  </div>

                  {/* EMAIL + SEND OTP */}

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">

                    <div className="relative flex-1">

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
                        disabled={
                          isLoading
                        }
                        className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-4 text-sm text-[#16324A] outline-none transition placeholder:text-[#8A9EAC] focus:ring-4 disabled:bg-[#F1F5F7] ${
                          isEmailVerified
                            ? "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-50"
                            : "border-[#C8D8E2] focus:border-[#1B8A8F] focus:ring-[#E8F6F4]"
                        }`}
                      />

                    </div>

                    <button
                      type="button"
                      onClick={
                        handleSendOtp
                      }
                      disabled={
                        isSendingOtp ||
                        isLoading ||
                        !normalizedEmail ||
                        resendSeconds > 0
                      }
                      className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl border border-[#B9DDDA] bg-[#E8F6F4] px-4 py-3.5 text-sm font-bold text-[#176D72] transition hover:bg-[#D9F0EC] disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      {isSendingOtp ? (
                        <>
                          <LoaderCircle
                            size={17}
                            className="animate-spin"
                          />

                          {t.sendingOtp}
                        </>
                      ) : resendSeconds > 0 ? (
                        <>
                          <ShieldCheck
                            size={17}
                          />

                          {t.resendIn}{" "}
                          {resendSeconds}s
                        </>
                      ) : (
                        <>
                          <Send
                            size={17}
                          />

                          {otpSent
                            ? t.resendOtp
                            : t.sendOtp}
                        </>
                      )}

                    </button>

                  </div>

                  {/* OTP MESSAGE */}

                  {otpMessage && (
                    <p
                      className={`mt-3 text-xs font-semibold leading-5 ${
                        isEmailVerified
                          ? "text-emerald-600"
                          : "text-[#1B8A8F]"
                      }`}
                    >
                      {otpMessage}
                    </p>
                  )}

                  {/* =================================================
                      OTP INPUT
                  ================================================= */}

                  {otpSent &&
                    !isEmailVerified && (
                      <div className="mt-4 border-t border-[#D8E5EC] pt-4">

                        <label
                          htmlFor="otp"
                          className="mb-2 block text-sm font-semibold text-[#425D70]"
                        >
                          {t.otp}
                        </label>

                        <div className="flex flex-col gap-3 sm:flex-row">

                          <div className="relative flex-1">

                            <ShieldCheck
                              size={19}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9EAC]"
                            />

                            <input
                              id="otp"
                              type="text"
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              maxLength={
                                OTP_LENGTH
                              }
                              value={otp}
                              onChange={(
                                event
                              ) => {
                                const digits =
                                  event.target.value
                                    .replace(
                                      /\D/g,
                                      ""
                                    )
                                    .slice(
                                      0,
                                      OTP_LENGTH
                                    );

                                setOtp(
                                  digits
                                );

                                if (
                                  errorMessage
                                ) {
                                  setErrorMessage(
                                    ""
                                  );
                                }
                              }}
                              placeholder={
                                t.otpPlaceholder
                              }
                              disabled={
                                isVerifyingOtp ||
                                isLoading
                              }
                              className="w-full rounded-xl border border-[#C8D8E2] bg-white py-3.5 pl-11 pr-4 text-sm font-semibold tracking-[0.2em] text-[#16324A] outline-none transition placeholder:tracking-normal placeholder:text-[#8A9EAC] focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4]"
                            />

                          </div>

                          <button
                            type="button"
                            onClick={
                              handleVerifyOtp
                            }
                            disabled={
                              isVerifyingOtp ||
                              isLoading ||
                              otp.length !==
                                OTP_LENGTH
                            }
                            className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-[#1B8A8F] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#176D72] disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            {isVerifyingOtp ? (
                              <>
                                <LoaderCircle
                                  size={17}
                                  className="animate-spin"
                                />

                                {t.verifyingOtp}
                              </>
                            ) : (
                              <>
                                <CheckCircle2
                                  size={17}
                                />

                                {t.verifyOtp}
                              </>
                            )}

                          </button>

                        </div>

                      </div>
                    )}

                </div>

                {/* =================================================
                    PASSWORDS
                ================================================= */}

                <div className="grid gap-5 sm:grid-cols-2">

                  <PasswordField
                    id="password"
                    name="password"
                    label={
                      t.password
                    }
                    placeholder={
                      t.passwordPlaceholder
                    }
                    value={
                      formData.password
                    }
                    onChange={
                      handleChange
                    }
                    show={
                      showPassword
                    }
                    toggleShow={() =>
                      setShowPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    disabled={
                      isLoading
                    }
                  />

                  <PasswordField
                    id="confirmPassword"
                    name="confirmPassword"
                    label={
                      t.confirmPassword
                    }
                    placeholder={
                      t.confirmPasswordPlaceholder
                    }
                    value={
                      formData.confirmPassword
                    }
                    onChange={
                      handleChange
                    }
                    show={
                      showConfirmPassword
                    }
                    toggleShow={() =>
                      setShowConfirmPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    disabled={
                      isLoading
                    }
                  />

                </div>

                <p className="-mt-2 text-xs text-[#8A9EAC]">
                  {t.passwordHint}
                </p>

                {/* =================================================
                    PREFERRED LANGUAGE
                ================================================= */}

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
                      disabled={
                        isLoading
                      }
                      className="w-full appearance-none rounded-xl border border-[#C8D8E2] bg-white py-3.5 pl-11 pr-4 text-sm text-[#16324A] outline-none transition focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:bg-[#F1F5F7]"
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

                {/* =================================================
                    TERMS
                ================================================= */}

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
                    disabled={
                      isLoading
                    }
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

                {/* =================================================
                    EMAIL VERIFICATION NOTICE
                ================================================= */}

                {!isEmailVerified && (
                  <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">

                    <ShieldCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-amber-600"
                    />

                    <p className="text-xs font-semibold leading-5 text-amber-700">
                      {t.verifyEmailFirst}
                    </p>

                  </div>
                )}

                {/* =================================================
                    CREATE ACCOUNT
                ================================================= */}

                <button
                  type="submit"
                  disabled={
                    !canCreateAccount
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1F5F8B] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#1F5F8B]/20 transition hover:-translate-y-0.5 hover:bg-[#174D72] disabled:cursor-not-allowed disabled:bg-[#A9BBC7] disabled:shadow-none disabled:hover:translate-y-0"
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

              {/* =================================================
                  LOGIN LINK
              ================================================= */}

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

/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({
  icon,
  iconClass,
  title,
  description,
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-[#D8E5EC] bg-white/90 p-5 shadow-sm backdrop-blur">

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

      <div>

        <h3 className="font-bold text-[#16324A]">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-[#60798C]">
          {description}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   PASSWORD FIELD
========================================================= */

function PasswordField({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  show,
  toggleShow,
  disabled,
}) {
  return (
    <div>

      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-[#425D70]"
      >
        {label}
      </label>

      <div className="relative">

        <LockKeyhole
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9EAC]"
        />

        <input
          id={id}
          name={name}
          type={
            show
              ? "text"
              : "password"
          }
          value={value}
          onChange={onChange}
          placeholder={
            placeholder
          }
          autoComplete="new-password"
          required
          minLength={8}
          disabled={disabled}
          className="w-full rounded-xl border border-[#C8D8E2] bg-white py-3.5 pl-11 pr-11 text-sm text-[#16324A] outline-none transition placeholder:text-[#8A9EAC] focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:bg-[#F1F5F7]"
        />

        <button
          type="button"
          disabled={disabled}
          onClick={
            toggleShow
          }
          aria-label={
            show
              ? "Hide password"
              : "Show password"
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A9EAC] transition hover:text-[#425D70] disabled:cursor-not-allowed"
        >

          {show ? (
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
  );
}

export default RegisterPage;