import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Define the valid blend modes from Sharp
type Blend = 'over' | 'atop' | 'xor' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion';

interface TextOptions {
    font?: string;
    fontSize?: number;
    color?: string;
    opacity?: number;
    rotationAngle?: number;
    weight?: string;
    style?: string;
}

interface ImageOptions {
    opacity?: number;
}

interface WatermarkOptions {
    text?: string;
    imageUrl?: string;
    imageOptions?: ImageOptions;
    textOptions?: TextOptions;
    rows?: number;
    columns?: number;
    margin?: number;
    scale?: number;
    preserveAspectRatio?: boolean;
    outputPath?: string; // Optional custom output path
}

class ScatteredWatermarkService {
    async applyWatermarkToFile(
        inputPath: string,
        options: WatermarkOptions = {}
    ): Promise<string> {
        try {
            // Generate output path if not provided
            const outputPath = options.outputPath || this.generateOutputPath(inputPath);

            // Create a readable stream from the input file
            const readStream = fs.createReadStream(inputPath);

            // Initialize Sharp with the stream rather than loading the entire file into memory
            const image = sharp();

            // Pipe the file stream to Sharp
            readStream.pipe(image);

            // Get metadata without loading the entire image into memory
            const metadata = await image.metadata();

            if (!metadata.width || !metadata.height) {
                throw new Error('Unable to get image dimensions');
            }

            const {
                text,
                imageUrl,
                textOptions = {},
                rows = 3,
                columns = 4,
                margin = 40,
                scale = 0.15,
                preserveAspectRatio = true,
                imageOptions = {}
            } = options;

            // Calculate grid positions for scattered watermarks
            const positions = this.calculateGridPositions(
                metadata.width,
                metadata.height,
                rows,
                columns,
                margin
            );

            // Create a new pipeline to process the image (disable auto-rotation)
            const pipeline = sharp(inputPath, { failOnError: false });

            let compositeOperations: Array<{
                input: Buffer;
                left: number;
                top: number;
                blend: Blend;
                opacity: number;
            }> = [];

            if (text) {
                // Calculate appropriate SVG dimensions based on image size
                const svgWidth = Math.floor(metadata.width * scale);
                const svgHeight = Math.floor(metadata.height * scale);

                // Create watermarks one at a time to reduce memory usage
                for (let i = 0; i < positions.length; i++) {
                    const watermark = await this.createTextWatermark(text, {
                        width: svgWidth,
                        height: svgHeight,
                        imageWidth: metadata.width,
                        imageHeight: metadata.height,
                        scale,
                        ...textOptions,
                        position: positions[i],
                        margin
                    });

                    const watermarkMeta = await sharp(watermark).metadata();

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
            } else if (imageUrl) {
                const watermarkBuffer = await this.fetchImageBuffer(imageUrl);
                const watermarkImage = sharp(watermarkBuffer);
                const watermarkMeta = await watermarkImage.metadata();

                if (!watermarkMeta.width || !watermarkMeta.height) {
                    throw new Error('Unable to get watermark dimensions');
                }

                const targetWidth = Math.floor(metadata.width * scale);
                let targetHeight;

                if (preserveAspectRatio) {
                    const aspect = watermarkMeta.height / watermarkMeta.width;
                    targetHeight = Math.floor(targetWidth * aspect);
                } else {
                    targetHeight = Math.floor(metadata.height * scale);
                }

                const resizedWatermark = await watermarkImage
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
            } else {
                throw new Error('Either text or imageUrl must be provided');
            }

            // Apply all watermarks at once
            await pipeline
                .composite(compositeOperations)
                .toFile(outputPath);

            // Free memory
            compositeOperations = [];

            return outputPath;
        } catch (error) {
            throw new Error(`Error applying watermark: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private generateOutputPath(inputPath: string): string {
        const dir = path.dirname(inputPath);
        const ext = path.extname(inputPath);
        const baseName = path.basename(inputPath, ext);
        return path.join(dir, `${baseName}-watermarked${ext}`);
    }

    private calculateGridPositions(
        imageWidth: number,
        imageHeight: number,
        rows: number,
        columns: number,
        margin: number
    ): Array<{ x: number; y: number }> {
        const positions: Array<{ x: number; y: number }> = [];

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

    private async createTextWatermark(
        text: string,
        options: TextOptions & {
            width: number;
            height: number;
            imageWidth: number;
            imageHeight: number;
            scale: number;
            position: { x: number; y: number };
            margin: number;
        }
    ): Promise<Buffer> {
        const {
            width,
            height,
            font = 'Arial',
            fontSize = Math.max(Math.floor(width * 0.3), 24),
            color = 'rgba(255,255,255,0.8)',
            opacity = 0.8,
            rotationAngle = -45,
            weight = 'normal',
            style = 'normal'
        } = options;

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
                <g transform="rotate(${rotationAngle}, ${width/2}, ${height/2})">
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

        return await sharp(Buffer.from(svg))
            .resize(width, height, { fit: 'contain' })
            .toBuffer()
    }

    private async fetchImageBuffer(url: string): Promise<Buffer> {
        const response = await fetch(url);
        return Buffer.from(await response.arrayBuffer());
    }
}

export default new ScatteredWatermarkService();