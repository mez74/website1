import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  Eye,
  ArrowLeft,
  Save,
  ImagePlus,
  LogIn,
  Mail,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PropertyFormData {
  title: string;
  description: string;
  price: string;
  currency: "GBP" | "USD" | "EUR" | "AED";
  location: string;
  type: "house" | "apartment" | "villa" | "penthouse" | "land" | "commercial";
  bedrooms: string;
  bathrooms: string;
  plotSize: string;
  buildSize: string;
  status: "available" | "under_offer" | "sold" | "draft";
  agentReference: string;
  featured: boolean;
}



const defaultForm: PropertyFormData = {
  title: "",
  description: "",
  price: "",
  currency: "GBP",
  location: "",
  type: "house",
  bedrooms: "",
  bathrooms: "",
  plotSize: "",
  buildSize: "",
  status: "available",
  agentReference: "",
  featured: false,
};



// ─── Styles ───────────────────────────────────────────────────────────────────

const inputStyle = {
  background: "oklch(13% 0 0)",
  border: "1px solid oklch(22% 0.02 85)",
  color: "oklch(85% 0 0)",
  fontFamily: "'Josefin Sans', sans-serif",
  fontWeight: 300,
  fontSize: "0.82rem",
  letterSpacing: "0.04em",
  padding: "0.65rem 0.9rem",
  width: "100%",
  outline: "none",
  borderRadius: "2px",
};

const labelStyle = {
  color: "oklch(70% 0 0)",
  fontSize: "0.55rem",
  fontFamily: "'Josefin Sans', sans-serif",
  letterSpacing: "0.25em",
  textTransform: "uppercase" as const,
  display: "block",
  marginBottom: "0.4rem",
};

// ─── Image Uploader ───────────────────────────────────────────────────────────

