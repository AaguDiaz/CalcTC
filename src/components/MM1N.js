import React, { useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const MM1N = () => {
  // Estados para los inputs principales del modelo
  const [lambda, setLambda] = useState("");
  const [mu, setMu] = useState("");
  const [capacity, setCapacity] = useState(""); // N: Capacidad del sistema

  // Estados para el cálculo de probabilidades Pn
  const [nProb, setNProb] = useState(""); // n: número de clientes para Pn
  const [probType, setProbType] = useState("exactamente"); // Tipo de cálculo de Pn
  const [probContext, setProbContext] = useState("sistema"); // Contexto: sistema o cola

  // Estados para los resultados y errores
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});
  const [unit, setUnit] = useState("hours"); // Para mostrar resultados en horas/minutos
  const [muUnit, setMuUnit] = useState("hours"); // Unidad de ingreso de mu
  const [showClearModal, setShowClearModal] = useState(false);

  // Validación de los campos de entrada
  const validateInputs = () => {
    const lambdaValue = parseFloat(lambda);
    const muValue = parseFloat(mu);
    const capacityValue = parseInt(capacity, 10);
    const nProbValue = parseInt(nProb, 10);
    const newErrors = {};

    if (!lambda) newErrors.lambda = "Este campo es obligatorio";
    if (!mu) newErrors.mu = "Este campo es obligatorio";
    if (!capacity) newErrors.capacity = "Este campo es obligatorio";

    if (lambdaValue < 0 || muValue <= 0) {
      newErrors.general = "Los valores de λ y μ deben ser positivos";
    }
    if (capacity && (!Number.isInteger(capacityValue) || capacityValue <= 0)) {
      newErrors.capacity = "La capacidad debe ser un número entero positivo";
    }
    if (nProb !== "" && (!Number.isInteger(nProbValue) || nProbValue < 0)) {
      newErrors.nProb = "Debe ser un número entero no negativo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Cálculo de resultados del modelo M/M/1/N
  const calculateMM1N = () => {
    if (!validateInputs()) return;

    const l = parseFloat(lambda);
    let m = parseFloat(mu);
    // Conversión de mu si la unidad es minutos
    if (muUnit === "minutes" && m > 0) {
      m = 60 / m; // μ en horas
    }
    const N = parseInt(capacity, 10);
    const rho = l / m;
    const rhoN1 = Math.pow(rho, N + 1);
    const p0 = (1 - rho) / (1 - rhoN1); // Probabilidad de 0 clientes
    const pb = (Math.pow(rho, N) * (1 - rho)) / (1 - rhoN1); // Probabilidad de bloqueo

    let lq, ls;

    if (rho === 1) {
      // Caso especial: ρ = 1
      ls = N / 2;
      lq = ls - (1 - Math.pow(rho, N)) / (1 - Math.pow(rho, N + 1));
    } else {
      // Caso general: ρ ≠ 1
      ls = rho / (1 - rho) - ((N + 1) * rhoN1) / (1 - rhoN1);
      lq = (N * (N - 1)) / (2 * (N + 1));
    }

    // Tasa de llegada efectiva y tasa de rechazo
    const lambda_eff = l * (1 - Math.pow(rho, N) * ((1 - rho) / (1 - rhoN1))); // λ'
    const gamma = l * pb; // γ
    const ws = ls / l; // Tiempo en el sistema (Ws)
    const wq = lq / l; // Tiempo en la cola (Wq)

    // Rendimientos
    const yi = l * (1 - pb); // Rendimiento de entrada
    const yo = m * (1 - p0); // Rendimiento de salida

    // Cálculo de probabilidad Pn si corresponde
    let pnResult = null;
    const nProbValue = parseInt(nProb, 10);
    if (nProb !== "" && !isNaN(nProbValue)) {
      const nAdjusted = probContext === "cola" ? nProbValue + 1 : nProbValue;
      let description = `El valor n=${nProbValue} está fuera de los límites del sistema.`;
      if (nAdjusted >= 0 && nAdjusted <= N) {
        if (probType === "exactamente") {
          // Probabilidad exacta de n clientes
          const probValue = p0 * Math.pow(rho, nAdjusted);
          description = `Pₙ = ρⁿ * P₀  ➔  P${nAdjusted} = ${formatNumber(
            rho
          )} ^ ${nAdjusted} * ${formatNumber(p0)} = ${formatNumber(
            probValue
          )} (${(probValue * 100).toFixed(2)}%)`;
        } else if (probType === "al menos") {
          // Probabilidad de al menos n clientes (solo descripción conceptual)
          description = `Σ (de k=${nAdjusted} a ∞) = Pₙ + Pₙ₊₁ + ... ∞`;
        } else {
          // como maximo
          let sumProb = p0;
          let sumDescription = "";
          for (let k = 0; k <= nAdjusted; k++) {
            let currentPk = p0 * Math.pow(rho, k);
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
      p0,
      ls,
      lq,
      ws,
      wq,
      pb,
      lambda_eff,
      gamma,
      yi,
      yo,
      pn: pnResult,
    });
  };

  // Limpia todos los campos y resultados
  const clearFields = () => {
    setLambda("");
    setMu("");
    setCapacity("");
    setNProb("");
    setProbType("exactamente");
    setProbContext("sistema");
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
      <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-2">
        Modelo M/M/1/N
      </h2>
      {/* Formulario de entrada */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-8 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              placeholder="Ej. 18 (clientes/hora)"
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
            <div className="flex gap-2">
              <input
                type="number"
                id="mu"
                value={mu}
                onChange={(e) => setMu(e.target.value)}
                className="w-full p-4 pt-6 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder={muUnit === "hours" ? "Ej. 6" : "Ej. 10"}
                step="0.1"
                min="0"
                required
              />
              <select
                value={muUnit}
                onChange={(e) => setMuUnit(e.target.value)}
                className="p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none cursor-pointer"
              >
                <option value="hours">horas</option>
                <option value="minutes">minutos</option>
              </select>
            </div>
            {errors.mu && (
              <p className="text-red-500 text-sm mt-1">{errors.mu}</p>
            )}
          </div>

          {/* Input: Capacidad (N) */}
          <div className="relative">
            <label
              htmlFor="capacity"
              className="block text-emerald-400 text-base font-medium mb-2"
            >
              Capacidad del sistema (N)
            </label>
            <input
              type="number"
              id="capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full p-4 pt-6 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Ej. 4 (límite de clientes)"
              step="1"
              min="1"
              required
            />
            {errors.capacity && (
              <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
            )}
          </div>
        </div>

        {/* Entradas para Pn */}
        <div className="mt-6 pt-6 border-t border-gray-600">
          <h3 className="text-xl font-semibold text-white mb-4">
            Calcular Probabilidad (Pn)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Input: Número de clientes para Pn */}
            <div>
              <label
                htmlFor="nProb"
                className="block text-emerald-400 text-base font-medium mb-2"
              >
                Nº de clientes (n)
              </label>
              <input
                type="number"
                id="nProb"
                value={nProb}
                onChange={(e) => setNProb(e.target.value)}
                className="w-full p-4 pt-6 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Ej. 2 (opcional)"
                step="1"
                min="0"
              />
              {errors.nProb && (
                <p className="text-red-500 text-sm mt-1">{errors.nProb}</p>
              )}
            </div>
            {/* Selector: Tipo de cálculo de Pn */}
            <div>
              <label
                htmlFor="probType"
                className="block text-emerald-400 text-base font-medium mb-2"
              >
                Tipo de cálculo
              </label>
              <select
                id="probType"
                value={probType}
                onChange={(e) => setProbType(e.target.value)}
                className="w-full p-4 pt-6 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 appearance-none cursor-pointer"
              >
                <option value="exactamente">Exactamente</option>
                <option value="al menos">Al menos</option>
                <option value="como maximo">Como máximo</option>
              </select>
            </div>
            {/* Selector: Contexto de Pn */}
            <div>
              <label
                htmlFor="probContext"
                className="block text-emerald-400 text-base font-medium mb-2"
              >
                Contexto
              </label>
              <select
                id="probContext"
                value={probContext}
                onChange={(e) => setProbContext(e.target.value)}
                className="w-full p-4 pt-6 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 appearance-none cursor-pointer"
              >
                <option value="sistema">En sistema</option>
                <option value="cola">En cola</option>
              </select>
            </div>
          </div>
        </div>

        {errors.general && (
          <div className="mt-4 p-4 bg-red-900 text-white rounded-lg flex items-center space-x-3 shadow-md">
            <FaExclamationTriangle className="text-yellow-400" size={20} />
            <span className="text-sm font-medium">{errors.general}</span>
          </div>
        )}

        {/* Botones de acción */}
        <div className="mt-6 flex space-x-4">
          <button
            onClick={calculateMM1N}
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
            {/* ρ */}
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                Factor de Utilización (ρ)
              </h4>
              <p className="text-2xl font-bold text-white">
                {formatNumber(results.rho)}{" "}
                <span className="text-base text-gray-400">
                  ({formatNumber(results.rho * 100)}%)
                </span>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Tráfico ofrecido al sistema.
              </p>
            </div>
            {/* P0 */}
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                Prob. 0 clientes (P₀)
              </h4>
              <p className="text-2xl font-bold text-white">
                {(results.p0 * 100).toFixed(2)}%
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Probabilidad de que el sistema esté vacío.
              </p>
            </div>
            {/* Pb */}
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                Prob. de Bloqueo (P<sub>b</sub>)
              </h4>
              <p className="text-2xl font-bold text-white">
                {(results.pb * 100).toFixed(2)}%
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Probabilidad de que un cliente sea rechazado.
              </p>
            </div>
            {/* Ls */}
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                Clientes en sistema (L<sub>s</sub>)
              </h4>
              <p className="text-2xl font-bold text-white">
                {formatNumber(results.ls)}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Promedio de clientes en el sistema (cola + servicio).
              </p>
            </div>
            {/* Lq */}
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                Clientes en cola (L<sub>q</sub>)
              </h4>
              <p className="text-2xl font-bold text-white">
                {formatNumber(results.lq)}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Promedio de clientes esperando en la cola.
              </p>
            </div>
            {/* Ws */}
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                Tiempo en sistema (W<sub>s</sub>)
              </h4>
              <p className="text-2xl font-bold text-white">
                {unit === "hours"
                  ? `${formatNumber(results.ws)} horas`
                  : `${formatNumber(results.ws * 60)} minutos`}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Tiempo promedio que un cliente pasa en el sistema.
              </p>
            </div>
            {/* Wq */}
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                Tiempo en cola (W<sub>q</sub>)
              </h4>
              <p className="text-2xl font-bold text-white">
                {unit === "hours"
                  ? `${formatNumber(results.wq)} horas`
                  : `${formatNumber(results.wq * 60)} minutos`}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Tiempo promedio que un cliente pasa esperando en la cola.
              </p>
            </div>
            {/* λ_eff */}
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                Tasa de Llegada Efectiva (λ')
              </h4>
              <p className="text-2xl font-bold text-white">
                {formatNumber(results.lambda_eff)}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Tasa promedio de clientes que ingresan al sistema.
              </p>
            </div>
            {/* γ */}
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                Tasa de Rechazo (γ)
              </h4>
              <p className="text-2xl font-bold text-white">
                {formatNumber(results.gamma)}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Tasa promedio de clientes rechazados del sistema.
              </p>
            </div>
            {/* Yi */}
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                Rendimiento de entrada (Yi)
              </h4>
              <p className="text-2xl font-bold text-white">
                {formatNumber(results.yi)}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                El rendimiento de entrada del sistema.
              </p>
            </div>
            {/* Yo */}
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                Rendimiento de salida (yo)
              </h4>
              <p className="text-2xl font-bold text-white">
                {formatNumber(results.yo)}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                El rendimiento de salida del sistema.
              </p>
            </div>
            {/* Y */}
            <div className="p-4 bg-gray-900 rounded-lg shadow-md">
              <h4 className="text-lg font-medium text-emerald-400">
                Rendimiento del sistema (Y)
              </h4>
              <p className="text-2xl font-bold text-white">
                {formatNumber(results.yi)}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                El rendimiento del sistema.
              </p>
            </div>
          </div>
          {/* Probabilidad para n clientes */}
          {results.pn && (
            <div className="mt-6 pt-6 border-t border-gray-600">
              <div className="p-4 bg-gray-900 rounded-lg shadow-md">
                <h4 className="text-lg font-medium text-emerald-400">
                  Probabilidad (P<sub>n</sub>)
                </h4>
                <p className="text-lg text-white">{results.pn.description}</p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default MM1N;
