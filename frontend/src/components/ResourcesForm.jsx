// src/components/ResourcesForm.jsx
import { useState } from "react";

const TOPICS = [
  { key: "hair_loss", label: "Hair loss" },
  { key: "yoga_exercises", label: "Yoga exercises" },
  { key: "pet_scan", label: "PET scan anxiety" },
  { key: "chemo_bored", label: "Chemo boredom" },
  { key: "nutrition", label: "Nutrition" },
  { key: "sleep", label: "Sleep difficulties" },
];

export default function ResourcesForm({ onSelect }) {
  const [selected, setSelected] = useState("");

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title">Choose a topic you’d like support with</h5>
        <div className="d-flex flex-column gap-2">
          {TOPICS.map((t) => (
            <button
              key={t.key}
              className={`btn ${selected === t.key ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => {
                setSelected(t.key);
                onSelect(t.key);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
