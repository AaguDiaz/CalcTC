// Prioridad.js
import React, { useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Prioridad = () => {
  const [inputType, setInputType] = useState("lambdaMu"); // 'lambdaMu' o 'qTs'

  // Estados para los inputs
  const [w0, setW0] = useState("");
  const [class1Lambda, setClass1Lambda] = useState("");
  const [class2Lambda, setClass2Lambda] = useState("");
  const [mu, setMu] = useState("");
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [ts1, setTs1] = useState("");
  const [ts2, setTs2] = useState("");

  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});
  const [showClearModal, setShowClearModal] = useState(false);

  const formatNumber = (num) => {
    if (typeof num === "string") return num;
    if (num === null || num === undefined) return "N/A";
    return Number.isInteger(num) ? num : num.toFixed(4).replace(/\.?0+$/, "");
  };

  const clearFields = () => {
    setW0("");
    setClass1Lambda("");
    setClass2Lambda("");
    setMu("");
    setQ1("");
    setQ2("");
    setTs1("");
    setTs2("");
    setResults(null);
    setShowClearModal(false);
    setErrors({});
  };

  const handleCalculate = () => {
    setResults(null);
    setErrors({});
    const w0Value = parseFloat(w0);

    if (inputType === "lambdaMu") {
      const lambda1 = parseFloat(class1Lambda);
      const lambda2 = parseFloat(class2Lambda);
      const muValue = parseFloat(mu);

      if (!w0 || !class1Lambda || !class2Lambda || !mu) {
        setErrors({ general: "Todos los campos son obligatorios." });
        return;
      }
      if (muValue <= lambda1) {
        setErrors({
          general: "μ debe ser mayor que λ1 para la estabilidad de la fórmula.",
        });
        return;
      }

      // --- Aplicando tus fórmulas para el modo λ y μ ---
      const rho = (lambda1 + lambda2) / muValue;
      const ts = 1 / muValue;
      const lq1 = Math.pow(lambda1, 2) / (muValue * (muValue - lambda1));
      const lq2 = Math.pow(lambda2, 2) / (muValue * (muValue - lambda2));

      const wq1 = w0Value + lq1 * ts;
      const w1 = wq1 + ts;
      const wq2 = w0Value + lq2 * ts;
      const w2 = wq2 + ts;

      setResults({
        rho: rho,
        w1: w1,
        wq1: wq1,
        w2: w2,
        wq2: wq2,
      });
    } else {
      // modo qTs
      const q1Value = parseFloat(q1);
      const q2Value = parseFloat(q2);
      const ts1Value = parseFloat(ts1);
      const ts2Value = parseFloat(ts2);

      if (!w0 || !q1 || !q2 || !ts1 || !ts2) {
        setErrors({ general: "Todos los campos son obligatorios." });
        return;
      }

      // --- Aplicando fórmulas para el modo Q y Ts ---
      const wq1 = w0Value + q1Value * ts1Value;
      const w1 = wq1 + ts1Value;
      const wq2 = w0Value + q2Value * ts2Value;
      const w2 = wq2 + ts2Value;

      setResults({
        rho: "No calculable",
        w1: w1,
        wq1: wq1,
        w2: w2,
        wq2: wq2,
      });
    }
  };

  return (
    <div className="space-y-8 w-full">
      <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-2">
        Modelo de Colas con Prioridad
      </h2>

      <div className="bg-gradient-to-br from-gray-800 to-gray-700 shadow-lg rounded-2xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="inputType"
              className="block text-emerald-400 text-base font-medium mb-2"
            >
              Modo de Cálculo
            </label>
            <select
              id="inputType"
              value={inputType}
              onChange={(e) => {
                setInputType(e.target.value);
                clearFields();
              }}
              className="w-full p-4 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg cursor-pointer"
            >
              <option value="lambdaMu">Con λ y μ</option>
              <option value="qTs">Con Q y Ts</option>
            </select>
          </div>
          <div className="relative">
            <label
              htmlFor="w0"
              className="block text-emerald-400 text-base font-medium mb-2"
            >
              W0: Tiempo restante del cliente en servicio
            </label>
            <input
              type="number"
              id="w0"
              value={w0}
              onChange={(e) => setW0(e.target.value)}
              className="w-full p-4 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg"
              placeholder="Ej. 0.5"
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>

        <hr className="my-6 border-gray-600" />

        {inputType === "lambdaMu" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-emerald-400 mb-2">
                λ1: Tasa llegada Clase 1
              </label>
              <input
                value={class1Lambda}
                onChange={(e) => setClass1Lambda(e.target.value)}
                type="number"
                placeholder="Ej. 2"
                className="w-full p-4 bg-gray-800 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-emerald-400 mb-2">
                λ2: Tasa llegada Clase 2
              </label>
              <input
                value={class2Lambda}
                onChange={(e) => setClass2Lambda(e.target.value)}
                type="number"
                placeholder="Ej. 3"
                className="w-full p-4 bg-gray-800 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-emerald-400 mb-2">
                μ: Tasa de Servicio
              </label>
              <input
                value={mu}
                onChange={(e) => setMu(e.target.value)}
                type="number"
                placeholder="Ej. 10"
                className="w-full p-4 bg-gray-800 rounded-lg"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-emerald-400 mb-2">
                Q1: Clientes cola Clase 1
              </label>
              <input
                value={q1}
                onChange={(e) => setQ1(e.target.value)}
                type="number"
                placeholder="Ej. 5"
                className="w-full p-4 bg-gray-800 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-emerald-400 mb-2">
                Ts1: Tiempo serv. Clase 1
              </label>
              <input
                value={ts1}
                onChange={(e) => setTs1(e.target.value)}
                type="number"
                placeholder="Ej. 0.1"
                className="w-full p-4 bg-gray-800 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-emerald-400 mb-2">
                Q2: Clientes cola Clase 2
              </label>
              <input
                value={q2}
                onChange={(e) => setQ2(e.target.value)}
                type="number"
                placeholder="Ej. 8"
                className="w-full p-4 bg-gray-800 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-emerald-400 mb-2">
                Ts2: Tiempo serv. Clase 2
              </label>
              <input
                value={ts2}
                onChange={(e) => setTs2(e.target.value)}
                type="number"
                placeholder="Ej. 0.1"
                className="w-full p-4 bg-gray-800 rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Mensaje de error general */}
        {errors.general && (
          <div className="mt-4 p-4 bg-red-900 text-white rounded-lg flex items-center space-x-3 shadow-md">
            <FaExclamationTriangle className="text-yellow-400" size={20} />
            <span className="text-sm font-medium">{errors.general}</span>
          </div>
        )}

        <div className="mt-6 flex space-x-4">
          <button
            onClick={handleCalculate}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-lg border border-emerald-700 transition-all duration-300 hover:from-emerald-500 hover:to-emerald-400 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400"
          >
            Calcular
          </button>
          <button
            onClick={() => setShowClearModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-lg border border-red-700 transition-all duration-300 hover:from-red-500 hover:to-red-400 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
          >
            Limpiar
          </button>
        </div>
      </div>
      {/* Modal de confirmación */}
      <AnimatePresence>
        {showClearModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Confirmar borrado
              </h3>
              <p className="text-gray-300 mb-6">
                ¿Estás seguro de que deseas borrar los datos? Esta acción no se
                puede deshacer.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowClearModal(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={clearFields}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all duration-300"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 p-8 bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl shadow-lg"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Resultados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Rho */}
            <div className="p-4 bg-gray-900 rounded-lg">
              <h4 className="text-lg font-medium text-emerald-400">
                Factor de utilización (ρ)
              </h4>
              <p className="text-2xl font-bold text-white mt-2">
                {formatNumber(results.rho)}
                {""}
                <span className="text-base text-gray-400">
                  ({formatNumber(results.rho * 100)}%)
                </span>
              </p>
              <p className="text-sm text-gray-400 mt-1">ρ = λ / μ</p>
            </div>
            {/* Wq1 */}
            <div className="p-4 bg-gray-900 rounded-lg">
              <h4 className="text-lg font-medium text-emerald-400">
                Tiempo de espera de Cola Clase 1 (Wq1)
              </h4>
              <p className="text-2xl font-bold text-white mt-2">
                {formatNumber(results.wq1)}
                {""}
                <span className="text-base text-gray-400"> Minutos</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">Wq1 = W0 + Q1 * Ts1</p>
            </div>
            {/* W1 */}
            <div className="p-4 bg-gray-900 rounded-lg">
              <h4 className="text-lg font-medium text-emerald-400">
                Tiempo Total en sistema Clase 1 (W1)
              </h4>
              <p className="text-2xl font-bold text-white mt-2">
                {formatNumber(results.w1)}
                {""}
                <span className="text-base text-gray-400"> Minutos</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">W1 = Wq1 + Ts1</p>
            </div>
            {/* Wq2 */}
            <div className="p-4 bg-gray-900 rounded-lg">
              <h4 className="text-lg font-medium text-emerald-400">
                Tiempo de espera de Cola Clase 2 (Wq2)
              </h4>
              <p className="text-2xl font-bold text-white mt-2">
                {formatNumber(results.wq2)}
                {""}
                <span className="text-base text-gray-400"> Minutos</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">Wq2 = W0 + Q2 * Ts2</p>
            </div>
            {/* W2 */}
            <div className="p-4 bg-gray-900 rounded-lg">
              <h4 className="text-lg font-medium text-emerald-400">
                Tiempo Total en sistema Clase 2 (W2)
              </h4>
              <p className="text-2xl font-bold text-white mt-2">
                {formatNumber(results.w2)}
                {""}
                <span className="text-base text-gray-400"> Minutos</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">W2 = Wq2 + Ts2</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Prioridad;
