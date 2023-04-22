const { request, response } = require("express");
const { Tutoria } = require("../models");

const cloudinary = require("cloudinary").v2;
cloudinary.config(process.env.CLOUDINARY_URL);

const populateConfig = {
  materia: {
    path: "materia",
    select: "materia",
  },
  tutor: {
    path: "tutor",
    select: ["nombre", "apellido", "correo"],
  },
  alumnos: {
    path: "alumnos",
    select: ["nombre", "apellido", "correo"],
  },
};

const getTutorias = async (req = request, res = response) => {
  try {
    const [total, tutorias] = await Promise.all([
      Tutoria.countDocuments(),
      Tutoria.find()
        .populate(populateConfig.materia)
        .populate(populateConfig.tutor)
        .populate(populateConfig.alumnos)
        .lean(),
    ]);
    return res.status(200).json({
      total,
      tutorias,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      msg: "Error inesperado al obtener las tutorias",
    });
  }
};

const getTutoria = async (req = request, res = response) => {
  const { id } = req.params;
  try {
    const tutoria = await Tutoria.findById(id)
      .populate(populateConfig.materia)
      .populate(populateConfig.tutor)
      .populate(populateConfig.alumnos)
      .lean();

    if (!tutoria) {
      return res.status(404).json({
        msg: `La materia con el id ${id} no existe`,
      });
    }
    return res.status(200).json(tutoria);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      msg: "Error inesperado al obtener la tutoria",
    });
  }
};

const getByActionTutorias = async (req, res = response) => {
  const { action } = req.params;
  const { usuario } = req;

  const findConfig = {
    disponibles: {
      tutor: { $ne: usuario.id },
      alumnos: { $ne: usuario.id },
    },
    inscritas: {
      alumnos: { $eq: usuario.id },
    },
    propias: {
      tutor: { $eq: usuario.id },
    },
  };

  try {
    if (!findConfig[action]) {
      return res.status(400).json({
        msg: "Error al obtener las tutorias",
      });
    }

    const tutorias = await Tutoria.find(findConfig[action])
      .populate(populateConfig.materia)
      .populate(populateConfig.tutor)
      .populate(populateConfig.alumnos)
      .lean();

    return res.status(200).json(tutorias);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      msg: "Error inesperado al obtener las tutorias",
    });
  }
};

const postTutoria = async (req, res = response) => {
  const { nombre, materia, tutor, cupo, descripcion } = req.body;

  try {
    const alreadyExists = await Tutoria.findOne({ nombre });

    if (alreadyExists) {
      return res.status(400).json({
        msg: "Ya existe una tutoria con ese nombre",
      });
    }

    const tutoria = new Tutoria({
      nombre,
      materia,
      tutor,
      cupo,
      descripcion,
    });
    await tutoria.save();

    const tutoriaPopulated = await Tutoria.findById(tutoria.id)
      .populate(populateConfig.materia)
      .populate(populateConfig.tutor)
      .lean();

    return res.status(200).json({
      tutoria: tutoriaPopulated,
    });
  } catch (error) {
    return res.status(400).json({
      msg: "Error al crear la tutoria",
    });
  }
};

const deleteTutoria = async (req, res = response) => {
  const { id } = req.params;

  try {
    await Tutoria.findByIdAndDelete(id, { new: true });
    return res.sendStatus(200);
  } catch (error) {
    return res.status(404).json({
      msg: `La tutoria con el id ${id} no existe`,
    });
  }
};

const putAgregarArchivo = async (req, res = response) => {
  const { id } = req.params;
  const { archivo } = req.files;

  try {
    // Verificar si el archivo es demasiado grande
    if (archivo.size > 10000000) {
      // 10 MB
      return res.status(400).json({
        msg: "El archivo es demasiado grande",
      });
    }

    const fileTypes = archivo.mimetype.split("/");

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      archivo.tempFilePath,
      {
        resource_type: "auto",
        folder: `Tutoripolis/${fileTypes[0]}`,
      }
    );

    const urls = [
      {
        url: secure_url,
        tipo: fileTypes[0],
        public_id,
      },
    ];

    const tutoria = await Tutoria.findByIdAndUpdate(
      id,
      { $push: { urls } },
      { new: true }
    )
      .populate(populateConfig.materia)
      .populate(populateConfig.tutor)
      .populate(populateConfig.alumnos)
      .lean();

    return res.status(200).json({
      tutoria,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      msg: "Error inesperado al agregar archivos",
    });
  }
};

