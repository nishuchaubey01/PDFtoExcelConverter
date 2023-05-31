import React, { useRef } from "react";
import { getDocument } from "pdfjs-dist";
import * as XLSX from "xlsx";

const PdfToExcelConverter = () => {
  const fileInputRef = useRef();

  const convertToExcel = async () => {
    const file = fileInputRef.current.files[0];
    const fileReader = new FileReader();

    fileReader.onload = async () => {
      const buffer = new Uint8Array(fileReader.result);
      const pdf = await getDocument(buffer).promise;
      const pages = pdf.numPages;
      let excelData = [];

      for (let pageNumber = 1; pageNumber <= pages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join("\n");
        const rows = pageText.split("\n");

        // Add each row as an array of cells
        const pageData = rows.map((row) => row.split("\t"));
        excelData = excelData.concat(pageData);
      }

      // Create a workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(excelData);

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet 1");

      // Generate Excel file
      const excelFile = XLSX.write(workbook, {
        type: "binary",
        bookType: "xlsx",
      });
      const excelBuffer = new ArrayBuffer(excelFile.length);
      const view = new Uint8Array(excelBuffer);

      for (let i = 0; i < excelFile.length; i++) {
        view[i] = excelFile.charCodeAt(i) & 0xff;
      }

      // Download the Excel file
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "converted.xlsx";
      link.click();
    };

    fileReader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <input type="file" ref={fileInputRef} />
      <button onClick={convertToExcel}>Convert to Excel</button>
    </div>
  );
};

export default PdfToExcelConverter;
