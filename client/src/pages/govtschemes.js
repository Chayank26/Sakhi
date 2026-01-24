import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import schemes from "../data/schemes";

function Govtschemes() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [eligibility, setEligibility] = useState("");

  if (!token) {
    navigate("/login");
  }

  const filteredSchemes = schemes.filter((scheme) => {
    const matchesSearch =
      scheme.name.toLowerCase().includes(search.toLowerCase()) ||
      scheme.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = category ? scheme.category === category : true;
    const matchesEligibility = eligibility
      ? scheme.eligibility === eligibility
      : true;

    return matchesSearch && matchesCategory && matchesEligibility;
  });

  return (
    <div style={{ display: "flex", padding: "30px" }}>
      {/* Sidebar Filters */}
      <div
        style={{
          width: "250px",
          borderRight: "2px solid black",
          paddingRight: "20px",
        }}
      >
        <h3>filters</h3>

        <div>
          <h4>category</h4>
          <div>
            <input
              type="radio"
              name="category"
              onChange={() => setCategory("education")}
            />{" "}
            education
          </div>
          <div>
            <input
              type="radio"
              name="category"
              onChange={() => setCategory("health")}
            />{" "}
            health
          </div>
          <div>
            <input
              type="radio"
              name="category"
              onChange={() => setCategory("employment")}
            />{" "}
            employment
          </div>
          <div>
            <input
              type="radio"
              name="category"
              onChange={() => setCategory("safety")}
            />{" "}
            safety
          </div>
          <button onClick={() => setCategory("")}>clear category</button>
        </div>

        <div style={{ marginTop: "30px" }}>
          <h4>eligibility</h4>
          <div>
            <input
              type="radio"
              name="eligibility"
              onChange={() => setEligibility("students")}
            />{" "}
            students
          </div>
          <div>
            <input
              type="radio"
              name="eligibility"
              onChange={() => setEligibility("working women")}
            />{" "}
            working women
          </div>
          <div>
            <input
              type="radio"
              name="eligibility"
              onChange={() => setEligibility("mothers")}
            />{" "}
            mothers
          </div>
          <button onClick={() => setEligibility("")}>
            clear eligibility
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, paddingLeft: "40px" }}>
        <h2>government schemes</h2>

        {/* Search */}
        <input
          type="text"
          placeholder="search schemes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "10px",
            width: "300px",
            marginBottom: "30px",
          }}
        />

        {/* Schemes */}
        {filteredSchemes.length === 0 && <p>no schemes found</p>}

        {filteredSchemes.map((scheme) => (
          <div
            key={scheme.id}
            style={{
              border: "1px solid black",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <h3>{scheme.name}</h3>
            <p>{scheme.description}</p>
            <p>
              <strong>category:</strong> {scheme.category}
            </p>
            <p>
              <strong>eligibility:</strong> {scheme.eligibility}
            </p>
            <button onClick={() => window.open(scheme.link, "_blank")}>
              view official website
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Govtschemes;
