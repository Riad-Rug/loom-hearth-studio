import { permanentRedirect } from "next/navigation";

export default async function VintagePage() {
  permanentRedirect("/shop/rugs/vintage");
}