const getMostrarArchivo = async (req = request, res = response) => {
  const { id, id_archivo } = req.params;
  try {
    const urls = await Tutoria.findById(id).select("urls").lean();

    if (!urls) {
      return res.status(404).json({
        msg: `La tutoria con el id ${id} no existe`,
      });
    }
    const url = urls.urls.find((url) => url._id.toString() === id_archivo).url;

    if (!url) {
      return res.status(404).sendFile(__dirname + "/../assets/no-image.jpg");
    }

    return res.status(200).redirect(url);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      msg: "Error al mostrar el archivo",
    });
  }
};

const putEliminarArchivos = async (req, res = response) => {
  const { id } = req.params;
  const { urls } = req.body;

  try {
    const tutoria = await Tutoria.findById(id).select("urls").lean();

    if (!tutoria) {
      return res.status(404).json({
        msg: `La tutoria con el id ${id} no existe`,
      });
    }

    const urlTutoria = tutoria.urls.map((url) => url._id.toString());

    if (urls.some((url) => !urlTutoria.includes(url._id))) {
      return res.status(400).json({
        msg: "El archivo no existe",
      });
    }

    for await (const url of tutoria.urls) {
      await cloudinary.uploader.destroy(`${url.public_id}`);
    }

    const tutoriaUpdated = await Tutoria.findByIdAndUpdate(
      id,
      { $pull: { urls: { _id: { $in: urls.map((url) => url._id) } } } },
      { new: true }
    )
      .populate(populateConfig.materia)
      .populate(populateConfig.tutor)
      .populate(populateConfig.alumnos)
      .lean();

    return res.status(200).json(tutoriaUpdated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error inesperado al eliminar los archivos",
    });
  }
};
const putAlumnos = async (req, res = response) => {
  const { id, accion } = req.params;
  const { alumno } = req.body;

  try {
    const tutoria = await Tutoria.findById(id);

    if (!tutoria) {
      return res.status(404).json({
        msg: `La tutoria con el id ${id} no existe`,
      });
    }

    if (tutoria.tutor.toString() === alumno) {
      return res.status(400).json({
        msg: `El tutor no puede ser alumno`,
      });
    }

    const { cupo } = tutoria;

    if (accion === "agregar") {
      if (cupo === 0) {
        return res.status(400).json({
          msg: `No hay cupo disponible`,
        });
      }

      if (tutoria.alumnos.includes(alumno)) {
        return res.status(400).json({
          msg: `El alumno ${alumno} ya esta inscrito`,
        });
      }

      const tutoriaUpdated = await Tutoria.findByIdAndUpdate(
        id,
        { $push: { alumnos: alumno }, $inc: { cupo: -1 } },
        { new: true }
      );

      return res.status(200).json(tutoriaUpdated);
    } else {
      if (!tutoria.alumnos.includes(alumno)) {
        return res.status(400).json({
          msg: `El alumno ${alumno} no esta inscrito`,
        });
      }

      const index = tutoria.alumnos.indexOf(alumno);
      let tutoriaUpdated;
      if (index > -1) {
        tutoriaUpdated = await Tutoria.findByIdAndUpdate(
          id,
          { $pull: { alumnos: alumno }, $inc: { cupo: 1 } },
          { new: true }
        );
      }

      return res.status(200).json(tutoriaUpdated);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error inesperado al agregar o eliminar alumnos",
    });
  }
};

module.exports = {
  getTutorias,
  getTutoria,

  getByActionTutorias,

  postTutoria,
  deleteTutoria,
  //   ----------------
  putAgregarArchivo,
  getMostrarArchivo,

  putEliminarArchivos,

  putAlumnos,
};
