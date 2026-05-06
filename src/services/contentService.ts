import type { SiteEvent } from "@/src/data/events";
import type { CustomContentSection, CustomTemplateAsset } from "@/src/store/useSiteContentStore";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";

export interface ContentService {
  listEvents: () => SiteEvent[];
  addEvent: (input: SiteEvent) => void;
  updateEvent: (id: string, patch: Partial<SiteEvent>) => void;
  removeEvent: (id: string) => void;
  listCustomSections: () => CustomContentSection[];
  addCustomSection: (input: CustomContentSection) => void;
  updateCustomSection: (id: string, patch: Partial<CustomContentSection>) => void;
  removeCustomSection: (id: string) => void;
  listTemplates: () => CustomTemplateAsset[];
  addTemplate: (input: CustomTemplateAsset) => void;
  updateTemplate: (id: string, patch: Partial<CustomTemplateAsset>) => void;
  removeTemplate: (id: string) => void;
}

export const localContentService: ContentService = {
  listEvents: () => useSiteContentStore.getState().events,
  addEvent: (input) => useSiteContentStore.getState().addEvent(input),
  updateEvent: (id, patch) => useSiteContentStore.getState().updateEvent(id, patch),
  removeEvent: (id) => useSiteContentStore.getState().removeEvent(id),
  listCustomSections: () => useSiteContentStore.getState().customSections,
  addCustomSection: (input) => useSiteContentStore.getState().addCustomSection(input),
  updateCustomSection: (id, patch) => useSiteContentStore.getState().updateCustomSection(id, patch),
  removeCustomSection: (id) => useSiteContentStore.getState().removeCustomSection(id),
  listTemplates: () => useSiteContentStore.getState().customTemplates,
  addTemplate: (input) => useSiteContentStore.getState().addTemplate(input),
  updateTemplate: (id, patch) => useSiteContentStore.getState().updateTemplate(id, patch),
  removeTemplate: (id) => useSiteContentStore.getState().removeTemplate(id),
};
