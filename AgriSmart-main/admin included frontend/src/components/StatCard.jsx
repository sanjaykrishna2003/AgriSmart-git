function StatCard({ title, value, icon, className = "" }) {
  return (
    <div className={`stat-card ${className}`}>
      
      <div className="stat-icon">
        {icon}
      </div>

      <div className="stat-content">
        <p>{title}</p>

        <h2>{value}</h2>
      </div>

    </div>
  );
}

export default StatCard;
