// Definición de los pensums (6 carreras de ejemplo con al menos 2 semestres cada una)
// En un caso real, cada carrera debe tener 10 semestres y mínimo 5 materias por semestre
const PENSUMS = [
  { id: "sistemas",
    nombre: "Ingeniería de Sistemas — Énfasis en Desarrollo",
    creditos_totales: 160,
    carga_tipica_semestre: 17,
    semestres: [
      {
        numero: 1, creditos: 16, materias: [
          { codigo: "MA1001", nombre: "Cálculo I", creditos: 4, prerreqs: [] },
          { codigo: "IS1001", nombre: "Introducción a la Programación", creditos: 4, prerreqs: [] },
          { codigo: "MA1002", nombre: "Álgebra Lineal", creditos: 3, prerreqs: [] },
          { codigo: "FS1001", nombre: "Física I", creditos: 4, prerreqs: [] }
        ]
      },
      {
        numero: 2, creditos: 18, materias: [
          { codigo: "MA1003", nombre: "Cálculo II", creditos: 4, prerreqs: ["MA1001"] },
          { codigo: "IS2001", nombre: "Programación Orientada a Objetos", creditos: 4, prerreqs: ["IS1001"] },
          { codigo: "FS1002", nombre: "Física II", creditos: 4, prerreqs: ["FS1001"] },
          { codigo: "IS2002", nombre: "Estructuras de Datos", creditos: 4, prerreqs: ["IS2001"] }
        ]
      }
    ],
    idiomas: []
  },
  { id: "industrial",
    nombre: "Ingeniería Industrial",
    creditos_totales: 155,
    carga_tipica_semestre: 17,
    semestres: [
      {
        numero: 1, creditos: 15, materias: [
          { codigo: "MA1101", nombre: "Cálculo Diferencial", creditos: 4, prerreqs: [] },
          { codigo: "MA1102", nombre: "Álgebra Lineal", creditos: 3, prerreqs: [] },
          { codigo: "FS1101", nombre: "Física I", creditos: 4, prerreqs: [] },
          { codigo: "AD1001", nombre: "Fundamentos de Administración", creditos: 3, prerreqs: [] }
        ]
      },
      {
        numero: 2, creditos: 16, materias: [
          { codigo: "MA1103", nombre: "Cálculo Integral", creditos: 4, prerreqs: ["MA1101"] },
          { codigo: "FS1102", nombre: "Física II", creditos: 4, prerreqs: ["FS1101"] },
          { codigo: "IS1001", nombre: "Programación Básica", creditos: 3, prerreqs: [] },
          { codigo: "EST1101", nombre: "Estadística I", creditos: 3, prerreqs: [] }
        ]
      }
    ],
    idiomas: []
  },
  { id: "mecanica",
    nombre: "Ingeniería Mecánica",
    creditos_totales: 158,
    carga_tipica_semestre: 18,
    semestres: [
      {
        numero: 1, creditos: 17, materias: [
          { codigo: "MA1201", nombre: "Cálculo I", creditos: 4, prerreqs: [] },
          { codigo: "MA1202", nombre: "Álgebra Lineal", creditos: 3, prerreqs: [] },
          { codigo: "FS1201", nombre: "Física I", creditos: 4, prerreqs: [] },
          { codigo: "ME1201", nombre: "Dibujo Mecánico", creditos: 3, prerreqs: [] }
        ]
      },
      {
        numero: 2, creditos: 18, materias: [
          { codigo: "MA1203", nombre: "Cálculo II", creditos: 4, prerreqs: ["MA1201"] },
          { codigo: "FS1202", nombre: "Física II", creditos: 4, prerreqs: ["FS1201"] },
          { codigo: "ME1202", nombre: "Estática", creditos: 3, prerreqs: ["FS1201"] }
        ]
      }
    ],
    idiomas: []
  },
  { id: "electronica",
    nombre: "Ingeniería Electrónica",
    creditos_totales: 160,
    carga_tipica_semestre: 18,
    semestres: [
      {
        numero: 1, creditos: 17, materias: [
          { codigo: "MA1301", nombre: "Cálculo I", creditos: 4, prerreqs: [] },
          { codigo: "MA1302", nombre: "Álgebra Lineal", creditos: 3, prerreqs: [] },
          { codigo: "FS1301", nombre: "Física I", creditos: 4, prerreqs: [] },
          { codigo: "EE1301", nombre: "Introducción a Circuitos", creditos: 4, prerreqs: [] }
        ]
      },
      {
        numero: 2, creditos: 18, materias: [
          { codigo: "MA1303", nombre: "Cálculo II", creditos: 4, prerreqs: ["MA1301"] },
          { codigo: "FS1302", nombre: "Física II", creditos: 4, prerreqs: ["FS1301"] },
          { codigo: "EE1302", nombre: "Circuitos DC", creditos: 4, prerreqs: ["EE1301"] }
        ]
      }
    ],
    idiomas: []
  },
  { id: "electrica",
    nombre: "Ingeniería Eléctrica",
    creditos_totales: 162,
    carga_tipica_semestre: 18,
    semestres: [
      {
        numero: 1, creditos: 17, materias: [
          { codigo: "MA1401", nombre: "Cálculo I", creditos: 4, prerreqs: [] },
          { codigo: "MA1402", nombre: "Álgebra Lineal", creditos: 3, prerreqs: [] },
          { codigo: "FS1401", nombre: "Física I", creditos: 4, prerreqs: [] },
          { codigo: "EE1401", nombre: "Fundamentos Eléctricos", creditos: 4, prerreqs: [] }
        ]
      },
      {
        numero: 2, creditos: 18, materias: [
          { codigo: "MA1403", nombre: "Cálculo II", creditos: 4, prerreqs: ["MA1401"] },
          { codigo: "FS1402", nombre: "Física II", creditos: 4, prerreqs: ["FS1401"] },
          { codigo: "EE1402", nombre: "Análisis de Circuitos", creditos: 4, prerreqs: ["EE1401"] }
        ]
      }
    ],
    idiomas: []
  },
  { id: "matematicas",
    nombre: "Licenciatura en Matemáticas",
    creditos_totales: 150,
    carga_tipica_semestre: 17,
    semestres: [
      {
        numero: 1, creditos: 16, materias: [
          { codigo: "MA1501", nombre: "Cálculo I", creditos: 5, prerreqs: [] },
          { codigo: "MA1502", nombre: "Álgebra Lineal", creditos: 4, prerreqs: [] },
          { codigo: "MA1503", nombre: "Fundamentos de Matemáticas", creditos: 3, prerreqs: [] }
        ]
      },
      {
        numero: 2, creditos: 17, materias: [
          { codigo: "MA1504", nombre: "Cálculo II", creditos: 5, prerreqs: ["MA1501"] },
          { codigo: "EST1501", nombre: "Estadística", creditos: 4, prerreqs: [] },
          { codigo: "MA1505", nombre: "Geometría", creditos: 4, prerreqs: [] }
        ]
      }
    ],
    idiomas: []
  }
];

// Definir pares de carreras compatibles para doble carrera (lista manual)
const CARRERAS_COMPATIBLES = {
  "sistemas": ["industrial", "electronica", "matematicas"],
  "industrial": ["sistemas", "mecanica"],
  "mecanica": ["industrial", "electronica", "electrica"],
  "electronica": ["sistemas", "mecanica", "electrica"],
  "electrica": ["mecanica", "electronica"],
  "matematicas": ["sistemas"]
};