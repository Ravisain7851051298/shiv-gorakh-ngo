import { createContentSlice } from "@/store/contentSliceFactory";
import { createContentThunks } from "@/store/contentThunks";

export const campaignThunks = createContentThunks("campaigns");
export const {
  fetchAll: fetchCampaigns,
  fetchById: fetchCampaignById,
  create: createCampaign,
  update: updateCampaign,
  remove: deleteCampaign,
} = campaignThunks;
const campaignSlice = createContentSlice({ name: "campaigns", thunks: campaignThunks });
export const { clearContentError: clearCampaignError, clearCurrentItem: clearCurrentCampaign } = campaignSlice.actions;
export default campaignSlice.reducer;
