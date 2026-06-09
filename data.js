// Definición de los pensums (6 carreras de ejemplo con al menos 2 semestres cada una)
// En un caso real, cada carrera debe tener 10 semestres y mínimo 5 materias por semestre
const PENSUMS = [
  {
    id: "sistemas",
    nombre: "Ingeniería de Sistemas — Énfasis en Desarrollo",
    creditos_totales: 160,
    carga_tipica_semestre: 17,
    semestres: [
      {
        numero: 1, creditos: 16, materias: [
          { id: "sist_calc1", codigo: "MA1001", nombre: "Cálculo I", creditos: 4, ht: 4, hp: 0, categoria: "matematicas", prerreqs: [], correqs: [] },
          { id: "sist_intro_prog", codigo: "IS1001", nombre: "Introducción a la Programación", creditos: 4, ht: 2, hp: 2, categoria: "programacion", prerreqs: [], correqs: [] },
          { id: "sist_algebra", codigo: "MA1002", nombre: "Álgebra Lineal", creditos: 3, ht: 3, hp: 0, categoria: "matematicas", prerreqs: [], correqs: [] },
          { id: "sist_fisica1", codigo: "FS1001", nombre: "Física I", creditos: 4, ht: 3, hp: 1, categoria: "ciencias", prerreqs: [], correqs: [] }
        ]
      },
      {
        numero: 2, creditos: 18, materias: [
          { id: "sist_calc2", codigo: "MA1003", nombre: "Cálculo II", creditos: 4, ht: 4, hp: 0, categoria: "matematicas", prerreqs: ["sist_calc1"], correqs: [] },
          { id: "sist_poo", codigo: "IS2001", nombre: "Programación Orientada a Objetos", creditos: 4, ht: 2, hp: 2, categoria: "programacion", prerreqs: ["sist_intro_prog"], correqs: [] },
          { id: "sist_fisica2", codigo: "FS1002", nombre: "Física II", creditos: 4, ht: 3, hp: 1, categoria: "ciencias", prerreqs: ["sist_fisica1"], correqs: [] },
          { id: "sist_eda", codigo: "IS2002", nombre: "Estructuras de Datos", creditos: 4, ht: 2, hp: 2, categoria: "programacion", prerreqs: ["sist_poo"], correqs: [] }
        ]
      }
    ],
    idiomas: []
  },
  {
    id: "industrial",
    nombre: "Ingeniería Industrial",
    creditos_totales: 155,
    carga_tipica_semestre: 17,
    semestres: [
      {
        numero: 1, creditos: 15, materias: [
          { id: "ind_calc1", codigo: "MA1101", nombre: "Cálculo Diferencial", creditos: 4, ht: 4, hp: 0, categoria: "matematicas", prerreqs: [], correqs: [] },
          { id: "ind_algebra", codigo: "MA1102", nombre: "Álgebra Lineal", creditos: 3, ht: 3, hp: 0, categoria: "matematicas", prerreqs: [], correqs: [] },
          { id: "ind_fisica1", codigo: "FS1101", nombre: "Física I", creditos: 4, ht: 3, hp: 1, categoria: "ciencias", prerreqs: [], correqs: [] },
          { id: "fund_admin", codigo: "AD1001", nombre: "Fundamentos de Administración", creditos: 3, ht: 3, hp: 0, categoria: "humanidades", prerreqs: [], correqs: [] }
        ]
      },
      {
        numero: 2, creditos: 16, materias: [
          { id: "ind_calc2", codigo: "MA1103", nombre: "Cálculo Integral", creditos: 4, ht: 4, hp: 0, categoria: "matematicas", prerreqs: ["ind_calc1"], correqs: [] },
          { id: "ind_fisica2", codigo: "FS1102", nombre: "Física II", creditos: 4, ht: 3, hp: 1, categoria: "ciencias", prerreqs: ["ind_fisica1"], correqs: [] },
          { id: "prog_basica", codigo: "IS1001", nombre: "Programación Básica", creditos: 3, ht: 2, hp: 1, categoria: "programacion", prerreqs: [], correqs: [] },
          { id: "estadistica", codigo: "EST1101", nombre: "Estadística I", creditos: 3, ht: 2, hp: 1, categoria: "matematicas", prerreqs: [], correqs: [] }
        ]
      }
    ],
    idiomas: []
  },
  {
    id: "mecanica",
    nombre: "Ingeniería Mecánica",
    creditos_totales: 158,
    carga_tipica_semestre: 18,
    semestres: [
      {
        numero: 1, creditos: 17, materias: [
          { id: "mec_calc1", codigo: "MA1201", nombre: "Cálculo I", creditos: 4, ht: 4, hp: 0, categoria: "matematicas", prerreqs: [], correqs: [] },
          { id: "mec_algebra", codigo: "MA1202", nombre: "Álgebra Lineal", creditos: 3, ht: 3, hp: 0, categoria: "matematicas", prerreqs: [], correqs: [] },
          { id: "mec_fisica1", codigo: "FS1201", nombre: "Física I", creditos: 4, ht: 3, hp: 1, categoria: "ciencias", prerreqs: [], correqs: [] },
          { id: "dibujo_mec", codigo: "ME1201", nombre: "Dibujo Mecánico", creditos: 3, ht: 1, hp: 2, categoria: "sistemas", prerreqs: [], correqs: [] }
        ]
      },
      {
        numero: 2, creditos: 18, materias: [
          { id: "mec_calc2", codigo: "MA1203", nombre: "Cálculo II", creditos: 4, ht: 4, hp: 0, categoria: "matematicas", prerreqs: ["mec_calc1"], correqs: [] },
          { id: "mec_fisica2", codigo: "FS1202", nombre: "Física II", creditos: 4, ht: 3, hp: 1, categoria: "ciencias", prerreqs: ["mec_fisica1"], correqs: [] },
          { id: "mec_estatica", codigo: "ME1202", nombre: "Estática", creditos: 3, ht: 2, hp: 1, categoria: "ciencias", prerreqs: ["mec_fisica1"], correqs: [] }
        ]
      }
    ],
    idiomas: []
  },
  {
    id: "electronica",
    nombre: "Ingeniería Electrónica",
    creditos_totales: 160,
    carga_tipica_semestre: 18,
    semestres: [
      {
        numero: 1, creditos: 17, materias: [
          { id: "ele_calc1", codigo: "MA1301", nombre: "Cálculo I", creditos: 4, ht: 4, hp: 0, categoria: "matematicas", prerreqs: [], correqs: [] },
          { id: "ele_algebra", codigo: "MA1302", nombre: "Álgebra Lineal", creditos: 3, ht: 3, hp: 0, categoria: "matematicas", prerreqs: [], correqs: [] },
          { id: "ele_fisica1", codigo: "FS1301", nombre: "Física I", creditos: 4, ht: 3, hp: 1, categoria: "ciencias", prerreqs: [], correqs: [] },
          { id: "intro_circuitos", codigo: "EE1301", nombre: "Introducción a Circuitos", creditos: 4, ht: 2, hp: 2, categoria: "sistemas", prerreqs: [], correqs: [] }
        ]
      },
      {
        numero: 2, creditos: 18, materias: [
          { id: "ele_calc2", codigo: "MA1303", nombre: "Cálculo II", creditos: 4, ht: 4, hp: 0, categoria: "matematicas", prerreqs: ["ele_calc1"], correqs: [] },
          { id: "ele_fisica2", codigo: "FS1302", nombre: "Física II", creditos: 4, ht: 3, hp: 1, categoria: "ciencias", prerreqs: ["ele_fisica1"], correqs: [] },
          { id: "circuitos_dc", codigo: "EE1302", nombre: "Circuitos DC", creditos: 4, ht: 2, hp: 2, categoria: "sistemas", prerreqs: ["intro_circuitos"], correqs: [] }
        ]
      }
    ],
    idiomas: []
  },
  {
    id: "electrica",
    nombre: "Ingeniería Eléctrica",
    creditos_totales: 162,
    carga_tipica_semestre: 18,
    semestres: [
      {
        numero: 1, creditos: 17, materias: [
          { id: "elec_calc1", codigo: "MA1401", nombre: "Cálculo I", creditos: 4, ht: 4, hp: 0, categoria: "matematicas", prerreqs: [], correqs: [] },
          { id: "elec_algebra", codigo: "MA1402", nombre: "Álgebra Lineal", creditos: 3, ht: 3, hp: 0, categoria: "matematicas", prerreqs: [], correqs: [] },
          { id: "elec_fisica1", codigo: "FS1401", nombre: "Física I", creditos: 4, ht: 3, hp: 1, categoria: "ciencias", prerreqs: [], correqs: [] },
          { id: "fund_elect", codigo: "EE1401", nombre: "Fundamentos Eléctricos", creditos: 4, ht: 2, hp: 2, categoria: "sistemas", prerreqs: [], correqs: [] }
        ]
      },
      {
        numero: 2, creditos: 18, materias: [
          { id: "elec_calc2", codigo: "MA1403", nombre: "Cálculo II", creditos: 4, ht: 4, hp: 0, categoria: "matematicas", prerreqs: ["elec_calc1"], correqs: [] },
          { id: "elec_fisica2", codigo: "FS1402", nombre: "Física II", creditos: 4, ht: 3, hp: 1, categoria: "ciencias", prerreqs: ["elec_fisica1"], correqs: [] },
          { id: "analisis_circuitos", codigo: "EE1402", nombre: "Análisis de Circuitos", creditos: 4, ht: 2, hp: 2, categoria: "sistemas", prerreqs: ["fund_elect"], correqs: [] }
        ]
      }
    ],
    idiomas: []
  },
  {
    id: "matematicas",
    nombre: "Licenciatura en Matemáticas",
    creditos_totales: 150,
    carga_tipica_semestre: 17,
    semestres: [
      {
        numero: 1, creditos: 16, materias: [
          { id: "mate_calc1", codigo: "MA1501", nombre: "Cálculo I", creditos: 5, ht: 5, hp: 0, categoria: "matematicas", prerreqs: [], correqs: [] },
          { id: "mate_algebra", codigo: "MA1502", nombre: "Álgebra Lineal", creditos: 4, ht: 4, hp: 0, categoria: "matematicas", prerreqs: [], correqs: [] },
          { id: "mate_fundamentos", codigo: "MA1503", nombre: "Fundamentos de Matemáticas", creditos: 3, ht: 3, hp: 0, categoria: "matematicas", prerreqs: [], correqs: [] }
        ]
      },
      {
        numero: 2, creditos: 17, materias: [
          { id: "mate_calc2", codigo: "MA1504", nombre: "Cálculo II", creditos: 5, ht: 5, hp: 0, categoria: "matematicas", prerreqs: ["mate_calc1"], correqs: [] },
          { id: "mate_estadistica", codigo: "EST1501", nombre: "Estadística", creditos: 4, ht: 3, hp: 1, categoria: "matematicas", prerreqs: [], correqs: [] },
          { id: "mate_geometria", codigo: "MA1505", nombre: "Geometría", creditos: 4, ht: 4, hp: 0, categoria: "matematicas", prerreqs: [], correqs: [] }
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