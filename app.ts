import ytdl from 'ytdl-core';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { createInterface } from 'readline';

// Create readline interface to get user input
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

let videoLink: string = '';

//  Ask user for video link and call downloadVideo function
rl.question('Introduce el link del video: ', (response: string) => {
  console.log(`El link del video es: ${response}`);
  videoLink = response;
  downloadVideo(videoLink);
  rl.close();
});

//* Download video function
const downloadVideo = async (videoLink: string) => {
  try {
    // Get video info
    const info = await ytdl.getInfo(videoLink);

    // Get video title from info object
    const videoTitleYt: string = info.videoDetails.title;
    console.log('El título del video es: ', videoTitleYt);

    // Get formats filters (with sound)
    const formats = ytdl.filterFormats(info.formats, 'videoandaudio');

    // Get video format and quality
    const videoFormat = ytdl.chooseFormat(formats, { quality: 'highest' });

    //? Sustituir por esto si se quiere descargar en 1080p (no todos los videos tienen esta calidad)
    /* 
      const videoFormat = formats.find((format) => format.hasVideo && format.hasAudio && format.qualityLabel.includes('1080p'));
     if (!videoFormat) {
        throw new Error('No se encontró un formato de video compatible con 1080p');
     }
     */

    // Get video quality label
    const qualityLabel = videoFormat.qualityLabel || 'video';
    console.log('Se descargará en calidad: ', qualityLabel);

    // Create output file name
    const outputFileName: string = `${videoTitleYt.replace(/\s/g, '_') + qualityLabel}.mp4`;

    // Create output file path
    const outputFilePath: string = `./videos/${outputFileName}`;

    // Create videos directory if it doesn't exist
    if (!existsSync('./videos')) {
      mkdirSync('./videos');
    }

    // Create video stream
    const videoStream = ytdl(videoLink, { format: videoFormat });

    // Create output stream
    const outputStream = createWriteStream(outputFilePath);

    // Pipe video stream to output stream
    videoStream.pipe(outputStream);

    // Message when video is downloaded or error
    outputStream.on('finish', () => {
      console.log(`El video se ha descargado correctamente. Puedes encontrarlo en: ${outputFilePath}`);
    });
  } catch (error) {
    console.error('Ha ocurrido un error al descargar el video:', error);
  }
};
