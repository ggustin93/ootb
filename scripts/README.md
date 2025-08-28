# Scripts

This directory contains utility scripts for the OOTB project.

## Image Processing

- `analyze-image-failures.js` - Analyzes failed image processing and diagnoses root causes
- `smart-build.sh` - Intelligent build script that conditionally installs Poppler based on PDF detection  
- `check-pdf-needs.js` - Detects if PDF conversion is needed before installing Poppler

## Usage

### Analyze Image Failures
```bash
node scripts/analyze-image-failures.js
```
Automatically detects failed images (placeholders) and analyzes the root causes such as:
- Expired S3 URLs
- Unsupported file formats (.ico, .psd, .docx)
- Network connectivity issues

### Smart Build with Conditional Poppler Installation
```bash
bash scripts/smart-build.sh
```
Intelligently installs Poppler only when PDFs are detected in the NocoDB data, optimizing build times.
