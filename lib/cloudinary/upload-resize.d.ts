declare module "@/lib/cloudinary/upload-resize.mjs" {
  export function computeTargetSize(width: number, height: number, maxEdge: number): {
    width: number;
    height: number;
  };
  export function shouldSkipResize(input: {
    type: string;
    width: number;
    height: number;
    size: number;
  }): boolean;
}
