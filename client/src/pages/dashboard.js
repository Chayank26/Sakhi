import { FaBriefcase, FaUsers, FaComments, FaShieldAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="container">

      <h2>Welcome to Sakhi</h2>
      <p style={{ color: "black" }}>Sakhi is a digital platform designed to empower women by providing access
          to job opportunities, government schemes, community support, and verified
          resources in a safe and inclusive environment.</p>

      <div className="grid">

        <div className="card" onClick={()=>navigate("/jobs")}>
          <FaBriefcase size={30} />
          <h3>Jobs</h3>
          <p>Explore job opportunities</p>
        </div>

        <div className="card" onClick={()=>navigate("/govtschemes")}>
          <FaUsers size={30} />
          <h3>Schemes</h3>
          <p>Access government schemes</p>
        </div>

        <div className="card" onClick={()=>navigate("/forum")}>
          <FaComments size={30} />
          <h3>Community</h3>
          <p>Join discussions</p>
        </div>

        <div className="card" onClick={()=>navigate("/resources")}>
          <FaShieldAlt size={30} />
          <h3>Resources</h3>
          <p>Verified support services</p>
        </div>

        <div className="card" onClick={() => navigate("/chatbot")} style={{ gridColumn: "span 2", margin: "0 auto", padding: "10px 20px", height: "70px", display: "flex", alignItems: "center", justifyContent: "center", marginLeft:"0", width:"1000px" }}>
          <FaComments size={30} />
          <h3>Talk to a Sakhi</h3>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;