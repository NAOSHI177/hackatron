import Home from "./assets/components/Home";
import Tools from "./assets/components/Tools"; // Importa el componente Tools
import { Routes, Route } from "react-router-dom"; // Importa las funciones de enrutamiento

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tools" element={<Tools />} />
      </Routes>
    </div>
  );
}

export default App;