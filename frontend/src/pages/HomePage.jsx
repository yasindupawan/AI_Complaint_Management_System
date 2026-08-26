import { Link } from "react-router-dom";
import {
  BrainCircuit,
  Languages,
  BellRing,
  SearchCheck,
  Building2,
  ArrowRight,
  CheckCircle2,
  FileText,
  ShieldCheck,
  MapPin,
  Clock3,
  Menu,
  X,
  Globe2,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";

import {
  useLanguage,
} from "../context/LanguageContext";

function HomePage() {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const {
    language,
    changeLanguage,
    t,
  } = useLanguage();

  const languageOptions = [
    {
      code: "en",
      label: "EN",
    },
    {
      code: "si",
      label: "සිං",
    },
    {
      code: "ta",
      label: "தமிழ்",
    },
  ];

  const features = [
    {
      icon: Languages,
      title:
        t.features.multilingualTitle,
      description:
        t.features.multilingualDescription,
    },
    {
      icon: BrainCircuit,
      title:
        t.features.classificationTitle,
      description:
        t.features.classificationDescription,
    },
    {
      icon: Zap,
      title:
        t.features.priorityTitle,
      description:
        t.features.priorityDescription,
    },
    {
      icon: SearchCheck,
      title:
        t.features.duplicateTitle,
      description:
        t.features.duplicateDescription,
    },
    {
      icon: Building2,
      title:
        t.features.routingTitle,
      description:
        t.features.routingDescription,
    },
    {
      icon: BellRing,
      title:
        t.features.notificationTitle,
      description:
        t.features.notificationDescription,
    },
  ];

  const steps = [
    {
      number: "01",
      icon: FileText,
      title:
        t.process.submitTitle,
      description:
        t.process.submitDescription,
    },
    {
      number: "02",
      icon: BrainCircuit,
      title:
        t.process.analysisTitle,
      description:
        t.process.analysisDescription,
    },
    {
      number: "03",
      icon: Building2,
      title:
        t.process.routingTitle,
      description:
        t.process.routingDescription,
    },
    {
      number: "04",
      icon: CheckCircle2,
      title:
        t.process.trackingTitle,
      description:
        t.process.trackingDescription,
    },
  ];

  const languageItems = [
    t.languageSection.item1,
    t.languageSection.item2,
    t.languageSection.item3,
  ];

  const scrollToSection = (id) => {
    const section =
      document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
      });
    }

    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F6F9FB] text-[#16324A]">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#D8E5EC] bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">

          <button
            type="button"
            onClick={() =>
              scrollToSection("home")
            }
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#123B5D] text-white shadow-md shadow-[#123B5D]/15">
              <BrainCircuit size={25} />
            </div>

            <div className="text-left leading-tight">
              <p className="text-[17px] font-bold text-[#16324A]">
                {t.brand.title}
              </p>

              <p className="text-xs font-medium text-[#1B8A8F]">
                {t.brand.subtitle}
              </p>
            </div>
          </button>

          <nav className="hidden items-center gap-8 lg:flex">

            <button
              type="button"
              onClick={() =>
                scrollToSection("home")
              }
              className="text-sm font-medium text-[#60798C] transition hover:text-[#1F5F8B]"
            >
              {t.nav.home}
            </button>

            <button
              type="button"
              onClick={() =>
                scrollToSection(
                  "features"
                )
              }
              className="text-sm font-medium text-[#60798C] transition hover:text-[#1F5F8B]"
            >
              {t.nav.features}
            </button>

            <button
              type="button"
              onClick={() =>
                scrollToSection(
                  "how-it-works"
                )
              }
              className="text-sm font-medium text-[#60798C] transition hover:text-[#1F5F8B]"
            >
              {t.nav.howItWorks}
            </button>

            <button
              type="button"
              onClick={() =>
                scrollToSection("about")
              }
              className="text-sm font-medium text-[#60798C] transition hover:text-[#1F5F8B]"
            >
              {t.nav.about}
            </button>

          </nav>

          <div className="hidden items-center gap-3 lg:flex">

            <div className="flex items-center gap-1 rounded-lg border border-[#D8E5EC] bg-[#F6F9FB] p-1">

              <Globe2
                size={16}
                className="ml-2 text-[#60798C]"
              />

              {languageOptions.map(
                (item) => (
                  <button
                    type="button"
                    key={item.code}
                    onClick={() =>
                      changeLanguage(
                        item.code
                      )
                    }
                    className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                      language ===
                      item.code
                        ? "bg-white text-[#1F5F8B] shadow-sm"
                        : "text-[#60798C] hover:text-[#16324A]"
                    }`}
                  >
                    {item.label}
                  </button>
                )
              )}

            </div>

            <Link
              to="/login"
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#16324A] transition hover:bg-[#EAF3F8]"
            >
              {t.nav.login}
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-[#1F5F8B] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#1F5F8B]/20 transition hover:bg-[#174D72]"
            >
              {t.nav.register}
            </Link>

          </div>

          <button
            type="button"
            onClick={() =>
              setMenuOpen(
                !menuOpen
              )
            }
            className="rounded-lg border border-[#D8E5EC] p-2 text-[#16324A] lg:hidden"
          >
            {menuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>

        </div>

        {menuOpen && (
          <div className="border-t border-[#D8E5EC] bg-white px-5 py-5 lg:hidden">

            <div className="flex flex-col gap-2">

              <button
                type="button"
                onClick={() =>
                  scrollToSection("home")
                }
                className="rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-[#F6F9FB]"
              >
                {t.nav.home}
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "features"
                  )
                }
                className="rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-[#F6F9FB]"
              >
                {t.nav.features}
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "how-it-works"
                  )
                }
                className="rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-[#F6F9FB]"
              >
                {t.nav.howItWorks}
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection(
                    "about"
                  )
                }
                className="rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-[#F6F9FB]"
              >
                {t.nav.about}
              </button>

              <div className="my-2 border-t border-[#D8E5EC]" />

              <div className="flex flex-wrap items-center gap-2 py-2">

                <Globe2 size={17} />

                {languageOptions.map(
                  (item) => (
                    <button
                      type="button"
                      key={item.code}
                      onClick={() =>
                        changeLanguage(
                          item.code
                        )
                      }
                      className={`rounded-md px-3 py-2 text-xs font-semibold ${
                        language ===
                        item.code
                          ? "bg-[#E8F6F4] text-[#1B8A8F]"
                          : "bg-[#F6F9FB] text-[#60798C]"
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                )}

              </div>

              <Link
                to="/login"
                className="rounded-lg border border-[#D8E5EC] px-4 py-2.5 text-center text-sm font-semibold"
              >
                {t.nav.login}
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-[#1F5F8B] px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                {t.nav.register}
              </Link>

            </div>

          </div>
        )}

      </header>

      <main>

        {/* ==================================================
            HERO
        ================================================== */}

        <section
          id="home"
          className="relative overflow-hidden bg-gradient-to-br from-[#F6F9FB] via-white to-[#EAF3F8]"
        >

          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#D9EDF2]/70 blur-3xl" />

          <div className="absolute -bottom-40 left-20 h-80 w-80 rounded-full bg-[#DDF3EE]/60 blur-3xl" />

          <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-14 px-5 py-20 lg:grid-cols-2 lg:px-8">

            <div>

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#BFD9E6] bg-[#EAF3F8] px-4 py-2 text-sm font-semibold text-[#1F5F8B]">

                <BrainCircuit size={17} />

                {t.hero.badge}

              </div>

              <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.1] tracking-tight text-[#16324A] md:text-6xl">

                {t.hero.title}

                <span className="mt-2 block text-[#1B8A8F]">
                  {
                    t.hero
                      .titleHighlight
                  }
                </span>

              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-[#60798C]">
                {
                  t.hero
                    .description
                }
              </p>

              <div className="mt-8 flex flex-wrap gap-4">

                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1F5F8B] px-6 py-3.5 font-semibold text-white shadow-lg shadow-[#1F5F8B]/20 transition hover:-translate-y-0.5 hover:bg-[#174D72]"
                >
                  {
                    t.hero
                      .submitComplaint
                  }

                  <ArrowRight
                    size={19}
                  />
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    scrollToSection(
                      "how-it-works"
                    )
                  }
                  className="rounded-xl border border-[#C8D8E2] bg-white px-6 py-3.5 font-semibold text-[#16324A] transition hover:border-[#1B8A8F] hover:text-[#1B8A8F]"
                >
                  {
                    t.hero
                      .howItWorks
                  }
                </button>

              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">

                <div className="flex items-center gap-2 text-sm text-[#60798C]">
                  <CheckCircle2
                    size={17}
                    className="text-[#2E9B75]"
                  />
                  {t.hero.multilingual}
                </div>

                <div className="flex items-center gap-2 text-sm text-[#60798C]">
                  <CheckCircle2
                    size={17}
                    className="text-[#2E9B75]"
                  />
                  {t.hero.aiClassification}
                </div>

                <div className="flex items-center gap-2 text-sm text-[#60798C]">
                  <CheckCircle2
                    size={17}
                    className="text-[#2E9B75]"
                  />
                  {t.hero.statusTracking}
                </div>

              </div>

            </div>

            <div className="relative">

              <div className="absolute inset-0 translate-x-8 translate-y-8 rounded-[40px] bg-[#CFE9EB]/50 blur-2xl" />

              <div className="relative overflow-hidden rounded-[32px] border border-[#D8E5EC] bg-white p-6 shadow-2xl shadow-[#123B5D]/10">

                <div className="relative min-h-[440px] overflow-hidden rounded-[24px] bg-gradient-to-br from-[#123B5D] via-[#1F5F8B] to-[#1B8A8F] p-8 text-white">

                  <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
                  <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10" />

                  <div className="relative">

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-sm font-medium text-[#D6EEF1]">
                          {t.hero.platform}
                        </p>

                        <h2 className="mt-1 text-2xl font-bold">
                          {t.hero.voiceTitle}
                        </h2>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                        <Users size={25} />
                      </div>

                    </div>

                    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">

                      <div className="rounded-2xl bg-white p-5 text-[#16324A] shadow-lg">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF3F8] text-[#1F5F8B]">
                          <FileText size={22} />
                        </div>

                        <p className="mt-4 font-bold">
                          {t.hero.reportIssue}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#60798C]">
                          {t.hero.reportIssueDescription}
                        </p>

                      </div>

                      <div className="rounded-2xl bg-white/15 p-5 backdrop-blur">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                          <BrainCircuit size={22} />
                        </div>

                        <p className="mt-4 font-bold">
                          {t.hero.aiAssistance}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#D6EEF1]">
                          {t.hero.aiAssistanceDescription}
                        </p>

                      </div>

                      <div className="rounded-2xl bg-white/15 p-5 backdrop-blur">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                          <MapPin size={22} />
                        </div>

                        <p className="mt-4 font-bold">
                          {t.hero.relevantDepartment}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#D6EEF1]">
                          {t.hero.relevantDepartmentDescription}
                        </p>

                      </div>

                      <div className="rounded-2xl bg-white p-5 text-[#16324A] shadow-lg">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F6F4] text-[#2E9B75]">
                          <BellRing size={22} />
                        </div>

                        <p className="mt-4 font-bold">
                          {t.hero.stayUpdated}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#60798C]">
                          {t.hero.stayUpdatedDescription}
                        </p>

                      </div>

                    </div>

                    <div className="mt-5 flex items-center justify-between rounded-2xl bg-white/10 px-5 py-4 backdrop-blur">

                      <div className="flex items-center gap-3">

                        <Globe2 size={20} />

                        <div>
                          <p className="text-xs text-[#D6EEF1]">
                            {t.hero.availableLanguages}
                          </p>

                          <p className="text-sm font-semibold">
                            English · සිංහල · தமிழ்
                          </p>
                        </div>

                      </div>

                      <ShieldCheck size={24} />

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ==================================================
            FEATURES
        ================================================== */}

        <section
          id="features"
          className="bg-white py-24"
        >

          <div className="mx-auto max-w-7xl px-5 lg:px-8">

            <div className="mx-auto max-w-2xl text-center">

              <p className="text-sm font-bold uppercase tracking-widest text-[#1B8A8F]">
                {t.features.label}
              </p>

              <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#16324A]">
                {t.features.title}
              </h2>

              <p className="mt-4 leading-7 text-[#60798C]">
                {t.features.description}
              </p>

            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {features.map(
                (feature) => {
                  const Icon =
                    feature.icon;

                  return (
                    <div
                      key={
                        feature.title
                      }
                      className="group rounded-2xl border border-[#D8E5EC] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#8FC6CC] hover:shadow-xl hover:shadow-[#123B5D]/5"
                    >

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF3F8] text-[#1F5F8B] transition group-hover:bg-[#1B8A8F] group-hover:text-white">
                        <Icon size={23} />
                      </div>

                      <h3 className="mt-5 text-lg font-bold text-[#16324A]">
                        {feature.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-[#60798C]">
                        {feature.description}
                      </p>

                    </div>
                  );
                }
              )}

            </div>

          </div>

        </section>

        {/* ==================================================
            HOW IT WORKS
        ================================================== */}

        <section
          id="how-it-works"
          className="bg-[#F6F9FB] py-24"
        >

          <div className="mx-auto max-w-7xl px-5 lg:px-8">

            <div className="mx-auto max-w-2xl text-center">

              <p className="text-sm font-bold uppercase tracking-widest text-[#1F5F8B]">
                {t.process.label}
              </p>

              <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#16324A]">
                {t.process.title}
              </h2>

              <p className="mt-4 text-[#60798C]">
                {t.process.description}
              </p>

            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

              {steps.map((step) => {
                const Icon =
                  step.icon;

                return (
                  <div
                    key={step.number}
                    className="relative rounded-2xl border border-[#D8E5EC] bg-white p-7"
                  >

                    <span className="absolute right-5 top-4 text-4xl font-black text-[#EDF3F6]">
                      {step.number}
                    </span>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#123B5D] text-white">
                      <Icon size={23} />
                    </div>

                    <h3 className="mt-5 text-lg font-bold text-[#16324A]">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#60798C]">
                      {step.description}
                    </p>

                  </div>
                );
              })}

            </div>

          </div>

        </section>

        {/* ==================================================
            MULTILINGUAL
        ================================================== */}

        <section className="bg-white py-24">

          <div className="mx-auto max-w-7xl px-5 lg:px-8">

            <div className="grid items-center gap-14 lg:grid-cols-2">

              <div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F6F4] text-[#1B8A8F]">
                  <Languages size={28} />
                </div>

                <h2 className="mt-6 text-4xl font-bold tracking-tight text-[#16324A]">
                  {t.languageSection.title}
                </h2>

                <p className="mt-5 max-w-xl leading-7 text-[#60798C]">
                  {t.languageSection.description}
                </p>

                <div className="mt-8 space-y-4">

                  {languageItems.map(
                    (item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle2
                          size={20}
                          className="text-[#2E9B75]"
                        />

                        <span className="text-sm font-medium text-[#16324A]">
                          {item}
                        </span>
                      </div>
                    )
                  )}

                </div>

              </div>

              <div className="grid gap-4 sm:grid-cols-3">

                {[
                  ["EN", t.languageSection.english],
                  ["සිං", t.languageSection.sinhala],
                  ["தமிழ்", t.languageSection.tamil],
                ].map(([code, label]) => (
                  <div
                    key={code}
                    className="rounded-2xl border border-[#D8E5EC] bg-[#F6F9FB] p-7 text-center transition hover:border-[#8FC6CC]"
                  >
                    <p className="text-3xl font-bold text-[#1F5F8B]">
                      {code}
                    </p>

                    <p className="mt-2 font-semibold text-[#16324A]">
                      {label}
                    </p>
                  </div>
                ))}

              </div>

            </div>

          </div>

        </section>

        {/* ==================================================
            ABOUT
        ================================================== */}

        <section
          id="about"
          className="bg-[#0E2C43] py-24 text-white"
        >

          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">

            <div>

              <p className="text-sm font-bold uppercase tracking-widest text-[#6FD0C7]">
                {t.about.label}
              </p>

              <h2 className="mt-3 text-4xl font-bold leading-tight">
                {t.about.title}
              </h2>

              <p className="mt-5 max-w-xl leading-7 text-[#B9CBD6]">
                {t.about.description}
              </p>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

                <Clock3 className="text-[#6FD0C7]" />

                <h3 className="mt-4 font-bold">
                  {t.about.efficientTitle}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#B9CBD6]">
                  {t.about.efficientDescription}
                </p>

              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

                <ShieldCheck className="text-[#6FD0C7]" />

                <h3 className="mt-4 font-bold">
                  {t.about.transparentTitle}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#B9CBD6]">
                  {t.about.transparentDescription}
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ==================================================
            CTA
        ================================================== */}

        <section className="bg-gradient-to-r from-[#123B5D] via-[#1F5F8B] to-[#1B8A8F] py-16">

          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-7 px-5 text-center md:flex-row md:text-left lg:px-8">

            <div>

              <h2 className="text-3xl font-bold text-white">
                {t.cta.title}
              </h2>

              <p className="mt-2 text-[#D6EEF1]">
                {t.cta.description}
              </p>

            </div>

            <Link
              to="/register"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-[#1F5F8B] shadow-lg transition hover:-translate-y-0.5"
            >
              {t.cta.button}

              <ArrowRight size={19} />
            </Link>

          </div>

        </section>

      </main>

      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="bg-white">

        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">

          <div className="grid gap-10 md:grid-cols-3">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#123B5D] text-white">
                  <BrainCircuit size={22} />
                </div>

                <div>

                  <p className="font-bold text-[#16324A]">
                    {t.brand.title}
                  </p>

                  <p className="text-xs text-[#1B8A8F]">
                    {t.brand.subtitle}
                  </p>

                </div>

              </div>

              <p className="mt-4 max-w-sm text-sm leading-6 text-[#60798C]">
                {t.footer.description}
              </p>

            </div>

            <div>

              <h3 className="font-bold text-[#16324A]">
                {t.footer.quickLinks}
              </h3>

              <div className="mt-4 flex flex-col gap-3 text-sm text-[#60798C]">

                <button
                  type="button"
                  onClick={() =>
                    scrollToSection("features")
                  }
                  className="w-fit hover:text-[#1B8A8F]"
                >
                  {t.nav.features}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    scrollToSection("how-it-works")
                  }
                  className="w-fit hover:text-[#1B8A8F]"
                >
                  {t.nav.howItWorks}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    scrollToSection("about")
                  }
                  className="w-fit hover:text-[#1B8A8F]"
                >
                  {t.nav.about}
                </button>

              </div>

            </div>

            <div>

              <h3 className="font-bold text-[#16324A]">
                {t.footer.languages}
              </h3>

              <div className="mt-4 flex flex-wrap gap-2">

                {languageOptions.map(
                  (item) => (
                    <button
                      type="button"
                      key={item.code}
                      onClick={() =>
                        changeLanguage(
                          item.code
                        )
                      }
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                        language ===
                        item.code
                          ? "border-[#1B8A8F] bg-[#E8F6F4] text-[#1B8A8F]"
                          : "border-[#D8E5EC] text-[#60798C]"
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                )}

              </div>

            </div>

          </div>

          <div className="mt-10 border-t border-[#D8E5EC] pt-6 text-center text-sm text-[#8A9EAC]">
            {t.footer.copyright}
          </div>

        </div>

      </footer>

    </div>
  );
}

export default HomePage;