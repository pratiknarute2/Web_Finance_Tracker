const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

module.exports = async () => {
  try {
    console.log('🧩 Zipping report after all tests...');

    // ===============================
    // Possible report folders
    // ===============================
    const possiblePaths = [
      path.join(__dirname, 'playwright-reports', 'html-report'),    // local default
      path.join(__dirname, 'playwright-report'),                    // fallback (Jenkins default)
      path.join(process.cwd(), 'playwright-reports', 'html-report'), // workspace fallback
    ];

    // Debug: print which paths exist
    console.log('Checking possible paths for report folder:');
    possiblePaths.forEach(p => console.log('→', p, fs.existsSync(p)));

    // Find the first existing report folder
    const htmlReportDir = possiblePaths.find(p => fs.existsSync(p));
    if (!htmlReportDir) {
      console.error('❌ HTML report folder not found in any known location.');
      return;
    }

    const baseDir = path.dirname(htmlReportDir);
    const outputZip = path.join(baseDir, `Playwright_Full_Report_${Date.now()}.zip`);

    // Delete old ZIP if exists (optional)
    // if (fs.existsSync(outputZip)) {
    //   fs.unlinkSync(outputZip);
    //   console.log('🧹 Old ZIP deleted');
    // }

    // ===============================
    // Create ZIP
    // ===============================
    const output = fs.createWriteStream(outputZip);
    const archive = archiver('zip', { zlib: { level: 9 } });

    await new Promise((resolve, reject) => {
      output.on('close', () => {
        console.log(`✅ New Zipped report created: ${outputZip}`);
        console.log(`📦 Total size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
        resolve();
      });

      archive.on('warning', err => {
        if (err.code === 'ENOENT') console.warn('⚠️', err);
        else reject(err);
      });

      archive.on('error', err => reject(err));

      archive.pipe(output);

      // Add HTML report folder
      archive.directory(htmlReportDir, 'html-report');

      // Add optional JSON & XML reports if present
      ['report.json', 'report.xml'].forEach(file => {
        const filePath = path.join(baseDir, file);
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: file });
          console.log(`📄 Added file: ${file}`);
        }
      });

      archive.finalize();
    });
  } catch (err) {
    console.error('❌ Error creating ZIP:', err.message);
  }
};
