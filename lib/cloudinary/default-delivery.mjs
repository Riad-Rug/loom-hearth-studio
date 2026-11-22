export const cloudinaryTransformationPrefix = /^[a-z]{1,3}_[^/]*\//u;

export function withDefaultDelivery(src, width = 1920) {
  const match = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/u.exec(src);
  if (!match || cloudinaryTransformationPrefix.test(match[2])) return src;
  return `${match[1]}w_${width},c_limit,q_auto,f_auto/${match[2]}`;
}
