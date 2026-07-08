"use client";

export default function GameCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="fadeUp" style={card}>{children}</div>;
}

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 18,
  border: "0.5px solid rgba(0,0,0,0.3)",
  padding: 20,
  marginBottom: 14,
};