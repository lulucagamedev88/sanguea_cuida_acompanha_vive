/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const MAX_RAW_PHOTO_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
export const PROFILE_PHOTO_OUTPUT_SIZE = 400; // 400x400 px para nitidez em telemóveis e tablets
export const PROFILE_PHOTO_JPEG_QUALITY = 0.82;
export const PROFILE_PHOTO_FALLBACK_QUALITY = 0.72;
export const MAX_ENCODED_DATA_URL_LENGTH = 350_000; // ~260 KB máximo após compressão

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/avif',
  'image/bmp',
]);

const ALLOWED_IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif|heic|heif|avif|bmp)$/i;

export interface LoadedImageSource {
  width: number;
  height: number;
  previewUrl: string;
  bitmap: ImageBitmap | null;
  element: HTMLImageElement | null;
  cleanup: () => void;
}

export interface SquareCropParams {
  zoom: number; // >= 1
  panRatioX: number; // -1 a 1
  panRatioY: number; // -1 a 1
}

/**
 * Verifica se um ficheiro seleccionado é uma imagem válida e dentro do limite aceitável.
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Nenhum ficheiro foi seleccionado.' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'O ficheiro seleccionado está vazio ou corrompido.' };
  }

  if (file.size > MAX_RAW_PHOTO_SIZE_BYTES) {
    return {
      valid: false,
      error: 'A imagem seleccionada é demasiado grande (máximo 25 MB). Escolha outra fotografia.',
    };
  }

  const mime = (file.type || '').toLowerCase().trim();
  const hasValidMime = mime !== '' && ALLOWED_IMAGE_MIME_TYPES.has(mime);
  const hasImagePrefix = mime.startsWith('image/');
  const hasValidExt = ALLOWED_IMAGE_EXTENSIONS.test(file.name || '');

  // Alguns selectores nativos Android devolvem file.type vazio; nesses casos aceitamos pela extensão
  if (!hasValidMime && !hasImagePrefix && !(mime === '' && hasValidExt)) {
    return {
      valid: false,
      error: 'Formato não suportado. Por favor seleccione uma fotografia (JPG, PNG ou WebP).',
    };
  }

  return { valid: true };
}

/**
 * Carrega um Blob/File de imagem respeitando a orientação EXIF quando suportado.
 */
export async function loadImageForCropping(blob: Blob): Promise<LoadedImageSource> {
  if (blob instanceof File) {
    const validation = validateImageFile(blob);
    if (!validation.valid) {
      throw new Error(validation.error || 'Imagem inválida.');
    }
  } else if (blob.size === 0) {
    throw new Error('A imagem capturada está vazia.');
  }

  const previewUrl = URL.createObjectURL(blob);

  // 1. Tentar ImageDecoder/createImageBitmap com orientação EXIF automática (Chromium/Android WebView moderno)
  let bitmap: ImageBitmap | null = null;
  if (typeof window !== 'undefined' && typeof window.createImageBitmap === 'function') {
    try {
      bitmap = await window.createImageBitmap(blob, {
        imageOrientation: 'from-image',
      });
    } catch {
      try {
        bitmap = await window.createImageBitmap(blob);
      } catch {
        bitmap = null;
      }
    }
  }

  if (bitmap && bitmap.width > 0 && bitmap.height > 0) {
    // Se precisarmos de um previewUrl já corrigido por orientação para <img>, desenhamos um bitmap temporário ou usamos previewUrl
    // Nota: navegadores modernos também respeitam EXIF automaticamente em <img>.
    return {
      width: bitmap.width,
      height: bitmap.height,
      previewUrl,
      bitmap,
      element: null,
      cleanup: () => {
        try {
          bitmap?.close();
        } catch {
          // Ignorar
        }
        URL.revokeObjectURL(previewUrl);
      },
    };
  }

  // 2. Fallback via HTMLImageElement
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => {
      if (el.naturalWidth > 0 && el.naturalHeight > 0) {
        resolve(el);
      } else {
        reject(new Error('A imagem não pôde ser descodificada.'));
      }
    };
    el.onerror = () => {
      reject(new Error('Não foi possível abrir o ficheiro de imagem. Pode estar corrompido ou num formato incompatível.'));
    };
    el.src = previewUrl;
  }).catch((err) => {
    URL.revokeObjectURL(previewUrl);
    throw err;
  });

  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    previewUrl,
    bitmap: null,
    element: img,
    cleanup: () => {
      URL.revokeObjectURL(previewUrl);
    },
  };
}

/**
 * Calcula a região de recorte quadrado em coordenadas da imagem original.
 */
export function computeSquareCropRect(
  sourceWidth: number,
  sourceHeight: number,
  params: SquareCropParams
): { sx: number; sy: number; sSize: number } {
  const safeZoom = Math.max(1, Math.min(4, Number.isFinite(params.zoom) ? params.zoom : 1));
  const safePanX = Math.max(-1, Math.min(1, Number.isFinite(params.panRatioX) ? params.panRatioX : 0));
  const safePanY = Math.max(-1, Math.min(1, Number.isFinite(params.panRatioY) ? params.panRatioY : 0));

  const minDim = Math.min(sourceWidth, sourceHeight);
  const sSize = minDim / safeZoom;

  const sx = ((sourceWidth - sSize) / 2) * (1 - safePanX);
  const sy = ((sourceHeight - sSize) / 2) * (1 - safePanY);

  return {
    sx: Math.max(0, Math.min(sourceWidth - sSize, sx)),
    sy: Math.max(0, Math.min(sourceHeight - sSize, sy)),
    sSize,
  };
}

/**
 * Gera a fotografia de perfil optimizada (quadrada 400x400 JPEG comprimida) a partir da fonte e do recorte.
 */
export function renderOptimizedProfilePhoto(
  source: LoadedImageSource,
  crop: SquareCropParams,
  outputSize: number = PROFILE_PHOTO_OUTPUT_SIZE
): string {
  const drawable = source.bitmap || source.element;
  if (!drawable) {
    throw new Error('Fonte de imagem indisponível para processamento.');
  }

  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Contexto gráfico indisponível neste dispositivo.');
  }

  // Fundo branco limpo para PNGs/WebPs com transparência
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, outputSize, outputSize);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const { sx, sy, sSize } = computeSquareCropRect(source.width, source.height, crop);
  ctx.drawImage(drawable, sx, sy, sSize, sSize, 0, 0, outputSize, outputSize);

  let dataUrl = canvas.toDataURL('image/jpeg', PROFILE_PHOTO_JPEG_QUALITY);
  if (dataUrl.length > MAX_ENCODED_DATA_URL_LENGTH) {
    dataUrl = canvas.toDataURL('image/jpeg', PROFILE_PHOTO_FALLBACK_QUALITY);
  }

  if (!isValidProfilePhotoDataUrl(dataUrl)) {
    throw new Error('Falha ao codificar a fotografia optimizada.');
  }

  return dataUrl;
}

/**
 * Valida se uma string é um Data URL de imagem seguro e válido para fotografia de perfil.
 */
export function isValidProfilePhotoDataUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (value.length === 0 || value.length > MAX_ENCODED_DATA_URL_LENGTH * 2) return false;
  return /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value);
}
