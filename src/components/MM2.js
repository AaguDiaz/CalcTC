import React, { useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const MM2 = () => {
  // Estados para los campos de entrada y resultados
  const [lambda, setLambda] = useState("");
  const [mu, setMu] = useState("");
  const [mu1, setMu1] = useState("");
  const [mu2, setMu2] = useState("");
  const [mu3, setMu3] = useState(""); // New state for third server
  const [rhoCritico3, setRhoCritico3] = useState(""); // New state for critical rho
  const [n, setN] = useState("");
  const [selection, setSelection] = useState("MU IGUALES");
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});
  const [muUnit, setMuUnit] = useState("horas");
  const [showClearModal, setShowClearModal] = useState(false);
  const [showAmbosOcupados, setShowAmbosOcupados] = useState(true);

  // Limpiar todos los campos y resultados al cambiar selección
  const handleSelectionChange = (e) => {
    setSelection(e.target.value);
    setLambda("");
    setMu("");
    setMu1("");
    setMu2("");
    setMu3("");
    setRhoCritico3("");
    setN("");
    setResults(null);
    setErrors({});
  };

  // Validación de los campos de entrada
  const validateInputs = () => {
    const λ = parseFloat(lambda);
    const μ1 = parseFloat(mu1);
    const μ2 = parseFloat(mu2);
    const μ3 = parseFloat(mu3);
    const rhoCrit = parseFloat(rhoCritico3);
    const nValue = parseFloat(n);
    const newErrors = {};

    if (!lambda) newErrors.lambda = "Este campo es obligatorio";
    if (selection === "MU IGUALES") {
      if (!mu) newErrors.mu = "Este campo es obligatorio";
      if (mu && parseFloat(mu) <= 0)
        newErrors.general = "El tiempo de servicio debe ser positivo";
    } else if (selection === "DISTINTO MU") {
      if (!mu1) newErrors.mu1 = "Este campo es obligatorio";
      if (!mu2) newErrors.mu2 = "Este campo es obligatorio";
      if (mu1 && mu2 && (μ1 <= 0 || μ2 <= 0))
        newErrors.general = "Las tasas de servicio deben ser positivas";
      // No bloquear si λ >= μ1 + μ2, solo avisar en resultados
    } else if (selection === "UNIFICADO") {
      if (!mu1) newErrors.mu1 = "Este campo es obligatorio";
      if (!mu2) newErrors.mu2 = "Este campo es obligatorio";
      if (mu1 && mu2 && (μ1 <= 0 || μ2 <= 0))
        newErrors.general = "Las tasas de servicio deben ser positivas";
      if (lambda && mu1 && mu2 && λ >= μ1 + μ2)
        newErrors.general =
          "λ debe ser menor que μ1 + μ2 para un sistema estable";
    } else if (selection === "EVALUAR TERCER SERVIDOR") {
      if (!mu) newErrors.mu = "Este campo es obligatorio";
      if (!mu3) newErrors.mu3 = "Este campo es obligatorio";
      if (!rhoCritico3) newErrors.rhoCritico3 = "Este campo es obligatorio";
      if (mu && parseFloat(mu) <= 0)
        newErrors.mu = "La tasa de servicio debe ser positiva";
      if (mu3 && parseFloat(mu3) <= 0)
        newErrors.mu3 = "La tasa del tercer servidor debe ser positiva";
      if (rhoCritico3 && (rhoCrit <= 0 || rhoCrit > 1))
        newErrors.rhoCritico3 = "ρ crítico debe estar entre 0 y 1";
      if (lambda && mu && mu3 && λ >= 2 * parseFloat(mu) + μ3)
        newErrors.general =
          "λ debe ser menor que 2μ + μ3 para un sistema estable";
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
      // En este modo, los valores ingresados son horas directamente
      const μ1calc = parseFloat(mu1);
      const μ2calc = parseFloat(mu2);
      const μs = μ1calc + μ2calc;
      const ρ = λ / μs;
      const Ls = ρ / (1 - ρ);
      const Ws = Ls / λ;
      const P0 = 1 - ρ;
      const P1 = ρ * P0;
      const Lq = Math.pow(ρ, 2) / (1 - ρ);
      const Wq = Lq / λ;
      const ambosOcupados = 1 - P0 - P1;
      const inestable = ρ >= 1;
      const saturado = λ >= μs;
      setResults({
        ρ,
        ρPorcentaje: ρ * 100,
        μ1: μ1calc,
        μ2: μ2calc,
        μs,
        Ws,
        Ls,
        P0,
        P1,
        ambosOcupados,
        Lq,
        Wq,
        inestable,
        saturado,
      });
      return;
    }
    // Unificación de Sin selección y Con selección
    if (selection === "UNIFICADO") {
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

      let μ1h, μ2h;
      if (muUnit === "horas") {
        μ1h = parseFloat(mu1);
        μ2h = parseFloat(mu2);
      } else if (muUnit === "minutos") {
        μ1h = parseFloat(mu1) / 60;
        μ2h = parseFloat(mu2) / 60;
      }
      const rSin = μ2h / μ1h;
      const rhoCriticoSin =
        1 - Math.sqrt((rSin * (1 + rSin)) / (1 + Math.pow(rSin, 2)));
      const aSin = (2 * μ1h * μ2h) / (μ1h + μ2h);
      const pi0Sin = (1 - rhoNormal) / (1 - rhoNormal + λ / aSin);
      const NSin = λ / ((1 - rhoNormal) * (λ + (1 - rhoNormal) * aSin));
      const WsSin = NSin / λ;

      const rCon = μ2rate / μ1rate;
      const aQuad = 1 + rCon * rCon;
      const bQuad = -(2 + rCon * rCon);
      const cQuad = -(2 * rCon - 1) * (1 + rCon);
      const discriminant = bQuad * bQuad - 4 * aQuad * cQuad;
      let rhoCriticoCon = null;
      if (discriminant >= 0) {
        rhoCriticoCon = (-bQuad + Math.sqrt(discriminant)) / (2 * aQuad);
      }
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
        sin: {
          rhoCritico: rhoCriticoSin,
          pi0: pi0Sin,
          N: NSin,
          Ws: WsSin,
        },
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
    // Evaluar tercer servidor
    if (selection === "EVALUAR TERCER SERVIDOR") {
      // Usar los valores ingresados directamente para mus y musThree
      const muValue = parseFloat(mu);
      const mu3Value = parseFloat(mu3);
      const mus = 2 * muValue;
      const musThree = muValue + muValue + mu3Value;
      const rhoCritico = parseFloat(rhoCritico3);
      const rho = lambda && mus ? parseFloat(lambda) / mus : 0;
      const rhoThree = lambda && musThree ? parseFloat(lambda) / musThree : 0;

      // Stability checks
      const isRhoUnstable = rho >= rhoCritico;
      const isRhoThreeUnstable = rhoThree >= rhoCritico;

      const Ls = rho / (1 - rho);
      const Ws = Ls / (parseFloat(lambda) || 1);
      const P0 = 1 - rho;
      const P1 = rho * P0;
      const Lq = Math.pow(rho, 2) / (1 - rho);
      const Wq = Lq / (parseFloat(lambda) || 1);
      const ambosOcupados = 1 - P0 - P1;
      const inestable = rho >= 1;

      // M/M/3 calculations
      const LsThree = rhoThree / (1 - rhoThree);
      const WsThree = LsThree / (parseFloat(lambda) || 1);
      const P0Three = 1 - rhoThree;
      const P1Three = rhoThree * P0Three;
      const LqThree = Math.pow(rhoThree, 2) / (1 - rhoThree);
      const WqThree = LqThree / (parseFloat(lambda) || 1);
      const todosOcupados = 1 - P0Three - P1Three;

      setResults({
        ρ: rho,
        ρPorcentaje: rho * 100,
        ρThree: rhoThree,
        ρThreePorcentaje: rhoThree * 100,
        rhoCritico,
        isRhoUnstable,
        isRhoThreeUnstable,
        μ: muValue,
        μ3: mu3Value,
        μs: mus,
        μsThree: musThree,
        Ws,
        Ls,
        P0,
        P1,
        ambosOcupados,
        Lq,
        Wq,
        WsThree,
        LsThree,
        P0Three,
        P1Three,
        todosOcupados,
        LqThree,
        WqThree,
        inestable,
        inestableThree: rhoThree >= 1,
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
    setMu3("");
    setRhoCritico3("");
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
              <option value="MU IGUALES">Iguales (μ)</option>
              <option value="DISTINTO MU">Distinto (μ)</option>
              <option value="UNIFICADO">Sin selección y con selección</option>
              <option value="EVALUAR TERCER SERVIDOR">
                Evaluar tercer servidor
              </option>
            </select>
          </div>

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
                <input
                  type="number"
                  id="mu1"
                  value={mu1}
                  onChange={(e) => setMu1(e.target.value)}
                  className="w-full p-4 pt-6 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Ej: 5 (clientes/hora)"
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
                  placeholder="Ej: 9 (clientes/hora)"
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
          {selection === "EVALUAR TERCER SERVIDOR" && (
            <>
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
              <div className="relative">
                <label
                  htmlFor="mu3"
                  className="block text-emerald-400 text-base font-medium mb-2"
                >
                  Tasa de servicio tercer servidor (μ₃)
                </label>
                <input
                  type="number"
                  id="mu3"
                  value={mu3}
                  onChange={(e) => setMu3(e.target.value)}
                  className="w-full p-4 pt-6 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Ej. 4 (clientes/hora)"
                  step="0.1"
                  min="0"
                  required
                />
                {errors.mu3 && (
                  <p className="text-red-500 text-sm mt-1">{errors.mu3}</p>
                )}
              </div>
              <div className="relative">
                <label
                  htmlFor="rhoCritico3"
                  className="block text-emerald-400 text-base font-medium mb-2"
                >
                  ρ crítico
                </label>
                <input
                  type="number"
                  id="rhoCritico3"
                  value={rhoCritico3}
                  onChange={(e) => setRhoCritico3(e.target.value)}
                  className="w-full p-4 pt-6 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Ej. 0.85"
                  step="0.01"
                  min="0"
                  max="1"
                  required
                />
                {errors.rhoCritico3 && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.rhoCritico3}
                  </p>
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
          {(selection === "MU IGUALES" || selection === "DISTINTO MU") && (
            <React.Fragment>
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
                        {formatNumber(results.μ1)}{" "}
                        <span className="text-base text-gray-400">horas</span>
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
                        {formatNumber(results.μ2)}{" "}
                        <span className="text-base text-gray-400">horas</span>
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Tiempo de servicio operador 2.
                      </p>
                    </div>
                  </>
                )}
                <div className="p-4 bg-gray-900 rounded-lg shadow-md">
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
              </div>
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
              {results.saturado && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 p-4 mb-4 bg-red-900 text-white rounded-lg flex items-center space-x-3 shadow-md">
                  <FaExclamationTriangle
                    className="text-yellow-400"
                    size={20}
                  />
                  <span className="text-sm font-medium">
                    ¡Atención! El sistema está saturado o colapsado (λ ≥ μ₁ +
                    μ₂). Los resultados pueden no ser representativos.
                  </span>
                </div>
              )}
              {!results.saturado && results.inestable && (
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
          {selection === "EVALUAR TERCER SERVIDOR" && results && (
            <>
              {/* Solo mostrar rho y mensajes de estabilidad */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-900 rounded-lg shadow-md">
                  <h4 className="text-lg font-medium text-emerald-400 mb-2">
                    Sistema con dos servidores
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold">Utilización (ρ):</span>{" "}
                      {formatNumber(results.ρ)}{" "}
                      <span className="text-base text-gray-400">
                        ({formatNumber(results.ρPorcentaje)}%)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-900 rounded-lg shadow-md">
                  <h4 className="text-lg font-medium text-emerald-400 mb-2">
                    Sistema con tres servidores
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold">Utilización (ρ):</span>{" "}
                      {formatNumber(results.ρThree)}{" "}
                      <span className="text-base text-gray-400">
                        ({formatNumber(results.ρThreePorcentaje)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Mensaje de recomendación sobre agregar el tercer servidor */}
              {(() => {
                const rho2 = results.ρ;
                const rho3 = results.ρThree;
                const rhoCrit = results.rhoCritico;
                let mensaje = "";
                let color = "bg-blue-900";
                if (rho2 > rhoCrit && rho3 < rhoCrit) {
                  mensaje = `Conviene agregar el tercer servidor. El sistema con dos servidores está más congestionado que el crítico, pero con tres servidores estaría por debajo del límite.`;
                  color = "bg-green-900";
                } else if (rho2 < rhoCrit) {
                  mensaje = `No hace falta agregar el tercer servidor. El sistema con dos servidores está por debajo del límite crítico.`;
                  color = "bg-emerald-900";
                } else if (rho2 === rho3) {
                  mensaje = `Indistinto. Ambos sistemas tienen la misma congestión.`;
                  color = "bg-yellow-900";
                } else if (rho2 > rhoCrit && rho3 > rhoCrit) {
                  if (rho2 < rho3) {
                    mensaje = `No conviene agregar el tercer servidor. Ambos sistemas están por encima del límite crítico, pero el sistema con dos servidores está menos congestionado.`;
                    color = "bg-red-900";
                  } else if (rho3 < rho2) {
                    mensaje = `Conviene agregar el tercer servidor. Ambos sistemas están por encima del límite crítico, pero el sistema con tres servidores está menos congestionado.`;
                    color = "bg-orange-900";
                  } else {
                    mensaje = `Indistinto. Ambos sistemas tienen la misma congestión.`;
                    color = "bg-yellow-900";
                  }
                } else {
                  mensaje = `Indistinto. Ambos sistemas tienen congestión similar.`;
                  color = "bg-gray-900";
                }
                return (
                  <div
                    className={`col-span-1 md:col-span-2 lg:col-span-3 p-4 mb-4 mt-8 ${color} text-white rounded-lg flex items-center space-x-3 shadow-md`}
                  >
                    <span className="text-sm font-medium">{mensaje}</span>
                  </div>
                );
              })()}
            </>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default MM2;
