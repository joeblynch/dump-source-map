const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const { SourceMapConsumer } = require('source-map');

if (process.argv.length < 3) {
  console.log('usage: node . [file path to source map] [output directory (default: output)]')
  return -1;
}

const filePath = process.argv[2];
const outputDir = process.argv[3] || 'output';
const sourceMapData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

SourceMapConsumer.with(sourceMapData, null, async consumer => {
  let fileCount = 0;

  // iterate through each original source file
  for (let i = 0, l = consumer.sources.length; i < l; i++) {
    const sourcePath = consumer.sources[i];

    if (sourcePath.includes('://')) {
      console.error(`skipping ${sourcePath}`);
      continue;
    }

    // parse the source path and generate output path
    const { dir, base } = path.parse(sourcePath);
    const sourceOutputDir = path.join(outputDir, dir);
    const sourceOutputPath = path.join(sourceOutputDir, base);
    
    // ensure directories exist for output path
    await mkdirp(sourceOutputDir);

    // write original code
    fs.writeFileSync(sourceOutputPath, consumer.sourceContentFor(sourcePath));
    fileCount++;
  }

  console.log(`extracted ${fileCount} source file(s)`);
});