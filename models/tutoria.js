const { Schema, model } = require("mongoose");

const TutoriaSchema = Schema({
  nombre: {
    type: String,
    required: [true, "El nombre es obligatorio"],
  },
  materia: {
    type: Schema.Types.ObjectId,
    ref: "Materia",
    required: true,
  },
  tutor: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  cupo: {
    type: Number,
    min: [1, "El cupo mínimo es 1"],
    max: [20, "El cupo máximo es 20"],
    required: [true, "El cupo es obligatorio"],
  },
  descripcion: {
    type: String,
    required: [true, "La descripción es obligatoria"],
  },
  urls: [
    {
      public_id: {
        type: String,
      },
      url: {
        type: String,
        required: [true, "La URL es obligatoria"],
      },
      tipo: {
        type: String,
      },
    },
  ],
  alumnos: [
    {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
    },
  ],
});

module.exports = model("Tutoria", TutoriaSchema);
