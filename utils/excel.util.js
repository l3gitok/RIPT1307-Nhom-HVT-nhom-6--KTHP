// utils/excel.util.js
const excel = require('exceljs');

exports.exportDataToExcel = async (data, filename) => {
  // TODO: Implement export data to excel logic
  const workbook = new excel.Workbook();
  const worksheet = workbook.addWorksheet('Data');

  // Add headers
  worksheet.columns = Object.keys(data[0]).map(key => ({ header: key, key: key }));

  // Add data rows
  data.forEach(item => {
    worksheet.addRow(item);
  });

  await workbook.xlsx.writeFile(filename);
  console.log(`File ${filename} has been created.`);
};
