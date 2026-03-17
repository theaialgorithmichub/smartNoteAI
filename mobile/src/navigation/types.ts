export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  SharedView: { shareId: string };
};

export type AuthStackParamList = {
  Landing: undefined;
  SignIn: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Templates: undefined;
  SearchTab: undefined;
  AccountTab: undefined;
};

export type DashboardStackParamList = {
  DashboardHome: undefined;
  NotebookViewer: { notebookId: string };
  Search: undefined;
  Trash: undefined;
  Workspaces: undefined;
  Analytics: undefined;
  Settings: undefined;
  Pricing: undefined;
  Marketplace: undefined;
  Friends: undefined;
  Notifications: undefined;
  CreateNotebook: { templateId?: string } | undefined;
  EditNotebook: { notebookId: string };
  SharedNotebooks: undefined;
  AIChat: { notebookId?: string };
};
