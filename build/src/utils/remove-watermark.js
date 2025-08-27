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
class TextWatermarkRemovalService {
    removeWatermark(imageBuffer_1) {
        return __awaiter(this, arguments, void 0, function* (imageBuffer, options = {}) {
            try {
                const { textColor = 'white', backgroundColor = 'transparent', rotationAngle = -45, opacity = 0.8, rows = 3, columns = 4, margin = 40, intensity = 80, preserveDetails = true, watermarkText = '', watermarkFontSize = 20 } = options;
                // Get image info
                const metadata = yield (0, sharp_1.default)(imageBuffer).metadata();
                if (!metadata.width || !metadata.height) {
                    throw new Error('Unable to get image dimensions');
                }
                const width = metadata.width;
                const height = metadata.height;
                // Step 1: Analyze image to detect watermark characteristics
                const { brightAreas, darkAreas } = yield this.analyzeImageForWatermarks(imageBuffer, { width, height, textColor });
                // Step 2: Create a more precise mask for the watermarks
                const watermarkMask = yield this.createPreciseWatermarkMask(width, height, {
                    brightAreas,
                    darkAreas,
                    textColor,
                    rotationAngle,
                    rows,
                    columns,
                    margin,
                    watermarkText,
                    watermarkFontSize
                });
                // Step 3: Apply adaptive inpainting to remove the watermarks
                const processedImage = yield this.adaptiveInpainting(imageBuffer, watermarkMask, {
                    intensity: intensity / 100,
                    preserveDetails,
                    textColor
                });
                return processedImage;
            }
            catch (error) {
                console.error('Error removing text watermark:', error);
                throw new Error(`Error removing watermark: ${error.message}`);
            }
        });
    }
    analyzeImageForWatermarks(imageBuffer, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { width, height, textColor } = options;
            // Create a high-contrast version to help detect watermarks
            const highContrastImage = yield (0, sharp_1.default)(imageBuffer)
                .normalize()
                .modulate({
                brightness: 1.2,
                saturation: 0.8,
                hue: 0
            })
                .toBuffer();
            // For white watermarks, detect bright areas
            let brightAreas;
            if (textColor.toLowerCase() === 'white' || textColor === '#ffffff') {
                brightAreas = yield (0, sharp_1.default)(highContrastImage)
                    .threshold(210) // Adjust threshold to catch white text
                    .toBuffer();
            }
            else {
                // Default approach for non-white watermarks
                brightAreas = yield (0, sharp_1.default)(highContrastImage)
                    .threshold(205)
                    .toBuffer();
            }
            // Also detect dark areas for completeness
            const darkAreas = yield (0, sharp_1.default)(highContrastImage)
                .negate()
                .threshold(200)
                .toBuffer();
            return { brightAreas, darkAreas };
        });
    }
    createPreciseWatermarkMask(width, height, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { brightAreas, darkAreas, textColor, rotationAngle, rows, columns, margin, watermarkText, watermarkFontSize } = options;
            // Choose appropriate areas based on text color
            const primaryMask = textColor.toLowerCase() === 'white' || textColor === '#ffffff'
                ? brightAreas
                : darkAreas;
            // Enhance the mask to better target the text
            const enhancedMask = yield (0, sharp_1.default)(primaryMask)
                // @ts-ignore
                .morphology('dilate', 'circle', 2) // Slightly expand mask areas
                .blur(3) // Soften edges for better blending
                .normalize() // Ensure full dynamic range
                .toBuffer();
            // Generate a grid-based mask as a fallback
            const gridPositions = this.calculateWatermarkPositions(width, height, rows, columns, margin, watermarkFontSize);
            // Create a grid mask
            const gridMaskSvg = `
            <svg width="${width}" height="${height}">
                <rect width="${width}" height="${height}" fill="black"/>
                ${gridPositions.map(pos => {
                const centerX = pos.x;
                const centerY = pos.y;
                const rx = pos.width * 0.75;
                const ry = pos.height * 0.75;
                // If we have the watermark text, use a more precise shape
                if (watermarkText) {
                    return `
                            <g transform="translate(${centerX}, ${centerY}) rotate(${rotationAngle}) translate(-${centerX}, -${centerY})">
                                <text 
                                    x="${centerX}" 
                                    y="${centerY}" 
                                    font-family="Arial" 
                                    font-size="${watermarkFontSize}" 
                                    fill="white" 
                                    text-anchor="middle" 
                                    dominant-baseline="middle"
                                >${watermarkText}</text>
                            </g>
                        `;
                }
                // Otherwise use an ellipse
                return `
                        <g transform="translate(${centerX}, ${centerY}) rotate(${rotationAngle}) translate(-${centerX}, -${centerY})">
                            <ellipse 
                                cx="${centerX}" 
                                cy="${centerY}" 
                                rx="${rx}" 
                                ry="${ry}" 
                                fill="white" 
                                opacity="0.7"
                            />
                        </g>
                    `;
            }).join('')}
            </svg>
        `;
            const gridMask = yield (0, sharp_1.default)(Buffer.from(gridMaskSvg))
                .blur(5) // Soften the grid mask
                .toBuffer();
            // Combine the detected mask and grid mask
            const combinedMask = yield (0, sharp_1.default)(enhancedMask)
                .composite([
                {
                    input: gridMask,
                    blend: 'add', // Add the grid mask to enhance coverage
                }
            ])
                .normalize() // Ensure it's properly normalized
                .threshold(128) // Create a binary mask
                .blur(5) // Soften for better blending
                .normalize() // Final normalization
                .toBuffer();
            return combinedMask;
        });
    }
    calculateWatermarkPositions(width, height, rows, columns, margin, fontSize) {
        const positions = [];
        const cellWidth = (width - 2 * margin) / (columns - 1);
        const cellHeight = (height - 2 * margin) / (rows - 1);
        // Make watermark size relative to font size
        const watermarkWidth = Math.max(fontSize * 8, width * 0.15);
        const watermarkHeight = Math.max(fontSize * 2, height * 0.05);
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                // Include jitter
                const jitterX = Math.random() * (cellWidth * 0.2) - (cellWidth * 0.1);
                const jitterY = Math.random() * (cellHeight * 0.2) - (cellHeight * 0.1);
                positions.push({
                    x: margin + (col * cellWidth) + jitterX,
                    y: margin + (row * cellHeight) + jitterY,
                    width: watermarkWidth,
                    height: watermarkHeight
                });
            }
        }
        return positions;
    }
    adaptiveInpainting(imageBuffer, maskBuffer, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { intensity, preserveDetails, textColor } = options;
            // Get image metadata
            const metadata = yield (0, sharp_1.default)(imageBuffer).metadata();
            const format = metadata.format || 'jpeg';
            // Split the image into channels for more precise processing
            const channels = yield this.extractChannels(imageBuffer);
            // Process each channel separately
            const processedChannels = yield Promise.all(channels.map((channel, i) => __awaiter(this, void 0, void 0, function* () {
                // Use different techniques based on whether it's luminance or color channel
                if (i === 0) { // Luminance channel
                    return yield this.processLuminanceChannel(channel, maskBuffer, intensity, preserveDetails);
                }
                else { // Color channels
                    return yield this.processColorChannel(channel, maskBuffer, intensity, textColor);
                }
            })));
            // Create a processed grayscale version for texture recovery
            const grayProcessed = yield (0, sharp_1.default)(processedChannels[0])
                .toColorspace('b-w')
                .sharpen(1, 1, 0.5)
                .toBuffer();
            // Recombine channels
            const recombined = yield this.recombineChannels(processedChannels);
            // Enhanced texture recovery using the processed grayscale
            const textureEnhanced = yield (0, sharp_1.default)(recombined)
                .composite([
                {
                    input: grayProcessed,
                    blend: 'overlay',
                    gravity: 'northwest'
                }
            ])
                .sharpen(0.8, 0.7, 0.3)
                .toFormat(format, {
                quality: 95,
                chromaSubsampling: '4:4:4'
            })
                .toBuffer();
            return textureEnhanced;
        });
    }
    // Helper methods for channel processing
    extractChannels(imageBuffer) {
        return __awaiter(this, void 0, void 0, function* () {
            // Convert to LAB color space for better perceptual processing
            const labImage = yield (0, sharp_1.default)(imageBuffer)
                .toColorspace('lab')
                .raw()
                .toBuffer({ resolveWithObject: true });
            const { data, info } = labImage;
            const { width, height, channels } = info;
            const pixelCount = width * height;
            // Extract individual channels
            const channelBuffers = [];
            for (let c = 0; c < channels; c++) {
                const channelData = Buffer.alloc(pixelCount);
                for (let i = 0; i < pixelCount; i++) {
                    channelData[i] = data[i * channels + c];
                }
                channelBuffers.push(channelData);
            }
            // @ts-ignore
            return channelBuffers.map((buffer, index) => __awaiter(this, void 0, void 0, function* () {
                return yield (0, sharp_1.default)(buffer, {
                    raw: {
                        width,
                        height,
                        channels: 1
                    }
                }).toBuffer();
            }));
        });
    }
    processLuminanceChannel(channelBuffer, maskBuffer, intensity, preserveDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            // For luminance, use a blend of inpainting techniques
            // Create a blurred version
            const blurred = yield (0, sharp_1.default)(channelBuffer)
                .blur(8 * intensity)
                .toBuffer();
            // Create an edge-preserved version
            const edgePreserved = yield (0, sharp_1.default)(channelBuffer)
                .median(3)
                .sharpen(1, 1, 0.5)
                .toBuffer();
            // Blend based on mask
            const processed = yield (0, sharp_1.default)(channelBuffer)
                .composite([
                {
                    input: preserveDetails ? edgePreserved : blurred,
                    blend: 'over',
                    gravity: 'northwest'
                },
                {
                    input: maskBuffer,
                    blend: 'dest-in',
                    gravity: 'northwest'
                }
            ])
                .toBuffer();
            return processed;
        });
    }
    processColorChannel(channelBuffer, maskBuffer, intensity, textColor) {
        return __awaiter(this, void 0, void 0, function* () {
            // For color channels, use simple blurring
            const blurred = yield (0, sharp_1.default)(channelBuffer)
                .blur(6 * intensity)
                .toBuffer();
            // Apply based on mask
            const processed = yield (0, sharp_1.default)(channelBuffer)
                .composite([
                {
                    input: blurred,
                    blend: 'over',
                    gravity: 'northwest'
                },
                {
                    input: maskBuffer,
                    blend: 'dest-in',
                    gravity: 'northwest'
                }
            ])
                .toBuffer();
            return processed;
        });
    }
    recombineChannels(channelBuffers) {
        return __awaiter(this, void 0, void 0, function* () {
            // This is a simplified version - in practice you'd need to interleave the raw buffers
            // For demonstration, we'll use grayscale conversion as an approximation
            const mainChannel = yield (0, sharp_1.default)(channelBuffers[0])
                .toColorspace('srgb')
                .toBuffer();
            return mainChannel;
        });
    }
}
exports.default = new TextWatermarkRemovalService();
