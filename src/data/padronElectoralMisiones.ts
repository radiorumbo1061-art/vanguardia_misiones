/**
 * Padrón electoral estimado y datos demográficos para los 79 municipios de Misiones, Argentina.
 * Padrón provincial aproximado: ~988.000 electores habilitados.
 */

export interface DatosElectoralesMunicipio {
  id: number;
  nombre: string;
  departamento: string;
  zonaElectoral: string;
  electores: number; // Cantidad estimada de electores habilitados
  circuitos: number; // Cantidad de circuitos electorales
  mesasEstimadas: number; // Cantidad de mesas de votación estimadas
  participacionHistorica: number; // % promedio de participación (ej: 75.5%)
}

// Mapeo detallado de electores para los 79 municipios oficiales
export const PADRON_MISIONES_79: Record<string, { electores: number; mesas: number; participacion: number }> = {
  "Posadas": { electores: 295000, mesas: 840, participacion: 77.2 },
  "Garupá": { electores: 49500, mesas: 142, participacion: 74.8 },
  "Fachinal": { electores: 1200, mesas: 4, participacion: 78.5 },
  "Candelaria": { electores: 17500, mesas: 50, participacion: 75.1 },
  "Santa Ana": { electores: 7800, mesas: 23, participacion: 76.0 },
  "Loreto": { electores: 2100, mesas: 6, participacion: 79.2 },
  "Profundidad": { electores: 1150, mesas: 4, participacion: 80.1 },
  "Cerro Corá": { electores: 2400, mesas: 7, participacion: 77.0 },
  "Mártires": { electores: 1850, mesas: 6, participacion: 76.5 },
  "Apóstoles": { electores: 34600, mesas: 99, participacion: 75.8 },
  "Azara": { electores: 4200, mesas: 12, participacion: 78.0 },
  "San José": { electores: 6100, mesas: 18, participacion: 76.3 },
  "Tres Capones": { electores: 1950, mesas: 6, participacion: 79.5 },
  "Concepción de la Sierra": { electores: 9800, mesas: 28, participacion: 75.0 },
  "Santa María": { electores: 2200, mesas: 7, participacion: 77.8 },
  "San Javier": { electores: 13900, mesas: 40, participacion: 74.5 },
  "Itacaruaré": { electores: 3800, mesas: 11, participacion: 76.0 },
  "Florentino Ameghino": { electores: 2900, mesas: 9, participacion: 77.2 },
  "Mojón Grande": { electores: 3100, mesas: 9, participacion: 78.1 },
  "Leandro N. Alem": { electores: 32500, mesas: 93, participacion: 76.4 },
  "Cerro Azul": { electores: 6800, mesas: 20, participacion: 75.9 },
  "Bonpland": { electores: 2600, mesas: 8, participacion: 77.5 },
  "Gobernador López": { electores: 3200, mesas: 10, participacion: 77.5 },
  "Almafuerte": { electores: 1600, mesas: 5, participacion: 79.0 },
  "Dos Arroyos": { electores: 3400, mesas: 10, participacion: 76.8 },
  "Arroyo del Medio": { electores: 2700, mesas: 8, participacion: 78.2 },
  "Caá Yarí": { electores: 1750, mesas: 5, participacion: 79.1 },
  "Olegario Víctor Andrade": { electores: 1900, mesas: 6, participacion: 77.6 },
  "Oberá": { electores: 62400, mesas: 178, participacion: 76.0 },
  "Campo Ramón": { electores: 12800, mesas: 37, participacion: 74.8 },
  "Campo Viera": { electores: 12200, mesas: 35, participacion: 75.3 },
  "Guaraní": { electores: 6900, mesas: 20, participacion: 76.1 },
  "Los Helechos": { electores: 4600, mesas: 14, participacion: 77.4 },
  "Panambí": { electores: 6700, mesas: 20, participacion: 75.5 },
  "San Martín": { electores: 3100, mesas: 9, participacion: 78.0 },
  "General Alvear": { electores: 2150, mesas: 7, participacion: 78.8 },
  "Colonia Alberdi": { electores: 4500, mesas: 13, participacion: 76.7 },
  "San Ignacio": { electores: 12900, mesas: 37, participacion: 74.2 },
  "Gobernador Roca": { electores: 7900, mesas: 23, participacion: 75.9 },
  "Corpus Christi": { electores: 4500, mesas: 13, participacion: 76.5 },
  "Corpus": { electores: 4500, mesas: 13, participacion: 76.5 },
  "Santo Pipó": { electores: 5600, mesas: 16, participacion: 75.2 },
  "General Urquiza": { electores: 2100, mesas: 6, participacion: 78.4 },
  "Colonia Polana": { electores: 1450, mesas: 5, participacion: 80.0 },
  "Hipólito Yrigoyen": { electores: 2800, mesas: 8, participacion: 77.1 },
  "Jardín América": { electores: 22800, mesas: 66, participacion: 76.5 },
  "Puerto Leoni": { electores: 3600, mesas: 11, participacion: 76.0 },
  "Puerto Rico": { electores: 21800, mesas: 63, participacion: 78.2 },
  "Capioví": { electores: 7200, mesas: 21, participacion: 77.5 },
  "Garuhapé": { electores: 10400, mesas: 30, participacion: 75.1 },
  "Ruiz de Montoya": { electores: 4800, mesas: 14, participacion: 77.9 },
  "El Alcázar": { electores: 6900, mesas: 20, participacion: 76.2 },
  "Montecarlo": { electores: 28400, mesas: 82, participacion: 75.7 },
  "Puerto Piray": { electores: 10800, mesas: 31, participacion: 74.9 },
  "Caraguatay": { electores: 4500, mesas: 13, participacion: 76.8 },
  "Eldorado": { electores: 55800, mesas: 160, participacion: 76.2 },
  "Colonia Delicia": { electores: 6800, mesas: 20, participacion: 75.0 },
  "Nueve de Julio": { electores: 5200, mesas: 15, participacion: 76.4 },
  "9 de Julio": { electores: 5200, mesas: 15, participacion: 76.4 },
  "Santiago de Liniers": { electores: 2600, mesas: 8, participacion: 77.8 },
  "Colonia Victoria": { electores: 3900, mesas: 12, participacion: 76.9 },
  "Puerto Iguazú": { electores: 44200, mesas: 127, participacion: 73.8 },
  "Comandante Andresito": { electores: 19800, mesas: 57, participacion: 74.6 },
  "Colonia Wanda": { electores: 15600, mesas: 45, participacion: 75.4 },
  "Puerto Esperanza": { electores: 14200, mesas: 41, participacion: 75.0 },
  "Puerto Libertad": { electores: 8900, mesas: 26, participacion: 75.8 },
  "Bernardo de Irigoyen": { electores: 16200, mesas: 47, participacion: 73.5 },
  "San Antonio": { electores: 11400, mesas: 33, participacion: 74.0 },
  "Dos Hermanas": { electores: 5900, mesas: 17, participacion: 75.2 }, // Municipio Nº 79
  "San Pedro": { electores: 26200, mesas: 75, participacion: 74.8 },
  "Pozo Azul": { electores: 7200, mesas: 21, participacion: 76.1 }, // Municipio Nº 76
  "Fracrán": { electores: 6800, mesas: 20, participacion: 75.8 }, // Municipio Nº 78
  "Aristóbulo del Valle": { electores: 24300, mesas: 70, participacion: 75.5 },
  "Campo Grande": { electores: 14500, mesas: 42, participacion: 76.0 },
  "Dos de Mayo": { electores: 15800, mesas: 46, participacion: 76.2 },
  "Salto Encantado": { electores: 11500, mesas: 33, participacion: 76.2 }, // Municipio Nº 77
  "25 de Mayo": { electores: 13100, mesas: 38, participacion: 74.7 },
  "Alba Posse": { electores: 8400, mesas: 24, participacion: 75.9 },
  "Colonia Aurora": { electores: 7300, mesas: 21, participacion: 76.5 },
  "San Vicente": { electores: 43100, mesas: 124, participacion: 74.9 },
  "El Soberbio": { electores: 18900, mesas: 55, participacion: 73.2 }
};

/**
 * Devuelve los datos electorales proyectados para un municipio específico
 */
export function getDatosElectoralesMunicipio(nombreMunicipio: string) {
  const data = PADRON_MISIONES_79[nombreMunicipio];
  if (data) return data;
  // Fallback seguro por si no coincide exactamente el string
  return { electores: 5000, mesas: 15, participacion: 75.0 };
}
