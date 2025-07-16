// MD1.js
import React, { useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { calcularResultados } from "./calculosMG1yMD1";

const MD1 = () => {
  // Estados, sin tita (varianza)
  const [lambda, setLambda] = useState("");
  const [es, setEs] = useState("");
  const [esUnit, setEsUnit] = useState("horas");
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});
  const [showClearModal, setShowClearModal] = useState(false);

  const validateInputs = () => {
    const lambdaValue = parseFloat(lambda);
    const esValue = parseFloat(es);
    const newErrors = {};
    if (!lambda) newErrors.lambda = "Este campo es obligatorio";
    if (!es) newErrors.es = "Este campo es obligatorio";
    if (lambdaValue < 0) newErrors.lambda = "λ debe ser positivo";
    if (esValue <= 0) newErrors.es = "E(s) debe ser positivo";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const HandleCalcular = () => {
    if (!validateInputs()) return;

    // Llamar a la lógica compartida con tita = 0
    const calculatedData = calcularResultados({
      lambda,
      es,
      tita: "0", // Varianza es siempre 0 en M/D/1
      esUnit,
      titaUnit: "horas2", // La unidad no importa si el valor es 0
    });

    if (calculatedData.error) {
      setErrors({ general: calculatedData.error });
      setResults(null);
    } else {
      setResults(calculatedData);
      setErrors({});
    }
  };
  // Limpia todos los campos y resultados
  const clearFields = () => {
    setLambda("");
    setEs("");
    setResults(null);
    setErrors({});
    setShowClearModal(false);
  };

  // Formatea los números para mostrar con 4 decimales si es necesario
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "N/A";
    return Number.isInteger(num) ? num : num.toFixed(4).replace(/\.?0+$/, "");
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header del modelo */}
      <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-2 flex items-center gap-2">
        Modelo M/D/1
      </h2>
      {/* Formulario de entrada */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-8 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Input: Tasa de llegada (λ) */}
          <div className="relative">
            <label
              htmlFor="lambda"
              className="block text-emerald-400 text-base font-medium mb-8"
            >
              Tasa de llegada (λ)
            </label>
            <input
              type="number"
              id="lambda"
              value={lambda}
              onChange={(e) => setLambda(e.target.value)}
              className="w-full p-4 pt-6 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Ej. 5 (clientes/hora)"
              step="0.1"
              min="0"
              required
            />
            {errors.lambda && (
              <p className="text-red-500 text-sm mt-1">{errors.lambda}</p>
            )}
          </div>
          {/* Input: E(s) */}
          <div className="relative">
            <label
              htmlFor="es"
              className="block text-emerald-400 text-base font-medium mb-2"
            >
              E(s): Tiempo promedio que tarda en atender a un solo cliente
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                id="es"
                value={es}
                onChange={(e) => setEs(e.target.value)}
                className="w-full p-4 pt-6 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Ej. 0.2"
                step="0.01"
                min="0"
                required
              />
              <select
                value={esUnit}
                onChange={(e) => setEsUnit(e.target.value)}
                className="p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none cursor-pointer"
              >
                <option value="horas">horas</option>
                <option value="minutos">minutos</option>
                <option value="segundos">segundos</option>
              </select>
            </div>
            {errors.es && (
              <p className="text-red-500 text-sm mt-1">{errors.es}</p>
            )}
          </div>
        </div>
        {/* Mensaje de error general */}
        {errors.general && (
          <div className="mt-4 p-4 bg-red-900 text-white rounded-lg flex items-center space-x-3 shadow-md">
            <FaExclamationTriangle className="text-yellow-400" size={20} />
            <span className="text-sm font-medium">{errors.general}</span>
          </div>
        )}
        {/* Botones de acción */}
        <div className="mt-6 flex space-x-4">
          <button
            onClick={HandleCalcular}
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
      {/* Resultados */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 p-8 bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl shadow-lg"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Resultados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                Tasa de servicio (μ)
              </h4>
              <p className="text-2xl font-bold text-white">
                {formatNumber(results.mu)}
              </p>
              <p className="text-sm text-gray-400 mt-1">μ = 1 / E(s)</p>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                Factor de utilización (ρ)
              </h4>
              <p className="text-2xl font-bold text-white">
                {formatNumber(results.rho)}{" "}
                <span className="text-base text-gray-400">
                  ({formatNumber(results.rho * 100)}%)
                </span>
              </p>
              <p className="text-sm text-gray-400 mt-1">ρ = λ / μ</p>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                E(n): Promedio de clientes en el sistema
              </h4>
              <p className="text-2xl font-bold text-white">
                {formatNumber(results.en)}{" "}
                <span className="text-base text-gray-400">clientes</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                E(n) = (ρ / (1-ρ)) × (1 - (ρ/2))
              </p>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                E(T): Tiempo promedio que un cliente pasa en el sistema
              </h4>
              <p className="text-2xl font-bold text-white">
                {formatNumber(results.et_direct)}{" "}
                <span className="text-base text-gray-400">horas</span>
              </p>
              <p className="text-2xl font-bold text-white mt-2">
                {formatNumber(results.et_direct * 60)}{" "}
                <span className="text-base text-gray-400">minutos</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                E(T) = (1 / μ(1-ρ)) × (1 - (ρ/2))
              </p>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                Lq: Promedio de clientes en la cola
              </h4>
              <p className="text-2xl font-bold text-white">
                {formatNumber(results.lq)}{" "}
                <span className="text-base text-gray-400">clientes</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">Lq = λ²/μ*(μ-λ)</p>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                Wq: Tiempo promedio en la cola
              </h4>
              <p className="text-2xl font-bold text-white">
                {formatNumber(results.wq)}{" "}
                <span className="text-base text-gray-400">horas</span>
              </p>
              <p className="text-2xl font-bold text-white mt-2">
                {formatNumber(results.wq * 60)}{" "}
                <span className="text-base text-gray-400">minutos</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">Wq = λ/μ*(μ-λ)</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MD1;
