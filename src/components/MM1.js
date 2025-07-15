import React, { useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const MM1 = () => {
  // Estados para los campos de entrada y resultados
  const [lambda, setLambda] = useState("");
  const [mu, setMu] = useState("");
  const [n, setN] = useState("");
  const [type, setType] = useState("exactamente"); // Tipo de cálculo de probabilidad
  const [context, setContext] = useState("sistema"); // Contexto: sistema o cola
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});
  const [unit, setUnit] = useState("hours");
  const [showClearModal, setShowClearModal] = useState(false);

  // Validación de los campos de entrada
  const validateInputs = () => {
    const λ = parseFloat(lambda);
    const μ = parseFloat(mu);
    const nValue = parseFloat(n);
    const newErrors = {};

    if (!lambda) newErrors.lambda = "Este campo es obligatorio";
    if (!mu) newErrors.mu = "Este campo es obligatorio";
    if (lambda && mu) {
      if (λ < 0 || μ <= 0)
        newErrors.general = "Los valores deben ser positivos";
      if (λ >= μ)
        newErrors.general = "λ debe ser menor que μ para un sistema estable";
    }
    if (
      n !== "" &&
      (isNaN(nValue) || nValue < 0 || !Number.isInteger(nValue))
    ) {
      newErrors.n = "Debe ser un número entero no negativo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Cálculo de resultados del modelo M/M/1
  const calculateMM1 = () => {
    if (!validateInputs()) return;

    const λ = parseFloat(lambda);
    const μ = parseFloat(mu);
    const nValue = parseFloat(n) || 0;
    const rho = λ / μ;
    const P0 = 1 - rho;
    const Ls = λ / (μ - λ); // Clientes en sistema
    const Lq = (λ * λ) / (μ * (μ - λ)); // Clientes en cola
    const Ws = 1 / (μ - λ); // Tiempo en sistema
    const Wq = λ / (μ * (μ - λ)); // Tiempo en cola
    const timeBetweenArrivals = 1 / λ; // Tiempo entre llegadas
    const timeBetweenServices = 1 / μ; // Tiempo entre servicios

    
    // Cálculo de probabilidad Pn si corresponde
    let pnResult = null;
    const nProbValue = parseInt(nValue, 10);
    if (nValue !== "" && !isNaN(nProbValue)) {
      const nAdjusted = context === "cola" ? nProbValue + 1 : nProbValue;
      let description = `El valor n=${nProbValue} está fuera de los límites del sistema.`;
      if (nAdjusted >= 0 && nAdjusted <= n) {
        if (type === "exactamente") {
          // Probabilidad exacta de n clientes
          const probValue = P0 * Math.pow(rho, nAdjusted);
          description = `Pₙ = ρⁿ * P₀  ➔  P${nAdjusted} = ${formatNumber(
            rho
          )} ^ ${nAdjusted} * ${formatNumber(P0)} = ${formatNumber(
            probValue
          )} (${(probValue * 100).toFixed(2)}%)`;
        } else if (type === "al menos") {
          // Probabilidad de al menos n clientes (solo descripción conceptual)
          description = `Σ (de k=${nAdjusted} a ∞) = Pₙ + Pₙ₊₁ + ... ∞`;
        } else {
          // como maximo
          let sumProb = P0;
          let sumDescription = "";
          for (let k = 0; k <= nAdjusted; k++) {
            let currentPk = P0 * Math.pow(rho, k);
            sumProb += currentPk;
            sumDescription += `P${k}` + (k < nAdjusted ? " + " : "");
          }
          description = `Σ (k=0..${nAdjusted}) = ${sumDescription} = ${formatNumber(
            sumProb
          )} (${(sumProb * 100).toFixed(2)}%)`;
        }
      }
      pnResult = { description };
    }
    setResults({
      rho,
      P0,
      Ls,
      Lq,
      Ws,
      Wq,
      timeBetweenArrivals,
      timeBetweenServices,
      Pn: pnResult,
      n: nValue,
    });
  };

  // Limpia todos los campos y resultados
  const clearFields = () => {
    setLambda("");
    setMu("");
    setN("");
    setType("exactamente");
    setContext("sistema");
    setResults(null);
    setErrors({});
    setShowClearModal(false);
  };

  // Formatea los números para mostrar con 2 decimales si es necesario
  const formatNumber = (num) => {
    return Number.isInteger(num) ? num : num.toFixed(2).replace(/\.0$/, "");
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header del modelo */}
      <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-2">
        Modelo M/M/1
      </h2>

      {/* Formulario de entrada */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-8 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input: Tasa de llegada (λ) */}
          <div className="relative">
            <label
              htmlFor="lambda"
              className="block text-emerald-400 text-base font-medium mb-2"
            >
              Tasa de llegada (λ)
            </label>
            <input
              type="number"
              id="lambda"
              value={lambda}
              onChange={(e) => setLambda(e.target.value)}
              className="w-full p-4 pt-6 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Ej. 2 (clientes/hora)"
              step="0.1"
              min="0"
              required
            />
            {errors.lambda && (
              <p className="text-red-500 text-sm mt-1">{errors.lambda}</p>
            )}
          </div>

          {/* Input: Tasa de servicio (μ) */}
          <div className="relative">
            <label
              htmlFor="mu"
              className="block text-emerald-400 text-base font-medium mb-2"
            >
              Tasa de servicio (μ)
            </label>
            <input
              type="number"
              id="mu"
              value={mu}
              onChange={(e) => setMu(e.target.value)}
              className="w-full p-4 pt-6 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Ej. 3 (clientes/hora)"
              step="0.1"
              min="0"
              required
            />
            {errors.mu && (
              <p className="text-red-500 text-sm mt-1">{errors.mu}</p>
            )}
          </div>

          {/* Input: Número de clientes (n) */}
          <div className="relative">
            <label
              htmlFor="n"
              className="block text-emerald-400 text-base font-medium mb-2"
            >
              Número de clientes (n)
            </label>
            <input
              type="number"
              id="n"
              value={n}
              onChange={(e) => setN(e.target.value)}
              className="w-full p-4 pt-6 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Ej. 2 (opcional)"
              step="1"
              min="0"
            />
            {errors.n && (
              <p className="text-red-500 text-sm mt-1">{errors.n}</p>
            )}
          </div>

          {/* Selector: Tipo de cálculo */}
          <div className="relative">
            <label
              htmlFor="type"
              className="block text-emerald-400 text-base font-medium mb-2"
            >
              Tipo de cálculo
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-4 pt-6 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 appearance-none cursor-pointer"
            >
              <option value="exactamente">Exactamente</option>
              <option value="al menos">Al menos</option>
              <option value="como maximo">Como máximo</option>
            </select>
          </div>

          {/* Selector: Contexto */}
          <div className="relative">
            <label
              htmlFor="context"
              className="block text-emerald-400 text-base font-medium mb-2"
            >
              Contexto
            </label>
            <select
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full p-4 pt-6 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 appearance-none cursor-pointer"
            >
              <option value="sistema">En sistema</option>
              <option value="cola">En cola</option>
            </select>
          </div>
        </div>

        {/* Mensaje de error general */}
        {errors.general && (
          <div className="mt-4 p-4 bg-red-900 text-white rounded-lg flex items-center space-x-3 shadow-md">
            <FaExclamationTriangle className="text-yellow-400" size={20} />
            <span className="text-sm font-medium">{errors.general}</span>
          </div>
        )}

        {/* Botones */}
        <div className="mt-6 flex space-x-4">
          <button
            onClick={calculateMM1}
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
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Resultados</h3>
            <button
              onClick={() => setUnit(unit === "hours" ? "minutes" : "hours")}
              className="px-4 py-2 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-all duration-300"
            >
              Mostrar en {unit === "hours" ? "minutos" : "horas"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Utilización */}
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                Utilización (ρ)
              </h4>
              <p className="text-2xl font-bold text-white">
                {(results.rho * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Proporción del tiempo que el servidor está ocupado.
              </p>
            </div>

            {/* Probabilidad de 0 clientes */}
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                Prob. 0 clientes (P₀)
              </h4>
              <p className="text-2xl font-bold text-white">
                {(results.P0 * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Probabilidad de que no haya clientes en el sistema.
              </p>
            </div>

            {/* Clientes en sistema */}
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                Clientes en sistema (L<sub>s</sub>)
              </h4>
              <p className="text-2xl font-bold text-white">
                {formatNumber(results.Ls)}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Promedio de clientes en el sistema (cola + servicio).
              </p>
            </div>

            {/* Clientes en cola */}
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                Clientes en cola (L<sub>q</sub>)
              </h4>
              <p className="text-2xl font-bold text-white">
                {formatNumber(results.Lq)}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Promedio de clientes esperando en la cola.
              </p>
            </div>

            {/* Tiempo en sistema */}
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                Tiempo en sistema (W<sub>s</sub>)
              </h4>
              <p className="text-2xl font-bold text-white">
                {unit === "hours"
                  ? `${formatNumber(results.Ws)} horas`
                  : `${formatNumber(results.Ws * 60)} minutos`}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Tiempo promedio que un cliente pasa en el sistema.
              </p>
            </div>

            {/* Tiempo en cola */}
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                Tiempo en cola (W<sub>q</sub>)
              </h4>
              <p className="text-2xl font-bold text-white">
                {unit === "hours"
                  ? `${formatNumber(results.Wq)} horas`
                  : `${formatNumber(results.Wq * 60)} minutos`}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Tiempo promedio que un cliente pasa esperando en la cola.
              </p>
            </div>

            {/* Tiempo entre llegadas */}
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                Tiempo entre llegadas (1/λ)
              </h4>
              <p className="text-2xl font-bold text-white">
                {unit === "hours"
                  ? `${formatNumber(results.timeBetweenArrivals)} horas`
                  : `${formatNumber(results.timeBetweenArrivals * 60)} minutos`}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Tiempo promedio entre llegadas de clientes.
              </p>
            </div>

            {/* Tiempo entre servicios */}
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                Tiempo entre servicios (1/μ)
              </h4>
              <p className="text-2xl font-bold text-white">
                {unit === "hours"
                  ? `${formatNumber(results.timeBetweenServices)} horas`
                  : `${formatNumber(results.timeBetweenServices * 60)} minutos`}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Tiempo promedio entre servicios.
              </p>
            </div>

            {/* Probabilidad para n clientes */}
            {results.Pn && (
              <div className="p-4 bg-gray-900 rounded-lg shadow-md col-span-1 md:col-span-2 lg:col-span-3">
                <h4 className="text-lg font-medium text-emerald-400">
                  Probabilidad (P<sub>n</sub>)
                </h4>
                <p className="text-lg text-white">{results.Pn.description}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MM1;
