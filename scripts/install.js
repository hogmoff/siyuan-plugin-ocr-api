const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const configPath = path.join(rootDir, 'install.path');
const packageZip = path.join(rootDir, 'package.zip');

if (!fs.existsSync(configPath)) {
    console.log('Skipping installation: install.path file not found.');
    console.log('Create a file named "install.path" in the root directory containing the target directory path to enable auto-installation.');
    process.exit(0);
}

const targetDir = fs.readFileSync(configPath, 'utf8').trim();

if (!targetDir) {
    console.error('Error: install.path is empty.');
    process.exit(1);
}

if (!fs.existsSync(targetDir)) {
    console.error(`Error: Target directory "${targetDir}" does not exist.`);
    process.exit(1);
}

console.log(`Unzipping package.zip to ${targetDir}...`);

// Use unzip command (available on macOS/Linux)
exec(`unzip -o "${packageZip}" -d "${targetDir}"`, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
    console.log('Installation complete.');
});
