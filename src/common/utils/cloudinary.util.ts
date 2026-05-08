/**
 * Cloudinary URL Generation Utility
 */

export type ProductImageType = 'thumbnail' | 'grid' | 'detail' | 'original';

/**
 * Formats a Cloudinary public ID into a transformed URL
 * @param publicId The Cloudinary public ID
 * @param type The transformation type
 * @returns The formatted URL
 */
export function formatProductImage(publicId: string, type: ProductImageType = 'original'): string {
  if (!publicId) return '';

  // Base transformations: f_auto (auto format), q_auto (auto quality)
  const baseTransform = 'f_auto,q_auto';
  let specificTransform = '';

  switch (type) {
    case 'thumbnail':
      specificTransform = 'w_100,c_thumb';
      break;
    case 'grid':
      specificTransform = 'w_300,c_scale';
      break;
    case 'detail':
      specificTransform = 'w_800,c_scale';
      break;
    case 'original':
    default:
      // No additional scaling for original, but still apply auto format/quality
      specificTransform = '';
      break;
  }

  const transform = specificTransform ? `${baseTransform},${specificTransform}` : baseTransform;
  
  // Construct the URL. Assuming we are using the v2 SDK and have the cloud name.
  // Since this is a utility that might be used without the SDK instance, 
  // we can use the delivery URL pattern: https://res.cloudinary.com/[cloud_name]/image/upload/[transform]/[public_id]
  // However, it's better to use the SDK if possible.
  // Given the constraint "Do not change my database schema", 
  // we should probably just return the transformation string or a helper that uses the SDK.
  
  // If we don't have the cloud name here, we can't build the full URL.
  // But usually, publicId might already be a URL or just the ID.
  // In this project, image_public_id stores the public_id.
  
  // Let's assume we need to return the FULL URL.
  // We can get the cloud name from environment variables.
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${publicId}`;
}
