import { Link, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  BrainCircuit,
  FileText,
  MapPin,
  Languages,
  ImagePlus,
  X,
  Send,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Navigation,
  LocateFixed,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

import { createComplaint } from "../api/complaintApi";

/* =========================================================
   MAP CONFIGURATION
========================================================= */

const SRI_LANKA_CENTER = [
  7.8731,
  80.7718,
];

const DEFAULT_MAP_ZOOM = 7;
const SELECTED_MAP_ZOOM = 16;

/* =========================================================
   TRANSLATIONS
========================================================= */

const translations = {
  EN: {
    brand: "Public Complaint",
    portal: "Citizen Portal",

    back: "Back to Dashboard",

    pageLabel: "New Complaint",
    title: "Report a public issue",
    description:
      "Provide clear information about the issue. The system will analyze your complaint and route it for processing.",

    complaintTitle:
      "Complaint Title",

    complaintTitlePlaceholder:
      "Example: Broken water pipe near community hall",

    complaintDescription:
      "Description",

    complaintDescriptionPlaceholder:
      "Describe the issue clearly and provide useful details.",

    language:
      "Complaint Language",

    english:
      "English",

    sinhala:
      "සිංහල",

    tamil:
      "தமிழ்",

    location:
      "Location",

    locationPlaceholder:
      "Example: Colombo Community Hall",

    mapTitle:
      "Select Exact Location",

    mapDescription:
      "Click on the map to mark the exact location of the public issue, or use your current location.",

    useCurrentLocation:
      "Use My Current Location",

    locating:
      "Getting location...",

    selectedCoordinates:
      "Selected Coordinates",

    latitude:
      "Latitude",

    longitude:
      "Longitude",

    locationSelected:
      "Location selected",

    currentLocationSelected:
      "Current location selected successfully.",

    geolocationUnsupported:
      "Your browser does not support geolocation.",

    geolocationDenied:
      "Unable to access your current location. Please allow location access or select the location on the map.",

    mapInstruction:
      "Click anywhere on the map to select the complaint location.",

    images:
      "Supporting Images",

    imagesDescription:
      "Upload up to 5 images. Images are optional.",

    selectImages:
      "Select Images",

    maxImages:
      "Maximum 5 images",

    submit:
      "Submit Complaint",

    submitting:
      "Submitting complaint...",

    success:
      "Complaint submitted successfully.",

    genericError:
      "Unable to submit complaint. Please try again.",

    titleRequired:
      "Please enter a complaint title.",

    descriptionRequired:
      "Please enter a complaint description.",

    languageRequired:
      "Please select the complaint language.",

    maxImagesError:
      "You can upload a maximum of 5 images.",

    imageTypeError:
      "Only image files are allowed.",

    noteTitle:
      "What happens next?",

    note1:
      "AI analyzes the complaint category and priority.",

    note2:
      "The system checks for possible duplicate complaints using category, location, recency and semantic similarity.",

    note3:
      "The complaint is routed to the relevant department when appropriate.",

    note4:
      "You can track updates from your citizen dashboard.",
  },

  "සිං": {
    brand:
      "මහජන පැමිණිලි",

    portal:
      "පුරවැසි ද්වාරය",

    back:
      "උපකරණ පුවරුවට",

    pageLabel:
      "නව පැමිණිල්ල",

    title:
      "මහජන ගැටලුවක් වාර්තා කරන්න",

    description:
      "ගැටලුව පිළිබඳ පැහැදිලි තොරතුරු ලබා දෙන්න. පද්ධතිය ඔබගේ පැමිණිල්ල විශ්ලේෂණය කර සැකසීම සඳහා යොමු කරයි.",

    complaintTitle:
      "පැමිණිල්ලේ මාතෘකාව",

    complaintTitlePlaceholder:
      "උදා: ප්‍රජා ශාලාව අසල ජල නළයක් කැඩී ඇත",

    complaintDescription:
      "විස්තරය",

    complaintDescriptionPlaceholder:
      "ගැටලුව පැහැදිලිව විස්තර කර අවශ්‍ය තොරතුරු ලබා දෙන්න.",

    language:
      "පැමිණිල්ලේ භාෂාව",

    english:
      "English",

    sinhala:
      "සිංහල",

    tamil:
      "தமிழ்",

    location:
      "ස්ථානය",

    locationPlaceholder:
      "උදා: කෑගල්ල නගරය",

    mapTitle:
      "නිවැරදි ස්ථානය තෝරන්න",

    mapDescription:
      "ගැටලුව ඇති නිවැරදි ස්ථානය map එක මත click කර තෝරන්න හෝ ඔබගේ වත්මන් ස්ථානය භාවිතා කරන්න.",

    useCurrentLocation:
      "මගේ වත්මන් ස්ථානය භාවිතා කරන්න",

    locating:
      "ස්ථානය ලබා ගනිමින්...",

    selectedCoordinates:
      "තෝරාගත් ඛණ්ඩාංක",

    latitude:
      "Latitude",

    longitude:
      "Longitude",

    locationSelected:
      "ස්ථානය තෝරා ඇත",

    currentLocationSelected:
      "වත්මන් ස්ථානය සාර්ථකව තෝරා ගන්නා ලදී.",

    geolocationUnsupported:
      "ඔබගේ browser එක geolocation සඳහා සහාය නොදක්වයි.",

    geolocationDenied:
      "වත්මන් ස්ථානය ලබාගත නොහැක. Location permission ලබා දෙන්න හෝ map එකෙන් ස්ථානය තෝරන්න.",

    mapInstruction:
      "පැමිණිල්ලේ ස්ථානය තෝරා ගැනීමට map එක මත click කරන්න.",

    images:
      "අදාළ ඡායාරූප",

    imagesDescription:
      "ඡායාරූප 5ක් දක්වා upload කළ හැක. ඡායාරූප අනිවාර්ය නොවේ.",

    selectImages:
      "ඡායාරූප තෝරන්න",

    maxImages:
      "උපරිම ඡායාරූප 5ක්",

    submit:
      "පැමිණිල්ල ඉදිරිපත් කරන්න",

    submitting:
      "පැමිණිල්ල ඉදිරිපත් කරමින්...",

    success:
      "පැමිණිල්ල සාර්ථකව ඉදිරිපත් විය.",

    genericError:
      "පැමිණිල්ල ඉදිරිපත් කළ නොහැක. නැවත උත්සාහ කරන්න.",

    titleRequired:
      "කරුණාකර පැමිණිල්ලේ මාතෘකාව ඇතුළත් කරන්න.",

    descriptionRequired:
      "කරුණාකර පැමිණිල්ලේ විස්තරය ඇතුළත් කරන්න.",

    languageRequired:
      "කරුණාකර පැමිණිල්ලේ භාෂාව තෝරන්න.",

    maxImagesError:
      "උපරිම ඡායාරූප 5ක් පමණක් upload කළ හැක.",

    imageTypeError:
      "ඡායාරූප files පමණක් භාවිතා කරන්න.",

    noteTitle:
      "ඊළඟට මොකද වෙන්නේ?",

    note1:
      "AI මගින් පැමිණිල්ලේ වර්ගය සහ ප්‍රමුඛතාව විශ්ලේෂණය කරයි.",

    note2:
      "වර්ගය, ස්ථානය, කාලය සහ අර්ථමය සමානතාව භාවිතා කර duplicate පැමිණිලි පරීක්ෂා කරයි.",

    note3:
      "අවශ්‍ය විට පැමිණිල්ල අදාළ අංශයට යොමු කරයි.",

    note4:
      "පුරවැසි උපකරණ පුවරුවෙන් තත්ත්ව යාවත්කාලීන නිරීක්ෂණය කළ හැක.",
  },

  "தமிழ்": {
    brand:
      "பொது புகார்கள்",

    portal:
      "குடிமக்கள் தளம்",

    back:
      "முகப்புப்பலகைக்கு திரும்பு",

    pageLabel:
      "புதிய புகார்",

    title:
      "ஒரு பொது பிரச்சினையைப் புகாரளிக்கவும்",

    description:
      "பிரச்சினை பற்றிய தெளிவான தகவலை வழங்கவும். அமைப்பு உங்கள் புகாரை பகுப்பாய்வு செய்து செயலாக்கத்திற்கு அனுப்பும்.",

    complaintTitle:
      "புகார் தலைப்பு",

    complaintTitlePlaceholder:
      "உதாரணம்: சமூக மண்டபத்திற்கு அருகில் நீர் குழாய் உடைந்துள்ளது",

    complaintDescription:
      "விவரம்",

    complaintDescriptionPlaceholder:
      "பிரச்சினையை தெளிவாக விளக்கி தேவையான தகவலை வழங்கவும்.",

    language:
      "புகார் மொழி",

    english:
      "English",

    sinhala:
      "සිංහල",

    tamil:
      "தமிழ்",

    location:
      "இடம்",

    locationPlaceholder:
      "உதாரணம்: கேகாலை நகரம்",

    mapTitle:
      "சரியான இடத்தைத் தேர்ந்தெடுக்கவும்",

    mapDescription:
      "பிரச்சினையின் சரியான இடத்தை வரைபடத்தில் கிளிக் செய்து தேர்ந்தெடுக்கவும் அல்லது உங்கள் தற்போதைய இடத்தைப் பயன்படுத்தவும்.",

    useCurrentLocation:
      "என் தற்போதைய இடத்தைப் பயன்படுத்து",

    locating:
      "இடம் பெறப்படுகிறது...",

    selectedCoordinates:
      "தேர்ந்தெடுக்கப்பட்ட கோடுகள்",

    latitude:
      "Latitude",

    longitude:
      "Longitude",

    locationSelected:
      "இடம் தேர்ந்தெடுக்கப்பட்டது",

    currentLocationSelected:
      "தற்போதைய இடம் வெற்றிகரமாக தேர்ந்தெடுக்கப்பட்டது.",

    geolocationUnsupported:
      "உங்கள் browser geolocation வசதியை ஆதரிக்கவில்லை.",

    geolocationDenied:
      "தற்போதைய இடத்தை அணுக முடியவில்லை. Location permission வழங்கவும் அல்லது வரைபடத்தில் இடத்தைத் தேர்ந்தெடுக்கவும்.",

    mapInstruction:
      "புகார் இடத்தைத் தேர்ந்தெடுக்க வரைபடத்தில் கிளிக் செய்யவும்.",

    images:
      "ஆதாரப் படங்கள்",

    imagesDescription:
      "அதிகபட்சம் 5 படங்களை பதிவேற்றலாம். படங்கள் விருப்பமானவை.",

    selectImages:
      "படங்களைத் தேர்ந்தெடுக்கவும்",

    maxImages:
      "அதிகபட்சம் 5 படங்கள்",

    submit:
      "புகாரை சமர்ப்பிக்கவும்",

    submitting:
      "புகார் சமர்ப்பிக்கப்படுகிறது...",

    success:
      "புகார் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது.",

    genericError:
      "புகாரை சமர்ப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",

    titleRequired:
      "புகார் தலைப்பை உள்ளிடவும்.",

    descriptionRequired:
      "புகார் விவரத்தை உள்ளிடவும்.",

    languageRequired:
      "புகார் மொழியைத் தேர்ந்தெடுக்கவும்.",

    maxImagesError:
      "அதிகபட்சம் 5 படங்களை மட்டுமே பதிவேற்றலாம்.",

    imageTypeError:
      "படக் கோப்புகள் மட்டுமே அனுமதிக்கப்படுகின்றன.",

    noteTitle:
      "அடுத்து என்ன நடக்கும்?",

    note1:
      "AI புகாரின் வகை மற்றும் முன்னுரிமையை பகுப்பாய்வு செய்கிறது.",

    note2:
      "வகை, இடம், சமீபத்திய நிலை மற்றும் semantic similarity மூலம் நகல் புகார்கள் சரிபார்க்கப்படுகின்றன.",

    note3:
      "தேவையானபோது புகார் பொருத்தமான துறைக்கு அனுப்பப்படுகிறது.",

    note4:
      "குடிமக்கள் முகப்புப்பலகையில் நிலை புதுப்பிப்புகளை கண்காணிக்கலாம்.",
  },
};

/* =========================================================
   MAP CLICK HANDLER
========================================================= */

function MapLocationSelector({
  onLocationSelect,
}) {
  useMapEvents({
    click(event) {
      const {
        lat,
        lng,
      } = event.latlng;

      onLocationSelect({
        latitude: Number(
          lat.toFixed(6)
        ),

        longitude: Number(
          lng.toFixed(6)
        ),
      });
    },
  });

  return null;
}

/* =========================================================
   MAP POSITION UPDATER
========================================================= */

function MapPositionUpdater({
  selectedLocation,
}) {
  const map = useMap();

  if (
    selectedLocation &&
    typeof selectedLocation.latitude ===
      "number" &&
    typeof selectedLocation.longitude ===
      "number"
  ) {
    map.flyTo(
      [
        selectedLocation.latitude,
        selectedLocation.longitude,
      ],
      SELECTED_MAP_ZOOM,
      {
        duration: 0.8,
      }
    );
  }

  return null;
}

/* =========================================================
   PAGE
========================================================= */

function NewComplaintPage() {
  const navigate =
    useNavigate();

  const [
    language,
    setLanguage,
  ] = useState("EN");

  const [
    formData,
    setFormData,
  ] = useState({
    title: "",
    description: "",
    submittedLanguage:
      "english",
    location: "",
  });

  const [
    selectedLocation,
    setSelectedLocation,
  ] = useState(null);

  const [
    locationLoading,
    setLocationLoading,
  ] = useState(false);

  const [
    locationMessage,
    setLocationMessage,
  ] = useState("");

  const [
    images,
    setImages,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const t =
    translations[language];

  /* =========================================================
     IMAGE PREVIEWS
  ========================================================= */

  const imagePreviews =
    useMemo(
      () =>
        images.map(
          (file) => ({
            file,
            url:
              URL.createObjectURL(
                file
              ),
          })
        ),
      [images]
    );

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (
    e
  ) => {
    const {
      name,
      value,
    } = e.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]:
          value,
      })
    );

    if (error) {
      setError("");
    }
  };

  /* =========================================================
     MAP LOCATION CHANGE
  ========================================================= */

  const handleMapLocationSelect =
    ({
      latitude,
      longitude,
    }) => {
      setSelectedLocation({
        latitude,
        longitude,
      });

      setLocationMessage(
        t.locationSelected
      );

      if (error) {
        setError("");
      }
    };

  /* =========================================================
     CURRENT LOCATION
  ========================================================= */

  const handleCurrentLocation =
    () => {
      setLocationMessage(
        ""
      );

      if (
        !navigator.geolocation
      ) {
        setError(
          t.geolocationUnsupported
        );

        return;
      }

      setLocationLoading(
        true
      );

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude =
            Number(
              position.coords.latitude.toFixed(
                6
              )
            );

          const longitude =
            Number(
              position.coords.longitude.toFixed(
                6
              )
            );

          setSelectedLocation({
            latitude,
            longitude,
          });

          setLocationMessage(
            t.currentLocationSelected
          );

          setError("");

          setLocationLoading(
            false
          );
        },

        (geolocationError) => {
          console.error(
            "Geolocation error:",
            geolocationError
          );

          setLocationLoading(
            false
          );

          setError(
            t.geolocationDenied
          );
        },

        {
          enableHighAccuracy:
            true,

          timeout:
            10000,

          maximumAge:
            0,
        }
      );
    };

  /* =========================================================
     IMAGE CHANGE
  ========================================================= */

  const handleImages = (
    e
  ) => {
    const selectedFiles =
      Array.from(
        e.target.files ||
          []
      );

    setError("");

    if (
      images.length +
        selectedFiles.length >
      5
    ) {
      setError(
        t.maxImagesError
      );

      e.target.value =
        "";

      return;
    }

    const invalidFile =
      selectedFiles.find(
        (file) =>
          !file.type.startsWith(
            "image/"
          )
      );

    if (invalidFile) {
      setError(
        t.imageTypeError
      );

      e.target.value =
        "";

      return;
    }

    setImages(
      (previous) => [
        ...previous,
        ...selectedFiles,
      ]
    );

    e.target.value =
      "";
  };

  const removeImage = (
    index
  ) => {
    setImages(
      (previous) =>
        previous.filter(
          (
            _,
            currentIndex
          ) =>
            currentIndex !==
            index
        )
    );
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setError("");
      setSuccess("");

      if (
        !formData.title.trim()
      ) {
        setError(
          t.titleRequired
        );

        return;
      }

      if (
        !formData.description.trim()
      ) {
        setError(
          t.descriptionRequired
        );

        return;
      }

      if (
        !formData
          .submittedLanguage
      ) {
        setError(
          t.languageRequired
        );

        return;
      }

      const token =
        localStorage.getItem(
          "token"
        ) ||
        sessionStorage.getItem(
          "token"
        );

      if (!token) {
        navigate(
          "/login"
        );

        return;
      }

      try {
        setLoading(
          true
        );

        const payload =
          new FormData();

        payload.append(
          "title",
          formData.title.trim()
        );

        payload.append(
          "description",
          formData.description.trim()
        );

        payload.append(
          "submittedLanguage",
          formData.submittedLanguage
        );

        const locationPayload = {
          address:
            formData.location.trim(),
        };

        if (
          selectedLocation &&
          typeof selectedLocation.latitude ===
            "number" &&
          typeof selectedLocation.longitude ===
            "number"
        ) {
          locationPayload.latitude =
            selectedLocation.latitude;

          locationPayload.longitude =
            selectedLocation.longitude;
        }

        payload.append(
          "location",
          JSON.stringify(
            locationPayload
          )
        );

        images.forEach(
          (image) => {
            payload.append(
              "images",
              image
            );
          }
        );

        const response =
          await createComplaint(
            payload,
            token
          );

        setSuccess(
          response?.message ||
            t.success
        );

        setFormData({
          title: "",
          description: "",
          submittedLanguage:
            "english",
          location: "",
        });

        setSelectedLocation(
          null
        );

        setLocationMessage(
          ""
        );

        setImages([]);

        setTimeout(
          () => {
            navigate(
              "/dashboard"
            );
          },
          1500
        );
      } catch (err) {
        console.error(
          "Complaint submission error:",
          err
        );

        if (
          Array.isArray(
            err?.errors
          ) &&
          err.errors.length >
            0
        ) {
          setError(
            err.errors
              .map(
                (item) =>
                  item.msg ||
                  item.message
              )
              .join(" ")
          );
        } else {
          setError(
            err?.message ||
              t.genericError
          );
        }
      } finally {
        setLoading(
          false
        );
      }
    };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#F6F9FB] text-[#16324A]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-[#D8E5EC] bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">

          <Link
            to="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#123B5D] text-white shadow-sm shadow-[#123B5D]/15">
              <BrainCircuit
                size={23}
              />
            </div>

            <div>

              <p className="font-bold text-[#16324A]">
                {t.brand}
              </p>

              <p className="text-xs font-medium text-[#1B8A8F]">
                {t.portal}
              </p>

            </div>

          </Link>

          <div className="flex items-center gap-1 rounded-lg border border-[#D8E5EC] bg-[#F6F9FB] p-1">

            {[
              "EN",
              "සිං",
              "தமிழ்",
            ].map(
              (item) => (
                <button
                  key={
                    item
                  }
                  type="button"
                  onClick={() =>
                    setLanguage(
                      item
                    )
                  }
                  className={`rounded-md px-3 py-2 text-xs font-bold transition ${
                    language ===
                    item
                      ? "bg-white text-[#1F5F8B] shadow-sm"
                      : "text-[#60798C] hover:text-[#16324A]"
                  }`}
                >
                  {item}
                </button>
              )
            )}

          </div>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12">

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#60798C] transition hover:text-[#1B8A8F]"
        >
          <ArrowLeft
            size={17}
          />

          {t.back}
        </Link>

        <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_360px]">

          {/* =================================================
              FORM
          ================================================= */}

          <section className="rounded-3xl border border-[#D8E5EC] bg-white p-6 shadow-sm sm:p-8">

            <div>

              <p className="text-sm font-bold text-[#1B8A8F]">
                {t.pageLabel}
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#16324A]">
                {t.title}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#60798C]">
                {t.description}
              </p>

            </div>

            {/* ERROR */}

            {error && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <p>
                  {error}
                </p>

              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">

                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <p>
                  {success}
                </p>

              </div>
            )}

            <form
              className="mt-8 space-y-6"
              onSubmit={
                handleSubmit
              }
            >

              {/* TITLE */}

              <div>

                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-semibold text-[#425D70]"
                >
                  {
                    t.complaintTitle
                  }
                </label>

                <div className="relative">

                  <FileText
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9EAC]"
                  />

                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={
                      formData.title
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    placeholder={
                      t.complaintTitlePlaceholder
                    }
                    className="w-full rounded-xl border border-[#C8D8E2] bg-white py-3.5 pl-11 pr-4 text-sm text-[#16324A] outline-none transition placeholder:text-[#8A9EAC] focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:bg-[#F1F5F7]"
                  />

                </div>

              </div>

              {/* DESCRIPTION */}

              <div>

                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-[#425D70]"
                >
                  {
                    t.complaintDescription
                  }
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    loading
                  }
                  placeholder={
                    t.complaintDescriptionPlaceholder
                  }
                  className="w-full resize-none rounded-xl border border-[#C8D8E2] bg-white px-4 py-3.5 text-sm text-[#16324A] outline-none transition placeholder:text-[#8A9EAC] focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:bg-[#F1F5F7]"
                />

              </div>

              {/* LANGUAGE + ADDRESS */}

              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label
                    htmlFor="submittedLanguage"
                    className="mb-2 block text-sm font-semibold text-[#425D70]"
                  >
                    {t.language}
                  </label>

                  <div className="relative">

                    <Languages
                      size={19}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9EAC]"
                    />

                    <select
                      id="submittedLanguage"
                      name="submittedLanguage"
                      value={
                        formData.submittedLanguage
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        loading
                      }
                      className="w-full appearance-none rounded-xl border border-[#C8D8E2] bg-white py-3.5 pl-11 pr-4 text-sm text-[#16324A] outline-none transition focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:bg-[#F1F5F7]"
                    >
                      <option value="english">
                        {
                          t.english
                        }
                      </option>

                      <option value="sinhala">
                        {
                          t.sinhala
                        }
                      </option>

                      <option value="tamil">
                        {
                          t.tamil
                        }
                      </option>
                    </select>

                  </div>

                </div>

                <div>

                  <label
                    htmlFor="location"
                    className="mb-2 block text-sm font-semibold text-[#425D70]"
                  >
                    {t.location}
                  </label>

                  <div className="relative">

                    <MapPin
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9EAC]"
                    />

                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={
                        formData.location
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        loading
                      }
                      placeholder={
                        t.locationPlaceholder
                      }
                      className="w-full rounded-xl border border-[#C8D8E2] bg-white py-3.5 pl-11 pr-4 text-sm text-[#16324A] outline-none transition placeholder:text-[#8A9EAC] focus:border-[#1B8A8F] focus:ring-4 focus:ring-[#E8F6F4] disabled:bg-[#F1F5F7]"
                    />

                  </div>

                </div>

              </div>

              {/* =================================================
                  MAP LOCATION PICKER
              ================================================= */}

              <div className="overflow-hidden rounded-2xl border border-[#D8E5EC] bg-[#F6F9FB]">

                <div className="border-b border-[#D8E5EC] bg-white p-5">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <div className="flex items-center gap-2">

                        <LocateFixed
                          size={19}
                          className="text-[#1B8A8F]"
                        />

                        <p className="font-bold text-[#16324A]">
                          {
                            t.mapTitle
                          }
                        </p>

                      </div>

                      <p className="mt-2 max-w-xl text-xs leading-5 text-[#60798C]">
                        {
                          t.mapDescription
                        }
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={
                        handleCurrentLocation
                      }
                      disabled={
                        locationLoading ||
                        loading
                      }
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#B9DDDA] bg-[#E8F6F4] px-4 py-2.5 text-sm font-bold text-[#176D72] transition hover:bg-[#D6EFEC] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {locationLoading ? (
                        <>
                          <LoaderCircle
                            size={
                              17
                            }
                            className="animate-spin"
                          />

                          {
                            t.locating
                          }
                        </>
                      ) : (
                        <>
                          <Navigation
                            size={
                              17
                            }
                          />

                          {
                            t.useCurrentLocation
                          }
                        </>
                      )}
                    </button>

                  </div>

                </div>

                {/* MAP */}

                <div className="relative h-[360px] w-full">

                  <MapContainer
                    center={
                      SRI_LANKA_CENTER
                    }
                    zoom={
                      DEFAULT_MAP_ZOOM
                    }
                    scrollWheelZoom={
                      true
                    }
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapLocationSelector
                      onLocationSelect={
                        handleMapLocationSelect
                      }
                    />

                    <MapPositionUpdater
                      selectedLocation={
                        selectedLocation
                      }
                    />

                    {selectedLocation && (
                      <CircleMarker
                        center={[
                          selectedLocation.latitude,
                          selectedLocation.longitude,
                        ]}
                        radius={
                          10
                        }
                        pathOptions={{
                          color:
                            "#123B5D",

                          fillColor:
                            "#1B8A8F",

                          fillOpacity:
                            0.9,
                        }}
                      >
                        <Popup>
                          <div>

                            <strong>
                              {
                                t.locationSelected
                              }
                            </strong>

                            <br />

                            {
                              selectedLocation.latitude
                            }

                            ,{" "}

                            {
                              selectedLocation.longitude
                            }

                          </div>
                        </Popup>
                      </CircleMarker>
                    )}

                  </MapContainer>

                </div>

                {/* LOCATION DETAILS */}

                <div className="bg-white p-5">

                  {!selectedLocation ? (
                    <p className="flex items-center gap-2 text-xs text-[#60798C]">

                      <MapPin
                        size={16}
                        className="text-[#1B8A8F]"
                      />

                      {
                        t.mapInstruction
                      }

                    </p>
                  ) : (
                    <div>

                      <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">

                        <CheckCircle2
                          size={
                            17
                          }
                        />

                        {
                          locationMessage ||
                          t.locationSelected
                        }

                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">

                        <div className="rounded-xl border border-[#EDF3F6] bg-[#F6F9FB] px-4 py-3">

                          <p className="text-xs font-semibold uppercase tracking-wide text-[#8A9EAC]">
                            {
                              t.latitude
                            }
                          </p>

                          <p className="mt-1 text-sm font-bold text-[#425D70]">
                            {
                              selectedLocation.latitude
                            }
                          </p>

                        </div>

                        <div className="rounded-xl border border-[#EDF3F6] bg-[#F6F9FB] px-4 py-3">

                          <p className="text-xs font-semibold uppercase tracking-wide text-[#8A9EAC]">
                            {
                              t.longitude
                            }
                          </p>

                          <p className="mt-1 text-sm font-bold text-[#425D70]">
                            {
                              selectedLocation.longitude
                            }
                          </p>

                        </div>

                      </div>

                    </div>
                  )}

                </div>

              </div>

              {/* =================================================
                  IMAGES
              ================================================= */}

              <div>

                <div className="mb-3">

                  <p className="text-sm font-semibold text-[#425D70]">
                    {t.images}
                  </p>

                  <p className="mt-1 text-xs text-[#60798C]">
                    {
                      t.imagesDescription
                    }
                  </p>

                </div>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#C8D8E2] bg-[#F6F9FB] px-5 py-8 text-center transition hover:border-[#8FC6CC] hover:bg-[#E8F6F4]/50">

                  <ImagePlus
                    size={28}
                    className="text-[#1B8A8F]"
                  />

                  <p className="mt-3 text-sm font-bold text-[#425D70]">
                    {
                      t.selectImages
                    }
                  </p>

                  <p className="mt-1 text-xs text-[#8A9EAC]">
                    {
                      t.maxImages
                    }
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={
                      loading ||
                      images.length >=
                        5
                    }
                    onChange={
                      handleImages
                    }
                    className="hidden"
                  />

                </label>

                {imagePreviews.length >
                  0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">

                    {imagePreviews.map(
                      (
                        preview,
                        index
                      ) => (
                        <div
                          key={`${preview.file.name}-${index}`}
                          className="relative aspect-square overflow-hidden rounded-xl border border-[#D8E5EC] bg-[#F6F9FB]"
                        >

                          <img
                            src={
                              preview.url
                            }
                            alt=""
                            className="h-full w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeImage(
                                index
                              )
                            }
                            disabled={
                              loading
                            }
                            className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#0E2C43]/75 text-white transition hover:bg-red-600"
                          >
                            <X
                              size={
                                15
                              }
                            />
                          </button>

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

              {/* =================================================
                  SUBMIT
              ================================================= */}

              <button
                type="submit"
                disabled={
                  loading
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1F5F8B] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#1F5F8B]/20 transition hover:-translate-y-0.5 hover:bg-[#174D72] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={
                        18
                      }
                      className="animate-spin"
                    />

                    {
                      t.submitting
                    }
                  </>
                ) : (
                  <>
                    <Send
                      size={
                        18
                      }
                    />

                    {
                      t.submit
                    }
                  </>
                )}
              </button>

            </form>

          </section>

          {/* =================================================
              RIGHT INFO
          ================================================= */}

          <aside className="h-fit rounded-3xl border border-[#D8E5EC] bg-white p-6 shadow-sm">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F6F4] text-[#1B8A8F]">
              <BrainCircuit
                size={22}
              />
            </div>

            <h2 className="mt-5 text-lg font-bold text-[#16324A]">
              {
                t.noteTitle
              }
            </h2>

            <div className="mt-5 space-y-4">

              {[
                t.note1,
                t.note2,
                t.note3,
                t.note4,
              ].map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      item
                    }
                    className="flex gap-3"
                  >

                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAF3F8] text-xs font-bold text-[#1F5F8B]">
                      {
                        index +
                        1
                      }
                    </div>

                    <p className="text-sm leading-6 text-[#60798C]">
                      {
                        item
                      }
                    </p>

                  </div>
                )
              )}

            </div>

          </aside>

        </div>

      </main>

    </div>
  );
}

export default NewComplaintPage;