import React, { useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const MM2 = () => {
  // Estados para los campos de entrada y resultados
  const [lambda, setLambda] = useState("");
  const [mu, setMu] = useState("");
  const [mu1, setMu1] = useState("");
  const [mu2, setMu2] = useState("");
  const [n, setN] = useState("");
  const [selection, setSelection] = useState("MU IGUALES");
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});
  // Unidad para la tasa de servicio
  const [muUnit, setMuUnit] = useState("horas");
  const [showClearModal, setShowClearModal] = useState(false);
  // Mostrar/ocultar probabilidad de ambos ocupados
  const [showAmbosOcupados, setShowAmbosOcupados] = useState(true);

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

  // Validación de los campos de entrada
  const validateInputs = () => {
    const λ = parseFloat(lambda);
    const μ1 = parseFloat(mu1);
    const μ2 = parseFloat(mu2);
    const nValue = parseFloat(n);
    const newErrors = {};

    if (!lambda) newErrors.lambda = "Este campo es obligatorio";
    if (selection === "MU IGUALES") {
      if (!mu) newErrors.mu = "Este campo es obligatorio";
      if (mu && parseFloat(mu) <= 0)
        newErrors.general = "El tiempo de servicio debe ser positivo";
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

  // Cálculo de resultados según el tipo de modelo seleccionado
  const calculateMM2 = () => {
    if (!validateInputs()) return;

    const λ = parseFloat(lambda);

    // Modo Iguales (μ)
    if (selection === "MU IGUALES") {
      let μ, μs;
      let tiempoServicio = parseFloat(mu);
      if (muUnit === "horas") {
        μ = 1 / tiempoServicio;
      } else if (muUnit === "minutos") {
        μ = (1 / tiempoServicio) * 60;
      }
      μs = 2 * μ;
      const ρ = λ / μs;
      const Ls = ρ / (1 - ρ);
      const Ws = Ls / λ;
      const P0 = 1 - ρ;
      const P1 = ρ * P0;
      const Lq = Math.pow(ρ, 2) / (1 - ρ);
      const Wq = Lq / λ;
      let Pn = null;
      if (n !== "") {
        const nValue = parseFloat(n);
        Pn = (1 - nValue) * Math.pow(ρ, nValue);
      }
      const ambosOcupados = 1 - P0 - P1;
      const inestable = ρ >= 1;
      setResults({
        ρ,
        ρPorcentaje: ρ * 100,
        μ,
        μs,
        Ws,
        Ls,
        P0,
        P1,
        ambosOcupados,
        Lq,
        Wq,
        Pn: n !== "" ? Pn : null,
        n: n !== "" ? parseFloat(n) : null,
        inestable,
      });
      return;
    }
    // Modo Distinto (μ)
    if (selection === "DISTINTO MU") {
      let μ1calc, μ2calc, μs;
      if (muUnit === "horas") {
        μ1calc = parseFloat(mu1);
        μ2calc = parseFloat(mu2);
        μs = μ1calc + μ2calc;
      } else if (muUnit === "minutos") {
        μ1calc = (1 / parseFloat(mu1)) * 60;
        μ2calc = (1 / parseFloat(mu2)) * 60;
        μs = μ1calc + μ2calc;
      }
      const ρ = λ / μs;
      const Ls = ρ / (1 - ρ);
      const Ws = Ls / λ;
      const P0 = 1 - ρ;
      const P1 = ρ * P0;
      const Lq = Math.pow(ρ, 2) / (1 - ρ);
      const Wq = Lq / λ;
      const ambosOcupados = 1 - P0 - P1;
      const inestable = ρ >= 1;
      setResults({
        ρ,
        ρPorcentaje: ρ * 100,
        μs,
        Ws,
        Ls,
        P0,
        P1,
        ambosOcupados,
        Lq,
        Wq,
        inestable,
      });
      return;
    }
    // Unificación de Sin selección y Con selección
    if (selection === "UNIFICADO") {
      // μ1 y μ2 en clientes/hora según unidad
      let μ1rate, μ2rate, μsUnificado;
      if (muUnit === "horas") {
        μ1rate = parseFloat(mu1);
        μ2rate = parseFloat(mu2);
        μsUnificado = μ1rate + μ2rate;
      } else if (muUnit === "minutos") {
        μ1rate = (1 / parseFloat(mu1)) * 60;
        μ2rate = (1 / parseFloat(mu2)) * 60;
        μsUnificado = μ1rate + μ2rate;
      }
      const rhoNormal = λ / μsUnificado;

      // Sin selección
      // Para la fórmula de sin selección, necesitamos los tiempos medios de servicio en horas
      let μ1h, μ2h;
      if (muUnit === "horas") {
        μ1h = parseFloat(mu1);
        μ2h = parseFloat(mu2);
      } else if (muUnit === "minutos") {
        μ1h = parseFloat(mu1) / 60;
        μ2h = parseFloat(mu2) / 60;
      }
      // r = μ2h / μ1h
      const rSin = μ2h / μ1h;
      // rho crítico = 1 - sqrt((r × (1 + r)) / (1 + r²))
      const rhoCriticoSin =
        1 - Math.sqrt((rSin * (1 + rSin)) / (1 + Math.pow(rSin, 2)));
      // a = (2 * μ1h * μ2h) / (μ1h + μ2h)
      const aSin = (2 * μ1h * μ2h) / (μ1h + μ2h);
      // π0 = (1 - rhoNormal) / (1 - rhoNormal + λ / aSin)
      const pi0Sin = (1 - rhoNormal) / (1 - rhoNormal + λ / aSin);
      // N = λ / ((1 - rhoNormal) * (λ + (1 - rhoNormal) * aSin))
      const NSin = λ / ((1 - rhoNormal) * (λ + (1 - rhoNormal) * aSin));
      // Ws = N / λ (en horas)
      const WsSin = NSin / λ;

      // Con selección
      const rCon = μ2rate / μ1rate;
      // cuadrática: rhoCritico^2 * (1 + r^2) - rhoCritico * (2 + r^2) - (2r - 1)*(1 + r) = 0
      const aQuad = 1 + rCon * rCon;
      const bQuad = -(2 + rCon * rCon);
      const cQuad = -(2 * rCon - 1) * (1 + rCon);
      const discriminant = bQuad * bQuad - 4 * aQuad * cQuad;
      let rhoCriticoCon = null;
      if (discriminant >= 0) {
        rhoCriticoCon = (-bQuad + Math.sqrt(discriminant)) / (2 * aQuad);
      }
      // aCon usa tasas
      const aCon =
        ((2 * λ + μsUnificado) * μ1rate * μ2rate) /
        (μsUnificado * (λ + μ2rate));
      const pi0Con = (1 - rhoNormal) / (1 - rhoNormal + λ / aCon);
      const NCon = λ / ((1 - rhoNormal) * (λ + (1 - rhoNormal) * aCon));
      const WsCon = NCon / λ;

      setResults({
        selectionType: "UNIFICADO",
        rhoNormal,
        μs: μsUnificado,
        // Sin selección
        sin: {
          rhoCritico: rhoCriticoSin,
          pi0: pi0Sin,
          N: NSin,
          Ws: WsSin,
        },
        // Con selección
        con: {
          rhoCritico: rhoCriticoCon,
          pi0: pi0Con,
          N: NCon,
          Ws: WsCon,
          discriminant,
        },
      });
      return;
    }
  };

  // Limpia todos los campos y resultados
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

  // Formatea los números para mostrar con 4 decimales si es necesario
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

      {/* Formulario de entrada de datos */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-8 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campo para tasa de llegada */}
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

          {/* Selector de modo de cálculo */}
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
              <option value="MU IGUALES">Iguales (μ)</option>
              <option value="DISTINTO MU">Distinto (μ)</option>
              <option value="UNIFICADO">Sin selección y con selección</option>
            </select>
          </div>

          {/* Campos para tasas de servicio según selección */}
          {selection === "MU IGUALES" && (
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
                  placeholder="Ej. 3"
                  step="0.1"
                  min="0"
                  required
                />
                {/* Selector de unidad de tasa de servicio (solo horas y minutos) */}
                <select
                  value={muUnit}
                  onChange={(e) => setMuUnit(e.target.value)}
                  className="p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none cursor-pointer"
                >
                  <option value="horas">horas</option>
                  <option value="minutos">minutos</option>
                </select>
              </div>
              {errors.mu && (
                <p className="text-red-500 text-sm mt-1">{errors.mu}</p>
              )}
            </div>
          )}
          {(selection === "DISTINTO MU" || selection === "UNIFICADO") && (
            <>
              <div className="relative">
                <label
                  htmlFor="mu1"
                  className="block text-emerald-400 text-base font-medium mb-2"
                >
                  Tasa de servicio 1 (μ₁)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    id="mu1"
                    value={mu1}
                    onChange={(e) => setMu1(e.target.value)}
                    className="w-full p-4 pt-6 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Ej. 2"
                    step="0.1"
                    min="0"
                    required
                  />
                  {/* Selector de unidad de tasa de servicio (solo horas y minutos) */}
                  <select
                    value={muUnit}
                    onChange={(e) => setMuUnit(e.target.value)}
                    className="p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none cursor-pointer"
                  >
                    <option value="horas">horas</option>
                    <option value="minutos">minutos</option>
                  </select>
                </div>
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
                <div className="flex gap-2">
                  <input
                    type="number"
                    id="mu2"
                    value={mu2}
                    onChange={(e) => setMu2(e.target.value)}
                    className="w-full p-4 pt-6 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Ej. 3"
                    step="0.1"
                    min="0"
                    required
                  />
                  {/* Selector de unidad de tasa de servicio (solo horas y minutos) */}
                  <select
                    value={muUnit}
                    onChange={(e) => setMuUnit(e.target.value)}
                    className="p-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none cursor-pointer"
                  >
                    <option value="horas">horas</option>
                    <option value="minutos">minutos</option>
                  </select>
                </div>
                {errors.mu2 && (
                  <p className="text-red-500 text-sm mt-1">{errors.mu2}</p>
                )}
              </div>
            </>
          )}

          {/* Campo para n solo si es MU IGUALES */}
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

      {/* Modal de confirmación para limpiar campos */}
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
          {/* Resultados para MU IGUALES y DISTINTO MU */}
          {(selection === "MU IGUALES" || selection === "DISTINTO MU") && (
            <React.Fragment>
              {/* Mostrar info de entrada y tasas */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-900 rounded-lg shadow-md">
                  <h4 className="text-lg font-medium text-emerald-400">
                    Tasa de llegada (λ)
                  </h4>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(parseFloat(lambda))}{" "}
                    <span className="text-base text-gray-400">
                      clientes/hora
                    </span>
                  </p>
                  <p className="text-sm text-gray-400 mt-1">Valor ingresado.</p>
                </div>
                {selection === "MU IGUALES" && (
                  <div className="p-4 bg-gray-900 rounded-lg shadow-md">
                    <h4 className="text-lg font-medium text-emerald-400">
                      Tiempo medio de servicio (ingresado)
                    </h4>
                    <p className="text-2xl font-bold text-white">
                      {formatNumber(parseFloat(mu))}{" "}
                      <span className="text-base text-gray-400">{muUnit}</span>
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Tiempo de servicio por operador.
                    </p>
                  </div>
                )}
                {selection === "DISTINTO MU" && (
                  <>
                    <div className="p-4 bg-gray-900 rounded-lg shadow-md">
                      <h4 className="text-lg font-medium text-emerald-400">
                        Tiempo medio de servicio 1 (ingresado)
                      </h4>
                      <p className="text-2xl font-bold text-white">
                        {formatNumber(parseFloat(mu1))}{" "}
                        <span className="text-base text-gray-400">
                          {muUnit}
                        </span>
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Tiempo de servicio operador 1.
                      </p>
                    </div>
                    <div className="p-4 bg-gray-900 rounded-lg shadow-md">
                      <h4 className="text-lg font-medium text-emerald-400">
                        Tiempo medio de servicio 2 (ingresado)
                      </h4>
                      <p className="text-2xl font-bold text-white">
                        {formatNumber(parseFloat(mu2))}{" "}
                        <span className="text-base text-gray-400">
                          {muUnit}
                        </span>
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Tiempo de servicio operador 2.
                      </p>
                    </div>
                  </>
                )}
                <div className="p-4 bg-gray-900 rounded-lg shadow-md">
                  <h4 className="text-lg font-medium text-emerald-400">
                    Tasa total de servicio (
                    {selection === "MU IGUALES" ? "2μ" : "μ₁ + μ₂"})
                  </h4>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(results.μs)}{" "}
                    <span className="text-base text-gray-400">
                      clientes/hora
                    </span>
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Suma de tasas de ambos operadores.
                  </p>
                </div>
              </div>
              {/* Checkbox para mostrar/ocultar probabilidad de ambos ocupados */}
              {selection === "DISTINTO MU" && (
                <div className="mb-4 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showAmbosOcupados"
                    checked={showAmbosOcupados}
                    onChange={() => setShowAmbosOcupados((v) => !v)}
                    className="form-checkbox h-5 w-5 text-emerald-500 bg-gray-800 border-gray-600 rounded focus:ring-emerald-400"
                  />
                  <label
                    htmlFor="showAmbosOcupados"
                    className="text-gray-200 text-base cursor-pointer select-none"
                  >
                    Mostrar probabilidad de ambos operadores ocupados
                  </label>
                </div>
              )}
              {results.inestable && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 p-4 mb-4 bg-red-900 text-white rounded-lg flex items-center space-x-3 shadow-md">
                  <FaExclamationTriangle
                    className="text-yellow-400"
                    size={20}
                  />
                  <span className="text-sm font-medium">
                    ¡Atención! El sistema es inestable (ρ ≥ 1). Los resultados
                    pueden no ser representativos.
                  </span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Utilización */}
                <div className="p-4 bg-gray-900 rounded-lg shadow-md">
                  <h4 className="text-lg font-medium text-emerald-400">
                    Utilización (ρ)
                  </h4>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(results.ρ)}{" "}
                    <span className="text-base text-gray-400">
                      ({formatNumber(results.ρPorcentaje)}%)
                    </span>
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Proporción del tiempo que los servidores están ocupados.
                  </p>
                </div>
                {/* Tiempo en sistema */}
                <div className="p-4 bg-gray-900 rounded-lg shadow-md">
                  <h4 className="text-lg font-medium text-emerald-400">
                    Tiempo en sistema (W
                    <span style={{ fontSize: "0.75em", verticalAlign: "sub" }}>
                      s
                    </span>
                    )
                  </h4>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(results.Ws)}{" "}
                    <span className="text-base text-gray-400">horas</span>
                  </p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {formatNumber(results.Ws * 60)}{" "}
                    <span className="text-base text-gray-400">minutos</span>
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Tiempo promedio en el sistema.
                  </p>
                </div>
                {/* Clientes en sistema */}
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
                {/* Probabilidad de 0 clientes */}
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
                {/* Tiempo en cola */}
                <div className="p-4 bg-gray-900 rounded-lg shadow-md">
                  <h4 className="text-lg font-medium text-emerald-400">
                    Tiempo en cola (Wq)
                  </h4>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(results.Wq)}{" "}
                    <span className="text-base text-gray-400">horas</span>
                  </p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {formatNumber(results.Wq * 60)}{" "}
                    <span className="text-base text-gray-400">minutos</span>
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Tiempo promedio en cola.
                  </p>
                </div>
                {/* Clientes en cola */}
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
                {/* Probabilidad de ambos operadores ocupados (opcional) */}
                {selection === "DISTINTO MU" && showAmbosOcupados && (
                  <div className="p-4 bg-gray-900 rounded-lg shadow-md col-span-1 md:col-span-2 lg:col-span-3">
                    <h4 className="text-lg font-medium text-emerald-400">
                      Probabilidad de ambos operadores ocupados
                    </h4>
                    <p className="text-lg text-white">
                      {formatNumber(results.ambosOcupados * 100)}%
                      <span className="text-gray-400 text-base ml-2">
                        (∑ Pₙ, n ≥ 2)
                      </span>
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Es la probabilidad de que ambos servidores estén ocupados
                      (n ≥ 2 en el sistema).
                    </p>
                  </div>
                )}
                {/* Probabilidad para n clientes */}
                {selection === "MU IGUALES" && results.Pn !== null && (
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
            </React.Fragment>
          )}
          {/* Resultados para UNIFICADO (Sin selección y Con selección) */}
          {selection === "UNIFICADO" && results && (
            <>
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-900 rounded-lg shadow-md col-span-1 md:col-span-2 lg:col-span-3">
                  <h4 className="text-lg font-medium text-emerald-400">
                    Tasa total de servicio (μ₁ + μ₂)
                  </h4>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(results.μs)}{" "}
                    <span className="text-base text-gray-400">
                      clientes/hora
                    </span>
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Suma de tasas de ambos operadores.
                  </p>
                </div>
                <div className="p-4 bg-gray-900 rounded-lg shadow-md col-span-1 md:col-span-2 lg:col-span-3">
                  <h4 className="text-lg font-medium text-emerald-400">
                    Utilización normal (ρ = λ / μ₁ + μ₂)
                  </h4>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(results.rhoNormal)}{" "}
                    <span className="text-base text-gray-400">
                      ({formatNumber(results.rhoNormal * 100)}%)
                    </span>
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Proporción del tiempo que los servidores están ocupados.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {/* Sin selección */}
                <div className="p-4 bg-gray-900 rounded-lg shadow-md">
                  <h4 className="text-lg font-medium text-emerald-400 mb-2">
                    Sin selección
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold">ρ crítico:</span>{" "}
                      {formatNumber(results.sin.rhoCritico)}
                    </div>
                    <div>
                      <span className="font-semibold">π₀:</span>{" "}
                      {(results.sin.pi0 * 100).toFixed(2)}%
                    </div>
                    <div>
                      <span className="font-semibold">N:</span>{" "}
                      {formatNumber(results.sin.N)}
                    </div>
                    <div>
                      <span className="font-semibold">Wₛ:</span>{" "}
                      {formatNumber(results.sin.Ws)} horas
                      <span className="ml-2 text-gray-400">
                        ({formatNumber(results.sin.Ws * 60)} minutos)
                      </span>
                    </div>
                  </div>
                </div>
                {/* Con selección */}
                <div className="p-4 bg-gray-900 rounded-lg shadow-md">
                  <h4 className="text-lg font-medium text-emerald-400 mb-2">
                    Con selección
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold">ρ crítico:</span>{" "}
                      {results.con.rhoCritico !== null
                        ? formatNumber(results.con.rhoCritico)
                        : "No hay solución real"}
                    </div>
                    <div>
                      <span className="font-semibold">π₀:</span>{" "}
                      {(results.con.pi0 * 100).toFixed(2)}%
                    </div>
                    <div>
                      <span className="font-semibold">N:</span>{" "}
                      {formatNumber(results.con.N)}
                    </div>
                    <div>
                      <span className="font-semibold">Wₛ:</span>{" "}
                      {formatNumber(results.con.Ws)} horas
                      <span className="ml-2 text-gray-400">
                        ({formatNumber(results.con.Ws * 60)} minutos)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default MM2;
