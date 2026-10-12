import { createContentSlice } from "@/store/contentSliceFactory";
import { createContentThunks } from "@/store/contentThunks";

export const certificateThunks = createContentThunks("certificates");
export const {
  fetchAll: fetchCertificates,
  fetchById: fetchCertificateById,
  create: createCertificate,
  update: updateCertificate,
  remove: deleteCertificate,
} = certificateThunks;
const certificateSlice = createContentSlice({ name: "certificates", thunks: certificateThunks });
export const { clearContentError: clearCertificateError, clearCurrentItem: clearCurrentCertificate } = certificateSlice.actions;
export default certificateSlice.reducer;
