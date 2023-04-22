const { request, response } = require("express");
const { Materia } = require("../models");

const getMaterias = async (req = request, res = response) => {
  try {
    const [total, materias] = await Promise.all([
      Materia.countDocuments().lean(),
      Materia.find().lean(),
    ]);
    return res.status(200).json({
      total,
      materias,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      msg: "Error inesperado al obtener las materias",
    });
  }
};

const postMateria = async (req = request, res = response) => {
  const { materia } = req.body;

  try {
    const materiaFind = await Materia.findOne({ materia }).lean();

    if (materiaFind) {
      return res.status(400).json({
        msg: `La materia ${materia} ya existe`,
      });
    }

    const materiaM = new Materia({ materia });
    await materiaM.save();

    return res.status(200).json({
      materia: materiaM,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      msg: "Error inesperado al crear la materia",
    });
  }
};

const deleteMateria = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    await Materia.findByIdAndDelete(id).lean();

    return res.sendStatus(204);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      msg: "Error inesperado al eliminar la materia",
    });
  }
};

module.exports = {
  getMaterias,
  postMateria,
  deleteMateria,
};
