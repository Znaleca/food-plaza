import React, { useState } from 'react';

const UpdateTeamButton = ({ userId, currentTeams, availableTeams, onUpdate }) => {
  const [selectedTeam, setSelectedTeam] = useState(currentTeams[0] || ''); // Default to first team if available

  const handleTeamChange = (e) => {
    setSelectedTeam(e.target.value); // Update the selected team state
  };

  const handleUpdate = () => {
    if (selectedTeam) {
      onUpdate(userId, selectedTeam); // Call the parent component's onUpdate function
    }
  };

  if (!Array.isArray(availableTeams)) {
    return <div className="text-red-600">Error: Available teams data is invalid.</div>;
  }

  return (
    <div>
      <select
        value={selectedTeam}
        onChange={handleTeamChange}
        className="border rounded p-2"
      >
        {availableTeams.map((team, index) => (
          <option key={index} value={team}>
            {team}
          </option>
        ))}
      </select>
      <button
        onClick={handleUpdate}
        className="ml-2 p-2 bg-blue-500 text-white rounded"
      >
        Update
      </button>
    </div>
  );
};

export default UpdateTeamButton;
