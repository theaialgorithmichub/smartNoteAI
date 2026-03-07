import mongoose from 'mongoose';

// White-Label Configuration
export interface IWhiteLabelConfig extends mongoose.Document {
  teamId: mongoose.Types.ObjectId;
  branding: {
    companyName: string;
    logo: {
      light: string;
      dark: string;
      favicon: string;
    };
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
  };
  domain: {
    custom: string;
    verified: boolean;
    sslEnabled: boolean;
  };
  emails: {
    fromName: string;
    fromEmail: string;
    replyTo: string;
    templates: {
      welcome: string;
      passwordReset: string;
      invitation: string;
    };
  };
  features: {
    removeBranding: boolean;
    customLoginPage: boolean;
    customDashboard: boolean;
    whiteLabel: boolean;
  };
  support: {
    email: string;
    phone?: string;
    website?: string;
    documentation?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const WhiteLabelConfigSchema = new mongoose.Schema<IWhiteLabelConfig>({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: 'Team',
    index: true,
  },
  branding: {
    companyName: {
      type: String,
      required: true,
    },
    logo: {
      light: String,
      dark: String,
      favicon: String,
    },
    colors: {
      primary: {
        type: String,
        default: '#3B82F6',
      },
      secondary: {
        type: String,
        default: '#8B5CF6',
      },
      accent: {
        type: String,
        default: '#EC4899',
      },
      background: {
        type: String,
        default: '#FFFFFF',
      },
      text: {
        type: String,
        default: '#1F2937',
      },
    },
    fonts: {
      heading: {
        type: String,
        default: 'Inter',
      },
      body: {
        type: String,
        default: 'Inter',
      },
    },
  },
  domain: {
    custom: String,
    verified: {
      type: Boolean,
      default: false,
    },
    sslEnabled: {
      type: Boolean,
      default: false,
    },
  },
  emails: {
    fromName: String,
    fromEmail: String,
    replyTo: String,
    templates: {
      welcome: String,
      passwordReset: String,
      invitation: String,
    },
  },
  features: {
    removeBranding: {
      type: Boolean,
      default: false,
    },
    customLoginPage: {
      type: Boolean,
      default: false,
    },
    customDashboard: {
      type: Boolean,
      default: false,
    },
    whiteLabel: {
      type: Boolean,
      default: false,
    },
  },
  support: {
    email: String,
    phone: String,
    website: String,
    documentation: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const WhiteLabelConfig = mongoose.models.WhiteLabelConfig || 
  mongoose.model<IWhiteLabelConfig>('WhiteLabelConfig', WhiteLabelConfigSchema);
