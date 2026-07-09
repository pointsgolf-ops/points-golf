"use client";

import { useEffect, useState } from "react";
import { BookOpen, CircleHelp, X } from "lucide-react";

export default function AppShell({
    children,
    scorecard,
    faq,
    showScorecardButton = true,
    showFAQButton = false,
  }: {
    children: React.ReactNode;
    scorecard?: React.ReactNode;
    faq?: React.ReactNode;
    showScorecardButton?: boolean;
    showFAQButton?: boolean;
  }) {

  const [showScorecard, setShowScorecard] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);

  useEffect(() => {
    document.body.style.overflow =
      showScorecard || showFAQ ? "hidden" : "";
  
    return () => {
      document.body.style.overflow = "";
    };
  }, [showScorecard, showFAQ]);

  return (
    <div style={outer}>
      <div style={device}>

        {/* HEADER */}
<div style={headerWrap}>
  <div style={header}>

    {/* LEFT ICON */}
    <div style={headerSide}>
      {showScorecardButton && (
        <button
          onClick={() => setShowScorecard(true)}
          style={iconButton}
          aria-label="View scorecard"
        >
          <BookOpen size={26} />
        </button>
      )}
    </div>


    {/* CENTRE LOGO */}
    <div style={logo}>
      <img
        src="/points-logo.svg"
        style={{ height: 60 }}
      />
    </div>


    {/* RIGHT ICON */}
    <div style={headerSide}>
      {showFAQButton && (
        <button
          onClick={() => setShowFAQ(true)}
          style={iconButton}
          aria-label="Help"
        >
          <CircleHelp size={26} />
        </button>
      )}
    </div>

  </div>
</div>

        {/* PAGE CONTENT */}
        <div style={content}>{children}</div>

        {/* SCORECARD OVERLAY (SINGLE PLAYER ONLY) */}
        {showScorecard && (
  <>
    {/* BACKDROP */}
    <div
      onClick={() => setShowScorecard(false)}
      
    />

    {/* BOTTOM SHEET */}
    <div style={sheet}>

    <div style={sheetHeader}>
  <h2 style={sheetTitle}>
    Your Scorecard
  </h2>

  <button
    onClick={() => setShowScorecard(false)}
    style={close}
    aria-label="Close"
  >
    <X />
  </button>
</div>

      <div
  style={{
    marginTop: 20,
    width: "100%",
  }}
>
  {scorecard}

</div>
    </div>
  </>
)}

{showFAQ && (
  <>
    <div
      onClick={() => setShowFAQ(false)}
      
    />

    <div style={sheet}>
    <div style={sheetHeader}>
  <h2 style={sheetTitle}>
    Frequently Asked Questions
  </h2>

  <button
    onClick={() => setShowFAQ(false)}
    style={close}
    aria-label="Close"
  >
    <X />
  </button>
</div>

      <div style={faqContainer}>
  {faq}
</div>
    </div>
  </>
)}

      </div>
    </div>
  );
}

/* -----------------------------
   STYLES
----------------------------- */

const outer: React.CSSProperties = {
    minHeight: "100vh",
    background: "#FBFBFB",
    display: "flex",
    justifyContent: "center",
  };
  
  const device: React.CSSProperties = {
    width: "100%",
    maxWidth: 440,
    background: "#FBFBFB",
    minHeight: "100vh",
    position: "relative",
  };

  const headerWrap: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 440,
    zIndex: 1000,
    background: "none",
  };  

  const header: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "40px 1fr 40px",
    alignItems: "center",
    padding: "18px 16px",
  };
  
  
  const headerSide: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
  };
  
  
  const logo: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
  };
  
  
  const iconButton: React.CSSProperties = {
    width: 26,
    height: 26,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    opacity: 0.5,
    padding: 0,
  };

const content: React.CSSProperties = {
    paddingTop: 80,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
    boxSizing: "border-box",
  };

  const close: React.CSSProperties = {
    position: "absolute",
    top: 24,
    right: 20,
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.5,
    border: "none",
    background: "transparent",
    padding: 0,
  };

  const sheetHeader: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  };
  
  const sheetTitle: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 800,
    margin: 0,
    paddingRight: 16,
  };

const row: React.CSSProperties = {
  padding: "14px 0",
  borderBottom: "1px solid rgba(0,0,0,0.3)",
  fontSize: 16,
};
  
const sheet: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  left: "50%",
transform: "translateX(-50%)",
width: "100%",
maxWidth: 440,
  minHeight: "100vh",
  background: "#FBFBFB",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  zIndex: 2100,
  padding: "28px 20px 40px",
  boxSizing: "border-box",
};

  const faqContainer: React.CSSProperties = {
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    fontSize: 18,
    lineHeight: 1.3,
  };