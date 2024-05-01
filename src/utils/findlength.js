const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
const getpdfsize = async (pdfUrl) => {
  let numPages;
  pdfjsLib.getDocument(pdfUrl).promise.then(function (doc) {
    numPages = doc.numPages;
    console.log("# Document Loaded");
  });
  return numPages;
};

module.exports = getpdfsize;
