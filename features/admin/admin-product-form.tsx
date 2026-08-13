"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { CloudinaryUploadButton } from "@/features/admin/cloudinary-upload-button";
import {
  antiqueDecorSubtype,
  cutFromOneRugUniquenessTier,
  getCategoryFormCopy,
  productDecorSubtypeOptions,
  productFaceFabricSourceOptions,
  productUniquenessTierOptions,
} from "@/lib/admin/category-form-copy";
import type { AdminProductActionState } from "@/lib/admin/product-actions-shared";
import { initialAdminProductActionState } from "@/lib/admin/product-actions-shared";
import {
  adminProductCategoryOptions,
  adminProductStatusOptions,
  adminProductTypeOptions,
  type AdminProductFormValues,
} from "@/lib/admin/product-form-shared";
import {
  getAutoProductCardName,
  isProductCardNameAutoShortened,
  productCardNameMaxLength,
} from "@/lib/catalog/product-card-name";
import {
  cloudinaryAssetRoleOptions,
  getProductRoutePreview,
  mediaTypeOptions,
  normalizeSlug,
  productRugStyleOptions,
} from "@/lib/catalog/product-validation";

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

// "Not Stated" is available to every category on purpose: an unverifiable age is
// an honest answer anywhere, and it still forces an age-basis explanation.
const ageClassOptions = [
  "Contemporary",
  "Vintage, estimated",
  "Antique, estimated",
  "Not Stated",
] as const;
const provenanceLabelOptions = ["Verified", "Attributed", "Not Stated"] as const;

