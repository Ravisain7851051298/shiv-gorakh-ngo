import { createContentSlice } from "@/store/contentSliceFactory";
import { createContentThunks } from "@/store/contentThunks";

export const galleryThunks = createContentThunks("galleries");
export const {
  fetchAll: fetchGalleries,
  fetchById: fetchGalleryById,
  create: createGallery,
  update: updateGallery,
  remove: deleteGallery,
} = galleryThunks;
const gallerySlice = createContentSlice({ name: "galleries", thunks: galleryThunks });
export const { clearContentError: clearGalleryError, clearCurrentItem: clearCurrentGallery } = gallerySlice.actions;
export default gallerySlice.reducer;
