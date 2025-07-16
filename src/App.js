import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";
import MM1 from "./components/MM1";
import MM2 from "./components/MM2";
import MM1N from "./components/MM1N";
import MG1 from "./components/MG1";
import MD1 from "./components/MD1";
import Prioridad from "./components/Prioridades";

import { FaCogs, FaChartLine, FaClock } from "react-icons/fa";
import { GiNetworkBars } from "react-icons/gi";
import queueSVG from "./queue-illustration.png";

function App() {
  // Estado para el modelo seleccionado
  const [modelo, setModelo] = useState("MM1");
  // Estado para mostrar el modal de teoría
  const [hoveredModel, setHoveredModel] = useState(null);
  // Teorías de cada modelo
  const teorias = {
    MM1: {
      titulo: "M/M/1",
      texto:
        "Modelo clásico de cola con llegadas y tiempos de servicio exponenciales. Cuenta con un solo servidor y una capacidad infinita. Los clientes son atendidos en orden de llegada (FIFO). Es útil para analizar el tiempo promedio en el sistema, la longitud esperada de la cola y la utilización del servidor.",
    },
    MM1N: {
      titulo: "M/M/1/N",
      texto:
        "Extensión del modelo M/M/1 con una capacidad máxima de N clientes (incluyendo al que está siendo atendido). Si el sistema está lleno, los nuevos clientes son rechazados. Representa sistemas con espacio o recursos limitados.",
    },
    MM2: {
      titulo: "M/M/2",
      texto:
        "Similar al M/M/1 pero con dos servidores en paralelo. Las llegadas siguen una distribución exponencial y los tiempos de servicio también. Ambos servidores atienden de forma independiente. Permite analizar cómo aumenta la eficiencia del sistema al agregar más capacidad de atención.",
    },
    MG1: {
      titulo: "M/G/1",
      texto:
        "Modelo de cola con llegadas exponenciales y un solo servidor, pero con tiempos de servicio de distribución general (no necesariamente exponencial). Se utiliza para analizar el impacto de la variabilidad en los tiempos de servicio sobre el rendimiento del sistema.",
    },
    MD1: {
      titulo: "M/D/1",
      texto:
        "Caso particular del M/G/1 en el que los tiempos de servicio son determinísticos (constantes). Tiene un solo servidor y permite estudiar sistemas donde la atención siempre tarda lo mismo, reduciendo la variabilidad.",
    },
    Prioridad: {
      titulo: "Colas con Prioridades",
      texto:
        "Modelos en los que los clientes tienen diferentes niveles de prioridad para ser atendidos. Se puede implementar con interrupciones o sin ellas. Es útil en sistemas como hospitales, redes de computadoras o atención diferenciada según tipo de usuario.",
    },
  };
  // Referencia para hacer scroll a la sección de modelos
  const modelosRef = useRef(null);

  // Función para hacer scroll suave a la sección de modelos
  const scrollToModelos = () => {
    if (modelosRef.current) {
      const offset = 700;
      const top =
        modelosRef.current.getBoundingClientRect().top +
        window.pageYOffset +
        offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    // Contenedor principal con fondo oscuro y transición de color
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 transition-colors duration-300">
      {/* Header principal */}
      <header className="w-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 text-white shadow-md py-3 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <img
              src={require("./calculadora.png")}
              alt="CalcTC Logo"
              className="w-12 h-12 transition-transform duration-300 hover:scale-105"
            />
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              CalcTC
            </h1>
          </div>
        </div>
      </header>

      {/* Sección de bienvenida (Hero) */}
      <section className="relative flex flex-col items-center justify-center gap-6 py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto z-10">
          <h2 className="text-4xl md:text-5xl font-semibold mb-4 text-gray-100">
            Bienvenido a CalcTC
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-6">
            Calculadora interactiva de{" "}
            <span className="font-medium">Teoría de Colas</span>.
            <br /> Aprende, experimenta y resuelve modelos de manera visual y
            sencilla.
          </p>
          {/* Botón para ir a la sección de modelos */}
          <button
            onClick={scrollToModelos}
            className="px-10 py-4 bg-gradient-to-r from-gray-600 to-gray-500 text-white font-semibold rounded-xl border border-gray-700 transition-all duration-300 ease-in-out hover:from-emerald-500 hover:to-emerald-400 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            Probar ahora
          </button>
        </div>
      </section>

      {/* Sección informativa sobre teoría de colas */}
      <section
        ref={modelosRef}
        className="max-w-5xl mx-auto w-full mt-16 mb-16 p-6 md:p-12"
      >
        <div className="rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 shadow-2xl p-8 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 flex flex-col gap-6">
            <h3 className="text-3xl md:text-4xl font-bold flex items-center gap-4 text-white">
              <GiNetworkBars size={36} /> ¿Qué es la teoría de colas?
            </h3>
            <p className="text-lg md:text-xl text-white">
              La{" "}
              <span className="font-semibold text-blue-400">
                teoría de colas
              </span>{" "}
              estudia el comportamiento de las líneas de espera en sistemas
              reales. Permite optimizar procesos en bancos, hospitales, redes y
              más.
            </p>
            {/* Tarjetas informativas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="flex flex-col items-center bg-gray-800/90 rounded-xl p-6 shadow-md text-center">
                <FaClock className="text-purple-400 mb-3" size={32} />
                <span className="font-semibold text-lg text-white text-center">
                  Tiempos de espera
                </span>
              </div>
              <div className="flex flex-col items-center bg-gray-800/90 rounded-xl p-6 shadow-md text-center">
                <FaCogs className="text-pink-400 mb-3" size={32} />
                <span className="font-semibold text-lg text-white text-center">
                  Recursos y procesos
                </span>
              </div>
              <div className="flex flex-col items-center bg-gray-800/90 rounded-xl p-6 shadow-md text-center">
                <FaChartLine className="text-blue-400 mb-3" size={32} />
                <span className="font-semibold text-lg text-white text-center">
                  Predicción de rendimiento
                </span>
              </div>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <img
              src={queueSVG}
              alt="Cola"
              className="w-56 md:w-72 object-contain"
            />
          </div>
        </div>
      </section>

      {/* Selección de Modelos */}
      <main className="flex-grow max-w-5xl mx-auto w-full mt-16 mb-16 p-6 md:p-12">
        <h4 className="text-2xl md:text-3xl font-bold mb-10 text-center text-white">
          Prueba nuestros modelos de teoría de colas
        </h4>
        {/* Tarjetas de selección de modelos */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Tarjeta MM1 */}
            <button
              onClick={() => setModelo("MM1")}
              className={`group relative p-8 rounded-3xl shadow-lg border-2 transition-all duration-300 flex flex-col items-center gap-4 cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-300
              ${
                modelo === "MM1"
                  ? "border-blue-500 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800"
                  : "border-gray-600 bg-gray-800"
              }
              hover:border-pink-500 hover:shadow-xl hover:-translate-y-2`}
              title="Modelo M/M/1"
              onMouseEnter={() => setHoveredModel("MM1")}
              onMouseLeave={() => setHoveredModel(null)}
            >
              <img
                src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f464.svg"
                alt="MM1"
                className="w-16 h-16 mb-3 group-hover:scale-110 transition-transform"
              />
              <span className="text-xl font-bold text-white">M/M/1</span>
              <span className="text-base text-gray-300 text-center">
                Cola simple, un solo servidor
              </span>
              {modelo === "MM1" && (
                <span className="absolute top-2 right-2 bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
                  Seleccionado
                </span>
              )}
            </button>
            {/* Tarjeta MM1N */}
            <button
              onClick={() => setModelo("MM1N")}
              className={`group relative p-8 rounded-3xl shadow-lg border-2 transition-all duration-300 flex flex-col items-center gap-4 cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-300 ${
                modelo === "MM1N"
                  ? "border-blue-500 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800"
                  : "border-gray-600 bg-gray-800"
              } hover:border-pink-500 hover:shadow-xl hover:-translate-y-2`}
              title="Modelo M/M/1/N"
              onMouseEnter={() => setHoveredModel("MM1N")}
              onMouseLeave={() => setHoveredModel(null)}
            >
              <img
                src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f512.svg"
                alt="MM1N"
                className="w-16 h-16 mb-3 group-hover:scale-110 transition-transform"
              />
              <span className="text-xl font-bold text-white">M/M/1/N</span>
              <span className="text-base text-gray-300 text-center">
                Capacidad limitada
              </span>
              {modelo === "MM1N" && (
                <span className="absolute top-2 right-2 bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
                  Seleccionado
                </span>
              )}
            </button>
            {/* Tarjeta MM2 */}
            <button
              onClick={() => setModelo("MM2")}
              className={`group relative p-8 rounded-3xl shadow-lg border-2 transition-all duration-300 flex flex-col items-center gap-4 cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-300
              ${
                modelo === "MM2"
                  ? "border-blue-500 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800"
                  : "border-gray-600 bg-gray-800"
              }
              hover:border-pink-500 hover:shadow-xl hover:-translate-y-2`}
              title="Modelo M/M/2"
              onMouseEnter={() => setHoveredModel("MM2")}
              onMouseLeave={() => setHoveredModel(null)}
            >
              <img
                src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f465.svg"
                alt="MM2"
                className="w-16 h-16 mb-3 group-hover:scale-110 transition-transform"
              />
              <span className="text-xl font-bold text-white">M/M/2</span>
              <span className="text-base text-gray-300 text-center">
                Dos servidores en paralelo
              </span>
              {modelo === "MM2" && (
                <span className="absolute top-2 right-2 bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
                  Seleccionado
                </span>
              )}
            </button>
            {/* Tarjeta Prioridades */}
            <button
              onClick={() => setModelo("Prioridad")}
              className={`group relative p-8 rounded-3xl shadow-lg border-2 transition-all duration-300 flex flex-col items-center gap-4 cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-300
              ${
                modelo === "Prioridad"
                  ? "border-blue-500 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800"
                  : "border-gray-600 bg-gray-800"
              }
              hover:border-pink-500 hover:shadow-xl hover:-translate-y-2`}
              title="Modelo Con Prioridades"
              onMouseEnter={() => setHoveredModel("Prioridad")}
              onMouseLeave={() => setHoveredModel(null)}
            >
              <img
                src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4f6.svg"
                alt="Nivel Prioridad"
                className="w-16 h-16 mb-3 group-hover:scale-110 transition-transform"
              />
              <span className="text-xl font-bold text-white">Prioridades</span>
              <span className="text-base text-gray-300 text-center">
                Colas con prioridades
              </span>
              {modelo === "Prioridad" && (
                <span className="absolute top-2 right-2 bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
                  Seleccionado
                </span>
              )}
            </button>
            {/* Tarjeta M/D/1 */}
            <button
              onClick={() => setModelo("MD1")}
              className={`group relative p-8 rounded-3xl shadow-lg border-2 transition-all duration-300 flex flex-col items-center gap-4 cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-300
                ${
                  modelo === "MD1"
                    ? "border-blue-500 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800"
                    : "border-gray-600 bg-gray-800"
                }
              hover:border-pink-500 hover:shadow-xl hover:-translate-y-2`}
              title="Modelo M/D/1"
              onMouseEnter={() => setHoveredModel("MD1")}
              onMouseLeave={() => setHoveredModel(null)}
            >
              <img
                src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3af.svg"
                alt="M/D/1"
                className="w-16 h-16 mb-3 group-hover:scale-110 transition-transform"
              />
              <span className="text-xl font-bold text-white">M/D/1</span>
              <span className="text-base text-gray-300 text-center">
                Servicio determinístico
              </span>
              {modelo === "MD1" && (
                <span className="absolute top-2 right-2 bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
                  Seleccionado
                </span>
              )}
            </button>
            {/* Tarjeta M/G/1 */}
            <button
              onClick={() => setModelo("MG1")}
              className={`group relative p-8 rounded-3xl shadow-lg border-2 transition-all duration-300 flex flex-col items-center gap-4 cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-300
              ${
                modelo === "MG1"
                  ? "border-blue-500 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800"
                  : "border-gray-600 bg-gray-800"
              }
              hover:border-pink-500 hover:shadow-xl hover:-translate-y-2`}
              title="Modelo M/G/1"
              onMouseEnter={() => setHoveredModel("MG1")}
              onMouseLeave={() => setHoveredModel(null)}
            >
              <img
                src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f500.svg"
                alt="MM2"
                className="w-16 h-16 mb-3 group-hover:scale-110 transition-transform"
              />
              <span className="text-xl font-bold text-white">M/G/1</span>
              <span className="text-base text-gray-300 text-center">
                Servicio general
              </span>
              {modelo === "MG1" && (
                <span className="absolute top-2 right-2 bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
                  Seleccionado
                </span>
              )}
            </button>
          </div>
          {/* Modal teoría fijo en lateral derecho */}
          <AnimatePresence>
            {hoveredModel && teorias[hoveredModel] && (
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ duration: 0.3 }}
                className="absolute top-0 left-full ml-8 w-80 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 rounded-2xl shadow-2xl p-8 z-20 border-2 border-blue-500"
                style={{ minHeight: "200px" }}
              >
                <h5 className="text-xl font-bold text-blue-400 mb-3">
                  {teorias[hoveredModel].titulo}
                </h5>
                <p className="text-base text-gray-200">
                  {teorias[hoveredModel].texto}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Renderizar el modelo seleccionado */}
        <div className="mt-12">
          {modelo === "MM1" && <MM1 />}
          {modelo === "MM1N" && <MM1N />}
          {modelo === "MM2" && <MM2 />}
          {modelo === "MG1" && <MG1 />}
          {modelo === "MD1" && <MD1 />}
          {modelo === "Prioridad" && <Prioridad />}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 bg-gray-800 text-center">
        <div className="flex justify-center space-x-6 mb-3">
          <p className="text-lg text-gray-300">
            Agustín Diaz, Santiago Vittori
          </p>
        </div>
        <p className="text-lg text-gray-400">
          © 2025 CalcTC - Proyecto de Modelización Numérica
        </p>
      </footer>
    </div>
  );
}

export default App;
