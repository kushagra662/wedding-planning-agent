
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  ArrowUpRight,
  Menu,
  X,
  Sparkles,
  MapPin,
  Users,
  CalendarDays,
  Wallet,
  Camera,
  Utensils,
  Flower2,
  Building2,
  Heart,
  CheckCircle2,
  LoaderCircle,
  Bot,
  FileText,
} from "lucide-react";

// ==========================================
// WEDWISE AI SERVICES
// ==========================================

const services = [
  {
    icon: Building2,
    number: "01",
    title: "Venue Selection",
    description:
      "Discover beautiful venues that match your celebration and guest list.",
  },
  {
    icon: Utensils,
    number: "02",
    title: "Catering & Cuisine",
    description:
      "Create memorable menus with food experiences your guests will love.",
  },
  {
    icon: Flower2,
    number: "03",
    title: "Wedding Decor",
    description:
      "Bring your dream wedding theme to life with thoughtful details.",
  },
  {
    icon: Camera,
    number: "04",
    title: "Photography",
    description:
      "Capture every emotion, ritual and unforgettable moment.",
  },
  {
    icon: Wallet,
    number: "05",
    title: "Smart Budgeting",
    description:
      "Plan your celebration with a clear and organized budget.",
  },
  {
    icon: CalendarDays,
    number: "06",
    title: "Event Schedule",
    description:
      "Keep every ceremony and celebration perfectly coordinated.",
  },
];


// ==========================================
// AGENT DISPLAY NAMES
// ==========================================

const agentNames = {
  venue: "Venue Agent",
  catering: "Catering Agent",
  decoration: "Decoration Agent",
  photography: "Photography Agent",
  budget: "Budget Agent",
  schedule: "Schedule Agent",
};


// ==========================================
// MAIN APPLICATION
// ==========================================

