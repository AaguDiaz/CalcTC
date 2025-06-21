import React, { useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const MM2 = () => {
  const [lambda, setLambda] = useState("");
  const [mu, setMu] = useState("");
  const [mu1, setMu1] = useState("");
  const [mu2, setMu2] = useState("");
  const [n, setN] = useState("");
  const [selection, setSelection] = useState("MU IGUALES");
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});
  const [unit] = useState("hours");
  const [showClearModal, setShowClearModal] = useState(false);

  // Limpiar todos los campos y resultados al cambiar selección
  const handleSelectionChange = (e) => {
    setSelection(e.target.value);
    setLambda("");
    setMu("");
    setMu1("");
    setMu2("");
    setN("");
    setResults(null);
    setErrors({});
  };

  const validateInputs = () => {
    const λ = parseFloat(lambda);
    const μ = parseFloat(mu);
    const μ1 = parseFloat(mu1);
    const μ2 = parseFloat(mu2);
    const nValue = parseFloat(n);
    const newErrors = {};

    if (!lambda) newErrors.lambda = "Este campo es obligatorio";
    if (selection === "MU IGUALES") {
      if (!mu) newErrors.mu = "Este campo es obligatorio";
      if (mu && μ <= 0)
        newErrors.general = "La tasa de servicio debe ser positiva";
      if (lambda && mu && λ >= 2 * μ)
        newErrors.general = "λ debe ser menor que 2μ para un sistema estable";
    } else if (selection === "SIN SELECCIÓN" || selection === "CON SELECCIÓN") {
      if (!mu1) newErrors.mu1 = "Este campo es obligatorio";
      if (!mu2) newErrors.mu2 = "Este campo es obligatorio";
      if (mu1 && mu2 && (μ1 <= 0 || μ2 <= 0))
        newErrors.general = "Las tasas de servicio deben ser positivas";
      if (lambda && mu1 && mu2 && λ >= μ1 + μ2)
        newErrors.general =
          "λ debe ser menor que μ1 + μ2 para un sistema estable";
    }
    if (
      selection === "MU IGUALES" &&
      n !== "" &&
      (isNaN(nValue) || nValue < 0 || !Number.isInteger(nValue))
    ) {
      newErrors.n = "Debe ser un número entero no negativo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateMM2 = () => {
    if (!validateInputs()) return;

    const λ = parseFloat(lambda);
    let μs, ρ, P0, Ls, Lq, Ws, Wq, Pn, rhoCritico, pi0, N, a, aPrime;
    const nValue = parseFloat(n);

    if (selection === "MU IGUALES") {
      const μ = parseFloat(mu);
      μs = 2 * μ;
      ρ = λ / μs;
      Ls = ρ / (1 - ρ);
      Ws = Ls / λ;
      P0 = 1 - ρ;
      Lq = Math.pow(ρ, 2) / (1 - ρ);
      Wq = Lq / λ;
      if (n !== "") {
        Pn = (1 - ρ) * Math.pow(ρ, nValue);
      }
      setResults({
        ρ,
        Ws,
        Ls,
        P0,
        Lq,
        Wq,
        Pn: n !== "" ? Pn : null,
        n: nValue,
      });
    } else if (selection === "SIN SELECCIÓN") {
      const μ1 = parseFloat(mu1);
      const μ2 = parseFloat(mu2);
      const r = μ2 / μ1;
      ρ = λ / (μ1 + μ2);
      rhoCritico = 1 - Math.sqrt((r * (1 + r)) / (1 + r * r));
      a = (2 * μ1 * μ2) / (μ1 + μ2);
      pi0 = (1 - ρ) / (1 - ρ + λ / a);
      N = λ / ((1 - ρ) * (λ + (1 - ρ) * a));
      setResults({
        ρ,
        rhoCritico,
        pi0,
        N,
      });
    } else if (selection === "CON SELECCIÓN") {
      const μ1 = parseFloat(mu1);
      const μ2 = parseFloat(mu2);
      const μ = μ1 + μ2;
      const r = μ2 / μ1;
      // Resolver cuadrática para rhoCritico
      // rhoCritico^2 * (1 + r^2) - rhoCritico * (2 + r^2) - (2r - 1)*(1 + r) = 0
      const aQuad = 1 + r * r;
      const bQuad = -(2 + r * r);
      const cQuad = -(2 * r - 1) * (1 + r);
      const discriminant = bQuad * bQuad - 4 * aQuad * cQuad;
      if (discriminant < 0) {
        setErrors({ general: "No hay solución real para ρ crítico" });
        return;
      }
      rhoCritico = (-bQuad + Math.sqrt(discriminant)) / (2 * aQuad); // Raíz positiva
      ρ = λ / μ;
      aPrime = ((2 * λ + μ) * μ1 * μ2) / (μ * (λ + μ2));
      pi0 = (1 - ρ) / (1 - ρ + λ / aPrime);
      N = λ / ((1 - ρ) * (λ + (1 - ρ) * aPrime));
      setResults({
        ρ,
        rhoCritico,
        pi0,
        N,
      });
    }
  };

  const clearFields = () => {
    setLambda("");
    setMu("");
    setMu1("");
    setMu2("");
    setN("");
    setSelection("MU IGUALES");
    setResults(null);
    setErrors({});
    setShowClearModal(false);
  };

  const formatNumber = (num) => {
    return num !== undefined && num !== null
      ? Number.isInteger(num)
        ? num
        : num.toFixed(4).replace(/\.0+$/, "")
      : "N/A";
  };

  return (
    <div className="space-y-8 w-full">
      <h2 className="text-2xl font-semibold text-white border-b border-gray-700 pb-2">
        Modelo M/M/2
      </h2>

      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-8 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div className="relative">
            <label
              htmlFor="selection"
              className="block text-emerald-400 text-base font-medium mb-2"
            >
              Modo de selección
            </label>
            <select
              id="selection"
              value={selection}
              onChange={handleSelectionChange}
              className="w-full p-4 pt-6 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 appearance-none cursor-pointer"
            >
              <option value="MU IGUALES">MU IGUALES</option>
              <option value="SIN SELECCIÓN">SIN SELECCIÓN</option>
              <option value="CON SELECCIÓN">CON SELECCIÓN</option>
            </select>
          </div>

          {selection === "MU IGUALES" ? (
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
          ) : (
            <>
              <div className="relative">
                <label
                  htmlFor="mu1"
                  className="block text-emerald-400 text-base font-medium mb-2"
                >
                  Tasa de servicio 1 (μ₁)
                </label>
                <input
                  type="number"
                  id="mu1"
                  value={mu1}
                  onChange={(e) => setMu1(e.target.value)}
                  className="w-full p-4 pt-6 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Ej. 2 (clientes/hora)"
                  step="0.1"
                  min="0"
                  required
                />
                {errors.mu1 && (
                  <p className="text-red-500 text-sm mt-1">{errors.mu1}</p>
                )}
              </div>

              <div className="relative">
                <label
                  htmlFor="mu2"
                  className="block text-emerald-400 text-base font-medium mb-2"
                >
                  Tasa de servicio 2 (μ₂)
                </label>
                <input
                  type="number"
                  id="mu2"
                  value={mu2}
                  onChange={(e) => setMu2(e.target.value)}
                  className="w-full p-4 pt-6 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Ej. 3 (clientes/hora)"
                  step="0.1"
                  min="0"
                  required
                />
                {errors.mu2 && (
                  <p className="text-red-500 text-sm mt-1">{errors.mu2}</p>
                )}
              </div>
            </>
          )}

          {selection === "MU IGUALES" && (
            <div className="relative">
              <label
                htmlFor="n"
                className="block text-emerald-400 text-base font-medium mb-2"
              >
                Número de clientes (n) (opcional)
              </label>
              <input
                type="number"
                id="n"
                value={n}
                onChange={(e) => setN(e.target.value)}
                className="w-full p-4 pt-6 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Ej. 2"
                step="1"
                min="0"
              />
              {errors.n && (
                <p className="text-red-500 text-sm mt-1">{errors.n}</p>
              )}
            </div>
          )}
        </div>

        {errors.general && (
          <div className="mt-4 p-4 bg-red-900 text-white rounded-lg flex items-center space-x-3 shadow-md">
            <FaExclamationTriangle className="text-yellow-400" size={20} />
            <span className="text-sm font-medium">{errors.general}</span>
          </div>
        )}

        <div className="mt-6 flex space-x-4">
          <button
            onClick={calculateMM2}
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
          {/* Resultados para MU IGUALES */}
          {selection === "MU IGUALES" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-900 rounded-lg shadow-md">
                <h4 className="text-lg font-medium text-emerald-400">
                  Utilización (ρ)
                </h4>
                <p className="text-2xl font-bold text-white">
                  {(results.ρ * 100).toFixed(2)}%
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Proporción del tiempo que los servidores están ocupados.
                </p>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg shadow-md">
                <h4 className="text-lg font-medium text-emerald-400">
                  Tiempo en sistema (W
                  <span style={{ fontSize: "0.75em", verticalAlign: "sub" }}>
                    s
                  </span>
                  )
                </h4>
                <p className="text-2xl font-bold text-white">
                  {unit === "hours"
                    ? `${formatNumber(results.Ws)} horas`
                    : `${formatNumber(results.Ws * 60)} minutos`}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Tiempo promedio en el sistema.
                </p>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg shadow-md">
                <h4 className="text-lg font-medium text-emerald-400">
                  Clientes en sistema (L
                  <span style={{ fontSize: "0.75em", verticalAlign: "sub" }}>
                    s
                  </span>
                  )
                </h4>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(results.Ls)}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Promedio de clientes en el sistema.
                </p>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg shadow-md">
                <h4 className="text-lg font-medium text-emerald-400">
                  Prob. 0 clientes (P₀)
                </h4>
                <p className="text-2xl font-bold text-white">
                  {(results.P0 * 100).toFixed(2)}%
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Probabilidad de 0 clientes.
                </p>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg shadow-md">
                <h4 className="text-lg font-medium text-emerald-400">
                  Tiempo en cola (Wq)
                </h4>
                <p className="text-2xl font-bold text-white">
                  {unit === "hours"
                    ? `${formatNumber(results.Wq)} horas`
                    : `${formatNumber(results.Wq * 60)} minutos`}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Tiempo promedio en cola.
                </p>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg shadow-md">
                <h4 className="text-lg font-medium text-emerald-400">
                  Clientes en cola (Lq)
                </h4>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(results.Lq)}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Promedio de clientes en cola.
                </p>
              </div>
              {results.Pn !== null && (
                <div className="p-4 bg-gray-900 rounded-lg shadow-md col-span-1 md:col-span-2 lg:col-span-3">
                  <h4 className="text-lg font-medium text-emerald-400">
                    Probabilidad (Pₙ)
                  </h4>
                  <p className="text-lg text-white">
                    Para n = {results.n}: {(results.Pn * 100).toFixed(4)}%
                  </p>
                </div>
              )}
            </div>
          )}
          {/* Resultados para SIN SELECCIÓN y CON SELECCIÓN */}
          {(selection === "SIN SELECCIÓN" || selection === "CON SELECCIÓN") && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-900 rounded-lg shadow-md">
                <h4 className="text-lg font-medium text-emerald-400">
                  ρ crítico
                </h4>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(results.rhoCritico)}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Valor crítico de utilización.
                </p>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg shadow-md">
                <h4 className="text-lg font-medium text-emerald-400">π₀</h4>
                <p className="text-2xl font-bold text-white">
                  {(results.pi0 * 100).toFixed(2)}%
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Probabilidad de 0 clientes.
                </p>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg shadow-md">
                <h4 className="text-lg font-medium text-emerald-400">N</h4>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(results.N)}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Clientes en sistema.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default MM2;
