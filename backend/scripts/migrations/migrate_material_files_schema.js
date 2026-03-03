const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Material = require('../../models/Material');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const apply = process.argv.includes('--apply');

function normalizeLegacyFile(material) {
  if (!material.fileName && !material.filePath) {
    return null;
  }

  const isHttp = String(material.filePath || '').startsWith('http');

  return {
    fileName: material.fileName || 'legacy-file',
    provider: isHttp ? 'r2' : 'local',
    objectKey: '',
    publicUrl: isHttp ? material.filePath : '',
    filePath: isHttp ? '' : (material.filePath || ''),
    fileType: material.fileType || '',
    contentType: '',
    fileSize: material.fileSize || 0
  };
}

async function run() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI табылмады');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const materials = await Material.find({});
  const report = {
    totalMaterials: materials.length,
    wouldBackfillLegacy: 0,
    wouldNormalizeFiles: 0,
    backfilledLegacy: 0,
    normalizedFiles: 0
  };

  for (const material of materials) {
    let changed = false;
    let touchedLegacyBackfill = false;
    let touchedNormalization = false;

    if (!Array.isArray(material.files) || material.files.length === 0) {
      const legacyFile = normalizeLegacyFile(material);
      if (legacyFile) {
        report.wouldBackfillLegacy += 1;
        material.files = [legacyFile];
        changed = true;
        touchedLegacyBackfill = true;
      }
    } else {
      const normalized = material.files.map((file) => ({
        fileName: file.fileName || material.fileName || 'file',
        provider: file.provider || (file.objectKey ? 'r2' : (String(file.filePath || '').startsWith('http') ? 'r2' : 'local')),
        objectKey: file.objectKey || '',
        publicUrl: file.publicUrl || (String(file.filePath || '').startsWith('http') ? file.filePath : ''),
        filePath: file.filePath || '',
        fileType: file.fileType || '',
        contentType: file.contentType || '',
        fileSize: file.fileSize || 0
      }));

      const before = JSON.stringify(material.files);
      const after = JSON.stringify(normalized);
      if (before !== after) {
        report.wouldNormalizeFiles += 1;
        material.files = normalized;
        changed = true;
        touchedNormalization = true;
      }
    }

    if (changed && apply) {
      await material.save();
      if (touchedLegacyBackfill) {
        report.backfilledLegacy += 1;
      }
      if (touchedNormalization) {
        report.normalizedFiles += 1;
      }
    }
  }

  console.log('=== migrate_material_files_schema ===');
  console.log('mode:', apply ? 'APPLY' : 'DRY-RUN');
  console.log(JSON.stringify(report, null, 2));

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('Migration error:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
