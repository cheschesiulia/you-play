import React from "react";

function App() {
  const handleTest = async () => {
    const res = await fetch(`auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "test", password: "1234" })
    });
    const data = await res.json();
    console.log(data);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Streaming App Frontend</h1>
      <button onClick={handleTest}>Test Auth Register</button>
    </div>
  );
}

export default App;