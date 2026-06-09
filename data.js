// ============================================================
//  DATOS DEL PENSUM - UNIVERSIDAD DEL NORTE
//  Ingeniería de Sistemas y Computación
//  SNIES: 103821
//
//  categorias disponibles (controlan el color de la tarjeta):
//    "matematicas"   → azul
//    "ciencias"      → verde
//    "programacion"  → morado
//    "sistemas"      → teal
//    "electiva"      → amarillo/amber
//    "humanidades"   → coral
//    "idiomas"       → gris
//    "grado"         → rosa
// ============================================================

const PENSUMS = [
  {
    id: "sistemas-uninorte",
    nombre: "Ingeniería de Sistemas y Computación",
    creditos_totales: 155,
    semestres: [
      {
        numero: 1,
        creditos: 15,
        materias: [
          { id: "MAT1031", codigo: "MAT 1031", nombre: "Álgebra Lineal",             creditos: 3, ht: 3, hp: 0, prerreqs: [],                              correqs: [], categoria: "matematicas" },
          { id: "MAT1101", codigo: "MAT 1101", nombre: "Cálculo I - Diferencial",    creditos: 5, ht: 4, hp: 2, prerreqs: [],                              correqs: [], categoria: "matematicas" },
          { id: "IST0010", codigo: "IST 0010", nombre: "Intro. a la Ing. de Sistemas", creditos: 1, ht: 1, hp: 0, prerreqs: [],                           correqs: [], categoria: "sistemas" },
          { id: "IST2088", codigo: "IST 2088", nombre: "Algoritmia y Programación I", creditos: 3, ht: 2, hp: 2, prerreqs: [],                             correqs: [], categoria: "programacion" },
          { id: "CAS3020", codigo: "CAS 3020", nombre: "Competencias Comunicativas I", creditos: 3, ht: 3, hp: 0, prerreqs: [],                            correqs: [], categoria: "humanidades" },
        ],
      },
      {
        numero: 2,
        creditos: 17,
        materias: [
          { id: "ELG1140", codigo: "ELG 1140", nombre: "Electiva en Historia",        creditos: 3, ht: 3, hp: 0, prerreqs: [],                             correqs: [], categoria: "electiva" },
          { id: "MAT1111", codigo: "MAT 1111", nombre: "Cálculo II - Integral",       creditos: 4, ht: 4, hp: 0, prerreqs: ["MAT1101"],                    correqs: [], categoria: "matematicas" },
          { id: "FIS1023", codigo: "FIS 1023", nombre: "Física Mecánica",             creditos: 4, ht: 3, hp: 2, prerreqs: ["MAT1101"],                    correqs: [], categoria: "ciencias" },
          { id: "IST2089", codigo: "IST 2089", nombre: "Algoritmia y Programación II", creditos: 3, ht: 2, hp: 2, prerreqs: ["IST2088"],                   correqs: [], categoria: "programacion" },
          { id: "CAS3030", codigo: "CAS 3030", nombre: "Competencias Comunicativas II", creditos: 3, ht: 3, hp: 0, prerreqs: ["CAS3020"],                  correqs: [], categoria: "humanidades" },
        ],
      },
      {
        numero: 3,
        creditos: 17,
        materias: [
          { id: "ELG1130", codigo: "ELG 1130", nombre: "Electiva en Humanidades",     creditos: 3, ht: 3, hp: 0, prerreqs: [],                             correqs: [], categoria: "electiva" },
          { id: "MAT1121", codigo: "MAT 1121", nombre: "Cálculo III - Vectorial",     creditos: 4, ht: 4, hp: 0, prerreqs: ["MAT1111"],                    correqs: [], categoria: "matematicas" },
          { id: "FIS1043", codigo: "FIS 1043", nombre: "Física Calor-Ondas",          creditos: 4, ht: 3, hp: 2, prerreqs: ["FIS1023"],                    correqs: [], categoria: "ciencias" },
          { id: "IST4021", codigo: "IST 4021", nombre: "Estructura de Datos I",       creditos: 3, ht: 2, hp: 2, prerreqs: ["IST2089"],                    correqs: [], categoria: "programacion" },
          { id: "IST2110", codigo: "IST 2110", nombre: "Programación Orientada a Objetos", creditos: 3, ht: 2, hp: 2, prerreqs: ["IST2089"],              correqs: [], categoria: "programacion" },
        ],
      },
      {
        numero: 4,
        creditos: 16,
        materias: [
          { id: "ELG1150", codigo: "ELG 1150", nombre: "Electiva en Ciencias de la Vida", creditos: 3, ht: 3, hp: 0, prerreqs: [],                        correqs: [], categoria: "electiva" },
          { id: "MAT4011", codigo: "MAT 4011", nombre: "Ecuaciones Diferenciales",    creditos: 3, ht: 3, hp: 0, prerreqs: ["MAT1121"],                    correqs: [], categoria: "matematicas" },
          { id: "FIS1043B",codigo: "FIS 1043", nombre: "Física Electricidad",         creditos: 4, ht: 3, hp: 2, prerreqs: ["FIS1043"],                    correqs: [], categoria: "ciencias" },
          { id: "IST4031", codigo: "IST 4031", nombre: "Estructura de Datos II",      creditos: 3, ht: 2, hp: 2, prerreqs: ["IST4021"],                    correqs: [], categoria: "programacion" },
          { id: "MAT4021", codigo: "MAT 4021", nombre: "Matemáticas Discretas",       creditos: 3, ht: 3, hp: 0, prerreqs: ["MAT1031", "IST2089"],         correqs: [], categoria: "matematicas" },
        ],
      },
      {
        numero: 5,
        creditos: 16,
        materias: [
          { id: "ELG0007", codigo: "ELG 0007", nombre: "Electiva en Ciencias Básicas", creditos: 3, ht: 3, hp: 0, prerreqs: [],                           correqs: [], categoria: "electiva" },
          { id: "EST7042", codigo: "EST 7042", nombre: "Análisis de Datos en Ing. I", creditos: 4, ht: 3, hp: 2, prerreqs: ["MAT1111"],                    correqs: [], categoria: "matematicas" },
          { id: "IST4310", codigo: "IST 4310", nombre: "Algoritmia y Complejidad",    creditos: 3, ht: 2, hp: 2, prerreqs: ["IST4031", "MAT4021"],         correqs: [], categoria: "programacion" },
          { id: "IST4330", codigo: "IST 4330", nombre: "Estructuras Discretas",       creditos: 3, ht: 3, hp: 0, prerreqs: ["MAT4021"],                    correqs: [], categoria: "matematicas" },
          { id: "IST7072", codigo: "IST 7072", nombre: "Diseño Digital",              creditos: 3, ht: 3, hp: 0, prerreqs: ["MAT4021"],                    correqs: [], categoria: "sistemas" },
          { id: "IIN4310", codigo: "IIN 4310", nombre: "Examen Comprehensivo I",      creditos: 0, ht: 0, hp: 0, prerreqs: ["MAT4011","MAT1121","FIS1023","FIS1043"], correqs: [], categoria: "grado" },
        ],
      },
      {
        numero: 6,
        creditos: 15,
        materias: [
          { id: "ELG0008", codigo: "ELG 0008", nombre: "Electiva Básica Profesional", creditos: 3, ht: 3, hp: 0, prerreqs: [],                            correqs: [], categoria: "electiva" },
          { id: "IST4360", codigo: "IST 4360", nombre: "Soluciones Computac. a Prob. de Ing.", creditos: 3, ht: 2, hp: 2, prerreqs: ["IST2088","EST7042"], correqs: [], categoria: "sistemas" },
          { id: "IST7111", codigo: "IST 7111", nombre: "Bases de Datos",              creditos: 3, ht: 2, hp: 2, prerreqs: ["IST4031"],                    correqs: [], categoria: "sistemas" },
          { id: "IST7191", codigo: "IST 7191", nombre: "Redes de Computación",        creditos: 3, ht: 3, hp: 0, prerreqs: ["IST4021"],                    correqs: [], categoria: "sistemas" },
          { id: "IST4012", codigo: "IST 4012", nombre: "Estructura del Computador I", creditos: 3, ht: 3, hp: 0, prerreqs: ["IST7072"],                    correqs: [], categoria: "sistemas" },
        ],
      },
      {
        numero: 7,
        creditos: 15,
        materias: [
          { id: "ELG1170", codigo: "ELG 1170", nombre: "Electiva en Ética",           creditos: 3, ht: 3, hp: 0, prerreqs: [],                             correqs: [], categoria: "electiva" },
          { id: "IST7420", codigo: "IST 7420", nombre: "Optimización",                creditos: 3, ht: 3, hp: 0, prerreqs: ["EST7042"],                    correqs: [], categoria: "matematicas" },
          { id: "IST7121", codigo: "IST 7121", nombre: "Diseño de Software I",        creditos: 3, ht: 3, hp: 0, prerreqs: ["IST7111"],                    correqs: [], categoria: "programacion" },
          { id: "IST70811",codigo: "IST 70811",nombre: "Sistemas Operativos",         creditos: 3, ht: 3, hp: 0, prerreqs: ["IST4012"],                    correqs: [], categoria: "sistemas" },
          { id: "IST7102", codigo: "IST 7102", nombre: "Estructura del Computador II", creditos: 3, ht: 3, hp: 0, prerreqs: ["IST4012"],                   correqs: [], categoria: "sistemas" },
          { id: "IST7410", codigo: "IST 7410", nombre: "Compiladores",                creditos: 3, ht: 3, hp: 0, prerreqs: ["IST4310"],                    correqs: [], categoria: "programacion" },
        ],
      },
      {
        numero: 8,
        creditos: 17,
        materias: [
          { id: "ELG1190", codigo: "ELG 1190", nombre: "Electiva en Ciencias Sociales", creditos: 3, ht: 3, hp: 0, prerreqs: [],                          correqs: [], categoria: "electiva" },
          { id: "ELG1301", codigo: "ELG 1301", nombre: "Electiva Profesional I",      creditos: 3, ht: 3, hp: 0, prerreqs: ["IST7121"],                    correqs: [], categoria: "electiva" },
          { id: "IST7122", codigo: "IST 7122", nombre: "Diseño de Software II",       creditos: 3, ht: 3, hp: 0, prerreqs: ["IST7121"],                    correqs: [], categoria: "programacion" },
          { id: "ELG1302", codigo: "ELG 1302", nombre: "Electiva en Redes",           creditos: 2, ht: 1, hp: 2, prerreqs: ["IST7191"],                    correqs: [], categoria: "electiva" },
          { id: "ELG1303", codigo: "ELG 1303", nombre: "Electiva Ciencias de la Computación", creditos: 3, ht: 3, hp: 0, prerreqs: ["IST7420"],            correqs: [], categoria: "electiva" },
          { id: "ELG8400", codigo: "ELG 8400", nombre: "Electiva Innovación, Dllo. y Sociedad", creditos: 3, ht: 3, hp: 0, prerreqs: [],                   correqs: [], categoria: "electiva" },
        ],
      },
      {
        numero: 9,
        creditos: 15,
        materias: [
          { id: "ELG1160", codigo: "ELG 1160", nombre: "Electiva en Filosofía",       creditos: 3, ht: 3, hp: 0, prerreqs: [],                             correqs: [], categoria: "electiva" },
          { id: "ELG1305", codigo: "ELG 1305", nombre: "Electiva Profesional II",     creditos: 3, ht: 3, hp: 0, prerreqs: ["ELG1301"],                    correqs: [], categoria: "electiva" },
          { id: "INV7363", codigo: "INV 7363", nombre: "Proyecto Final",              creditos: 3, ht: 3, hp: 0, prerreqs: ["IST7122","ELG1301"],           correqs: [], categoria: "grado" },
          { id: "ELG1304", codigo: "ELG 1304", nombre: "Electiva Gestión Informática", creditos: 3, ht: 3, hp: 0, prerreqs: ["IST7121"],                   correqs: [], categoria: "electiva" },
          { id: "ELP4030", codigo: "ELP 4030", nombre: "Electiva Formación Complement. I", creditos: 3, ht: 3, hp: 0, prerreqs: [],                        correqs: [], categoria: "electiva" },
          { id: "IIN4319", codigo: "IIN 4319", nombre: "Examen Comprehensivo II",     creditos: 0, ht: 0, hp: 0, prerreqs: ["IIN4310"],                    correqs: [], categoria: "grado" },
        ],
      },
      {
        numero: 10,
        creditos: 12,
        materias: [
          { id: "ELG1180", codigo: "ELG 1180", nombre: "Electiva Estudios del Caribe", creditos: 3, ht: 3, hp: 0, prerreqs: [],                            correqs: [], categoria: "electiva" },
          { id: "ELG1306", codigo: "ELG 1306", nombre: "Electiva Profesional III",    creditos: 3, ht: 3, hp: 0, prerreqs: ["ELG1305"],                    correqs: [], categoria: "electiva" },
          { id: "ELP8090", codigo: "ELP 8090", nombre: "Electiva Formación Complement. II", creditos: 3, ht: 3, hp: 0, prerreqs: ["ELP4030"],              correqs: [], categoria: "electiva" },
          { id: "IST4380", codigo: "IST 4380", nombre: "Seminario de Carrera II",     creditos: 0, ht: 0, hp: 0, prerreqs: ["INV7363"],                    correqs: [], categoria: "grado" },
          { id: "IST4370", codigo: "IST 4370", nombre: "Seminario de Carrera I",      creditos: 0, ht: 0, hp: 0, prerreqs: [],                             correqs: [], categoria: "grado" },
        ],
      },
    ],
    idiomas: [
      { id: "IGL1010", codigo: "IGL 1010", nombre: "Exigencia de Idiomas I",   creditos: 3, ht: 4, hp: 0, prerreqs: [],          correqs: [], categoria: "idiomas", semestre_ref: 1 },
      { id: "IGL1020", codigo: "IGL 1020", nombre: "Exigencia de Idiomas II",  creditos: 3, ht: 4, hp: 0, prerreqs: ["IGL1010"], correqs: [], categoria: "idiomas", semestre_ref: 2 },
      { id: "IGL1030", codigo: "IGL 1030", nombre: "Exigencia de Idiomas III", creditos: 0, ht: 4, hp: 0, prerreqs: ["IGL1020"], correqs: [], categoria: "idiomas", semestre_ref: 3 },
      { id: "IGL1040", codigo: "IGL 1040", nombre: "Exigencia de Idiomas IV",  creditos: 0, ht: 4, hp: 0, prerreqs: ["IGL1030"], correqs: [], categoria: "idiomas", semestre_ref: 4 },
      { id: "IGL4010", codigo: "IGL 4010", nombre: "Exigencia de Idiomas V",   creditos: 0, ht: 4, hp: 0, prerreqs: ["IGL1040"], correqs: [], categoria: "idiomas", semestre_ref: 5 },
      { id: "IGL4040", codigo: "IGL 4040", nombre: "Exigencia de Idiomas VI",  creditos: 0, ht: 4, hp: 0, prerreqs: ["IGL4010"], correqs: [], categoria: "idiomas", semestre_ref: 6 },
      { id: "IGL7030", codigo: "IGL 7030", nombre: "Exigencia de Idiomas VII", creditos: 0, ht: 4, hp: 0, prerreqs: ["IGL4040"], correqs: [], categoria: "idiomas", semestre_ref: 7 },
      { id: "IGL7080", codigo: "IGL 7080", nombre: "Exigencia de Idiomas VIII",creditos: 0, ht: 4, hp: 0, prerreqs: ["IGL7030"], correqs: [], categoria: "idiomas", semestre_ref: 8 },
    ],
  },
];