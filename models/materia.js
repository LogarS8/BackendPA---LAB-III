const { Schema, model } = require("mongoose");

const MateriaSchema = Schema({
  materia: {
    type: String,
    required: [true, "La materia es obligatoria"],
    unique: true,
  },
});

module.exports = model("Materia", MateriaSchema);
