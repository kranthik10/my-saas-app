const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class OpenAIService {
  constructor() {
    this.client = openai;
  }

  async transcribeAudio(filePath) {
    try {
      const response = await this.client.audio.transcriptions.create({
        file: this.getFileStream(filePath),
        model: "whisper-1",
      });
      return response;
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }

  async translateAudio(filePath) {
    try {
      const response = await this.client.audio.translations.create({
        file: this.getFileStream(filePath),
        model: "whisper-1",
      });
      return response;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  // Helper method to create file stream 
  getFileStream(filePath) {
    const fs = require('fs');
    return fs.createReadStream(filePath);
  }

  // Helper method to download file from URL and return path
  async downloadFileFromUrl(url) {
    const fs = require('fs');
    const path = require('path');
    const { v4: uuidv4 } = require('uuid');
    
    // Dynamically import node-fetch
    const fetch = await import('node-fetch');
    const nodeFetch = fetch.default || fetch;
    
    try {
      const response = await nodeFetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }
      
      // Create a temporary file
      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const fileName = `${uuidv4()}_${path.basename(new URL(url).pathname)}`;
      const filePath = path.join(tempDir, fileName);
      
      const buffer = await response.buffer();
      fs.writeFileSync(filePath, buffer);
      
      return filePath;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  // Calculate cost based on OpenAI pricing
  calculateCost(seconds) {
    // OpenAI charges $0.006 per minute for Whisper API
    const minutes = seconds / 60;
    return minutes * 0.006;
  }
}

module.exports = new OpenAIService();