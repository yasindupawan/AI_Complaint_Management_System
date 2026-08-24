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
    <div className="min-h-screen bg-white text-slate-900">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">

          {/* Logo */}
          <button
            type="button"
            onClick={() =>
              scrollToSection("home")
            }
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
              <BrainCircuit size={25} />
            </div>

            <div className="text-left leading-tight">
              <p className="text-[17px] font-bold text-slate-900">
                {t.brand.title}
              </p>

              <p className="text-xs font-medium text-blue-600">
                {t.brand.subtitle}
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 lg:flex">

            <button
              type="button"
              onClick={() =>
                scrollToSection("home")
              }
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
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
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
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
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              {t.nav.howItWorks}
            </button>

            <button
              type="button"
              onClick={() =>
                scrollToSection("about")
              }
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              {t.nav.about}
            </button>

          </nav>

          {/* Desktop Right Section */}
          <div className="hidden items-center gap-3 lg:flex">

            {/* Language Selector */}
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">

              <Globe2
                size={16}
                className="ml-2 text-slate-500"
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
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </button>
                )
              )}

            </div>

            <Link
              to="/login"
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              {t.nav.login}
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700"
            >
              {t.nav.register}
            </Link>

          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() =>
              setMenuOpen(
                !menuOpen
              )
            }
            className="rounded-lg border border-slate-200 p-2 text-slate-700 lg:hidden"
          >
            {menuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>

        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-5 py-5 lg:hidden">

            <div className="flex flex-col gap-2">

              <button
                type="button"
                onClick={() =>
                  scrollToSection("home")
                }
                className="rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-slate-50"
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
                className="rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-slate-50"
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
                className="rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-slate-50"
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
                className="rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-slate-50"
              >
                {t.nav.about}
              </button>

              <div className="my-2 border-t border-slate-200" />

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
                          ? "bg-blue-50 text-blue-600"
                          : "bg-slate-50 text-slate-600"
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                )}

              </div>

              <Link
                to="/login"
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold"
              >
                {t.nav.login}
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
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
          className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50"
        >

          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />

          <div className="absolute -bottom-40 left-20 h-80 w-80 rounded-full bg-indigo-100/50 blur-3xl" />

          <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-14 px-5 py-20 lg:grid-cols-2 lg:px-8">

            {/* Hero Left */}
            <div>

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">

                <BrainCircuit size={17} />

                {t.hero.badge}

              </div>

              <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.1] tracking-tight text-slate-900 md:text-6xl">

                {t.hero.title}

                <span className="mt-2 block text-blue-600">
                  {
                    t.hero
                      .titleHighlight
                  }
                </span>

              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
                {
                  t.hero
                    .description
                }
              </p>

              <div className="mt-8 flex flex-wrap gap-4">

                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
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
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
                >
                  {
                    t.hero
                      .howItWorks
                  }
                </button>

              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">

                <div className="flex items-center gap-2 text-sm text-slate-600">

                  <CheckCircle2
                    size={17}
                    className="text-emerald-500"
                  />

                  {
                    t.hero
                      .multilingual
                  }

                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">

                  <CheckCircle2
                    size={17}
                    className="text-emerald-500"
                  />

                  {
                    t.hero
                      .aiClassification
                  }

                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">

                  <CheckCircle2
                    size={17}
                    className="text-emerald-500"
                  />

                  {
                    t.hero
                      .statusTracking
                  }

                </div>

              </div>

            </div>

            {/* Hero Visual */}
            <div className="relative">

              <div className="absolute inset-0 translate-x-8 translate-y-8 rounded-[40px] bg-blue-100/50 blur-2xl" />

              <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl shadow-blue-100/60">

                <div className="relative min-h-[440px] overflow-hidden rounded-[24px] bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">

                  <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />

                  <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10" />

                  <div className="relative">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-sm font-medium text-blue-100">
                          {
                            t.hero
                              .platform
                          }
                        </p>

                        <h2 className="mt-1 text-2xl font-bold">
                          {
                            t.hero
                              .voiceTitle
                          }
                        </h2>

                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                        <Users size={25} />
                      </div>

                    </div>

                    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">

                      {/* Report Issue */}
                      <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-lg">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <FileText size={22} />
                        </div>

                        <p className="mt-4 font-bold">
                          {
                            t.hero
                              .reportIssue
                          }
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {
                            t.hero
                              .reportIssueDescription
                          }
                        </p>

                      </div>

                      {/* AI Assistance */}
                      <div className="rounded-2xl bg-white/15 p-5 backdrop-blur">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                          <BrainCircuit
                            size={22}
                          />
                        </div>

                        <p className="mt-4 font-bold">
                          {
                            t.hero
                              .aiAssistance
                          }
                        </p>

                        <p className="mt-1 text-xs leading-5 text-blue-100">
                          {
                            t.hero
                              .aiAssistanceDescription
                          }
                        </p>

                      </div>

                      {/* Department */}
                      <div className="rounded-2xl bg-white/15 p-5 backdrop-blur">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                          <MapPin size={22} />
                        </div>

                        <p className="mt-4 font-bold">
                          {
                            t.hero
                              .relevantDepartment
                          }
                        </p>

                        <p className="mt-1 text-xs leading-5 text-blue-100">
                          {
                            t.hero
                              .relevantDepartmentDescription
                          }
                        </p>

                      </div>

                      {/* Notifications */}
                      <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-lg">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <BellRing size={22} />
                        </div>

                        <p className="mt-4 font-bold">
                          {
                            t.hero
                              .stayUpdated
                          }
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {
                            t.hero
                              .stayUpdatedDescription
                          }
                        </p>

                      </div>

                    </div>

                    <div className="mt-5 flex items-center justify-between rounded-2xl bg-white/10 px-5 py-4 backdrop-blur">

                      <div className="flex items-center gap-3">

                        <Globe2 size={20} />

                        <div>

                          <p className="text-xs text-blue-100">
                            {
                              t.hero
                                .availableLanguages
                            }
                          </p>

                          <p className="text-sm font-semibold">
                            English · සිංහල · தமிழ்
                          </p>

                        </div>

                      </div>

                      <ShieldCheck
                        size={24}
                      />

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

              <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
                {t.features.label}
              </p>

              <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                {t.features.title}
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                {
                  t.features
                    .description
                }
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
                      className="group rounded-2xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-100"
                    >

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                        <Icon size={23} />
                      </div>

                      <h3 className="mt-5 text-lg font-bold text-slate-900">
                        {feature.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {
                          feature.description
                        }
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
          className="bg-slate-50 py-24"
        >

          <div className="mx-auto max-w-7xl px-5 lg:px-8">

            <div className="mx-auto max-w-2xl text-center">

              <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
                {t.process.label}
              </p>

              <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                {t.process.title}
              </h2>

              <p className="mt-4 text-slate-600">
                {
                  t.process
                    .description
                }
              </p>

            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

              {steps.map((step) => {
                const Icon =
                  step.icon;

                return (
                  <div
                    key={step.number}
                    className="relative rounded-2xl border border-slate-200 bg-white p-7"
                  >

                    <span className="absolute right-5 top-4 text-4xl font-black text-slate-100">
                      {step.number}
                    </span>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                      <Icon size={23} />
                    </div>

                    <h3 className="mt-5 text-lg font-bold">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {
                        step.description
                      }
                    </p>

                  </div>
                );
              })}

            </div>

          </div>

        </section>

        {/* ==================================================
            MULTILINGUAL SECTION
        ================================================== */}

        <section className="bg-white py-24">

          <div className="mx-auto max-w-7xl px-5 lg:px-8">

            <div className="grid items-center gap-14 lg:grid-cols-2">

              <div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Languages size={28} />
                </div>

                <h2 className="mt-6 text-4xl font-bold tracking-tight">
                  {
                    t.languageSection
                      .title
                  }
                </h2>

                <p className="mt-5 max-w-xl leading-7 text-slate-600">
                  {
                    t.languageSection
                      .description
                  }
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
                          className="text-emerald-500"
                        />

                        <span className="text-sm font-medium text-slate-700">
                          {item}
                        </span>
                      </div>
                    )
                  )}

                </div>

              </div>

              <div className="grid gap-4 sm:grid-cols-3">

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7 text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    EN
                  </p>

                  <p className="mt-2 font-semibold">
                    {
                      t.languageSection
                        .english
                    }
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7 text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    සිං
                  </p>

                  <p className="mt-2 font-semibold">
                    {
                      t.languageSection
                        .sinhala
                    }
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7 text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    தமிழ்
                  </p>

                  <p className="mt-2 font-semibold">
                    {
                      t.languageSection
                        .tamil
                    }
                  </p>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ==================================================
            ABOUT
        ================================================== */}

        <section
          id="about"
          className="bg-slate-950 py-24 text-white"
        >

          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">

            <div>

              <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                {t.about.label}
              </p>

              <h2 className="mt-3 text-4xl font-bold leading-tight">
                {t.about.title}
              </h2>

              <p className="mt-5 max-w-xl leading-7 text-slate-400">
                {
                  t.about
                    .description
                }
              </p>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

                <Clock3 className="text-blue-400" />

                <h3 className="mt-4 font-bold">
                  {
                    t.about
                      .efficientTitle
                  }
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {
                    t.about
                      .efficientDescription
                  }
                </p>

              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

                <ShieldCheck className="text-blue-400" />

                <h3 className="mt-4 font-bold">
                  {
                    t.about
                      .transparentTitle
                  }
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {
                    t.about
                      .transparentDescription
                  }
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ==================================================
            CTA
        ================================================== */}

        <section className="bg-blue-600 py-16">

          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-7 px-5 text-center md:flex-row md:text-left lg:px-8">

            <div>

              <h2 className="text-3xl font-bold text-white">
                {t.cta.title}
              </h2>

              <p className="mt-2 text-blue-100">
                {
                  t.cta
                    .description
                }
              </p>

            </div>

            <Link
              to="/register"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-blue-600 shadow-lg transition hover:-translate-y-0.5"
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

            {/* Footer Brand */}
            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <BrainCircuit size={22} />
                </div>

                <div>

                  <p className="font-bold">
                    {t.brand.title}
                  </p>

                  <p className="text-xs text-blue-600">
                    {t.brand.subtitle}
                  </p>

                </div>

              </div>

              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
                {
                  t.footer
                    .description
                }
              </p>

            </div>

            {/* Quick Links */}
            <div>

              <h3 className="font-bold">
                {t.footer.quickLinks}
              </h3>

              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">

                <button
                  type="button"
                  onClick={() =>
                    scrollToSection(
                      "features"
                    )
                  }
                  className="w-fit hover:text-blue-600"
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
                  className="w-fit hover:text-blue-600"
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
                  className="w-fit hover:text-blue-600"
                >
                  {t.nav.about}
                </button>

              </div>

            </div>

            {/* Footer Language Selector */}
            <div>

              <h3 className="font-bold">
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
                          ? "border-blue-600 bg-blue-50 text-blue-600"
                          : "border-slate-200 text-slate-500"
                      }`}
                    >
                      {item.label}
                    </button>
                  )
                )}

              </div>

            </div>

          </div>

          <div className="mt-10 border-t border-slate-200 pt-6 text-center text-sm text-slate-400">
            {
              t.footer
                .copyright
            }
          </div>

        </div>

      </footer>

    </div>
  );
}

export default HomePage;