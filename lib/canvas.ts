import { FrameThemeId, FRAME_THEMES } from './builderClasses';

export interface PhotoAdjustments {
  zoom: number; // 0.8 to 2.0 (default 1.0)
  offsetX: number; // -100 to 100 (percentage offset)
  offsetY: number; // -100 to 100
}

export interface FrameData {
  photo: string;
  name: string;
  stack: string;
  teamName?: string;
  themeId?: FrameThemeId;
  adjustments?: PhotoAdjustments;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Draws image with cover cropping + user zoom & pan offset
 */
function drawAdjustedCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  adjustments?: PhotoAdjustments
) {
  const zoom = adjustments?.zoom ?? 1.0;
  const offX = (adjustments?.offsetX ?? 0) / 100; // -1 to 1
  const offY = (adjustments?.offsetY ?? 0) / 100;

  // Base cover scale
  const baseScale = Math.max(w / img.width, h / img.height);
  const scale = baseScale * zoom;

  const sw = w / scale;
  const sh = h / scale;

  // Center source rectangle + user pan offset
  let sx = (img.width - sw) / 2 + (offX * (img.width - sw) / 2);
  let sy = (img.height - sh) / 2 + (offY * (img.height - sh) / 2);

  // Clamp source rectangle within image bounds
  sx = Math.max(0, Math.min(img.width - sw, sx));
  sy = Math.max(0, Math.min(img.height - sh, sy));

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

/**
 * Draws rounded rectangle path
 */
function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

/**
 * Draws Goan & Indian botanical / ornamental filigree corners
 */
function drawGoanCornerOrnaments(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  accent: string,
  style: string = 'lotus'
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;

  const size = 60;
  const corners = [
    { cx: x + 25, cy: y + 25, rot: 0 },
    { cx: x + w - 25, cy: y + 25, rot: Math.PI / 2 },
    { cx: x + w - 25, cy: y + h - 25, rot: Math.PI },
    { cx: x + 25, cy: y + h - 25, rot: -Math.PI / 2 },
  ];

  corners.forEach(({ cx, cy, rot }) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    if (style === 'circuits') {
      // Hacker circuit node corner
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(40, 0);
      ctx.lineTo(40, 15);
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 40);
      ctx.lineTo(15, 40);
      ctx.stroke();

      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(40, 15, 4, 0, Math.PI * 2);
      ctx.arc(15, 40, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (style === 'palms') {
      // Tropical Palm & Star motif
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI / 2);
      ctx.stroke();

      // Star dot
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(22, 22, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Traditional Goan Lotus / Floral Arch
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, size / 3, 0, Math.PI / 2);
      ctx.stroke();

      // Petal curve
      ctx.beginPath();
      ctx.moveTo(10, 25);
      ctx.quadraticCurveTo(25, 25, 25, 10);
      ctx.stroke();

      // Accent dot
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(20, 20, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });

  ctx.restore();
}

/**
 * Draw Ornate Dual Gold Frame Border with Filigree
 */
function drawOrnateBorder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  primaryColor: string,
  accentColor: string
) {
  ctx.save();

  // Outer Gold Line
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 4;
  roundedRect(ctx, x, y, w, h, 28);
  ctx.stroke();

  // Inner Subtle Line
  ctx.strokeStyle = "rgba(243, 192, 72, 0.4)";
  ctx.lineWidth = 1.5;
  roundedRect(ctx, x + 8, y + 8, w - 16, h - 16, 22);
  ctx.stroke();

  // Corner Diamond Accents
  ctx.fillStyle = accentColor;
  const dSize = 6;
  const dPoints = [
    { px: x + 18, py: y + 18 },
    { px: x + w - 18, py: y + 18 },
    { px: x + w - 18, py: y + h - 18 },
    { px: x + 18, py: y + h - 18 },
  ];

  dPoints.forEach(({ px, py }) => {
    ctx.beginPath();
    ctx.moveTo(px, py - dSize);
    ctx.lineTo(px + dSize, py);
    ctx.lineTo(px, py + dSize);
    ctx.lineTo(px - dSize, py);
    ctx.closePath();
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Creates High-Resolution HH Goa 2026 Individual Builder Frame (1200 x 1500)
 */
export async function createFrame(data: FrameData): Promise<string> {
  const W = 1200;
  const H = 1500;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const themeKey = data.themeId && FRAME_THEMES[data.themeId] ? data.themeId : 'GOA_CLASSIC';
  const theme = FRAME_THEMES[themeKey];

  // 1. Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, theme.bgGradient[0]);
  bgGrad.addColorStop(0.5, theme.bgGradient[1]);
  bgGrad.addColorStop(1, theme.bgGradient[2]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // 2. Goan Sunburst / Radial Backdrop Glow
  const sunGrad = ctx.createRadialGradient(W / 2, 380, 50, W / 2, 380, 500);
  sunGrad.addColorStop(0, "rgba(243, 192, 72, 0.18)");
  sunGrad.addColorStop(0.5, "rgba(232, 106, 35, 0.08)");
  sunGrad.addColorStop(1, "transparent");
  ctx.fillStyle = sunGrad;
  ctx.fillRect(0, 0, W, H);

  // Decorative Sun Rays
  ctx.save();
  ctx.strokeStyle = "rgba(243, 192, 72, 0.06)";
  ctx.lineWidth = 2;
  const numRays = 16;
  for (let i = 0; i < numRays; i++) {
    const angle = (i * Math.PI * 2) / numRays;
    ctx.beginPath();
    ctx.moveTo(W / 2, 380);
    ctx.lineTo(W / 2 + Math.cos(angle) * 700, 380 + Math.sin(angle) * 700);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Ornate Master Outer Border
  const pad = 40;
  drawOrnateBorder(ctx, pad, pad, W - pad * 2, H - pad * 2, theme.primaryGold, theme.accentColor);

  // Corner Filigree Ornaments
  drawGoanCornerOrnaments(
    ctx,
    pad,
    pad,
    W - pad * 2,
    H - pad * 2,
    theme.primaryGold,
    theme.accentColor,
    theme.ornamentStyle
  );

  // 4. Header Badge / Top Bar
  ctx.save();
  // HH GOA 2026 Header Text (Dynamic measureText to prevent HH and GOA 2026 overlap)
  ctx.font = "800 44px 'Syne', sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText("HH", 110, 115);
  const hhWidth = ctx.measureText("HH").width;

  ctx.fillStyle = theme.primaryGold;
  ctx.fillText("GOA 2026", 110 + hhWidth + 18, 115);

  // Hacker Glyph Right
  ctx.fillStyle = theme.accentColor;
  ctx.font = "700 26px 'JetBrains Mono', monospace";
  ctx.textAlign = "right";
  ctx.fillText(">_ HACKER HOUSE", W - 110, 115);
  ctx.textAlign = "left";

  // Divider Line
  ctx.strokeStyle = "rgba(243, 192, 72, 0.3)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(110, 140);
  ctx.lineTo(W - 110, 140);
  ctx.stroke();
  ctx.restore();

  // 5. Photo Container (Center Box)
  const photoX = 90;
  const photoY = 175;
  const photoW = W - photoX * 2; // 1020px
  const photoH = 820;

  // Photo Background Card
  ctx.fillStyle = theme.cardBg;
  roundedRect(ctx, photoX, photoY, photoW, photoH, 28);
  ctx.fill();

  // Draw Uploaded Photo
  if (data.photo) {
    try {
      const userImg = await loadImage(data.photo);
      ctx.save();
      roundedRect(ctx, photoX, photoY, photoW, photoH, 28);
      ctx.clip();
      drawAdjustedCoverImage(ctx, userImg, photoX, photoY, photoW, photoH, data.adjustments);
      ctx.restore();
    } catch (e) {
      console.error("Failed to render photo on canvas:", e);
    }
  } else {
    // Placeholder if no photo
    ctx.fillStyle = "rgba(243, 192, 72, 0.15)";
    ctx.font = "800 42px 'Syne', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("YOUR PHOTO HERE", W / 2, photoY + photoH / 2);
    ctx.textAlign = "left";
  }

  // Photo Frame Gold Border
  ctx.strokeStyle = theme.primaryGold;
  ctx.lineWidth = 6;
  roundedRect(ctx, photoX, photoY, photoW, photoH, 28);
  ctx.stroke();

  // Inner Photo Filigree Corners
  drawGoanCornerOrnaments(
    ctx,
    photoX,
    photoY,
    photoW,
    photoH,
    "rgba(243, 192, 72, 0.6)",
    theme.accentColor,
    theme.ornamentStyle
  );

  // 6. Identity Text Section (Below Photo)
  const textStartY = photoY + photoH + 65;

  // Name (Large Bold Headings)
  ctx.save();
  ctx.fillStyle = "#FBF8EF";
  ctx.font = "800 64px 'Syne', sans-serif";
  const nameStr = (data.name || "BUILDER NAME").toUpperCase();
  ctx.fillText(nameStr.slice(0, 22), 110, textStartY);

  // Stack Badge
  const stackStr = (data.stack || "FULL STACK").toUpperCase();
  ctx.font = "700 28px 'JetBrains Mono', monospace";
  ctx.fillStyle = theme.accentColor;
  ctx.fillText(`// ${stackStr}`, 110, textStartY + 48);

  // Team Name if present
  if (data.teamName) {
    ctx.font = "600 24px 'Outfit', sans-serif";
    ctx.fillStyle = "#C5D9CB";
    ctx.fillText(`CREW: ${data.teamName.toUpperCase()}`, 110, textStartY + 88);
  }
  ctx.restore();

  // 7. Footer Section (Inset to 125px so left & right text clear corner filigree ornaments symmetrically)
  ctx.save();
  ctx.strokeStyle = "rgba(243, 192, 72, 0.25)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(125, H - 110);
  ctx.lineTo(W - 125, H - 110);
  ctx.stroke();

  // Left Footer Text
  ctx.fillStyle = "#C5D9CB";
  ctx.font = "600 22px 'JetBrains Mono', monospace";
  ctx.fillText("GOA, INDIA 🌴  BUILD · SHIP · SHARE", 125, H - 65);

  // Right Footer Hashtag
  ctx.fillStyle = theme.primaryGold;
  ctx.font = "800 28px 'Syne', sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("#FrameInGoa", W - 125, H - 65);
  ctx.textAlign = "left";
  ctx.restore();

  return canvas.toDataURL("image/png");
}
