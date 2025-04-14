// In your script1.js file:
document.getElementById("carbonForm").onsubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const payload = Object.fromEntries(formData.entries());

  // Ensure values are numbers
  payload.electricity = Number(payload.electricity);
  payload.car = Number(payload.car);
  payload.meat = Number(payload.meat);

  console.log("Submitting form with data:", payload);

  try {
    const res = await fetch("/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("Response status:", res.status);
    const data = await res.json();
    console.log("Response data:", data);
    
    const resultEl = document.getElementById("result");

    if (data.error) {
      resultEl.innerHTML = `<p>❌ ${data.error}</p>`;
    } else if (data.emission === null || data.emission === undefined) {
      resultEl.innerHTML = `<p>❌ Error: Received null or undefined emission value</p>`;
    } else {
      localStorage.setItem("weeklyEmission", data.emission);

      resultEl.innerHTML = `
        <h3>🌎 Estimated Emissions: <strong>${data.emission} kg CO₂/month</strong></h3>
        <h4>💡 Suggestions:</h4>
        <ul>${data.suggestions.map(s => `<li>${s}</li>`).join("")}</ul>
      `;
    }
    resultEl.classList.remove("hidden");
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("result").innerHTML = `<p>❌ Error: ${error.message}</p>`;
    document.getElementById("result").classList.remove("hidden");
  }
};