"use client";

import type { ChangeEvent } from "react";
import { useActionState, useEffect, useMemo, useState } from "react";
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
  productRugStyleOptions,
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

type ProductImageRow = AdminProductFormValues["images"][number] & {
  id: string;
};

const ageClassOptions = ["Contemporary", "Vintage, estimated", "Antique, estimated"] as const;
const provenanceLabelOptions = ["Verified", "Attributed", "Not Stated"] as const;

export function AdminProductForm(props: AdminProductFormProps) {
  const [state, formAction] = useActionState(props.action, initialAdminProductActionState);
  const [type, setType] = useState(props.product.type);
  const [catalogNumber, setCatalogNumber] = useState(props.product.catalogNumber);
  const [slug, setSlug] = useState(props.product.slug);
  const [name, setName] = useState(props.product.name);
  const [category, setCategory] = useState(props.product.category);
  const [description, setDescription] = useState(props.product.description);
  const [priceUsd, setPriceUsd] = useState(props.product.priceUsd);
  const [acquisitionCostMad, setAcquisitionCostMad] = useState(props.product.acquisitionCostMad);
  const [origin, setOrigin] = useState(props.product.origin);
  const [attributionRegion, setAttributionRegion] = useState(props.product.attributionRegion);
  const [attributionConfidence, setAttributionConfidence] = useState(props.product.attributionConfidence);
  const [provenanceNote, setProvenanceNote] = useState(props.product.provenanceNote);
  const [sourcingNote, setSourcingNote] = useState(props.product.sourcingNote);
  const [conditionNote, setConditionNote] = useState(props.product.conditionNote);
  const [ageClass, setAgeClass] = useState(props.product.ageClass);
  const [ageBasis, setAgeBasis] = useState(props.product.ageBasis);
  const [verificationNotes, setVerificationNotes] = useState(props.product.verificationNotes.join("\n"));
  const [shippingNotes, setShippingNotes] = useState(props.product.shippingNotes.join("\n"));
  const [careNote, setCareNote] = useState(props.product.careNote);
  const [status, setStatus] = useState(props.product.status);
  const [soldAt, setSoldAt] = useState(props.product.soldAt);
  const [seoTitle, setSeoTitle] = useState(props.product.seoTitle);
  const [seoDescription, setSeoDescription] = useState(props.product.seoDescription);
  const [rugStyle, setRugStyle] = useState(props.product.rugStyle);
  const [dimensionsCmLength, setDimensionsCmLength] = useState(props.product.dimensionsCmLength);
  const [dimensionsCmWidth, setDimensionsCmWidth] = useState(props.product.dimensionsCmWidth);
  const [weightKg, setWeightKg] = useState(props.product.weightKg);
  const [fixedQuantity, setFixedQuantity] = useState(props.product.fixedQuantity);
  const [inventory, setInventory] = useState(props.product.inventory);
  const [lowStockThreshold, setLowStockThreshold] = useState(props.product.lowStockThreshold);
  const [materials, setMaterials] = useState(
    props.product.materials.length ? props.product.materials : [""],
  );
  const [images, setImages] = useState<ProductImageRow[]>(
    props.product.images.length
      ? props.product.images.map((image) => ({
          ...image,
          id: image.id || createImageRowId(),
        }))
      : [createEmptyImageRow({ sortOrder: 1, role: "hero" })],
  );
  const [variants, setVariants] = useState(props.product.variants);
  const [notifyMeEnabled, setNotifyMeEnabled] = useState(props.product.notifyMeEnabled);
  const [homepageFeatured, setHomepageFeatured] = useState(props.product.homepageFeatured);
  const [homepageRank, setHomepageRank] = useState(props.product.homepageRank);
  const [confirmUrlChange, setConfirmUrlChange] = useState(false);
  const [uploadState, setUploadState] = useState<{
    status: "idle" | "uploading" | "success" | "error";
    message: string | null;
    imageId: string | null;
  }>({
    status: "idle",
    message: null,
    imageId: null,
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

  useEffect(() => {
    setType(props.product.type);
    setCatalogNumber(props.product.catalogNumber);
    setSlug(props.product.slug);
    setName(props.product.name);
    setCategory(props.product.category);
    setDescription(props.product.description);
    setPriceUsd(props.product.priceUsd);
    setAcquisitionCostMad(props.product.acquisitionCostMad);
    setOrigin(props.product.origin);
    setAttributionRegion(props.product.attributionRegion);
    setAttributionConfidence(props.product.attributionConfidence);
    setProvenanceNote(props.product.provenanceNote);
    setSourcingNote(props.product.sourcingNote);
    setConditionNote(props.product.conditionNote);
    setAgeClass(props.product.ageClass);
    setAgeBasis(props.product.ageBasis);
    setVerificationNotes(props.product.verificationNotes.join("\n"));
    setShippingNotes(props.product.shippingNotes.join("\n"));
    setCareNote(props.product.careNote);
    setStatus(props.product.status);
    setSoldAt(props.product.soldAt);
    setSeoTitle(props.product.seoTitle);
    setSeoDescription(props.product.seoDescription);
    setRugStyle(props.product.rugStyle);
    setDimensionsCmLength(props.product.dimensionsCmLength);
    setDimensionsCmWidth(props.product.dimensionsCmWidth);
    setWeightKg(props.product.weightKg);
    setFixedQuantity(props.product.fixedQuantity);
    setInventory(props.product.inventory);
    setLowStockThreshold(props.product.lowStockThreshold);
    setMaterials(props.product.materials.length ? props.product.materials : [""]);
    setImages(
      props.product.images.length
        ? props.product.images.map((image) => ({
            ...image,
            id: image.id || createImageRowId(),
          }))
        : [createEmptyImageRow({ sortOrder: 1, role: "hero" })],
    );
    setVariants(props.product.variants);
    setNotifyMeEnabled(props.product.notifyMeEnabled);
    setHomepageFeatured(props.product.homepageFeatured);
    setHomepageRank(props.product.homepageRank);
    setConfirmUrlChange(false);
  }, [props.product]);

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

  async function handleImageFileSelection(
    event: ChangeEvent<HTMLInputElement>,
    imageId: string,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadState({
      status: "uploading",
      message: `Uploading ${file.name}...`,
      imageId,
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

      setImages((current) =>
        current.map((image) => {
          if (image.id !== imageId) {
            return image;
          }

          return {
            ...image,
            publicId: uploadResult.public_id,
            altText:
              image.altText.trim() || createDefaultImageAltText(file.name, name, image.sortOrder),
            mediaType: "image" as const,
            width: uploadResult.width,
            height: uploadResult.height,
          };
        }),
      );

      setUploadState({
        status: "success",
        message: `${file.name} uploaded for this image slot.`,
        imageId,
      });
    } catch (error) {
      setUploadState({
        status: "error",
        message: error instanceof Error ? error.message : "Image upload failed.",
        imageId,
      });
    } finally {
      event.target.value = "";
    }
  }

  function getImageUploadMessage(imageId: string) {
    return uploadState.imageId === imageId ? uploadState.message : null;
  }

  function isImageUploading(imageId: string) {
    return uploadState.status === "uploading" && uploadState.imageId === imageId;
  }

  return (
    <form className={styles.productForm} action={formAction}>
      <input name="id" type="hidden" value={props.product.id ?? ""} />
      <input name="imagesJson" type="hidden" value={JSON.stringify(images)} />
      <input name="materialsJson" type="hidden" value={JSON.stringify(materials)} />
      <input name="paletteJson" type="hidden" value={JSON.stringify(props.product.palette)} />
      <input name="variantsJson" type="hidden" value={JSON.stringify(variants)} />
      <input name="originalRoutePath" type="hidden" value={props.product.routePath} />
      <input name="confirmUrlChange" type="hidden" value={confirmUrlChange ? "true" : "false"} />
      <input name="notifyMeEnabled" type="hidden" value={notifyMeEnabled ? "true" : "false"} />
      <input name="homepageFeatured" type="hidden" value={homepageFeatured ? "true" : "false"} />

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
            <span>Product model</span>
            <select
              name="type"
              value={type}
              onChange={(event) => {
                const nextType = event.target.value as typeof type;
                setType(nextType);
                setCategory(
                  nextType === "rug"
                    ? category === "vintage" ? "vintage" : "rugs"
                    : category === "rugs" || category === "vintage" ? "poufs" : category,
                );
              }}
            >
              {adminProductTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "rug" ? "One-of-a-kind rug" : "Object or textile"}
                </option>
              ))}
            </select>
            <em>{state.fieldErrors.type}</em>
          </label>
          <label className={styles.formField}>
            <span>Catalog number</span>
            <input
              autoCapitalize="characters"
              name="catalogNumber"
              placeholder={getCatalogNumberPlaceholder(category)}
              type="text"
              value={catalogNumber}
              onChange={(event) => setCatalogNumber(event.target.value.toUpperCase())}
            />
            <em>Permanent stockroom ID. Required to publish; never reuse a sold number.</em>
            <em>{state.fieldErrors.catalogNumber}</em>
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
                <option
                  key={option}
                  value={option}
                  disabled={
                    type === "rug"
                      ? option !== "rugs" && option !== "vintage"
                      : option === "rugs" || option === "vintage"
                  }
                >
                  {formatProductCategory(option)}
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
            <span>Acquisition cost (MAD)</span>
            <input
              name="acquisitionCostMad"
              min="0"
              step="0.01"
              type="number"
              value={acquisitionCostMad}
              onChange={(event) => setAcquisitionCostMad(event.target.value)}
            />
            <em>Internal only. Never shown on the storefront.</em>
            <em>{state.fieldErrors.acquisitionCostMad}</em>
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
          <p className={styles.cardEyebrow}>Physical facts</p>
          <div className={styles.inlineGroup}>
            <label className={styles.formField}>
              <span>Length (cm)</span>
              <input name="dimensionsCmLength" step="0.1" type="number" value={dimensionsCmLength} onChange={(event) => setDimensionsCmLength(event.target.value)} />
              <em>{state.fieldErrors.dimensionsCmLength}</em>
            </label>
            <label className={styles.formField}>
              <span>Width (cm)</span>
              <input name="dimensionsCmWidth" step="0.1" type="number" value={dimensionsCmWidth} onChange={(event) => setDimensionsCmWidth(event.target.value)} />
              <em>{state.fieldErrors.dimensionsCmWidth}</em>
            </label>
          </div>
          <label className={styles.formField}>
            <span>Weight (kg)</span>
            <input name="weightKg" step="0.01" type="number" value={weightKg} onChange={(event) => setWeightKg(event.target.value)} />
            <em>{state.fieldErrors.weightKg}</em>
          </label>
          <label className={styles.formField}>
            <span>Age class</span>
            <select name="ageClass" value={ageClass} onChange={(event) => setAgeClass(event.target.value)}>
              <option value="">Choose age class</option>
              {ageClassOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <em>{state.fieldErrors.ageClass}</em>
          </label>
          <label className={styles.formField}>
            <span>Age estimate basis</span>
            <textarea name="ageBasis" placeholder="What construction, wear, record, or maker information supports the estimate?" rows={3} value={ageBasis} onChange={(event) => setAgeBasis(event.target.value)} />
            <em>{state.fieldErrors.ageBasis}</em>
          </label>
        </section>

        <section className={styles.card}>
          <p className={styles.cardEyebrow}>Condition & provenance</p>
          <label className={styles.formField}>
            <span>Piece-specific condition</span>
            <textarea name="conditionNote" placeholder="Record wear, repairs, marks, pile variance, seams, chips, or cracks and where they appear." rows={5} value={conditionNote} onChange={(event) => setConditionNote(event.target.value)} />
            <em>Required to publish. Do not use generic handmade-variation copy.</em>
            <em>{state.fieldErrors.conditionNote}</em>
          </label>
          <label className={styles.formField}>
            <span>Attribution region</span>
            <input name="attributionRegion" placeholder="High Atlas, Taznakht, Marrakech…" type="text" value={attributionRegion} onChange={(event) => setAttributionRegion(event.target.value)} />
          </label>
          <label className={styles.formField}>
            <span>Provenance label</span>
            <select name="attributionConfidence" value={attributionConfidence} onChange={(event) => setAttributionConfidence(event.target.value)}>
              <option value="">Choose provenance label</option>
              {provenanceLabelOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <em>{state.fieldErrors.attributionConfidence}</em>
          </label>
          <label className={styles.formField}>
            <span>Provenance basis</span>
            <textarea name="provenanceNote" placeholder="Explain why the label is Verified, Attributed, or Not Stated." rows={4} value={provenanceNote} onChange={(event) => setProvenanceNote(event.target.value)} />
            <em>{state.fieldErrors.provenanceNote}</em>
          </label>
          <label className={styles.formField}>
            <span>Sourcing note</span>
            <textarea name="sourcingNote" placeholder="Write 2–4 factual first-person lines and sign — Riad." rows={5} value={sourcingNote} onChange={(event) => setSourcingNote(event.target.value)} />
            <em>{state.fieldErrors.sourcingNote}</em>
          </label>
        </section>

        <section className={styles.card}>
          <p className={styles.cardEyebrow}>Buyer notes</p>
          <label className={styles.formField}>
            <span>Verification notes</span>
            <textarea name="verificationNotes" rows={4} value={verificationNotes} onChange={(event) => setVerificationNotes(event.target.value)} />
            <em>One buyer-facing point per line.</em>
          </label>
          <label className={styles.formField}>
            <span>Shipping notes</span>
            <textarea name="shippingNotes" rows={4} value={shippingNotes} onChange={(event) => setShippingNotes(event.target.value)} />
            <em>One factual point per line; state duty treatment only when verified.</em>
          </label>
          <label className={styles.formField}>
            <span>Care note</span>
            <textarea name="careNote" rows={4} value={careNote} onChange={(event) => setCareNote(event.target.value)} />
          </label>
        </section>

        <section className={styles.card}>
          <p className={styles.cardEyebrow}>Publishing</p>
          <label className={styles.formField}>
            <span>Status</span>
            <select
              name="status"
              value={status}
              onChange={(event) => setStatus(event.target.value as typeof status)}
            >
              {adminProductStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <em>{state.fieldErrors.status}</em>
          </label>
          {status === "sold" ? (
            <label className={styles.formField}>
              <span>Sold date</span>
              <input
                name="soldAt"
                type="date"
                value={soldAt}
                onChange={(event) => setSoldAt(event.target.value)}
              />
              <em>{state.fieldErrors.soldAt}</em>
            </label>
          ) : null}
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
          <p className={styles.cardEyebrow}>Homepage feature</p>
          <label className={styles.checkboxRow}>
            <input
              checked={homepageFeatured}
              type="checkbox"
              onChange={(event) => setHomepageFeatured(event.target.checked)}
            />
            <span>Feature this product on the homepage product rail</span>
          </label>
          <label className={styles.formField}>
            <span>Homepage rank</span>
            <input
              name="homepageRank"
              min="1"
              type="number"
              value={homepageRank}
              onChange={(event) => setHomepageRank(event.target.value)}
            />
            <em>Lower numbers appear first. Leave blank to sort after ranked products.</em>
            <em>{state.fieldErrors.homepageRank}</em>
          </label>
        </section>

        <section className={styles.card}>
          <p className={styles.cardEyebrow}>SEO</p>
          <label className={styles.formField}>
            <span>SEO title</span>
            <input
              name="seoTitle"
              type="text"
              value={seoTitle}
              onChange={(event) => setSeoTitle(event.target.value)}
            />
            <em>{state.fieldErrors.seoTitle}</em>
          </label>
          <label className={styles.formField}>
            <span>SEO description</span>
            <textarea
              name="seoDescription"
              rows={4}
              value={seoDescription}
              onChange={(event) => setSeoDescription(event.target.value)}
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
                {getPhotoChecklist(category)}
              </span>
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
                <label className={styles.navLink}>
                  <span>
                    {isImageUploading(image.id) ? "Uploading image..." : "Upload image to this slot"}
                  </span>
                  <input
                    accept="image/*"
                    disabled={uploadState.status === "uploading"}
                    hidden
                    type="file"
                    onChange={(event) => {
                      void handleImageFileSelection(event, image.id);
                    }}
                  />
                </label>
                {getImageUploadMessage(image.id) ? <span>{getImageUploadMessage(image.id)}</span> : null}
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
              <select
                name="rugStyle"
                value={rugStyle}
                onChange={(event) => setRugStyle(event.target.value)}
              >
                <option value="">Choose rug style</option>
                {productRugStyleOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <em>{state.fieldErrors.rugStyle}</em>
            </label>
            <label className={styles.formField}>
              <span>Fixed quantity</span>
              <input
                name="fixedQuantity"
                type="number"
                value={fixedQuantity}
                onChange={(event) => setFixedQuantity(event.target.value)}
              />
              <em>{state.fieldErrors.fixedQuantity}</em>
            </label>
          </section>
        ) : (
          <section className={styles.card}>
            <p className={styles.cardEyebrow}>Multi-unit details</p>
            <label className={styles.formField}>
              <span>Inventory</span>
              <input
                name="inventory"
                type="number"
                value={inventory}
                onChange={(event) => setInventory(event.target.value)}
              />
              <em>{state.fieldErrors.inventory}</em>
            </label>
            <label className={styles.formField}>
              <span>Low-stock threshold</span>
              <input
                name="lowStockThreshold"
                type="number"
                value={lowStockThreshold}
                onChange={(event) => setLowStockThreshold(event.target.value)}
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

function formatProductCategory(category: AdminProductFormValues["category"]) {
  switch (category) {
    case "rugs": return "Rugs";
    case "vintage": return "Vintage Rugs";
    case "poufs": return "Poufs";
    case "pillows": return "Pillows";
    case "decor": return "Decor & Antiques";
  }
}

function getCatalogNumberPlaceholder(category: AdminProductFormValues["category"]) {
  switch (category) {
    case "rugs": return "LH-R-0001";
    case "vintage": return "LH-R-0001";
    case "poufs": return "LH-P-0001";
    case "pillows": return "LH-X-0001";
    case "decor": return "LH-D-0001 or LH-A-0001";
  }
}

function getPhotoChecklist(category: AdminProductFormValues["category"]) {
  switch (category) {
    case "rugs":
    case "vintage":
      return "Required sequence: overhead flat, angle, pile or weave close-up, back, edge or fringe, every flaw, then scale or context.";
    case "poufs":
      return "Required sequence: top, side, seam or zip, underside, every flaw, then scale beside a chair or person.";
    case "pillows":
      return "Required sequence: front, back, closure, texture close-up, every mark, and an image confirming whether an insert is included.";
    case "decor":
      return "Required sequence: all sides, base and marks, every chip or repair, then a scale image. Antiques also need signatures and construction details.";
  }
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
    width: undefined,
    height: undefined,
  };
}

function createImageRowId() {
  return `image-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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
