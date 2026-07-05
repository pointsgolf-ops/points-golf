"use client";

import { useEffect, useState } from "react";
import { useRef } from "react";

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
    document.body.style.overflow = showScorecard ? "hidden" : "";
  }, [showScorecard]);

  return (
    <div style={outer}>
      <div style={device}>

        {/* HEADER */}
        <div style={headerWrap}>
          <div style={header}>
            <div style={title}><img src="/points-logo.svg" style={{ height: 50 }} /></div>

            {/* SCORECARD BUTTON (ONLY IN-GAME USAGE EXPECTED) */}
            {showScorecardButton && (
  <button
    onClick={() => setShowScorecard(true)}
    style={button}
  >
    View Scorecard
  </button>

  
)}

{showFAQButton && (
  <button
    onClick={() => setShowFAQ(true)}
    style={button}
  >
    Help
  </button>
)}

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
      style={backdrop}
    />

    {/* BOTTOM SHEET */}
    <div style={sheet}>

      <button
        onClick={() => setShowScorecard(false)}
        style={close}
      >
        Close
      </button>

      <h2 style={{ fontSize: 20, fontWeight: 800 }}>
        Your Scorecard
      </h2>

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
      style={backdrop}
    />

    <div style={sheet}>
      <button
        onClick={() => setShowFAQ(false)}
        style={close}
      >
        Close
      </button>

      <h2 style={{ fontSize: 20, fontWeight: 800 }}>
        Frequently Asked Questions
      </h2>

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
    background: "#fcf4e3",
    display: "flex",
    justifyContent: "center",
  };
  
  const device: React.CSSProperties = {
    width: "100%",
    maxWidth: 440,
    background: "#fcf4e3",
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
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "18px 16px",
};

const title: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
};

const button: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 600,
  background: "transparent",
  border: "none",
  opacity: 0.5,
};

const content: React.CSSProperties = {
    paddingTop: 80,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
    boxSizing: "border-box",
  };

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "#fcf5ed",
  zIndex: 2000,
  overflowY: "auto",
};

const overlayInner: React.CSSProperties = {
  maxWidth: 440,
  margin: "0 auto",
  padding: "80px 16px 40px",
};

const close: React.CSSProperties = {
  position: "absolute",
  top: 20,
  right: 20,
  fontSize: 20,
  opacity: 0.5,
  fontWeight: 600,
  border: "none",
  background: "transparent",
};

const row: React.CSSProperties = {
  padding: "14px 0",
  borderBottom: "1px solid #000",
  fontSize: 16,
};

const backdrop: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    zIndex: 2000,
    animation: "fadeIn 0.5s ease",
  };
  
  const sheet: React.CSSProperties = {
    position: "fixed",
    left: "50%",
    bottom: 20,          
    transform: "translateX(-50%)",
    width: "calc(100% - 10px)",
    maxWidth: 440,        
    maxHeight: "85vh",
    background: "#fff",
    borderRadius: 20,    
    padding: "20px 24px 40px",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    zIndex: 2100,
    animation: "slideUp 0.25s ease",
  };

  const faqContainer: React.CSSProperties = {
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    fontSize: 18,
    lineHeight: 1.3,
  };