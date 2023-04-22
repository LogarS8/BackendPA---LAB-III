const { response, request } = require("express");
const bcryptjs = require("bcryptjs");

const Usuario = require("../models/usuario");

const { generarJWT } = require("../helpers/generar-jwt");

const renovarToken = async (req = request, res = response) => {
  const { usuario } = req;

  try {
    const token = await generarJWT(usuario.id);

    return res.status(200).json({
      usuario,
      token,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      msg: "Error inesperado al renovar el token",
    });
  }
};

const getUsuarios = async (req = request, res = response) => {
  const query = { estado: true };

  try {
    const [total, usuarios] = await Promise.all([
      Usuario.countDocuments(query).lean(),
      Usuario.find(query)
        .select("nombre apellido correo telefono rol estado img _id")
        .lean(),
    ]);

    for (const usuario of usuarios) {
      usuario.uid = usuario._id;
      delete usuario._id;
    }

    return res.status(200).json({
      total,
      usuarios,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      msg: "Error inesperado al obtener los usuarios",
    });
  }
};

const postUsuarios = async (req = request, res = response) => {
  const {
    nombre,
    apellido,
    correo,
    telefono,
    password,
    rol,
    img = "",
  } = req.body;
  try {
    const usuario = new Usuario({
      nombre,
      apellido,
      correo,
      telefono,
      password,
      rol,
      img,
    });

    // Encriptar la contraseña
    const salt = bcryptjs.genSaltSync();
    usuario.password = bcryptjs.hashSync(password, salt);

    await usuario.save();

    const token = await generarJWT(usuario.id);

    delete usuario.password;

    return res.status(200).json({
      usuario,
      token,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      msg: "Error inesperado al crear el usuario",
    });
  }
};

const login = async (req = request, res = response) => {
  const { correo, password } = req.body;

  try {
    // Verificar si el email existe
    const usuario = await Usuario.findOne({ correo })
      .select("nombre apellido correo telefono rol estado img password _id")
      .lean();

    if (!usuario) {
      return res.status(400).json({
        msg: "Usuario / Password no son correctos - correo",
      });
    }

    // Verificar la contraseña
    const validPassword = bcryptjs.compareSync(password, usuario.password);
    if (!validPassword) {
      return res.status(400).json({
        msg: "Usuario / Password no son correctos - password",
      });
    }

    // SI el usuario está activo
    if (!usuario.estado) {
      return res.status(400).json({
        msg: "Cuenta inactiva - hable con el administrador",
      });
    }

    // Generar el JWT
    const token = await generarJWT(usuario._id);

    delete usuario.password;
    usuario.uid = usuario._id;
    delete usuario._id;

    return res.status(200).json({
      usuario,
      token,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      msg: "Error inesperado al iniciar sesión",
    });
  }
};

const putUsuarios = async (req = request, res = response) => {
  const { usuario } = req;

  let {
    nombre = usuario.nombre,
    apellido = usuario.apellido,
    password = usuario.password,
    img = usuario.img,
  } = req.body;

  try {
    if (password) {
      const salt = bcryptjs.genSaltSync();
      password = bcryptjs.hashSync(password, salt);
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      usuario.uid,
      {
        nombre,
        apellido,
        password,
        img,
      },
      { new: true }
    )
      .select("nombre apellido correo telefono rol estado img")
      .lean();

    usuarioActualizado.uid = usuario.id;
    delete usuarioActualizado._id;

    return res.status(200).json(usuarioActualizado);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      msg: "Hable con el administrador",
    });
  }
};

const deleteUsuarios = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    await Usuario.findByIdAndUpdate(id, { estado: false }, { new: true });

    return res.sendStatus(204);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      msg: "Hable con el administrador",
    });
  }
};

module.exports = {
  getUsuarios,
  putUsuarios,
  postUsuarios,
  deleteUsuarios,
  login,
  renovarToken,
};