function App() {
  // Navigation
  const [menuOpen, setMenuOpen] = useState(false);

  // API states
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState("");
  const [results, setResults] = useState(null);
  const [demoMode, setDemoMode] = useState(false);

  // Customer wedding form
  const [form, setForm] = useState({
    name: "",
    email: "",
    city: "Indore",
    guests: "200",
    budget: "10–15 Lakhs",
    date: "",
    food_preference: "Vegetarian",
    decoration_preference: "Traditional",
    photography_preference: "Candid and cinematic",
    events: [
      "Haldi",
      "Mehendi",
      "Wedding",
      "Reception",
    ],
  });


  // ========================================
  // UPDATE FORM
  // ========================================

  const updateForm = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };


  // ========================================
  // NAVIGATION
  // ========================================

  const closeMenu = () => {
    setMenuOpen(false);
  };


  // ========================================
  // CONNECT REACT TO FASTAPI
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setApiError("");
    setResults(null);
    setSubmitted(false);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/plan-wedding",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail || data)
        );
      }

      if (!data.agent_results) {
        throw new Error(
          "The server did not return agent results."
        );
      }

      setResults(data.agent_results);
      setDemoMode(Boolean(data.demo_mode));
      setSubmitted(true);

    } catch (error) {
      console.error("WedWise API Error:", error);

      setApiError(
        error.message ||
          "Something went wrong. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };


  // ========================================
  // RESET WEDDING PLAN
  // ========================================

  const resetForm = () => {
    setSubmitted(false);
    setResults(null);
    setDemoMode(false);
    setApiError("");
  };


  // ========================================
  // MAIN UI
  // ========================================

  return (
    <div className="website">

      {/* ==================================
          NAVIGATION
      ================================== */}

      <header className="navbar">

        <a
          href="#home"
          className="brand"
          onClick={closeMenu}
        >
          <span className="brand-icon">W.</span>

          <span>
            <strong>WEDWISE</strong>
            <small>YOUR DAY. YOUR STORY.</small>
          </span>
        </a>


        <button
          className="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>


        <nav
          className={
            menuOpen
              ? "nav-links open"
              : "nav-links"
          }
        >
          <a href="#home" onClick={closeMenu}>
            Home
          </a>

          <a href="#about" onClick={closeMenu}>
            Our Story
          </a>

          <a href="#services" onClick={closeMenu}>
            Services
          </a>

          <a href="#planner" onClick={closeMenu}>
            Plan Your Wedding
          </a>

          <a href="#contact" onClick={closeMenu}>
            Contact
          </a>
        </nav>


        <a
          className="nav-cta"
          href="#planner"
        >
          Start Planning
          <ArrowUpRight size={16} />
        </a>

      </header>


      <main>

        {/* ==================================
            HERO SECTION
        ================================== */}

        <section className="hero" id="home">
        <img
  className="hero-image"
  src="/images/wedding-mandap.jpeg"
  alt="Beautiful Indian wedding mandap"
/>
          <div className="hero-overlay"></div>

          <div className="hero-content">

            <div className="eyebrow hero-eyebrow">
              <Sparkles size={15} />

              YOUR DREAM WEDDING, BEAUTIFULLY PLANNED
            </div>


            <h1>
              Every love story
              <br />

              deserves a <em>beautiful</em>
              <br />

              beginning.
            </h1>


            <p>
              From the first idea to the final celebration,
              let intelligent planning and thoughtful details
              make your wedding truly unforgettable.
            </p>


            <div className="hero-actions">

              <a
                href="#planner"
                className="primary-button"
              >
                Plan Your Wedding
                <ArrowUpRight size={17} />
              </a>

              <a
                href="#services"
                className="text-button"
              >
                Explore Our Services
              </a>

            </div>


            <div className="hero-note">
              <Heart size={15} />

              Thoughtfully planned. Beautifully celebrated.
            </div>

          </div>


          <div className="hero-side-label">
            WEDDINGS MADE MEMORABLE
          </div>


          <div className="hero-bottom">
            <span>01 / 03</span>

            <span>
              CELEBRATE LOVE, THE WEDWISE WAY
            </span>

            <span>SCROLL TO EXPLORE ↓</span>
          </div>

        </section>


        {/* ==================================
            INTRODUCTION
        ================================== */}

        <section
          className="intro section-padding"
          id="about"
        >

         <div className="intro-image">
 <img
  src="/images/wedding-ceremony.jpeg"
  alt="Beautiful Indian wedding ceremony"
  onError={(e) => console.error("Image failed to load:", e.currentTarget.src)}
/>
  <div className="image-caption">
    <span>THE ART OF CELEBRATION</span>
    <strong>Made for your forever.</strong>
  </div>
</div>

          <div className="intro-content">

            <div className="eyebrow">
              <span className="eyebrow-line"></span>

              WELCOME TO WEDWISE
            </div>


            <h2>
              More than planning.
              <br />

              It's about creating
              <br />

              <em>memories.</em>
            </h2>


            <p>
              Your wedding is one of life's most meaningful
              celebrations. WedWise brings together thoughtful
              planning and AI-powered assistance to help you
              organize every detail with confidence.
            </p>


            <p>
              From choosing the perfect venue to coordinating
              your final ceremony, your wedding journey begins here.
            </p>


            <a
              href="#planner"
              className="underlined-link"
            >
              Begin your journey
              <ArrowUpRight size={17} />
            </a>

          </div>

        </section>


        {/* ==================================
            SERVICES
        ================================== */}

        <section
          className="services section-padding"
          id="services"
        >

          <div className="section-heading">

            <div className="eyebrow">
              <span className="eyebrow-line"></span>

              THE WEDWISE EXPERIENCE
            </div>


            <h2>
              Every detail,
              <br />

              <em>thoughtfully handled.</em>
            </h2>


            <p>
              Six specialized AI planning assistants help bring
              every part of your wedding together.
            </p>

          </div>


          <div className="service-grid">

            {services.map((service) => {

              const Icon = service.icon;

              return (

                <article
                  className="service-card"
                  key={service.number}
                >

                  <div className="service-top">

                    <span>{service.number}</span>

                    <Icon
                      size={25}
                      strokeWidth={1.3}
                    />

                  </div>


                  <h3>{service.title}</h3>


                  <p>{service.description}</p>


                  <a href="#planner">
                    Explore
                    <ArrowUpRight size={16} />
                  </a>

                </article>

              );

            })}

          </div>

        </section>


        {/* ==================================
            CUSTOMER WEDDING PLANNER
        ================================== */}

        <section
          className="planner-section section-padding"
          id="planner"
        >

          <div className="planner-intro">

            <div className="eyebrow">
              <span className="eyebrow-line"></span>

              LET'S CREATE SOMETHING BEAUTIFUL
            </div>


            <h2>
              Your forever
              <br />

              starts <em>here.</em>
            </h2>


            <p>
              Tell us a little about your celebration.
              Our AI wedding-planning team will help you
              create a personalized wedding plan.
            </p>


            <div className="planner-feature">
              <CheckCircle2 size={18} />

              Personalized wedding recommendations
            </div>


            <div className="planner-feature">
              <CheckCircle2 size={18} />

              Budget and expense planning
            </div>


            <div className="planner-feature">
              <CheckCircle2 size={18} />

              A complete event schedule
            </div>


            <div className="planner-feature">
              <Bot size={18} />

              Seven AI agents working together
            </div>

          </div>


          {/* ==================================
              FORM AND RESULTS CARD
          ================================== */}

          <div className="planner-form-card">


            {/* LOADING SCREEN */}

            {loading ? (

              <div className="success-message">

                <LoaderCircle
                  size={48}
                  className="loading-spinner"
                />

                <h3>
                  Planning your dream wedding...
                </h3>

                <p>
                  Your WedWise AI agents are working together
                  to prepare venue, catering, decoration,
                  photography, budget and schedule recommendations.
                </p>

                <p>
                  Please wait while Gemini generates your wedding plan.
                </p>

              </div>


            ) : submitted && results ? (

              /* ==================================
                 AI RESULTS
              ================================== */

              <div className="results-container">

                {demoMode && (
                  <div
                    role="status"
                    style={{
                      margin: "0 0 18px",
                      padding: "13px 16px",
                      border: "1px solid #d8b987",
                      borderRadius: "8px",
                      background: "#fff7e9",
                      color: "#704b25",
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                    }}
                  >
                    DEMO MODE — SAMPLE DATA
                    <div style={{ fontWeight: 400, letterSpacing: 0, marginTop: 4 }}>
                      Gemini quota or availability was limited. These are simulated planning
                      recommendations, not live vendor quotes or confirmed bookings.
                    </div>
                  </div>
                )}

                <div className="success-message">

                  <CheckCircle2 size={46} />

                  <h3>
                    Your wedding plan is ready!
                  </h3>

                  <p>
                    Thank you, {form.name}.
                    Your WedWise AI planning team has completed
                    its recommendations.
                  </p>

                </div>


                {/* FINAL REPORT */}

                <div className="final-report">

                  <div className="report-heading">

                    <FileText size={22} />

                    <h3>
                      Final Wedding Report
                    </h3>

                  </div>


                  <article className="report-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {results.final_report || "Final report unavailable."}
                    </ReactMarkdown>
                  </article>

                </div>


                {/* INDIVIDUAL AGENT RESULTS */}

                <h3 className="agent-results-heading">
                  {demoMode ? "Individual Agent Results (Demo)" : "Individual AI Agent Results"}
                </h3>


                {Object.entries(agentNames).map(
                  ([key, title]) => (

                    <details
                      className="agent-result"
                      key={key}
                    >

                      <summary>
                        <Bot size={17} />

                        {title}
                      </summary>


                      <pre>
                        {results[key] ||
                          "No result available for this agent."}
                      </pre>

                    </details>

                  )
                )}


                {/* RESET */}

                <button
                  className="primary-button"
                  onClick={resetForm}
                >
                  Plan Another Wedding
                  <ArrowUpRight size={17} />
                </button>

              </div>


            ) : (

              /* ==================================
                 CUSTOMER FORM
              ================================== */

              <>

                <div className="form-heading">

                  <span>YOUR CELEBRATION</span>

                  <h3>Let's start planning.</h3>

                  <p>
                    Share a few details to get started.
                  </p>

                </div>


                <form onSubmit={handleSubmit}>

                  {/* CUSTOMER NAME */}

                  <div className="form-field">

                    <label htmlFor="name">
                      Your name
                    </label>

                    <input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={updateForm}
                      placeholder="Enter your name"
                      required
                    />

                  </div>


                  {/* EMAIL */}

                  <div className="form-field">

                    <label htmlFor="email">
                      Email address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={updateForm}
                      placeholder="you@example.com"
                      required
                    />

                  </div>


                  {/* CITY AND GUESTS */}

                  <div className="form-row">

                    <div className="form-field">

                      <label htmlFor="city">
                        Wedding city
                      </label>

                      <div className="input-icon">

                        <MapPin size={16} />

                        <input
                          id="city"
                          name="city"
                          value={form.city}
                          onChange={updateForm}
                          placeholder="City"
                          required
                        />

                      </div>

                    </div>


                    <div className="form-field">

                      <label htmlFor="guests">
                        Guest count
                      </label>

                      <div className="input-icon">

                        <Users size={16} />

                        <select
                          id="guests"
                          name="guests"
                          value={form.guests}
                          onChange={updateForm}
                        >
                          <option value="50">
                            Below 50
                          </option>

                          <option value="100">
                            50–100
                          </option>

                          <option value="200">
                            100–200
                          </option>

                          <option value="500">
                            200–500
                          </option>

                          <option value="1000">
                            500–1000
                          </option>

                          <option value="1000+">
                            Above 1000
                          </option>

                        </select>

                      </div>

                    </div>

                  </div>


                  {/* BUDGET AND DATE */}

                  <div className="form-row">

                    <div className="form-field">

                      <label htmlFor="budget">
                        Estimated budget
                      </label>

                      <div className="input-icon">

                        <Wallet size={16} />

                        <select
                          id="budget"
                          name="budget"
                          value={form.budget}
                          onChange={updateForm}
                        >

                          <option>Below 5 Lakhs</option>

                          <option>5–10 Lakhs</option>

                          <option>10–15 Lakhs</option>

                          <option>15–25 Lakhs</option>

                          <option>25–50 Lakhs</option>

                          <option>Above 50 Lakhs</option>

                        </select>

                      </div>

                    </div>


                    <div className="form-field">

                      <label htmlFor="date">
                        Wedding date
                      </label>

                      <div className="input-icon">

                        <CalendarDays size={16} />

                        <input
                          id="date"
                          name="date"
                          type="date"
                          value={form.date}
                          onChange={updateForm}
                        />

                      </div>

                    </div>

                  </div>


                  {/* FOOD PREFERENCE */}

                  <div className="form-field">

                    <label htmlFor="food_preference">
                      Food preference
                    </label>

                    <select
                      id="food_preference"
                      name="food_preference"
                      value={form.food_preference}
                      onChange={updateForm}
                    >

                      <option value="Vegetarian">
                        Vegetarian
                      </option>

                      <option value="Non-vegetarian">
                        Non-vegetarian
                      </option>

                      <option value="Both vegetarian and non-vegetarian">
                        Both
                      </option>

                    </select>

                  </div>


                  {/* DECORATION PREFERENCE */}

                  <div className="form-field">

                    <label htmlFor="decoration_preference">
                      Decoration preference
                    </label>

                    <select
                      id="decoration_preference"
                      name="decoration_preference"
                      value={form.decoration_preference}
                      onChange={updateForm}
                    >

                      <option value="Traditional">
                        Traditional
                      </option>

                      <option value="Royal">
                        Royal
                      </option>

                      <option value="Modern">
                        Modern
                      </option>

                      <option value="Floral">
                        Floral
                      </option>

                      <option value="Minimal">
                        Minimal
                      </option>

                    </select>

                  </div>


                  {/* PHOTOGRAPHY PREFERENCE */}

                  <div className="form-field">

                    <label htmlFor="photography_preference">
                      Photography preference
                    </label>

                    <select
                      id="photography_preference"
                      name="photography_preference"
                      value={form.photography_preference}
                      onChange={updateForm}
                    >

                      <option value="Candid and cinematic">
                        Candid and cinematic
                      </option>

                      <option value="Traditional">
                        Traditional
                      </option>

                      <option value="Candid">
                        Candid
                      </option>

                      <option value="Cinematic">
                        Cinematic video
                      </option>

                    </select>

                  </div>


                  {/* EVENTS */}

                  <div className="form-field">

                    <label>
                      Wedding events
                    </label>

                    <div className="event-options">

                      {[
                        "Haldi",
                        "Mehendi",
                        "Wedding",
                        "Reception",
                      ].map((eventName) => (

                        <label
                          className="event-option"
                          key={eventName}
                        >

                          <input
                            type="checkbox"
                            checked={form.events.includes(eventName)}
                            onChange={(event) => {

                              setForm((previousForm) => ({

                                ...previousForm,

                                events: event.target.checked

                                  ? [
                                      ...previousForm.events,
                                      eventName,
                                    ]

                                  : previousForm.events.filter(
                                      (item) => item !== eventName
                                    ),

                              }));

                            }}
                          />

                          {eventName}

                        </label>

                      ))}

                    </div>

                  </div>


                  {/* API ERROR */}

                  {apiError && (

                    <div className="api-error">

                      <strong>
                        Unable to generate your wedding plan
                      </strong>

                      <p>{apiError}</p>

                    </div>

                  )}


                  {/* SUBMIT BUTTON */}

                  <button
                    type="submit"
                    className="primary-button submit-button"
                    disabled={loading}
                  >

                    Create My Wedding Plan

                    <ArrowUpRight size={18} />

                  </button>


                  <p className="form-disclaimer">
                    Your details will be used to prepare
                    your personalized wedding plan.
                  </p>

                </form>

              </>

            )}

          </div>

        </section>


        {/* ==================================
            CLOSING BANNER
        ================================== */}

        <section
          className="closing-banner"
          id="contact"
        >

          <div className="closing-overlay"></div>

          <div className="closing-content">

            <span>
              YOUR STORY. YOUR CELEBRATION.
            </span>


            <h2>
              Let's make your
              <br />

              day <em>unforgettable.</em>
            </h2>


            <a
              href="#planner"
              className="light-button"
            >
              Start Your Wedding Journey

              <ArrowUpRight size={17} />
            </a>

          </div>

        </section>

      </main>


      {/* ==================================
          FOOTER
      ================================== */}

      <footer className="footer">

        <a
          href="#home"
          className="brand footer-brand"
        >

          <span className="brand-icon">
            W.
          </span>

          <span>
            <strong>WEDWISE</strong>

            <small>
              YOUR DAY. YOUR STORY.
            </small>
          </span>

        </a>


        <p>
          Thoughtfully planned. Beautifully celebrated.
        </p>


        <span className="copyright">
          © {new Date().getFullYear()} WedWise.
          All rights reserved.
        </span>

      </footer>

    </div>
  );
}

export default App;
