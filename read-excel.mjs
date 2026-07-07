import * as XLSX from 'xlsx';
import * as fs from 'fs';
XLSX.set_fs(fs);

const workbook = XLSX.readFile('data tushar.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log("Headers:");
console.log(data[0]);
console.log("\nFirst row of data:");
console.log(data[1]);
