export const allowedImageHostnames = [
  // The site's own canonical host. Editor-supplied image URLs (e.g. the blog
  // author photo) are stored absolute — admin validation requires https — so a
  // portrait served from our own /public still reaches next/image as a remote
  // URL and needs an explicit remotePattern like any other host.
  "www.loomandhearthstudio.com",
  "res.cloudinary.com",
  "images.pexels.com",
  "images.unsplash.com",
] as const;
