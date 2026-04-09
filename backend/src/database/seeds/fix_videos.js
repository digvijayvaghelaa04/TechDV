const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');

// Helper to escape weird characters in filename natively
const getCleanName = (name) => {
    let clean = name.replace('.mp4', '').replace(/[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\uplus|\u2600-\u26ff|\u2700-\u27bf/g, ''); // Removes emojis
    clean = clean.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-()]/g, '');
    return clean + '.mp4';
};

const dir = 'C:\\Users\\dv735\\Downloads\\TechDV\\cd\\cource-data\\java-script\\videos';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.mp4'));

console.log('Fixing MP4 moov atoms and paths for fast-streaming...');

files.forEach((file) => {
    const originalPath = path.join(dir, file);
    const cleanFileName = getCleanName(file);
    const processedPath = path.join(dir, 'fast_' + cleanFileName);

    // If it's already processed, skip
    if (file.startsWith('fast_')) return;

    console.log(`Processing: ${file}`);
    try {
        // Run ffmpeg to move moov atom to front (faststart) without re-encoding video/audio
        execSync(`"${ffmpeg}" -y -i "${originalPath}" -c copy -movflags +faststart "${processedPath}"`, { stdio: 'ignore' });

        // Remove original and rename the processed one to the clean final format
        fs.unlinkSync(originalPath);
        fs.renameSync(processedPath, path.join(dir, cleanFileName));
        console.log(`Success -> ${cleanFileName}`);
    } catch (err) {
        console.error(`Failed on ${file}`, err);
    }
});

console.log('Finished stream optimization!');