export function AdminProductForm(props: AdminProductFormProps) {
  const [state, formAction] = useActionState(props.action, initialAdminProductActionState);
  const feedbackRef = useRef<HTMLDivElement | null>(null);
  const [type, setType] = useState(props.product.type);
  const [catalogNumber, setCatalogNumber] = useState(props.product.catalogNumber);
  const [slug, setSlug] = useState(props.product.slug);
  const [name, setName] = useState(props.product.name);
  const [cardName, setCardName] = useState(props.product.cardName);
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
  const [faceFabricSource, setFaceFabricSource] = useState(props.product.faceFabricSource);
  const [uniquenessTier, setUniquenessTier] = useState(props.product.uniquenessTier);
  const [sourceCoverCount, setSourceCoverCount] = useState(props.product.sourceCoverCount);
  const [insertIncluded, setInsertIncluded] = useState(props.product.insertIncluded);
  const [decorSubtype, setDecorSubtype] = useState(props.product.decorSubtype);
  const [objectType, setObjectType] = useState(props.product.objectType);
  const [makerMarksNote, setMakerMarksNote] = useState(props.product.makerMarksNote);
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
  const [heightCm, setHeightCm] = useState(props.product.heightCm);
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
  const cardNameInput = useMemo(
    () => ({
      name,
      type,
      category,
      rugStyle: type === "rug" ? rugStyle : undefined,
    }),
    [category, name, rugStyle, type],
  );
  const autoCardName = useMemo(() => getAutoProductCardName(cardNameInput), [cardNameInput]);
  const needsCardName = Boolean(name.trim()) && isProductCardNameAutoShortened(cardNameInput);
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
  const categoryCopy = useMemo(() => getCategoryFormCopy(category), [category]);
  const showsFaceFabricSource = categoryCopy.extraFields.includes("faceFabricSource");
  const showsUniquenessTier = categoryCopy.extraFields.includes("uniquenessTier");
  const showsInsertIncluded = categoryCopy.extraFields.includes("insertIncluded");
  const showsDecorSubtype = categoryCopy.extraFields.includes("decorSubtype");
  const showsObjectType = categoryCopy.extraFields.includes("objectType");
  const showsMakerMarksNote = categoryCopy.extraFields.includes("makerMarksNote");
  const showsHeightCm = categoryCopy.extraFields.includes("heightCm");
  // Category defaults are applied when the category changes, and on mount for a
  // new product. Saved products keep whatever is already stored, and a field the
  // user has already filled is never overwritten.
  const appliedDefaultsForCategory = useRef<string | null>(
    props.mode === "create" ? null : props.product.category,
  );

  useEffect(() => {
    if (state.status === "idle" || !feedbackRef.current) {
      return;
    }

    feedbackRef.current.focus();
    feedbackRef.current.scrollIntoView({ behavior: "auto", block: "center" });
  }, [state]);

  useEffect(() => {
    setType(props.product.type);
    setCatalogNumber(props.product.catalogNumber);
    setSlug(props.product.slug);
    setName(props.product.name);
    setCardName(props.product.cardName);
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
    setFaceFabricSource(props.product.faceFabricSource);
    setUniquenessTier(props.product.uniquenessTier);
    setSourceCoverCount(props.product.sourceCoverCount);
    setInsertIncluded(props.product.insertIncluded);
    setDecorSubtype(props.product.decorSubtype);
    setObjectType(props.product.objectType);
    setMakerMarksNote(props.product.makerMarksNote);
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
    setHeightCm(props.product.heightCm);
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
    appliedDefaultsForCategory.current =
      props.mode === "create" ? null : props.product.category;
  }, [props.mode, props.product]);

  useEffect(() => {
    if (appliedDefaultsForCategory.current === category) {
      return;
    }

    appliedDefaultsForCategory.current = category;
    const { fieldDefaults } = getCategoryFormCopy(category);
    const keepFilled = (fallback?: string) => (current: string) =>
      current.trim() || !fallback ? current : fallback;

    setOrigin(keepFilled(fieldDefaults.origin));
    setAgeClass(keepFilled(fieldDefaults.ageClass));
    setAttributionConfidence(keepFilled(fieldDefaults.attributionConfidence));
    // Inventory is never blank, so an untouched "0" counts as unfilled here;
    // that is what lets one-of-each categories default their stock to 1.
    setInventory((current) =>
      fieldDefaults.inventory && (!current.trim() || current.trim() === "0")
        ? fieldDefaults.inventory
        : current,
    );
  }, [category]);

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

  function applyImageUploadResult(
    imageId: string,
    result: { publicId: string; fileName: string; width?: number; height?: number },
  ) {
    setImages((current) =>
      current.map((image) => {
        if (image.id !== imageId) {
          return image;
        }

        return {
          ...image,
          publicId: result.publicId,
          altText:
            image.altText.trim() ||
            createDefaultImageAltText(result.fileName, name, image.sortOrder),
          mediaType: "image" as const,
          width: result.width,
          height: result.height,
        };
      }),
    );
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
      <input name="insertIncluded" type="hidden" value={insertIncluded ? "true" : "false"} />

      <header className={styles.moduleHeader}>
        <p className={styles.eyebrow}>Admin products</p>
        <h2>{props.title}</h2>
        <p>{props.description}</p>
      </header>

      {state.message ? (
        <div
          ref={feedbackRef}
          aria-live={state.status === "error" ? "assertive" : "polite"}
          className={state.status === "success" ? styles.successPanel : styles.gatePanel}
          role={state.status === "error" ? "alert" : "status"}
          tabIndex={-1}
        >
          <strong>{state.status === "success" ? "Saved" : "Needs attention"}</strong>
          <p>{state.message}</p>
          {state.status === "error" && Object.keys(state.fieldErrors).length ? (
            <ul>
              {Object.entries(state.fieldErrors).map(([field, message]) => (
                <li key={field}>
                  <strong>{formatFieldErrorLabel(field)}:</strong> {message}
                </li>
              ))}
            </ul>
          ) : null}
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
              placeholder={getCatalogNumberPlaceholder(category, decorSubtype)}
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
          {needsCardName ? (
            <label className={styles.formField}>
              <span>
                Card name ({cardName.length} / {productCardNameMaxLength})
              </span>
              <input
                maxLength={productCardNameMaxLength}
                name="cardName"
                type="text"
                value={cardName}
                onChange={(event) => setCardName(event.target.value)}
              />
              <em>
                The full name is too long for shop card tiles, so cards shorten it automatically.
                Write your own short version here; the full name still shows on the product page.
              </em>
              <em>
                {cardName.trim()
                  ? `Cards will show: “${cardName.trim()}”`
                  : `If left blank, cards will show: “${autoCardName}”`}
              </em>
              <em>{state.fieldErrors.cardName}</em>
            </label>
          ) : (
            <input name="cardName" type="hidden" value={cardName} />
          )}
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
            <span>{categoryCopy.labels.origin}</span>
            <input
              name="origin"
              placeholder={categoryCopy.placeholders.origin}
              type="text"
              value={origin}
              onChange={(event) => setOrigin(event.target.value)}
            />
            {categoryCopy.helpText.origin ? <em>{categoryCopy.helpText.origin}</em> : null}
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
            {showsHeightCm ? (
              <label className={styles.formField}>
                <span>{categoryCopy.labels.heightCm}</span>
                <input name="heightCm" step="0.1" type="number" value={heightCm} onChange={(event) => setHeightCm(event.target.value)} />
                {categoryCopy.helpText.heightCm ? <em>{categoryCopy.helpText.heightCm}</em> : null}
                <em>{state.fieldErrors.heightCm}</em>
              </label>
            ) : null}
          </div>
          <label className={styles.formField}>
            <span>Weight (kg)</span>
            <input name="weightKg" step="0.01" type="number" value={weightKg} onChange={(event) => setWeightKg(event.target.value)} />
            <em>{state.fieldErrors.weightKg}</em>
          </label>
          {showsInsertIncluded ? (
            <>
              <label className={styles.checkboxRow}>
                <input
                  checked={insertIncluded}
                  type="checkbox"
                  onChange={(event) => setInsertIncluded(event.target.checked)}
                />
                <span>{categoryCopy.labels.insertIncluded}</span>
              </label>
              {categoryCopy.helpText.insertIncluded ? (
                <em>{categoryCopy.helpText.insertIncluded}</em>
              ) : null}
            </>
          ) : null}
          <label className={styles.formField}>
            <span>{categoryCopy.labels.ageClass}</span>
            <select name="ageClass" value={ageClass} onChange={(event) => setAgeClass(event.target.value)}>
              <option value="">Choose age class</option>
              {ageClassOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            {categoryCopy.helpText.ageClass ? <em>{categoryCopy.helpText.ageClass}</em> : null}
            <em>{state.fieldErrors.ageClass}</em>
          </label>
          <label className={styles.formField}>
            <span>{categoryCopy.labels.ageBasis}</span>
            <textarea name="ageBasis" placeholder={categoryCopy.placeholders.ageBasis} rows={3} value={ageBasis} onChange={(event) => setAgeBasis(event.target.value)} />
            {categoryCopy.helpText.ageBasis ? <em>{categoryCopy.helpText.ageBasis}</em> : null}
            <em>{state.fieldErrors.ageBasis}</em>
          </label>
        </section>

        <section className={styles.card}>
          <p className={styles.cardEyebrow}>Condition & provenance</p>
          {showsDecorSubtype ? (
            <label className={styles.formField}>
              <span>{categoryCopy.labels.decorSubtype}</span>
              <select
                name="decorSubtype"
                value={decorSubtype}
                onChange={(event) => setDecorSubtype(event.target.value)}
              >
                <option value="">Choose decor or antique</option>
                {productDecorSubtypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <em>
                {decorSubtype === antiqueDecorSubtype
                  ? "Antiques use the LH-A catalog series and need a marks note before publishing."
                  : "Decor pieces use the LH-D catalog series."}
              </em>
              {categoryCopy.helpText.decorSubtype ? <em>{categoryCopy.helpText.decorSubtype}</em> : null}
              <em>{state.fieldErrors.decorSubtype}</em>
            </label>
          ) : null}
          {showsObjectType ? (
            <label className={styles.formField}>
              <span>{categoryCopy.labels.objectType}</span>
              <input
                name="objectType"
                placeholder={categoryCopy.placeholders.objectType}
                type="text"
                value={objectType}
                onChange={(event) => setObjectType(event.target.value)}
              />
              {categoryCopy.helpText.objectType ? <em>{categoryCopy.helpText.objectType}</em> : null}
              <em>{state.fieldErrors.objectType}</em>
            </label>
          ) : null}
          <label className={styles.formField}>
            <span>{categoryCopy.labels.conditionNote}</span>
            <textarea name="conditionNote" placeholder={categoryCopy.placeholders.conditionNote} rows={5} value={conditionNote} onChange={(event) => setConditionNote(event.target.value)} />
            {categoryCopy.helpText.conditionNote ? <em>{categoryCopy.helpText.conditionNote}</em> : null}
            <em>{state.fieldErrors.conditionNote}</em>
          </label>
          <label className={styles.formField}>
            <span>{categoryCopy.labels.attributionRegion}</span>
            <input name="attributionRegion" placeholder={categoryCopy.placeholders.attributionRegion} type="text" value={attributionRegion} onChange={(event) => setAttributionRegion(event.target.value)} />
            {categoryCopy.helpText.attributionRegion ? <em>{categoryCopy.helpText.attributionRegion}</em> : null}
          </label>
          <label className={styles.formField}>
            <span>{categoryCopy.labels.attributionConfidence}</span>
            <select name="attributionConfidence" value={attributionConfidence} onChange={(event) => setAttributionConfidence(event.target.value)}>
              <option value="">Choose provenance label</option>
              {provenanceLabelOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            {categoryCopy.helpText.attributionConfidence ? <em>{categoryCopy.helpText.attributionConfidence}</em> : null}
            <em>{state.fieldErrors.attributionConfidence}</em>
          </label>
          <label className={styles.formField}>
            <span>{categoryCopy.labels.provenanceNote}</span>
            <textarea name="provenanceNote" placeholder={categoryCopy.placeholders.provenanceNote} rows={4} value={provenanceNote} onChange={(event) => setProvenanceNote(event.target.value)} />
            {categoryCopy.helpText.provenanceNote ? <em>{categoryCopy.helpText.provenanceNote}</em> : null}
            <em>{state.fieldErrors.provenanceNote}</em>
          </label>
          <label className={styles.formField}>
            <span>{categoryCopy.labels.sourcingNote}</span>
            <textarea name="sourcingNote" placeholder={categoryCopy.placeholders.sourcingNote} rows={5} value={sourcingNote} onChange={(event) => setSourcingNote(event.target.value)} />
            {categoryCopy.helpText.sourcingNote ? <em>{categoryCopy.helpText.sourcingNote}</em> : null}
            <em>{state.fieldErrors.sourcingNote}</em>
          </label>
          {showsMakerMarksNote ? (
            <label className={styles.formField}>
              <span>{categoryCopy.labels.makerMarksNote}</span>
              <textarea
                name="makerMarksNote"
                placeholder={categoryCopy.placeholders.makerMarksNote}
                rows={3}
                value={makerMarksNote}
                onChange={(event) => setMakerMarksNote(event.target.value)}
              />
              {categoryCopy.helpText.makerMarksNote ? <em>{categoryCopy.helpText.makerMarksNote}</em> : null}
              <em>{state.fieldErrors.makerMarksNote}</em>
            </label>
          ) : null}
          {showsFaceFabricSource ? (
            <label className={styles.formField}>
              <span>{categoryCopy.labels.faceFabricSource}</span>
              <select
                name="faceFabricSource"
                value={faceFabricSource}
                onChange={(event) => setFaceFabricSource(event.target.value)}
              >
                <option value="">Choose face fabric source</option>
                {productFaceFabricSourceOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {categoryCopy.helpText.faceFabricSource ? <em>{categoryCopy.helpText.faceFabricSource}</em> : null}
              <em>{state.fieldErrors.faceFabricSource}</em>
            </label>
          ) : null}
          {showsUniquenessTier ? (
            <label className={styles.formField}>
              <span>{categoryCopy.labels.uniquenessTier}</span>
              <select
                name="uniquenessTier"
                value={uniquenessTier}
                onChange={(event) => setUniquenessTier(event.target.value)}
              >
                <option value="">Choose uniqueness</option>
                {productUniquenessTierOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {categoryCopy.helpText.uniquenessTier ? <em>{categoryCopy.helpText.uniquenessTier}</em> : null}
              <em>{state.fieldErrors.uniquenessTier}</em>
            </label>
          ) : null}
          {showsUniquenessTier && uniquenessTier === cutFromOneRugUniquenessTier ? (
            <label className={styles.formField}>
              <span>{categoryCopy.labels.sourceCoverCount}</span>
              <input
                min="1"
                name="sourceCoverCount"
                type="number"
                value={sourceCoverCount}
                onChange={(event) => setSourceCoverCount(event.target.value)}
              />
              {categoryCopy.helpText.sourceCoverCount ? <em>{categoryCopy.helpText.sourceCoverCount}</em> : null}
              <em>{state.fieldErrors.sourceCoverCount}</em>
            </label>
          ) : null}
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
          <p className={styles.cardEyebrow}>Recommended product</p>
          <label className={styles.checkboxRow}>
            <input
              checked={homepageFeatured}
              type="checkbox"
              onChange={(event) => setHomepageFeatured(event.target.checked)}
            />
            <span>Show this product in recommendation blocks</span>
          </label>
          <em>
            Appears on the Contact and Trade Application pages. The homepage &quot;In the warehouse
            now&quot; grid is randomised from live inventory and is not affected by this setting.
          </em>
          <label className={styles.formField}>
            <span>Homepage rank</span>
            <input
              name="homepageRank"
              min="1"
              type="number"
              value={homepageRank}
              onChange={(event) => setHomepageRank(event.target.value)}
            />
            <em>Lower numbers appear first in recommendation blocks.</em>
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
                <CloudinaryUploadButton
                  onUploaded={(result) => applyImageUploadResult(image.id, result)}
                  slotId={image.id}
                  target={type}
                >
                  Upload image to this slot
                </CloudinaryUploadButton>
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

function formatFieldErrorLabel(field: string) {
  return field
    .replace(/([a-z])([A-Z])/gu, "$1 $2")
    .replace(/\.(\d+)\./gu, " $1 ")
    .replace(/^./u, (character) => character.toUpperCase());
}

function getCatalogNumberPlaceholder(
  category: AdminProductFormValues["category"],
  decorSubtype: string,
) {
  switch (category) {
    case "rugs": return "LH-R-0001";
    case "vintage": return "LH-R-0001";
    case "poufs": return "LH-P-0001";
    case "pillows": return "LH-X-0001";
    case "decor":
      return decorSubtype === antiqueDecorSubtype ? "LH-A-0001" : "LH-D-0001";
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
