const fs = require('fs');
const path = require('path');

class FileCleanup {
  static cleanupTempDir() {
    const tempDir = path.join(__dirname, '../temp');
    
    if (!fs.existsSync(tempDir)) {
      return;
    }
    
    const files = fs.readdirSync(tempDir);
    
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stat = fs.statSync(filePath);
      
      // Delete files older than 1 hour
      if (stat.isFile() && Date.now() - stat.mtimeMs > 3600000) {
        fs.unlinkSync(filePath);
        console.log(`Deleted old temp file: ${filePath}`);
      }
    }
  }
  
  static cleanupFile(filePath) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

module.exports = FileCleanup;