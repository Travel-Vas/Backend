"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ScatteredWatermarkService {
    applyWatermarkToFile(inputPath_1) {
        return __awaiter(this, arguments, void 0, function* (inputPath, options = {}) {
            try {
                // Generate output path if not provided
                const outputPath = options.outputPath || this.generateOutputPath(inputPath);
                // Create a readable stream from the input file
                const readStream = fs_1.default.createReadStream(inputPath);
                // Initialize Sharp with the stream rather than loading the entire file into memory
                const image = (0, sharp_1.default)();
                // Pipe the file stream to Sharp
                readStream.pipe(image);
                // Get metadata without loading the entire image into memory
                const metadata = yield image.metadata();
                if (!metadata.width || !metadata.height) {
                    throw new Error('Unable to get image dimensions');
                }
                const { text, imageUrl, textOptions = {}, rows = 3, columns = 4, margin = 40, scale = 0.15, preserveAspectRatio = true, imageOptions = {} } = options;
                // Calculate grid positions for scattered watermarks
                const positions = this.calculateGridPositions(metadata.width, metadata.height, rows, columns, margin);
                // Create a new pipeline to process the image (disable auto-rotation)
                const pipeline = (0, sharp_1.default)(inputPath, { failOnError: false });
                let compositeOperations = [];
                if (text) {
                    // Calculate appropriate SVG dimensions based on image size
                    const svgWidth = Math.floor(metadata.width * scale);
                    const svgHeight = Math.floor(metadata.height * scale);
                    // Create watermarks one at a time to reduce memory usage
                    for (let i = 0; i < positions.length; i++) {
                        const watermark = yield this.createTextWatermark(text, Object.assign(Object.assign({ width: svgWidth, height: svgHeight, imageWidth: metadata.width, imageHeight: metadata.height, scale }, textOptions), { position: positions[i], margin }));
                        const watermarkMeta = yield (0, sharp_1.default)(watermark).metadata();
                        if (!watermarkMeta.width || !watermarkMeta.height) {
                            continue; // Skip invalid watermarks
                        }
                        compositeOperations.push({
                            input: watermark,
                            left: Math.floor(positions[i].x - (watermarkMeta.width / 2)),
                            top: Math.floor(positions[i].y - (watermarkMeta.height / 2)),
                            blend: 'over', // Using the correct Blend type
                            opacity: textOptions.opacity || 0.8
                        });
                        // Free memory
                        //watermark.length = 0; // Removed as this could cause issues with buffer usage
                    }
                }
                else if (imageUrl) {
                    const watermarkBuffer = yield this.fetchImageBuffer(imageUrl);
                    const watermarkImage = (0, sharp_1.default)(watermarkBuffer);
                    const watermarkMeta = yield watermarkImage.metadata();
                    if (!watermarkMeta.width || !watermarkMeta.height) {
                        throw new Error('Unable to get watermark dimensions');
                    }
                    const targetWidth = Math.floor(metadata.width * scale);
                    let targetHeight;
                    if (preserveAspectRatio) {
                        const aspect = watermarkMeta.height / watermarkMeta.width;
                        targetHeight = Math.floor(targetWidth * aspect);
                    }
                    else {
                        targetHeight = Math.floor(metadata.height * scale);
                    }
                    const resizedWatermark = yield watermarkImage
                        .resize(targetWidth, targetHeight, {
                        fit: preserveAspectRatio ? 'inside' : 'fill'
                    })
                        .toBuffer();
                    // Create composite operations for each position
                    for (const position of positions) {
                        compositeOperations.push({
                            input: resizedWatermark,
                            left: Math.floor(position.x - (targetWidth / 2)),
                            top: Math.floor(position.y - (targetHeight / 2)),
                            blend: 'over', // Using the correct Blend type
                            opacity: imageOptions.opacity || 1
                        });
                    }
                }
                else {
                    throw new Error('Either text or imageUrl must be provided');
                }
                // Apply all watermarks at once
                yield pipeline
                    .composite(compositeOperations)
                    .toFile(outputPath);
                // Free memory
                compositeOperations = [];
                return outputPath;
            }
            catch (error) {
                throw new Error(`Error applying watermark: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    generateOutputPath(inputPath) {
        const dir = path_1.default.dirname(inputPath);
        const ext = path_1.default.extname(inputPath);
        const baseName = path_1.default.basename(inputPath, ext);
        return path_1.default.join(dir, `${baseName}-watermarked${ext}`);
    }
    calculateGridPositions(imageWidth, imageHeight, rows, columns, margin) {
        const positions = [];
        const cellWidth = (imageWidth - 2 * margin) / (columns - 1);
        const cellHeight = (imageHeight - 2 * margin) / (rows - 1);
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                // Add some randomness to make it look more natural
                const jitterX = Math.random() * (cellWidth * 0.2) - (cellWidth * 0.1);
                const jitterY = Math.random() * (cellHeight * 0.2) - (cellHeight * 0.1);
                positions.push({
                    x: margin + (col * cellWidth) + jitterX,
                    y: margin + (row * cellHeight) + jitterY
                });
            }
        }
        return positions;
    }
    createTextWatermark(text, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { width, height, font = 'Arial', fontSize = Math.max(Math.floor(width * 0.3), 24), color = 'rgba(255,255,255,0.8)', opacity = 0.8, rotationAngle = -45, weight = 'normal', style = 'normal' } = options;
            // Create SVG with constrained dimensions
            const svg = `
            <svg width="${width}" height="${height}">
                <defs>
                    <style>
                        @font-face {
                            font-family: "${font}";
                            font-weight: ${weight};
                            font-style: ${style};
                        }
                    </style>
                </defs>
                <g transform="rotate(${rotationAngle}, ${width / 2}, ${height / 2})">
                    <text
                        x="50%"
                        y="50%"
                        font-family="${font}"
                        font-size="${fontSize}"
                        fill="${color}"
                        fill-opacity="${opacity}"
                        text-anchor="middle"
                        dominant-baseline="middle"
                        font-weight="${weight}"
                        font-style="${style}"
                    >
                        ${text}
                    </text>
                </g>
            </svg>
        `;
            return yield (0, sharp_1.default)(Buffer.from(svg))
                .resize(width, height, { fit: 'contain' })
                .toBuffer();
        });
    }
    fetchImageBuffer(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(url);
            return Buffer.from(yield response.arrayBuffer());
        });
    }
}
exports.default = new ScatteredWatermarkService();
