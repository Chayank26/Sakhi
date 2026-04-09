import { useNavigate } from "react-router-dom";
import { FaBriefcase, FaUsers, FaComments, FaShieldAlt } from "react-icons/fa";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ display: "flex", flexDirection: "column", height: "100vh", padding: 0 }}>

      <div className="card" style={{ flex: "0 0 auto" }}>
        <h2>About Sakhi</h2>
        <p>
          Sakhi is a digital platform designed to empower women by providing access
          to job opportunities, government schemes, community support, and verified
          resources in a safe and inclusive environment.
        </p>
      </div>

      <div className="grid" style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0", height: "100%" }}>

        <div className="card" onClick={() => navigate("/jobs")} style={{ borderRadius: 0 }}>
          <FaBriefcase size={30} />
          <h3>Job Portal</h3>
        </div>

        <div className="card" onClick={() => navigate("/govtschemes")} style={{ borderRadius: 0 }}>
          <FaUsers size={30} />
          <h3>Govt Schemes</h3>
        </div>

        <div className="card" onClick={() => navigate("/forum")} style={{ borderRadius: 0 }}>
          <FaComments size={30} />
          <h3>Community Forum</h3>
        </div>

        <div className="card" onClick={() => navigate("/resources")} style={{ borderRadius: 0 }}>
          <FaShieldAlt size={30} />
          <h3>Resources</h3>
        </div>

        <div className="card" onClick={() => navigate("/chatbot")} style={{ gridColumn: "span 2", borderRadius: 0 }}>
          <FaComments size={30} />
          <h3>Talk to a Sakhi</h3>
        </div>

      </div>

    </div>
  );
}

export default Home;