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
  padding: 20,
  marginBottom: 14,
};