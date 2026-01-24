import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:5000/api/jobs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setJobs(res.data);
      } catch (err) {
        console.error("error fetching jobs", err);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>job opportunities</h2>
        <button onClick={() => navigate("/postjob")}>post a job</button>
      </div>

      <div style={{ marginTop: "40px" }}>
        {jobs.length === 0 && <p>no jobs available</p>}

        {jobs.map((job) => (
          <div
            key={job._id}
            style={{
              border: "1px solid black",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <h3>{job.title}</h3>
            <p>
              <strong>company:</strong> {job.company}
            </p>
            <p>
              <strong>location:</strong> {job.location}
            </p>
            <p>{job.description}</p>

            <button onClick={() => navigate(`/applyjob/${job._id}`)}>
              apply
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Jobs;
