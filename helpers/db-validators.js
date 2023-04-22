const { Usuario } = require("../models");
const emailExiste = async (correo = "") => {
  // Verificar si el correo existe
  const existeEmail = await Usuario.findOne({ correo });
  if (existeEmail) {
    throw new Error(`El correo: ${correo}, ya está registrado`);
  }
};

const telefonoExiste = async (telefono = "") => {
  // Verificar si el telefono existe
  const existeTelefono = await Usuario.findOne({ telefono });
  if (existeTelefono) {
    throw new Error(`El telefono: ${telefono}, ya está registrado`);
  }
};

const existeModeloPorId = async (id, modelo) => {
  const existe = await modelo.findById(id);
  if (!existe) {
    throw new Error(`El objeto del modelo ${modelo} con el id ${id} no existe`);
  }
};

/**
 * Validar colecciones permitidas
 */
const coleccionesPermitidas = (coleccion = "", colecciones = []) => {
  const incluida = colecciones.includes(coleccion);
  if (!incluida) {
    throw new Error(
      `La colección ${coleccion} no es permitida, ${colecciones}`
    );
  }
  return true;
};

module.exports = {
  emailExiste,
  telefonoExiste,
  existeModeloPorId,
  coleccionesPermitidas,
};
