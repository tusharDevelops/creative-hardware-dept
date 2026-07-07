const XLSX = require('xlsx');

const workbook = XLSX.readFile('data tushar.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log("First 10 rows:");
for (let i = 0; i < 10; i++) {
  console.log(`Row ${i}:`, data[i]);
}
