const { Router } = require("express");
const { check } = require("express-validator");

const { validarCampos } = require("../middlewares");

const { existeModeloPorId } = require("../helpers/db-validators");

const { Materia } = require("../models");

const {
  getMaterias,
  postMateria,
  deleteMateria,
} = require("../controllers/materias");

const router = Router();

const existeMateriaPorId = async (id) => {
  return existeModeloPorId(id, Materia);
};
router.get("/", getMaterias);

router.post(
  "/",
  [
    check("materia", "La materia es obligatoria").not().isEmpty(),
    validarCampos,
  ],
  postMateria
);

router.delete(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeMateriaPorId),
    validarCampos,
  ],
  deleteMateria
);

module.exports = router;
