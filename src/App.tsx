import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

function App() {
  const [helloString, setHelloString] = useState("")

  const handleOnClick = async () => {
    const hello = await invoke<string>("say_hello")
    setHelloString(hello)
  }

  return (
    <main>
      <h1>nara</h1>
      <button onClick={handleOnClick}>say hello</button>
      <h1>{helloString}</h1>
    </main>
  )
}

export default App;