function ImageUploader({
  propertyId,
  images,
  onRefresh,
}: {
  propertyId: number;
  images: { id: number; url: string; displayOrder?: number }[];
  onRefresh: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [sortedImages, setSortedImages] = useState(images);

  useEffect(() => {
    setSortedImages([...images].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)));
  }, [images]);

  const reorderMutation = trpc.admin.reorderImages.useMutation({
    onSuccess: () => {
      toast.success("Images reordered");
      onRefresh();
    },
    onError: () => toast.error("Reorder failed"),
  });

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedItem === null || draggedItem === targetIndex) return;

    const newImages = [...sortedImages];
    const [draggedImage] = newImages.splice(draggedItem, 1);
    newImages.splice(targetIndex, 0, draggedImage);

    setSortedImages(newImages);

    // Update display order in database
    const updates = newImages.map((img, idx) => ({
      imageId: img.id,
      displayOrder: idx,
    }));
    reorderMutation.mutate({ updates });
    setDraggedItem(null);
  };

  const uploadMutation = trpc.admin.uploadImage.useMutation({
    onSuccess: () => {
      toast.success("Image uploaded");
      onRefresh();
    },
    onError: () => toast.error("Upload failed"),
  });

  const deleteMutation = trpc.admin.deleteImage.useMutation({
    onSuccess: () => {
      toast.success("Image removed");
      onRefresh();
    },
    onError: () => toast.error("Failed to remove image"),
  });

  const validateImage = (file: File): { valid: boolean; error?: string } => {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: `${file.name} is too large (max 10MB)` };
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: `${file.name} has unsupported format. Use JPEG, PNG, WebP, or GIF` };
    }

    return { valid: true };
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    // Validate all files first
    const validationErrors: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;
      const validation = validateImage(file);
      if (!validation.valid) {
        validationErrors.push(validation.error || 'Unknown error');
      }
    }

    if (validationErrors.length > 0) {
      toast.error(validationErrors.join('; '));
      return;
    }

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;
      
      const reader = new FileReader();
      await new Promise<void>((resolve) => {
        reader.onerror = () => {
          toast.error(`Failed to read ${file.name}`);
          errorCount++;
          resolve();
        };
        
        reader.onload = async (e) => {
          try {
            const base64 = (e.target?.result as string).split(",")[1];
            if (!base64) {
              toast.error(`Failed to process ${file.name}`);
              errorCount++;
              resolve();
              return;
            }
            
            // Validate base64 data isn't corrupted
            if (base64.length < 100) {
              toast.error(`${file.name} appears to be corrupted`);
              errorCount++;
              resolve();
              return;
            }

            await uploadMutation.mutateAsync({
              propertyId,
              fileName: file.name,
              mimeType: file.type,
              base64Data: base64,
              displayOrder: images.length + i,
            });
            successCount++;
          } catch (err) {
            errorCount++;
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
    
    setUploading(false);
    if (successCount > 0) {
      toast.success(`${successCount} image(s) uploaded successfully`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} image(s) failed to upload`);
    }
  };

  return (
    <div>
      <label style={labelStyle}>Property Images</label>

      {/* Upload Zone */}
      <div
        className="relative mb-3"
        style={{
          border: "1px dashed oklch(30% 0.02 85)",
          padding: "1.5rem",
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color 0.2s",
        }}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <ImagePlus size={22} className="mx-auto mb-2" style={{ color: "oklch(75% 0 0)" }} />
        <p
          style={{
            color: "oklch(75% 0 0)",
            fontSize: "0.72rem",
            fontFamily: "'Josefin Sans', sans-serif",
            letterSpacing: "0.08em",
          }}
        >
          {uploading ? "Uploading..." : "Click or drag images here"}
        </p>
        <p style={{ color: "oklch(30% 0 0)", fontSize: "0.6rem", fontFamily: "'Josefin Sans', sans-serif", marginTop: "0.25rem" }}>
          Multiple images supported
        </p>
      </div>

      {/* Uploaded Images */}
      {sortedImages.length > 0 && (
        <div>
          <p style={{ color: "oklch(70% 0 0)", fontSize: "0.55rem", fontFamily: "'Josefin Sans', sans-serif", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Drag to reorder</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {sortedImages.map((img, index) => (
              <div
                key={img.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
                className="relative group overflow-hidden cursor-move transition-opacity"
                style={{
                  aspectRatio: "4/3",
                  opacity: draggedItem === index ? 0.5 : 1,
                  border: draggedItem === index ? "2px dashed oklch(70% 0.12 85)" : "none",
                }}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-1 left-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "oklch(8% 0 0 / 0.8)", color: "oklch(70% 0 0)", fontSize: "0.7rem" }}>
                  {index + 1}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteMutation.mutate({ imageId: img.id });
                  }}
                  className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "oklch(8% 0 0 / 0.8)", color: "oklch(70% 0.22 27)" }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Property Form Modal ──────────────────────────────────────────────────────

function PropertyFormModal({
  editId,
  initialData,
  initialImages,
  onClose,
  onSaved,
}: {
  editId?: number;
  initialData?: Partial<PropertyFormData>;
  initialImages?: { id: number; url: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<PropertyFormData>({ ...defaultForm, ...initialData });
  const [savedId, setSavedId] = useState<number | undefined>(editId);
  const [images, setImages] = useState<{ id: number; url: string }[]>(initialImages ?? []);
  const [queuedFiles, setQueuedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const utils = trpc.useUtils();

  const uploadMutation = trpc.admin.uploadImage.useMutation({
    onSuccess: () => {
      void utils.admin.listProperties.invalidate();
    },
    onError: () => toast.error("Image upload failed"),
  });

  const createMutation = trpc.admin.createProperty.useMutation({
    onSuccess: async (data) => {
      toast.success("Property created");
      void utils.admin.listProperties.invalidate();
      setSavedId(data.id);
      
      // Upload queued files if any
      if (queuedFiles.length > 0) {
        setUploading(true);
        for (let i = 0; i < queuedFiles.length; i++) {
          const file = queuedFiles[i];
          try {
            // Convert file to base64
            const reader = new FileReader();
            await new Promise<void>((resolve) => {
              reader.onload = async (e) => {
                const base64 = (e.target?.result as string).split(",")[1];
                if (!base64) { resolve(); return; }
                await uploadMutation.mutateAsync({
                  propertyId: data.id,
                  fileName: file.name,
                  mimeType: file.type,
                  base64Data: base64,
                  displayOrder: i,
                });
                resolve();
              };
              reader.readAsDataURL(file);
            });
          } catch (error) {
            console.error("Upload error:", error);
            toast.error(`Failed to upload ${file.name}`);
          }
        }
        setQueuedFiles([]);
        setUploading(false);
        toast.success("All images uploaded");
        // Refetch images
        const updated = await utils.admin.getProperty.fetch({ id: data.id });
        if (updated) setImages(updated.images);
      }
    },
    onError: () => toast.error("Failed to create property"),
  });

  const updateMutation = trpc.admin.updateProperty.useMutation({
    onSuccess: () => {
      toast.success("Property updated");
      void utils.admin.listProperties.invalidate();
      onSaved();
    },
    onError: () => toast.error("Failed to update property"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description || undefined,
      price: form.price ? parseFloat(form.price) : undefined,
      currency: form.currency,
      location: form.location || undefined,
      type: form.type,
      bedrooms: form.bedrooms ? parseInt(form.bedrooms) : undefined,
      bathrooms: form.bathrooms ? parseInt(form.bathrooms) : undefined,
      plotSize: form.plotSize || undefined,
      buildSize: form.buildSize || undefined,
      status: form.status,
      agentReference: form.agentReference || undefined,
      featured: form.featured,
    };

    if (savedId) {
      updateMutation.mutate({ id: savedId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
      style={{ background: "oklch(0% 0 0 / 0.85)" }}
    >
      <div
        className="w-full max-w-2xl"
        style={{
          background: "oklch(10% 0 0)",
          border: "1px solid oklch(22% 0.02 85)",
          borderRadius: "2px",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-7 py-5"
          style={{ borderBottom: "1px solid oklch(22% 0.02 85)" }}
        >
          <h2
            className="brand-heading"
            style={{ fontSize: "1rem", color: "oklch(95% 0.01 90)" }}
          >
            {savedId ? "Edit Property" : "Add New Property"}
          </h2>
          <button onClick={onClose} style={{ color: "oklch(70% 0 0)" }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            {/* Title */}
            <div className="sm:col-span-2">
              <label style={labelStyle}>Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                style={inputStyle}
                placeholder="Property title"
              />
            </div>

            {/* Location */}
            <div>
              <label style={labelStyle}>Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                style={inputStyle}
                placeholder="City, area, postcode"
              />
            </div>

            {/* Price & Currency */}
            <div>
              <label style={labelStyle}>Price</label>
              <div className="flex gap-2">
                <select
                  value={form.currency}
                  onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value as PropertyFormData["currency"] }))}
                  style={{ ...inputStyle, cursor: "pointer", flex: "0 0 100px" }}
                >
                  {["GBP", "USD", "EUR", "AED"].map((c) => (
                    <option key={c} value={c} style={{ background: "oklch(13% 0 0)" }}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="Leave blank for POA"
                />
              </div>
            </div>

            {/* Type */}
            <div>
              <label style={labelStyle}>Property Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as PropertyFormData["type"] }))}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                {["house", "apartment", "villa", "penthouse", "land", "commercial"].map((t) => (
                  <option key={t} value={t} style={{ background: "oklch(13% 0 0)" }}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label style={labelStyle}>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as PropertyFormData["status"] }))}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                {[
                  { value: "available", label: "Available" },
                  { value: "under_offer", label: "Under Offer" },
                  { value: "sold", label: "Sold" },
                  { value: "draft", label: "Draft (Hidden)" },
                ].map((s) => (
                  <option key={s.value} value={s.value} style={{ background: "oklch(13% 0 0)" }}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Agent Reference */}
            <div>
              <label style={labelStyle}>Agent Reference</label>
              <input
                type="text"
                value={form.agentReference}
                onChange={(e) => setForm((f) => ({ ...f, agentReference: e.target.value }))}
                style={inputStyle}
                placeholder="e.g., AG-12345"
              />
            </div>

            {/* Bedrooms */}
            <div>
              <label style={labelStyle}>Bedrooms</label>
              <input
                type="number"
                min="0"
                value={form.bedrooms}
                onChange={(e) => setForm((f) => ({ ...f, bedrooms: e.target.value }))}
                style={inputStyle}
                placeholder="0"
              />
            </div>

            {/* Bathrooms */}
            <div>
              <label style={labelStyle}>Bathrooms</label>
              <input
                type="number"
                min="0"
                value={form.bathrooms}
                onChange={(e) => setForm((f) => ({ ...f, bathrooms: e.target.value }))}
                style={inputStyle}
                placeholder="0"
              />
            </div>

            {/* Plot Size */}
            <div>
              <label style={labelStyle}>Plot Size</label>
              <input
                type="text"
                value={form.plotSize}
                onChange={(e) => setForm((f) => ({ ...f, plotSize: e.target.value }))}
                style={inputStyle}
                placeholder="e.g., 5,000 sq ft"
              />
            </div>

            {/* Build Size */}
            <div>
              <label style={labelStyle}>Build Size</label>
              <input
                type="text"
                value={form.buildSize}
                onChange={(e) => setForm((f) => ({ ...f, buildSize: e.target.value }))}
                style={inputStyle}
                placeholder="e.g., 3,500 sq ft"
              />
            </div>

            {/* Featured */}
            <div className="sm:col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                style={{ accentColor: "oklch(70% 0.12 85)", width: "16px", height: "16px" }}
              />
              <label
                htmlFor="featured"
                style={{
                  color: "oklch(60% 0 0)",
                  fontSize: "0.75rem",
                  fontFamily: "'Josefin Sans', sans-serif",
                  cursor: "pointer",
                }}
              >
                Feature this property on the homepage
              </label>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label style={labelStyle}>Description</label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                style={{ ...inputStyle, resize: "vertical" }}
                placeholder="Full property description..."
              />
            </div>

            {/* Images - Upload Zone (before creation) */}
            {!savedId && (
              <div className="sm:col-span-2">
                <label style={labelStyle}>Property Images</label>
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors"
                  style={{
                    borderColor: "oklch(35% 0.05 85)",
                    background: "oklch(8% 0 0)",
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = "oklch(70% 0.12 85)";
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.style.borderColor = "oklch(35% 0.05 85)";
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = "oklch(35% 0.05 85)";
                    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
                    setQueuedFiles((prev) => [...prev, ...files]);
                  }}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.currentTarget.files || []);
                      setQueuedFiles((prev) => [...prev, ...files]);
                    }}
                    style={{ display: "none" }}
                    id="image-input"
                  />
                  <label htmlFor="image-input" className="cursor-pointer block">
                    <ImagePlus size={24} className="mx-auto mb-2" style={{ color: "oklch(60% 0 0)" }} />
                    <p style={{ color: "oklch(60% 0 0)", fontSize: "0.8rem" }}>Drag images here or click to select</p>
                  </label>
                </div>
                {queuedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {queuedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded"
                        style={{ background: "oklch(12% 0 0)" }}
                      >
                        <span style={{ color: "oklch(70% 0 0)", fontSize: "0.75rem" }}>{file.name}</span>
                        <button
                          type="button"
                          onClick={() => setQueuedFiles((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-400"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Images (only after property is created) */}
          {savedId && (
            <div className="mb-6">
              <div className="gold-divider mb-5" />
              <ImageUploader
                propertyId={savedId}
                images={images}
                onRefresh={async () => {
                  // Refetch images
                  const updated = await utils.admin.getProperty.fetch({ id: savedId });
                  if (updated) setImages(updated.images);
                }}
              />
            </div>
          )}



          {/* Actions */}
          <div className="gold-divider mb-5" />
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline-gold px-5 py-2.5 text-xs"
            >
              Cancel
            </button>
            <button
              type={savedId && !editId ? "button" : "submit"}
              onClick={savedId && !editId ? onSaved : undefined}
              disabled={isPending || uploading}
              className="btn-gold px-6 py-2.5 text-xs flex items-center gap-2"
            >
              <Save size={13} />
              {uploading ? "Uploading images..." : isPending ? "Saving..." : savedId && !editId ? "Done" : savedId ? "Update Property" : "Create Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({
  propertyTitle,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  propertyTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "oklch(0% 0 0 / 0.85)" }}
    >
      <div
        className="w-full max-w-sm p-8"
        style={{
          background: "oklch(10% 0 0)",
          border: "1px solid oklch(55% 0.22 27 / 0.4)",
        }}
      >
        <h3
          className="brand-heading mb-3"
          style={{ fontSize: "1rem", color: "oklch(95% 0.01 90)" }}
        >
          Delete Property
        </h3>
        <p
          style={{
            color: "oklch(55% 0 0)",
            fontSize: "0.8rem",
            fontFamily: "'Josefin Sans', sans-serif",
            lineHeight: "1.7",
            marginBottom: "1.5rem",
          }}
        >
          Are you sure you want to delete{" "}
          <strong style={{ color: "oklch(80% 0 0)" }}>{propertyTitle}</strong>? This action
          cannot be undone and all images will be removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-outline-gold px-5 py-2.5 text-xs flex-1"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 text-xs flex-1"
            style={{
              background: "oklch(55% 0.22 27)",
              color: "oklch(95% 0 0)",
              fontFamily: "'Josefin Sans', sans-serif",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              border: "none",
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}// ─── Main Admin Page ─────────────────────────────────────────────────────────

type ContentTab = "properties" | "inquiries" | "property-inquiries";

export default function AdminPage() {
  const [, navigate] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<ContentTab>("properties");
  const [showForm, setShowForm] = useState(false);
  const [editProperty, setEditProperty] = useState<{
    id: number;
    data: Partial<PropertyFormData>;
    images: { id: number; url: string }[];
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);

  // Initialize all hooks first (before any conditional returns)
  const { data: properties, isLoading: loadingProps } = trpc.admin.listProperties.useQuery();
  const { data: inquiries, isLoading: loadingInquiries } = trpc.contact.listInquiries.useQuery();
  const { data: propertyInquiries, isLoading: loadingPropertyInquiries } = trpc.propertyInquiry.listInquiries.useQuery();
  const logoutMutation = trpc.adminAuth.logout.useMutation();
  const utils = trpc.useUtils();
  const deleteMutation = trpc.admin.deleteProperty.useMutation({
    onSuccess: () => {
      toast.success("Property deleted");
      setDeleteTarget(null);
      void utils.admin.listProperties.invalidate();
    },
    onError: () => toast.error("Failed to delete property"),
  });

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("admin_session");
      if (!token) {
        navigate("/staff-login", { replace: true });
        return;
      }

      // Token exists, user is authenticated
      setIsAuthenticated(true);
      setIsCheckingAuth(false);
      setLastActivity(Date.now());
    };

    checkAuth();
  }, [navigate]);

  // Inactivity timeout effect (10 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkInactivity = () => {
      const tenMinutesInMs = 10 * 60 * 1000;
      const timeSinceLastActivity = Date.now() - lastActivity;

      if (timeSinceLastActivity > tenMinutesInMs) {
        // Session expired due to inactivity
        localStorage.removeItem("admin_session");
        setIsAuthenticated(false);
        toast.error("Your session has expired due to inactivity. Please log in again.");
        navigate("/staff-login", { replace: true });
      }
    };

    // Check inactivity every minute
    const timeout = setInterval(checkInactivity, 60000);
    setSessionTimeout(timeout);

    return () => clearInterval(timeout);
  }, [isAuthenticated, lastActivity, navigate]);

  // Track user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleActivity = () => {
      setLastActivity(Date.now());
    };

    // Listen for user interactions
    document.addEventListener("click", handleActivity);
    document.addEventListener("keydown", handleActivity);
    document.addEventListener("mousemove", handleActivity);

    return () => {
      document.removeEventListener("click", handleActivity);
      document.removeEventListener("keydown", handleActivity);
      document.removeEventListener("mousemove", handleActivity);
    };
  }, [isAuthenticated]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (sessionTimeout) clearInterval(sessionTimeout);
    };
  }, [sessionTimeout]);

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(8% 0 0)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p style={{ color: "oklch(75% 0 0)" }}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(8% 0 0)" }}>
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold" style={{ color: "oklch(75% 0 0)" }}>Access Denied</h1>
          <p style={{ color: "oklch(60% 0 0)" }}>You need to log in to access the admin panel</p>
          <Link href="/staff-login" className="inline-block px-4 py-2 rounded" style={{ background: "oklch(50% 0.2 250)", color: "white" }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      localStorage.removeItem("admin_session");
      toast.success("Logged out successfully");
      navigate("/staff-login", { replace: true });
    } catch (error) {
      toast.error("Logout failed");
    }
  };



  // Public admin panel - no auth required (temporary workaround for OAuth issue)
  const statusColors: Record<string, string> = {
    available: "oklch(70% 0.12 85)",
    under_offer: "oklch(65% 0.15 55)",
    sold: "oklch(55% 0 0)",
    draft: "oklch(40% 0 0)",
  };

  return (
    <div className="min-h-screen" style={{ background: "oklch(8% 0 0)" }}>
      {/* Admin Header */}
      <header
        style={{
          background: "oklch(10% 0 0)",
          borderBottom: "1px solid oklch(22% 0.02 85)",
        }}
      >
        <div className="container py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="no-underline">
              <img
                src="/manus-storage/logov1_1b9a5dd0.webp"
                alt="Michael Mackenzie"
                className="rounded-full"
                style={{ width: "40px", height: "40px", objectFit: "cover" }}
              />
            </Link>
            <div>
              <div
                className="brand-heading"
                style={{ color: "oklch(70% 0.12 85)", fontSize: "0.85rem" }}
              >
                Admin Panel
              </div>
              <div
                className="brand-subheading"
                style={{ color: "oklch(35% 0 0)", fontSize: "0.5rem", letterSpacing: "0.2em" }}
              >
                Michael Mackenzie Property Investment
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="no-underline">
              <button className="btn-outline-gold px-4 py-2 text-xs flex items-center gap-1.5">
                <Eye size={12} />
                View Site
              </button>
            </Link>
            <span
              style={{
                color: "oklch(70% 0 0)",
                fontSize: "0.7rem",
                fontFamily: "'Josefin Sans', sans-serif",
              }}
            >
              Admin Panel
            </span>
          </div>
        </div>
      </header>

      <div className="container py-10">
        {/* Tab Navigation */}
        <div className="flex gap-6 mb-8 border-b border-oklch(22% 0.02 85)">
          {[
            { id: "properties", label: "Properties" },
            { id: "inquiries", label: "Inquiries" },
            { id: "property-inquiries", label: "Property Inquiries" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ContentTab)}
              style={{
                padding: "0.75rem 0",
                marginBottom: "-1px",
                borderBottom: activeTab === tab.id ? "2px solid oklch(70% 0.12 85)" : "none",
                color: activeTab === tab.id ? "oklch(70% 0.12 85)" : "oklch(45% 0 0)",
                fontSize: "0.8rem",
                fontFamily: "'Josefin Sans', sans-serif",
                letterSpacing: "0.05em",
                background: "none",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Page Title + Add Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="brand-heading mb-1"
              style={{ fontSize: "1.8rem", color: "oklch(95% 0.01 90)" }}
            >
              {activeTab === "properties" && "Properties"}
              {activeTab === "inquiries" && "Contact Inquiries"}
            </h1>
            <p
              style={{
                color: "oklch(75% 0 0)",
                fontSize: "0.7rem",
                fontFamily: "'Josefin Sans', sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              {activeTab === "properties" && `${properties?.length ?? 0} listing${(properties?.length ?? 0) !== 1 ? "s" : ""}`}
              {activeTab === "inquiries" && `${inquiries?.length ?? 0} inquiry${(inquiries?.length ?? 0) !== 1 ? "ies" : ""}`}
            </p>
          </div>
          <button
            onClick={() => {
              if (activeTab === "properties") setShowForm(true);
            }}
            className="btn-gold px-5 py-2.5 text-xs flex items-center gap-2"
          >
            <Plus size={14} />
            {activeTab === "properties" && "Add Property"}
          </button>
        </div>

        <div className="gold-divider mb-8" />

        {/* Properties Table - Only show when properties tab is active */}
        {activeTab === "properties" && (loadingProps ? (
          <div className="text-center py-16">
            <p style={{ color: "oklch(35% 0 0)", fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.8rem" }}>
              Loading properties...
            </p>
          </div>
        ) : properties && properties.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid oklch(22% 0.02 85)" }}>
                  {["Property", "Location", "Price", "Type", "Beds", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "left",
                        color: "oklch(75% 0 0)",
                        fontSize: "0.55rem",
                        fontFamily: "'Josefin Sans', sans-serif",
                        letterSpacing: "0.25em",
                        textTransform: "uppercase",
                        fontWeight: 400,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => {
                  const coverImg = p.images[0]?.url;
                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: "1px solid oklch(16% 0 0)",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "oklch(12% 0 0)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Property */}
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <div className="flex items-center gap-3">
                          <div
                            className="overflow-hidden flex-shrink-0"
                            style={{ width: "48px", height: "36px", background: "oklch(14% 0 0)" }}
                          >
                            {coverImg ? (
                              <img src={coverImg} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ color: "oklch(25% 0.02 85)", fontSize: "0.5rem" }}
                              >
                                MM
                              </div>
                            )}
                          </div>
                          <div>
                            <div
                              style={{
                                color: "oklch(85% 0 0)",
                                fontSize: "0.8rem",
                                fontFamily: "'Josefin Sans', sans-serif",
                                fontWeight: 400,
                                maxWidth: "180px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {p.title}
                            </div>
                            {p.featured === 1 && (
                              <span
                                style={{
                                  color: "oklch(70% 0.12 85)",
                                  fontSize: "0.5rem",
                                  fontFamily: "'Josefin Sans', sans-serif",
                                  letterSpacing: "0.15em",
                                }}
                              >
                                ★ FEATURED
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <span
                          style={{
                            color: "oklch(75% 0 0)",
                            fontSize: "0.75rem",
                            fontFamily: "'Josefin Sans', sans-serif",
                          }}
                        >
                          {p.location ?? "—"}
                        </span>
                      </td>

                      {/* Price */}
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <span
                          style={{
                            color: "oklch(70% 0.12 85)",
                            fontSize: "0.8rem",
                            fontFamily: "'Josefin Sans', sans-serif",
                            fontWeight: 400,
                          }}
                        >
                          {p.price
                            ? new Intl.NumberFormat("en-GB", {
                                style: "currency",
                                currency: p.currency || "GBP",
                                maximumFractionDigits: 0,
                              }).format(parseFloat(p.price))
                            : "POA"}
                        </span>
                      </td>

                      {/* Type */}
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <span
                          style={{
                            color: "oklch(75% 0 0)",
                            fontSize: "0.7rem",
                            fontFamily: "'Josefin Sans', sans-serif",
                            textTransform: "capitalize",
                          }}
                        >
                          {p.type}
                        </span>
                      </td>

                      {/* Beds */}
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <span
                          style={{
                            color: "oklch(75% 0 0)",
                            fontSize: "0.75rem",
                            fontFamily: "'Josefin Sans', sans-serif",
                          }}
                        >
                          {p.bedrooms ?? "—"}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <span
                          style={{
                            color: statusColors[p.status] ?? "oklch(50% 0 0)",
                            fontSize: "0.6rem",
                            fontFamily: "'Josefin Sans', sans-serif",
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                          }}
                        >
                          {p.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "0.9rem 1rem" }}>
                        <div className="flex items-center gap-2">
                          <Link href={`/properties/${p.id}`}>
                            <button
                              title="View"
                              style={{
                                color: "oklch(70% 0 0)",
                                padding: "0.35rem",
                                transition: "color 0.15s",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(70% 0.12 85)")}
                              onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(45% 0 0)")}
                            >
                              <Eye size={15} />
                            </button>
                          </Link>
                          <button
                            title="Edit"
                            onClick={() =>
                              setEditProperty({
                                id: p.id,
                                data: {
                                  title: p.title,
                                  description: p.description ?? "",
                                  price: p.price ?? "",
                                  location: p.location ?? "",
                                  type: p.type,
                                  bedrooms: p.bedrooms !== null ? String(p.bedrooms) : "",
                                  bathrooms: p.bathrooms !== null ? String(p.bathrooms) : "",
                                  status: p.status,
                                  featured: p.featured === 1,
                                  agentReference: p.agentReference ?? "",
                                  plotSize: p.plotSize !== null ? String(p.plotSize) : "",
                                  buildSize: p.buildSize !== null ? String(p.buildSize) : "",
                                  currency: p.currency ?? "GBP",
                                },
                                images: p.images,
                              })
                            }
                            style={{
                              color: "oklch(70% 0 0)",
                              padding: "0.35rem",
                              transition: "color 0.15s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(70% 0.12 85)")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(45% 0 0)")}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => setDeleteTarget({ id: p.id, title: p.title })}
                            style={{
                              color: "oklch(70% 0 0)",
                              padding: "0.35rem",
                              transition: "color 0.15s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(55% 0.22 27)")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(45% 0 0)")}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            className="text-center py-20 luxury-card"
            style={{ borderStyle: "dashed" }}
          >
            <Upload size={32} className="mx-auto mb-4" style={{ color: "oklch(28% 0.02 85)" }} />
            <h3
              className="brand-heading mb-3"
              style={{ color: "oklch(75% 0 0)", fontSize: "1rem" }}
            >
              No Properties Yet
            </h3>
            <p
              style={{
                color: "oklch(35% 0 0)",
                fontSize: "0.78rem",
                fontFamily: "'Josefin Sans', sans-serif",
                marginBottom: "1.5rem",
              }}
            >
              Add your first property to get started.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-gold px-6 py-3 text-xs flex items-center gap-2 mx-auto"
            >
              <Plus size={13} />
              Add First Property
            </button>
          </div>
        ))
        }

        {/* Inquiries Table - Only show when inquiries tab is active */}
        {activeTab === "inquiries" && (loadingInquiries ? (
          <div className="text-center py-16">
            <p style={{ color: "oklch(35% 0 0)", fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.8rem" }}>
              Loading inquiries...
            </p>
          </div>
        ) : inquiries && inquiries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid oklch(22% 0.02 85)" }}>
                  {["Name", "Email", "Phone", "Subject", "Status", "Date", "Actions"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "left",
                        color: "oklch(75% 0 0)",
                        fontSize: "0.55rem",
                        fontFamily: "'Josefin Sans', sans-serif",
                        letterSpacing: "0.25em",
                        textTransform: "uppercase",
                        fontWeight: 400,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inq) => (
                  <tr
                    key={inq.id}
                    style={{
                      borderBottom: "1px solid oklch(16% 0 0)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "oklch(12% 0 0)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Name */}
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <span style={{ color: "oklch(75% 0 0)", fontSize: "0.75rem", fontFamily: "'Josefin Sans', sans-serif" }}>
                        {inq.name}
                      </span>
                    </td>
                    {/* Email */}
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <span style={{ color: "oklch(75% 0 0)", fontSize: "0.75rem", fontFamily: "'Josefin Sans', sans-serif" }}>
                        {inq.email}
                      </span>
                    </td>
                    {/* Phone */}
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <span style={{ color: "oklch(75% 0 0)", fontSize: "0.75rem", fontFamily: "'Josefin Sans', sans-serif" }}>
                        {inq.phone || "—"}
                      </span>
                    </td>
                    {/* Subject */}
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <span style={{ color: "oklch(75% 0 0)", fontSize: "0.75rem", fontFamily: "'Josefin Sans', sans-serif" }}>
                        {inq.subject}
                      </span>
                    </td>
                    {/* Status */}
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <span
                        style={{
                          color: inq.status === "new" ? "oklch(70% 0.12 85)" : "oklch(75% 0 0)",
                          fontSize: "0.7rem",
                          fontFamily: "'Josefin Sans', sans-serif",
                          textTransform: "capitalize",
                          fontWeight: inq.status === "new" ? 600 : 400,
                        }}
                      >
                        {inq.status}
                      </span>
                    </td>
                    {/* Date */}
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <span style={{ color: "oklch(75% 0 0)", fontSize: "0.7rem", fontFamily: "'Josefin Sans', sans-serif" }}>
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    {/* Actions */}
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          title="View"
                          style={{
                            color: "oklch(70% 0 0)",
                            padding: "0.35rem",
                            transition: "color 0.15s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(70% 0.12 85)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(45% 0 0)")}
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            className="text-center py-20 luxury-card"
            style={{ borderStyle: "dashed" }}
          >
            <Mail size={32} className="mx-auto mb-4" style={{ color: "oklch(28% 0.02 85)" }} />
            <h3
              className="brand-heading mb-3"
              style={{ color: "oklch(75% 0 0)", fontSize: "1rem" }}
            >
              No Inquiries Yet
            </h3>
            <p
              style={{
                color: "oklch(35% 0 0)",
                fontSize: "0.78rem",
                fontFamily: "'Josefin Sans', sans-serif",
              }}
            >
              Contact inquiries will appear here.
            </p>
          </div>
        ))}

        {/* Property Inquiries Table */}
        {activeTab === "property-inquiries" && (loadingPropertyInquiries ? (
          <div className="text-center py-16">
            <p style={{ color: "oklch(35% 0 0)", fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.8rem" }}>
              Loading property inquiries...
            </p>
          </div>
        ) : propertyInquiries && propertyInquiries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid oklch(22% 0.02 85)" }}>
                  {["Name", "Email", "Phone", "Property ID", "Status", "Date", "Actions"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "left",
                        color: "oklch(75% 0 0)",
                        fontSize: "0.55rem",
                        fontFamily: "'Josefin Sans', sans-serif",
                        letterSpacing: "0.25em",
                        textTransform: "uppercase",
                        fontWeight: 400,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {propertyInquiries.map((inq: any) => (
                  <tr
                    key={inq.id}
                    style={{
                      borderBottom: "1px solid oklch(16% 0 0)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "oklch(12% 0 0)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <span style={{ color: "oklch(75% 0 0)", fontSize: "0.75rem", fontFamily: "'Josefin Sans', sans-serif" }}>
                        {inq.name}
                      </span>
                    </td>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <span style={{ color: "oklch(75% 0 0)", fontSize: "0.75rem", fontFamily: "'Josefin Sans', sans-serif" }}>
                        {inq.email}
                      </span>
                    </td>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <span style={{ color: "oklch(75% 0 0)", fontSize: "0.75rem", fontFamily: "'Josefin Sans', sans-serif" }}>
                        {inq.phone || "—"}
                      </span>
                    </td>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <span style={{ color: "oklch(75% 0 0)", fontSize: "0.75rem", fontFamily: "'Josefin Sans', sans-serif" }}>
                        #{inq.propertyId}
                      </span>
                    </td>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <span
                        style={{
                          color: inq.status === "new" ? "oklch(70% 0.12 85)" : "oklch(75% 0 0)",
                          fontSize: "0.7rem",
                          fontFamily: "'Josefin Sans', sans-serif",
                          textTransform: "capitalize",
                          fontWeight: inq.status === "new" ? 600 : 400,
                        }}
                      >
                        {inq.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <span style={{ color: "oklch(75% 0 0)", fontSize: "0.7rem", fontFamily: "'Josefin Sans', sans-serif" }}>
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          title="View"
                          style={{
                            color: "oklch(70% 0 0)",
                            padding: "0.35rem",
                            transition: "color 0.15s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(70% 0.12 85)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(45% 0 0)")}
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            className="text-center py-20 luxury-card"
            style={{ borderStyle: "dashed" }}
          >
            <Mail size={32} className="mx-auto mb-4" style={{ color: "oklch(28% 0.02 85)" }} />
            <h3
              className="brand-heading mb-3"
              style={{ color: "oklch(75% 0 0)", fontSize: "1rem" }}
            >
              No Property Inquiries Yet
            </h3>
            <p
              style={{
                color: "oklch(35% 0 0)",
                fontSize: "0.78rem",
                fontFamily: "'Josefin Sans', sans-serif",
              }}
            >
              Property inquiries will appear here when users register interest in properties.
            </p>
          </div>
        ))}

      </div>

      {/* Modals */}
      {showForm && (
        <PropertyFormModal
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            void utils.admin.listProperties.invalidate();
          }}
        />
      )}

      {editProperty && (
        <PropertyFormModal
          editId={editProperty.id}
          initialData={editProperty.data}
          initialImages={editProperty.images}
          onClose={() => setEditProperty(null)}
          onSaved={() => {
            setEditProperty(null);
            void utils.admin.listProperties.invalidate();
          }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          propertyTitle={deleteTarget.title}
          onConfirm={() => deleteMutation.mutate({ id: deleteTarget.id })}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
