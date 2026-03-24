async function testUpload() {
  try {
    const rawData =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="; // Using a valid tiny base64 png
    console.log("Sending upload request to backend...");

    const res = await fetch("http://localhost:8000/api/v1/upload/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Missing Authorization header intentionally to see if it even reaches the upload logic or gets blocked by auth
      },
      body: JSON.stringify({
        image: rawData,
        folder: "visitors",
      }),
    });

    const data = await res.json();
    console.log("Response Status:", res.status);
    console.log("Response Body:", data);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

testUpload();
