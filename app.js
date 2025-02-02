// Load API key from environment file
fetch("https://raw.githubusercontent.com/chaupham1092/test/main/config.json")
  .then(response => response.json())
  .then(config => {
    const API_KEY = config.API_KEY;
    initApp(API_KEY);
  })
  .catch(error => console.error("Error loading API key:", error));

let map;
let markers = []; // Array to store markers for removal later
let countryStats = {}; // Object to store country-wise IP counts
let ipData = []; // Array to store IP details (IP, country)

function initMap() {
  map = L.map("map").setView([51.505, -0.09], 2); // Default map view centered on the world

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
}

function initApp(API_KEY) {
  window.plotIPs = function () {
    const ipList = document
      .getElementById("ipList")
      .value.split("\n")
      .map((ip) => ip.trim())
      .filter((ip) => ip);

    // Clear previous stats and markers
    countryStats = {};
    ipData = [];
    markers.forEach((marker) => marker.remove());
    markers = [];
    document.getElementById("countryStats").innerHTML = ""; // Clear previous stats

    ipList.forEach((ip) => {
      $.getJSON(`https://ipinfo.io/${ip}/json?token=${API_KEY}`, function (data) {
        const loc = data.loc.split(",");
        const lat = parseFloat(loc[0]);
        const lng = parseFloat(loc[1]);
        const country = data.country;

        const marker = L.marker([lat, lng])
          .addTo(map)
          .bindPopup(`<b>IP:</b> ${ip}<br><b>Location:</b> ${data.city}, ${data.region}, ${country}`);

        markers.push(marker); // Store marker to remove later
        ipData.push({ ip, country }); // Store IP and its country for stats

        // Update country stats
        if (countryStats[country]) {
          countryStats[country]++;
        } else {
          countryStats[country] = 1;
        }

        // Display country stats after adding each IP
        displayCountryStats();
      });
    });
  };
}

// Display country stats (IP count by country)
function displayCountryStats() {
  const statsContainer = document.getElementById("countryStats");
  statsContainer.innerHTML = ""; // Clear previous stats

  for (const country in countryStats) {
    const countryDiv = document.createElement("div");
    countryDiv.classList.add("countryStat");
    countryDiv.innerHTML = `<strong>${country}</strong>: ${countryStats[country]} IP(s)`;
    countryDiv.onclick = () => showIPsFromCountry(country); // Add click handler to filter by country
    statsContainer.appendChild(countryDiv);
  }
}

// Show IPs from a specific country
function showIPsFromCountry(country) {
  const countryIPs = ipData.filter((ipObj) => ipObj.country === country);
  const ipList = countryIPs.map((ipObj) => ipObj.ip).join("<br>");

  const ipListContainer = document.getElementById("ipListFromCountry");
  ipListContainer.innerHTML = `<h3>IPs from ${country}</h3>${ipList}`;
}

function resetMap() {
  document.getElementById("ipList").value = ""; // Clear IP list input
  markers.forEach((marker) => marker.remove()); // Remove all markers from the map
  markers = []; // Clear the markers array
  countryStats = {}; // Reset country stats
  ipData = []; // Reset IP data
  document.getElementById("countryStats").innerHTML = ""; // Clear country stats display
  document.getElementById("ipListFromCountry").innerHTML = ""; // Clear IPs by country display
}

window.onload = initMap;
