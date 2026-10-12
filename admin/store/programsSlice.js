import { createContentSlice } from "@/store/contentSliceFactory";
import { createContentThunks } from "@/store/contentThunks";

export const programThunks = createContentThunks("programs");
export const {
  fetchAll: fetchPrograms,
  fetchById: fetchProgramById,
  create: createProgram,
  update: updateProgram,
  remove: deleteProgram,
} = programThunks;
const programSlice = createContentSlice({ name: "programs", thunks: programThunks });
export const { clearContentError: clearProgramError, clearCurrentItem: clearCurrentProgram } = programSlice.actions;
export default programSlice.reducer;
