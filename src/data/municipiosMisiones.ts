export interface MunicipioData {
  id: number;
  nombre: string;
  departamento: string;
  zonaElectoral: string;
  cabecera: boolean;
  circuitosEstimados: number;
  nota?: string;
}

export const DEPARTAMENTOS_MISIONES = [
  "Capital",
  "Candelaria",
  "Apóstoles",
  "Concepción",
  "San Javier",
  "Leandro N. Alem",
  "Oberá",
  "San Ignacio",
  "Libertador General San Martín",
  "Montecarlo",
  "Eldorado",
  "Iguazú",
  "General Manuel Belgrano",
  "San Pedro",
  "Cainguás",
  "25 de Mayo",
  "Guaraní",
] as const;

export const ZONAS_ELECTORALES = [
  "Zona Sur / Capital",
  "Zona Sur",
  "Zona Centro-Sur",
  "Zona Centro",
  "Zona Paraná Centro",
  "Zona Alto Paraná",
  "Zona Norte",
  "Zona Noreste",
  "Zona Centro-Este",
  "Zona Río Uruguay",
] as const;

export const MUNICIPIOS_MISIONES: MunicipioData[] = [
  // 1. Capital (3)
  { id: 1, nombre: "Posadas", departamento: "Capital", zonaElectoral: "Zona Sur / Capital", cabecera: true, circuitosEstimados: 32 },
  { id: 2, nombre: "Garupá", departamento: "Capital", zonaElectoral: "Zona Sur / Capital", cabecera: false, circuitosEstimados: 12 },
  { id: 3, nombre: "Fachinal", departamento: "Capital", zonaElectoral: "Zona Sur / Capital", cabecera: false, circuitosEstimados: 2 },

  // 2. Candelaria (6)
  { id: 4, nombre: "Candelaria", departamento: "Candelaria", zonaElectoral: "Zona Sur", cabecera: true, circuitosEstimados: 6 },
  { id: 5, nombre: "Santa Ana", departamento: "Candelaria", zonaElectoral: "Zona Sur", cabecera: false, circuitosEstimados: 3 },
  { id: 6, nombre: "Loreto", departamento: "Candelaria", zonaElectoral: "Zona Sur", cabecera: false, circuitosEstimados: 2 },
  { id: 7, nombre: "Profundidad", departamento: "Candelaria", zonaElectoral: "Zona Sur", cabecera: false, circuitosEstimados: 2 },
  { id: 8, nombre: "Cerro Corá", departamento: "Candelaria", zonaElectoral: "Zona Sur", cabecera: false, circuitosEstimados: 2 },
  { id: 9, nombre: "Mártires", departamento: "Candelaria", zonaElectoral: "Zona Sur", cabecera: false, circuitosEstimados: 2 },

  // 3. Apóstoles (4)
  { id: 10, nombre: "Apóstoles", departamento: "Apóstoles", zonaElectoral: "Zona Sur", cabecera: true, circuitosEstimados: 10 },
  { id: 11, nombre: "Azara", departamento: "Apóstoles", zonaElectoral: "Zona Sur", cabecera: false, circuitosEstimados: 3 },
  { id: 12, nombre: "San José", departamento: "Apóstoles", zonaElectoral: "Zona Sur", cabecera: false, circuitosEstimados: 4 },
  { id: 13, nombre: "Tres Capones", departamento: "Apóstoles", zonaElectoral: "Zona Sur", cabecera: false, circuitosEstimados: 2 },

  // 4. Concepción (2)
  { id: 14, nombre: "Concepción de la Sierra", departamento: "Concepción", zonaElectoral: "Zona Sur", cabecera: true, circuitosEstimados: 5 },
  { id: 15, nombre: "Santa María", departamento: "Concepción", zonaElectoral: "Zona Sur", cabecera: false, circuitosEstimados: 2 },

  // 5. San Javier (4)
  { id: 16, nombre: "San Javier", departamento: "San Javier", zonaElectoral: "Zona Río Uruguay", cabecera: true, circuitosEstimados: 5 },
  { id: 17, nombre: "Itacaruaré", departamento: "San Javier", zonaElectoral: "Zona Río Uruguay", cabecera: false, circuitosEstimados: 2 },
  { id: 18, nombre: "Florentino Ameghino", departamento: "San Javier", zonaElectoral: "Zona Río Uruguay", cabecera: false, circuitosEstimados: 2 },
  { id: 19, nombre: "Mojón Grande", departamento: "San Javier", zonaElectoral: "Zona Río Uruguay", cabecera: false, circuitosEstimados: 2 },

  // 6. Leandro N. Alem (8)
  { id: 20, nombre: "Leandro N. Alem", departamento: "Leandro N. Alem", zonaElectoral: "Zona Centro-Sur", cabecera: true, circuitosEstimados: 12 },
  { id: 21, nombre: "Cerro Azul", departamento: "Leandro N. Alem", zonaElectoral: "Zona Centro-Sur", cabecera: false, circuitosEstimados: 3 },
  { id: 22, nombre: "Bonpland", departamento: "Leandro N. Alem", zonaElectoral: "Zona Centro-Sur", cabecera: false, circuitosEstimados: 2 },
  { id: 23, nombre: "Almafuerte", departamento: "Leandro N. Alem", zonaElectoral: "Zona Centro-Sur", cabecera: false, circuitosEstimados: 2 },
  { id: 24, nombre: "Arroyo del Medio", departamento: "Leandro N. Alem", zonaElectoral: "Zona Centro-Sur", cabecera: false, circuitosEstimados: 2 },
  { id: 25, nombre: "Dos Arroyos", departamento: "Leandro N. Alem", zonaElectoral: "Zona Centro-Sur", cabecera: false, circuitosEstimados: 2 },
  { id: 26, nombre: "Gobernador López", departamento: "Leandro N. Alem", zonaElectoral: "Zona Centro-Sur", cabecera: false, circuitosEstimados: 2 },
  { id: 27, nombre: "Olegario Víctor Andrade", departamento: "Leandro N. Alem", zonaElectoral: "Zona Centro-Sur", cabecera: false, circuitosEstimados: 2 },
  { id: 28, nombre: "Caá Yarí", departamento: "Leandro N. Alem", zonaElectoral: "Zona Centro-Sur", cabecera: false, circuitosEstimados: 2 },

  // 7. Oberá (9)
  { id: 29, nombre: "Oberá", departamento: "Oberá", zonaElectoral: "Zona Centro", cabecera: true, circuitosEstimados: 18 },
  { id: 30, nombre: "Campo Ramón", departamento: "Oberá", zonaElectoral: "Zona Centro", cabecera: false, circuitosEstimados: 4 },
  { id: 31, nombre: "Campo Viera", departamento: "Oberá", zonaElectoral: "Zona Centro", cabecera: false, circuitosEstimados: 5 },
  { id: 32, nombre: "Guaraní", departamento: "Oberá", zonaElectoral: "Zona Centro", cabecera: false, circuitosEstimados: 3 },
  { id: 33, nombre: "Los Helechos", departamento: "Oberá", zonaElectoral: "Zona Centro", cabecera: false, circuitosEstimados: 2 },
  { id: 34, nombre: "Panambí", departamento: "Oberá", zonaElectoral: "Zona Río Uruguay", cabecera: false, circuitosEstimados: 3 },
  { id: 35, nombre: "San Martín", departamento: "Oberá", zonaElectoral: "Zona Centro", cabecera: false, circuitosEstimados: 2 },
  { id: 36, nombre: "General Alvear", departamento: "Oberá", zonaElectoral: "Zona Centro", cabecera: false, circuitosEstimados: 2 },
  { id: 37, nombre: "Colonia Alberdi", departamento: "Oberá", zonaElectoral: "Zona Centro", cabecera: false, circuitosEstimados: 2 },

  // 8. San Ignacio (8)
  { id: 38, nombre: "San Ignacio", departamento: "San Ignacio", zonaElectoral: "Zona Paraná Centro", cabecera: true, circuitosEstimados: 6 },
  { id: 39, nombre: "Colonia Polana", departamento: "San Ignacio", zonaElectoral: "Zona Paraná Centro", cabecera: false, circuitosEstimados: 2 },
  { id: 40, nombre: "Corpus Christi", departamento: "San Ignacio", zonaElectoral: "Zona Paraná Centro", cabecera: false, circuitosEstimados: 3 },
  { id: 41, nombre: "General Urquiza", departamento: "San Ignacio", zonaElectoral: "Zona Paraná Centro", cabecera: false, circuitosEstimados: 2 },
  { id: 42, nombre: "Gobernador Roca", departamento: "San Ignacio", zonaElectoral: "Zona Paraná Centro", cabecera: false, circuitosEstimados: 4 },
  { id: 43, nombre: "Hipólito Yrigoyen", departamento: "San Ignacio", zonaElectoral: "Zona Paraná Centro", cabecera: false, circuitosEstimados: 2 },
  { id: 44, nombre: "Jardín América", departamento: "San Ignacio", zonaElectoral: "Zona Paraná Centro", cabecera: false, circuitosEstimados: 10 },
  { id: 45, nombre: "Santo Pipó", departamento: "San Ignacio", zonaElectoral: "Zona Paraná Centro", cabecera: false, circuitosEstimados: 3 },

  // 9. Libertador General San Martín (6)
  { id: 46, nombre: "Puerto Rico", departamento: "Libertador General San Martín", zonaElectoral: "Zona Paraná Centro", cabecera: true, circuitosEstimados: 8 },
  { id: 47, nombre: "Capioví", departamento: "Libertador General San Martín", zonaElectoral: "Zona Paraná Centro", cabecera: false, circuitosEstimados: 3 },
  { id: 48, nombre: "El Alcázar", departamento: "Libertador General San Martín", zonaElectoral: "Zona Paraná Centro", cabecera: false, circuitosEstimados: 3 },
  { id: 49, nombre: "Garuhapé", departamento: "Libertador General San Martín", zonaElectoral: "Zona Paraná Centro", cabecera: false, circuitosEstimados: 3 },
  { id: 50, nombre: "Ruiz de Montoya", departamento: "Libertador General San Martín", zonaElectoral: "Zona Paraná Centro", cabecera: false, circuitosEstimados: 2 },
  { id: 51, nombre: "Puerto Leoni", departamento: "Libertador General San Martín", zonaElectoral: "Zona Paraná Centro", cabecera: false, circuitosEstimados: 2 },

  // 10. Montecarlo (3)
  { id: 52, nombre: "Montecarlo", departamento: "Montecarlo", zonaElectoral: "Zona Alto Paraná", cabecera: true, circuitosEstimados: 9 },
  { id: 53, nombre: "Caraguatay", departamento: "Montecarlo", zonaElectoral: "Zona Alto Paraná", cabecera: false, circuitosEstimados: 2 },
  { id: 54, nombre: "Puerto Piray", departamento: "Montecarlo", zonaElectoral: "Zona Alto Paraná", cabecera: false, circuitosEstimados: 3 },

  // 11. Eldorado (5)
  { id: 55, nombre: "Eldorado", departamento: "Eldorado", zonaElectoral: "Zona Alto Paraná", cabecera: true, circuitosEstimados: 16 },
  { id: 56, nombre: "Nueve de Julio", departamento: "Eldorado", zonaElectoral: "Zona Alto Paraná", cabecera: false, circuitosEstimados: 2 },
  { id: 57, nombre: "Colonia Delicia", departamento: "Eldorado", zonaElectoral: "Zona Alto Paraná", cabecera: false, circuitosEstimados: 3 },
  { id: 58, nombre: "Colonia Victoria", departamento: "Eldorado", zonaElectoral: "Zona Alto Paraná", cabecera: false, circuitosEstimados: 2 },
  { id: 59, nombre: "Santiago de Liniers", departamento: "Eldorado", zonaElectoral: "Zona Alto Paraná", cabecera: false, circuitosEstimados: 2 },

  // 12. Iguazú (4)
  { id: 60, nombre: "Puerto Iguazú", departamento: "Iguazú", zonaElectoral: "Zona Norte", cabecera: true, circuitosEstimados: 15 },
  { id: 61, nombre: "Puerto Esperanza", departamento: "Iguazú", zonaElectoral: "Zona Norte", cabecera: false, circuitosEstimados: 6 },
  { id: 62, nombre: "Puerto Libertad", departamento: "Iguazú", zonaElectoral: "Zona Norte", cabecera: false, circuitosEstimados: 3 },
  { id: 63, nombre: "Colonia Wanda", departamento: "Iguazú", zonaElectoral: "Zona Norte", cabecera: false, circuitosEstimados: 5 },

  // 13. General Manuel Belgrano (4)
  { id: 64, nombre: "Bernardo de Irigoyen", departamento: "General Manuel Belgrano", zonaElectoral: "Zona Noreste", cabecera: true, circuitosEstimados: 6 },
  { id: 65, nombre: "San Antonio", departamento: "General Manuel Belgrano", zonaElectoral: "Zona Noreste", cabecera: false, circuitosEstimados: 4 },
  { id: 66, nombre: "Comandante Andresito", departamento: "General Manuel Belgrano", zonaElectoral: "Zona Noreste", cabecera: false, circuitosEstimados: 6 },
  { id: 67, nombre: "Dos Hermanas", departamento: "General Manuel Belgrano", zonaElectoral: "Zona Noreste", cabecera: false, circuitosEstimados: 2, nota: "Municipio Nº 79 (creado en 2024-2025)" },

  // 14. San Pedro (3)
  { id: 68, nombre: "San Pedro", departamento: "San Pedro", zonaElectoral: "Zona Noreste", cabecera: true, circuitosEstimados: 8 },
  { id: 69, nombre: "Pozo Azul", departamento: "San Pedro", zonaElectoral: "Zona Noreste", cabecera: false, circuitosEstimados: 3, nota: "Municipio Nº 76 (creado en 2017)" },
  { id: 70, nombre: "Fracrán", departamento: "San Pedro", zonaElectoral: "Zona Noreste", cabecera: false, circuitosEstimados: 2, nota: "Municipio Nº 78 (creado en 2022)" },

  // 15. Cainguás (4)
  { id: 71, nombre: "Aristóbulo del Valle", departamento: "Cainguás", zonaElectoral: "Zona Centro", cabecera: true, circuitosEstimados: 9 },
  { id: 72, nombre: "Campo Grande", departamento: "Cainguás", zonaElectoral: "Zona Centro", cabecera: false, circuitosEstimados: 5 },
  { id: 73, nombre: "Dos de Mayo", departamento: "Cainguás", zonaElectoral: "Zona Centro", cabecera: false, circuitosEstimados: 5 },
  { id: 74, nombre: "Salto Encantado", departamento: "Cainguás", zonaElectoral: "Zona Centro", cabecera: false, circuitosEstimados: 3, nota: "Municipio Nº 77 (creado en 2020)" },

  // 16. 25 de Mayo (3)
  { id: 75, nombre: "25 de Mayo", departamento: "25 de Mayo", zonaElectoral: "Zona Río Uruguay", cabecera: true, circuitosEstimados: 4 },
  { id: 76, nombre: "Alba Posse", departamento: "25 de Mayo", zonaElectoral: "Zona Río Uruguay", cabecera: false, circuitosEstimados: 4 },
  { id: 77, nombre: "Colonia Aurora", departamento: "25 de Mayo", zonaElectoral: "Zona Río Uruguay", cabecera: false, circuitosEstimados: 3 },

  // 17. Guaraní (2)
  { id: 78, nombre: "San Vicente", departamento: "Guaraní", zonaElectoral: "Zona Centro-Este", cabecera: true, circuitosEstimados: 14 },
  { id: 79, nombre: "El Soberbio", departamento: "Guaraní", zonaElectoral: "Zona Río Uruguay", cabecera: false, circuitosEstimados: 7 },
];
