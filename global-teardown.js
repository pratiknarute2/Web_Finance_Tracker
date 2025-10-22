const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

async function waitForFiles(dir, retries = 5, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
    if (files.length > 0) return true;
    console.log(`⏳ Waiting for report files... attempt ${i + 1}`);
    await new Promise(r => setTimeout(r, delay));
  }
  return false;
}

module.exports = async () => {
  try {
    console.log('🧩 Zipping report after all tests...');

    const htmlReportDir = path.join(process.cwd(), 'playwright-reports', 'html-report');

    const hasFiles = await waitForFiles(htmlReportDir, 10, 500);
    if (!hasFiles) {
      console.error('❌ Report folder is empty or not generated:', htmlReportDir);
      return;
    }

    const baseDir = path.dirname(htmlReportDir);
    const outputZip = path.join(baseDir, `Playwright_Full_Report_${Date.now()}.zip`);

    const output = fs.createWriteStream(outputZip);
    const archive = archiver('zip', { zlib: { level: 9 } });

    await new Promise((resolve, reject) => {
      output.on('close', () => {
        console.log(`✅ New Zipped report created: ${outputZip}`);
        console.log(`📦 Total size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
        resolve();
      });

      archive.on('warning', err => err.code === 'ENOENT' ? console.warn('⚠️', err) : reject(err));
      archive.on('error', err => reject(err));

      archive.pipe(output);
      archive.directory(htmlReportDir, 'html-report');

      ['report.json', 'report.xml'].forEach(file => {
        const filePath = path.join(baseDir, file);
        if (fs.existsSync(filePath)) archive.file(filePath, { name: file });
      });

      archive.finalize();
    });
  } catch (err) {
    console.error('❌ Error creating ZIP:', err.message);
  }
};
