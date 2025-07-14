// queuingLogic.js

export const calcularResultados = ({ lambda, es, tita, esUnit, titaUnit }) => {
  const lambdaValue = parseFloat(lambda);
  let esValue = parseFloat(es);
  let titaValue = parseFloat(tita);

  // Conversión de unidades a horas
  if (esUnit === "minutos") esValue /= 60;
  if (esUnit === "segundos") esValue /= 3600;

  // El input de varianza en el código original se trata como desviación estándar para la conversión de unidades
  let titaStd = titaValue;
  if (titaUnit === "minutos" || titaUnit === "min") titaStd /= 60;
  if (titaUnit === "segundos" || titaUnit === "seg") titaStd /= 3600;
  
  const titaVar = Math.pow(titaStd, 2); // Varianza en horas^2

  // --- Cálculos principales ---
  const mu = 1 / esValue;
  const rho = lambdaValue / mu;

  // Validar condición de estabilidad (rho < 1)
  if (rho >= 1) {
    return { error: "El factor de utilización (ρ) debe ser menor a 1. La tasa de llegada es demasiado alta para la capacidad de servicio." };
  }

  // Fórmulas principales del M/G/1 (basadas en el código original)
  const en = (rho / (1 - rho)) * (1 - (rho / 2) * (1 - mu * mu * titaVar));
  const et_direct = (1 / (mu * (1 - rho))) * (1 - (rho / 2) * (1 - mu * mu * titaVar));

  // --- Cálculos: Lq y Wq ---
  const lq = (lambdaValue * lambdaValue ) / ( mu * (mu - lambdaValue));
  const wq = (lambdaValue) / ( mu * (mu - lambdaValue));

  return {
    mu,
    rho,
    en,
    et_direct,
    lq,
    wq,
  };
};