const { Router } = require("express");
const { check } = require("express-validator");

const {
  validarCampos,
  validarJWT,
  validarArchivoSubir,
  validarTipoArchivo,
} = require("../middlewares");

const { existeModeloPorId } = require("../helpers/db-validators");

const {
  getTutorias,
  getTutoria,

  getByActionTutorias,

  postTutoria,
  deleteTutoria,
  //   ------------------
  putAgregarArchivo,
  putEliminarArchivos,
  getMostrarArchivo,
  putAlumnos,
} = require("../controllers/tutorias");

const { Tutoria, Usuario, Materia } = require("../models");

const existeTutoriaPorId = async (id) => {
  return existeModeloPorId(id, Tutoria);
};

const existeMateriaPorId = async (id) => {
  return existeModeloPorId(id, Materia);
};

const existeUsuarioPorId = async (id) => {
  return existeModeloPorId(id, Usuario);
};

const router = Router();

router.get("/", getTutorias);

router.get(
  "/obtener/:action",
  [
    check("action", "No es un ID válido").isIn([
      "disponibles",
      "inscritas",
      "propias",
    ]),
    validarJWT,
  ],
  getByActionTutorias
);

router.get(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeTutoriaPorId),
    validarCampos,
  ],
  getTutoria
);

router.post(
  "/",
  [
    check("nombre", "El nombre es obligatorio").not().isEmpty(),
    check("materia", "La materia es obligatoria").not().isEmpty(),
    check("materia").isMongoId(),
    check("materia").custom(existeMateriaPorId),
    check("tutor", "El tutor es obligatorio").not().isEmpty(),
    check("tutor").isMongoId(),
    check("tutor").custom(existeUsuarioPorId),
    check("cupo", "El cupo es obligatorio").not().isEmpty(),
    check("cupo", "El cupo debe ser un número").isNumeric(),
    check("cupo", "El cupo debe ser mayor a 0").isInt({ min: 1 }),
    check("descripcion", "La descripción es obligatoria").not().isEmpty(),
    validarCampos,
  ],
  postTutoria
);

router.delete(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeTutoriaPorId),
    validarCampos,
  ],
  deleteTutoria
);

router.put(
  "/urls/agregar/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeTutoriaPorId),
    validarArchivoSubir,
    validarTipoArchivo,
    validarCampos,
  ],
  putAgregarArchivo
);

router.put(
  "/urls/eliminar/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeTutoriaPorId),
    check("urls", "No es un Array válido").isArray(),
    check("urls.*._id", "El _id es obligatorio").not().isEmpty(),
    check("urls.*._id").isMongoId(),
    validarCampos,
  ],
  putEliminarArchivos
);

router.get(
  "/urls/mostrar/:id/:id_archivo",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id_archivo", "No es un ID válido").isMongoId(),
    validarCampos,
  ],
  getMostrarArchivo
);

router.put(
  "/alumno/:accion/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeTutoriaPorId),
    check("accion", "La acción es obligatoria").isIn(["agregar", "eliminar"]),

    check("alumno", "El alumno es obligatorio").not().isEmpty(),
    check("alumno").isMongoId(),

    validarCampos,
  ],
  putAlumnos
);

module.exports = router;
