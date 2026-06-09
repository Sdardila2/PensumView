// ============================================================
//  DATOS DEL PENSUM - UNIVERSIDAD DEL NORTE
//  Ingeniería de Sistemas y Computación & Ingeniería Mecánica
//
//  categorias disponibles (controlan el color de la tarjeta):
//    "matematicas"   → azul
//    "ciencias"      → verde
//    "programacion"  → morado
//    "sistemas"      → teal
//    "mecanica"      → naranja/gris oscuro (Nueva)
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
          { id: "MAT1031", codigo: "MAT 1031", nombre: "Álgebra Lineal", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "matematicas" },
          { id: "MAT1101", codigo: "MAT 1101", nombre: "Cálculo I - Diferencial", creditos: 5, ht: 4, hp: 2, prerreqs: [], correqs: [], categoria: "matematicas" },
          { id: "IST0010", codigo: "IST 0010", nombre: "Intro. a la Ing. de Sistemas", creditos: 1, ht: 1, hp: 0, prerreqs: [], correqs: [], categoria: "sistemas" },
          { id: "IST2088", codigo: "IST 2088", nombre: "Algoritmia y Programación I", creditos: 3, ht: 2, hp: 2, prerreqs: [], correqs: [], categoria: "programacion" },
          { id: "CAS3020", codigo: "CAS 3020", nombre: "Competencias Comunicativas I", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "humanidades" },
        ],
      },
      {
        numero: 2,
        creditos: 17,
        materias: [
          { id: "ELG1140", codigo: "ELG 1140", nombre: "Electiva en Historia", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "electiva" },
          { id: "MAT1111", codigo: "MAT 1111", nombre: "Cálculo II - Integral", creditos: 4, ht: 4, hp: 0, prerreqs: ["MAT1101"], correqs: [], categoria: "matematicas" },
          { id: "FIS1023", codigo: "FIS 1023", nombre: "Física Mecánica", creditos: 4, ht: 3, hp: 2, prerreqs: ["MAT1101"], correqs: [], categoria: "ciencias" },
          { id: "IST2089", codigo: "IST 2089", nombre: "Algoritmia y Programación II", creditos: 3, ht: 2, hp: 2, prerreqs: ["IST2088"], correqs: [], categoria: "programacion" },
          { id: "CAS3030", codigo: "CAS 3030", nombre: "Competencias Comunicativas II", creditos: 3, ht: 3, hp: 0, prerreqs: ["CAS3020"], correqs: [], categoria: "humanidades" },
        ],
      },
      {
        numero: 3,
        creditos: 17,
        materias: [
          { id: "ELG1130", codigo: "ELG 1130", nombre: "Electiva en Humanidades", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "electiva" },
          { id: "MAT1121", codigo: "MAT 1121", nombre: "Cálculo III - Vectorial", creditos: 4, ht: 4, hp: 0, prerreqs: ["MAT1111"], correqs: [], categoria: "matematicas" },
          { id: "FIS1043", codigo: "FIS 1043", nombre: "Física Calor-Ondas", creditos: 4, ht: 3, hp: 2, prerreqs: ["FIS1023"], correqs: [], categoria: "ciencias" },
          { id: "IST4021", codigo: "IST 4021", nombre: "Estructura de Datos I", creditos: 3, ht: 2, hp: 2, prerreqs: ["IST2089"], correqs: [], categoria: "programacion" },
          { id: "IST2110", codigo: "IST 2110", nombre: "Programación Orientada a Objetos", creditos: 3, ht: 2, hp: 2, prerreqs: ["IST2089"], correqs: [], categoria: "programacion" },
        ],
      },
      {
        numero: 4,
        creditos: 16,
        materias: [
          { id: "ELG1150", codigo: "ELG 1150", nombre: "Electiva en Ciencias de la Vida", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "electiva" },
          { id: "MAT4011", codigo: "MAT 4011", nombre: "Ecuaciones Diferenciales", creditos: 3, ht: 3, hp: 0, prerreqs: ["MAT1121"], correqs: [], categoria: "matematicas" },
          { id: "FIS1043B", codigo: "FIS 1043", nombre: "Física Electricidad", creditos: 4, ht: 3, hp: 2, prerreqs: ["FIS1043"], correqs: [], categoria: "ciencias" },
          { id: "IST4031", codigo: "IST 4031", nombre: "Estructura de Datos II", creditos: 3, ht: 2, hp: 2, prerreqs: ["IST4021"], correqs: [], categoria: "programacion" },
          { id: "MAT4021", codigo: "MAT 4021", nombre: "Matemáticas Discretas", creditos: 3, ht: 3, hp: 0, prerreqs: ["MAT1031", "IST2089"], correqs: [], categoria: "matematicas" },
        ],
      },
      {
        numero: 5,
        creditos: 16,
        materias: [
          { id: "ELG0007", codigo: "ELG 0007", nombre: "Electiva en Ciencias Básicas", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "electiva" },
          { id: "EST7042", codigo: "EST 7042", nombre: "Análisis de Datos en Ing. I", creditos: 4, ht: 3, hp: 2, prerreqs: ["MAT1111"], correqs: [], categoria: "matematicas" },
          { id: "IST4310", codigo: "IST 4310", nombre: "Algoritmia y Complejidad", creditos: 3, ht: 2, hp: 2, prerreqs: ["IST4031", "MAT4021"], correqs: [], categoria: "programacion" },
          { id: "IST4330", codigo: "IST 4330", nombre: "Estructuras Discretas", creditos: 3, ht: 3, hp: 0, prerreqs: ["MAT4021"], correqs: [], categoria: "matematicas" },
          { id: "IST7072", codigo: "IST 7072", nombre: "Diseño Digital", creditos: 3, ht: 3, hp: 0, prerreqs: ["MAT4021"], correqs: [], categoria: "sistemas" },
          { id: "IIN4310", codigo: "IIN 4310", nombre: "Examen Comprehensivo I", creditos: 0, ht: 0, hp: 0, prerreqs: ["MAT4011", "MAT1121", "FIS1023", "FIS1043"], correqs: [], categoria: "grado" },
        ],
      },
      {
        numero: 6,
        creditos: 15,
        materias: [
          { id: "ELG0008", codigo: "ELG 0008", nombre: "Electiva Básica Profesional", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "electiva" },
          { id: "IST4360", codigo: "IST 4360", nombre: "Soluciones Computac. a Prob. de Ing.", creditos: 3, ht: 2, hp: 2, prerreqs: ["IST2088", "EST7042"], correqs: [], categoria: "sistemas" },
          { id: "IST7111", codigo: "IST 7111", nombre: "Bases de Datos", creditos: 3, ht: 2, hp: 2, prerreqs: ["IST4031"], correqs: [], categoria: "sistemas" },
          { id: "IST7191", codigo: "IST 7191", nombre: "Redes de Computación", creditos: 3, ht: 3, hp: 0, prerreqs: ["IST4021"], correqs: [], categoria: "sistemas" },
          { id: "IST4012", codigo: "IST 4012", nombre: "Estructura del Computador I", creditos: 3, ht: 3, hp: 0, prerreqs: ["IST7072"], correqs: [], categoria: "sistemas" },
        ],
      },
      {
        numero: 7,
        creditos: 15,
        materias: [
          { id: "ELG1170", codigo: "ELG 1170", nombre: "Electiva en Ética", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "electiva" },
          { id: "IST7420", codigo: "IST 7420", nombre: "Optimización", creditos: 3, ht: 3, hp: 0, prerreqs: ["EST7042"], correqs: [], categoria: "matematicas" },
          { id: "IST7121", codigo: "IST 7121", nombre: "Diseño de Software I", creditos: 3, ht: 3, hp: 0, prerreqs: ["IST7111"], correqs: [], categoria: "programacion" },
          { id: "IST70811", codigo: "IST 70811", nombre: "Sistemas Operativos", creditos: 3, ht: 3, hp: 0, prerreqs: ["IST4012"], correqs: [], categoria: "sistemas" },
          { id: "IST7102", codigo: "IST 7102", nombre: "Estructura del Computador II", creditos: 3, ht: 3, hp: 0, prerreqs: ["IST4012"], correqs: [], categoria: "sistemas" },
          { id: "IST7410", codigo: "IST 7410", nombre: "Compiladores", creditos: 3, ht: 3, hp: 0, prerreqs: ["IST4310"], correqs: [], categoria: "programacion" },
        ],
      },
      {
        numero: 8,
        creditos: 17,
        materias: [
          { id: "ELG1190", codigo: "ELG 1190", nombre: "Electiva en Ciencias Sociales", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "electiva" },
          { id: "ELG1301", codigo: "ELG 1301", nombre: "Electiva Profesional I", creditos: 3, ht: 3, hp: 0, prerreqs: ["IST7121"], correqs: [], categoria: "electiva" },
          { id: "IST7122", codigo: "IST 7122", nombre: "Diseño de Software II", creditos: 3, ht: 3, hp: 0, prerreqs: ["IST7121"], correqs: [], categoria: "programacion" },
          { id: "ELG1302", codigo: "ELG 1302", nombre: "Electiva en Redes", creditos: 2, ht: 1, hp: 2, prerreqs: ["IST7191"], correqs: [], categoria: "electiva" },
          { id: "ELG1303", codigo: "ELG 1303", nombre: "Electiva Ciencias de la Computación", creditos: 3, ht: 3, hp: 0, prerreqs: ["IST7420"], correqs: [], categoria: "electiva" },
          { id: "ELG8400", codigo: "ELG 8400", nombre: "Electiva Innovación, Dllo. y Sociedad", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "electiva" },
        ],
      },
      {
        numero: 9,
        creditos: 15,
        materias: [
          { id: "ELG1160", codigo: "ELG 1160", nombre: "Electiva en Filosofía", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "electiva" },
          { id: "ELG1305", codigo: "ELG 1305", nombre: "Electiva Profesional II", creditos: 3, ht: 3, hp: 0, prerreqs: ["ELG1301"], correqs: [], categoria: "electiva" },
          { id: "INV7363", codigo: "INV 7363", nombre: "Proyecto Final", creditos: 3, ht: 3, hp: 0, prerreqs: ["IST7122", "ELG1301"], correqs: [], categoria: "grado" },
          { id: "ELG1304", codigo: "ELG 1304", nombre: "Electiva Gestión Informática", creditos: 3, ht: 3, hp: 0, prerreqs: ["IST7121"], correqs: [], categoria: "electiva" },
          { id: "ELP4030", codigo: "ELP 4030", nombre: "Electiva Formación Complement. I", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "electiva" },
          { id: "IIN4319", codigo: "IIN 4319", nombre: "Examen Comprehensivo II", creditos: 0, ht: 0, hp: 0, prerreqs: ["IIN4310"], correqs: [], categoria: "grado" },
        ],
      },
      {
        numero: 10,
        creditos: 12,
        materias: [
          { id: "ELG1180", codigo: "ELG 1180", nombre: "Electiva Estudios del Caribe", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "electiva" },
          { id: "ELG1306", codigo: "ELG 1306", nombre: "Electiva Profesional III", creditos: 3, ht: 3, hp: 0, prerreqs: ["ELG1305"], correqs: [], categoria: "electiva" },
          { id: "ELP8090", codigo: "ELP 8090", nombre: "Electiva Formación Complement. II", creditos: 3, ht: 3, hp: 0, prerreqs: ["ELP4030"], correqs: [], categoria: "electiva" },
          { id: "IST4380", codigo: "IST 4380", nombre: "Seminario de Carrera II", creditos: 0, ht: 0, hp: 0, prerreqs: ["INV7363"], correqs: [], categoria: "grado" },
          { id: "IST4370", codigo: "IST 4370", nombre: "Seminario de Carrera I", creditos: 0, ht: 0, hp: 0, prerreqs: [], correqs: [], categoria: "grado" },
        ],
      },
    ],
  },
  {
    id: "mecanica-uninorte",
    nombre: "Ingeniería Mecánica (Plan Extendido)",
    creditos_totales: 228,
    semestres: [
      {
        numero: 1,
        creditos: 15,
        materias: [
          { id: "MAT1031", codigo: "MAT 1031", nombre: "Álgebra Lineal", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "matematicas" },
          { id: "MAT1101", codigo: "MAT 1101", nombre: "Cálculo I - Diferencial", creditos: 5, ht: 4, hp: 2, prerreqs: [], correqs: [], categoria: "matematicas" },
          { id: "MEC0010", codigo: "MEC 0010", nombre: "Intro. a la Ingeniería Mecánica", creditos: 1, ht: 1, hp: 0, prerreqs: [], correqs: [], categoria: "mecanica" },
          { id: "MEC1011", codigo: "MEC 1011", nombre: "Dibujo Técnico y Geometría Descr.", creditos: 3, ht: 1, hp: 4, prerreqs: [], correqs: [], categoria: "mecanica" },
          { id: "CAS3020", codigo: "CAS 3020", nombre: "Competencias Comunicativas I", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "humanidades" }
        ]
      },
      {
        numero: 2,
        creditos: 17,
        materias: [
          { id: "MAT1111", codigo: "MAT 1111", nombre: "Cálculo II - Integral", creditos: 4, ht: 4, hp: 0, prerreqs: ["MAT1101"], correqs: [], categoria: "matematicas" },
          { id: "FIS1023", codigo: "FIS 1023", nombre: "Física Mecánica", creditos: 4, ht: 3, hp: 2, prerreqs: ["MAT1101"], correqs: [], categoria: "ciencias" },
          { id: "MEC1022", codigo: "MEC 1022", nombre: "Modelado Computacional (CAD)", creditos: 3, ht: 1, hp: 4, prerreqs: ["MEC1011"], correqs: [], categoria: "mecanica" },
          { id: "IST2088", codigo: "IST 2088", nombre: "Algoritmia y Programación I", creditos: 3, ht: 2, hp: 2, prerreqs: [], correqs: [], categoria: "programacion" },
          { id: "CAS3030", codigo: "CAS 3030", nombre: "Competencias Comunicativas II", creditos: 3, ht: 3, hp: 0, prerreqs: ["CAS3020"], correqs: [], categoria: "humanidades" }
        ]
      },
      {
        numero: 3,
        creditos: 17,
        materias: [
          { id: "MAT1121", codigo: "MAT 1121", nombre: "Cálculo III - Vectorial", creditos: 4, ht: 4, hp: 0, prerreqs: ["MAT1111"], correqs: [], categoria: "matematicas" },
          { id: "FIS1043", codigo: "FIS 1043", nombre: "Física Calor-Ondas", creditos: 4, ht: 3, hp: 2, prerreqs: ["FIS1023"], correqs: [], categoria: "ciencias" },
          { id: "MEC2011", codigo: "MEC 2011", nombre: "Estática", creditos: 3, ht: 3, hp: 0, prerreqs: ["FIS1023", "MAT1111"], correqs: [], categoria: "mecanica" },
          { id: "MEC2021", codigo: "MEC 2021", nombre: "Ciencia de los Materiales I", creditos: 3, ht: 3, hp: 0, prerreqs: ["FIS1023"], correqs: [], categoria: "mecanica" },
          { id: "ELG1130", codigo: "ELG 1130", nombre: "Electiva en Humanidades", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "electiva" }
        ]
      },
      {
        numero: 4,
        creditos: 16,
        materias: [
          { id: "MAT4011", codigo: "MAT 4011", nombre: "Ecuaciones Diferenciales", creditos: 3, ht: 3, hp: 0, prerreqs: ["MAT1121"], correqs: [], categoria: "matematicas" },
          { id: "MEC2032", codigo: "MEC 2032", nombre: "Dinámica", creditos: 4, ht: 4, hp: 0, prerreqs: ["MEC2011"], correqs: [], categoria: "mecanica" },
          { id: "MEC2042", codigo: "MEC 2042", nombre: "Mecánica de Sólidos I", creditos: 3, ht: 3, hp: 0, prerreqs: ["MEC2011"], correqs: [], categoria: "mecanica" },
          { id: "MEC2052", codigo: "MEC 2052", nombre: "Ciencia de los Materiales II", creditos: 3, ht: 2, hp: 2, prerreqs: ["MEC2021"], correqs: [], categoria: "mecanica" },
          { id: "ELG1140", codigo: "ELG 1140", nombre: "Electiva en Historia", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "electiva" }
        ]
      },
      {
        numero: 5,
        creditos: 16,
        materias: [
          { id: "MEC3011", codigo: "MEC 3011", nombre: "Termodinamica I", creditos: 4, ht: 4, hp: 0, prerreqs: ["FIS1043", "MAT4011"], correqs: [], categoria: "mecanica" },
          { id: "MEC3021", codigo: "MEC 3021", nombre: "Mecánica de Fluidos I", creditos: 4, ht: 3, hp: 2, prerreqs: ["MEC2032"], correqs: [], categoria: "mecanica" },
          { id: "MEC3031", codigo: "MEC 3031", nombre: "Mecánica de Sólidos II", creditos: 3, ht: 3, hp: 0, prerreqs: ["MEC2042"], correqs: [], categoria: "mecanica" },
          { id: "MEC3041", codigo: "MEC 3041", nombre: "Procesos de Manufactura I", creditos: 2, ht: 1, hp: 2, prerreqs: ["MEC2052"], correqs: [], categoria: "mecanica" },
          { id: "ELG1150", codigo: "ELG 1150", nombre: "Electiva en Ciencias de la Vida", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "electiva" }
        ]
      },
      {
        numero: 6,
        creditos: 16,
        materias: [
          { id: "MEC3052", codigo: "MEC 3052", nombre: "Termodinámica II", creditos: 3, ht: 3, hp: 0, prerreqs: ["MEC3011"], correqs: [], categoria: "mecanica" },
          { id: "MEC3062", codigo: "MEC 3062", nombre: "Mecánica de Fluidos II", creditos: 3, ht: 3, hp: 0, prerreqs: ["MEC3021"], correqs: [], categoria: "mecanica" },
          { id: "MEC3072", codigo: "MEC 3072", nombre: "Mecanismos y Teoría de Máquinas", creditos: 4, ht: 3, hp: 2, prerreqs: ["MEC2032"], correqs: [], categoria: "mecanica" },
          { id: "MEC3082", codigo: "MEC 3082", nombre: "Procesos de Manufactura II", creditos: 3, ht: 2, hp: 2, prerreqs: ["MEC3041"], correqs: [], categoria: "mecanica" },
          { id: "EST7042", codigo: "EST 7042", nombre: "Análisis de Datos en Ing. I", creditos: 3, ht: 3, hp: 0, prerreqs: ["MAT1111"], correqs: [], categoria: "matematicas" }
        ]
      },
      {
        numero: 7,
        creditos: 15,
        materias: [
          { id: "MEC4011", codigo: "MEC 4011", nombre: "Transferencia de Calor I", creditos: 4, ht: 4, hp: 0, prerreqs: ["MEC3052", "MEC3062"], correqs: [], categoria: "mecanica" },
          { id: "MEC4021", codigo: "MEC 4021", nombre: "Diseño de Elementos de Máquinas I", creditos: 4, ht: 4, hp: 0, prerreqs: ["MEC3031", "MEC3072"], correqs: [], categoria: "mecanica" },
          { id: "MEC4031", codigo: "MEC 4031", nombre: "Sistemas Dinámicos y Controles", creditos: 4, ht: 3, hp: 2, prerreqs: ["MAT4011", "MEC2032"], correqs: [], categoria: "mecanica" },
          { id: "ELG1170", codigo: "ELG 1170", nombre: "Electiva en Ética", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "electiva" }
        ]
      },
      {
        numero: 8,
        creditos: 16,
        materias: [
          { id: "MEC4042", codigo: "MEC 4042", nombre: "Transferencia de Calor II", creditos: 3, ht: 3, hp: 0, prerreqs: ["MEC4011"], correqs: [], categoria: "mecanica" },
          { id: "MEC4052", codigo: "MEC 4052", nombre: "Diseño de Elementos de Máquinas II", creditos: 4, ht: 3, hp: 2, prerreqs: ["MEC4021"], correqs: [], categoria: "mecanica" },
          { id: "MEC4062", codigo: "MEC 4062", nombre: "Vibraciones Mecánicas", creditos: 3, ht: 3, hp: 0, prerreqs: ["MEC4031"], correqs: [], categoria: "mecanica" },
          { id: "MEC4072", codigo: "MEC 4072", nombre: "Instrumentación y Metrología", creditos: 3, ht: 2, hp: 2, prerreqs: ["MEC4031"], correqs: [], categoria: "mecanica" },
          { id: "ELG1190", codigo: "ELG 1190", nombre: "Electiva en Ciencias Sociales", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "electiva" }
        ]
      },
      {
        numero: 9,
        creditos: 15,
        materias: [
          { id: "MEC5011", codigo: "MEC 5011", nombre: "Plantas Térmicas y de Potencia", creditos: 3, ht: 3, hp: 0, prerreqs: ["MEC4042"], correqs: [], categoria: "mecanica" },
          { id: "MEC5021", codigo: "MEC 5021", nombre: "Mantenimiento Industrial", creditos: 3, ht: 3, hp: 0, prerreqs: ["MEC4052"], correqs: [], categoria: "mecanica" },
          { id: "MEC5031", codigo: "MEC 5031", nombre: "Diseño de Sistemas Mecánicos", creditos: 3, ht: 1, hp: 4, prerreqs: ["MEC4052"], correqs: [], categoria: "mecanica" },
          { id: "MEC5041", codigo: "MEC 5041", nombre: "Oleohidráulica y Neumática", creditos: 3, ht: 2, hp: 2, prerreqs: ["MEC3062"], correqs: [], categoria: "mecanica" },
          { id: "ELG1160", codigo: "ELG 1160", nombre: "Electiva en Filosofía", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "electiva" }
        ]
      },
      {
        numero: 10,
        creditos: 15,
        materias: [
          { id: "MEC5052", codigo: "MEC 5052", nombre: "Turbomaquinaria", creditos: 3, ht: 3, hp: 0, prerreqs: ["MEC3062"], correqs: [], categoria: "mecanica" },
          { id: "MEC5062", codigo: "MEC 5062", nombre: "Refrigeración y Aire Acondicionado", creditos: 3, ht: 2, hp: 2, prerreqs: ["MEC4042"], correqs: [], categoria: "mecanica" },
          { id: "MEC5072", codigo: "MEC 5072", nombre: "Análisis por Elementos Finitos (FEA)", creditos: 3, ht: 2, hp: 2, prerreqs: ["MEC4052"], correqs: [], categoria: "mecanica" },
          { id: "ELG1311", codigo: "ELG 1311", nombre: "Electiva de Énfasis I (Diseño)", creditos: 3, ht: 3, hp: 0, prerreqs: ["MEC5031"], correqs: [], categoria: "electiva" },
          { id: "ELG1180", codigo: "ELG 1180", nombre: "Electiva Estudios del Caribe", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "electiva" }
        ]
      },
      {
        numero: 11,
        creditos: 15,
        materias: [
          { id: "MEC6011", codigo: "MEC 6011", nombre: "Mecatrónica y Automatización", creditos: 4, ht: 2, hp: 4, prerreqs: ["MEC4072"], correqs: [], categoria: "mecanica" },
          { id: "MEC6021", codigo: "MEC 6021", nombre: "Dinámica de Fluidos Computac. (CFD)", creditos: 3, ht: 2, hp: 2, prerreqs: ["MEC5052"], correqs: [], categoria: "mecanica" },
          { id: "ELG1312", codigo: "ELG 1312", nombre: "Electiva de Énfasis II (Térmica)", creditos: 3, ht: 3, hp: 0, prerreqs: ["MEC5011"], correqs: [], categoria: "electiva" },
          { id: "ELP4030", codigo: "ELP 4030", nombre: "Electiva Formación Complement. I", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "electiva" },
          { id: "MEC6000", codigo: "MEC 6000", nombre: "Pre-Proyecto de Grado", creditos: 2, ht: 2, hp: 0, prerreqs: ["MEC5031"], correqs: [], categoria: "grado" }
        ]
      },
      {
        numero: 12,
        creditos: 14,
        materias: [
          { id: "MEC6032", codigo: "MEC 6032", nombre: "Robótica Industrial", creditos: 3, ht: 2, hp: 2, prerreqs: ["MEC6011"], correqs: [], categoria: "mecanica" },
          { id: "MEC6042", codigo: "MEC 6042", nombre: "Integración de Sistemas de Manufactura", creditos: 3, ht: 3, hp: 0, prerreqs: ["MEC3082"], correqs: [], categoria: "mecanica" },
          { id: "ELG1313", codigo: "ELG 1313", nombre: "Electiva de Énfasis III (Manufactura)", creditos: 3, ht: 3, hp: 0, prerreqs: ["MEC3082"], correqs: [], categoria: "electiva" },
          { id: "INV7363", codigo: "INV 7363", nombre: "Proyecto Final - Fase I", creditos: 3, ht: 3, hp: 0, prerreqs: ["MEC6000"], correqs: [], categoria: "grado" },
          { id: "ELP8090", codigo: "ELP 8090", nombre: "Electiva Formación Complement. II", creditos: 2, ht: 2, hp: 0, prerreqs: ["ELP4030"], correqs: [], categoria: "electiva" }
        ]
      },
      {
        numero: 13,
        creditos: 12,
        materias: [
          { id: "MEC7011", codigo: "MEC 7011", nombre: "Materiales Compuestos y Avanzados", creditos: 3, ht: 3, hp: 0, prerreqs: ["MEC2052"], correqs: [], categoria: "mecanica" },
          { id: "MEC7021", codigo: "MEC 7021", nombre: "Energías Renovables y Alternativas", creditos: 3, ht: 3, hp: 0, prerreqs: ["MEC5011"], correqs: [], categoria: "mecanica" },
          { id: "ELG1314", codigo: "ELG 1314", nombre: "Electiva de Énfasis IV (Gestión)", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "electiva" },
          { id: "INV7364", codigo: "INV 7364", nombre: "Proyecto Final - Fase II", creditos: 3, ht: 3, hp: 0, prerreqs: ["INV7363"], correqs: [], categoria: "grado" }
        ]
      },
      {
        numero: 14,
        creditos: 12,
        materias: [
          { id: "MEC7032", codigo: "MEC 7032", nombre: "Integridad Estructural y Fatiga", creditos: 3, ht: 3, hp: 0, prerreqs: ["MEC3031"], correqs: [], categoria: "mecanica" },
          { id: "MEC7042", codigo: "MEC 7042", nombre: "Gestión de Activos y Confiabilidad", creditos: 3, ht: 3, hp: 0, prerreqs: ["MEC5021"], correqs: [], categoria: "mecanica" },
          { id: "ELG1315", codigo: "ELG 1315", nombre: "Electiva de Énfasis V (Avanzada)", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "electiva" },
          { id: "MEC7052", codigo: "MEC 7052", nombre: "Seminario de Tendencias Mecánicas", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "mecanica" }
        ]
      },
      {
        numero: 15,
        creditos: 13,
        materias: [
          { id: "MEC7061", codigo: "MEC 7061", nombre: "Optimización de Sistemas Mecánicos", creditos: 3, ht: 3, hp: 0, prerreqs: ["MEC5072"], correqs: [], categoria: "mecanica" },
          { id: "MEC7071", codigo: "MEC 7071", nombre: "Acústica y Control de Ruido", creditos: 3, ht: 2, hp: 2, prerreqs: ["MEC4062"], correqs: [], categoria: "mecanica" },
          { id: "MEC7081", codigo: "MEC 7081", nombre: "Práctica Industrial Avanzada", creditos: 4, ht: 0, hp: 8, prerreqs: ["INV7364"], correqs: [], categoria: "grado" },
          { id: "ELG8400", codigo: "ELG 8400", nombre: "Electiva Innovación, Dllo. y Sociedad", creditos: 3, ht: 3, hp: 0, prerreqs: [], correqs: [], categoria: "electiva" }
        ]
      }
    ]
  }
];