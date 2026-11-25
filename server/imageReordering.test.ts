import { describe, it, expect } from "vitest";

describe("Image Reordering", () => {
  it("should sort images by displayOrder", () => {
    const images = [
      { id: 1, url: "img1.jpg", displayOrder: 2 },
      { id: 2, url: "img2.jpg", displayOrder: 0 },
      { id: 3, url: "img3.jpg", displayOrder: 1 },
    ];

    const sorted = [...images].sort((a, b) => a.displayOrder - b.displayOrder);

    expect(sorted[0].id).toBe(2);
    expect(sorted[1].id).toBe(3);
    expect(sorted[2].id).toBe(1);
  });

  it("should handle images with no displayOrder (default to 0)", () => {
    const images = [
      { id: 1, url: "img1.jpg", displayOrder: 1 },
      { id: 2, url: "img2.jpg" }, // no displayOrder
      { id: 3, url: "img3.jpg", displayOrder: 2 },
    ];

    const sorted = [...images].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

    expect(sorted[0].id).toBe(2); // defaults to 0
    expect(sorted[1].id).toBe(1);
    expect(sorted[2].id).toBe(3);
  });

  it("should generate correct reorder updates", () => {
    const images = [
      { id: 1, url: "img1.jpg" },
      { id: 2, url: "img2.jpg" },
      { id: 3, url: "img3.jpg" },
    ];

    const updates = images.map((img, idx) => ({
      imageId: img.id,
      displayOrder: idx,
    }));

    expect(updates).toEqual([
      { imageId: 1, displayOrder: 0 },
      { imageId: 2, displayOrder: 1 },
      { imageId: 3, displayOrder: 2 },
    ]);
  });

  it("should handle drag and drop reordering", () => {
    const images = [
      { id: 1, url: "img1.jpg", displayOrder: 0 },
      { id: 2, url: "img2.jpg", displayOrder: 1 },
      { id: 3, url: "img3.jpg", displayOrder: 2 },
    ];

    // Simulate dragging image at index 2 to index 0
    const draggedIndex = 2;
    const targetIndex = 0;

    const newImages = [...images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, draggedImage);

    expect(newImages[0].id).toBe(3);
    expect(newImages[1].id).toBe(1);
    expect(newImages[2].id).toBe(2);
  });
});
