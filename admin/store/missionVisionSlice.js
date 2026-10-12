import { createContentSlice } from "@/store/contentSliceFactory";
import { createContentThunks } from "@/store/contentThunks";

export const missionVisionThunks = createContentThunks("mission-vision");
export const {
  fetchAll: fetchMissionVisions,
  fetchById: fetchMissionVisionById,
  create: createMissionVision,
  update: updateMissionVision,
  remove: deleteMissionVision,
} = missionVisionThunks;

const missionVisionSlice = createContentSlice({
  name: "missionVision",
  thunks: missionVisionThunks,
});

export const {
  clearContentError: clearMissionVisionError,
  clearCurrentItem: clearCurrentMissionVision,
} = missionVisionSlice.actions;

export default missionVisionSlice.reducer;
