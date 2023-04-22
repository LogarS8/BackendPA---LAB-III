const { Router } = require("express");
const { check } = require("express-validator");

const { validarCampos, validarJWT } = require("../middlewares");

const {
  existeModeloPorId,
  emailExiste,
  telefonoExiste,
} = require("../helpers/db-validators");

const {
  getUsuarios,
  postUsuarios,
  putUsuarios,
  deleteUsuarios,
  login,
  renovarToken,
} = require("../controllers/usuarios");

const { Usuario } = require("../models");

const router = Router();

const existeUsuarioPorId = async (id) => {
  return await existeModeloPorId(id, Usuario);
};

router.get("/", getUsuarios);

router.get("/token", validarJWT, renovarToken);

router.post(
  "/",
  [
    check("nombre", "El nombre es obligatorio").not().isEmpty(),
    check("apellido", "El apellido es obligatorio").not().isEmpty(),
    check("password", "El password debe de ser más de 6 letras").isLength({
      min: 6,
    }),
    check("correo", "El correo no es válido").isEmail(),
    check("correo").custom(emailExiste),
    check("telefono", "El telefono debe de ser de 10 digitos").isLength({
      min: 10,
      max: 10,
    }),
    check("telefono").custom(telefonoExiste),
    check("rol", "No es un rol válido").isIn(["ADMIN_ROLE", "USER_ROLE"]),
    validarCampos,
  ],
  postUsuarios
);

router.post(
  "/login",
  [
    check("correo", "El correo es obligatorio").isEmail(),
    check("password", "La contraseña es obligatoria").not().isEmpty(),
    validarCampos,
  ],
  login
);

router.put("/", [validarJWT, validarCampos], putUsuarios);

router.delete(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeUsuarioPorId),
    validarCampos,
  ],
  deleteUsuarios
);

module.exports = router;
