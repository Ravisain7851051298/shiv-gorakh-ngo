import { createContentSlice } from "@/store/contentSliceFactory";
import { createContentThunks } from "@/store/contentThunks";

export const serviceThunks = createContentThunks("services");
export const {
  fetchAll: fetchServices,
  fetchById: fetchServiceById,
  create: createService,
  update: updateService,
  remove: deleteService,
} = serviceThunks;
const serviceSlice = createContentSlice({ name: "services", thunks: serviceThunks });
export const { clearContentError: clearServiceError, clearCurrentItem: clearCurrentService } = serviceSlice.actions;
export default serviceSlice.reducer;
