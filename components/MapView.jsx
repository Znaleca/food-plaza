'use client';

import { useState } from "react";

const MapView = () => {
  const [selectedMarker, setSelectedMarker] = useState(null);

  const markers = [
    { name: "Nursing", top: "19.08%", left: "78.47%", details: "Some extra details about Nursing.", image: "/images/Nursing.jpg" },
    { name: "Sari Gamit", top: "48.88%", left: "90.25%", details: "Some extra details about Sari Gamit.", image: "/images/Sarigamit.jpg" },
    { name: "Medina Lacson", top: "35.77%", left: "66.25%", details: "Some extra details about Medina Lacson.", image: "/images/Medina.jpg" },
    { name: "Admin", top: "76.90%", left: "78.47%", details: "Some extra details about Admin.", image: "/images/preview.jpg" },
    { name: "CCST", top: "41.43%", left: "51.83%", details: "Some extra details about CCST.", image: "/images/preview.jpg" },
    { name: "CEA", top: "46.20%", left: "10.90%", details: "Some extra details about CEA.", image: "/images/preview.jpg" },
    { name: "NCEA", top: "18.48%", left: "32.98%", details: "Some extra details about NCEA.", image: "/images/preview.jpg" },
    { name: "Architecture", top: "19.97%", left: "20.61%", details: "Some extra details about Architecture.", image: "/public/images/Medina.jpg" },
    { name: "Tourism", top: "40.54%", left: "37.10%", details: "Some extra details about Tourism.", image: "/images/preview.jpg" },
    { name: "Automotive Shop", top: "69.15%", left: "63.60%", details: "Some extra details about Automotive Shop.", image: "/images/preview.jpg" },
    { name: "Machine Shop 1", top: "49.18%", left: "78.92%", details: "Some extra details about Machine Shop 1.", image: "/images/preview.jpg" },
    { name: "Machine Shop 2", top: "66.17%", left: "78.77%", details: "Some extra details about Machine Shop 2.", image: "/images/preview.jpg" },
    { name: "Library", top: "33.08%", left: "80.09%", details: "Some extra details about Library.", image: "/images/preview.jpg" },
    { name: "College of Technology", top: "71.83%", left: "33.72%", details: "Some extra details about College of Technology.", image: "/images/preview.jpg" },
    { name: "Graduate School", top: "69.15%", left: "49.76%", details: "Some extra details about Graduate School.", image: "/images/preview.jpg" },
    { name: "Science Building", top: "70.04%", left: "6.48%", details: "Some extra details about Science Building.", image: "/images/preview.jpg" },
  ];

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  const closePopup = () => {
    setSelectedMarker(null);
  };

  const getPopupPosition = (marker) => {
    const offsetTop = parseFloat(marker.top);
    const offsetLeft = parseFloat(marker.left);

    let popupTop = `calc(${marker.top} - 100px)`;
    let popupLeft = `calc(${marker.left} - 32px)`;

    if (offsetTop < 15) { // If the marker is near the top, adjust popup position
      popupTop = `calc(${marker.top} + 20px)`;
    }

    return { popupTop, popupLeft };
  };

  return (
    <div className="flex justify-center items-center p-8 bg-white 0 min-h-screen">
      <div className="relative w-full max-w-[1200px] bg-white p-3 rounded-lg shadow-xl overflow-hidden">
        {/* Map Image */}
        <img
          src="/images/map.svg"
          alt="School Map"
          className="border-2 border-gray-300 rounded-lg object-cover w-full h-[600px ] shadow-md transition-transform duration-300 hover:scale-105"
        />

        {/* Markers */}
        {markers.map((marker, index) => (
          <div
            key={index}
            className="absolute flex flex-col items-center cursor-pointer"
            style={{
              top: marker.top,
              left: marker.left,
              transform: "translate(-50%, -50%)",
            }}
            onClick={() => handleMarkerClick(marker)}
          >
            {/* Location Icon Marker */}
            <div className="relative flex items-center justify-center">
              <img
                src="/images/marker_icon.ico"
                alt="Marker"
                className="w-6 h-6 rounded-full bg-indigo-500 p-1 shadow-lg transition-transform duration-300 hover:scale-125"
              />
              {/* Marker Name */}
              <div className="absolute top-[-30px] text-sm text-center bg-white text-black border border-gray-300 rounded p-1 whitespace-nowrap shadow-sm">
                {marker.name}
              </div>
            </div>
          </div>
        ))}

        {/* Popup for Selected Marker */}
        {selectedMarker && (
          <div
            className="absolute bg-white p-4 border-2 border-gray-300 rounded-lg shadow-lg w-64 transition-transform duration-300"
            style={{
              top: getPopupPosition(selectedMarker).popupTop,
              left: getPopupPosition(selectedMarker).popupLeft,
            }}
          >
            {/* Popup Image */}
            {selectedMarker.image && (
              <img
                src={selectedMarker.image}
                alt={`${selectedMarker.name} Image`}
                className="w-full h-32 object-cover rounded-lg mb-2"
              />
            )}

            {/* Building Name */}
            <h3 className="text-xl font-semibold text-indigo-600">{selectedMarker.name}</h3>

            {/* Building Details */}
            <p className="text-sm text-gray-700 mt-2">{selectedMarker.details}</p>

            {/* Buttons: View and Close */}
            <div className="flex justify-between mt-4">
              <button
                onClick={closePopup}
                className="py-1 px-2 bg-[#7f1d1d] text-white text-sm rounded hover:bg-red-700 focus:outline-none transition duration-200"
              >
                Close
              </button>
              <button
                className="py-1 px-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 focus:outline-none transition duration-200"
              >
                View
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;