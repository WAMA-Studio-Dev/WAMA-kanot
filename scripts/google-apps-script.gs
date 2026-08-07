/**
 * Web App de Google Apps Script que recibe los envíos del formulario de
 * ByKanot (app/api/contact/route.ts, vía GOOGLE_SHEETS_WEBHOOK_URL) y los
 * vuelca como fila nueva en la hoja de cálculo activa.
 *
 * Despliegue: Extensiones > Apps Script > pegar este código > Implementar >
 * Nueva implementación > Aplicación web (ejecutar como tú, acceso "Cualquier
 * usuario"). La URL resultante es el valor de GOOGLE_SHEETS_WEBHOOK_URL.
 */
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const body = JSON.parse(e.postData.contents);

  sheet.appendRow([
    body.fecha || "",
    body.nombre || "",
    body.email || "",
    body.telefono || "",
    body.tipo || "",
    body.instagram || "",
    body.mensaje || "",
  ]);

  sheet.autoResizeColumns(1, 7);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
