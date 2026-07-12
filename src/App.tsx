import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useState } from "react";

function App() {
  const [helloString, setHelloString] = useState("")

  const handleOnClick = async () => {
    const hello = await invoke<string>("say_hello")
    setHelloString(hello)
  }

  const handleCreateTerminalSession = async () => {
    const id = await invoke<number>("create_terminal", {
      title: "zsh"
    })

    console.log(id)

    listen<string>("terminal-output", (e) => {
      console.log(e.payload)
    })
  }

  return (
    <main>
      <h1>nara</h1>
      <button onClick={handleOnClick}>say hello</button>
      <h1>{helloString}</h1>

      <button onClick={handleCreateTerminalSession}>Create terminal Session</button>
    </main>
  )
}

export default App;
