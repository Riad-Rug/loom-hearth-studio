"use client";

import type { ChangeEvent } from "react";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import type { AdminProductActionState } from "@/lib/admin/product-actions-shared";
import { initialAdminProductActionState } from "@/lib/admin/product-actions-shared";
import {
  adminProductCategoryOptions,
  adminProductStatusOptions,
  adminProductTypeOptions,
  type AdminProductFormValues,
} from "@/lib/admin/product-form-shared";
import {
  cloudinaryAssetRoleOptions,
  getProductRoutePreview,
  mediaTypeOptions,
  normalizeSlug,
} from "@/lib/catalog/product-validation";
import type {
  CloudinaryBrowserUploadResult,
  CloudinarySignedUploadPayload,
} from "@/lib/cloudinary/types";

import styles from "./admin.module.css";

type AdminProductFormProps = {
  mode: "create" | "edit";
  title: string;
  description: string;
  product: AdminProductFormValues;
  action: (
    state: AdminProductActionState,
    formData: FormData,
  ) => Promise<AdminProductActionState>;
};

export function AdminProductForm(props: AdminProductFormProps) {
  const [state, formAction] = useActionState(props.action, initialAdminProductActionState);
  const [type, setType] = useState(props.product.type);
  const [slug, setSlug] = useState(props.product.slug);
  const [name, setName] = useState(props.product.name);
  const [category, setCategory] = useState(props.product.category);
  const [description, setDescription] = useState(props.product.description);
  const [priceUsd, setPriceUsd] = useState(props.product.priceUsd);
  const [origin, setOrigin] = useState(props.product.origin);
  const [rugStyle, setRugStyle] = useState(props.product.rugStyle);
  const [dimensionsCmLength, setDimensionsCmLength] = useState(props.product.dimensionsCmLength);
  const [dimensionsCmWidth, setDimensionsCmWidth] = useState(props.product.dimensionsCmWidth);
  const [weightKg, setWeightKg] = useState(props.product.weightKg);
  const [materials, setMaterials] = useState(
    props.product.materials.length ? props.product.materials : [""],
  );
  const [images, setImages] = useState(
    props.product.images.length
      ? props.product.images.map((image) => ({
          ...image,
          id: image.id || createImageRowId(),
        }))
      : [createEmptyImageRow({ sortOrder: 1, role: "hero" })],
  );
  const [variants, setVariants] = useState(props.product.variants);
  const [notifyMeEnabled, setNotifyMeEnabled] = useState(props.product.notifyMeEnabled);
  const [confirmUrlChange, setConfirmUrlChange] = useState(false);
  const [uploadState, setUploadState] = useState<{
    status: "idle" | "uploading" | "success" | "error";
    message: string | null;
  }>({
    status: "idle",
    message: null,
  });
  const routePreview = useMemo(
    () =>
      getProductRoutePreview({
        type,
        slug: normalizeSlug(slug),
        category,
        rugStyle,
      }),
    [category, rugStyle, slug, type],
  );
  const hasUrlChange = Boolean(
    props.product.routePath && routePreview && props.product.routePath !== routePreview,
  );

  function updateImage(index: number, patch: Partial<(typeof images)[number]>) {
    setImages((current) =>
      current.map((image, imageIndex) =>
        imageIndex === index ? { ...image, ...patch } : image,
      ),
    );
  }

  function updateVariant(index: number, patch: Partial<(typeof variants)[number]>) {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...patch } : variant,
      ),
    );
  }

  async function handleImageFileSelection(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadState({
      status: "uploading",
      message: `Uploading ${file.name}...`,
    });

    try {
      const signatureResponse = await fetch("/api/admin/cloudinary/upload-signature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productType: type,
        }),
      });

      const signatureResult = (await signatureResponse.json()) as
        | {
            status: "ready";
            payload: CloudinarySignedUploadPayload;
          }
        | {
            status: "forbidden" | "invalid-input" | "configuration-error";
            message: string;
          };

      if (!signatureResponse.ok || signatureResult.status !== "ready") {
        throw new Error(
          "message" in signatureResult
            ? signatureResult.message
            : "Upload signing failed before a Cloudinary payload was returned.",
        );
      }

      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("api_key", signatureResult.payload.apiKey);
      uploadFormData.append("timestamp", String(signatureResult.payload.timestamp));
      uploadFormData.append("folder", signatureResult.payload.folder);
      uploadFormData.append("signature", signatureResult.payload.signature);

      const uploadResponse = await fetch(signatureResult.payload.uploadUrl, {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const uploadErrorText = await readUploadErrorMessage(uploadResponse);

        throw new Error(
          uploadErrorText || "Cloudinary upload failed before media metadata was returned.",
        );
      }

      const uploadResult = (await uploadResponse.json()) as CloudinaryBrowserUploadResult;

      setImages((current) => {
        const blankImageIndex = current.findIndex(isBlankImageRow);
        const nextSortOrder =
          blankImageIndex >= 0 ? current[blankImageIndex]?.sortOrder ?? 1 : current.length + 1;
        const nextImage = {
          id: blankImageIndex >= 0 ? current[blankImageIndex].id : createImageRowId(),
          publicId: uploadResult.public_id,
          altText: createDefaultImageAltText(file.name, name, nextSortOrder),
          sortOrder: nextSortOrder,
          role: blankImageIndex >= 0 ? current[blankImageIndex].role : ("gallery" as const),
          mediaType: "image" as const,
          width: uploadResult.width,
          height: uploadResult.height,
        };

        if (blankImageIndex >= 0) {
          return current.map((image, index) => (index === blankImageIndex ? nextImage : image));
        }

        return [...current, nextImage];
      });

      setUploadState({
        status: "success",
        message: `${file.name} uploaded and appended to product images.`,
      });
    } catch (error) {
      setUploadState({
        status: "error",
        message: error instanceof Error ? error.message : "Image upload failed.",
      });
    } finally {
      event.target.value = "";
    }
  }

  return (
    <form className={styles.productForm} action={formAction}>
      <input name="id" type="hidden" value={props.product.id ?? ""} />
      <input name="imagesJson" type="hidden" value={JSON.stringify(images)} />
      <input name="materialsJson" type="hidden" value={JSON.stringify(materials)} />
      <input name="variantsJson" type="hidden" value={JSON.stringify(variants)} />
      <input name="originalRoutePath" type="hidden" value={props.product.routePath} />
      <input name="confirmUrlChange" type="hidden" value={confirmUrlChange ? "true" : "false"} />
      <input name="notifyMeEnabled" type="hidden" value={notifyMeEnabled ? "true" : "false"} />

      <header className={styles.moduleHeader}>
        <p className={styles.eyebrow}>Admin products</p>
        <h2>{props.title}</h2>
        <p>{props.description}</p>
      </header>

      {state.message ? (
        <div className={state.status === "success" ? styles.successPanel : styles.gatePanel}>
          <strong>{state.status === "success" ? "Saved" : "Needs attention"}</strong>
          <p>{state.message}</p>
        </div>
      ) : null}

      <div className={styles.formGrid}>
        <section className={styles.card}>
          <p className={styles.cardEyebrow}>Basics</p>
          <label className={styles.formField}>
            <span>Product type</span>
            <select
              name="type"
              value={type}
              onChange={(event) => {
                const nextType = event.target.value as typeof type;
                setType(nextType);
                setCategory(nextType === "rug" ? "rugs" : "poufs");
              }}
            >
              {adminProductTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <em>{state.fieldErrors.type}</em>
          </label>
          <label className={styles.formField}>
            <span>Name</span>
            <input
              name="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <em>{state.fieldErrors.name}</em>
          </label>
          <label className={styles.formField}>
            <span>Slug</span>
            <input
              name="slug"
              type="text"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            />
            <em>{state.fieldErrors.slug}</em>
          </label>
          <label className={styles.formField}>
            <span>Category</span>
            <select
              name="category"
              value={category}
              onChange={(event) => setCategory(event.target.value as typeof category)}
            >
              {adminProductCategoryOptions.map((option) => (
                <option key={option} value={option} disabled={type === "rug" && option !== "rugs"}>
                  {option}
                </option>
              ))}
            </select>
            <em>{state.fieldErrors.category}</em>
          </label>
          <label className={styles.formField}>
            <span>Description</span>
            <textarea
              name="description"
              rows={5}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <em>{state.fieldErrors.description}</em>
          </label>
          <label className={styles.formField}>
            <span>Price (USD)</span>
            <input
              name="priceUsd"
              step="0.01"
              type="number"
              value={priceUsd}
              onChange={(event) => setPriceUsd(event.target.value)}
            />
            <em>{state.fieldErrors.priceUsd}</em>
          </label>
          <label className={styles.formField}>
            <span>Origin</span>
            <input
              name="origin"
              type="text"
              value={origin}
              onChange={(event) => setOrigin(event.target.value)}
            />
            <em>{state.fieldErrors.origin}</em>
          </label>
        </section>

        <section className={styles.card}>
          <p className={styles.cardEyebrow}>Publishing</p>
          <label className={styles.formField}>
            <span>Status</span>
            <select defaultValue={props.product.status} name="status">
              {adminProductStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <em>{state.fieldErrors.status}</em>
          </label>
          <div className={styles.sessionPanel}>
            <strong>Route preview</strong>
            <span>{routePreview || "Complete slug and route fields to generate a path."}</span>
            <span>
              Draft and active products use the same required field set in v1. Status only changes storefront visibility.
            </span>
          </div>
          {hasUrlChange ? (
            <label className={styles.checkboxRow}>
              <input
                checked={confirmUrlChange}
                type="checkbox"
                onChange={(event) => setConfirmUrlChange(event.target.checked)}
              />
              <span>Confirm that saving will replace the old storefront URL without a redirect.</span>
            </label>
          ) : null}
          <em>{state.fieldErrors.confirmUrlChange}</em>
        </section>

        <section className={styles.card}>
          <p className={styles.cardEyebrow}>SEO</p>
          <label className={styles.formField}>
            <span>SEO title</span>
            <input defaultValue={props.product.seoTitle} name="seoTitle" type="text" />
            <em>{state.fieldErrors.seoTitle}</em>
          </label>
          <label className={styles.formField}>
            <span>SEO description</span>
            <textarea
              defaultValue={props.product.seoDescription}
              name="seoDescription"
              rows={4}
            />
            <em>{state.fieldErrors.seoDescription}</em>
          </label>
        </section>

        <section className={styles.card}>
          <p className={styles.cardEyebrow}>Materials</p>
          <div className={styles.stack}>
            {materials.map((material, index) => (
              <div key={`material-${index + 1}`} className={styles.inlineGroup}>
                <input
                  type="text"
                  value={material}
                  onChange={(event) =>
                    setMaterials((current) =>
                      current.map((currentMaterial, materialIndex) =>
                        materialIndex === index ? event.target.value : currentMaterial,
                      ),
                    )
                  }
                />
                <button
                  className={styles.textButton}
                  type="button"
                  onClick={() =>
                    setMaterials((current) =>
                      current.length === 1 ? current : current.filter((_, materialIndex) => materialIndex !== index),
                    )
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              className={styles.navLink}
              type="button"
              onClick={() => setMaterials((current) => [...current, ""])}
            >
              Add material
            </button>
            <em>{state.fieldErrors.materials}</em>
          </div>
        </section>

        <section className={styles.card}>
          <p className={styles.cardEyebrow}>Media</p>
          <div className={styles.stack}>
            <div className={styles.sessionPanel}>
              <strong>Cloudinary upload</strong>
              <span>
                Upload an image directly to Cloudinary, then fine-tune its metadata below.
              </span>
              <label className={styles.navLink}>
                <span>
                  {uploadState.status === "uploading" ? "Uploading image..." : "Upload image"}
                </span>
                <input
                  accept="image/*"
                  disabled={uploadState.status === "uploading"}
                  hidden
                  type="file"
                  onChange={(event) => {
                    void handleImageFileSelection(event);
                  }}
                />
              </label>
              {uploadState.message ? <span>{uploadState.message}</span> : null}
            </div>
            {images.map((image, index) => (
              <div key={image.id} className={styles.groupPanel}>
                <label className={styles.formField}>
                  <span>Asset ID</span>
                  <input
                    type="text"
                    value={image.id}
                    onChange={(event) => updateImage(index, { id: event.target.value })}
                  />
                </label>
                <label className={styles.formField}>
                  <span>Public ID</span>
                  <input
                    type="text"
                    value={image.publicId}
                    onChange={(event) => updateImage(index, { publicId: event.target.value })}
                  />
                </label>
                <label className={styles.formField}>
                  <span>Alt text</span>
                  <input
                    type="text"
                    value={image.altText}
                    onChange={(event) => updateImage(index, { altText: event.target.value })}
                  />
                </label>
                <label className={styles.formField}>
                  <span>Sort order</span>
                  <input
                    type="number"
                    value={image.sortOrder}
                    onChange={(event) =>
                      updateImage(index, { sortOrder: Number.parseInt(event.target.value, 10) || 1 })
                    }
                  />
                </label>
                <label className={styles.formField}>
                  <span>Role</span>
                  <select
                    value={image.role}
                    onChange={(event) => updateImage(index, { role: event.target.value as typeof image.role })}
                  >
                    {cloudinaryAssetRoleOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.formField}>
                  <span>Media type</span>
                  <select
                    value={image.mediaType}
                    onChange={(event) =>
                      updateImage(index, { mediaType: event.target.value as typeof image.mediaType })
                    }
                  >
                    {mediaTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <div className={styles.inlineGroup}>
                  <label className={styles.formField}>
                    <span>Width</span>
                    <input
                      type="number"
                      value={image.width ?? ""}
                      onChange={(event) =>
                        updateImage(index, {
                          width: event.target.value ? Number.parseInt(event.target.value, 10) : undefined,
                        })
                      }
                    />
                  </label>
                  <label className={styles.formField}>
                    <span>Height</span>
                    <input
                      type="number"
                      value={image.height ?? ""}
                      onChange={(event) =>
                        updateImage(index, {
                          height: event.target.value ? Number.parseInt(event.target.value, 10) : undefined,
                        })
                      }
                    />
                  </label>
                </div>
                <button
                  className={styles.textButton}
                  type="button"
                  onClick={() =>
                    setImages((current) =>
                      current.length === 1 ? current : current.filter((_, imageIndex) => imageIndex !== index),
                    )
                  }
                >
                  Remove image
                </button>
              </div>
            ))}
            <button
              className={styles.navLink}
              type="button"
              onClick={() =>
                setImages((current) => [
                  ...current,
                  createEmptyImageRow({ sortOrder: current.length + 1, role: "gallery" }),
                ])
              }
            >
              Add image
            </button>
            <em>{state.fieldErrors.images}</em>
          </div>
        </section>

        {type === "rug" ? (
          <section className={styles.card}>
            <p className={styles.cardEyebrow}>Rug details</p>
            <label className={styles.formField}>
              <span>Rug style</span>
              <input
                name="rugStyle"
                type="text"
                value={rugStyle}
                onChange={(event) => setRugStyle(event.target.value)}
              />
              <em>{state.fieldErrors.rugStyle}</em>
            </label>
            <div className={styles.inlineGroup}>
              <label className={styles.formField}>
                <span>Length (cm)</span>
                <input
                  name="dimensionsCmLength"
                  type="number"
                  value={dimensionsCmLength}
                  onChange={(event) => setDimensionsCmLength(event.target.value)}
                />
                <em>{state.fieldErrors.dimensionsCmLength}</em>
              </label>
              <label className={styles.formField}>
                <span>Width (cm)</span>
                <input
                  name="dimensionsCmWidth"
                  type="number"
                  value={dimensionsCmWidth}
                  onChange={(event) => setDimensionsCmWidth(event.target.value)}
                />
                <em>{state.fieldErrors.dimensionsCmWidth}</em>
              </label>
            </div>
            <label className={styles.formField}>
              <span>Weight (kg)</span>
              <input
                name="weightKg"
                step="0.01"
                type="number"
                value={weightKg}
                onChange={(event) => setWeightKg(event.target.value)}
              />
              <em>{state.fieldErrors.weightKg}</em>
            </label>
            <label className={styles.formField}>
              <span>Fixed quantity</span>
              <input defaultValue={props.product.fixedQuantity} name="fixedQuantity" type="number" />
              <em>{state.fieldErrors.fixedQuantity}</em>
            </label>
          </section>
        ) : (
          <section className={styles.card}>
            <p className={styles.cardEyebrow}>Multi-unit details</p>
            <label className={styles.formField}>
              <span>Inventory</span>
              <input defaultValue={props.product.inventory} name="inventory" type="number" />
              <em>{state.fieldErrors.inventory}</em>
            </label>
            <label className={styles.formField}>
              <span>Low-stock threshold</span>
              <input
                defaultValue={props.product.lowStockThreshold}
                name="lowStockThreshold"
                type="number"
              />
              <em>{state.fieldErrors.lowStockThreshold}</em>
            </label>
            <label className={styles.checkboxRow}>
              <input
                checked={notifyMeEnabled}
                type="checkbox"
                onChange={(event) => setNotifyMeEnabled(event.target.checked)}
              />
              <span>Notify me presentation enabled</span>
            </label>
            <div className={styles.stack}>
              {variants.map((variant, index) => (
                <div key={variant.id} className={styles.groupPanel}>
                  <label className={styles.formField}>
                    <span>Variant ID</span>
                    <input
                      type="text"
                      value={variant.id}
                      onChange={(event) => updateVariant(index, { id: event.target.value })}
                    />
                  </label>
                  <label className={styles.formField}>
                    <span>Name</span>
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(event) => updateVariant(index, { name: event.target.value })}
                    />
                  </label>
                  <label className={styles.formField}>
                    <span>SKU</span>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(event) => updateVariant(index, { sku: event.target.value })}
                    />
                  </label>
                  <div className={styles.inlineGroup}>
                    <label className={styles.formField}>
                      <span>Inventory</span>
                      <input
                        type="number"
                        value={variant.inventory}
                        onChange={(event) =>
                          updateVariant(index, {
                            inventory: Number.parseInt(event.target.value, 10) || 0,
                          })
                        }
                      />
                    </label>
                    <label className={styles.formField}>
                      <span>Price override</span>
                      <input
                        type="number"
                        step="0.01"
                        value={variant.priceUsd ?? ""}
                        onChange={(event) =>
                          updateVariant(index, {
                            priceUsd: event.target.value ? Number(event.target.value) : undefined,
                          })
                        }
                      />
                    </label>
                  </div>
                  <button
                    className={styles.textButton}
                    type="button"
                    onClick={() =>
                      setVariants((current) =>
                        current.filter((_, variantIndex) => variantIndex !== index),
                      )
                    }
                  >
                    Remove variant
                  </button>
                </div>
              ))}
              <button
                className={styles.navLink}
                type="button"
                onClick={() =>
                  setVariants((current) => [
                    ...current,
                    {
                      id: `variant-${current.length + 1}`,
                      name: "",
                      sku: "",
                      inventory: 0,
                    },
                  ])
                }
              >
                Add variant
              </button>
            </div>
          </section>
        )}
      </div>

      <div className={styles.actionRow}>
        <SubmitButton mode={props.mode} />
      </div>
    </form>
  );
}

function createDefaultImageAltText(fileName: string, productName: string, imageNumber: number) {
  const cleanedFileName = fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();

  if (productName.trim()) {
    return `${productName.trim()} image ${imageNumber}`;
  }

  return cleanedFileName || `Product image ${imageNumber}`;
}

function createEmptyImageRow(input: {
  sortOrder: number;
  role: "hero" | "gallery";
}) {
  return {
    id: createImageRowId(),
    publicId: "",
    altText: "",
    sortOrder: input.sortOrder,
    role: input.role,
    mediaType: "image" as const,
    width: input.role === "hero" ? 1600 : undefined,
    height: input.role === "hero" ? 1200 : undefined,
  };
}

function createImageRowId() {
  return `image-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isBlankImageRow(image: {
  publicId: string;
  altText: string;
}) {
  return !image.publicId.trim() && !image.altText.trim();
}

async function readUploadErrorMessage(response: Response) {
  const responseText = await response.text();

  if (!responseText) {
    return "";
  }

  try {
    const parsed = JSON.parse(responseText) as
      | {
          error?: {
            message?: string;
          };
        }
      | undefined;

    return parsed?.error?.message ?? responseText;
  } catch {
    return responseText;
  }
}

function SubmitButton(props: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();

  return (
    <button className={styles.navLink} disabled={pending} type="submit">
      {pending
        ? props.mode === "create"
          ? "Creating product..."
          : "Saving product..."
        : props.mode === "create"
          ? "Create product"
          : "Save product"}
    </button>
  );
}
