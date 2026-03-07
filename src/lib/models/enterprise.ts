import mongoose from 'mongoose';

// Team/Organization
export interface ITeam extends mongoose.Document {
  name: string;
  slug: string;
  ownerId: string;
  plan: 'team' | 'enterprise';
  settings: {
    allowInvites: boolean;
    requireApproval: boolean;
    ssoEnabled: boolean;
    ssoProvider?: string;
    customDomain?: string;
  };
  billing: {
    seats: number;
    usedSeats: number;
    billingEmail: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new mongoose.Schema<ITeam>({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  ownerId: {
    type: String,
    required: true,
    index: true,
  },
  plan: {
    type: String,
    enum: ['team', 'enterprise'],
    default: 'team',
  },
  settings: {
    allowInvites: {
      type: Boolean,
      default: true,
    },
    requireApproval: {
      type: Boolean,
      default: false,
    },
    ssoEnabled: {
      type: Boolean,
      default: false,
    },
    ssoProvider: String,
    customDomain: String,
  },
  billing: {
    seats: {
      type: Number,
      default: 5,
    },
    usedSeats: {
      type: Number,
      default: 1,
    },
    billingEmail: String,
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

export const Team = mongoose.models.Team || 
  mongoose.model<ITeam>('Team', TeamSchema);

// Team Member
export interface ITeamMember extends mongoose.Document {
  teamId: mongoose.Types.ObjectId;
  userId: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: string[];
  status: 'active' | 'invited' | 'suspended';
  invitedBy?: string;
  invitedAt?: Date;
  joinedAt?: Date;
}

const TeamMemberSchema = new mongoose.Schema<ITeamMember>({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Team',
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member', 'viewer'],
    default: 'member',
  },
  permissions: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ['active', 'invited', 'suspended'],
    default: 'invited',
  },
  invitedBy: String,
  invitedAt: Date,
  joinedAt: Date,
});

TeamMemberSchema.index({ teamId: 1, userId: 1 }, { unique: true });

export const TeamMember = mongoose.models.TeamMember || 
  mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema);

// SSO Configuration
export interface ISSOConfig extends mongoose.Document {
  teamId: mongoose.Types.ObjectId;
  provider: 'saml' | 'oauth' | 'oidc';
  enabled: boolean;
  config: {
    // SAML
    entryPoint?: string;
    issuer?: string;
    cert?: string;
    // OAuth/OIDC
    clientId?: string;
    clientSecret?: string;
    authorizationURL?: string;
    tokenURL?: string;
    userInfoURL?: string;
    scope?: string[];
  };
  attributeMapping: {
    email: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SSOConfigSchema = new mongoose.Schema<ISSOConfig>({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Team',
    unique: true,
    index: true,
  },
  provider: {
    type: String,
    enum: ['saml', 'oauth', 'oidc'],
    required: true,
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  attributeMapping: {
    email: {
      type: String,
      required: true,
    },
    firstName: String,
    lastName: String,
    displayName: String,
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

export const SSOConfig = mongoose.models.SSOConfig || 
  mongoose.model<ISSOConfig>('SSOConfig', SSOConfigSchema);

// Role-Based Access Control
export interface IRole extends mongoose.Document {
  teamId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  permissions: string[];
  isDefault: boolean;
  createdAt: Date;
}

const RoleSchema = new mongoose.Schema<IRole>({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Team',
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  permissions: [{
    type: String,
  }],
  isDefault: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

RoleSchema.index({ teamId: 1, name: 1 }, { unique: true });

export const Role = mongoose.models.Role || 
  mongoose.model<IRole>('Role', RoleSchema);
