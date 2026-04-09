import React, { useState } from "react";
import resources from "../data/resources";

function Resources() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    "all",
    "helpline",
    "legal aid",
    "mental health",
    "domestic violence",
    "cybercrime",
  ];

  const filteredResources = resources.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      selectedCategory === "all" || r.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  return (
    <div style={{ padding: "40px" }}>
      <h2>verified resource directory</h2>
      <p style={{ marginTop: "10px", color: "black" }}>
        trusted helplines, legal aid, ngo support, and emergency resources for
        women.
      </p>

      <div style={{ marginTop: "30px", display: "flex", gap: "20px" }}>
        <div style={{ width: "220px" }}>
          <h3>filters</h3>

          <label style={{ display: "block", marginTop: "15px" }}>
            category
          </label>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <label style={{ display: "block", marginTop: "20px" }}>
            search
          </label>

          <input
            type="text"
            placeholder="search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ flex: 1 }}>
          {filteredResources.length === 0 && <p>no resources found</p>}

          {filteredResources.map((r) => (
            <div
              key={r.id}
              style={{
                border: "1px solid black",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <h3>
                {r.name}{" "}
                {r.verified && (
                  <span style={{ fontSize: "14px" }}>✅ verified</span>
                )}
              </h3>

              <p style={{ marginTop: "10px", color: "black" }}>{r.description}</p>

              <p style={{ marginTop: "10px", color: "black" }}>
                <strong>phone:</strong> {r.phone}
              </p>

              <button
                style={{marginTop: "5px", background: "var(--gradient)", color: "white", padding: "8px 16px", borderRadius: "8px", fontWeight: "500", transition: "0.3s"}}
                onClick={() => window.open(r.website, "_blank")}
              >
                official website
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Resources;
