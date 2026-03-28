import mongoose from "mongoose"

const notebookTemplateSettingSchema = new mongoose.Schema(
  {
    templateId: { type: String, required: true, unique: true, index: true },
    isEnabled: { type: Boolean, default: true, index: true },
    enabledAt: { type: Date, default: Date.now },
    disabledAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
)

export default mongoose.models.NotebookTemplateSetting ||
  mongoose.model("NotebookTemplateSetting", notebookTemplateSettingSchema)

