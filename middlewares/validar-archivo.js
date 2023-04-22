const { response, request } = require("express");

const validarArchivoSubir = (req = request, res = response, next) => {
  if (!req.files || Object.keys(req.files).length === 0 || !req.files.archivo) {
    return res.status(400).json({
      msg: "No hay archivos que subir - validarArchivoSubir",
    });
  }

  next();
};

const validarTipoArchivo = (req = request, res = response, next) => {
  const { archivo } = req.files;
  const tipoArchivo = archivo.name.split(".").pop();
  const tipoValidos = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "tiff",
    "webp",
    "svg",
    "mp4",
    "avi",
    "mov",
    "webm",
    "flv",
    "wmv",
    "mpeg",
    "mkv",
    "mp3",
    "m4a",
    "ogg",
    "wav",
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "csv",
    "zip",
    "txt",
    "rtf",
    "log",
    "html",
    "css",
    "js",
    "json",
  ];

  if (!tipoValidos.includes(tipoArchivo)) {
    return res.status(400).json({
      msg: `El tipo de archivo ${tipoArchivo} no es permitido`,
    });
  }

  next();
};

module.exports = {
  validarArchivoSubir,
  validarTipoArchivo,
};
