import crypto from "crypto";
import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url"; // <--- ADD THIS

// ES Module bulletproof path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Now we tell it exactly where the assets folder is relative to THIS specific file (services folder)
const ASSETS_DIR = path.join(__dirname, "..", "assets"); 

// Generates: IITI-RND-2026-A3F9B2
export function generateLetterId() {
  const year = new Date().getFullYear();
  const uniqueString = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `IITI-RND-${year}-${uniqueString}`;
}

export async function generateVacancyPdfBase64(context, letterId) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData.toString('base64'));
      });

      // =========================================================
      // 1. HEADER, LOGO, & ADDRESS
      // =========================================================
      
      // USE THE NEW BULLETPROOF PATH
      doc.image(path.join(ASSETS_DIR, 'iiti-logo.png'), doc.page.width / 2 - 40, 40, { width: 80 });
      
      doc.moveDown(6); 
      doc.fillColor('#000000'); 
      doc.fontSize(18).font('Helvetica-Bold').text("INDIAN INSTITUTE OF TECHNOLOGY INDORE", { align: "center" });
      doc.fontSize(12).font('Helvetica').text("Research & Development Department", { align: "center" });
      doc.fontSize(10).font('Helvetica').text("Khandwa Road, Simrol, Indore 453552, INDIA", { align: "center" });
      doc.moveDown(2);

      // =========================================================
      // 2. METADATA (Date & Letter ID)
      // =========================================================
      doc.fontSize(10).font('Helvetica').text(`Date: ${new Date().toLocaleDateString('en-IN')}`, { align: "right" });
      doc.text(`Letter ID: ${letterId}`, { align: "right" });
      doc.moveDown(2);

      // =========================================================
      // 3. BODY TEXT
      // =========================================================
      doc.fontSize(14).font('Helvetica-Bold').text("OFFICIAL RECRUITMENT VACANCY APPROVAL", { align: "center", underline: true });
      doc.moveDown(2);

      doc.fontSize(12).font('Helvetica').text(`This is to officially certify that the Recruitment Vacancy for the project titled "${context.project.title}" has been approved by the Dean of R&D.`, { align: "justify", lineGap: 4 });
      doc.moveDown(2);
      
      doc.font('Helvetica-Bold').text("Project PI: ", { continued: true }).font('Helvetica').text(context.project.userEmail);
      doc.moveDown(0.5);
      
      doc.font('Helvetica-Bold').text("HOD Email: ", { continued: true }).font('Helvetica').text(context.project.hodEmail);
      doc.moveDown(0.5);
      
      doc.font('Helvetica-Bold').text("Position: ", { continued: true }).font('Helvetica').text(context.form.position);
      doc.moveDown(0.5);
      
      doc.font('Helvetica-Bold').text("Number of Vacancies: ", { continued: true }).font('Helvetica').text(context.form.count.toString());
      doc.moveDown(0.5);
      
      doc.font('Helvetica-Bold').text("Basic Salary: ", { continued: true }).font('Helvetica').text(`₹${context.form.basicSalary.toLocaleString('en-IN')}`);
      doc.moveDown(0.5);
      
      doc.font('Helvetica-Bold').text("HRA: ", { continued: true }).font('Helvetica').text(`${context.form.hraPercent}%`);
      doc.moveDown(4);

      // =========================================================
      // 4. SIGNATURE & STAMP BLOCK
      // =========================================================
      
      const signatureX = doc.page.width - 250; 
      const currentY = doc.y;

      // USE THE NEW BULLETPROOF PATH
      doc.image(path.join(ASSETS_DIR, 'dean-sign.png'), signatureX + 60, currentY, { width: 100 });
      
      doc.moveDown(3.5);
      doc.fontSize(12).font('Helvetica-Bold').text("_________________________", { align: "right" });
      doc.font('Helvetica').text("Dean, Research & Development", { align: "right" });
      doc.text("IIT Indore", { align: "right" });

      const stampY = doc.y + 10;
      // USE THE NEW BULLETPROOF PATH
      doc.image(path.join(ASSETS_DIR, 'rnd-stamp.png'), signatureX + 70, stampY, { width: 80 });

      doc.end();
    } catch (error) {
      console.error("PDF GENERATION ERROR: ", error); // This will print in your Render logs!
      reject(error);
    }
  });
}