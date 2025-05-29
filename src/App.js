import React, { useState } from "react";
import "./App.css";
import { FaSun, FaMoon } from "react-icons/fa";
function App() {
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  
  return (
    <div
      className={`flex flex-col min-h-screen transition-colors ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
      }`}
    >
      <header
        className={`shadow ${
          darkMode ? "bg-gray-800" : "bg-white"
        } p-6 flex items-center justify-between`}
      >
        <div className="flex items-center space-x-4">
          <img
            src={require("./calculadora.png")}
            alt="CalcTC Logo"
            className="w-12 h-12"
          />
          <h1 className="text-3xl font-bold">CalcTC</h1>
        </div>
        <button
          onClick={toggleDarkMode}
          className="p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          title="Alternar modo oscuro/claro"
        >
          {darkMode ? <FaSun size={24} /> : <FaMoon size={24} />}
        </button>
      </header>

      <main className="flex-grow max-w-4xl mx-auto w-full mt-12 mb-12 p-8">
        <div className="mb-8">
          <label className="block text-lg font-medium mb-2">
            Seleccionar modelo:
          </label>
          <select
            className={`w-full p-3 border rounded-lg text-lg cursor-pointer ${
              darkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-gray-800 border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
          </select>
        </div>

      </main>

      <footer
        className={`p-6 ${
          darkMode ? "bg-gray-800" : "bg-gray-200"
        } text-center`}
      >
        <div className="flex justify-center space-x-6 mb-3">
          <p className="text-base">Agustín Diaz, Santiago Vittori</p>
        </div>
        <p className="text-base">
          © 2025 CalcTC - Proyecto de Modelización Numérica
        </p>
      </footer>
    </div>
  );
}

export default App;
