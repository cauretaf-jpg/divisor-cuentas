console.info('Cuenta Clara V13.19 cargada');
const APP_VERSION = '13.19';
const BACKUP_SCHEMA_VERSION = 6;
const AUTO_IMPORT_BACKUP_KEY = 'cuenta-clara-auto-backup-before-import';
const GUEST_STORAGE_KEY = 'cuenta-clara-v1-state';
const AUTH_SESSION_KEY = 'cuenta-clara-auth-session';
const EXPERIENCE_MODE_KEY = 'cuenta-clara-experience-mode';
const APP_SECTION_KEY = 'cuenta-clara-active-section';
const ONBOARDING_DISMISSED_KEY = 'cuenta-clara-onboarding-dismissed';
const DEMO_BILL_IDS_KEY = 'cuenta-clara-demo-bill-ids';
const NOTIFICATION_SEEN_KEY_PREFIX = 'cuenta-clara-seen-notifications';
const SYSTEM_NOTIFICATIONS_KEY_PREFIX = 'cuenta-clara-system-notifications';
const SYSTEM_NOTIFICATION_SHOWN_KEY_PREFIX = 'cuenta-clara-system-notifications-shown';
const PUSH_SUBSCRIPTION_STATUS_KEY_PREFIX = 'cuenta-clara-push-subscription-status';
const PUSH_PUBLIC_VAPID_KEY = window.CUENTA_CLARA_PUBLIC_VAPID_KEY || '';
const PUSH_EDGE_FUNCTION_NAME = window.CUENTA_CLARA_PUSH_FUNCTION_NAME || 'send-shared-invite-push';
let activeStorageKey = GUEST_STORAGE_KEY;
let currentSession = { mode: 'guest', email: '', name: '', userId: '' };
let cloudSaveTimer = null;
let isCloudLoading = false;
let lastCloudSyncAt = null;
let cloudSyncStatus = 'local';
let cloudSyncErrorNotified = false;
let lastLocalSaveAt = null;
let currentAppSection = 'home';
let previousAppSection = 'home';
let sharedSaveTimer = null;
let sharedAccountsCache = [];
let sharedInvitesCache = [];
let sharedMembersCache = [];
let sharedUiBusy = false;
const THEME_KEY = 'cuenta-clara-theme';
let selectedTemplateKey = 'restaurant';
let templateSelectionTouched = false;
let accountWizardState = null;

const CATEGORIES = [
  'Comida',
  'Bebestibles',
  'Tragos',
  'Postres',
  'Transporte',
  'Arriendo',
  'Luz',
  'Agua',
  'Gas',
  'Internet',
  'Gastos comunes',
  'Supermercado',
  'Streaming',
  'Otros',
];

const DEFAULT_QUICK_PRODUCTS = [
  { name: 'Papas fritas', category: 'Comida' },
  { name: 'Bebida', category: 'Bebestibles' },
  { name: 'Cerveza', category: 'Tragos' },
  { name: 'Pizza', category: 'Comida' },
  { name: 'Mojito', category: 'Tragos' },
  { name: 'Postre', category: 'Postres' },
  { name: 'Luz', category: 'Luz' },
  { name: 'Agua', category: 'Agua' },
  { name: 'Internet', category: 'Internet' },
  { name: 'Supermercado', category: 'Supermercado' },
];

const dom = {
  headerMoreMenu: document.querySelector('#headerMoreMenu'),
  headerMorePanel: document.querySelector('#headerMorePanel'),
  themeToggle: document.querySelector('#themeToggle'),
  installAppButton: document.querySelector('#installAppButton'),
  authButton: document.querySelector('#authButton'),
  authStatusBadge: document.querySelector('#authStatusBadge'),
  syncStatusBadge: document.querySelector('#syncStatusBadge'),
  newBillButton: document.querySelector('#newBillButton'),
  accountWizard: document.querySelector('#accountWizard'),
  accountWizardEyebrow: document.querySelector('#accountWizardEyebrow'),
  accountWizardTitle: document.querySelector('#accountWizardTitle'),
  accountWizardSubtitle: document.querySelector('#accountWizardSubtitle'),
  accountWizardProgress: document.querySelector('#accountWizardProgress'),
  accountWizardBody: document.querySelector('#accountWizardBody'),
  accountWizardCancelButton: document.querySelector('#accountWizardCancelButton'),
  accountWizardCloseButton: document.querySelector('#accountWizardCloseButton'),
  accountWizardBackButton: document.querySelector('#accountWizardBackButton'),
  accountWizardNextButton: document.querySelector('#accountWizardNextButton'),
  duplicateBillButton: document.querySelector('#duplicateBillButton'),
  archiveBillButton: document.querySelector('#archiveBillButton'),
  closeBillButton: document.querySelector('#closeBillButton'),
  deleteBillButton: document.querySelector('#deleteBillButton'),
  billList: document.querySelector('#billList'),
  billNameInput: document.querySelector('#billNameInput'),
  billMeta: document.querySelector('#billMeta'),
  currentListName: document.querySelector('#currentListName'),
  currentListMeta: document.querySelector('#currentListMeta'),
  billModeSwitcherCard: document.querySelector('#billModeSwitcherCard'),
  billModeCurrentOutput: document.querySelector('#billModeCurrentOutput'),
  billModeChangeHelp: document.querySelector('#billModeChangeHelp'),
  billModeChoiceButtons: document.querySelectorAll('[data-bill-mode-choice]'),

  guidedStartCard: document.querySelector('#guidedStartCard'),
  guidedChoiceButtons: document.querySelectorAll('[data-guided-mode]'),
  createExampleBillButton: document.querySelector('#createExampleBillButton'),
  firstUseCard: document.querySelector('#firstUseCard'),
  startFirstBillButton: document.querySelector('#startFirstBillButton'),
  firstUseExampleButton: document.querySelector('#firstUseExampleButton'),
  dismissFirstUseButton: document.querySelector('#dismissFirstUseButton'),
  firstUseProgressOutput: document.querySelector('#firstUseProgressOutput'),
  firstUseNextActionOutput: document.querySelector('#firstUseNextActionOutput'),
  demoDataCard: document.querySelector('#demoDataCard'),
  demoDataStatusOutput: document.querySelector('#demoDataStatusOutput'),
  loadDemoDataButton: document.querySelector('#loadDemoDataButton'),
  clearDemoDataButton: document.querySelector('#clearDemoDataButton'),
  templateChoiceButtons: document.querySelectorAll('[data-template]'),
  templateChangeSelect: document.querySelector('#templateChangeSelect'),
  applyTemplateChangeButton: document.querySelector('#applyTemplateChangeButton'),
  templateAssistantPanel: document.querySelector('#templateAssistantPanel'),
  templateAssistantKicker: document.querySelector('#templateAssistantKicker'),
  templateAssistantTitle: document.querySelector('#templateAssistantTitle'),
  templateAssistantDescription: document.querySelector('#templateAssistantDescription'),
  templateAssistantMeta: document.querySelector('#templateAssistantMeta'),
  templateAssistantExamples: document.querySelector('#templateAssistantExamples'),
  templateAssistantStartButton: document.querySelector('#templateAssistantStartButton'),
  templateAssistantPeopleButton: document.querySelector('#templateAssistantPeopleButton'),
  templateActiveHelper: document.querySelector('#templateActiveHelper'),
  templateActiveKicker: document.querySelector('#templateActiveKicker'),
  templateActiveTitle: document.querySelector('#templateActiveTitle'),
  templateActiveHelp: document.querySelector('#templateActiveHelp'),
  templateActiveExamples: document.querySelector('#templateActiveExamples'),
  guideFocusButtons: document.querySelectorAll('[data-focus-target]'),
  guideShareButtons: document.querySelectorAll('[data-open-share]'),
  sectionNavButtons: document.querySelectorAll('[data-app-section]'),
  appSectionPanels: document.querySelectorAll('[data-app-section-panel]'),
  mobileScreenHeader: document.querySelector('#mobileScreenHeader'),
  mobileScreenTitle: document.querySelector('#mobileScreenTitle'),
  mobileScreenEyebrow: document.querySelector('#mobileScreenEyebrow'),
  mobileBackButton: document.querySelector('#mobileBackButton'),
  mobileHomeButton: document.querySelector('#mobileHomeButton'),
  guidedNextTitle: document.querySelector('#guidedNextTitle'),
  guidedNextHelp: document.querySelector('#guidedNextHelp'),
  smartActionButton: document.querySelector('#smartActionButton'),
  simpleModeButton: document.querySelector('#simpleModeButton'),
  advancedModeButton: document.querySelector('#advancedModeButton'),
  viewModeLabel: document.querySelector('#viewModeLabel'),
  viewModeHelp: document.querySelector('#viewModeHelp'),
  toggleAdvancedToolsButton: document.querySelector('#toggleAdvancedToolsButton'),
  restoreRecommendedViewButton: document.querySelector('#restoreRecommendedViewButton'),
  stepCreate: document.querySelector('#stepCreate'),
  stepPeople: document.querySelector('#stepPeople'),
  stepProducts: document.querySelector('#stepProducts'),
  stepReview: document.querySelector('#stepReview'),
  stepShare: document.querySelector('#stepShare'),
  homeGreetingOutput: document.querySelector('#homeGreetingOutput'),
  homeSummaryMetaOutput: document.querySelector('#homeSummaryMetaOutput'),
  homeDashboardSyncOutput: document.querySelector('#homeDashboardSyncOutput'),
  homeActiveBillOutput: document.querySelector('#homeActiveBillOutput'),
  homeActiveBillMetaOutput: document.querySelector('#homeActiveBillMetaOutput'),
  homeDashboardTotalOutput: document.querySelector('#homeDashboardTotalOutput'),
  homeDashboardMineOutput: document.querySelector('#homeDashboardMineOutput'),
  homeDashboardReceivableOutput: document.querySelector('#homeDashboardReceivableOutput'),
  homeDashboardPendingPeopleOutput: document.querySelector('#homeDashboardPendingPeopleOutput'),
  homeActionPanel: document.querySelector('#homeActionPanel'),
  homeActionSummaryOutput: document.querySelector('#homeActionSummaryOutput'),
  homeActionAmountOutput: document.querySelector('#homeActionAmountOutput'),
  homeActionList: document.querySelector('#homeActionList'),
  homeActionOpenPaymentsButton: document.querySelector('#homeActionOpenPaymentsButton'),
  notificationCenterButton: document.querySelector('#notificationCenterButton'),
  notificationHeaderBadge: document.querySelector('#notificationHeaderBadge'),
  homeNotificationPanel: document.querySelector('#homeNotificationPanel'),
  homeNotificationTitle: document.querySelector('#homeNotificationTitle'),
  homeNotificationText: document.querySelector('#homeNotificationText'),
  homeNotificationBadge: document.querySelector('#homeNotificationBadge'),
  homeNotificationList: document.querySelector('#homeNotificationList'),
  homeNotificationOpenButton: document.querySelector('#homeNotificationOpenButton'),
  homeNotificationMarkReadButton: document.querySelector('#homeNotificationMarkReadButton'),
  sharedNotificationSummary: document.querySelector('#sharedNotificationSummary'),
  sharedNotificationTitle: document.querySelector('#sharedNotificationTitle'),
  sharedNotificationText: document.querySelector('#sharedNotificationText'),
  sharedNotificationList: document.querySelector('#sharedNotificationList'),
  mobileNotificationBadge: document.querySelector('#mobileNotificationBadge'),
  connectionStatusPanel: document.querySelector('#connectionStatusPanel'),
  connectionStatusBadge: document.querySelector('#connectionStatusBadge'),
  connectionStatusHelp: document.querySelector('#connectionStatusHelp'),
  connectionSessionOutput: document.querySelector('#connectionSessionOutput'),
  connectionSyncOutput: document.querySelector('#connectionSyncOutput'),
  connectionRequestsOutput: document.querySelector('#connectionRequestsOutput'),
  connectionPushOutput: document.querySelector('#connectionPushOutput'),
  enablePushNotificationsButton: document.querySelector('#enablePushNotificationsButton'),
  testPushNotificationButton: document.querySelector('#testPushNotificationButton'),
  refreshConnectionStatusButton: document.querySelector('#refreshConnectionStatusButton'),
  pushSetupHelp: document.querySelector('#pushSetupHelp'),
  guidedFlowPanel: document.querySelector('#guidedFlowPanel'),
  guidedFlowStatus: document.querySelector('#guidedFlowStatus'),
  guidedFlowStatusText: document.querySelector('#guidedFlowStatusText'),
  guidedFlowBadge: document.querySelector('#guidedFlowBadge'),
  guidedFlowSteps: document.querySelector('#guidedFlowSteps'),
  guidedFlowMissingList: document.querySelector('#guidedFlowMissingList'),
  guidedFlowPrimaryButton: document.querySelector('#guidedFlowPrimaryButton'),
  guidedFlowSecondaryButton: document.querySelector('#guidedFlowSecondaryButton'),
  continueActiveBillButton: document.querySelector('#continueActiveBillButton'),
  homeNewBillButton: document.querySelector('#homeNewBillButton'),
  homeRecentBillsList: document.querySelector('#homeRecentBillsList'),
  homeRecurringPanel: document.querySelector('#homeRecurringPanel'),
  homeRecurringKicker: document.querySelector('#homeRecurringKicker'),
  homeRecurringTitle: document.querySelector('#homeRecurringTitle'),
  homeRecurringMeta: document.querySelector('#homeRecurringMeta'),
  homeRecurringAmount: document.querySelector('#homeRecurringAmount'),
  homeRecurringActionButton: document.querySelector('#homeRecurringActionButton'),
  homeRecurringOpenButton: document.querySelector('#homeRecurringOpenButton'),
  homeReminderPanel: document.querySelector('#homeReminderPanel'),
  homeReminderSummaryOutput: document.querySelector('#homeReminderSummaryOutput'),
  homeReminderAmountOutput: document.querySelector('#homeReminderAmountOutput'),
  homeReminderOverdueOutput: document.querySelector('#homeReminderOverdueOutput'),
  homeReminderSoonOutput: document.querySelector('#homeReminderSoonOutput'),
  homeReminderList: document.querySelector('#homeReminderList'),
  homeReminderOpenPaymentsButton: document.querySelector('#homeReminderOpenPaymentsButton'),

  historySearchInput: document.querySelector('#historySearchInput'),
  historyFilterSelect: document.querySelector('#historyFilterSelect'),
  historyTypeFilterSelect: document.querySelector('#historyTypeFilterSelect'),
  historySortSelect: document.querySelector('#historySortSelect'),
  exportBackupButton: document.querySelector('#exportBackupButton'),
  importBackupButton: document.querySelector('#importBackupButton'),
  backupFileInput: document.querySelector('#backupFileInput'),
  backupStatusOutput: document.querySelector('#backupStatusOutput'),
  backupSummaryGrid: document.querySelector('#backupSummaryGrid'),
  diagnosticStatusOutput: document.querySelector('#diagnosticStatusOutput'),
  diagnosticRefreshButton: document.querySelector('#diagnosticRefreshButton'),
  diagnosticCopyButton: document.querySelector('#diagnosticCopyButton'),
  restoreAutoBackupButton: document.querySelector('#restoreAutoBackupButton'),
  diagnosticList: document.querySelector('#diagnosticList'),

  personForm: document.querySelector('#personForm'),
  personNameInput: document.querySelector('#personNameInput'),
  personPhoneInput: document.querySelector('#personPhoneInput'),
  peopleList: document.querySelector('#peopleList'),
  selfParticipantCard: document.querySelector('#selfParticipantCard'),
  addMePersonButton: document.querySelector('#addMePersonButton'),
  addMePersonQuickButton: document.querySelector('#addMePersonQuickButton'),
  frequentPeoplePanel: document.querySelector('#frequentPeoplePanel'),
  frequentPeopleChips: document.querySelector('#frequentPeopleChips'),
  toggleFrequentPeopleButton: document.querySelector('#toggleFrequentPeopleButton'),
  markAllPaidButton: document.querySelector('#markAllPaidButton'),
  markAllPendingButton: document.querySelector('#markAllPendingButton'),
  openFriendsPickerButton: document.querySelector('#openFriendsPickerButton'),
  friendsPickerModal: document.querySelector('#friendsPickerModal'),
  closeFriendsPickerButton: document.querySelector('#closeFriendsPickerButton'),
  friendsPickerSearchInput: document.querySelector('#friendsPickerSearchInput'),
  clearFriendsPickerSearchButton: document.querySelector('#clearFriendsPickerSearchButton'),
  friendsPickerCountOutput: document.querySelector('#friendsPickerCountOutput'),
  friendsPickerList: document.querySelector('#friendsPickerList'),
  addSelectedFriendsButton: document.querySelector('#addSelectedFriendsButton'),

  tipCard: document.querySelector('#tipCard'),
  tipPercentInput: document.querySelector('#tipPercentInput'),
  quickTipButtons: document.querySelectorAll('[data-tip]'),
  clearProductsButton: document.querySelector('#clearProductsButton'),
  resetBillButton: document.querySelector('#resetBillButton'),

  payerSelect: document.querySelector('#payerSelect'),
  quickTotalPanel: document.querySelector('#quickTotalPanel'),
  quickTotalInput: document.querySelector('#quickTotalInput'),
  homePanel: document.querySelector('#homePanel'),
  homeMonthInput: document.querySelector('#homeMonthInput'),
  duplicateHomeMonthButton: document.querySelector('#duplicateHomeMonthButton'),

  createRecurringGroupButton: document.querySelector('#createRecurringGroupButton'),
  createNextRecurringMonthButton: document.querySelector('#createNextRecurringMonthButton'),
  createNextRecurringMonthButtonInline: document.querySelector('#createNextRecurringMonthButtonInline'),
  recurringGroupsList: document.querySelector('#recurringGroupsList'),
  recurringDashboardCard: document.querySelector('#recurringDashboardCard'),
  recurringDashboardTitle: document.querySelector('#recurringDashboardTitle'),
  recurringDashboardHelp: document.querySelector('#recurringDashboardHelp'),
  recurringCurrentMonthOutput: document.querySelector('#recurringCurrentMonthOutput'),
  recurringMonthsOutput: document.querySelector('#recurringMonthsOutput'),
  recurringCarryoverOutput: document.querySelector('#recurringCarryoverOutput'),
  recurringPendingOutput: document.querySelector('#recurringPendingOutput'),
  recurringActiveMonthTitle: document.querySelector('#recurringActiveMonthTitle'),
  recurringActiveMonthStatus: document.querySelector('#recurringActiveMonthStatus'),
  recurringCurrentPeopleList: document.querySelector('#recurringCurrentPeopleList'),
  recurringDebtList: document.querySelector('#recurringDebtList'),
  recurringFolderOverviewList: document.querySelector('#recurringFolderOverviewList'),
  recurringMonthHistoryList: document.querySelector('#recurringMonthHistoryList'),

  publishSharedAccountButton: document.querySelector('#publishSharedAccountButton'),
  inviteSharedUserButton: document.querySelector('#inviteSharedUserButton'),
  refreshSharedAccountsButton: document.querySelector('#refreshSharedAccountsButton'),
  sharedInviteSearchInput: document.querySelector('#sharedInviteSearchInput'),
  sharedInviteRoleSelect: document.querySelector('#sharedInviteRoleSelect'),
  sharedAccountStatus: document.querySelector('#sharedAccountStatus'),
  sharedAccessDashboard: document.querySelector('#sharedAccessDashboard'),
  sharedParticipantMapList: document.querySelector('#sharedParticipantMapList'),
  sharedInvitesList: document.querySelector('#sharedInvitesList'),
  sharedAccountsList: document.querySelector('#sharedAccountsList'),
  sharedMembersList: document.querySelector('#sharedMembersList'),
  sharedActivityList: document.querySelector('#sharedActivityList'),
  sharedReadOnlyBanner: document.querySelector('#sharedReadOnlyBanner'),
  networkStatusBanner: document.querySelector('#networkStatusBanner'),
  networkStatusTitle: document.querySelector('#networkStatusTitle'),
  networkStatusText: document.querySelector('#networkStatusText'),
  networkStatusPill: document.querySelector('#networkStatusPill'),

  productEditorCard: document.querySelector('#productEditorCard'),
  productListCard: document.querySelector('#productListCard'),
  productForm: document.querySelector('#productForm'),
  productFormTitle: document.querySelector('#productFormTitle'),
  productNameLabel: document.querySelector('#productNameLabel'),
  productNameInput: document.querySelector('#productNameInput'),
  productPriceInput: document.querySelector('#productPriceInput'),
  productQuantityInput: document.querySelector('#productQuantityInput'),
  productCategoryInput: document.querySelector('#productCategoryInput'),
  productSplitModeInput: document.querySelector('#productSplitModeInput'),
  splitModeHelp: document.querySelector('#splitModeHelp'),
  manualProductMethodButton: document.querySelector('#manualProductMethodButton'),
  receiptMethodButton: document.querySelector('#receiptMethodButton'),
  quickProductMethodButton: document.querySelector('#quickProductMethodButton'),
  quickTotalMethodButton: document.querySelector('#quickTotalMethodButton'),
  productDueDateInput: document.querySelector('#productDueDateInput'),
  productRecurringInput: document.querySelector('#productRecurringInput'),
  consumerPanelTitle: document.querySelector('#consumerPanelTitle'),
  consumerPanelHelp: document.querySelector('#consumerPanelHelp'),
  consumerSelectionSummary: document.querySelector('#consumerSelectionSummary'),
  consumerList: document.querySelector('#consumerList'),
  selectAllConsumersButton: document.querySelector('#selectAllConsumersButton'),
  clearConsumersButton: document.querySelector('#clearConsumersButton'),
  selectSelfConsumerButton: document.querySelector('#selectSelfConsumerButton'),
  equalSharesConsumerButton: document.querySelector('#equalSharesConsumerButton'),
  customSharesConsumerButton: document.querySelector('#customSharesConsumerButton'),
  cancelEditProductButton: document.querySelector('#cancelEditProductButton'),
  productSubmitButton: document.querySelector('#productSubmitButton'),
  receiptModal: document.querySelector('#receiptModal'),
  closeReceiptModalButton: document.querySelector('#closeReceiptModalButton'),
  receiptFileInput: document.querySelector('#receiptFileInput'),
  receiptPreviewWrap: document.querySelector('#receiptPreviewWrap'),
  receiptPreviewImage: document.querySelector('#receiptPreviewImage'),
  processReceiptButton: document.querySelector('#processReceiptButton'),
  clearReceiptButton: document.querySelector('#clearReceiptButton'),
  receiptStatus: document.querySelector('#receiptStatus'),
  receiptDetectedBody: document.querySelector('#receiptDetectedBody'),
  receiptRawTextInput: document.querySelector('#receiptRawTextInput'),
  receiptSelectionSummary: document.querySelector('#receiptSelectionSummary'),
  receiptDetectedTotalOutput: document.querySelector('#receiptDetectedTotalOutput'),
  receiptSelectedTotalOutput: document.querySelector('#receiptSelectedTotalOutput'),
  receiptBillTotalOutput: document.querySelector('#receiptBillTotalOutput'),
  receiptDifferenceOutput: document.querySelector('#receiptDifferenceOutput'),
  receiptTipDetectedOutput: document.querySelector('#receiptTipDetectedOutput'),
  receiptZeroWarningOutput: document.querySelector('#receiptZeroWarningOutput'),
  receiptAuditWarning: document.querySelector('#receiptAuditWarning'),
  receiptAuditWarningText: document.querySelector('#receiptAuditWarningText'),
  addMissingReceiptDifferenceButton: document.querySelector('#addMissingReceiptDifferenceButton'),
  receiptContinueDespiteMismatchButton: document.querySelector('#receiptContinueDespiteMismatchButton'),
  reparseReceiptTextButton: document.querySelector('#reparseReceiptTextButton'),
  receiptDetectedCount: document.querySelector('#receiptDetectedCount'),
  editReceiptTotalButton: document.querySelector('#editReceiptTotalButton'),
  selectValidReceiptItemsButton: document.querySelector('#selectValidReceiptItemsButton'),
  focusReceiptIssuesButton: document.querySelector('#focusReceiptIssuesButton'),
  receiptReviewHintOutput: document.querySelector('#receiptReviewHintOutput'),
  selectAllReceiptItemsButton: document.querySelector('#selectAllReceiptItemsButton'),
  unselectAllReceiptItemsButton: document.querySelector('#unselectAllReceiptItemsButton'),
  ignoreZeroReceiptItemsButton: document.querySelector('#ignoreZeroReceiptItemsButton'),
  addManualReceiptItemButton: document.querySelector('#addManualReceiptItemButton'),
  addReceiptItemsButton: document.querySelector('#addReceiptItemsButton'),
  toggleQuickProductsEditorButton: document.querySelector('#toggleQuickProductsEditorButton'),
  quickProductsList: document.querySelector('#quickProductsList'),
  quickProductsEditor: document.querySelector('#quickProductsEditor'),
  quickProductForm: document.querySelector('#quickProductForm'),
  quickProductNameInput: document.querySelector('#quickProductNameInput'),
  quickProductCategoryInput: document.querySelector('#quickProductCategoryInput'),
  quickProductsManager: document.querySelector('#quickProductsManager'),
  productSearchInput: document.querySelector('#productSearchInput'),
  productFilterSelect: document.querySelector('#productFilterSelect'),
  categoryTotals: document.querySelector('#categoryTotals'),
  productListTitle: document.querySelector('#productListTitle'),
  homeDashboardCard: document.querySelector('#homeDashboardCard'),
  homeRecurringOutput: document.querySelector('#homeRecurringOutput'),
  homeUpcomingOutput: document.querySelector('#homeUpcomingOutput'),
  homeOverdueOutput: document.querySelector('#homeOverdueOutput'),
  homeDueList: document.querySelector('#homeDueList'),
  productList: document.querySelector('#productList'),

  accountStatus: document.querySelector('#accountStatus'),
  accountReviewPanel: document.querySelector('#accountReviewPanel'),
  accountReviewStatus: document.querySelector('#accountReviewStatus'),
  accountReviewList: document.querySelector('#accountReviewList'),
  accountReviewPrimaryButton: document.querySelector('#accountReviewPrimaryButton'),
  subtotalOutput: document.querySelector('#subtotalOutput'),
  tipOutput: document.querySelector('#tipOutput'),
  grandTotalOutput: document.querySelector('#grandTotalOutput'),
  sidebarGrandTotalOutput: document.querySelector('#sidebarGrandTotalOutput'),
  paidTotalOutput: document.querySelector('#paidTotalOutput'),
  pendingTotalOutput: document.querySelector('#pendingTotalOutput'),
  receiptSummaryCard: document.querySelector('#receiptSummaryCard'),
  receiptSummaryState: document.querySelector('#receiptSummaryState'),
  receiptBillNameOutput: document.querySelector('#receiptBillNameOutput'),
  receiptGrandTotalOutput: document.querySelector('#receiptGrandTotalOutput'),
  receiptPayerOutput: document.querySelector('#receiptPayerOutput'),
  receiptPeopleOutput: document.querySelector('#receiptPeopleOutput'),
  receiptPaidPeopleOutput: document.querySelector('#receiptPaidPeopleOutput'),
  receiptPendingOutput: document.querySelector('#receiptPendingOutput'),
  receiptDateOutput: document.querySelector('#receiptDateOutput'),
  receiptNextStepOutput: document.querySelector('#receiptNextStepOutput'),
  receiptTransferPreviewList: document.querySelector('#receiptTransferPreviewList'),
  copyReceiptSummaryButton: document.querySelector('#copyReceiptSummaryButton'),
  whatsappReceiptSummaryButton: document.querySelector('#whatsappReceiptSummaryButton'),
  generateReceiptImageButton: document.querySelector('#generateReceiptImageButton'),
  openPaymentsFromReceiptButton: document.querySelector('#openPaymentsFromReceiptButton'),
  personResults: document.querySelector('#personResults'),
  profilePayerSummary: document.querySelector('#profilePayerSummary'),
  profilePayerTitle: document.querySelector('#profilePayerTitle'),
  profilePayerHelp: document.querySelector('#profilePayerHelp'),
  profilePayerPaidOutput: document.querySelector('#profilePayerPaidOutput'),
  profilePayerOwnOutput: document.querySelector('#profilePayerOwnOutput'),
  profilePayerReceivableOutput: document.querySelector('#profilePayerReceivableOutput'),
  profilePayerDebtorsList: document.querySelector('#profilePayerDebtorsList'),
  paymentPendingTotalOutput: document.querySelector('#paymentPendingTotalOutput'),
  paymentPaidTotalOutput: document.querySelector('#paymentPaidTotalOutput'),
  paymentPendingPeopleOutput: document.querySelector('#paymentPendingPeopleOutput'),
  paymentActionCenter: document.querySelector('#paymentActionCenter'),
  paymentActionTotalOutput: document.querySelector('#paymentActionTotalOutput'),
  paymentActionCountOutput: document.querySelector('#paymentActionCountOutput'),
  paymentActionFilterSelect: document.querySelector('#paymentActionFilterSelect'),
  paymentActionRefreshButton: document.querySelector('#paymentActionRefreshButton'),
  paymentActionList: document.querySelector('#paymentActionList'),
  paymentReminderPanel: document.querySelector('#paymentReminderPanel'),
  paymentReminderStatusOutput: document.querySelector('#paymentReminderStatusOutput'),
  paymentDueDateInput: document.querySelector('#paymentDueDateInput'),
  setPaymentDueDateButton: document.querySelector('#setPaymentDueDateButton'),
  clearPaymentDueDateButton: document.querySelector('#clearPaymentDueDateButton'),
  whatsappNotificationsToggle: document.querySelector('#whatsappNotificationsToggle'),
  whatsappNotificationStatusOutput: document.querySelector('#whatsappNotificationStatusOutput'),
  whatsappNotificationHelpOutput: document.querySelector('#whatsappNotificationHelpOutput'),
  prepareWhatsappNotificationsButton: document.querySelector('#prepareWhatsappNotificationsButton'),
  transferList: document.querySelector('#transferList'),
  transferCard: document.querySelector('#transferCard'),

  copySummaryButton: document.querySelector('#copySummaryButton'),
  whatsappButton: document.querySelector('#whatsappButton'),
  shareButton: document.querySelector('#shareButton'),
  shareLinkButton: document.querySelector('#shareLinkButton'),
  exportExcelButton: document.querySelector('#exportExcelButton'),

  mobileTotalOutput: document.querySelector('#mobileTotalOutput'),
  mobileAddProductButton: document.querySelector('#mobileAddProductButton'),
  mobileShareButton: document.querySelector('#mobileShareButton'),

  authModal: document.querySelector('#authModal'),
  closeAuthModalButton: document.querySelector('#closeAuthModalButton'),
  authSessionPanel: document.querySelector('#authSessionPanel'),
  authFormsPanel: document.querySelector('#authFormsPanel'),
  authSessionTitle: document.querySelector('#authSessionTitle'),
  authSessionDescription: document.querySelector('#authSessionDescription'),
  showLoginButton: document.querySelector('#showLoginButton'),
  showRegisterButton: document.querySelector('#showRegisterButton'),
  loginForm: document.querySelector('#loginForm'),
  registerForm: document.querySelector('#registerForm'),
  loginEmailInput: document.querySelector('#loginEmailInput'),
  loginPasswordInput: document.querySelector('#loginPasswordInput'),
  registerNameInput: document.querySelector('#registerNameInput'),
  registerEmailInput: document.querySelector('#registerEmailInput'),
  registerPasswordInput: document.querySelector('#registerPasswordInput'),
  importGuestDataCheckbox: document.querySelector('#importGuestDataCheckbox'),
  continueGuestButton: document.querySelector('#continueGuestButton'),
  switchToGuestButton: document.querySelector('#switchToGuestButton'),
  logoutButton: document.querySelector('#logoutButton'),
  profileAvatar: document.querySelector('#profileAvatar'),
  profileTabs: document.querySelectorAll('[data-profile-tab]'),
  profilePanel: document.querySelector('#profilePanel'),
  profileStatsPanel: document.querySelector('#profileStatsPanel'),
  profileSettingsPanel: document.querySelector('#profileSettingsPanel'),
  profileNickInput: document.querySelector('#profileNickInput'),
  profileNameInput: document.querySelector('#profileNameInput'),
  profilePhoneInput: document.querySelector('#profilePhoneInput'),
  profileEmailInput: document.querySelector('#profileEmailInput'),
  profileCurrencyInput: document.querySelector('#profileCurrencyInput'),
  profileThemePreferenceInput: document.querySelector('#profileThemePreferenceInput'),
  saveProfileButton: document.querySelector('#saveProfileButton'),
  savePreferencesButton: document.querySelector('#savePreferencesButton'),
  syncNowButton: document.querySelector('#syncNowButton'),
  statTotalBills: document.querySelector('#statTotalBills'),
  statActiveBills: document.querySelector('#statActiveBills'),
  statHistoricalTotal: document.querySelector('#statHistoricalTotal'),
  statAverageBill: document.querySelector('#statAverageBill'),
  statPendingToPay: document.querySelector('#statPendingToPay'),
  statPendingToCollect: document.querySelector('#statPendingToCollect'),
  statClosedArchivedBills: document.querySelector('#statClosedArchivedBills'),
  statPeopleCount: document.querySelector('#statPeopleCount'),
  statProductCount: document.querySelector('#statProductCount'),
  statHomeBills: document.querySelector('#statHomeBills'),
  statOutingBills: document.querySelector('#statOutingBills'),
  statTopCategories: document.querySelector('#statTopCategories'),
  statTopPeople: document.querySelector('#statTopPeople'),
  statPendingPeople: document.querySelector('#statPendingPeople'),
  profileOweList: document.querySelector('#profileOweList'),
  profileOwedList: document.querySelector('#profileOwedList'),
  statLastActivity: document.querySelector('#statLastActivity'),

  shareModal: document.querySelector('#shareModal'),
  closeShareModalButton: document.querySelector('#closeShareModalButton'),
  sharePreviewType: document.querySelector('#sharePreviewType'),
  textPreview: document.querySelector('#textPreview'),
  imagePreviewWrap: document.querySelector('#imagePreviewWrap'),
  shareCanvas: document.querySelector('#shareCanvas'),
  copySelectedShareButton: document.querySelector('#copySelectedShareButton'),
  whatsappSelectedShareButton: document.querySelector('#whatsappSelectedShareButton'),
  downloadImageButton: document.querySelector('#downloadImageButton'),
  nativeShareImageButton: document.querySelector('#nativeShareImageButton'),

  noticeTab: document.querySelector('#noticeTab'),
  noticeTitle: document.querySelector('#noticeTitle'),
  noticeMessage: document.querySelector('#noticeMessage'),
  closeNoticeTabButton: document.querySelector('#closeNoticeTabButton'),
  toast: document.querySelector('#toast'),
  emptyStateTemplate: document.querySelector('#emptyStateTemplate'),
};

let state = {
  bills: [],
  activeBillId: null,
  quickProducts: [],
  profile: {},
  appSettings: {},
};

let editingProductId = null;
let receiptSelectedFile = null;
let receiptDetectedItems = [];
let receiptDetectedMeta = { receiptTotal: 0, tip: 0, grandTotal: 0, hasLineTotalColumns: false };
let receiptMismatchAccepted = false;
let friendsPickerItems = [];
let frequentPeopleExpanded = false;
let toastTimer = null;
let noticeTimer = null;
let deferredInstallPrompt = null;
let lastUndoAction = null;

function createId(prefix = 'id') {
  return window.CuentaClaraUtils.createId(prefix);
}

function nowIso() {
  return window.CuentaClaraUtils.nowIso();
}

function formatCurrency(value) {
  return window.CuentaClaraUtils.formatCurrency(value);
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function formatDate(iso) {
  if (!iso) return '';

  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso));
}



function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}


function hasSupabaseClient() {
  return typeof supabaseClient !== 'undefined' && Boolean(supabaseClient?.auth);
}

function getCloudSyncErrorMessage(error) {
  const code = String(error?.code || '').trim();
  const rawMessage = String(error?.message || error?.details || error?.hint || error || '').trim();
  const message = rawMessage.toLowerCase();

  if (code === '42P01' || message.includes('app_states') || message.includes('does not exist') || message.includes('relation')) {
    return 'La sincronización en la nube todavía no está configurada. Tus cambios quedaron guardados en este dispositivo.';
  }

  if (code === '42501' || message.includes('row-level security') || message.includes('permission denied') || message.includes('policy')) {
    return 'La nube no permitió guardar los cambios en este momento. Tus datos quedaron protegidos en este dispositivo.';
  }

  if (message.includes('jwt') || message.includes('not authenticated') || message.includes('auth')) {
    return 'Tu sesión no está activa. Vuelve a ingresar y presiona Guardar ahora.';
  }

  return 'Los cambios siguen guardados en este dispositivo. Revisa tu conexión o vuelve a intentar más tarde.';
}

function notifyCloudSyncError(title, error) {
  console.error(error);
  setSyncStatus('error', 'Guardado solo en este dispositivo');

  if (!cloudSyncErrorNotified) {
    showNotice(title, getCloudSyncErrorMessage(error));
    cloudSyncErrorNotified = true;
  }
}



function getUserStorageKey(identifier) {
  return window.CuentaClaraUtils.getUserStorageKey(identifier);
}

function setGuestSession() {
  currentSession = { mode: 'guest', email: '', name: '', userId: '' };
  activeStorageKey = GUEST_STORAGE_KEY;
  clearTimeout(cloudSaveTimer);
}

function setUserSession(user) {
  const name = user?.user_metadata?.nick || user?.user_metadata?.nombre || user?.email || 'Usuario';

  currentSession = {
    mode: 'user',
    email: user?.email || '',
    name,
    userId: user?.id || '',
  };

  activeStorageKey = getUserStorageKey(currentSession.userId || currentSession.email);
}

function saveAuthSession() {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(currentSession));
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
  setGuestSession();
}

async function initializeAuthSession() {
  if (!hasSupabaseClient()) {
    setGuestSession();
    return;
  }

  const { data, error } = await supabaseClient.auth.getSession();

  if (error || !data?.session?.user) {
    setGuestSession();
    return;
  }

  setUserSession(data.session.user);
  saveAuthSession();
}

async function loadAuthSession() {
  await initializeAuthSession();
}

async function saveCloudStateNow(options = {}) {
  const force = Boolean(options.force);

  if (!hasSupabaseClient() || currentSession.mode !== 'user' || !currentSession.userId) {
    return false;
  }

  if (isCloudLoading && !force) {
    return false;
  }

  try {
    state = normalizeState(state);

    try {
      localStorage.setItem(activeStorageKey, JSON.stringify(state));
    } catch (storageError) {
      console.warn('No se pudo actualizar la copia del dispositivo antes de sincronizar:', storageError);
    }

    setSyncStatus('saving', options.message || 'Guardando...');

    const { error } = await supabaseClient
      .from('app_states')
      .upsert({
        user_id: currentSession.userId,
        state,
        updated_at: nowIso(),
      }, { onConflict: 'user_id' });

    if (error) {
      notifyCloudSyncError('No se pudo guardar en la nube', error);
      return false;
    }

    cloudSyncErrorNotified = false;
    await savePublicProfileFromMain();
    lastCloudSyncAt = nowIso();
    setSyncStatus('saved', getCloudSavedText());
    renderAuthUI();
    return true;
  } catch (error) {
    notifyCloudSyncError('Error de sincronización', error);
    return false;
  }
}

function scheduleCloudSave() {
  if (currentSession.mode !== 'user' || !currentSession.userId || isCloudLoading) {
    return;
  }

  setSyncStatus('saving', 'Guardando...');
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(() => {
    saveCloudStateNow({ silent: true }).catch((error) => {
      notifyCloudSyncError('Error de sincronización', error);
    });
  }, 180);
}

async function loadCloudState() {
  if (!hasSupabaseClient() || currentSession.mode !== 'user' || !currentSession.userId) {
    return false;
  }

  isCloudLoading = true;

  try {
    setSyncStatus('saving', 'Cargando datos...');

    const { data, error } = await supabaseClient
      .from('app_states')
      .select('state, updated_at')
      .eq('user_id', currentSession.userId)
      .maybeSingle();

    if (error) {
      notifyCloudSyncError('No se pudo cargar la nube', error);
      return false;
    }

    if (data?.state) {
      state = normalizeState(data.state);
      localStorage.setItem(activeStorageKey, JSON.stringify(state));
      lastCloudSyncAt = data.updated_at || nowIso();
      cloudSyncErrorNotified = false;
      setSyncStatus('saved', getCloudSavedText());
      return true;
    }

    const localSaved = localStorage.getItem(activeStorageKey);
    const guestSaved = localStorage.getItem(GUEST_STORAGE_KEY);
    const fallbackState = localSaved || guestSaved;
    state = normalizeState(fallbackState ? JSON.parse(fallbackState) : state);
    localStorage.setItem(activeStorageKey, JSON.stringify(state));

    isCloudLoading = false;
    await saveCloudStateNow({ force: true, message: 'Guardando respaldo...' });
    return true;
  } catch (error) {
    notifyCloudSyncError('Error de sincronización', error);
    return false;
  } finally {
    isCloudLoading = false;
  }
}



function setProfileTab(tabName = 'profile') {
  const panels = {
    profile: dom.profilePanel,
    stats: dom.profileStatsPanel,
    settings: dom.profileSettingsPanel,
  };

  Object.entries(panels).forEach(([key, panel]) => {
    panel?.classList.toggle('hidden', key !== tabName);
  });

  dom.profileTabs?.forEach((button) => {
    button.classList.toggle('active', button.dataset.profileTab === tabName);
  });
}

function renderMiniRanking(container, entries, emptyText) {
  if (!container) {
    return;
  }

  container.innerHTML = '';

  if (!entries.length) {
    const empty = document.createElement('p');
    empty.className = 'helper-text';
    empty.textContent = emptyText;
    container.appendChild(empty);
    return;
  }

  entries.slice(0, 5).forEach(([label, value]) => {
    const row = document.createElement('div');
    row.className = 'mini-ranking-row';
    row.innerHTML = `
      <span>${escapeHtml(label)}</span>
      <strong>${value}</strong>
    `;
    container.appendChild(row);
  });
}

function getUsageStats() {
  const bills = Array.isArray(state.bills) ? state.bills : [];
  const stats = {
    totalBills: bills.length,
    activeBills: bills.filter((bill) => !bill.archived).length,
    archivedBills: bills.filter((bill) => bill.archived).length,
    closedBills: bills.filter((bill) => bill.closed && !bill.archived).length,
    historicalTotal: 0,
    averageBill: 0,
    peopleCount: 0,
    productCount: 0,
    homeBills: 0,
    outingBills: 0,
    topCategories: new Map(),
    topPeople: new Map(),
    lastActivity: null,
  };

  for (const bill of bills) {
    const calculation = calculateBill(bill);
    stats.historicalTotal += calculation.grandTotal || 0;
    stats.peopleCount += Array.isArray(bill.people) ? bill.people.length : 0;
    stats.productCount += Array.isArray(bill.products) ? bill.products.length : 0;

    if (bill.mode === 'home') {
      stats.homeBills += 1;
    } else {
      stats.outingBills += 1;
    }

    for (const [category, total] of Object.entries(calculation.categoryTotals || {})) {
      if (total > 0) {
        stats.topCategories.set(category, (stats.topCategories.get(category) || 0) + Math.round(total));
      }
    }

    for (const person of bill.people || []) {
      const key = person.name || 'Persona';
      stats.topPeople.set(key, (stats.topPeople.get(key) || 0) + 1);
    }

    const activity = bill.updatedAt || bill.createdAt;
    if (activity && (!stats.lastActivity || new Date(activity) > new Date(stats.lastActivity))) {
      stats.lastActivity = activity;
    }
  }

  stats.averageBill = stats.totalBills > 0 ? stats.historicalTotal / stats.totalBills : 0;
  stats.topCategories = [...stats.topCategories.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => [label, formatCurrency(value)]);
  stats.topPeople = [...stats.topPeople.entries()].sort((a, b) => b[1] - a[1]);

  return stats;
}

function getBillPendingTransferItems(bill) {
  const calculation = calculateBill(bill);
  const payer = bill.people.find((person) => person.id === bill.payerId);

  if (!payer) {
    return [];
  }

  return bill.people
    .filter((person) => person.id !== payer.id)
    .map((person) => ({
      billId: bill.id,
      billName: bill.name || 'Cuenta sin nombre',
      payer,
      person,
      amount: calculation.finalTotals[person.id] || 0,
      status: getBillStatus(bill),
      updatedAt: bill.updatedAt || bill.createdAt,
    }))
    .filter((item) => item.amount > 0 && !item.person.paid);
}

function getProfileDebtOverview() {
  const selfInfo = getSelfParticipantInfo();
  const result = {
    owe: [],
    owed: [],
    pendingByPerson: [],
  };

  if (!selfInfo || !Array.isArray(state?.bills)) {
    return result;
  }

  const grouped = new Map();

  for (const bill of state.bills) {
    if (bill.archived || !Array.isArray(bill.people) || bill.people.length === 0) {
      continue;
    }

    const selfPerson = findSelfPerson(bill, selfInfo);
    const payer = bill.people.find((person) => person.id === bill.payerId);

    if (!selfPerson || !payer) {
      continue;
    }

    const transfers = getBillPendingTransferItems(bill);

    if (selfPerson.id === payer.id) {
      for (const item of transfers) {
        result.owed.push({
          ...item,
          direction: 'owed',
          title: `${item.person.name} te debe`,
          subtitle: item.billName,
        });
      }
    } else {
      const mine = transfers.find((item) => item.person.id === selfPerson.id);
      if (mine) {
        result.owe.push({
          ...mine,
          direction: 'owe',
          title: `Le debes a ${payer.name}`,
          subtitle: mine.billName,
        });
      }
    }
  }

  for (const item of [...result.owe, ...result.owed]) {
    const key = item.direction === 'owed' ? item.person.name : item.payer.name;
    const current = grouped.get(key) || { label: key, amount: 0, count: 0, billId: item.billId, direction: item.direction };
    current.amount += item.amount;
    current.count += 1;
    grouped.set(key, current);
  }

  result.owe.sort((a, b) => b.amount - a.amount);
  result.owed.sort((a, b) => b.amount - a.amount);
  result.pendingByPerson = [...grouped.values()].sort((a, b) => b.amount - a.amount);
  return result;
}

function getPaymentActionEntries(filter = 'current') {
  const selfInfo = getSelfParticipantInfo();
  const activeBillId = state?.activeBillId || '';
  const bills = Array.isArray(state?.bills) ? state.bills : [];
  const entries = [];

  for (const bill of bills) {
    if (!bill || bill.archived || !Array.isArray(bill.people)) continue;
    if (filter === 'current' && bill.id !== activeBillId) continue;

    const payer = bill.people.find((person) => person.id === bill.payerId);
    if (!payer) continue;

    const calculation = calculateBill(bill);
    const selfPerson = findSelfPerson(bill, selfInfo);

    for (const person of bill.people) {
      if (person.id === payer.id || person.paid) continue;
      const amount = calculation.finalTotals[person.id] || 0;
      if (amount <= 0) continue;

      const direction = selfPerson && selfPerson.id === payer.id
        ? 'owed'
        : selfPerson && selfPerson.id === person.id
          ? 'owe'
          : 'other';

      const dueStatus = getPaymentDueStatus(bill);
      const previousDebt = bill.mode === 'home' ? Math.max(0, Number(person.previousDebt || 0)) : 0;

      if (filter === 'mine' && direction === 'other') continue;
      if (filter === 'owed' && direction !== 'owed') continue;
      if (filter === 'owe' && direction !== 'owe') continue;
      if (filter === 'overdue' && !['danger', 'warning'].includes(dueStatus?.className)) continue;
      if (filter === 'carryover' && previousDebt <= 0) continue;

      entries.push({
        billId: bill.id,
        billName: bill.name || 'Cuenta sin nombre',
        billMode: bill.mode,
        billDueAt: bill.paymentDueAt || '',
        billUpdatedAt: bill.updatedAt || bill.createdAt || '',
        person,
        payer,
        amount,
        previousDebt,
        currentMonthAmount: Math.max(0, amount - previousDebt),
        direction,
        dueStatus,
        label: direction === 'owed'
          ? `${person.name} te debe`
          : direction === 'owe'
            ? `Le debes a ${payer.name}`
            : `${person.name} debe transferir`,
        subtitle: `${bill.name || 'Cuenta sin nombre'} · ${getBillModeLabel(bill.mode)}`,
      });
    }
  }

  return entries.sort((a, b) => {
    const dangerA = a.dueStatus?.className === 'danger' ? 0 : a.dueStatus?.className === 'warning' ? 1 : 2;
    const dangerB = b.dueStatus?.className === 'danger' ? 0 : b.dueStatus?.className === 'warning' ? 1 : 2;
    if (dangerA !== dangerB) return dangerA - dangerB;
    return b.amount - a.amount;
  });
}

function setPersonPaidStatusInBill(billId, personId, paid) {
  const bill = state?.bills?.find((item) => item.id === billId);
  const person = bill?.people?.find((item) => item.id === personId);

  if (!bill || !person) {
    showToast('No encontré ese pago.');
    return;
  }

  const nextPaid = Boolean(paid);
  if (person.paid === nextPaid) return;

  const undoSnapshot = captureUndoSnapshot(nextPaid ? 'Marcar pagado' : 'Marcar pendiente');
  person.paid = nextPaid;
  bill.updatedAt = nowIso();
  addBillActivity(`${person.name} quedó como ${nextPaid ? 'pagado' : 'pendiente'}.`, 'payment', bill);
  saveState();
  render();
  showUndoToast(nextPaid ? `${person.name}: pago registrado.` : `${person.name}: vuelve a pendiente.`, undoSnapshot);
}

function openBillForPaymentAction(billId, section = 'payments') {
  const bill = state?.bills?.find((item) => item.id === billId);
  if (!bill) {
    showToast('No encontré esa cuenta.');
    return;
  }

  state.activeBillId = bill.id;
  editingProductId = null;
  saveState();
  render();
  setAppSection(section, { scroll: false });
}

function buildPaymentActionMessage(entry, bill, person, payer) {
  if (entry.direction === 'owe') {
    return [
      `Hola ${payer.name}, te aviso que tengo pendiente *${formatCurrency(entry.amount)}* de la cuenta *${bill.name || 'Cuenta Clara'}*.`,
      bill.mode === 'home' && bill.homeMonth ? `Mes: *${bill.homeMonth}*` : '',
      bill.paymentDueAt ? `Fecha límite sugerida: *${bill.paymentDueAt}*` : '',
      '',
      'Lo revisaré para dejarlo pagado.',
    ].filter(Boolean).join('\n');
  }

  return buildPaymentReminderMessage(person, payer, entry.amount, bill);
}

function getPaymentActionRecipient(entry, person, payer) {
  return entry.direction === 'owe' ? payer : person;
}

function sendPaymentActionWhatsapp(entry) {
  const bill = state?.bills?.find((item) => item.id === entry.billId);
  const person = bill?.people?.find((item) => item.id === entry.person.id);
  const payer = bill?.people?.find((item) => item.id === entry.payer.id);

  if (!bill || !person || !payer) {
    showToast('No encontré los datos para enviar el recordatorio.');
    return;
  }

  const recipient = getPaymentActionRecipient(entry, person, payer);
  const phone = normalizePhoneNumber(recipient.phone);
  if (!phone) {
    showNotice('Teléfono faltante', `Agrega un WhatsApp a ${recipient.name} para enviar el mensaje directo.`);
    return;
  }

  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(buildPaymentActionMessage(entry, bill, person, payer))}`, '_blank', 'noopener,noreferrer');
}

async function copyPaymentActionReminder(entry) {
  const bill = state?.bills?.find((item) => item.id === entry.billId);
  const person = bill?.people?.find((item) => item.id === entry.person.id);
  const payer = bill?.people?.find((item) => item.id === entry.payer.id);

  if (!bill || !person || !payer) {
    showToast('No encontré los datos para copiar el recordatorio.');
    return;
  }

  const text = buildPaymentActionMessage(entry, bill, person, payer);
  try {
    await navigator.clipboard.writeText(text);
    showToast('Mensaje copiado.');
  } catch {
    prompt('Copia el mensaje:', text);
  }
}

function renderPaymentActionRows(container, entries, { limit = 8, compact = false } = {}) {
  if (!container) return;
  container.innerHTML = '';

  if (!entries.length) {
    container.appendChild(emptyMessage(compact ? 'No hay acciones pendientes ahora.' : 'No hay pagos pendientes con este filtro.'));
    return;
  }

  for (const entry of entries.slice(0, limit)) {
    const row = document.createElement('div');
    row.className = `payment-action-row is-${entry.direction}`;
    const recipient = entry.direction === 'owe' ? entry.payer : entry.person;
    const hasPhone = Boolean(normalizePhoneNumber(recipient.phone));
    const dueText = entry.billDueAt ? ` · ${entry.dueStatus.label}` : '';
    const previousDebt = Math.max(0, Number(entry.previousDebt || 0));
    const carryoverText = previousDebt > 0
      ? ` · arrastre ${formatCurrency(previousDebt)} + mes actual ${formatCurrency(entry.currentMonthAmount || Math.max(0, entry.amount - previousDebt))}`
      : '';
    row.innerHTML = `
      <div class="payment-action-main">
        <strong>${escapeHtml(entry.label)}</strong>
        <small>${escapeHtml(entry.subtitle)}${escapeHtml(dueText)}${escapeHtml(carryoverText)}</small>
      </div>
      <strong class="payment-action-amount">${formatCurrency(entry.amount)}</strong>
      <div class="payment-action-buttons">
        <button class="btn btn-light btn-small" data-action="open" type="button">Ver cuenta</button>
        <button class="btn btn-light btn-small" data-action="copy" type="button">Copiar</button>
        <button class="btn btn-primary btn-small" data-action="whatsapp" type="button" ${hasPhone ? '' : 'disabled'}>WhatsApp</button>
        <button class="btn btn-light btn-small" data-action="paid" type="button">Marcar pagado</button>
      </div>
    `;

    row.querySelector('[data-action="open"]')?.addEventListener('click', () => openBillForPaymentAction(entry.billId, 'payments'));
    row.querySelector('[data-action="copy"]')?.addEventListener('click', () => copyPaymentActionReminder(entry));
    row.querySelector('[data-action="whatsapp"]')?.addEventListener('click', () => sendPaymentActionWhatsapp(entry));
    row.querySelector('[data-action="paid"]')?.addEventListener('click', () => setPersonPaidStatusInBill(entry.billId, entry.person.id, true));

    container.appendChild(row);
  }
}

function getAccountReviewItems(bill = getActiveBill()) {
  const calculation = calculateBill(bill);
  const items = [];
  const hasPeople = bill.people.length > 0;
  const hasAmounts = calculation.grandTotal > 0;
  const payer = bill.people.find((person) => person.id === bill.payerId);

  if (!hasPeople) {
    items.push({ level: 'danger', title: 'Faltan personas', text: 'Agrega al menos una persona antes de compartir.', section: 'people' });
  }

  if (!hasAmounts) {
    items.push({ level: 'danger', title: 'Faltan gastos', text: 'Agrega productos, una boleta o un monto rápido.', section: 'expenses' });
  }

  if (hasPeople && !payer) {
    items.push({ level: 'warning', title: 'Falta pagador principal', text: 'Selecciona quién recibirá las transferencias.', section: 'people' });
  }

  const peopleWithoutAmount = bill.people.filter((person) => (calculation.finalTotals[person.id] || 0) <= 0);
  if (hasAmounts && peopleWithoutAmount.length > 0) {
    items.push({
      level: 'info',
      title: 'Personas sin monto asignado',
      text: `${peopleWithoutAmount.slice(0, 3).map((person) => person.name).join(', ')}${peopleWithoutAmount.length > 3 ? '…' : ''} no tiene consumo registrado.`,
      section: 'expenses',
    });
  }

  const productsWithoutConsumers = bill.mode !== 'quick'
    ? bill.products.filter((product) => !Array.isArray(product.consumers) || product.consumers.length === 0)
    : [];
  if (productsWithoutConsumers.length > 0) {
    items.push({ level: 'danger', title: 'Gastos sin consumidores', text: 'Hay productos que no están asignados a nadie.', section: 'expenses' });
  }

  const duplicateNames = new Map();
  for (const person of bill.people) {
    const key = String(person.name || '').trim().toLowerCase();
    if (!key) continue;
    duplicateNames.set(key, (duplicateNames.get(key) || 0) + 1);
  }
  const repeated = [...duplicateNames.entries()].filter(([, count]) => count > 1);
  if (repeated.length > 0) {
    items.push({ level: 'warning', title: 'Nombres repetidos', text: 'Revisa personas duplicadas para evitar cobros mal asignados.', section: 'people' });
  }

  const pendingPeople = bill.people.filter((person) => !person.paid && (calculation.finalTotals[person.id] || 0) > 0).length;
  if (pendingPeople > 0) {
    items.push({ level: 'info', title: 'Pagos pendientes', text: `Faltan ${pendingPeople} persona${pendingPeople === 1 ? '' : 's'} por marcar como pagada${pendingPeople === 1 ? '' : 's'}.`, section: 'payments' });
  }

  if (bill.mode === 'home') {
    const overdue = bill.products.filter((product) => {
      if (!product.dueDate) return false;
      const dueDate = new Date(`${product.dueDate}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dueDate < today;
    }).length;
    if (overdue > 0) {
      items.push({ level: 'warning', title: 'Vencimientos atrasados', text: `${overdue} gasto${overdue === 1 ? '' : 's'} del hogar aparece${overdue === 1 ? '' : 'n'} vencido${overdue === 1 ? '' : 's'}.`, section: 'recurring' });
    }
  }

  return items;
}

function renderAccountReviewPanel() {
  if (!dom.accountReviewPanel || !dom.accountReviewList) return;

  const items = getAccountReviewItems();
  const blocking = items.filter((item) => item.level === 'danger');
  const warnings = items.filter((item) => item.level === 'warning');

  dom.accountReviewList.innerHTML = '';
  dom.accountReviewPanel.classList.toggle('is-ready', items.length === 0);
  dom.accountReviewPanel.classList.toggle('has-danger', blocking.length > 0);

  if (!items.length) {
    dom.accountReviewStatus.textContent = 'Lista para compartir';
    dom.accountReviewStatus.className = 'account-review-status is-ready';
    dom.accountReviewList.appendChild(emptyMessage('La cuenta no tiene alertas relevantes. Puedes compartirla o cerrarla con confianza.'));
    dom.accountReviewPrimaryButton.textContent = 'Compartir comprobante';
    dom.accountReviewPrimaryButton.onclick = openShareModal;
    return;
  }

  dom.accountReviewStatus.textContent = blocking.length > 0 ? 'Requiere corrección' : warnings.length > 0 ? 'Revisar' : 'Pendiente menor';
  dom.accountReviewStatus.className = `account-review-status ${blocking.length > 0 ? 'is-danger' : warnings.length > 0 ? 'is-warning' : 'is-info'}`;

  for (const item of items) {
    const row = document.createElement('button');
    row.className = `account-review-row is-${item.level}`;
    row.type = 'button';
    row.innerHTML = `
      <span>
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.text)}</small>
      </span>
      <em>Resolver</em>
    `;
    row.addEventListener('click', () => setAppSection(item.section || 'summary', { scroll: false }));
    dom.accountReviewList.appendChild(row);
  }

  const primary = items[0];
  dom.accountReviewPrimaryButton.textContent = 'Resolver pendiente';
  dom.accountReviewPrimaryButton.onclick = () => setAppSection(primary.section || 'summary', { scroll: false });
}


function getFlowSectionFromStep(step) {
  if (step === 'people') return 'people';
  if (step === 'products') return 'expenses';
  if (step === 'share') return 'payments';
  return 'summary';
}

function runSmartPrimaryAction(copy = getSmartActionCopy()) {
  const targetSection = getFlowSectionFromStep(copy.step);
  setAppSection(targetSection, { scroll: false });

  setTimeout(() => {
    if (copy.step === 'people') {
      const { hasPeople, bill } = getGuidedState();
      scrollToGuideTarget(hasPeople && !bill.payerId ? (dom.payerSelect || dom.personNameInput) : dom.personNameInput);
      return;
    }
    if (copy.step === 'products') {
      scrollToGuideTarget(billIsQuickForGuidance() ? dom.quickTotalInput : dom.productNameInput);
      return;
    }
    if (copy.step === 'share') {
      dom.paymentActionCenter?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    dom.accountReviewPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 80);
}

function renderGuidedFlowPanel() {
  if (!dom.guidedFlowPanel || !dom.guidedFlowSteps || !dom.guidedFlowMissingList) return;

  const { bill, hasPeople, hasProducts, hasAmounts, calculation } = getGuidedState();
  const reviewItems = getAccountReviewItems(bill);
  const blocking = reviewItems.filter((item) => item.level === 'danger');
  const warnings = reviewItems.filter((item) => item.level === 'warning');
  const pendingPeople = bill.people.filter((person) => !person.paid && (calculation.finalTotals[person.id] || 0) > 0).length;
  const copy = getSmartActionCopy();

  let status = 'Borrador';
  let statusText = 'Sigue el siguiente paso.';
  let statusClass = 'is-draft';

  if (!hasPeople || !hasProducts) {
    status = 'En progreso';
    statusText = copy.help;
    statusClass = 'is-progress';
  } else if (blocking.length > 0) {
    status = 'Hay que corregir';
    statusText = blocking[0].text;
    statusClass = 'is-danger';
  } else if (warnings.length > 0) {
    status = 'Revisar antes de enviar';
    statusText = warnings[0].text;
    statusClass = 'is-warning';
  } else if (pendingPeople > 0) {
    status = 'Lista, con pagos pendientes';
    statusText = `${pendingPeople} persona${pendingPeople === 1 ? '' : 's'} por marcar como pagada${pendingPeople === 1 ? '' : 's'}.`;
    statusClass = 'is-warning';
  } else if (hasAmounts) {
    status = 'Lista para compartir';
    statusText = 'Todo está ordenado.';
    statusClass = 'is-ready';
  }

  dom.guidedFlowPanel.classList.remove('is-draft', 'is-progress', 'is-warning', 'is-danger', 'is-ready');
  dom.guidedFlowPanel.classList.add(statusClass);
  if (dom.guidedFlowStatus) dom.guidedFlowStatus.textContent = status;
  if (dom.guidedFlowStatusText) dom.guidedFlowStatusText.textContent = statusText;
  if (dom.guidedFlowBadge) dom.guidedFlowBadge.textContent = status.replace('Hay que ', '');

  const steps = [
    { key: 'people', label: 'Personas', section: 'people', done: hasPeople, current: copy.step === 'people' },
    { key: 'expenses', label: 'Gastos', section: 'expenses', done: hasProducts, current: copy.step === 'products' },
    { key: 'summary', label: 'Revisar', section: 'summary', done: hasAmounts && blocking.length === 0, current: copy.step === 'review' || (hasPeople && hasProducts && blocking.length > 0) },
    { key: 'payments', label: 'Compartir', section: 'payments', done: hasAmounts && blocking.length === 0 && pendingPeople === 0, current: copy.step === 'share' },
  ];

  dom.guidedFlowSteps.innerHTML = steps.map((step, index) => `
    <button class="guided-flow-step ${step.done ? 'is-done' : ''} ${step.current ? 'is-current' : ''}" data-flow-section="${step.section}" type="button">
      <span>${step.done ? '✓' : index + 1}</span>
      <strong>${escapeHtml(step.label)}</strong>
    </button>
  `).join('');

  dom.guidedFlowSteps.querySelectorAll('[data-flow-section]').forEach((button) => {
    button.addEventListener('click', () => setAppSection(button.dataset.flowSection, { scroll: false }));
  });

  const actionItems = reviewItems
    .filter((item) => item.level !== 'info')
    .concat(reviewItems.filter((item) => item.level === 'info'))
    .slice(0, 3);

  dom.guidedFlowMissingList.innerHTML = '';
  if (actionItems.length === 0) {
    const ok = document.createElement('div');
    ok.className = 'guided-flow-ok';
    ok.innerHTML = '<strong>Sin alertas</strong><small>Puedes compartir o seguir cobrando pagos.</small>';
    dom.guidedFlowMissingList.appendChild(ok);
  } else {
    for (const item of actionItems) {
      const row = document.createElement('button');
      row.className = `guided-flow-missing-row is-${item.level}`;
      row.type = 'button';
      row.innerHTML = `<span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.text)}</small></span><em>Resolver</em>`;
      row.addEventListener('click', () => setAppSection(item.section || 'summary', { scroll: false }));
      dom.guidedFlowMissingList.appendChild(row);
    }
  }

  if (dom.guidedFlowPrimaryButton) {
    dom.guidedFlowPrimaryButton.textContent = blocking.length > 0 ? 'Resolver ahora' : copy.button;
    dom.guidedFlowPrimaryButton.onclick = () => {
      const firstBlocking = blocking[0] || warnings[0];
      if (firstBlocking) {
        setAppSection(firstBlocking.section || 'summary', { scroll: false });
        return;
      }
      runSmartPrimaryAction(copy);
    };
  }

  if (dom.guidedFlowSecondaryButton) {
    dom.guidedFlowSecondaryButton.textContent = hasAmounts ? 'Ver pagos' : 'Revisar cuenta';
    dom.guidedFlowSecondaryButton.onclick = () => setAppSection(hasAmounts ? 'payments' : 'summary', { scroll: false });
  }
}

function renderHomeActionPanel() {
  if (!dom.homeActionPanel || !dom.homeActionList) return;

  const entries = getPaymentActionEntries(currentSession.mode === 'user' ? 'mine' : 'current');
  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const urgent = entries.filter((entry) => ['danger', 'warning'].includes(entry.dueStatus?.className)).length;
  const bill = getActiveBill();
  const reviewItems = getAccountReviewItems(bill).filter((item) => item.level !== 'info');

  dom.homeActionAmountOutput.textContent = formatCurrency(total);

  if (entries.length === 0 && reviewItems.length === 0) {
    dom.homeActionSummaryOutput.textContent = 'Sin acciones urgentes';
    dom.homeActionPanel.classList.add('is-clear');
    dom.homeActionList.innerHTML = '';
    dom.homeActionList.appendChild(emptyMessage('No hay cobros, pagos o revisiones críticas pendientes.'));
    return;
  }

  dom.homeActionPanel.classList.remove('is-clear');
  dom.homeActionSummaryOutput.textContent = entries.length > 0
    ? `${entries.length} pago${entries.length === 1 ? '' : 's'} pendiente${entries.length === 1 ? '' : 's'}${urgent ? ` · ${urgent} urgente${urgent === 1 ? '' : 's'}` : ''}`
    : `${reviewItems.length} revisión${reviewItems.length === 1 ? '' : 'es'} pendiente${reviewItems.length === 1 ? '' : 's'}`;
  dom.homeActionList.innerHTML = '';
  if (entries.length > 0) {
    renderPaymentActionRows(dom.homeActionList, entries, { limit: 3, compact: true });
  }

  for (const item of reviewItems.slice(0, Math.max(0, 3 - entries.length))) {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = `payment-action-row account-action-row is-${item.level}`;
    row.innerHTML = `
      <div class="payment-action-main">
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.text)}</small>
      </div>
      <strong class="payment-action-amount">Revisar</strong>
    `;
    row.addEventListener('click', () => setAppSection(item.section || 'summary', { scroll: false }));
    dom.homeActionList.appendChild(row);
  }
}

function renderPaymentActionCenter() {
  if (!dom.paymentActionCenter || !dom.paymentActionList) return;

  const filter = dom.paymentActionFilterSelect?.value || 'current';
  const entries = getPaymentActionEntries(filter);
  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);

  dom.paymentActionTotalOutput.textContent = formatCurrency(total);
  dom.paymentActionCountOutput.textContent = String(entries.length);
  renderPaymentActionRows(dom.paymentActionList, entries, { limit: 20 });
}

function openBillFromProfileStats(billId, section = 'payments') {
  const bill = state?.bills?.find((item) => item.id === billId);

  if (!bill) {
    showToast('No encontré esa cuenta.');
    return;
  }

  state.activeBillId = bill.id;
  editingProductId = null;
  saveState();
  render();
  closeAuthModal();
  setAppSection(section, { scroll: false });
  showToast(`Abrí ${bill.name || 'la cuenta'} en Pagos.`);
}

function renderProfileDebtList(container, items, emptyText) {
  if (!container) return;
  container.innerHTML = '';

  if (!items.length) {
    container.appendChild(emptyMessage(emptyText));
    return;
  }

  for (const item of items.slice(0, 8)) {
    const row = document.createElement('div');
    row.className = `profile-debt-row profile-debt-card ${item.direction === 'owe' ? 'is-owe' : 'is-owed'}`;
    const recipient = item.direction === 'owe' ? item.payer : item.person;
    const hasPhone = Boolean(normalizePhoneNumber(recipient.phone));
    row.innerHTML = `
      <span>
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.subtitle)} · ${item.direction === 'owed' ? 'cobro pendiente' : 'pago pendiente'}</small>
      </span>
      <strong>${formatCurrency(item.amount)}</strong>
      <div class="profile-debt-actions">
        <button class="btn btn-light btn-small" data-action="open" type="button">Ver cuenta</button>
        <button class="btn btn-light btn-small" data-action="copy" type="button">Copiar</button>
        <button class="btn btn-primary btn-small" data-action="whatsapp" type="button" ${hasPhone ? '' : 'disabled'}>WhatsApp</button>
        <button class="btn btn-light btn-small" data-action="paid" type="button">Marcar pagado</button>
      </div>
    `;

    row.querySelector('[data-action="open"]')?.addEventListener('click', () => openBillFromProfileStats(item.billId, 'payments'));
    row.querySelector('[data-action="copy"]')?.addEventListener('click', () => copyPaymentActionReminder(item));
    row.querySelector('[data-action="whatsapp"]')?.addEventListener('click', () => sendPaymentActionWhatsapp(item));
    row.querySelector('[data-action="paid"]')?.addEventListener('click', () => setPersonPaidStatusInBill(item.billId, item.person.id, true));
    container.appendChild(row);
  }
}

function renderPendingPeopleStats(container, entries) {
  if (!container) return;
  container.innerHTML = '';

  if (!entries.length) {
    const empty = document.createElement('p');
    empty.className = 'helper-text';
    empty.textContent = 'No tienes pendientes vinculados a tu perfil.';
    container.appendChild(empty);
    return;
  }

  for (const entry of entries.slice(0, 6)) {
    const button = document.createElement('button');
    button.className = `mini-ranking-row mini-ranking-action ${entry.direction === 'owe' ? 'is-owe' : 'is-owed'}`;
    button.type = 'button';
    button.innerHTML = `
      <span>${escapeHtml(entry.label)}<small>${entry.count} cuenta${entry.count === 1 ? '' : 's'}</small></span>
      <strong>${formatCurrency(entry.amount)}</strong>
    `;
    button.addEventListener('click', () => openBillFromProfileStats(entry.billId, 'payments'));
    container.appendChild(button);
  }
}

function renderProfilePanels() {
  const isUser = currentSession.mode === 'user';

  if (!isUser || !dom.profileNickInput) {
    return;
  }

  const profile = getProfile();
  const displayName = getProfileDisplayName();
  const activeElement = document.activeElement;
  const editableFields = [
    dom.profileNickInput,
    dom.profileNameInput,
    dom.profilePhoneInput,
    dom.profileCurrencyInput,
    dom.profileThemePreferenceInput,
  ];

  if (!editableFields.includes(activeElement)) {
    dom.profileNickInput.value = profile.nick || '';
    dom.profileNameInput.value = profile.name || '';
    dom.profilePhoneInput.value = profile.phone ? formatPhoneForDisplay(profile.phone) : '';
    dom.profileEmailInput.value = currentSession.email || '';
    dom.profileCurrencyInput.value = profile.currency || 'CLP';
    dom.profileThemePreferenceInput.value = profile.themePreference || 'system';
  }

  if (dom.profileAvatar) {
    if (profile.avatarDataUrl) {
      dom.profileAvatar.innerHTML = `<img src="${profile.avatarDataUrl}" alt="Foto de perfil" />`;
    } else {
      dom.profileAvatar.textContent = getInitials(displayName);
    }
  }

  const stats = getUsageStats();

  dom.statTotalBills.textContent = stats.totalBills;
  dom.statActiveBills.textContent = stats.activeBills;
  dom.statHistoricalTotal.textContent = formatCurrency(stats.historicalTotal);
  dom.statAverageBill.textContent = formatCurrency(stats.averageBill);
  const debtOverview = getProfileDebtOverview();
  const pendingToPay = debtOverview.owe.reduce((sum, item) => sum + item.amount, 0);
  const pendingToCollect = debtOverview.owed.reduce((sum, item) => sum + item.amount, 0);
  if (dom.statPendingToPay) dom.statPendingToPay.textContent = formatCurrency(pendingToPay);
  if (dom.statPendingToCollect) dom.statPendingToCollect.textContent = formatCurrency(pendingToCollect);
  if (dom.statClosedArchivedBills) dom.statClosedArchivedBills.textContent = `${stats.closedBills} / ${stats.archivedBills}`;
  dom.statPeopleCount.textContent = stats.peopleCount;
  dom.statProductCount.textContent = stats.productCount;
  dom.statHomeBills.textContent = stats.homeBills;
  dom.statOutingBills.textContent = stats.outingBills;
  dom.statLastActivity.textContent = stats.lastActivity
    ? `Última actividad: ${formatDate(stats.lastActivity)}`
    : 'Sin actividad registrada.';

  renderMiniRanking(dom.statTopCategories, stats.topCategories, 'Sin categorías todavía.');
  renderMiniRanking(dom.statTopPeople, stats.topPeople, 'Sin personas todavía.');

  renderPendingPeopleStats(dom.statPendingPeople, debtOverview.pendingByPerson);
  renderProfileDebtList(dom.profileOweList, debtOverview.owe, 'No tienes pagos pendientes por hacer.');
  renderProfileDebtList(dom.profileOwedList, debtOverview.owed, 'No tienes cobros pendientes vinculados a tu perfil.');
}

async function saveProfileFromModal() {
  if (currentSession.mode !== 'user') {
    return;
  }

  const profile = getProfile();
  const nick = dom.profileNickInput.value.trim();
  const name = dom.profileNameInput.value.trim();
  const phone = normalizePhoneNumber(dom.profilePhoneInput.value);
  const currency = dom.profileCurrencyInput.value === 'CLP' ? 'CLP' : 'CLP';
  const themePreference = ['system', 'light', 'dark'].includes(dom.profileThemePreferenceInput.value)
    ? dom.profileThemePreferenceInput.value
    : 'system';

  profile.nick = nick;
  profile.name = name;
  profile.phone = phone;
  profile.currency = currency;
  profile.themePreference = themePreference;
  profile.updatedAt = nowIso();

  currentSession.name = nick || name || currentSession.email || 'Usuario';
  saveAuthSession();

  if (themePreference === 'light' || themePreference === 'dark') {
    document.documentElement.dataset.theme = themePreference;
    localStorage.setItem(THEME_KEY, themePreference);
    dom.themeToggle.textContent = themePreference === 'dark' ? 'Modo claro' : 'Modo oscuro';
  }

  saveState();

  if (hasSupabaseClient()) {
    const { error } = await supabaseClient.auth.updateUser({
      data: {
        nick,
        nombre: name,
        phone,
      },
    });

    if (error) {
      showNotice('Perfil guardado en este dispositivo', 'No se pudo actualizar el perfil en la nube en este momento.');
    }
  }

  await saveCloudStateNow();
  render();
  showToast('Perfil actualizado.');
}

async function saveProfilePreferences() {
  await saveProfileFromModal();
}



function setSyncStatus(status, message = '') {
  cloudSyncStatus = status;

  if (!dom.syncStatusBadge) {
    return;
  }

  const isUser = currentSession.mode === 'user';
  dom.syncStatusBadge.classList.toggle('hidden', !isUser);

  if (!isUser) {
    dom.syncStatusBadge.textContent = 'Modo invitado';
    dom.syncStatusBadge.className = 'sync-status-badge hidden';
    return;
  }

  dom.syncStatusBadge.classList.remove('is-saving', 'is-saved', 'is-error', 'is-local');
  dom.syncStatusBadge.classList.add(`is-${status}`);

  if (message) {
    dom.syncStatusBadge.textContent = message;
    return;
  }

  if (status === 'saving') {
    dom.syncStatusBadge.textContent = 'Guardando...';
  } else if (status === 'saved') {
    dom.syncStatusBadge.textContent = 'Sincronizado';
  } else if (status === 'error') {
    dom.syncStatusBadge.textContent = 'Guardado solo en este dispositivo';
  } else {
    dom.syncStatusBadge.textContent = 'Modo invitado';
  }
}

function getCloudSavedText() {
  if (!lastCloudSyncAt) {
    return 'Sincronizado';
  }

  return `Sincronizado ${new Date(lastCloudSyncAt).toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}



function getPublicProfilePayloadFromMain() {
  if (!currentSession.userId) {
    return null;
  }

  const profile = state?.profile || {};
  const displayName = profile.nick || profile.name || currentSession.name || currentSession.email || 'Usuario';

  return {
    id: currentSession.userId,
    email: currentSession.email || '',
    nick: profile.nick || displayName,
    nombre: profile.name || currentSession.name || displayName,
    telefono: normalizePhoneNumber(profile.phone || ''),
    avatar_data_url: profile.avatarDataUrl || '',
    allow_search: true,
    updated_at: nowIso(),
  };
}

async function savePublicProfileFromMain() {
  if (!hasSupabaseClient() || currentSession.mode !== 'user' || !currentSession.userId || !state) {
    return;
  }

  const payload = getPublicProfilePayloadFromMain();

  if (!payload) {
    return;
  }

  try {
    const { error } = await supabaseClient
      .from('public_profiles')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('No se pudo actualizar public_profiles:', error);
      if (String(error.message || '').toLowerCase().includes('public_profiles')) {
        showNotice('Perfil público no disponible', 'La búsqueda de amigos todavía no está configurada para esta cuenta.');
      }
    }
  } catch (error) {
    console.warn('No se pudo actualizar public_profiles:', error);
  }
}


function renderAuthUI() {
  if (!dom.authButton || !dom.authStatusBadge) {
    return;
  }

  const isUser = currentSession.mode === 'user';

  const displayName = isUser ? getProfileDisplayName() : '';
  dom.authStatusBadge.textContent = isUser ? `Perfil · ${displayName}` : 'Invitado';
  dom.authStatusBadge.setAttribute('aria-label', isUser ? `Abrir perfil de ${displayName}` : 'Iniciar sesión');
  dom.authStatusBadge.classList.toggle('is-user', isUser);
  dom.authStatusBadge.title = isUser ? `Abrir perfil: ${displayName}` : 'Iniciar sesión';
  dom.authButton.textContent = 'Ingresar';
  dom.authButton.classList.toggle('hidden', isUser);
  setSyncStatus(isUser ? (lastCloudSyncAt ? 'saved' : cloudSyncStatus) : 'local', isUser && lastCloudSyncAt ? getCloudSavedText() : '');

  if (dom.authSessionPanel && dom.authFormsPanel) {
    dom.authSessionPanel.classList.toggle('hidden', !isUser);
    dom.authFormsPanel.classList.toggle('hidden', isUser);

    if (isUser) {
      dom.authSessionTitle.textContent = `Hola, ${displayName}`;
      dom.authSessionDescription.textContent = `Tus cuentas se guardan en la nube para ${currentSession.email}. ${lastCloudSyncAt ? 'Última sincronización: ' + new Date(lastCloudSyncAt).toLocaleString('es-CL') : ''}`;
      renderProfilePanels();
    }
  }
}



function openReceiptModal() {
  if (getActiveBill().mode === 'quick') {
    showNotice('Modo rápido activo', 'Para agregar desde boleta usa modo Detallada u Hogar.');
    return;
  }

  dom.receiptModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  updateReceiptStatus('Toma una foto o sube una imagen clara para comenzar.');
}

function closeReceiptModal() {
  dom.receiptModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

function updateReceiptStatus(message) {
  dom.receiptStatus.textContent = message;
}

function clearReceiptReader() {
  receiptSelectedFile = null;
  receiptDetectedItems = [];
  receiptDetectedMeta = { receiptTotal: 0, tip: 0, grandTotal: 0, hasLineTotalColumns: false };
  receiptMismatchAccepted = false;
  dom.receiptFileInput.value = '';
  dom.receiptPreviewImage.removeAttribute('src');
  dom.receiptPreviewWrap.classList.add('hidden');

  if (dom.receiptRawTextInput) {
    dom.receiptRawTextInput.value = '';
  }

  renderReceiptDetectedItems();
  updateReceiptStatus('Toma una foto o sube una imagen clara para comenzar.');
}

function handleReceiptFileChange() {
  const file = dom.receiptFileInput.files?.[0];

  if (!file) {
    clearReceiptReader();
    return;
  }

  receiptSelectedFile = file;

  const url = URL.createObjectURL(file);
  dom.receiptPreviewImage.src = url;
  dom.receiptPreviewWrap.classList.remove('hidden');
  receiptDetectedItems = [];
  receiptDetectedMeta = { receiptTotal: 0, tip: 0, grandTotal: 0, hasLineTotalColumns: false };
  receiptMismatchAccepted = false;
  if (dom.receiptRawTextInput) {
    dom.receiptRawTextInput.value = '';
  }
  renderReceiptDetectedItems();
  updateReceiptStatus('Imagen cargada. Presiona “Leer boleta”.');
}

function parseMoneyFromReceipt(value) {
  const raw = String(value || '').trim();

  if (!raw) {
    return 0;
  }

  const compact = raw
    .replace(/\$/g, '')
    .replace(/\s+/g, '')
    .replace(/,/g, '.')
    .replace(/[^\d.\-]/g, '');

  // OCR habitual en boletas chilenas: 13.99, 14.98 o 24.76 suelen ser
  // 13.990, 14.980 o 24.760, no valores con centavos.
  const shortThousands = compact.match(/^-?(\d{1,3})\.(\d{2})$/);
  if (shortThousands) {
    const amount = Number(`${shortThousands[1]}${shortThousands[2]}0`);
    return Number.isFinite(amount) ? Math.abs(amount) : 0;
  }

  const clean = compact
    .replace(/\./g, '')
    .replace(/[^\d-]/g, '');

  const amount = Number(clean);

  return Number.isFinite(amount) ? Math.abs(amount) : 0;
}

function parseReceiptQuantity(value) {
  const clean = String(value || '').trim().replace(',', '.');
  const quantity = Number(clean);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

function roundReceiptMoney(value) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? Math.round(amount) : 0;
}

function cleanReceiptProductName(value) {
  return String(value || '')
    .replace(/^\s*\d+\s*[xX]\s*/g, '')
    .replace(/[|_*~]+/g, '')
    .replace(/\b\d+[,.]\d{1,2}\b\s*$/g, '')
    .replace(/\s+\d{1,3}\s+(?:[il1]m|[a-z]{1,3})\s*$/i, '')
    .replace(/\s+\d{1,3}\s*$/g, '')
    .replace(/\b(?:QUE|QVE|OUE|LUPA)\b\s*$/gi, '')
    .replace(/^\s*(?:na|ia|la|rap|tap|pap|raf)\s+(?=[A-ZÁÉÍÓÚÜÑáéíóúüñ])/i, '')
    .replace(/^(?:ESTRELLA)$/i, 'PATRICIO ESTRELLA')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ$]+/g, '')
    .trim();
}


function normalizeReceiptLine(line) {
  return String(line || '')
    .replace(/[|]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function normalizeReceiptKeyword(line) {
  return String(line || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function isReceiptLineTotalHeader(line) {
  const normalized = normalizeReceiptKeyword(line);
  return /producto/.test(normalized) && (/(cant|cantidad)/.test(normalized) || /total/.test(normalized));
}

function isReceiptProductHeaderLine(line) {
  const normalized = normalizeReceiptKeyword(line);
  return /producto/.test(normalized) && !/^\s*total\b/.test(normalized);
}

function isReceiptFinalTotalLine(line) {
  const normalized = normalizeReceiptKeyword(line);
  return /^\s*(total|sub\s*total|subtotal|propina|total\s*\/\s*prop|total\s*prop)\b/.test(normalized);
}

function extractReceiptMetadata(text) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map(normalizeReceiptLine)
    .filter(Boolean);

  const meta = {
    receiptTotal: 0,
    tip: 0,
    grandTotal: 0,
    hasLineTotalColumns: lines.some(isReceiptLineTotalHeader),
  };

  for (const line of lines) {
    const normalized = normalizeReceiptKeyword(line);
    const amounts = extractReceiptAmounts(line);

    if (!amounts.length) {
      continue;
    }

    const amount = amounts[amounts.length - 1];

    if (/total\s*\/\s*prop|total\s*prop|total\s*con\s*prop/.test(normalized)) {
      meta.grandTotal = amount;
      continue;
    }

    if (/propina/.test(normalized)) {
      meta.tip = amount;
      continue;
    }

    if (/^\s*total\b/.test(normalized) && !/prop/.test(normalized)) {
      meta.receiptTotal = amount;
    }
  }

  return meta;
}

function shouldIgnoreReceiptLine(line) {
  const normalized = normalizeReceiptKeyword(line);

  if (!normalized || normalized.length < 3) {
    return true;
  }

  const exactSectionWords = [
    'comidas',
    'bebidas',
    'detalle de cuenta',
    'terraza',
    'ide',
    'ro',
    'ona',
    'que',
    'qve',
    'oue',
    'lupa',
  ];

  if (exactSectionWords.includes(normalized.trim())) {
    return true;
  }

  const ignoredWords = [
    'total',
    'sub-total',
    'subtotal',
    'sub total',
    'propina',
    'tips',
    'iva',
    'neto',
    'exento',
    'vuelto',
    'cambio',
    'efectivo',
    'tarjeta',
    'debito',
    'credito',
    'transbank',
    'redcompra',
    'boleta',
    'factura',
    'rut',
    'fecha',
    'hora',
    'folio',
    'caja',
    'mesa',
    'cubiertos',
    'cuenta',
    'garzon',
    'vendedor',
    'terminal',
    'autorizacion',
    'comercio',
    'direccion',
    'telefono',
    'gracias',
    'descuento',
    'medio de pago',
    'monto',
    'pago',
    'atendido',
    'preferencia',
    'independencia',
    'incerendencia',
    'incerendencia',
    'puente alto',
    'puente',
    'alte',
    'frente',
    'local',
    'sucursal',
    'razon social',
    'giro',
    'cliente',
    'codigo',
    'documento',
    'producto',
  ];

  return ignoredWords.some((word) => {
    if (word.includes(' ')) {
      return normalized.includes(word);
    }

    const escaped = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`).test(normalized);
  });
}

function isReceiptSuspiciousNonConsumptionName(name) {
  const normalized = normalizeReceiptKeyword(name);

  if (!normalized || normalized.length < 3) {
    return true;
  }

  const strongNonConsumptionPatterns = [
    /\b(total|subtotal|propina|iva|neto|exento|vuelto|descuento)\b/,
    /\b(mesa|rut|folio|boleta|factura|ticket|voucher|terminal|autorizacion)\b/,
    /\b(fecha|hora|caja|garzon|vendedor|atendido|cliente)\b/,
    /\b(tarjeta|debito|credito|efectivo|redcompra|transbank|medio de pago)\b/,
    /\b(direccion|telefono|local|sucursal|giro|razon social|comercio)\b/,
    /\b(independencia|incerendencia|incerendencia|puente|alte|alto|frente)\b/,
    /\b(producto|cant|cantidad|precio|monto)\b/,
  ];

  if (strongNonConsumptionPatterns.some((pattern) => pattern.test(normalized))) {
    return true;
  }

  // Si parece más un código/dato administrativo que un producto, no seleccionarlo automáticamente.
  const letters = normalized.replace(/[^a-záéíóúüñ]/g, '');
  if (letters.length < 3) {
    return true;
  }

  return false;
}

function guessReceiptCategory(name) {
  const normalized = normalizeReceiptKeyword(name);

  if (/(cerveza|pisco|mojito|piscola|ron|vino|trago|shop|sch|kunstmann|austral|escudo|jager|daiquiri|daikiri|tequila|whisky|vodka|royal|calafate|aperol|mule|estrella)/.test(normalized)) {
    return 'Tragos';
  }

  if (/(bebida|coca|sprite|fanta|jugo|agua mineral|limonada|cafe|te|latte)/.test(normalized)) {
    return 'Bebestibles';
  }

  if (/(postre|helado|torta|kuchen|brownie|dulce)/.test(normalized)) {
    return 'Postres';
  }

  if (/(supermercado|mercado|pan|leche|huevo|arroz|verdura|fruta|detergente)/.test(normalized)) {
    return getActiveBill().mode === 'home' ? 'Supermercado' : 'Comida';
  }

  if (getActiveBill().mode === 'home') {
    return 'Supermercado';
  }

  return 'Comida';
}

function getReceiptLineTotal(item) {
  const quantity = Math.max(1, Number(item.quantity || 1));
  const amount = Math.max(0, Number(item.amount ?? item.price ?? 0));
  return roundReceiptMoney(item.amountMode === 'unit' ? amount * quantity : amount);
}

function getReceiptUnitPrice(item) {
  const quantity = Math.max(1, Number(item.quantity || 1));
  const amount = Math.max(0, Number(item.amount ?? item.price ?? 0));
  return roundReceiptMoney(item.amountMode === 'unit' ? amount : amount / quantity);
}

function refreshReceiptDerivedValues(item) {
  item.quantity = Math.max(1, Number(item.quantity || 1));
  item.amount = Math.max(0, Number(item.amount ?? item.price ?? 0));
  item.amountMode = item.amountMode === 'unit' ? 'unit' : 'line';
  item.price = getReceiptLineTotal(item);
  item.unitPrice = getReceiptUnitPrice(item);
  item.lineTotal = getReceiptLineTotal(item);
  return item;
}

function isLikelyReceiptSubtotalLine(name, price, previousItems) {
  const normalized = normalizeReceiptKeyword(name);

  if (!name || shouldIgnoreReceiptLine(name)) {
    return true;
  }

  // Líneas que solo son un monto, sin producto.
  if (/^[\d\s.,$-]+$/.test(name)) {
    return true;
  }

  // En boletas de restaurante suelen aparecer subtotales por sección justo después de varios productos.
  // Si la línea no tiene letras claras o tiene texto de sección, se ignora.
  if (!/[a-záéíóúñ]/i.test(name)) {
    return true;
  }

  // Evitar tomar como producto un subtotal que sea igual a la suma parcial cercana.
  const recentSum = previousItems.slice(-5).reduce((sum, item) => sum + getReceiptLineTotal(item), 0);
  if (recentSum > 0 && Math.abs(recentSum - price) <= 5 && normalized.length <= 16) {
    return true;
  }

  return false;
}

function createReceiptItem(name, amount, seen, items, options = {}) {
  const cleanName = cleanReceiptProductName(name);
  const parsedAmount = parseMoneyFromReceipt(amount);
  const quantity = Math.max(1, parseReceiptQuantity(options.quantity || 1));
  const amountMode = options.amountMode === 'unit' ? 'unit' : 'line';
  const lineTotal = amountMode === 'unit' ? roundReceiptMoney(parsedAmount * quantity) : parsedAmount;

  if (!cleanName || parsedAmount <= 0) {
    return null;
  }

  if (isLikelyReceiptSubtotalLine(cleanName, lineTotal, items)) {
    return null;
  }

  if (cleanName.length < 3 || /^\d+$/.test(cleanName)) {
    return null;
  }

  const key = `${cleanName.toLowerCase()}-${quantity}-${lineTotal}`;

  if (seen.has(key)) {
    return null;
  }

  seen.add(key);
  const suspiciousNonConsumption = isReceiptSuspiciousNonConsumptionName(cleanName);

  return refreshReceiptDerivedValues({
    id: createId('receipt'),
    selected: !suspiciousNonConsumption,
    name: cleanName,
    quantity,
    amount: parsedAmount,
    amountMode,
    price: lineTotal,
    unitPrice: amountMode === 'unit' ? parsedAmount : roundReceiptMoney(parsedAmount / quantity),
    lineTotal,
    category: guessReceiptCategory(cleanName),
    needsReview: suspiciousNonConsumption,
    nonConsumptionSuspect: suspiciousNonConsumption,
  });
}

function isReceiptProductNameLine(line) {
  const cleanLine = cleanReceiptProductName(line);

  if (!cleanLine || shouldIgnoreReceiptLine(cleanLine)) {
    return false;
  }

  if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ$]/.test(cleanLine)) {
    return false;
  }

  if (/^\$?\s*-?\d/.test(cleanLine)) {
    return false;
  }

  // Evita encabezados o nombres demasiado genéricos.
  const normalized = normalizeReceiptKeyword(cleanLine);
  const nonProductWords = ['comidas', 'bebidas', 'detalle', 'restaurant', 'restaurante', 'terraza', 'producto', 'cant', 'cantidad'];

  if (nonProductWords.some((word) => normalized === word || normalized.includes(`${word} de`))) {
    return false;
  }

  return true;
}

function extractReceiptAmounts(line) {
  const matches = String(line || '').match(/-?\d{1,3}(?:(?:[.\s,])\s?\d{2,3})+|-?\d{4,7}/g) || [];

  return matches
    .map(parseMoneyFromReceipt)
    .filter((amount) => amount > 0);
}

function isReceiptQuantityLine(line) {
  const raw = String(line || '').trim();
  if (!/^\d{1,3}(?:[,.]\d{1,2})?$/.test(raw)) {
    return false;
  }
  const value = parseReceiptQuantity(raw);
  return value > 0 && value <= 99;
}

function parseReceiptQuantityAndAmountLine(line) {
  const match = String(line || '').match(/^\s*(\d{1,3}(?:[,.]\d{1,2})?)\s+\$?\s*(-?\d{1,3}(?:(?:[.\s,])\s?\d{2,3})+|-?\d{3,7})(?:,\d{1,2})?\s*$/);
  if (!match) {
    return null;
  }

  return {
    quantity: parseReceiptQuantity(match[1]),
    amount: parseMoneyFromReceipt(match[2]),
  };
}

function isReceiptQuantityAndAmountLine(line) {
  return Boolean(parseReceiptQuantityAndAmountLine(line));
}

function addReceiptItemFromParts(items, seen, name, amount, options = {}) {
  const item = createReceiptItem(name, amount, seen, items, options);

  if (item) {
    items.push(item);
    return true;
  }

  return false;
}

function inferReceiptAmountModes(items, meta) {
  if (!items.length) {
    return items;
  }

  const total = Number(meta?.receiptTotal || 0);
  const hasLineHeader = Boolean(meta?.hasLineTotalColumns);

  if (total > 0) {
    const lineModeSum = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const unitModeSum = items.reduce((sum, item) => sum + (Number(item.amount || 0) * Math.max(1, Number(item.quantity || 1))), 0);
    const tolerance = Math.max(20, Math.round(total * 0.015));

    if (Math.abs(lineModeSum - total) <= tolerance || (hasLineHeader && Math.abs(lineModeSum - total) <= Math.max(100, tolerance * 3))) {
      items.forEach((item) => {
        item.amountMode = 'line';
        refreshReceiptDerivedValues(item);
      });
      return items;
    }

    if (Math.abs(unitModeSum - total) <= tolerance) {
      items.forEach((item) => {
        item.amountMode = 'unit';
        refreshReceiptDerivedValues(item);
      });
      return items;
    }
  }

  if (hasLineHeader) {
    items.forEach((item) => {
      item.amountMode = 'line';
      refreshReceiptDerivedValues(item);
    });
    return items;
  }

  // En boletas chilenas de restaurantes el monto de la derecha suele ser total de línea.
  items.forEach(refreshReceiptDerivedValues);
  return items;
}

function detectSeparatedReceiptColumns(rawLines, items, seen, meta) {
  let index = 0;
  const hasProductHeader = rawLines.some(isReceiptProductHeaderLine);
  let productZoneActive = !hasProductHeader;

  while (index < rawLines.length) {
    if (isReceiptProductHeaderLine(rawLines[index])) {
      productZoneActive = true;
      index += 1;
      continue;
    }

    if (isReceiptFinalTotalLine(rawLines[index]) || /propina/.test(normalizeReceiptKeyword(rawLines[index]))) {
      productZoneActive = false;
      index += 1;
      continue;
    }

    if (hasProductHeader && !productZoneActive && !isReceiptInsideProductZone(rawLines, index)) {
      index += 1;
      continue;
    }
    const productLines = [];

    // Buscar bloque de nombres de productos.
    while (index < rawLines.length) {
      const line = rawLines[index];

      if (isReceiptProductNameLine(line)) {
        productLines.push(line);
        index += 1;
        continue;
      }

      break;
    }

    if (productLines.length === 0) {
      index += 1;
      continue;
    }

    // Capturar líneas siguientes hasta la próxima sección con texto.
    const numericLines = [];
    let scan = index;

    while (scan < rawLines.length) {
      const line = rawLines[scan];

      if (isReceiptFinalTotalLine(line) || /propina/.test(normalizeReceiptKeyword(line))) {
        break;
      }

      if (isReceiptProductNameLine(line)) {
        break;
      }

      if (shouldIgnoreReceiptLine(line) && !extractReceiptAmounts(line).length) {
        break;
      }

      if (extractReceiptAmounts(line).length || isReceiptQuantityLine(line) || isReceiptQuantityAndAmountLine(line)) {
        numericLines.push(line);
      }

      scan += 1;
    }

    // Caso 1: cada línea numérica trae cantidad + monto.
    const quantityAmountLines = numericLines
      .map(parseReceiptQuantityAndAmountLine)
      .filter(Boolean)
      .filter((entry) => entry.amount > 0);

    if (quantityAmountLines.length >= productLines.length) {
      productLines.forEach((name, productIndex) => {
        const entry = quantityAmountLines[productIndex];
        addReceiptItemFromParts(items, seen, name, entry.amount, {
          quantity: entry.quantity,
          amountMode: meta?.hasLineTotalColumns ? 'line' : 'line',
        });
      });
      index = scan;
      continue;
    }

    // Caso 2: OCR separa nombres, cantidades y montos por columnas.
    const quantities = numericLines
      .filter(isReceiptQuantityLine)
      .map(parseReceiptQuantity)
      .filter((quantity) => quantity > 0 && quantity <= 99);

    const amounts = numericLines
      .flatMap(extractReceiptAmounts)
      .filter((amount) => amount >= 300);

    const usableAmounts = amounts.slice(0, productLines.length);
    const usableQuantities = quantities.slice(0, productLines.length);

    if (usableAmounts.length >= productLines.length) {
      productLines.forEach((name, productIndex) => {
        addReceiptItemFromParts(items, seen, name, usableAmounts[productIndex], {
          quantity: usableQuantities[productIndex] || 1,
          amountMode: meta?.hasLineTotalColumns ? 'line' : 'line',
        });
      });
      index = scan;
      continue;
    }

    index = Math.max(index + 1, scan);
  }
}


function isReceiptInsideProductZone(rawLines, index) {
  const before = rawLines.slice(0, index + 1).some((line) => /producto/.test(normalizeReceiptKeyword(line)));
  if (!before) {
    return false;
  }

  const between = rawLines.slice(0, index + 1).reverse();
  const passedTotal = between.some((line) => /^\s*total\b/.test(normalizeReceiptKeyword(line)) || /propina/.test(normalizeReceiptKeyword(line)));
  return !passedTotal;
}

function addReceiptPlaceholderItem(items, seen, line, options = {}) {
  const cleanName = cleanReceiptProductName(line);

  if (!cleanName || cleanName.length < 3 || shouldIgnoreReceiptLine(cleanName)) {
    return false;
  }

  const key = `placeholder-${cleanName.toLowerCase()}-${options.quantity || 1}`;
  if (seen.has(key)) {
    return false;
  }

  seen.add(key);
  const quantity = Math.max(1, parseReceiptQuantity(options.quantity || 1));
  const nonConsumptionSuspect = isReceiptSuspiciousNonConsumptionName(cleanName);
  items.push(refreshReceiptDerivedValues({
    id: createId('receipt'),
    selected: !nonConsumptionSuspect,
    name: cleanName,
    quantity,
    amount: 0,
    amountMode: 'line',
    price: 0,
    unitPrice: 0,
    lineTotal: 0,
    category: guessReceiptCategory(cleanName),
    needsReview: true,
    nonConsumptionSuspect,
  }));
  return true;
}

function parseReceiptText(text) {
  const rawLines = String(text || '')
    .split(/\r?\n/)
    .map(normalizeReceiptLine)
    .filter(Boolean);

  const meta = extractReceiptMetadata(text);
  receiptDetectedMeta = meta;

  const items = [];
  const seen = new Set();
  const hasProductHeader = rawLines.some(isReceiptProductHeaderLine);
  let productZoneActive = !hasProductHeader;

  for (let index = 0; index < rawLines.length; index++) {
    const line = rawLines[index];
    const normalized = normalizeReceiptKeyword(line);

    if (isReceiptProductHeaderLine(line)) {
      productZoneActive = true;
      continue;
    }

    if (isReceiptFinalTotalLine(line) || /propina/.test(normalized)) {
      productZoneActive = false;
      continue;
    }

    if (hasProductHeader && !productZoneActive && !isReceiptInsideProductZone(rawLines, index)) {
      continue;
    }

    if (shouldIgnoreReceiptLine(line)) {
      continue;
    }

    // Caso A: Producto + cantidad + monto. Ej: LONDON MULE 2 13.980
    // También acepta lecturas OCR abreviadas como 24.76 => 24.760.
    let match = line.match(/^(.+?)\s+(\d{1,3}(?:[,.]\d{1,2})?)\s+\$?\s*(-?\d{1,3}(?:(?:[.\s,])\s?\d{2,3})+|-?\d{3,7})(?:,\d{1,2})?\s*$/);
    if (match) {
      const added = addReceiptItemFromParts(items, seen, match[1], match[3], {
        quantity: match[2],
        amountMode: meta.hasLineTotalColumns ? 'line' : 'line',
      });
      productZoneActive = productZoneActive || added;
      if (added) {
        continue;
      }
    }

    // Caso B: Producto + precio/total. Ej: Papas fritas 8.250
    match = line.match(/^(.+?)\s+\$?\s*(-?\d{1,3}(?:(?:[.\s,])\s?\d{2,3})+|-?\d{3,7})(?:,\d{1,2})?\s*$/);
    if (match) {
      const added = addReceiptItemFromParts(items, seen, match[1], match[2], {
        quantity: 1,
        amountMode: 'line',
      });
      productZoneActive = productZoneActive || added;
      if (added) {
        continue;
      }
    }

    // Caso C: OCR separó producto y números en líneas distintas.
    // Ej:
    // VIAN ITALIANA
    // 2 8.180
    const nextLine = rawLines[index + 1] || '';
    const splitQuantityAmount = parseReceiptQuantityAndAmountLine(nextLine);
    if (splitQuantityAmount && isReceiptProductNameLine(line) && !isReceiptFinalTotalLine(nextLine)) {
      const added = addReceiptItemFromParts(items, seen, line, splitQuantityAmount.amount, {
        quantity: splitQuantityAmount.quantity,
        amountMode: meta.hasLineTotalColumns ? 'line' : 'line',
      });
      if (added) {
        productZoneActive = true;
        index += 1;
        continue;
      }
    }

    const splitMatch = nextLine.match(/^\$?\s*(-?\d{1,3}(?:(?:[.\s,])\s?\d{2,3})+|-?\d{3,7})(?:,\d{1,2})?\s*$/);
    if (splitMatch && isReceiptProductNameLine(line) && !isReceiptFinalTotalLine(nextLine)) {
      const added = addReceiptItemFromParts(items, seen, line, splitMatch[1], {
        quantity: 1,
        amountMode: 'line',
      });
      if (added) {
        productZoneActive = true;
        index += 1;
        continue;
      }
    }

    // Caso D: producto con cantidad pero sin monto confiable. Se agrega en $0 para corregir.
    const quantityOnlyProductMatch = line.match(/^(.+?)\s+(\d{1,3})\s*$/);
    if (quantityOnlyProductMatch && (productZoneActive || isReceiptInsideProductZone(rawLines, index)) && isReceiptProductNameLine(quantityOnlyProductMatch[1])) {
      addReceiptPlaceholderItem(items, seen, quantityOnlyProductMatch[1], { quantity: quantityOnlyProductMatch[2] });
      productZoneActive = true;
      continue;
    }

    // Caso E: el OCR encontró el nombre/cantidad, pero el monto salió corrupto.
    // Ej: PATRICIO ESTRELLA 2 1m. Se agrega en $0 para que se corrija en la revisión.
    const corruptedAmountMatch = line.match(/^(.+?)\s+(\d{1,3})\s+(?:[il1]m|[a-z]{1,3})\s*$/i);
    if (corruptedAmountMatch && (productZoneActive || isReceiptInsideProductZone(rawLines, index))) {
      addReceiptPlaceholderItem(items, seen, corruptedAmountMatch[1], { quantity: corruptedAmountMatch[2] });
      productZoneActive = true;
      continue;
    }

    if ((productZoneActive || isReceiptInsideProductZone(rawLines, index)) && isReceiptProductNameLine(line)) {
      addReceiptPlaceholderItem(items, seen, line);
      productZoneActive = true;
    }
  }

  // Caso F: OCR leyó las columnas completas por separado:
  // nombres primero, cantidades después, montos después.
  detectSeparatedReceiptColumns(rawLines, items, seen, meta);
  inferReceiptAmountModes(items, meta);

  return items
    .filter((item) => item && item.name && !shouldIgnoreReceiptLine(item.name))
    .map((item) => {
      const nonConsumptionSuspect = isReceiptSuspiciousNonConsumptionName(item.name);
      return refreshReceiptDerivedValues({
        ...item,
        selected: nonConsumptionSuspect ? false : item.selected,
        needsReview: Boolean(item.needsReview || nonConsumptionSuspect),
        nonConsumptionSuspect,
      });
    });
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo cargar la imagen.'));
    };

    image.src = url;
  });
}

async function preprocessReceiptImage(file) {
  const image = await loadImageFromFile(file);
  const maxWidth = 1800;
  const scale = Math.min(2.2, Math.max(1, maxWidth / image.width));
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });

  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let index = 0; index < data.length; index += 4) {
    const gray = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
    // Contraste fuerte para papel térmico / boleta.
    const contrasted = gray > 170 ? 255 : gray < 95 ? 0 : Math.max(0, Math.min(255, (gray - 95) * 2.2));
    data[index] = contrasted;
    data[index + 1] = contrasted;
    data[index + 2] = contrasted;
  }

  context.putImageData(imageData, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob || file);
    }, 'image/png', 1);
  });
}


function mergeReceiptTexts(...texts) {
  const seen = new Set();
  const lines = [];

  for (const text of texts) {
    for (const line of String(text || '').split(/\r?\n/)) {
      const cleanLine = normalizeReceiptLine(line);
      if (!cleanLine) continue;
      const key = normalizeReceiptKeyword(cleanLine).replace(/\s+/g, ' ');
      if (seen.has(key)) continue;
      seen.add(key);
      lines.push(cleanLine);
    }
  }

  return lines.join('\n');
}

async function recognizeReceiptText(imageInput, pageSegMode, label) {
  if (label) {
    updateReceiptStatus(label);
  }

  const result = await Tesseract.recognize(imageInput, 'spa+eng', {
    logger: (event) => {
      if (event.status === 'recognizing text' && Number.isFinite(event.progress)) {
        updateReceiptStatus(`${label || 'Leyendo texto'} ${Math.round(event.progress * 100)}%`);
      }
    },
    tessedit_pageseg_mode: String(pageSegMode || '6'),
    preserve_interword_spaces: '1',
  });

  return result?.data?.text || '';
}

async function processReceiptImage() {
  if (!receiptSelectedFile) {
    showToast('Primero sube una foto de la boleta.');
    return;
  }

  if (typeof Tesseract === 'undefined') {
    showNotice('OCR no disponible', 'No se pudo cargar la lectura de boletas. Revisa tu conexión e intenta nuevamente.');
    return;
  }

  try {
    dom.processReceiptButton.disabled = true;
    updateReceiptStatus('Mejorando imagen para lectura...');

    const processedImage = await preprocessReceiptImage(receiptSelectedFile);

    updateReceiptStatus('Leyendo boleta... Esto puede tardar algunos segundos.');

    let text = await recognizeReceiptText(processedImage, '6', 'Leyendo texto...');

    receiptDetectedItems = parseReceiptText(text);
    receiptMismatchAccepted = false;
    let receiptMetrics = getReceiptSelectionMetrics();

    const needsReinforcedRead = (receiptMetrics.mismatch && Math.abs(receiptMetrics.difference) > Math.max(500, receiptMetrics.receiptTotal * 0.08))
      || receiptDetectedItems.length < 5;

    if (needsReinforcedRead) {
      updateReceiptStatus('Reforzando lectura de la boleta...');
      const secondaryText = await recognizeReceiptText(receiptSelectedFile, '4', 'Segunda lectura...');
      const mergedText = mergeReceiptTexts(text, secondaryText);

      if (mergedText.trim() && mergedText.trim() !== text.trim()) {
        const previousText = text;
        const previousItems = receiptDetectedItems;
        const previousMeta = receiptDetectedMeta;
        const previousMetrics = receiptMetrics;

        text = mergedText;
        receiptDetectedItems = parseReceiptText(text);
        receiptMismatchAccepted = false;
        receiptMetrics = getReceiptSelectionMetrics();

        const betterByCount = receiptMetrics.valid > previousMetrics.valid;
        const betterByDifference = previousMetrics.receiptTotal > 0
          && Math.abs(receiptMetrics.difference) < Math.abs(previousMetrics.difference);
        const betterByTotal = previousMetrics.receiptTotal <= 0 && receiptMetrics.receiptTotal > 0;

        if (!(betterByCount || betterByDifference || betterByTotal)) {
          text = previousText;
          receiptDetectedItems = previousItems;
          receiptDetectedMeta = previousMeta;
          receiptMetrics = previousMetrics;
        }
      }
    }

    if (dom.receiptRawTextInput) {
      dom.receiptRawTextInput.value = text.trim();
    }

    renderReceiptDetectedItems();

    if (receiptDetectedItems.length === 0) {
      updateReceiptStatus('No se detectaron productos claros. Revisa el texto leído, edítalo si hace falta y presiona “Volver a detectar”.');
      return;
    }

    if (receiptMetrics.mismatch) {
      updateReceiptStatus('Lectura terminada, pero el total no coincide con la boleta. Corrige cantidades, montos o agrega productos faltantes antes de guardar.');
    } else {
      updateReceiptStatus(`Lectura terminada. Revisa cantidades, total de línea/precio unitario y corrige ${receiptDetectedItems.length} productos antes de agregarlos.`);
    }
  } catch (error) {
    console.error(error);
    showNotice('Error al leer boleta', 'No se pudo procesar la imagen. Prueba con otra foto más clara.');
    updateReceiptStatus('No se pudo leer la boleta.');
  } finally {
    dom.processReceiptButton.disabled = false;
  }
}

function reparseReceiptRawText() {
  const text = dom.receiptRawTextInput?.value || '';

  if (!text.trim()) {
    showToast('No hay texto para detectar.');
    return;
  }

  receiptDetectedItems = parseReceiptText(text);
  receiptMismatchAccepted = false;
  renderReceiptDetectedItems();

  if (receiptDetectedItems.length === 0) {
    updateReceiptStatus('No se detectaron productos. Puedes editar el texto leído y volver a intentar.');
    return;
  }

  const receiptMetrics = getReceiptSelectionMetrics();
  if (receiptMetrics.mismatch) {
    updateReceiptStatus('Se detectaron productos, pero el total no coincide con la boleta. Revisa la alerta antes de agregar.');
  } else {
    updateReceiptStatus(`Se detectaron ${receiptDetectedItems.length} productos desde el texto. Revisa si el monto leído es total de línea o precio unitario.`);
  }
}

function getReceiptSelectionMetrics() {
  const items = Array.isArray(receiptDetectedItems) ? receiptDetectedItems.map(refreshReceiptDerivedValues) : [];
  const validItems = items.filter((item) => getReceiptLineTotal(item) > 0);
  const zeroItems = items.filter((item) => getReceiptLineTotal(item) <= 0);
  const selectedItems = validItems.filter((item) => item.selected);
  const detectedTotal = validItems.reduce((sum, item) => sum + getReceiptLineTotal(item), 0);
  const selectedTotal = selectedItems.reduce((sum, item) => sum + getReceiptLineTotal(item), 0);
  const receiptTotal = Number(receiptDetectedMeta?.receiptTotal || 0);
  const difference = receiptTotal > 0 ? detectedTotal - receiptTotal : 0;
  const mismatch = receiptTotal > 0 && Math.abs(difference) > Math.max(20, receiptTotal * 0.015);
  const multipleQuantityLines = validItems.filter((item) => Number(item.quantity || 1) > 1).length;

  return {
    total: items.length,
    valid: validItems.length,
    zero: zeroItems.length,
    selected: selectedItems.length,
    detectedTotal,
    selectedTotal,
    receiptTotal,
    difference,
    mismatch,
    multipleQuantityLines,
  };
}


function resetReceiptMismatchAcceptance() {
  receiptMismatchAccepted = false;
}

function acceptReceiptMismatchAndContinue() {
  const metrics = getReceiptSelectionMetrics();

  if (!metrics.mismatch) {
    showToast('El total ya coincide con la boleta. Puedes agregar los productos.');
    return;
  }

  receiptMismatchAccepted = true;
  updateReceiptSelectionSummary();
  updateReceiptStatus('Guardar igual autorizado. Revisa por última vez y presiona “Agregar seleccionados”.');
}

function updateReceiptSelectionSummary() {
  if (!dom.receiptSelectionSummary) return;

  const metrics = getReceiptSelectionMetrics();
  const countText = `${metrics.selected} seleccionado${metrics.selected === 1 ? '' : 's'}`;
  dom.receiptSelectionSummary.textContent = `${countText} · ${formatCurrency(metrics.selectedTotal)}`;

  if (dom.receiptDetectedTotalOutput) {
    dom.receiptDetectedTotalOutput.textContent = formatCurrency(metrics.detectedTotal);
  }

  if (dom.receiptSelectedTotalOutput) {
    dom.receiptSelectedTotalOutput.textContent = formatCurrency(metrics.selectedTotal);
  }

  if (dom.receiptBillTotalOutput) {
    dom.receiptBillTotalOutput.textContent = metrics.receiptTotal > 0 ? formatCurrency(metrics.receiptTotal) : 'No detectado';
  }

  if (dom.receiptDifferenceOutput) {
    dom.receiptDifferenceOutput.textContent = metrics.receiptTotal > 0 ? formatCurrency(Math.abs(metrics.difference)) : 'Sin comparar';
    dom.receiptDifferenceOutput.classList.toggle('has-warning', metrics.mismatch);
  }

  if (dom.receiptTipDetectedOutput) {
    const tip = Number(receiptDetectedMeta?.tip || 0);
    const grandTotal = Number(receiptDetectedMeta?.grandTotal || 0);
    dom.receiptTipDetectedOutput.textContent = tip > 0
      ? `${formatCurrency(tip)}${grandTotal > 0 ? ` · ${formatCurrency(grandTotal)} c/prop.` : ''}`
      : 'No detectada';
  }

  if (dom.receiptZeroWarningOutput) {
    const warnings = [];
    if (metrics.zero > 0) {
      warnings.push(`${metrics.zero} monto${metrics.zero === 1 ? '' : 's'} en $0`);
    }
    if (metrics.mismatch) {
      warnings.push('total no coincide');
    }
    if (metrics.multipleQuantityLines > 0 && !metrics.mismatch) {
      warnings.push('cantidades OK');
    }
    dom.receiptZeroWarningOutput.textContent = warnings.length ? warnings.join(' · ') : 'Sin alertas';
    dom.receiptZeroWarningOutput.classList.toggle('has-warning', metrics.zero > 0 || metrics.mismatch);
  }

  if (dom.receiptReviewHintOutput) {
    if (metrics.mismatch) {
      dom.receiptReviewHintOutput.textContent = 'Total no coincide: corrige montos, ajusta total o agrega diferencia antes de guardar.';
    } else if (metrics.zero > 0) {
      dom.receiptReviewHintOutput.textContent = 'Hay productos con monto $0. Complétalos o usa Ignorar $0.';
    } else if (metrics.selected === 0 && metrics.valid > 0) {
      dom.receiptReviewHintOutput.textContent = 'Selecciona productos válidos para agregarlos a la cuenta.';
    } else {
      dom.receiptReviewHintOutput.textContent = 'Edita nombre, cantidad o monto antes de agregar.';
    }
  }

  if (dom.receiptAuditWarning && dom.receiptAuditWarningText) {
    const canCompare = metrics.receiptTotal > 0;
    const missingAmount = canCompare ? Math.max(0, metrics.receiptTotal - metrics.detectedTotal) : 0;

    dom.receiptAuditWarning.classList.toggle('hidden', !metrics.mismatch);

    if (metrics.mismatch) {
      const direction = metrics.detectedTotal < metrics.receiptTotal ? 'faltan' : 'sobran';
      const amount = Math.abs(metrics.receiptTotal - metrics.detectedTotal);
      const actionHint = direction === 'faltan'
        ? 'Puedes agregar una fila por la diferencia, editar montos o quitar líneas mal leídas.'
        : 'Revisa si hay líneas duplicadas, propina leída como producto o montos que no corresponden al consumo.';
      dom.receiptAuditWarningText.textContent = `Detectamos ${formatCurrency(metrics.detectedTotal)} en productos, pero la boleta indica ${formatCurrency(metrics.receiptTotal)}. ${direction === 'faltan' ? 'Faltan' : 'Sobran'} ${formatCurrency(amount)}. ${actionHint}`;
    } else if (canCompare) {
      dom.receiptAuditWarningText.textContent = 'El total detectado coincide con el total de la boleta.';
      receiptMismatchAccepted = false;
    } else {
      dom.receiptAuditWarningText.textContent = '';
      receiptMismatchAccepted = false;
    }

    if (dom.addMissingReceiptDifferenceButton) {
      dom.addMissingReceiptDifferenceButton.classList.toggle('hidden', !(metrics.mismatch && missingAmount > 0));
      dom.addMissingReceiptDifferenceButton.textContent = missingAmount > 0
        ? `Agregar diferencia ${formatCurrency(missingAmount)}`
        : 'Agregar diferencia';
    }

    if (dom.receiptContinueDespiteMismatchButton) {
      dom.receiptContinueDespiteMismatchButton.classList.toggle('hidden', !metrics.mismatch);
      dom.receiptContinueDespiteMismatchButton.textContent = receiptMismatchAccepted ? 'Guardar igual autorizado' : 'Guardar igual';
    }

    if (dom.addReceiptItemsButton) {
      dom.addReceiptItemsButton.textContent = metrics.mismatch && !receiptMismatchAccepted
        ? 'Revisar antes de agregar'
        : 'Agregar seleccionados';
    }
  }
}


function getReceiptReviewLabel(item) {
  const quantity = Math.max(1, Number(item.quantity || 1));
  const lineTotal = getReceiptLineTotal(item);
  const unitPrice = getReceiptUnitPrice(item);

  if (item.nonConsumptionSuspect) {
    return 'Revisar: posible dato de boleta';
  }

  if (lineTotal <= 0 || item.needsReview) {
    return 'Completar monto';
  }

  if (quantity > 1 && item.amountMode === 'line') {
    if (!Number.isInteger(unitPrice)) {
      return 'Revisar cantidad';
    }
    return 'No multiplica doble';
  }

  return 'OK';
}

function renderReceiptDetectedItems() {
  dom.receiptDetectedBody.innerHTML = '';
  dom.receiptDetectedCount.textContent = `${receiptDetectedItems.length} encontrados`;

  if (receiptDetectedItems.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="8">No hay productos detectados todavía.</td>`;
    dom.receiptDetectedBody.appendChild(row);
    updateReceiptSelectionSummary();
    return;
  }

  for (const item of receiptDetectedItems) {
    refreshReceiptDerivedValues(item);
    const row = document.createElement('tr');
    row.dataset.itemId = item.id;
    row.classList.toggle('receipt-row-warning', getReceiptLineTotal(item) <= 0 || Boolean(item.needsReview));
    row.innerHTML = `
      <td><input type="checkbox" ${item.selected ? 'checked' : ''} aria-label="Usar producto" /></td>
      <td><input type="text" value="${escapeHtml(item.name)}" aria-label="Producto detectado" /></td>
      <td><input type="number" min="1" step="1" value="${item.quantity}" aria-label="Cantidad detectada" /></td>
      <td><input type="number" min="0" step="1" value="${item.amount}" aria-label="Monto leído" /></td>
      <td>
        <select class="receipt-amount-mode" aria-label="Tipo de monto detectado">
          <option value="line" ${item.amountMode === 'line' ? 'selected' : ''}>Total línea</option>
          <option value="unit" ${item.amountMode === 'unit' ? 'selected' : ''}>Precio unitario</option>
        </select>
        <small class="receipt-derived-total">Total: ${formatCurrency(getReceiptLineTotal(item))} · Unit.: ${formatCurrency(getReceiptUnitPrice(item))}</small>
      </td>
      <td>
        <select aria-label="Categoría detectada">
          ${CATEGORIES.map((category) => `<option ${category === item.category ? 'selected' : ''}>${category}</option>`).join('')}
        </select>
      </td>
      <td class="receipt-review-cell">${getReceiptReviewLabel(item)}</td>
      <td><button class="btn btn-light btn-small receipt-remove-row" type="button">No es consumo</button></td>
    `;

    const checkbox = row.querySelector('input[type="checkbox"]');
    const nameInput = row.querySelector('input[type="text"]');
    const quantityInput = row.querySelector('input[type="number"][aria-label="Cantidad detectada"]');
    const amountInput = row.querySelector('input[type="number"][aria-label="Monto leído"]');
    const amountModeSelect = row.querySelector('.receipt-amount-mode');
    const categorySelect = row.querySelector('select[aria-label="Categoría detectada"]');
    const derivedTotal = row.querySelector('.receipt-derived-total');
    const reviewCell = row.querySelector('.receipt-review-cell');
    const removeRowButton = row.querySelector('.receipt-remove-row');

    const updateRowDerived = () => {
      refreshReceiptDerivedValues(item);
      derivedTotal.textContent = `Total: ${formatCurrency(getReceiptLineTotal(item))} · Unit.: ${formatCurrency(getReceiptUnitPrice(item))}`;
      reviewCell.textContent = getReceiptReviewLabel(item);
      row.classList.toggle('receipt-row-warning', getReceiptLineTotal(item) <= 0 || Boolean(item.needsReview));
      resetReceiptMismatchAcceptance();
      updateReceiptSelectionSummary();
    };

    checkbox.addEventListener('change', () => {
      item.selected = checkbox.checked;
      resetReceiptMismatchAcceptance();
      updateReceiptSelectionSummary();
    });

    nameInput.addEventListener('input', () => {
      item.name = nameInput.value;
      item.nonConsumptionSuspect = isReceiptSuspiciousNonConsumptionName(item.name);
      item.needsReview = item.nonConsumptionSuspect || item.needsReview;
      updateRowDerived();
    });

    quantityInput.addEventListener('input', () => {
      item.quantity = Math.max(1, Number(quantityInput.value || 1));
      item.needsReview = false;
      updateRowDerived();
    });

    amountInput.addEventListener('input', () => {
      item.amount = Number(amountInput.value || 0);
      item.needsReview = false;
      updateRowDerived();
    });

    amountModeSelect.addEventListener('change', () => {
      item.amountMode = amountModeSelect.value === 'unit' ? 'unit' : 'line';
      updateRowDerived();
    });

    categorySelect.addEventListener('change', () => {
      item.category = categorySelect.value;
      resetReceiptMismatchAcceptance();
      updateReceiptSelectionSummary();
    });

    removeRowButton?.addEventListener('click', () => {
      receiptDetectedItems = receiptDetectedItems.filter((candidate) => candidate.id !== item.id);
      renderReceiptDetectedItems();
      showToast('Fila quitada de la revisión.');
    });

    dom.receiptDetectedBody.appendChild(row);
  }

  updateReceiptSelectionSummary();
}

function setAllReceiptItems(selected) {
  resetReceiptMismatchAcceptance();
  receiptDetectedItems = receiptDetectedItems.map((item) => ({ ...item, selected }));
  renderReceiptDetectedItems();
}

function ignoreZeroReceiptItems() {
  resetReceiptMismatchAcceptance();
  const before = receiptDetectedItems.length;
  receiptDetectedItems = receiptDetectedItems.filter((item) => getReceiptLineTotal(item) > 0);
  renderReceiptDetectedItems();
  const removed = before - receiptDetectedItems.length;
  showToast(removed > 0 ? `${removed} producto${removed === 1 ? '' : 's'} de $0 ignorado${removed === 1 ? '' : 's'}.` : 'No hay montos en $0 para ignorar.');
}


function parseCurrencyInput(value) {
  const normalized = String(value || '').replace(/[^0-9,-]/g, '').replace(',', '.');
  return Math.max(0, Math.round(Number(normalized || 0)));
}

function editReceiptTotalFromPrompt() {
  const current = Number(receiptDetectedMeta?.receiptTotal || 0);
  const response = prompt('Total de la boleta para comparar:', current > 0 ? String(current) : '');
  if (response === null) return;

  const total = parseCurrencyInput(response);
  receiptDetectedMeta.receiptTotal = total;
  if (total > 0 && !Number(receiptDetectedMeta.grandTotal || 0)) {
    receiptDetectedMeta.grandTotal = total;
  }
  resetReceiptMismatchAcceptance();
  updateReceiptSelectionSummary();
  updateReceiptStatus(total > 0 ? `Total de boleta ajustado a ${formatCurrency(total)}.` : 'Total de boleta eliminado. La app no comparará diferencias hasta detectar o ingresar un total.');
}

function selectOnlyValidReceiptItems() {
  resetReceiptMismatchAcceptance();
  receiptDetectedItems = receiptDetectedItems.map((item) => {
    refreshReceiptDerivedValues(item);
    return {
      ...item,
      selected: getReceiptLineTotal(item) > 0 && !item.nonConsumptionSuspect,
    };
  });
  renderReceiptDetectedItems();
  showToast('Seleccioné solo productos con monto válido.');
}

function focusReceiptIssues() {
  const row = dom.receiptDetectedBody?.querySelector?.('.receipt-row-warning');
  if (!row) {
    showToast('No hay productos marcados para revisar.');
    return;
  }
  row.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const input = row.querySelector('input[type="text"], input[type="number"]');
  if (typeof input?.focus === 'function') input.focus();
}

function addManualReceiptItem() {
  resetReceiptMismatchAcceptance();
  receiptDetectedItems.push(refreshReceiptDerivedValues({
    id: createId('receipt'),
    selected: true,
    name: 'Producto pendiente',
    quantity: 1,
    amount: 0,
    amountMode: 'line',
    price: 0,
    unitPrice: 0,
    lineTotal: 0,
    category: getActiveBill().mode === 'home' ? 'Supermercado' : 'Comida',
    needsReview: true,
  }));

  renderReceiptDetectedItems();
  updateReceiptStatus('Fila agregada. Completa producto, cantidad y monto antes de agregar a la cuenta.');
}

function addMissingReceiptDifferenceItem() {
  resetReceiptMismatchAcceptance();
  const metrics = getReceiptSelectionMetrics();

  if (!metrics.receiptTotal || metrics.receiptTotal <= 0) {
    showToast('No se detectó el total de la boleta para calcular diferencia.');
    return;
  }

  const missingAmount = Math.round(metrics.receiptTotal - metrics.detectedTotal);

  if (missingAmount <= 0) {
    showToast('No hay diferencia faltante para agregar.');
    return;
  }

  receiptDetectedItems.push(refreshReceiptDerivedValues({
    id: createId('receipt'),
    selected: true,
    name: 'Producto faltante por revisar',
    quantity: 1,
    amount: missingAmount,
    amountMode: 'line',
    price: missingAmount,
    unitPrice: missingAmount,
    lineTotal: missingAmount,
    category: getActiveBill().mode === 'home' ? 'Supermercado' : 'Comida',
    needsReview: true,
  }));

  renderReceiptDetectedItems();
  updateReceiptStatus(`Agregué una fila por la diferencia de ${formatCurrency(missingAmount)}. Cambia el nombre, cantidad o monto si corresponde.`);
}

function addReceiptItemsToBill() {
  const bill = getActiveBill();

  if (bill.mode === 'quick') {
    showNotice('Modo rápido activo', 'Cambia a modo Detallada u Hogar para agregar productos desde boleta.');
    return;
  }

  const selectedItems = receiptDetectedItems
    .map((item) => {
      refreshReceiptDerivedValues(item);
      return {
        ...item,
        name: String(item.name || '').trim(),
        quantity: Math.max(1, Number(item.quantity || 1)),
        unitPrice: getReceiptUnitPrice(item),
        lineTotal: getReceiptLineTotal(item),
      };
    })
    .filter((item) => item.selected && item.name && item.lineTotal > 0);

  if (selectedItems.length === 0) {
    showToast('Selecciona al menos un producto válido.');
    return;
  }

  if (bill.people.length === 0) {
    showNotice('Agrega personas primero', 'Para agregar productos desde boleta necesitas tener personas en la cuenta.');
    return;
  }

  const metrics = getReceiptSelectionMetrics();
  const hasUnreviewedItems = selectedItems.some((item) => item.needsReview || item.lineTotal <= 0);

  if (metrics.mismatch && !receiptMismatchAccepted) {
    const difference = Math.abs(metrics.receiptTotal - metrics.detectedTotal);
    updateReceiptStatus(`No agregué los productos: el total detectado no coincide con la boleta. Diferencia: ${formatCurrency(difference)}. Corrige la lectura, agrega la diferencia o usa “Guardar igual” desde la alerta.`);
    showNotice('Revisa la boleta antes de guardar', `La boleta indica ${formatCurrency(metrics.receiptTotal)}, pero los productos suman ${formatCurrency(metrics.detectedTotal)}. Diferencia: ${formatCurrency(difference)}.`);
    return;
  }

  if (hasUnreviewedItems) {
    const shouldContinue = window.confirm('Hay productos marcados para revisar. ¿Quieres agregarlos igualmente?');
    if (!shouldContinue) {
      updateReceiptStatus('Completa o corrige los productos marcados antes de agregarlos.');
      return;
    }
  }

  const defaultSplitMode = bill.mode === 'home' ? 'responsibles' : 'participants';
  const defaultConsumers = defaultSplitMode === 'responsibles'
    ? []
    : bill.people.map((person) => ({
        personId: person.id,
        share: 1,
      }));

  for (const item of selectedItems) {
    bill.products.push({
      id: createId('product'),
      name: item.name,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      category: CATEGORIES.includes(item.category) ? item.category : (bill.mode === 'home' ? 'Supermercado' : 'Comida'),
      splitMode: defaultSplitMode,
      dueDate: '',
      paidById: '',
      recurring: false,
      consumers: defaultConsumers.map((consumer) => ({ ...consumer })),
    });
  }

  persistAndRender();
  closeReceiptModal();
  clearReceiptReader();
  showToast(`${selectedItems.length} productos agregados desde boleta.`);
}



function handleAuthBadgeClick() {
  if (currentSession.mode === 'user') {
    window.location.href = 'perfil.html';
    return;
  }

  openAuthModal();
}

function openAuthModal() {
  renderAuthUI();
  dom.authModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeAuthModal() {
  dom.authModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

function showLoginForm() {
  dom.loginForm.classList.remove('hidden');
  dom.registerForm.classList.add('hidden');
  dom.showLoginButton.classList.add('active');
  dom.showRegisterButton.classList.remove('active');
}

function showRegisterForm() {
  dom.registerForm.classList.remove('hidden');
  dom.loginForm.classList.add('hidden');
  dom.showRegisterButton.classList.add('active');
  dom.showLoginButton.classList.remove('active');
}
async function registerLocalUser(event) {
  event.preventDefault();

  if (!hasSupabaseClient()) {
    showNotice('Modo invitado disponible', 'No se pudo cargar la conexión de usuario. Puedes seguir usando Cuenta Clara como invitado.');
    return;
  }

  const name = dom.registerNameInput.value.trim();
  const email = normalizeEmail(dom.registerEmailInput.value);
  const password = dom.registerPasswordInput.value;
  const guestState = normalizeState(state);

  if (!name) {
    showToast('Ingresa tu nombre.');
    return;
  }

  if (!email) {
    showToast('Ingresa tu correo.');
    return;
  }

  if (!password || password.length < 6) {
    showToast('La contraseña debe tener al menos 6 caracteres.');
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre: name,
      },
    },
  });

  if (error) {
    showNotice('No se pudo crear la cuenta', error.message);
    return;
  }

  const sessionUser = data?.session?.user || data?.user;

  if (!data?.session) {
    showNotice('Cuenta creada', 'Revisa tu correo para confirmar la cuenta antes de iniciar sesión.');
    return;
  }

  setUserSession(sessionUser);
  saveAuthSession();

  if (dom.importGuestDataCheckbox.checked) {
    state = guestState;
  } else {
    state = normalizeState(null);
  }

  state.profile = makeDefaultProfile({
    nick: name,
    name,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  });

  migrateEmptyDefaultPeople();
  localStorage.setItem(activeStorageKey, JSON.stringify(state));
  await saveCloudStateNow();
  await savePublicProfileFromMain();
  render();
  closeAuthModal();
  showToast('Cuenta creada y sincronizada.');
}

async function loginLocalUser(event) {
  event.preventDefault();

  if (!hasSupabaseClient()) {
    showNotice('Modo invitado disponible', 'No se pudo cargar la conexión de usuario. Puedes seguir usando Cuenta Clara como invitado.');
    return;
  }

  const email = normalizeEmail(dom.loginEmailInput.value);
  const password = dom.loginPasswordInput.value;

  if (!email || !password) {
    showToast('Ingresa correo y contraseña.');
    return;
  }

  saveState();

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    showNotice('No se pudo iniciar sesión', error.message);
    return;
  }

  setUserSession(data.user);
  saveAuthSession();

  const loaded = await loadCloudState();
  await savePublicProfileFromMain();

  if (!loaded) {
    loadState();
  }

  migrateEmptyDefaultPeople();
  saveState();
  render();
  closeAuthModal();
  showToast('Sesión iniciada.');
}

function switchToGuestMode() {
  saveState();
  supabaseClient?.auth?.signOut?.();
  clearAuthSession();
  loadState();
  migrateEmptyDefaultPeople();
  saveState();
  render();
  closeAuthModal();
  showToast('Modo invitado activo.');
}

async function logoutLocalUser() {
  saveState();

  if (hasSupabaseClient()) {
    await saveCloudStateNow();
    await supabaseClient.auth.signOut();
  }

  clearAuthSession();
  loadState();
  migrateEmptyDefaultPeople();
  saveState();
  render();
  closeAuthModal();
  showToast('Sesión cerrada.');
}


function normalizePhoneNumber(value) {
  return window.CuentaClaraUtils.normalizePhoneNumber(value);
}

function formatPhoneForDisplay(value) {
  return window.CuentaClaraUtils.formatPhoneForDisplay(value);
}

function buildPersonalWhatsappMessage(person, amount) {
  const bill = getActiveBill();
  const calculation = calculateBill(bill);
  const payer = bill.people.find((item) => item.id === bill.payerId);
  const lines = [
    `Hola ${person.name}, te comparto el resumen de *${bill.name}*.`,
    '',
    `Monto a pagar: *${formatCurrency(amount || 0)}*`,
  ];

  if (payer && payer.id !== person.id && amount > 0) {
    lines.push(`Transferir a: *${payer.name}*`);
  }

  if (bill.mode === 'home' && bill.homeMonth) {
    lines.push(`Mes: *${bill.homeMonth}*`);
  }

  lines.push('');
  lines.push(`Total cuenta: *${formatCurrency(calculation.grandTotal)}*`);

  return lines.join('\n');
}

function openPersonWhatsapp(personId, amount = 0) {
  const bill = getActiveBill();
  const person = bill.people.find((item) => item.id === personId);

  if (!person) {
    showToast('No se encontró la persona.');
    return;
  }

  const phone = normalizePhoneNumber(person.phone);

  if (!phone) {
    showNotice('Teléfono faltante', `Agrega un teléfono a ${person.name} para enviarle WhatsApp.`);
    return;
  }

  const message = buildPersonalWhatsappMessage(person, amount);
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
}

function getCurrentMonthValue() {
  return new Date().toISOString().slice(0, 7);
}

function makeDefaultBill() {
  const createdAt = nowIso();

  return {
    id: createId('bill'),
    name: 'Nueva cuenta',
    mode: 'detailed',
    quickTotal: 0,
    homeMonth: getCurrentMonthValue(),
    payerId: '',
    tipPercent: 10,
    archived: false,
    closed: false,
    closedAt: '',
    paymentDueAt: '',
    activity: [],
    recurringGroupId: '',
    recurringSequence: 1,
    previousBillId: '',
    recurringCarryoverNotes: [],
    sharedAccountId: '',
    sharedRole: '',
    sharedOwnerId: '',
    createdAt,
    updatedAt: createdAt,
    people: [],
    products: [],
  };
}

function makeDefaultQuickProducts() {
  return DEFAULT_QUICK_PRODUCTS.map((product) => ({
    id: createId('quick'),
    name: product.name,
    category: product.category,
  }));
}

function normalizeQuickProducts(products) {
  if (!Array.isArray(products) || products.length === 0) {
    return makeDefaultQuickProducts();
  }

  return products
    .map((product) => ({
      id: product.id || createId('quick'),
      name: String(product.name || '').trim(),
      category: CATEGORIES.includes(product.category) ? product.category : 'Otros',
    }))
    .filter((product) => product.name);
}


function makeDefaultProfile(input = {}) {
  const sessionName = currentSession?.name && currentSession.name !== 'Usuario'
    ? currentSession.name
    : '';

  return window.CuentaClaraUtils.makeDefaultProfile(input, sessionName);
}

function getProfile() {
  state.profile = makeDefaultProfile(state.profile || {});
  return state.profile;
}

function getProfileDisplayName() {
  const profile = getProfile();
  return profile.nick || profile.name || currentSession.name || currentSession.email || 'Usuario';
}

function getInitials(value) {
  return window.CuentaClaraUtils.getInitials(value);
}



function normalizeFriends(input = []) {
  return window.CuentaClaraUtils.normalizeFriends(input);
}

function getFriends() {
  state.friends = normalizeFriends(state.friends || []);
  return state.friends;
}


function normalizeRecurringGroups(input = []) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((group) => ({
      id: group.id || createId('recurring'),
      name: String(group.name || 'Cuenta recurrente').trim() || 'Cuenta recurrente',
      category: String(group.category || 'Hogar').trim() || 'Hogar',
      frequency: group.frequency === 'monthly' ? 'monthly' : 'monthly',
      billIds: Array.isArray(group.billIds) ? [...new Set(group.billIds.filter(Boolean))] : [],
      members: Array.isArray(group.members)
        ? group.members.map((member) => ({
            name: String(member.name || '').trim(),
            phone: normalizePhoneNumber(member.phone || ''),
            email: normalizeEmail(member.email || ''),
            userId: String(member.userId || ''),
          })).filter((member) => member.name || member.email || member.userId)
        : [],
      createdAt: group.createdAt || nowIso(),
      updatedAt: group.updatedAt || group.createdAt || nowIso(),
    }))
    .filter((group) => group.name);
}

function normalizeAppSettings(input = {}) {
  return {
    whatsappNotificationsEnabled: Boolean(input?.whatsappNotificationsEnabled),
    whatsappNotificationsActivatedAt: input?.whatsappNotificationsActivatedAt || '',
  };
}

function createStatePayload(bills, activeBillId, input = {}) {
  return {
    bills,
    activeBillId,
    quickProducts: normalizeQuickProducts(input?.quickProducts),
    profile: makeDefaultProfile(input?.profile || {}),
    friends: normalizeFriends(input?.friends || []),
    recurringGroups: normalizeRecurringGroups(input?.recurringGroups || []),
    appSettings: normalizeAppSettings(input?.appSettings || {}),
  };
}

function normalizeBillActivity(input = []) {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => ({
      id: String(item.id || createId('activity')),
      type: String(item.type || 'general'),
      message: String(item.message || '').trim(),
      actor: String(item.actor || '').trim(),
      actorId: String(item.actorId || ''),
      at: item.at || item.createdAt || nowIso(),
    }))
    .filter((item) => item.message)
    .slice(0, 40);
}

function normalizeRecurringCarryoverNotes(input = []) {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => ({
      id: String(item.id || createId('carryover')),
      personKey: String(item.personKey || item.key || ''),
      personName: String(item.personName || item.name || 'Persona'),
      amount: Math.max(0, Math.round(Number(item.amount || 0))),
      sourceBillId: String(item.sourceBillId || ''),
      sourceMonth: String(item.sourceMonth || ''),
      status: ['separate', 'ignored', 'paid'].includes(item.status) ? item.status : 'separate',
      createdAt: item.createdAt || nowIso(),
    }))
    .filter((item) => item.amount > 0)
    .slice(0, 80);
}

function getBillActorLabel() {
  if (currentSession.mode === 'user') {
    return getProfileDisplayName() || currentSession.email || 'Usuario';
  }
  return 'Invitado';
}

function addBillActivity(message, type = 'general', bill = getActiveBill()) {
  if (!bill || !message) return;

  bill.activity = normalizeBillActivity(bill.activity);
  bill.activity.unshift({
    id: createId('activity'),
    type,
    message: String(message).trim(),
    actor: getBillActorLabel(),
    actorId: currentSession.userId || currentSession.email || '',
    at: nowIso(),
  });
  bill.activity = bill.activity.slice(0, 40);
}

function normalizeState(input) {
  if (!input || !Array.isArray(input.bills)) {
    const bill = makeDefaultBill();
    return createStatePayload([bill], bill.id, input);
  }

  const bills = input.bills.map((bill) => {
    const people = Array.isArray(bill.people)
      ? bill.people.map((person) => ({
          id: person.id || createId('person'),
          name: String(person.name || 'Persona'),
          phone: normalizePhoneNumber(person.phone || ''),
          email: normalizeEmail(person.email || ''),
          userId: String(person.userId || person.profileId || ''),
          previousDebt: Math.max(0, Number(person.previousDebt || 0)),
          paid: Boolean(person.paid),
        }))
      : [];

    const normalized = {
      id: bill.id || createId('bill'),
      name: String(bill.name || 'Cuenta sin nombre'),
      mode: ['quick', 'home'].includes(bill.mode) ? bill.mode : 'detailed',
      quickTotal: Number(bill.quickTotal || 0),
      homeMonth: bill.homeMonth || getCurrentMonthValue(),
      payerId: bill.payerId && people.some((p) => p.id === bill.payerId) ? bill.payerId : '',
      tipPercent: Number.isFinite(Number(bill.tipPercent)) ? Number(bill.tipPercent) : 10,
      archived: Boolean(bill.archived),
      closed: Boolean(bill.closed),
      closedAt: bill.closedAt || '',
      paymentDueAt: /^\d{4}-\d{2}-\d{2}$/.test(String(bill.paymentDueAt || '')) ? String(bill.paymentDueAt) : '',
      activity: normalizeBillActivity(bill.activity),
      recurringGroupId: String(bill.recurringGroupId || ''),
      recurringSequence: Math.max(1, Number(bill.recurringSequence || 1)),
      previousBillId: String(bill.previousBillId || ''),
      recurringCarryoverNotes: normalizeRecurringCarryoverNotes(bill.recurringCarryoverNotes),
      sharedAccountId: String(bill.sharedAccountId || ''),
      sharedRole: String(bill.sharedRole || ''),
      sharedOwnerId: String(bill.sharedOwnerId || ''),
      templateKey: String(bill.templateKey || ''),
      templateLabel: String(bill.templateLabel || ''),
      createdAt: bill.createdAt || nowIso(),
      updatedAt: bill.updatedAt || bill.createdAt || nowIso(),
      people,
      products: Array.isArray(bill.products)
        ? bill.products.map((product) => ({
            id: product.id || createId('product'),
            name: String(product.name || 'Producto'),
            unitPrice: Number(product.unitPrice ?? product.price ?? 0),
            quantity: Number(product.quantity ?? 1),
            category: CATEGORIES.includes(product.category) ? product.category : 'Otros',
            splitMode: product.splitMode === 'responsibles' ? 'responsibles' : 'participants',
            dueDate: product.dueDate || '',
            recurring: Boolean(product.recurring),
            consumers: Array.isArray(product.consumers)
              ? product.consumers.map((consumer) => ({
                  personId: consumer.personId,
                  share: Math.max(1, Number(consumer.share || 1)),
                }))
              : [],
          }))
        : [],
    };

    return normalized;
  });

  if (bills.length === 0) {
    const bill = makeDefaultBill();
    return createStatePayload([bill], bill.id, input);
  }

  const activeBillId = bills.some((bill) => bill.id === input.activeBillId)
    ? input.activeBillId
    : bills[0].id;

  return createStatePayload(bills, activeBillId, input);
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(activeStorageKey));
    state = normalizeState(saved);
  } catch {
    state = normalizeState(null);
  }
}


function migrateEmptyDefaultPeople() {
  let changed = false;

  for (const bill of state.bills) {
    const names = (bill.people || []).map((person) => person.name).sort().join('|');
    const isOldEmptyStarter =
      bill.name === 'Nueva cuenta' &&
      names === 'Carlos|Vale' &&
      (!Array.isArray(bill.products) || bill.products.length === 0) &&
      (!bill.quickTotal || Number(bill.quickTotal) === 0);

    if (isOldEmptyStarter) {
      bill.people = [];
      bill.payerId = '';
      changed = true;
    }
  }

  if (changed) {
    saveState();
  }
}


function saveState() {
  try {
    localStorage.setItem(activeStorageKey, JSON.stringify(state));
    lastLocalSaveAt = nowIso();
  } catch (error) {
    console.warn('No se pudo guardar en este dispositivo:', error);
    showNotice('No se pudo guardar en este navegador', 'La cuenta sigue abierta, pero el navegador no permitió guardar en este dispositivo. Si tienes sesión iniciada, intentaré sincronizarla igual; también puedes exportar respaldo.');
  }

  scheduleCloudSave();
  scheduleSharedActiveBillSave();
}

function getActiveBill() {
  if (!state || !Array.isArray(state.bills) || state.bills.length === 0) {
    const bill = makeDefaultBill();
    state = normalizeState({ bills: [bill], activeBillId: bill.id });
    return bill;
  }

  const activeBill = state.bills.find((bill) => bill.id === state.activeBillId) || state.bills[0];

  if (!state.activeBillId || !state.bills.some((bill) => bill.id === state.activeBillId)) {
    state.activeBillId = activeBill.id;
  }

  return activeBill;
}

function touchActiveBill() {
  const bill = getActiveBill();
  bill.updatedAt = nowIso();
}

function persistAndRender() {
  touchActiveBill();
  saveState();
  render();
}

function captureUndoSnapshot(label = 'Cambio') {
  try {
    return {
      label,
      stateJson: JSON.stringify(state),
      activeBillId: state?.activeBillId || '',
      section: currentAppSection || 'home',
      editingProductId: editingProductId || '',
    };
  } catch (error) {
    console.warn('No se pudo preparar deshacer:', error);
    return null;
  }
}

function restoreUndoSnapshot(snapshot) {
  if (!snapshot?.stateJson) return false;

  try {
    state = normalizeState(JSON.parse(snapshot.stateJson));
    if (snapshot.activeBillId && state.bills.some((bill) => bill.id === snapshot.activeBillId)) {
      state.activeBillId = snapshot.activeBillId;
    }
    editingProductId = snapshot.editingProductId || null;
    saveState();
    render();
    setAppSection(snapshot.section || 'home', { scroll: false });
    return true;
  } catch (error) {
    console.error(error);
    showNotice('No se pudo deshacer', 'El cambio ya fue procesado, pero tus datos actuales siguen guardados.');
    return false;
  }
}

function undoLastAction() {
  const snapshot = lastUndoAction;
  lastUndoAction = null;

  if (!snapshot) {
    showToast('No hay cambios recientes para deshacer.');
    return;
  }

  if (restoreUndoSnapshot(snapshot)) {
    showToast('Cambio deshecho.');
  }
}

function showUndoToast(message, snapshot) {
  if (!snapshot) {
    showToast(message);
    return;
  }

  lastUndoAction = snapshot;
  showToast(message, {
    actionLabel: 'Deshacer',
    onAction: undoLastAction,
    duration: 5200,
  });
}

function confirmAction(title, detail) {
  return confirm(`${title}${detail ? `\n\n${detail}` : ''}`);
}

function showToast(message, options = {}) {
  clearTimeout(toastTimer);
  const text = String(message || '');
  const actionLabel = options.actionLabel ? String(options.actionLabel) : '';

  dom.toast.classList.toggle('has-action', Boolean(actionLabel && typeof options.onAction === 'function'));

  if (actionLabel && typeof options.onAction === 'function') {
    dom.toast.innerHTML = `
      <span>${escapeHtml(text)}</span>
      <button class="toast-action" type="button">${escapeHtml(actionLabel)}</button>
    `;
    dom.toast.querySelector('.toast-action')?.addEventListener('click', () => {
      clearTimeout(toastTimer);
      dom.toast.classList.remove('show', 'has-action');
      options.onAction();
    });
  } else {
    dom.toast.textContent = text;
  }

  dom.toast.classList.add('show');

  toastTimer = setTimeout(() => {
    dom.toast.classList.remove('show', 'has-action');
  }, Number(options.duration || 2400));
}

function showNotice(title, message) {
  clearTimeout(noticeTimer);
  dom.noticeTitle.textContent = title;
  dom.noticeMessage.textContent = message;
  dom.noticeTab.classList.remove('hidden');

  noticeTimer = setTimeout(() => {
    dom.noticeTab.classList.add('hidden');
  }, 5600);
}

function cloneEmptyState() {
  return dom.emptyStateTemplate.content.cloneNode(true);
}

function calculateBill(bill = getActiveBill()) {
  const baseTotals = Object.fromEntries(bill.people.map((person) => [person.id, 0]));
  const personDetails = Object.fromEntries(
    bill.people.map((person) => [
      person.id,
      {
        person,
        items: [],
        subtotal: 0,
        tip: 0,
        total: 0,
      },
    ])
  );
  const categoryTotals = Object.fromEntries(CATEGORIES.map((category) => [category, 0]));

  if (bill.mode === 'quick') {
    const totalPeople = bill.people.length;
    const quickTotal = Number(bill.quickTotal) || 0;

    if (totalPeople > 0 && quickTotal > 0) {
      const perPerson = quickTotal / totalPeople;

      for (const person of bill.people) {
        baseTotals[person.id] = perPerson;
        personDetails[person.id].items.push({
          productId: 'quick_total',
          productName: 'Cuenta rápida',
          unitPrice: quickTotal,
          quantity: 1,
          productTotal: quickTotal,
          share: 1,
          totalShares: totalPeople,
          amount: perPerson,
          category: 'Otros',
        });
      }

      categoryTotals.Otros = quickTotal;
    }
  } else {
    for (const product of bill.products) {
      const validConsumers = product.consumers.filter((consumer) =>
        bill.people.some((person) => person.id === consumer.personId)
      );

      const totalShares = validConsumers.reduce((sum, consumer) => sum + Math.max(1, Number(consumer.share || 1)), 0);

      if (totalShares <= 0) {
        continue;
      }

      const productTotal = Number(product.unitPrice) * Number(product.quantity);
      const category = CATEGORIES.includes(product.category) ? product.category : 'Otros';
      categoryTotals[category] += productTotal;

      for (const consumer of validConsumers) {
        const share = Math.max(1, Number(consumer.share || 1));
        const amount = productTotal * (share / totalShares);

        baseTotals[consumer.personId] += amount;

        if (personDetails[consumer.personId]) {
          personDetails[consumer.personId].items.push({
            productId: product.id,
            productName: product.name,
            unitPrice: Number(product.unitPrice),
            quantity: Number(product.quantity),
            productTotal,
            share,
            totalShares,
            amount,
            category,
            splitMode: product.splitMode || 'participants',
          });
        }
      }
    }
  }

  for (const person of bill.people) {
    const previousDebt = Math.max(0, Number(person.previousDebt || 0));

    if (previousDebt > 0) {
      baseTotals[person.id] = (baseTotals[person.id] || 0) + previousDebt;

      if (personDetails[person.id]) {
        personDetails[person.id].items.push({
          productId: 'previous_debt',
          productName: 'Deuda anterior',
          unitPrice: previousDebt,
          quantity: 1,
          productTotal: previousDebt,
          share: 1,
          totalShares: 1,
          amount: previousDebt,
          category: 'Otros',
          splitMode: 'carryover',
        });
      }
    }
  }

  const subtotal = Object.values(baseTotals).reduce((sum, value) => sum + value, 0);
  const tipPercent = bill.mode === 'home' ? 0 : (Number(bill.tipPercent) || 0);
  const tipAmount = subtotal * (tipPercent / 100);
  const finalTotals = {};
  let paidTotal = 0;
  let pendingTotal = 0;

  for (const person of bill.people) {
    const personSubtotal = baseTotals[person.id] || 0;
    const personTip = personSubtotal * (tipPercent / 100);
    const finalAmount = personSubtotal + personTip;

    finalTotals[person.id] = finalAmount;
    personDetails[person.id].subtotal = personSubtotal;
    personDetails[person.id].tip = personTip;
    personDetails[person.id].total = finalAmount;

    if (person.paid) {
      paidTotal += finalAmount;
    } else {
      pendingTotal += finalAmount;
    }
  }

  const paidPeople = bill.people.filter((person) => person.paid).length;
  const isPaid = bill.people.length > 0 && paidPeople === bill.people.length;

  return {
    subtotal,
    tipAmount,
    grandTotal: subtotal + tipAmount,
    paidTotal,
    pendingTotal,
    baseTotals,
    finalTotals,
    personDetails,
    categoryTotals,
    paidPeople,
    totalPeople: bill.people.length,
    isPaid,
  };
}

function getBillStatus(bill) {
  const calc = calculateBill(bill);

  if (bill.archived) return 'archived';
  if (bill.closed) return 'closed';
  if (calc.isPaid) return 'paid';
  return 'pending';
}


function renderQuickProducts() {
  dom.quickProductsList.innerHTML = '';
  dom.quickProductsManager.innerHTML = '';

  if (!state.quickProducts || state.quickProducts.length === 0) {
    dom.quickProductsList.appendChild(emptyMessage('No hay productos rápidos. Agrega algunos desde Editar rápidos.'));
    return;
  }

  for (const product of state.quickProducts) {
    const button = document.createElement('button');
    button.className = 'chip';
    button.type = 'button';
    button.textContent = `+ ${product.name}`;
    button.title = `${product.name} · ${product.category}`;

    button.addEventListener('click', () => {
      dom.productNameInput.value = product.name;
      dom.productCategoryInput.value = product.category || 'Otros';
      dom.productPriceInput.focus();
    });

    dom.quickProductsList.appendChild(button);

    const row = document.createElement('div');
    row.className = 'quick-product-manager-row';
    row.innerHTML = `
      <div>
        <strong title="${escapeHtml(product.name)}">${escapeHtml(product.name)}</strong>
        <span>${escapeHtml(product.category)}</span>
      </div>
      <button class="icon-button edit" type="button" aria-label="Editar ${escapeHtml(product.name)}">✎</button>
      <button class="icon-button danger" type="button" aria-label="Eliminar ${escapeHtml(product.name)}">×</button>
    `;

    row.querySelector('.icon-button.edit').addEventListener('click', () => {
      editQuickProduct(product.id);
    });

    row.querySelector('.icon-button.danger').addEventListener('click', () => {
      deleteQuickProduct(product.id);
    });

    dom.quickProductsManager.appendChild(row);
  }
}

function addQuickProduct(name, category) {
  const cleanName = name.trim();

  if (!cleanName) {
    showToast('Ingresa el nombre del producto rápido.');
    return;
  }

  const exists = state.quickProducts.some((product) => product.name.toLowerCase() === cleanName.toLowerCase());

  if (exists) {
    showNotice('Producto repetido', 'Ya existe un producto rápido con ese nombre.');
    return;
  }

  state.quickProducts.push({
    id: createId('quick'),
    name: cleanName,
    category: CATEGORIES.includes(category) ? category : 'Otros',
  });

  dom.quickProductNameInput.value = '';
  saveState();
  renderQuickProducts();
  showToast('Producto rápido agregado.');
}

function editQuickProduct(productId) {
  const product = state.quickProducts.find((item) => item.id === productId);

  if (!product) {
    return;
  }

  const newName = prompt('Nuevo nombre del producto rápido:', product.name);

  if (newName === null) {
    return;
  }

  const cleanName = newName.trim();

  if (!cleanName) {
    showToast('El nombre no puede quedar vacío.');
    return;
  }

  const exists = state.quickProducts.some(
    (item) => item.id !== productId && item.name.toLowerCase() === cleanName.toLowerCase()
  );

  if (exists) {
    showNotice('Producto repetido', 'Ya existe un producto rápido con ese nombre.');
    return;
  }

  const newCategory = prompt(`Categoría (${CATEGORIES.join(', ')}):`, product.category);

  if (newCategory === null) {
    return;
  }

  product.name = cleanName;
  product.category = CATEGORIES.includes(newCategory.trim()) ? newCategory.trim() : 'Otros';

  saveState();
  renderQuickProducts();
  showToast('Producto rápido actualizado.');
}

function deleteQuickProduct(productId) {
  const product = state.quickProducts.find((item) => item.id === productId);

  if (!product) {
    return;
  }

  const confirmed = confirm(`¿Eliminar el producto rápido "${product.name}"?`);

  if (!confirmed) {
    return;
  }

  state.quickProducts = state.quickProducts.filter((item) => item.id !== productId);
  saveState();
  renderQuickProducts();
  showToast('Producto rápido eliminado.');
}



function getExperienceMode() {
  return localStorage.getItem(EXPERIENCE_MODE_KEY) === 'advanced' ? 'advanced' : 'simple';
}

function updateExperienceModeChrome() {
  const mode = getExperienceMode();
  const isSimple = mode === 'simple';

  if (dom.viewModeLabel) {
    dom.viewModeLabel.textContent = isSimple ? 'Vista simple' : 'Vista avanzada activa';
  }

  if (dom.viewModeHelp) {
    dom.viewModeHelp.textContent = isSimple
      ? 'Herramientas avanzadas disponibles.'
      : 'Todas las secciones están visibles.';
  }

  if (dom.toggleAdvancedToolsButton) {
    dom.toggleAdvancedToolsButton.textContent = isSimple ? 'Ver herramientas avanzadas' : 'Ocultar herramientas avanzadas';
    dom.toggleAdvancedToolsButton.setAttribute('aria-pressed', String(!isSimple));
  }
}

function setExperienceMode(mode) {
  const selectedMode = mode === 'advanced' ? 'advanced' : 'simple';
  localStorage.setItem(EXPERIENCE_MODE_KEY, selectedMode);
  document.body.classList.toggle('simple-mode', selectedMode === 'simple');
  document.body.classList.toggle('advanced-mode', selectedMode === 'advanced');

  if (dom.simpleModeButton && dom.advancedModeButton) {
    dom.simpleModeButton.classList.toggle('is-active', selectedMode === 'simple');
    dom.advancedModeButton.classList.toggle('is-active', selectedMode === 'advanced');
  }

  updateExperienceModeChrome();

  try {
    renderGuidedExperience();
  } catch (error) {
    console.warn('No se pudo renderizar la experiencia guiada:', error);
  }
}

function toggleAdvancedToolsVisibility() {
  const nextMode = getExperienceMode() === 'advanced' ? 'simple' : 'advanced';
  setExperienceMode(nextMode);
  showToast(nextMode === 'advanced' ? 'Herramientas avanzadas visibles.' : 'Vista simple activa. Las herramientas avanzadas siguen disponibles.');
}

function restoreRecommendedView() {
  setExperienceMode('simple');
  setAppSection('home', { instant: true });
  showToast('Vista recomendada restaurada.');
}

function initExperienceMode() {
  setExperienceMode(getExperienceMode());
}


function normalizeAppSection(section) {
  const allowed = new Set(['home', 'people', 'expenses', 'summary', 'payments', 'tools', 'history', 'recurring', 'shared']);
  const aliases = {
    products: 'expenses',
    gastos: 'expenses',
    review: 'summary',
    share: 'payments',
    hogar: 'recurring',
    cuenta: 'expenses',
    settings: 'expenses',
    herramientas: 'tools',
    herramientas_avanzadas: 'tools',
    tools: 'tools',
  };
  const value = aliases[section] || section || 'home';
  return allowed.has(value) ? value : 'home';
}

function getStoredAppSection() {
  const hashSection = String(location.hash || '').replace('#', '').trim();
  if (hashSection) {
    return normalizeAppSection(hashSection);
  }

  try {
    return normalizeAppSection(localStorage.getItem(APP_SECTION_KEY));
  } catch {
    return 'home';
  }
}

const APP_SECTION_TITLES = {
  home: { title: 'Inicio', eyebrow: 'Cuenta Clara' },
  people: { title: 'Personas', eyebrow: 'Participantes' },
  expenses: { title: 'Gastos', eyebrow: 'Consumos' },
  summary: { title: 'Resumen', eyebrow: 'Totales' },
  payments: { title: 'Pagos', eyebrow: 'Transferencias' },
  tools: { title: 'Más herramientas', eyebrow: 'Cuenta Clara' },
  history: { title: 'Historial', eyebrow: 'Tus cuentas' },
  recurring: { title: 'Hogar', eyebrow: 'Recurrentes' },
  shared: { title: 'Compartidas', eyebrow: 'Colaboración' },
};

function updateMobileSectionChrome(section) {
  const meta = APP_SECTION_TITLES[section] || APP_SECTION_TITLES.home;

  if (dom.mobileScreenTitle) {
    dom.mobileScreenTitle.textContent = meta.title;
  }

  if (dom.mobileScreenEyebrow) {
    dom.mobileScreenEyebrow.textContent = meta.eyebrow;
  }

  if (dom.mobileScreenHeader) {
    dom.mobileScreenHeader.classList.toggle('is-visible', section !== 'home');
  }

  if (dom.mobileHomeButton) {
    dom.mobileHomeButton.classList.toggle('hidden', section === 'home');
  }

  if (dom.mobileBackButton) {
    dom.mobileBackButton.textContent = previousAppSection && previousAppSection !== 'home' && previousAppSection !== section ? 'Atrás' : 'Volver';
  }

  document.body.dataset.activeSection = section;
}

function setAppSection(section, options = {}) {
  const nextSection = normalizeAppSection(section);

  if (!dom.appSectionPanels || dom.appSectionPanels.length === 0) {
    return;
  }

  if (nextSection !== currentAppSection) {
    previousAppSection = options.fromBack ? 'home' : currentAppSection;
    currentAppSection = nextSection;
  }

  dom.appSectionPanels.forEach((panel) => {
    panel.classList.toggle('is-active', panel.dataset.appSectionPanel === nextSection);
  });

  
dom.accountWizardCancelButton?.addEventListener('click', cancelAccountWizard);
dom.accountWizardCloseButton?.addEventListener('click', cancelAccountWizard);
dom.accountWizardBackButton?.addEventListener('click', accountWizardBack);
dom.accountWizardNextButton?.addEventListener('click', accountWizardNext);
dom.accountWizard?.addEventListener('click', (event) => {
  if (event.target?.dataset?.wizardCancel === 'true') {
    cancelAccountWizard();
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && accountWizardState) {
    cancelAccountWizard();
  }
});

dom.sectionNavButtons?.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.appSection === nextSection);
  });

  updateMobileSectionChrome(nextSection);
  updateExperienceModeChrome();

  try {
    localStorage.setItem(APP_SECTION_KEY, nextSection);
  } catch {
      }

  if (options.scroll !== false) {
    const panel = document.querySelector(`[data-app-section-panel="${nextSection}"]`);
    const isMobile = typeof window !== 'undefined' && window.matchMedia?.('(max-width: 760px)').matches;
    if (isMobile) {
      window.scrollTo({ top: 0, behavior: options.instant ? 'auto' : 'smooth' });
    } else {
      panel?.scrollIntoView({ behavior: options.instant ? 'auto' : 'smooth', block: 'start' });
    }
  }
}

function revealSectionForElement(element) {
  const panel = element?.closest?.('[data-app-section-panel]');
  if (!panel) return;
  setAppSection(panel.dataset.appSectionPanel, { scroll: false });
}

function initAppSections() {
  setAppSection(getStoredAppSection(), { scroll: false, instant: true });
}

window.addEventListener('hashchange', () => {
  const hashSection = String(location.hash || '').replace('#', '').trim();
  if (hashSection) {
    setAppSection(hashSection, { instant: true });
  }
});

function scrollToGuideTarget(element) {
  if (!element) return;

  revealSectionForElement(element);

  setTimeout(() => {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (typeof element.focus === 'function') {
      element.focus();
    }
  }, 80);
}

function getGuidedState() {
  const bill = getActiveBill() || makeDefaultBill();
  const safeBill = {
    ...bill,
    people: Array.isArray(bill.people) ? bill.people : [],
    products: Array.isArray(bill.products) ? bill.products : [],
  };
  const calculation = calculateBill(safeBill);
  const hasPeople = safeBill.people.length > 0;
  const hasProducts = safeBill.mode === 'quick'
    ? Number(safeBill.quickTotal || 0) > 0
    : safeBill.products.length > 0;
  const hasAmounts = calculation.grandTotal > 0;

  return { bill: safeBill, calculation, hasPeople, hasProducts, hasAmounts };
}

function getSmartActionCopy() {
  const { bill, hasPeople, hasProducts, hasAmounts } = getGuidedState();

  if (!hasPeople) {
    return {
      title: 'Agrega personas',
      help: 'Añade participantes.',
      button: 'Agregar personas',
      step: 'people',
    };
  }

  if (!bill.payerId) {
    return {
      title: 'Elige pagador',
      help: 'Define quién recibe las transferencias.',
      button: 'Elegir pagador',
      step: 'people',
    };
  }

  if (bill.mode === 'quick' && !hasProducts) {
    return {
      title: 'Ingresa total',
      help: 'La app lo divide entre las personas.',
      button: 'Ingresar total',
      step: 'products',
    };
  }

  if (bill.mode !== 'quick' && !hasProducts) {
    return {
      title: bill.mode === 'home' ? 'Agrega gasto' : 'Agrega producto',
      help: bill.mode === 'home'
        ? 'Registra el gasto mensual.'
        : 'Manual, rápido o boleta.',
      button: bill.mode === 'home' ? 'Agregar gasto' : 'Agregar producto',
      step: 'products',
    };
  }

  if (hasAmounts) {
    return {
      title: 'Revisa y comparte',
      help: 'Corrige alertas y envía el resumen.',
      button: 'Compartir cuenta',
      step: 'share',
    };
  }

  return {
    title: 'Revisa la cuenta',
    help: 'La app te muestra qué falta.',
    button: 'Revisar cuenta',
    step: 'review',
  };
}


function renderSectionGuidance(copy = getSmartActionCopy()) {
  const guides = document.querySelectorAll('[data-guide-card]');

  guides.forEach((card) => {
    const section = card.dataset.guideCard;
    const strong = card.querySelector('strong');
    const paragraph = card.querySelector('p');
    const number = card.querySelector('.guide-number');
    const button = card.querySelector('button');

    if (!strong || !paragraph) return;

    const isCurrent =
      (section === 'people' && copy.step === 'people') ||
      (section === 'expenses' && copy.step === 'products') ||
      (section === 'summary' && copy.step === 'review') ||
      (section === 'payments' && copy.step === 'share');

    card.classList.toggle('is-current-guide', isCurrent);

    if (section === 'people') {
      number.textContent = '1';
      strong.textContent = copy.step === 'people' ? copy.title : 'Personas listas';
      paragraph.textContent = copy.step === 'people'
        ? copy.help
        : 'Listo. Puedes avanzar a Gastos.';
      if (button) {
        button.textContent = copy.step === 'people' ? copy.button : 'Ir a Gastos';
        button.onclick = () => {
          if (copy.step === 'people') {
            scrollToGuideTarget(dom.personNameInput);
            return;
          }
          setAppSection('expenses');
        };
      }
      return;
    }

    if (section === 'expenses') {
      number.textContent = '2';
      strong.textContent = copy.step === 'products' ? copy.title : 'Gastos registrados';
      paragraph.textContent = copy.step === 'products'
        ? copy.help
        : 'Edita, escanea o corrige gastos.';
      if (button) {
        button.textContent = copy.step === 'products' ? copy.button : 'Ver resumen';
        button.onclick = () => {
          if (copy.step === 'products') {
            scrollToGuideTarget(billIsQuickForGuidance() ? dom.quickTotalInput : dom.productNameInput);
            return;
          }
          setAppSection('summary');
        };
      }
      return;
    }

    if (section === 'summary') {
      number.textContent = '3';
      strong.textContent = 'Revisa el cálculo';
      paragraph.textContent = hasProductsForGuidance() ? 'Corrige alertas antes de compartir.' : 'El resumen aparecerá al agregar gastos.';
      return;
    }

    if (section === 'payments') {
      number.textContent = '4';
      strong.textContent = 'Cierra el seguimiento';
      paragraph.textContent = 'Envía recordatorios y marca pagados.';
    }
  });
}

function hasProductsForGuidance() {
  const { hasProducts } = getGuidedState();
  return hasProducts;
}

function billIsQuickForGuidance() {
  const { bill } = getGuidedState();
  return bill.mode === 'quick';
}

function updateStepPill(element, state) {
  if (!element) return;
  element.classList.remove('is-current', 'is-done');
  if (state === 'current') element.classList.add('is-current');
  if (state === 'done') element.classList.add('is-done');
}

function renderGuidedExperience() {
  if (!dom.guidedNextTitle) {
    return;
  }

  if (!state || !Array.isArray(state.bills) || state.bills.length === 0) {
    return;
  }

  const { hasPeople, hasProducts, hasAmounts } = getGuidedState();
  const copy = getSmartActionCopy();

  dom.guidedNextTitle.textContent = copy.title;
  dom.guidedNextHelp.textContent = copy.help;
  dom.smartActionButton.textContent = copy.button;

  updateStepPill(dom.stepCreate, 'done');
  updateStepPill(dom.stepPeople, hasPeople ? 'done' : 'current');
  updateStepPill(dom.stepProducts, hasProducts ? 'done' : (hasPeople ? 'current' : ''));
  updateStepPill(dom.stepReview, hasAmounts ? 'done' : (hasPeople && hasProducts ? 'current' : ''));
  updateStepPill(dom.stepShare, copy.step === 'share' ? 'current' : '');

  renderSectionGuidance(copy);

  const mode = getExperienceMode();
  dom.simpleModeButton?.classList.toggle('is-active', mode === 'simple');
  dom.advancedModeButton?.classList.toggle('is-active', mode === 'advanced');
  updateMobileActionBar();
}

function getHomeSyncLabel() {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return 'Sin conexión';
  }

  if (currentSession.mode !== 'user') {
    return 'Guardado en este dispositivo';
  }

  if (cloudSyncStatus === 'saving') return 'Guardando...';
  if (cloudSyncStatus === 'error') return 'Guardado solo en este dispositivo';
  return lastCloudSyncAt ? getCloudSavedText() : 'Sincronizado';
}

function getSmartActionSection() {
  const copy = getSmartActionCopy();
  if (copy.step === 'people') return 'people';
  if (copy.step === 'products') return 'expenses';
  if (copy.step === 'share') return 'payments';
  return 'summary';
}

function renderNetworkStatus() {
  if (!dom.networkStatusBanner) return;

  const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
  const isLocalUser = currentSession.mode !== 'user';
  const hasCloudIssue = currentSession.mode === 'user' && cloudSyncStatus === 'error';
  const shouldShow = isOffline || hasCloudIssue || isLocalUser;

  dom.networkStatusBanner.classList.toggle('hidden', !shouldShow);
  dom.networkStatusBanner.classList.toggle('is-offline', isOffline || hasCloudIssue);
  dom.networkStatusBanner.classList.toggle('is-local', isLocalUser && !isOffline && !hasCloudIssue);

  if (!shouldShow) return;

  if (isOffline) {
    dom.networkStatusTitle.textContent = 'Sin conexión';
    dom.networkStatusText.textContent = 'Puedes seguir usando Cuenta Clara. Tus cambios quedan guardados en este dispositivo y se sincronizarán cuando vuelva internet.';
    dom.networkStatusPill.textContent = 'En este dispositivo';
    return;
  }

  if (hasCloudIssue) {
    dom.networkStatusTitle.textContent = 'Guardado en este dispositivo';
    dom.networkStatusText.textContent = 'No se pudo sincronizar ahora. Tus datos no se pierden; quedaron guardados en este dispositivo y puedes reintentar desde Perfil.';
    dom.networkStatusPill.textContent = 'Pendiente';
    return;
  }

  dom.networkStatusTitle.textContent = 'Modo invitado';
  dom.networkStatusText.textContent = 'Tus cuentas se guardan solo en este dispositivo. Inicia sesión para respaldarlas y abrirlas desde otro equipo.';
  dom.networkStatusPill.textContent = 'En este dispositivo';
}

function renderMobileHomeDashboard() {
  if (!dom.homeGreetingOutput || !state?.bills?.length) {
    return;
  }

  const bill = getActiveBill();
  const calculation = calculateBill(bill);
  const displayName = currentSession.mode === 'user' ? getProfileDisplayName() : 'Invitado';
  const productCount = bill.mode === 'quick' ? (Number(bill.quickTotal || 0) > 0 ? 1 : 0) : bill.products.length;
  const pendingPeople = bill.people.filter((person) => !person.paid && (calculation.finalTotals[person.id] || 0) > 0).length;
  const selfInfo = getSelfParticipantInfo();
  const selfPerson = findSelfPerson(bill, selfInfo);
  const payer = bill.people.find((person) => person.id === bill.payerId);
  const totalReceivable = payer
    ? bill.people
        .filter((person) => person.id !== payer.id && !person.paid)
        .reduce((sum, person) => sum + (calculation.finalTotals[person.id] || 0), 0)
    : calculation.pendingTotal;
  const myAmount = selfPerson ? calculation.finalTotals[selfPerson.id] || 0 : null;

  dom.homeGreetingOutput.textContent = currentSession.mode === 'user' ? `Hola, ${displayName}` : 'Hola, invitado';
  dom.homeSummaryMetaOutput.textContent = currentSession.mode === 'user'
    ? 'Sincronizado automáticamente al hacer cambios.'
    : 'Modo invitado: guardado solo en este dispositivo.';
  dom.homeDashboardSyncOutput.textContent = getHomeSyncLabel();
  dom.homeDashboardSyncOutput.classList.toggle('is-error', cloudSyncStatus === 'error');
  dom.homeDashboardSyncOutput.classList.toggle('is-saving', cloudSyncStatus === 'saving');
  dom.homeActiveBillOutput.textContent = bill.name || 'Cuenta actual';
  dom.homeActiveBillMetaOutput.textContent = `${getBillModeLabel(bill.mode)} · ${bill.people.length} persona${bill.people.length === 1 ? '' : 's'} · ${productCount} gasto${productCount === 1 ? '' : 's'}`;
  dom.homeDashboardTotalOutput.textContent = formatCurrency(calculation.grandTotal);
  dom.homeDashboardMineOutput.textContent = myAmount === null ? '-' : formatCurrency(myAmount);
  dom.homeDashboardReceivableOutput.textContent = formatCurrency(totalReceivable);
  dom.homeDashboardPendingPeopleOutput.textContent = String(pendingPeople);

  if (dom.continueActiveBillButton) {
    dom.continueActiveBillButton.textContent = getSmartActionCopy().button;
  }

  renderHomeRecentBills();
  renderHomeReminderDashboard();
  renderHomeRecurringPanel();
}

function renderHomeRecentBills() {
  if (!dom.homeRecentBillsList || !state?.bills) {
    return;
  }

  const recentBills = [...state.bills]
    .filter((bill) => !bill.archived)
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 3);

  dom.homeRecentBillsList.innerHTML = '';

  if (recentBills.length === 0) {
    dom.homeRecentBillsList.appendChild(emptyMessage('Todavía no tienes cuentas recientes.'));
    return;
  }

  for (const bill of recentBills) {
    const calc = calculateBill(bill);
    const pendingPeople = bill.people.filter((person) => !person.paid && (calc.finalTotals[person.id] || 0) > 0).length;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `home-recent-row ${bill.id === state.activeBillId ? 'is-active' : ''}`;
    button.innerHTML = `
      <span>
        <strong>${escapeHtml(bill.name || 'Cuenta sin nombre')}</strong>
        <small>${getBillModeLabel(bill.mode)} · ${pendingPeople} pendiente${pendingPeople === 1 ? '' : 's'} · ${formatDate(bill.updatedAt || bill.createdAt)}</small>
      </span>
      <strong>${formatCurrency(calc.grandTotal)}</strong>
    `;
    button.addEventListener('click', () => {
      state.activeBillId = bill.id;
      editingProductId = null;
      saveState();
      render();
      setAppSection('home', { scroll: false });
      showToast('Cuenta seleccionada.');
    });
    dom.homeRecentBillsList.appendChild(button);
  }
}


function getRecurringOverview() {
  const groups = getRecurringGroups();
  if (!groups.length) {
    return null;
  }

  const enriched = groups
    .map((group) => {
      const bills = getGroupBills(group);
      const latestBill = getLatestGroupBill(group);
      const pending = latestBill ? getRecurringBillStats(latestBill).pendingTotal : 0;
      return { group, bills, latestBill, pending };
    })
    .filter((item) => item.latestBill)
    .sort((a, b) => new Date(b.latestBill.updatedAt || b.latestBill.createdAt) - new Date(a.latestBill.updatedAt || a.latestBill.createdAt));

  return enriched[0] || null;
}

function openRecurringSectionForBill(billId = '') {
  const target = billId ? state.bills.find((item) => item.id === billId) : null;
  if (target) {
    state.activeBillId = target.id;
    editingProductId = null;
    saveState();
  }
  render();
  setAppSection('recurring', { scroll: false });
}

function createNextRecurringMonthFromGroup(groupId) {
  const group = getRecurringGroup(groupId);
  const latest = group ? getLatestGroupBill(group) : null;

  if (!group || !latest) {
    showToast('No se encontró la carpeta recurrente.');
    return;
  }

  state.activeBillId = latest.id;
  saveState();
  createNextRecurringMonthFromActive();
}


function getPaymentDueTiming(bill) {
  const due = String(bill?.paymentDueAt || '').trim();

  if (!due) {
    return {
      label: 'Sin fecha límite',
      className: 'muted',
      days: null,
      priority: 4,
      overdue: false,
      soon: false,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(`${due}T00:00:00`);
  const diffDays = Math.round((dueDate - today) / 86400000);

  if (!Number.isFinite(diffDays)) {
    return {
      label: 'Fecha por revisar',
      className: 'muted',
      days: null,
      priority: 4,
      overdue: false,
      soon: false,
    };
  }

  if (diffDays < 0) {
    return {
      label: `Vencido hace ${Math.abs(diffDays)} día${Math.abs(diffDays) === 1 ? '' : 's'}`,
      className: 'danger',
      days: diffDays,
      priority: 0,
      overdue: true,
      soon: false,
    };
  }

  if (diffDays === 0) {
    return {
      label: 'Vence hoy',
      className: 'warning',
      days: 0,
      priority: 1,
      overdue: false,
      soon: true,
    };
  }

  if (diffDays <= 3) {
    return {
      label: `Vence en ${diffDays} día${diffDays === 1 ? '' : 's'}`,
      className: 'warning',
      days: diffDays,
      priority: 2,
      overdue: false,
      soon: true,
    };
  }

  if (diffDays <= 7) {
    return {
      label: `Vence en ${diffDays} días`,
      className: 'upcoming',
      days: diffDays,
      priority: 3,
      overdue: false,
      soon: true,
    };
  }

  return {
    label: `Fecha límite ${formatShortDate(due)}`,
    className: 'muted',
    days: diffDays,
    priority: 5,
    overdue: false,
    soon: false,
  };
}

function getDashboardReminderItems() {
  if (!state?.bills?.length) return [];

  const items = [];

  for (const bill of state.bills) {
    if (!bill || bill.archived) continue;

    const calculation = calculateBill(bill);
    if (!calculation || Number(calculation.pendingTotal || 0) <= 0) continue;

    const payer = bill.people.find((person) => person.id === bill.payerId) || null;
    const timing = getPaymentDueTiming(bill);
    const candidatePeople = bill.people
      .map((person) => ({ person, amount: calculation.finalTotals[person.id] || 0 }))
      .filter(({ person, amount }) => amount > 0 && !person.paid && (!payer || person.id !== payer.id));

    const pendingPeople = candidatePeople.length
      ? candidatePeople
      : bill.people
          .map((person) => ({ person, amount: calculation.finalTotals[person.id] || 0 }))
          .filter(({ amount, person }) => amount > 0 && !person.paid);

    for (const { person, amount } of pendingPeople) {
      items.push({
        bill,
        calculation,
        payer,
        person,
        amount,
        timing,
        updatedAt: bill.updatedAt || bill.createdAt || '',
      });
    }
  }

  return items.sort((a, b) => {
    if (a.timing.priority !== b.timing.priority) return a.timing.priority - b.timing.priority;
    if ((a.timing.days ?? 9999) !== (b.timing.days ?? 9999)) return (a.timing.days ?? 9999) - (b.timing.days ?? 9999);
    return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
  });
}

function openReminderTarget(item, section = 'payments') {
  if (!item?.bill?.id) {
    setAppSection(section, { scroll: false });
    return;
  }

  state.activeBillId = item.bill.id;
  editingProductId = null;
  saveState();
  render();
  setAppSection(section, { scroll: false });
}

function renderHomeReminderDashboard() {
  if (!dom.homeReminderPanel || !dom.homeReminderList) return;

  const items = getDashboardReminderItems();
  const visibleItems = items.slice(0, 5);
  const billCount = new Set(items.map((item) => item.bill.id)).size;
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const overdueCount = items.filter((item) => item.timing.overdue).length;
  const soonCount = items.filter((item) => item.timing.soon).length;

  dom.homeReminderPanel.classList.toggle('is-empty', items.length === 0);
  dom.homeReminderSummaryOutput.textContent = items.length
    ? `${items.length} pago${items.length === 1 ? '' : 's'} pendiente${items.length === 1 ? '' : 's'} · ${billCount} cuenta${billCount === 1 ? '' : 's'}`
    : 'Sin pagos pendientes';
  dom.homeReminderAmountOutput.textContent = formatCurrency(totalAmount);
  dom.homeReminderOverdueOutput.textContent = String(overdueCount);
  dom.homeReminderSoonOutput.textContent = String(soonCount);
  dom.homeReminderList.innerHTML = '';

  if (items.length === 0) {
    dom.homeReminderList.appendChild(emptyMessage('No hay pagos pendientes con personas por recordar.'));
    if (dom.homeReminderOpenPaymentsButton) {
      dom.homeReminderOpenPaymentsButton.textContent = 'Ir a Pagos';
      dom.homeReminderOpenPaymentsButton.onclick = () => setAppSection('payments', { scroll: false });
    }
    return;
  }

  for (const item of visibleItems) {
    const hasPhone = Boolean(normalizePhoneNumber(item.person.phone));
    const row = document.createElement('div');
    row.className = `home-reminder-row status-${item.timing.className || 'muted'}`;
    row.innerHTML = `
      <div class="home-reminder-main">
        <strong>${escapeHtml(item.person.name)}</strong>
        <small>${escapeHtml(item.bill.name || 'Cuenta sin nombre')} · ${escapeHtml(item.timing.label)}</small>
      </div>
      <strong class="home-reminder-row-amount">${formatCurrency(item.amount)}</strong>
      <div class="home-reminder-row-actions">
        <button class="btn btn-light btn-small" data-action="open" type="button">Pagos</button>
        <button class="btn btn-light btn-small" data-action="copy" type="button">Copiar</button>
        <button class="btn btn-primary btn-small" data-action="whatsapp" type="button" ${hasPhone ? '' : 'disabled'}>WhatsApp</button>
      </div>
    `;

    row.querySelector('[data-action="open"]')?.addEventListener('click', () => openReminderTarget(item, 'payments'));
    row.querySelector('[data-action="copy"]')?.addEventListener('click', () => copyPaymentReminder(item.person, item.payer, item.amount, item.bill));
    row.querySelector('[data-action="whatsapp"]')?.addEventListener('click', () => sendPaymentReminderWhatsapp(item.person, item.payer, item.amount, item.bill));
    dom.homeReminderList.appendChild(row);
  }

  if (items.length > visibleItems.length) {
    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'home-reminder-more';
    more.textContent = `Ver ${items.length - visibleItems.length} pendiente${items.length - visibleItems.length === 1 ? '' : 's'} más`;
    more.addEventListener('click', () => setAppSection('history', { scroll: false }));
    dom.homeReminderList.appendChild(more);
  }

  if (dom.homeReminderOpenPaymentsButton) {
    const first = items[0];
    dom.homeReminderOpenPaymentsButton.textContent = overdueCount ? 'Revisar vencidos' : 'Revisar pendientes';
    dom.homeReminderOpenPaymentsButton.onclick = () => openReminderTarget(first, 'payments');
  }
}

function renderHomeRecurringPanel() {
  if (!dom.homeRecurringPanel || !state?.bills?.length) {
    return;
  }

  const bill = getActiveBill();
  const activeGroup = getActiveRecurringGroup();
  const overview = getRecurringOverview();
  const shouldShowCandidate = bill.mode === 'home' && !activeGroup;
  const shouldShowGroup = Boolean(activeGroup || overview);

  dom.homeRecurringPanel.classList.toggle('hidden', !(shouldShowCandidate || shouldShowGroup));

  if (!(shouldShowCandidate || shouldShowGroup)) {
    return;
  }

  if (activeGroup) {
    const bills = getGroupBills(activeGroup);
    const latestBill = getLatestGroupBill(activeGroup) || bill;
    const latestStats = getRecurringBillStats(latestBill);
    dom.homeRecurringKicker.textContent = 'Carpeta activa';
    dom.homeRecurringTitle.textContent = activeGroup.name;
    dom.homeRecurringMeta.textContent = `${bills.length} mes${bills.length === 1 ? '' : 'es'} conectado${bills.length === 1 ? '' : 's'} · último mes ${latestBill.homeMonth || '-'}`;
    dom.homeRecurringAmount.textContent = formatCurrency(latestStats.pendingTotal);
    dom.homeRecurringActionButton.textContent = 'Crear siguiente mes';
    dom.homeRecurringActionButton.onclick = () => createNextRecurringMonthFromGroup(activeGroup.id);
    dom.homeRecurringOpenButton.onclick = () => openRecurringSectionForBill(latestBill.id);
    return;
  }

  if (shouldShowCandidate) {
    dom.homeRecurringKicker.textContent = 'Cuenta mensual';
    dom.homeRecurringTitle.textContent = 'Activar recurrente';
    dom.homeRecurringMeta.textContent = 'Convierte esta cuenta en carpeta mensual para repetir personas, gastos y arrastrar pendientes.';
    dom.homeRecurringAmount.textContent = bill.templateLabel || getBillModeLabel(bill.mode);
    dom.homeRecurringActionButton.textContent = 'Activar recurrente';
    dom.homeRecurringActionButton.onclick = createRecurringGroupFromActiveBill;
    dom.homeRecurringOpenButton.onclick = () => setAppSection('recurring', { scroll: false });
    return;
  }

  if (overview) {
    dom.homeRecurringKicker.textContent = 'Recurrentes';
    dom.homeRecurringTitle.textContent = overview.group.name;
    dom.homeRecurringMeta.textContent = `${overview.bills.length} mes${overview.bills.length === 1 ? '' : 'es'} conectado${overview.bills.length === 1 ? '' : 's'} · último mes ${overview.latestBill.homeMonth || '-'}`;
    dom.homeRecurringAmount.textContent = formatCurrency(overview.pending);
    dom.homeRecurringActionButton.textContent = 'Crear siguiente mes';
    dom.homeRecurringActionButton.onclick = () => createNextRecurringMonthFromGroup(overview.group.id);
    dom.homeRecurringOpenButton.onclick = () => openRecurringSectionForBill(overview.latestBill.id);
  }
}

function continueActiveBillFromHome() {
  setAppSection(getSmartActionSection(), { scroll: false });
}

function focusGuidedNewBillChoices() {
  openAccountWizard();
}

function getGuidedBillName(mode) {
  const nextNumber = state?.bills?.length ? state.bills.length + 1 : 1;

  if (mode === 'home') return `Cuentas del hogar ${getCurrentMonthValue()}`;
  if (mode === 'quick') return `Cuenta rápida ${nextNumber}`;
  return `Salida ${nextNumber}`;
}

const BILL_TEMPLATES = {
  restaurant: {
    label: 'Restaurante',
    mode: 'detailed',
    tipPercent: 10,
    name: () => `Restaurante ${formatShortToday()}`,
    description: 'Para cenas, salidas y cuentas con productos compartidos. Activa propina y prepara el resumen para WhatsApp.',
    help: 'Plantilla restaurante creada. Agrega personas, productos y revisa la propina en Gastos.',
    checklist: ['Propina 10% activa', 'Productos por consumidor', 'Comprobante para WhatsApp'],
    examples: [
      { name: 'Plato de fondo', category: 'Comida' },
      { name: 'Bebida', category: 'Bebestibles' },
      { name: 'Postre compartido', category: 'Postres' },
    ],
    nextHint: 'Después de agregar personas, usa productos rápidos o escanea una boleta.',
  },
  supermarket: {
    label: 'Supermercado',
    mode: 'home',
    tipPercent: 0,
    name: () => `Supermercado ${formatMonthLabel(getCurrentMonthValue())}`,
    description: 'Para compras compartidas del hogar o grupo. Sin propina y con foco en gastos mensuales.',
    help: 'Plantilla supermercado creada. Agrega personas y gastos; si se repite mensualmente, actívala como recurrente.',
    checklist: ['Sin propina', 'Categorías de hogar', 'Puede volverse recurrente'],
    examples: [
      { name: 'Supermercado mensual', category: 'Supermercado' },
      { name: 'Aseo y limpieza', category: 'Otros' },
      { name: 'Reposición compartida', category: 'Supermercado' },
    ],
    nextHint: 'Agrega el total de la compra o separa productos si algunas personas consumieron distinto.',
  },
  streaming: {
    label: 'Streaming',
    mode: 'home',
    tipPercent: 0,
    name: () => `Streaming ${formatMonthLabel(getCurrentMonthValue())}`,
    description: 'Para Netflix, Spotify, MAX, Crunchyroll u otros servicios mensuales. Pensada para pagos recurrentes.',
    help: 'Plantilla streaming creada. Agrega personas y gastos; luego activa la carpeta recurrente desde Más herramientas u Hogar.',
    checklist: ['Sin propina', 'Pagos mensuales', 'Arrastre de deuda pendiente'],
    examples: [
      { name: 'Netflix', category: 'Streaming' },
      { name: 'Spotify', category: 'Streaming' },
      { name: 'MAX', category: 'Streaming' },
      { name: 'Disney+', category: 'Streaming' },
      { name: 'Amazon Prime', category: 'Streaming' },
      { name: 'Crunchyroll', category: 'Streaming' },
    ],
    nextHint: 'Marca los servicios como recurrentes para repetirlos el próximo mes.',
  },
  trip: {
    label: 'Viaje',
    mode: 'detailed',
    tipPercent: 0,
    name: () => `Viaje ${formatShortToday()}`,
    description: 'Para viajes con gastos por etapa: transporte, alojamiento, comida y compras compartidas.',
    help: 'Plantilla viaje creada. Agrega transporte, comida, alojamiento y otros gastos.',
    checklist: ['Sin propina por defecto', 'Gastos por categoría', 'Ideal para varias personas'],
    examples: [
      { name: 'Alojamiento', category: 'Arriendo' },
      { name: 'Transporte', category: 'Transporte' },
      { name: 'Comida del viaje', category: 'Comida' },
    ],
    nextHint: 'Usa categorías para revisar mejor en el historial cuánto gastaron por tipo de gasto.',
  },
  home: {
    label: 'Hogar',
    mode: 'home',
    tipPercent: 0,
    name: () => `Hogar ${formatMonthLabel(getCurrentMonthValue())}`,
    description: 'Para luz, agua, internet, gas, arriendo y gastos comunes. Diseñada para controlar deudas mensuales.',
    help: 'Plantilla hogar creada. Agrega personas y gastos; luego crea el siguiente mes desde Hogar/Recurrentes.',
    checklist: ['Sin propina', 'Mes activo', 'Carpeta recurrente disponible'],
    examples: [
      { name: 'Luz', category: 'Luz' },
      { name: 'Agua', category: 'Agua' },
      { name: 'Internet', category: 'Internet' },
      { name: 'Gastos comunes', category: 'Gastos comunes' },
      { name: 'Gas', category: 'Gas' },
      { name: 'Arriendo', category: 'Arriendo' },
      { name: 'Supermercado', category: 'Supermercado' },
    ],
    nextHint: 'Agrega fecha de vencimiento para que Inicio muestre recordatorios útiles.',
  },
  quick: {
    label: 'Cuenta rápida',
    mode: 'quick',
    tipPercent: 0,
    name: () => `Cuenta rápida ${formatShortToday()}`,
    description: 'Para dividir un total único sin cargar productos. Es el camino más corto para salir rápido.',
    help: 'Cuenta rápida creada. Agrega personas y luego ingresa el monto total.',
    checklist: ['Total único', 'División inmediata', 'Ideal para urgencias'],
    examples: [
      { name: 'Total de la cuenta', category: 'Otros' },
      { name: 'Pago grupal', category: 'Otros' },
    ],
    nextHint: 'Agrega personas, ingresa el monto total y comparte el resultado.',
  },
  custom: {
    label: 'Personalizada',
    mode: 'detailed',
    tipPercent: 10,
    name: () => getGuidedBillName('detailed'),
    description: 'Empieza limpia y ajusta propina, categorías, personas y pagos según tu caso.',
    help: 'Cuenta personalizada creada. Agrega personas y configura los gastos a tu manera.',
    checklist: ['Configuración libre', 'Productos manuales', 'Propina editable'],
    examples: [
      { name: 'Gasto compartido', category: 'Otros' },
      { name: 'Producto individual', category: 'Otros' },
    ],
    nextHint: 'Configura primero el tipo de cuenta y luego agrega gastos.',
  },
};

function formatShortToday() {
  return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short' }).format(new Date()).replace('.', '');
}

function formatMonthLabel(monthValue) {
  const [year, month] = String(monthValue || getCurrentMonthValue()).split('-').map(Number);
  const date = new Date(year || new Date().getFullYear(), (month || 1) - 1, 1);
  const label = new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}


function getTemplateDefinition(templateKey = '') {
  return BILL_TEMPLATES[templateKey] || BILL_TEMPLATES.custom;
}

function getRecommendedTemplateKey() {
  const activeBill = state?.bills?.find?.((bill) => bill.id === state.activeBillId) || null;

  if (activeBill) {
    const hasPeople = Array.isArray(activeBill.people) && activeBill.people.length > 0;
    const hasProducts = Array.isArray(activeBill.products) && activeBill.products.length > 0;
    const hasQuickTotal = Number(activeBill.quickTotal || 0) > 0;

    if (!hasPeople && !hasProducts && !hasQuickTotal && activeBill.templateKey && BILL_TEMPLATES[activeBill.templateKey]) {
      return activeBill.templateKey;
    }

    if (activeBill.mode === 'quick' && !hasQuickTotal) return 'quick';
    if (activeBill.mode === 'home' && !hasProducts) return activeBill.templateKey || 'home';
  }

  const recentBills = Array.isArray(state?.bills) ? state.bills.filter((bill) => !bill.archived).slice(0, 6) : [];
  const frequency = new Map();

  for (const bill of recentBills) {
    const key = BILL_TEMPLATES[bill.templateKey] ? bill.templateKey : '';
    if (key) frequency.set(key, (frequency.get(key) || 0) + 1);
  }

  const strongest = [...frequency.entries()].sort((a, b) => b[1] - a[1])[0];
  if (strongest?.[0]) return strongest[0];

  const hour = new Date().getHours();
  if (hour >= 18 && hour <= 23) return 'restaurant';
  return 'quick';
}

function ensureSelectedTemplateKey() {
  if (!templateSelectionTouched || !BILL_TEMPLATES[selectedTemplateKey]) {
    selectedTemplateKey = getRecommendedTemplateKey();
  }
  return selectedTemplateKey;
}

function selectTemplatePreview(templateKey, options = {}) {
  if (!BILL_TEMPLATES[templateKey]) {
    return;
  }

  selectedTemplateKey = templateKey;
  templateSelectionTouched = true;
  renderTemplateAssistant();

  if (options.scroll && dom.templateAssistantPanel) {
    dom.templateAssistantPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function renderTemplateChips(container, items = []) {
  if (!container) return;
  container.innerHTML = '';

  items.forEach((item) => {
    const chip = document.createElement('span');
    chip.className = 'template-chip';
    chip.textContent = item;
    container.appendChild(chip);
  });
}

function renderTemplateExamples(container, examples = [], interactive = false) {
  if (!container) return;
  container.innerHTML = '';

  examples.forEach((example) => {
    const element = document.createElement(interactive ? 'button' : 'span');
    element.className = 'template-example-chip';
    element.textContent = `${example.name} · ${example.category}`;

    if (interactive) {
      element.type = 'button';
      element.addEventListener('click', () => prefillSuggestedProduct(example));
    }

    container.appendChild(element);
  });
}

function renderTemplateAssistant() {
  if (!dom.templateAssistantPanel) return;

  const recommendedKey = getRecommendedTemplateKey();
  const key = ensureSelectedTemplateKey();
  const template = getTemplateDefinition(key);
  const recommendedTemplate = getTemplateDefinition(recommendedKey);
  const isRecommended = key === recommendedKey;

  dom.templateAssistantKicker.textContent = isRecommended ? 'Plantilla sugerida' : 'Plantilla seleccionada';
  dom.templateAssistantTitle.textContent = template.label;
  dom.templateAssistantDescription.textContent = template.description || template.help;
  renderTemplateChips(dom.templateAssistantMeta, [
    getBillModeLongLabel(template.mode),
    template.tipPercent ? `Propina ${template.tipPercent}%` : 'Sin propina',
    ...(template.checklist || []),
  ]);
  renderTemplateExamples(dom.templateAssistantExamples, template.examples || []);

  if (dom.templateAssistantStartButton) {
    dom.templateAssistantStartButton.textContent = `Crear ${template.label}`;
  }

  if (dom.templateAssistantPeopleButton) {
    dom.templateAssistantPeopleButton.textContent = `Crear y agregar personas`;
  }

  dom.templateChoiceButtons?.forEach((button) => {
    const buttonKey = button.dataset.template;
    button.classList.toggle('is-selected', buttonKey === key);
    button.classList.toggle('is-recommended', buttonKey === recommendedKey);
    button.setAttribute('aria-pressed', buttonKey === key ? 'true' : 'false');

    const strong = button.querySelector('strong');
    if (strong && buttonKey === recommendedKey && !strong.textContent.includes('Sugerida')) {
      strong.textContent = `${recommendedTemplate.label} · Sugerida`;
    } else if (strong && buttonKey !== recommendedKey) {
      strong.textContent = getTemplateDefinition(buttonKey).label;
    }
  });
}

function renderActiveTemplateHelper() {
  if (!dom.templateActiveHelper) return;

  const bill = getActiveBill();
  const key = bill.templateKey && BILL_TEMPLATES[bill.templateKey] ? bill.templateKey : 'custom';
  const template = getTemplateDefinition(key);
  const hasTemplate = Boolean(bill.templateKey && BILL_TEMPLATES[bill.templateKey]);

  dom.templateActiveHelper.classList.toggle('hidden', !bill);
  dom.templateActiveKicker.textContent = hasTemplate ? 'Plantilla activa' : 'Plantilla sugerida';
  dom.templateActiveTitle.textContent = hasTemplate ? template.label : 'Personalizada';
  dom.templateActiveHelp.textContent = `${template.nextHint || template.help} Puedes tocar un ejemplo para preparar el formulario sin agregar montos automáticamente.`;
  renderTemplateExamples(dom.templateActiveExamples, template.examples || [], true);
}

function prefillSuggestedProduct(example = {}) {
  const bill = getActiveBill();

  if (bill.mode === 'quick') {
    setAppSection('expenses', { scroll: false });
    scrollToGuideTarget(dom.quickTotalInput);
    showToast('Ingresa el total de la cuenta rápida.');
    return;
  }

  setAppSection('expenses', { scroll: false });

  if (dom.productNameInput) dom.productNameInput.value = example.name || '';
  if (dom.productCategoryInput && example.category) dom.productCategoryInput.value = CATEGORIES.includes(example.category) ? example.category : 'Otros';
  if (dom.productQuantityInput && !Number(dom.productQuantityInput.value || 0)) dom.productQuantityInput.value = 1;
  if (dom.productRecurringInput && bill.mode === 'home') dom.productRecurringInput.checked = true;

  scrollToGuideTarget(dom.productNameInput);
  showToast('Ejemplo preparado. Solo falta ingresar el monto y guardar.');
}

function applyBillModePreset(bill, mode, customName = '') {
  const safeMode = ['detailed', 'home', 'quick'].includes(mode) ? mode : 'detailed';
  bill.mode = safeMode;
  const cleanName = String(customName || '').trim();
  bill.name = cleanName || getGuidedBillName(safeMode);

  if (safeMode === 'home') {
    bill.tipPercent = 0;
    bill.homeMonth = bill.homeMonth || getCurrentMonthValue();
  }

  if (safeMode !== 'home' && !Number.isFinite(Number(bill.tipPercent))) {
    bill.tipPercent = 10;
  }
}

function openInitialAccountSetup(message = 'Cuenta creada. Agrega personas y define el pagador principal.') {
  setAppSection('people', { scroll: false });

  requestAnimationFrame(() => {
    const bill = getActiveBill();
    const target = bill.people.length > 0 ? dom.payerSelect : dom.personNameInput;
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (typeof target?.focus === 'function') {
      target.focus();
    }
  });

  showToast(message);
}

function askGuidedBillName(mode) {
  const defaultName = getGuidedBillName(mode);
  const response = prompt('¿Qué nombre quieres darle a esta cuenta?', defaultName);

  if (response === null) {
    return null;
  }

  const cleanName = response.trim();
  return cleanName || defaultName;
}

function applyTemplateToBill(bill, templateKey, customName = '') {
  const template = BILL_TEMPLATES[templateKey] || BILL_TEMPLATES.custom;
  applyBillModePreset(bill, template.mode, customName || template.name());
  bill.templateKey = templateKey;
  bill.templateLabel = template.label;
  bill.tipPercent = Number(template.tipPercent || 0);

  if (bill.mode === 'home') {
    bill.homeMonth = getCurrentMonthValue();
  }

  if (bill.mode === 'quick') {
    bill.quickTotal = 0;
  }

  return template;
}

function createTemplateBill(templateKey) {
  selectedTemplateKey = BILL_TEMPLATES[templateKey] ? templateKey : 'custom';
  templateSelectionTouched = true;
  const template = BILL_TEMPLATES[selectedTemplateKey] || BILL_TEMPLATES.custom;
  const defaultName = template.name();
  const response = prompt('¿Qué nombre quieres darle a esta cuenta?', defaultName);

  if (response === null) {
    return;
  }

  const bill = makeDefaultBill();
  const selectedTemplate = applyTemplateToBill(bill, selectedTemplateKey, response.trim() || defaultName);

  state.bills.unshift(bill);
  state.activeBillId = bill.id;
  editingProductId = null;
  localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true');
  saveState();
  render();
  openInitialAccountSetup(selectedTemplate.help);
}

function isLikelyFirstUseState() {
  if (!state || !Array.isArray(state.bills) || state.bills.length !== 1) {
    return false;
  }

  const bill = state.bills[0];
  const hasPeople = Array.isArray(bill.people) && bill.people.length > 0;
  const hasProducts = Array.isArray(bill.products) && bill.products.length > 0;
  const hasQuickTotal = Number(bill.quickTotal || 0) > 0;
  const name = String(bill.name || '').trim().toLowerCase();

  return !hasPeople && !hasProducts && !hasQuickTotal && (!name || name === 'nueva cuenta' || name === 'cuenta sin nombre');
}

function getGuidedProgressInfo(copy = getSmartActionCopy()) {
  const { hasPeople, hasProducts, hasAmounts } = getGuidedState();

  if (!state?.bills?.length || isLikelyFirstUseState()) {
    return { step: 1, total: 5, text: 'Elige una plantilla para crear tu primera cuenta.' };
  }

  if (!hasPeople || copy.step === 'people') {
    return { step: 2, total: 5, text: copy.help };
  }

  if (!hasProducts || copy.step === 'products') {
    return { step: 3, total: 5, text: copy.help };
  }

  if (!hasAmounts || copy.step === 'review') {
    return { step: 4, total: 5, text: copy.help };
  }

  return { step: 5, total: 5, text: 'Revisa pagos pendientes y comparte el comprobante final.' };
}

function renderFirstUseOnboarding() {
  if (!dom.firstUseCard) {
    return;
  }

  const dismissed = localStorage.getItem(ONBOARDING_DISMISSED_KEY) === 'true';
  const shouldShow = !dismissed && isLikelyFirstUseState();
  const progress = getGuidedProgressInfo();

  dom.firstUseCard.classList.toggle('hidden', !shouldShow);
  if (dom.firstUseProgressOutput) {
    dom.firstUseProgressOutput.textContent = `Paso ${progress.step} de ${progress.total}`;
  }
  if (dom.firstUseNextActionOutput) {
    dom.firstUseNextActionOutput.textContent = progress.text;
  }
}

function focusTemplateChoices() {
  setAppSection('tools', { scroll: false });
  localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true');
  dom.guidedStartCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function dismissFirstUseOnboarding() {
  localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true');
  renderFirstUseOnboarding();
}

function createGuidedBill(mode) {
  const listName = askGuidedBillName(mode);

  if (!listName) {
    return;
  }

  const bill = makeDefaultBill();
  applyBillModePreset(bill, mode, listName);

  state.bills.unshift(bill);
  state.activeBillId = bill.id;
  editingProductId = null;
  localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true');
  saveState();
  render();
  openInitialAccountSetup(
    bill.mode === 'home'
      ? 'Cuenta creada. Agrega personas y elige pagador principal en Personas.'
      : 'Cuenta creada. Agrega personas, elige pagador principal y luego revisa propina en Gastos.'
  );
}


const ACCOUNT_WIZARD_STEPS = [
  { key: 'type', label: 'Tipo' },
  { key: 'name', label: 'Nombre' },
  { key: 'people', label: 'Personas' },
  { key: 'expenses', label: 'Gastos' },
  { key: 'review', label: 'Revisar' },
];

function getAccountWizardTemplateKey() {
  return accountWizardState?.templateKey && BILL_TEMPLATES[accountWizardState.templateKey]
    ? accountWizardState.templateKey
    : 'restaurant';
}

function getAccountWizardTemplate() {
  return BILL_TEMPLATES[getAccountWizardTemplateKey()] || BILL_TEMPLATES.restaurant;
}

function getAccountWizardDefaultName(templateKey = getAccountWizardTemplateKey()) {
  const template = BILL_TEMPLATES[templateKey] || BILL_TEMPLATES.restaurant;
  return typeof template.name === 'function' ? template.name() : 'Nueva cuenta';
}

function openAccountWizard(templateKey = selectedTemplateKey || 'restaurant') {
  if (!dom.accountWizard || !dom.accountWizardBody) {
    createTemplateBill(templateKey);
    return;
  }

  accountWizardState = {
    step: 0,
    templateKey: BILL_TEMPLATES[templateKey] ? templateKey : 'restaurant',
    name: getAccountWizardDefaultName(templateKey),
    draftBillId: '',
    previousActiveBillId: state?.activeBillId || '',
    friendsLoaded: false,
    friends: [],
  };

  dom.accountWizard.classList.remove('hidden');
  document.body.classList.add('account-wizard-active');
  renderAccountWizard();

  requestAnimationFrame(() => {
    dom.accountWizardNextButton?.focus();
  });
}

function closeAccountWizard(options = {}) {
  if (!accountWizardState) return;

  const shouldRemoveDraft = !options.keepDraft && accountWizardState.draftBillId;
  if (shouldRemoveDraft && state?.bills?.some((bill) => bill.id === accountWizardState.draftBillId)) {
    state.bills = state.bills.filter((bill) => bill.id !== accountWizardState.draftBillId);
    if (accountWizardState.previousActiveBillId && state.bills.some((bill) => bill.id === accountWizardState.previousActiveBillId)) {
      state.activeBillId = accountWizardState.previousActiveBillId;
    } else if (state.bills[0]) {
      state.activeBillId = state.bills[0].id;
    } else {
      const bill = makeDefaultBill();
      state.bills = [bill];
      state.activeBillId = bill.id;
    }
    saveState();
    render();
  }

  accountWizardState = null;
  dom.accountWizard?.classList.add('hidden');
  document.body.classList.remove('account-wizard-active');
}

function cancelAccountWizard() {
  if (!accountWizardState) return;
  const hasDraft = Boolean(accountWizardState.draftBillId);
  const hasName = String(accountWizardState.name || '').trim() && accountWizardState.name !== getAccountWizardDefaultName(accountWizardState.templateKey);
  const confirmed = !hasDraft && !hasName
    ? true
    : confirmAction('¿Cancelar creación de cuenta?', 'Los datos ingresados en este asistente se descartarán.');

  if (!confirmed) return;
  closeAccountWizard({ keepDraft: false });
  showToast('Creación cancelada.');
}

function ensureAccountWizardDraft() {
  if (!accountWizardState) return null;

  let bill = accountWizardState.draftBillId
    ? state.bills.find((item) => item.id === accountWizardState.draftBillId)
    : null;

  const isNewDraft = !bill;
  if (isNewDraft) {
    bill = makeDefaultBill();
    state.bills.unshift(bill);
    accountWizardState.draftBillId = bill.id;
  }

  const template = getAccountWizardTemplate();
  if (isNewDraft) {
    applyTemplateToBill(bill, getAccountWizardTemplateKey(), String(accountWizardState.name || '').trim() || getAccountWizardDefaultName());
  } else {
    bill.mode = ['detailed', 'home', 'quick'].includes(template.mode) ? template.mode : 'detailed';
    bill.tipPercent = Number(template.tipPercent || 0);
    if (bill.mode === 'home') bill.homeMonth = bill.homeMonth || getCurrentMonthValue();
    if (bill.mode === 'quick') bill.quickTotal = Number(bill.quickTotal || 0);
  }
  bill.name = String(accountWizardState.name || '').trim() || getAccountWizardDefaultName();
  bill.templateKey = getAccountWizardTemplateKey();
  bill.templateLabel = template.label;
  bill.updatedAt = nowIso();
  state.activeBillId = bill.id;
  localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true');
  saveState();
  return bill;
}

function getAccountWizardBill() {
  if (!accountWizardState?.draftBillId) return null;
  return state.bills.find((bill) => bill.id === accountWizardState.draftBillId) || null;
}

function getAccountWizardMissingItems(bill = getAccountWizardBill()) {
  if (!bill) return ['Elige tipo y nombre para preparar la cuenta.'];
  const missing = [];
  const hasPeople = Array.isArray(bill.people) && bill.people.length > 0;
  const hasProducts = Array.isArray(bill.products) && bill.products.length > 0;
  const hasQuickTotal = Number(bill.quickTotal || 0) > 0;

  if (!hasPeople) missing.push('Agrega al menos una persona.');
  if (!bill.payerId && hasPeople) missing.push('Elige quién pagó o pagará.');
  if (bill.mode === 'quick') {
    if (!hasQuickTotal) missing.push('Ingresa el total de la cuenta.');
  } else {
    if (!hasProducts) missing.push('Agrega al menos un gasto.');
    const withoutConsumers = (bill.products || []).filter((product) => !Array.isArray(product.consumers) || product.consumers.length === 0);
    if (withoutConsumers.length > 0) missing.push(`${withoutConsumers.length} gasto${withoutConsumers.length === 1 ? '' : 's'} sin personas asignadas.`);
  }

  return missing;
}

function getAccountWizardTitle(step = accountWizardState?.step || 0) {
  const titles = ['Elige el tipo de cuenta', 'Nombra la cuenta', 'Agrega personas', 'Agrega gastos', 'Revisa antes de terminar'];
  return titles[step] || titles[0];
}

function renderAccountWizard() {
  if (!accountWizardState || !dom.accountWizardBody) return;

  const step = Math.max(0, Math.min(accountWizardState.step, ACCOUNT_WIZARD_STEPS.length - 1));
  accountWizardState.step = step;
  const bill = getAccountWizardBill();
  const template = getAccountWizardTemplate();

  dom.accountWizardEyebrow.textContent = `Paso ${step + 1} de ${ACCOUNT_WIZARD_STEPS.length}`;
  dom.accountWizardTitle.textContent = getAccountWizardTitle(step);
  dom.accountWizardSubtitle.textContent = step < 4
    ? 'Completa solo lo necesario para avanzar.'
    : 'Confirma que la cuenta esté lista o vuelve al paso que falte.';

  dom.accountWizardProgress.innerHTML = ACCOUNT_WIZARD_STEPS.map((item, index) => `
    <span class="account-wizard-step ${index === step ? 'is-active' : ''} ${index < step ? 'is-done' : ''}">
      <b>${index + 1}</b><em>${escapeHtml(item.label)}</em>
    </span>
  `).join('');

  if (dom.accountWizardBackButton) {
    dom.accountWizardBackButton.disabled = step === 0;
  }
  if (dom.accountWizardNextButton) {
    dom.accountWizardNextButton.textContent = step === ACCOUNT_WIZARD_STEPS.length - 1 ? 'Finalizar cuenta' : 'Continuar';
  }

  if (step === 0) renderAccountWizardTypeStep();
  if (step === 1) renderAccountWizardNameStep();
  if (step === 2) renderAccountWizardPeopleStep();
  if (step === 3) renderAccountWizardExpensesStep();
  if (step === 4) renderAccountWizardReviewStep();

  if (step >= 2 && !bill) {
    ensureAccountWizardDraft();
  }

  if (step === 2 && !accountWizardState.friendsLoaded) {
    loadAccountWizardFriends();
  }
}

function renderAccountWizardTypeStep() {
  const choices = ['restaurant', 'supermarket', 'streaming', 'home', 'trip', 'quick', 'custom'];
  dom.accountWizardBody.innerHTML = `
    <div class="account-wizard-copy">
      <strong>¿Qué tipo de cuenta quieres crear?</strong>
      <p>La plantilla solo prepara la cuenta. Después puedes cambiarla.</p>
    </div>
    <div class="account-wizard-template-grid">
      ${choices.map((key) => {
        const template = BILL_TEMPLATES[key] || BILL_TEMPLATES.custom;
        return `<button class="account-wizard-choice ${getAccountWizardTemplateKey() === key ? 'is-selected' : ''}" data-wizard-template="${key}" type="button">
          <strong>${escapeHtml(template.label)}</strong>
          <span>${escapeHtml(template.description || template.nextHint || 'Cuenta personalizada.')}</span>
        </button>`;
      }).join('')}
    </div>
  `;

  dom.accountWizardBody.querySelectorAll('[data-wizard-template]').forEach((button) => {
    button.addEventListener('click', () => {
      accountWizardState.templateKey = button.dataset.wizardTemplate;
      accountWizardState.name = getAccountWizardDefaultName(accountWizardState.templateKey);
      renderAccountWizard();
    });
  });
}

function renderAccountWizardNameStep() {
  const template = getAccountWizardTemplate();
  dom.accountWizardBody.innerHTML = `
    <label class="account-wizard-field">
      <span>Nombre de la cuenta</span>
      <input id="accountWizardNameInput" type="text" value="${escapeHtml(accountWizardState.name || '')}" placeholder="Ej: Cumpleaños, Streaming mayo" />
    </label>
    <div class="account-wizard-hint">
      <strong>${escapeHtml(template.label)}</strong>
      <p>${escapeHtml(template.nextHint || template.description || 'Puedes ajustar los detalles después.')}</p>
    </div>
  `;

  const input = dom.accountWizardBody.querySelector('#accountWizardNameInput');
  input?.addEventListener('input', () => {
    accountWizardState.name = input.value;
  });
  requestAnimationFrame(() => input?.focus());
}

function renderAccountWizardPeopleStep() {
  const bill = ensureAccountWizardDraft();
  const friends = accountWizardState.friends || [];
  dom.accountWizardBody.innerHTML = `
    <div class="account-wizard-split">
      <section class="account-wizard-card-mini">
        <h3>Agregar persona</h3>
        <div class="account-wizard-inline-form">
          <input id="accountWizardPersonName" type="text" placeholder="Nombre" />
          <input id="accountWizardPersonPhone" type="tel" placeholder="Teléfono opcional" />
          <button class="btn btn-primary" id="accountWizardAddPerson" type="button">Agregar</button>
        </div>
        <div class="account-wizard-inline-actions">
          <button class="btn btn-light btn-small" id="accountWizardAddMe" type="button">Agregarme como Yo</button>
        </div>
      </section>
      <section class="account-wizard-card-mini">
        <h3>Desde amigos</h3>
        <input id="accountWizardFriendSearch" type="search" placeholder="Buscar amigo" />
        <div class="account-wizard-friend-list" id="accountWizardFriendList">
          ${friends.length ? renderAccountWizardFriendRows(friends, bill) : '<p class="helper-text">Cargando amigos guardados...</p>'}
        </div>
      </section>
    </div>
    <section class="account-wizard-card-mini">
      <h3>Participantes (${bill.people.length})</h3>
      <div class="account-wizard-chip-list" id="accountWizardPeopleList">
        ${bill.people.length ? bill.people.map((person) => `<span class="account-wizard-chip"><strong>${escapeHtml(person.name)}</strong><button data-remove-wizard-person="${person.id}" type="button">×</button></span>`).join('') : '<p class="helper-text">Agrega participantes para continuar.</p>'}
      </div>
      ${bill.people.length ? `<label class="account-wizard-field compact"><span>Pagador principal</span><select id="accountWizardPayerSelect"><option value="">Elegir después</option>${bill.people.map((person) => `<option value="${person.id}" ${bill.payerId === person.id ? 'selected' : ''}>${escapeHtml(person.name)}</option>`).join('')}</select></label>` : ''}
    </section>
  `;

  dom.accountWizardBody.querySelector('#accountWizardAddPerson')?.addEventListener('click', addManualPersonFromAccountWizard);
  dom.accountWizardBody.querySelector('#accountWizardPersonName')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') addManualPersonFromAccountWizard();
  });
  dom.accountWizardBody.querySelector('#accountWizardAddMe')?.addEventListener('click', addSelfFromAccountWizard);
  dom.accountWizardBody.querySelector('#accountWizardPayerSelect')?.addEventListener('change', (event) => {
    bill.payerId = event.target.value;
    addBillActivity('Pagador principal actualizado desde creación guiada.', 'people', bill);
    persistAndRender();
    renderAccountWizard();
  });
  dom.accountWizardBody.querySelectorAll('[data-remove-wizard-person]').forEach((button) => {
    button.addEventListener('click', () => removePersonFromAccountWizard(button.dataset.removeWizardPerson));
  });
  dom.accountWizardBody.querySelector('#accountWizardFriendSearch')?.addEventListener('input', renderAccountWizardFriendSearch);
  dom.accountWizardBody.querySelectorAll('[data-add-wizard-friend]').forEach((button) => {
    button.addEventListener('click', () => addFriendFromAccountWizard(button.dataset.addWizardFriend));
  });
}

function renderAccountWizardFriendRows(friends, bill) {
  const peopleNames = new Set((bill.people || []).map((person) => String(person.name || '').toLowerCase()));
  return friends.slice(0, 10).map((friend) => {
    const already = peopleNames.has(String(friend.name || '').toLowerCase());
    return `<button class="account-wizard-friend-row ${already ? 'is-disabled' : ''}" data-add-wizard-friend="${escapeHtml(friend.id)}" ${already ? 'disabled' : ''} type="button">
      <span>${friend.avatarDataUrl ? `<img src="${friend.avatarDataUrl}" alt="" />` : escapeHtml(getInitials(friend.name))}</span>
      <strong>${escapeHtml(friend.name)}</strong>
      <small>${friend.source === 'registered' ? 'Usuario registrado' : 'Amigo manual'}${already ? ' · agregado' : ''}</small>
    </button>`;
  }).join('') || '<p class="helper-text">No hay amigos guardados.</p>';
}

async function loadAccountWizardFriends() {
  if (!accountWizardState) return;
  accountWizardState.friendsLoaded = true;
  try {
    const manualFriends = getFriends().map((friend) => ({ ...friend, source: 'manual', id: friend.id || `manual_${friend.name}` }));
    const registeredFriends = await fetchRegisteredFriendsForPicker();
    if (!accountWizardState) return;
    accountWizardState.friends = [...registeredFriends, ...manualFriends];
    if (accountWizardState.step === 2) renderAccountWizard();
  } catch {
    accountWizardState.friends = getFriends().map((friend) => ({ ...friend, source: 'manual', id: friend.id || `manual_${friend.name}` }));
    if (accountWizardState.step === 2) renderAccountWizard();
  }
}

function renderAccountWizardFriendSearch() {
  if (!accountWizardState) return;
  const bill = getAccountWizardBill();
  const query = normalizeText(dom.accountWizardBody.querySelector('#accountWizardFriendSearch')?.value || '');
  const list = dom.accountWizardBody.querySelector('#accountWizardFriendList');
  if (!list || !bill) return;
  const filtered = (accountWizardState.friends || []).filter((friend) => {
    if (!query) return true;
    return [friend.name, friend.email, friend.phone].filter(Boolean).some((value) => normalizeText(value).includes(query));
  });
  list.innerHTML = filtered.length ? renderAccountWizardFriendRows(filtered, bill) : '<p class="helper-text">No encontré amigos con esa búsqueda.</p>';
  list.querySelectorAll('[data-add-wizard-friend]').forEach((button) => {
    button.addEventListener('click', () => addFriendFromAccountWizard(button.dataset.addWizardFriend));
  });
}

function addManualPersonFromAccountWizard() {
  const bill = ensureAccountWizardDraft();
  const nameInput = dom.accountWizardBody.querySelector('#accountWizardPersonName');
  const phoneInput = dom.accountWizardBody.querySelector('#accountWizardPersonPhone');
  const cleanName = String(nameInput?.value || '').trim();
  if (!cleanName) {
    showToast('Ingresa un nombre.');
    return;
  }
  if (bill.people.some((person) => person.name.toLowerCase() === cleanName.toLowerCase())) {
    showToast('Esa persona ya está en la cuenta.');
    return;
  }
  bill.people.push({
    id: createId('person'),
    name: cleanName,
    phone: normalizePhoneNumber(phoneInput?.value || ''),
    email: '',
    userId: '',
    previousDebt: 0,
    paid: false,
  });
  if (!bill.payerId) bill.payerId = bill.people[0].id;
  addBillActivity(`${cleanName} fue agregado desde creación guiada.`, 'people', bill);
  persistAndRender();
  renderAccountWizard();
}

function addSelfFromAccountWizard() {
  const self = getSelfParticipantInfo();
  if (!self) {
    showToast('Inicia sesión para agregarte como Yo.');
    return;
  }
  const bill = ensureAccountWizardDraft();
  if (bill.people.some((person) => person.userId === self.userId || person.name.toLowerCase() === self.name.toLowerCase())) {
    showToast('Ya estás en esta cuenta.');
    return;
  }
  bill.people.push({
    id: createId('person'),
    name: self.name,
    phone: normalizePhoneNumber(self.phone || ''),
    email: normalizeEmail(self.email || ''),
    userId: self.userId,
    previousDebt: 0,
    paid: false,
  });
  if (!bill.payerId) bill.payerId = bill.people[0].id;
  addBillActivity(`${self.name} fue agregado como Yo.`, 'people', bill);
  persistAndRender();
  renderAccountWizard();
}

async function addFriendFromAccountWizard(friendId) {
  const bill = ensureAccountWizardDraft();
  const friend = (accountWizardState?.friends || []).find((item) => String(item.id) === String(friendId));
  if (!friend) return;
  if (bill.people.some((person) => person.name.toLowerCase() === friend.name.toLowerCase())) {
    showToast('Ese amigo ya está en la cuenta.');
    return;
  }
  const person = {
    id: createId('person'),
    name: friend.name,
    phone: normalizePhoneNumber(friend.phone || ''),
    email: normalizeEmail(friend.email || ''),
    userId: friend.userId || '',
    previousDebt: 0,
    paid: false,
  };
  bill.people.push(person);
  if (!bill.payerId) bill.payerId = bill.people[0].id;
  addBillActivity(`${friend.name} fue agregado desde amigos.`, 'people', bill);
  persistAndRender();
  if (person.userId) {
    inviteRegisteredPeopleToActiveAccount([person], { role: getSharedInviteRoleValue(), silent: true }).catch(() => {});
  }
  renderAccountWizard();
}

function removePersonFromAccountWizard(personId) {
  const bill = ensureAccountWizardDraft();
  bill.people = bill.people.filter((person) => person.id !== personId);
  bill.products = bill.products.map((product) => ({
    ...product,
    consumers: (product.consumers || []).filter((consumer) => consumer.personId !== personId),
  }));
  if (bill.payerId === personId) bill.payerId = bill.people[0]?.id || '';
  addBillActivity('Participante quitado durante la creación guiada.', 'people', bill);
  persistAndRender();
  renderAccountWizard();
}

function renderAccountWizardExpensesStep() {
  const bill = ensureAccountWizardDraft();
  const peopleOptions = (bill.people || []).map((person) => `<label><input type="checkbox" value="${person.id}" checked /> ${escapeHtml(person.name)}</label>`).join('');
  const productsHtml = (bill.products || []).map((product) => `<li><strong>${escapeHtml(product.name)}</strong><span>${formatCurrency(Number(product.unitPrice || 0) * Number(product.quantity || 1))}</span><button data-remove-wizard-product="${product.id}" type="button">×</button></li>`).join('');

  dom.accountWizardBody.innerHTML = `
    ${bill.mode === 'quick' ? `
      <section class="account-wizard-card-mini">
        <h3>Total de la cuenta</h3>
        <label class="account-wizard-field"><span>Monto total</span><input id="accountWizardQuickTotal" type="number" min="0" step="100" value="${Number(bill.quickTotal || 0) || ''}" placeholder="Ej: 25000" /></label>
        <p class="helper-text">Se dividirá entre las personas agregadas.</p>
      </section>
    ` : `
      <section class="account-wizard-card-mini">
        <h3>Agregar gasto</h3>
        <div class="account-wizard-expense-grid">
          <input id="accountWizardProductName" type="text" placeholder="Ej: Pizza, Luz, Netflix" />
          <input id="accountWizardProductAmount" type="number" min="0" step="100" placeholder="Monto" />
          <select id="accountWizardProductCategory">${CATEGORIES.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('')}</select>
          <button class="btn btn-primary" id="accountWizardAddProduct" type="button">Agregar</button>
        </div>
        <div class="account-wizard-consumers"><strong>Lo comparten</strong>${peopleOptions || '<p class="helper-text">Agrega personas en el paso anterior.</p>'}</div>
      </section>
    `}
    <section class="account-wizard-card-mini">
      <h3>Gastos agregados</h3>
      ${bill.mode === 'quick' ? `<p class="account-wizard-total-preview">Total actual: <strong>${formatCurrency(Number(bill.quickTotal || 0))}</strong></p>` : `<ul class="account-wizard-product-list">${productsHtml || '<li class="is-empty">Aún no hay gastos.</li>'}</ul>`}
      <div class="account-wizard-inline-actions"><button class="btn btn-light btn-small" id="accountWizardOpenFullExpenses" type="button">Editar con más detalle después</button></div>
    </section>
  `;

  dom.accountWizardBody.querySelector('#accountWizardQuickTotal')?.addEventListener('input', (event) => {
    bill.quickTotal = Math.max(0, Number(event.target.value || 0));
    addBillActivity('Total rápido actualizado desde creación guiada.', 'expense', bill);
    persistAndRender();
  });
  dom.accountWizardBody.querySelector('#accountWizardAddProduct')?.addEventListener('click', addProductFromAccountWizard);
  dom.accountWizardBody.querySelector('#accountWizardProductName')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') addProductFromAccountWizard();
  });
  dom.accountWizardBody.querySelectorAll('[data-remove-wizard-product]').forEach((button) => {
    button.addEventListener('click', () => removeProductFromAccountWizard(button.dataset.removeWizardProduct));
  });
  dom.accountWizardBody.querySelector('#accountWizardOpenFullExpenses')?.addEventListener('click', () => {
    finishAccountWizard('expenses');
  });
}

function addProductFromAccountWizard() {
  const bill = ensureAccountWizardDraft();
  const nameInput = dom.accountWizardBody.querySelector('#accountWizardProductName');
  const amountInput = dom.accountWizardBody.querySelector('#accountWizardProductAmount');
  const categoryInput = dom.accountWizardBody.querySelector('#accountWizardProductCategory');
  const name = String(nameInput?.value || '').trim();
  const amount = Number(amountInput?.value || 0);
  const consumers = [...dom.accountWizardBody.querySelectorAll('.account-wizard-consumers input[type="checkbox"]:checked')]
    .map((input) => ({ personId: input.value, share: 1 }));

  if (!name) {
    showToast('Ingresa el nombre del gasto.');
    return;
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    showToast('Ingresa un monto mayor a cero.');
    return;
  }
  if (consumers.length === 0) {
    showToast('Selecciona quiénes comparten este gasto.');
    return;
  }

  bill.products.push({
    id: createId('product'),
    name,
    unitPrice: amount,
    quantity: 1,
    category: CATEGORIES.includes(categoryInput?.value) ? categoryInput.value : 'Otros',
    splitMode: 'participants',
    dueDate: '',
    recurring: bill.mode === 'home',
    consumers,
  });
  addBillActivity(`${name} fue agregado desde creación guiada.`, 'expense', bill);
  persistAndRender();
  renderAccountWizard();
}

function removeProductFromAccountWizard(productId) {
  const bill = ensureAccountWizardDraft();
  bill.products = bill.products.filter((product) => product.id !== productId);
  addBillActivity('Gasto quitado durante la creación guiada.', 'expense', bill);
  persistAndRender();
  renderAccountWizard();
}

function renderAccountWizardReviewStep() {
  const bill = ensureAccountWizardDraft();
  const missing = getAccountWizardMissingItems(bill);
  const total = getBillGrandTotal(bill);
  dom.accountWizardBody.innerHTML = `
    <section class="account-wizard-review-card ${missing.length ? 'has-missing' : 'is-ready'}">
      <span>${missing.length ? 'Faltan detalles' : 'Cuenta lista'}</span>
      <strong>${escapeHtml(bill.name)}</strong>
      <p>${bill.people.length} persona${bill.people.length === 1 ? '' : 's'} · ${bill.mode === 'quick' ? 'total rápido' : `${bill.products.length} gasto${bill.products.length === 1 ? '' : 's'}`} · ${formatCurrency(total)}</p>
    </section>
    <div class="account-wizard-review-grid">
      <div><span>Tipo</span><strong>${escapeHtml(bill.templateLabel || getBillModeLabel(bill.mode))}</strong></div>
      <div><span>Pagador</span><strong>${escapeHtml((bill.people || []).find((person) => person.id === bill.payerId)?.name || 'Pendiente')}</strong></div>
      <div><span>Total</span><strong>${formatCurrency(total)}</strong></div>
    </div>
    <section class="account-wizard-card-mini">
      <h3>${missing.length ? 'Para terminar falta' : 'Todo listo'}</h3>
      <ul class="account-wizard-missing-list">
        ${missing.length ? missing.map((item) => `<li>${escapeHtml(item)}</li>`).join('') : '<li>Ya puedes finalizar y compartir el resumen.</li>'}
      </ul>
      <div class="account-wizard-inline-actions">
        <button class="btn btn-light btn-small" data-wizard-jump="2" type="button">Editar personas</button>
        <button class="btn btn-light btn-small" data-wizard-jump="3" type="button">Editar gastos</button>
      </div>
    </section>
  `;
  dom.accountWizardBody.querySelectorAll('[data-wizard-jump]').forEach((button) => {
    button.addEventListener('click', () => {
      accountWizardState.step = Number(button.dataset.wizardJump || 0);
      renderAccountWizard();
    });
  });
}

function getBillGrandTotal(bill) {
  if (!bill) return 0;
  if (bill.mode === 'quick') return Number(bill.quickTotal || 0);
  const subtotal = (bill.products || []).reduce((sum, product) => sum + Number(product.unitPrice || 0) * Number(product.quantity || 1), 0);
  const tip = bill.mode === 'home' ? 0 : subtotal * (Number(bill.tipPercent || 0) / 100);
  return subtotal + tip;
}

function accountWizardNext() {
  if (!accountWizardState) return;
  const step = accountWizardState.step;

  if (step === 0) {
    accountWizardState.name = getAccountWizardDefaultName(accountWizardState.templateKey);
  }

  if (step === 1) {
    const input = dom.accountWizardBody.querySelector('#accountWizardNameInput');
    const cleanName = String(input?.value || accountWizardState.name || '').trim();
    if (!cleanName) {
      showToast('Ingresa un nombre para la cuenta.');
      return;
    }
    accountWizardState.name = cleanName;
    ensureAccountWizardDraft();
  }

  if (step === 2) {
    const bill = ensureAccountWizardDraft();
    if (!bill.people.length) {
      showToast('Agrega al menos una persona para continuar.');
      return;
    }
  }

  if (step === 3) {
    const bill = ensureAccountWizardDraft();
    if (bill.mode === 'quick' && Number(bill.quickTotal || 0) <= 0) {
      showToast('Ingresa el total de la cuenta.');
      return;
    }
    if (bill.mode !== 'quick' && !bill.products.length) {
      showToast('Agrega al menos un gasto.');
      return;
    }
  }

  if (step >= ACCOUNT_WIZARD_STEPS.length - 1) {
    finishAccountWizard('summary');
    return;
  }

  accountWizardState.step += 1;
  renderAccountWizard();
}

function accountWizardBack() {
  if (!accountWizardState || accountWizardState.step <= 0) return;
  accountWizardState.step -= 1;
  renderAccountWizard();
}

function finishAccountWizard(section = 'summary') {
  const bill = ensureAccountWizardDraft();
  addBillActivity('Cuenta creada con asistente guiado.', 'status', bill);
  saveState();
  render();
  const targetSection = normalizeAppSection(section);
  closeAccountWizard({ keepDraft: true });
  setAppSection(targetSection, { scroll: false, instant: true });
  showToast('Cuenta creada. Sigue editando o comparte el resumen.');
}

function createExampleBill() {
  const confirmed = confirm('Esto creará una cuenta de ejemplo para practicar. Puedes eliminarla después desde Historial.');

  if (!confirmed) {
    return;
  }

  const bill = makeDefaultBill();
  bill.name = 'Ejemplo: Cena entre amigos';
  bill.mode = 'detailed';
  bill.tipPercent = 10;

  const people = ['Ana', 'Benja', 'Camila', 'Diego'].map((name) => ({
    id: createId('person'),
    name,
    phone: '',
    email: '',
    userId: '',
    previousDebt: 0,
    paid: false,
  }));

  bill.people = people;
  bill.payerId = people[0].id;
  bill.products = [
    {
      id: createId('product'),
      name: 'Pizza familiar',
      unitPrice: 24000,
      quantity: 1,
      category: 'Comida',
      splitMode: 'participants',
      dueDate: '',
      recurring: false,
      consumers: people.map((person) => ({ personId: person.id, share: 1 })),
    },
    {
      id: createId('product'),
      name: 'Bebidas',
      unitPrice: 6000,
      quantity: 1,
      category: 'Bebestibles',
      splitMode: 'participants',
      dueDate: '',
      recurring: false,
      consumers: people.slice(0, 3).map((person) => ({ personId: person.id, share: 1 })),
    },
    {
      id: createId('product'),
      name: 'Postre compartido',
      unitPrice: 8000,
      quantity: 1,
      category: 'Postres',
      splitMode: 'participants',
      dueDate: '',
      recurring: false,
      consumers: [people[1], people[2]].map((person) => ({ personId: person.id, share: 1 })),
    },
  ];

  state.bills.unshift(bill);
  state.activeBillId = bill.id;
  editingProductId = null;
  localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true');
  saveState();
  render();
  setAppSection('summary', { scroll: false });
  showToast('Cuenta de ejemplo creada. Revisa el resumen y luego edítala en Gastos.');
}


function readDemoBillIds() {
  try {
    const ids = JSON.parse(localStorage.getItem(DEMO_BILL_IDS_KEY) || '[]');
    return Array.isArray(ids) ? ids.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeDemoBillIds(ids = []) {
  try {
    localStorage.setItem(DEMO_BILL_IDS_KEY, JSON.stringify([...new Set(ids.filter(Boolean))]));
  } catch {
    // El modo demo sigue funcionando aunque el navegador no permita registrar los IDs.
  }
}

function makeDemoPerson(name, phone = '', extra = {}) {
  return {
    id: createId('person'),
    name,
    phone: normalizePhoneNumber(phone),
    email: '',
    userId: '',
    previousDebt: Math.max(0, Number(extra.previousDebt || 0)),
    paid: Boolean(extra.paid),
  };
}

function makeDemoProduct(name, amount, category, people, options = {}) {
  const splitMode = options.splitMode || 'participants';
  const consumers = splitMode === 'responsibles'
    ? (options.responsibles || []).map((person) => ({ personId: person.id, share: 1 }))
    : (options.people || people).map((person) => ({ personId: person.id, share: 1 }));

  return {
    id: createId('product'),
    name,
    unitPrice: Math.round(Number(amount || 0)),
    quantity: Math.max(1, Number(options.quantity || 1)),
    category: CATEGORIES.includes(category) ? category : 'Otros',
    splitMode,
    dueDate: options.dueDate || '',
    paidById: options.paidById || '',
    recurring: Boolean(options.recurring),
    consumers,
  };
}

function buildDemoBills() {
  const now = nowIso();
  const today = new Date();
  const soon = new Date(today);
  soon.setDate(today.getDate() + 2);
  const overdue = new Date(today);
  overdue.setDate(today.getDate() - 3);
  const formatDateInput = (date) => date.toISOString().slice(0, 10);

  const restaurant = makeDefaultBill();
  restaurant.name = 'Demo: Restaurante viernes';
  restaurant.mode = 'detailed';
  restaurant.tipPercent = 10;
  restaurant.templateKey = 'restaurant';
  restaurant.templateLabel = 'Restaurante';
  restaurant.createdAt = now;
  restaurant.updatedAt = now;
  restaurant.people = [
    makeDemoPerson('Carlos Demo', '', { paid: true }),
    makeDemoPerson('Felipe Demo'),
    makeDemoPerson('Martín Demo'),
    makeDemoPerson('Sarai Demo', '', { paid: true }),
  ];
  restaurant.payerId = restaurant.people[0].id;
  restaurant.products = [
    makeDemoProduct('Tabla compartida', 28500, 'Comida', restaurant.people),
    makeDemoProduct('Bebidas', 9900, 'Bebestibles', restaurant.people.slice(0, 3), { people: restaurant.people.slice(0, 3) }),
    makeDemoProduct('Postre', 7600, 'Postres', restaurant.people.slice(1), { people: restaurant.people.slice(1) }),
  ];
  restaurant.activity = [{ id: createId('activity'), type: 'demo', message: 'Cuenta demo creada para probar restaurante.', actor: 'Cuenta Clara', actorId: '', at: now }];

  const streaming = makeDefaultBill();
  streaming.name = `Demo: Streaming ${formatMonthLabel(getCurrentMonthValue())}`;
  streaming.mode = 'home';
  streaming.tipPercent = 0;
  streaming.templateKey = 'streaming';
  streaming.templateLabel = 'Streaming';
  streaming.homeMonth = getCurrentMonthValue();
  streaming.paymentDueAt = formatDateInput(soon);
  streaming.people = [
    makeDemoPerson('Carlos Demo', '', { paid: true }),
    makeDemoPerson('Wladi Demo', '', { previousDebt: 4200 }),
    makeDemoPerson('Pamela Demo'),
  ];
  streaming.payerId = streaming.people[0].id;
  streaming.products = [
    makeDemoProduct('Netflix', 14410, 'Streaming', streaming.people, { recurring: true, dueDate: formatDateInput(soon) }),
    makeDemoProduct('Spotify', 7050, 'Streaming', streaming.people, { recurring: true, dueDate: formatDateInput(soon) }),
    makeDemoProduct('Crunchyroll', 4990, 'Streaming', streaming.people.slice(0, 2), { people: streaming.people.slice(0, 2), recurring: true, dueDate: formatDateInput(soon) }),
  ];
  streaming.activity = [{ id: createId('activity'), type: 'demo', message: 'Cuenta demo creada para probar recurrentes y arrastre.', actor: 'Cuenta Clara', actorId: '', at: now }];

  const home = makeDefaultBill();
  home.name = `Demo: Hogar ${formatMonthLabel(getCurrentMonthValue())}`;
  home.mode = 'home';
  home.tipPercent = 0;
  home.templateKey = 'home';
  home.templateLabel = 'Hogar';
  home.homeMonth = getCurrentMonthValue();
  home.paymentDueAt = formatDateInput(overdue);
  home.people = [
    makeDemoPerson('Carlos Demo'),
    makeDemoPerson('Enma Demo', '', { paid: true }),
    makeDemoPerson('Diego Demo'),
  ];
  home.payerId = home.people[1].id;
  home.products = [
    makeDemoProduct('Luz', 32340, 'Luz', home.people, { recurring: true, dueDate: formatDateInput(overdue) }),
    makeDemoProduct('Internet', 19990, 'Internet', home.people, { recurring: true, dueDate: formatDateInput(soon) }),
    makeDemoProduct('Supermercado común', 48600, 'Supermercado', home.people.slice(0, 2), { people: home.people.slice(0, 2), dueDate: formatDateInput(soon) }),
  ];
  home.activity = [{ id: createId('activity'), type: 'demo', message: 'Cuenta demo creada para probar hogar y pagos vencidos.', actor: 'Cuenta Clara', actorId: '', at: now }];

  const recurringGroup = {
    id: createId('recurring'),
    name: 'Demo: Streaming mensual',
    category: 'Streaming',
    frequency: 'monthly',
    billIds: [streaming.id],
    members: streaming.people.map((person) => ({ name: person.name, phone: person.phone, email: person.email, userId: person.userId })),
    createdAt: now,
    updatedAt: now,
  };
  streaming.recurringGroupId = recurringGroup.id;

  return { bills: [restaurant, streaming, home], recurringGroup };
}

function clearDemoData(options = {}) {
  const demoIds = new Set(readDemoBillIds());
  const hadDemo = demoIds.size > 0 || state.bills.some((bill) => String(bill.name || '').startsWith('Demo:'));

  if (!hadDemo) {
    if (!options.silent) showToast('No hay datos demo para borrar.');
    return false;
  }

  if (!options.silent) {
    const confirmed = confirm('¿Borrar las cuentas demo? Tus cuentas reales no se eliminarán.');
    if (!confirmed) return false;
  }

  state.bills = state.bills.filter((bill) => !demoIds.has(bill.id) && !String(bill.name || '').startsWith('Demo:'));
  state.recurringGroups = (state.recurringGroups || []).filter((group) => !String(group.name || '').startsWith('Demo:'));

  if (!state.bills.length) {
    const fallback = makeDefaultBill();
    state.bills = [fallback];
    state.activeBillId = fallback.id;
  } else if (!state.bills.some((bill) => bill.id === state.activeBillId)) {
    state.activeBillId = state.bills[0].id;
  }

  writeDemoBillIds([]);
  saveState();
  render();
  if (!options.silent) showToast('Datos demo eliminados.');
  return true;
}

function loadDemoData() {
  const existingDemo = readDemoBillIds().length > 0 || state.bills.some((bill) => String(bill.name || '').startsWith('Demo:'));
  const message = existingDemo
    ? 'Se reemplazarán las cuentas demo actuales por un ejemplo limpio. Tus cuentas reales se conservarán. ¿Continuar?'
    : 'Se agregarán cuentas simuladas para probar la app. Tus cuentas reales se conservarán. ¿Continuar?';
  if (!confirm(message)) return;

  clearDemoData({ silent: true });
  const { bills, recurringGroup } = buildDemoBills();
  state.bills = [...bills, ...state.bills];
  state.recurringGroups = normalizeRecurringGroups([recurringGroup, ...(state.recurringGroups || [])]);
  state.activeBillId = bills[0].id;
  writeDemoBillIds(bills.map((bill) => bill.id));
  localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true');
  saveState();
  render();
  setAppSection('home', { scroll: false });
  showNotice('Modo demo cargado', 'Se agregaron ejemplos de restaurante, streaming y hogar. Puedes borrarlos desde Inicio cuando termines de probar.');
}

function renderDemoDataCard() {
  if (!dom.demoDataCard || !dom.demoDataStatusOutput) return;
  const demoIds = new Set(readDemoBillIds());
  const demoBills = state.bills.filter((bill) => demoIds.has(bill.id) || String(bill.name || '').startsWith('Demo:'));
  const totalPending = demoBills.reduce((sum, bill) => sum + Math.max(0, calculateBill(bill).pendingTotal || 0), 0);

  dom.demoDataCard.classList.toggle('has-demo-data', demoBills.length > 0);
  dom.demoDataStatusOutput.textContent = demoBills.length
    ? `${demoBills.length} cuenta${demoBills.length === 1 ? '' : 's'} demo activa${demoBills.length === 1 ? '' : 's'} · pendientes simulados ${formatCurrency(totalPending)}`
    : 'Sin datos demo activos.';
  if (dom.clearDemoDataButton) {
    dom.clearDemoDataButton.disabled = demoBills.length === 0;
  }
}

function updateMobileActionBar() {
  if (!dom.mobileAddProductButton || !dom.mobileShareButton) return;

  const copy = getSmartActionCopy();
  const { hasAmounts } = getGuidedState();

  dom.mobileAddProductButton.textContent = copy.button;
  dom.mobileShareButton.textContent = hasAmounts ? 'Compartir' : 'Ver resumen';
  dom.mobileShareButton.disabled = !hasAmounts;
}

function applyGuidedMode(mode) {
  createGuidedBill(mode);
}

function handleSmartAction() {
  const { bill, hasPeople, hasProducts } = getGuidedState();

  if (!hasPeople) {
    scrollToGuideTarget(dom.personNameInput);
    return;
  }

  if (!bill.payerId) {
    scrollToGuideTarget(dom.payerSelect);
    return;
  }

  if (bill.mode === 'quick' && !hasProducts) {
    scrollToGuideTarget(dom.quickTotalInput);
    return;
  }

  if (bill.mode !== 'quick' && !hasProducts) {
    scrollToGuideTarget(dom.productNameInput);
    return;
  }

  setAppSection('payments', { scroll: false });
  openShareModal();
}

function focusManualProductForm() {
  if (getActiveBill().mode === 'quick') {
    showToast('Cambia a Detallada u Hogar para agregar productos.');
    return;
  }

  scrollToGuideTarget(dom.productNameInput);
}

function showQuickProductsArea() {
  if (getActiveBill().mode === 'quick') {
    showToast('Los productos rápidos se usan en modo Detallada u Hogar.');
    return;
  }

  revealSectionForElement(dom.quickProductsList);
  dom.quickProductsList?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function focusQuickTotalPanel() {
  changeActiveBillMode('quick', { focusQuickTotal: true });
}


function getRecurringGroups() {
  state.recurringGroups = normalizeRecurringGroups(state.recurringGroups || []);
  return state.recurringGroups;
}

function getPersonStableKey(person = {}) {
  if (person.userId) return `user:${person.userId}`;
  if (person.email) return `email:${normalizeEmail(person.email)}`;
  if (person.phone) return `phone:${normalizePhoneNumber(person.phone)}`;
  return `name:${String(person.name || '').trim().toLowerCase()}`;
}

function getRecurringGroup(groupId) {
  return getRecurringGroups().find((group) => group.id === groupId) || null;
}

function getGroupBills(group) {
  if (!group) return [];
  const ids = new Set(group.billIds || []);
  return state.bills
    .filter((bill) => bill.recurringGroupId === group.id || ids.has(bill.id))
    .sort((a, b) => String(a.homeMonth || '').localeCompare(String(b.homeMonth || '')) || String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
}

function getLatestGroupBill(group) {
  const bills = getGroupBills(group);
  return bills[bills.length - 1] || null;
}

function getGroupPendingFromLatest(group) {
  const latestBill = getLatestGroupBill(group);
  const pending = new Map();

  if (!latestBill) {
    return pending;
  }

  const calculation = calculateBill(latestBill);

  for (const person of latestBill.people || []) {
    if (!person.paid) {
      const amount = calculation.finalTotals[person.id] || 0;
      if (amount > 0) {
        pending.set(getPersonStableKey(person), {
          name: person.name,
          amount,
          person,
        });
      }
    }
  }

  return pending;
}

function getActiveRecurringGroup() {
  const bill = getActiveBill();
  return bill.recurringGroupId ? getRecurringGroup(bill.recurringGroupId) : null;
}

function billHasAmounts(bill) {
  if (!bill) return false;

  if (bill.mode === 'quick') {
    return Number(bill.quickTotal || 0) > 0;
  }

  const hasProductAmount = (bill.products || []).some((product) =>
    Number(product.unitPrice || 0) * Number(product.quantity || 0) > 0
  );

  const hasPreviousDebt = (bill.people || []).some((person) => Number(person.previousDebt || 0) > 0);

  return hasProductAmount || hasPreviousDebt;
}

function groupHasMonth(group, month, excludedBillId = '') {
  if (!group || !month) return false;
  return getGroupBills(group).some((bill) => bill.id !== excludedBillId && bill.homeMonth === month);
}

function createRecurringGroupFromActiveBill() {
  const bill = getActiveBill();

  if (bill.sharedAccountId && bill.sharedOwnerId !== currentSession.userId) {
    showNotice('Permiso requerido', 'Solo el dueño puede actualizar la configuración de una cuenta compartida.');
    return;
  }

  if (!bill.people.length) {
    showNotice('Faltan participantes', 'Agrega primero las personas que participan en esta cuenta recurrente.');
    return;
  }

  if (!billHasAmounts(bill)) {
    const continueEmpty = confirm('Esta cuenta no tiene gastos ni deudas. ¿Quieres crear la carpeta recurrente de todas formas?');
    if (!continueEmpty) return;
  }

  const suggestedName = bill.name && bill.name !== 'Nueva cuenta' ? bill.name : (bill.templateLabel || 'Streaming');
  const name = prompt('Nombre de la carpeta recurrente:', suggestedName);

  if (name === null) return;

  const cleanName = name.trim();

  if (!cleanName) {
    showToast('El nombre no puede quedar vacío.');
    return;
  }

  const groups = getRecurringGroups();
  const duplicateGroup = groups.find((item) => item.id !== bill.recurringGroupId && item.name.toLowerCase() === cleanName.toLowerCase());

  if (duplicateGroup) {
    showNotice('Carpeta ya existente', `Ya existe una carpeta recurrente llamada "${duplicateGroup.name}". Ábrela desde Hogar / Recurrentes o usa otro nombre.`);
    return;
  }

  let group = bill.recurringGroupId ? getRecurringGroup(bill.recurringGroupId) : null;

  if (!group) {
    group = {
      id: createId('recurring'),
      name: cleanName,
      category: bill.templateLabel || 'Hogar',
      frequency: 'monthly',
      billIds: [],
      members: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    groups.unshift(group);
  } else {
    group.name = cleanName;
    group.updatedAt = nowIso();
  }

  bill.mode = 'home';
  bill.tipPercent = 0;
  bill.homeMonth = bill.homeMonth || getCurrentMonthValue();
  bill.recurringGroupId = group.id;
  bill.recurringSequence = Math.max(1, Number(bill.recurringSequence || 1));

  if (!group.billIds.includes(bill.id)) {
    group.billIds.push(bill.id);
  }

  group.members = bill.people.map((person) => ({
    name: person.name,
    phone: normalizePhoneNumber(person.phone || ''),
    email: normalizeEmail(person.email || ''),
    userId: person.userId || '',
  }));

  persistAndRender();
  showToast(`Carpeta "${cleanName}" creada.`);
}


function getCarryoverNotesFromPendingMap(pendingMap, latestBill, status = 'separate') {
  return [...pendingMap.entries()].map(([key, item]) => ({
    id: createId('carryover'),
    personKey: key,
    personName: item.name || item.person?.name || 'Persona',
    amount: Math.round(Number(item.amount || 0)),
    sourceBillId: latestBill?.id || '',
    sourceMonth: latestBill?.homeMonth || '',
    status,
    createdAt: nowIso(),
  })).filter((item) => item.amount > 0);
}

function getRecurringCarryoverOption(group, nextMonth, pendingTotal, recurringProductsCount) {
  if (pendingTotal <= 0) {
    return 'carryover';
  }

  const answer = prompt(
    `Crear ${group.name} - ${nextMonth}\n\n` +
    `Hay deuda pendiente anterior por ${formatCurrency(pendingTotal)}.\n` +
    `${recurringProductsCount > 0 ? `Se copiarán ${recurringProductsCount} gasto(s) recurrentes.\n\n` : 'Se copiarán los gastos del último mes.\n\n'}` +
    'Elige cómo tratar esa deuda:\n' +
    '1 = Sumarla al nuevo mes como deuda anterior\n' +
    '2 = Mantenerla visible, pero separada del total del nuevo mes\n' +
    '3 = Marcarla como pagada en el mes anterior\n' +
    '4 = Ignorar esta vez',
    '1'
  );

  if (answer === null) return 'cancel';
  const clean = String(answer).trim().toLowerCase();
  if (['1', 'sumar', 'arrastrar', 'deuda', 'deuda anterior'].includes(clean)) return 'carryover';
  if (['2', 'separar', 'separada', 'visible'].includes(clean)) return 'separate';
  if (['3', 'pagada', 'pagar', 'marcar pagada'].includes(clean)) return 'paid';
  if (['4', 'ignorar', 'omitir'].includes(clean)) return 'ignore';

  showNotice('Opción no reconocida', 'No se creó el siguiente mes. Usa 1, 2, 3 o 4 para elegir cómo tratar la deuda anterior.');
  return 'cancel';
}

function markLatestPendingAsPaid(latestBill, pendingMap) {
  if (!latestBill || !pendingMap?.size) return;

  for (const person of latestBill.people || []) {
    const key = getPersonStableKey(person);
    if (pendingMap.has(key)) {
      person.paid = true;
    }
  }

  latestBill.updatedAt = nowIso();
  addBillActivity('Deuda pendiente marcada como pagada al crear el siguiente mes recurrente.', 'payment', latestBill);
}

function getBillSeparateCarryoverTotal(bill = getActiveBill()) {
  return normalizeRecurringCarryoverNotes(bill?.recurringCarryoverNotes || [])
    .filter((item) => item.status === 'separate')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
}

function getBillSeparateCarryoverNotes(bill = getActiveBill()) {
  return normalizeRecurringCarryoverNotes(bill?.recurringCarryoverNotes || [])
    .filter((item) => item.status === 'separate' && Number(item.amount || 0) > 0)
    .sort((a, b) => b.amount - a.amount || a.personName.localeCompare(b.personName));
}

function createNextRecurringMonthFromActive() {
  const bill = getActiveBill();
  let group = bill.recurringGroupId ? getRecurringGroup(bill.recurringGroupId) : null;

  if (!group) {
    createRecurringGroupFromActiveBill();
    group = getActiveRecurringGroup();
  }

  if (!group) {
    return;
  }

  const latestBill = getLatestGroupBill(group) || bill;

  if (!latestBill.people.length) {
    showNotice('Faltan participantes', 'Agrega participantes antes de crear el siguiente mes.');
    return;
  }

  const pendingFromLatest = getGroupPendingFromLatest(group);
  const pendingTotal = [...pendingFromLatest.values()].reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const nextMonth = getNextMonthValue(latestBill.homeMonth || getCurrentMonthValue());

  const existingMonth = getGroupBills(group).find((item) => item.homeMonth === nextMonth);
  if (existingMonth) {
    state.activeBillId = existingMonth.id;
    saveState();
    render();
    showNotice('Mes ya creado', `${group.name} - ${nextMonth} ya existe. Lo abrí para evitar duplicarlo.`);
    return;
  }

  const recurringProducts = (latestBill.products || []).filter((product) => product.recurring);
  const carryoverOption = getRecurringCarryoverOption(group, nextMonth, pendingTotal, recurringProducts.length);

  if (carryoverOption === 'cancel') {
    return;
  }

  if (pendingTotal <= 0) {
    const confirmed = confirm(
      `Crear ${group.name} - ${nextMonth}?\n\n` +
      'No hay deuda pendiente para arrastrar.\n' +
      `${recurringProducts.length ? `Se copiarán ${recurringProducts.length} gasto(s) recurrentes.` : 'No hay gastos marcados como recurrentes; se copiarán todos los gastos.'}`
    );
    if (!confirmed) return;
  }

  if (carryoverOption === 'paid') {
    markLatestPendingAsPaid(latestBill, pendingFromLatest);
  }

  const createdAt = nowIso();
  const personMap = new Map();

  const newPeople = (latestBill.people || []).map((person) => {
    const newId = createId('person');
    const key = getPersonStableKey(person);
    const pending = pendingFromLatest.get(key);
    personMap.set(person.id, newId);

    return {
      ...person,
      id: newId,
      paid: false,
      previousDebt: carryoverOption === 'carryover' && pending ? Math.round(pending.amount) : 0,
    };
  });

  const productsToClone = recurringProducts.length ? recurringProducts : (latestBill.products || []);

  const newBill = {
    ...latestBill,
    id: createId('bill'),
    name: `${group.name} - ${nextMonth}`,
    mode: 'home',
    homeMonth: nextMonth,
    payerId: latestBill.payerId ? personMap.get(latestBill.payerId) || '' : '',
    tipPercent: 0,
    archived: false,
    closed: false,
    closedAt: '',
    recurringGroupId: group.id,
    recurringSequence: Math.max(1, Number(latestBill.recurringSequence || 1)) + 1,
    previousBillId: latestBill.id,
    recurringCarryoverNotes: carryoverOption === 'separate' ? getCarryoverNotesFromPendingMap(pendingFromLatest, latestBill, 'separate') : [],
    sharedAccountId: '',
    sharedRole: '',
    sharedOwnerId: '',
    createdAt,
    updatedAt: createdAt,
    people: newPeople,
    products: productsToClone.map((product) => {
      const dueDay = product.dueDate ? product.dueDate.slice(8, 10) : '';
      const newDueDate = dueDay ? `${nextMonth}-${dueDay}` : '';
      return {
        ...product,
        id: createId('product'),
        dueDate: newDueDate,
        recurring: true,
        consumers: product.consumers
          .filter((consumer) => personMap.has(consumer.personId))
          .map((consumer) => ({ personId: personMap.get(consumer.personId), share: consumer.share })),
      };
    }),
  };

  group.billIds = [...new Set([...(group.billIds || []), latestBill.id, newBill.id])];
  group.members = newBill.people.map((person) => ({
    name: person.name,
    phone: normalizePhoneNumber(person.phone || ''),
    email: normalizeEmail(person.email || ''),
    userId: person.userId || '',
  }));
  group.updatedAt = nowIso();

  const carryoverLabel = carryoverOption === 'carryover'
    ? `con deuda anterior ${formatCurrency(pendingTotal)}`
    : carryoverOption === 'separate'
      ? `con deuda anterior separada ${formatCurrency(pendingTotal)}`
      : carryoverOption === 'paid'
        ? 'marcando deuda anterior como pagada'
        : 'sin arrastre de deuda anterior';
  addBillActivity(`Se creó el siguiente mes ${nextMonth} ${carryoverLabel}.`, 'recurring', latestBill);
  addBillActivity(`Mes ${nextMonth} creado desde ${latestBill.homeMonth || 'mes anterior'} ${carryoverLabel}.`, 'recurring', newBill);
  state.bills.unshift(newBill);
  state.activeBillId = newBill.id;
  editingProductId = null;
  saveState();
  render();
  showToast(carryoverOption === 'carryover' ? 'Siguiente mes creado con deuda acumulada.' : 'Siguiente mes creado.');
}

function renderRecurringGroups() {
  if (!dom.recurringGroupsList) return;

  const groups = getRecurringGroups();
  dom.recurringGroupsList.innerHTML = '';

  if (!groups.length) {
    const empty = document.createElement('p');
    empty.className = 'helper-text compact-text';
    empty.textContent = 'Aún no hay carpetas recurrentes.';
    dom.recurringGroupsList.appendChild(empty);
    return;
  }

  for (const group of groups) {
    const bills = getGroupBills(group);
    const latestBill = getLatestGroupBill(group);
    const pending = getGroupPendingFromLatest(group);
    const pendingTotal = [...pending.values()].reduce((sum, item) => sum + item.amount, 0);
    const button = document.createElement('button');
    button.className = `recurring-group-item ${latestBill?.id === state.activeBillId ? 'active' : ''}`;
    button.type = 'button';
    button.innerHTML = `
      <div>
        <strong>${escapeHtml(group.name)}</strong>
        <span>${bills.length} mes${bills.length === 1 ? '' : 'es'} · ${latestBill?.homeMonth || 'Sin mes'}</span>
        <small>${pendingTotal > 0 ? `Pendiente acumulado ${formatCurrency(pendingTotal)}` : 'Sin deuda acumulada'}</small>
      </div>
      <span class="bill-count">${bills.length}</span>
    `;

    button.addEventListener('click', () => {
      const target = latestBill || bills[0];
      if (!target) return;
      state.activeBillId = target.id;
      editingProductId = null;
      saveState();
      render();
    });

    dom.recurringGroupsList.appendChild(button);
  }
}

function getRecurringBillStats(bill) {
  const calculation = calculateBill(bill);
  const unpaidPeople = (bill.people || []).filter((person) => !person.paid);
  const paidPeople = (bill.people || []).filter((person) => person.paid);
  const carryover = (bill.people || []).reduce((sum, person) => sum + Math.max(0, Number(person.previousDebt || 0)), 0);
  const separateCarryover = getBillSeparateCarryoverTotal(bill);
  const pendingPeople = unpaidPeople
    .map((person) => ({
      person,
      amount: Math.round(calculation.finalTotals[person.id] || 0),
      previousDebt: Math.max(0, Number(person.previousDebt || 0)),
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount || a.person.name.localeCompare(b.person.name));

  return {
    calculation,
    carryover,
    separateCarryover,
    pendingPeople,
    paidPeople,
    unpaidPeople,
    pendingTotal: Math.round(calculation.pendingTotal || 0),
    paidTotal: Math.round(calculation.paidTotal || 0),
    grandTotal: Math.round(calculation.grandTotal || 0),
    isPaid: calculation.isPaid,
  };
}

function getRecurringDebtSnapshot(group) {
  const latestBill = getLatestGroupBill(group);

  if (!latestBill) {
    return [];
  }

  return getRecurringBillStats(latestBill).pendingPeople.map((item) => ({
    key: getPersonStableKey(item.person),
    name: item.person.name,
    amount: item.amount,
    previousDebt: item.previousDebt,
    currentAmount: Math.max(0, item.amount - item.previousDebt),
    personId: item.person.id,
    billId: latestBill.id,
  }));
}

function openRecurringBill(billId) {
  const target = state.bills.find((item) => item.id === billId);

  if (!target) {
    showToast('No se encontró ese mes.');
    return;
  }

  state.activeBillId = target.id;
  editingProductId = null;
  saveState();
  render();
}

function setRecurringPersonPaid(personId, paid) {
  const bill = getActiveBill();
  const person = bill.people.find((item) => item.id === personId);

  if (!person) return;

  person.paid = Boolean(paid);
  addBillActivity(`${person.name} quedó como ${person.paid ? 'pagado' : 'pendiente'} en recurrentes.`, 'payment', bill);
  persistAndRender();
  showToast(`${person.name} quedó como ${person.paid ? 'pagado' : 'pendiente'}.`);
}

function renderRecurringCurrentPeople(bill) {
  if (!dom.recurringCurrentPeopleList) return;

  const stats = getRecurringBillStats(bill);
  dom.recurringCurrentPeopleList.innerHTML = '';

  if (!bill.people.length) {
    dom.recurringCurrentPeopleList.appendChild(emptyMessage('Agrega participantes para controlar pagos mensuales.'));
    return;
  }

  for (const person of bill.people) {
    const amount = Math.round(stats.calculation.finalTotals[person.id] || 0);
    const previousDebt = Math.max(0, Number(person.previousDebt || 0));
    const row = document.createElement('div');
    row.className = `recurring-payment-row ${person.paid ? 'is-paid' : 'is-pending'}`;
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(person.name)}</strong>
        <span>${person.paid ? 'Pagado' : 'Pendiente'} · ${formatCurrency(amount)}${previousDebt > 0 ? ` · incluye arrastre ${formatCurrency(previousDebt)}` : ''}</span>
      </div>
      <button class="btn btn-light btn-small" type="button">${person.paid ? 'Marcar pendiente' : 'Marcar pagado'}</button>
    `;

    row.querySelector('button').addEventListener('click', () => {
      setRecurringPersonPaid(person.id, !person.paid);
    });

    dom.recurringCurrentPeopleList.appendChild(row);
  }
}

function renderRecurringDebtSnapshot(group) {
  if (!dom.recurringDebtList) return;

  const debts = getRecurringDebtSnapshot(group);
  dom.recurringDebtList.innerHTML = '';

  if (!debts.length) {
    const empty = document.createElement('p');
    empty.className = 'helper-text';
    empty.textContent = 'No hay deuda vigente acumulada.';
    dom.recurringDebtList.appendChild(empty);
    return;
  }

  for (const debt of debts) {
    const row = document.createElement('div');
    row.className = 'recurring-debt-row';
    row.innerHTML = `
      <div>
        <span>${escapeHtml(debt.name)}</span>
        <small>${debt.previousDebt > 0 ? `Arrastre ${formatCurrency(debt.previousDebt)} + mes actual ${formatCurrency(debt.currentAmount)}` : 'Solo mes actual pendiente'}</small>
      </div>
      <strong>${formatCurrency(debt.amount)}</strong>
    `;
    dom.recurringDebtList.appendChild(row);
  }
}

function renderRecurringMonthHistory(group) {
  if (!dom.recurringMonthHistoryList) return;

  const bills = getGroupBills(group);
  dom.recurringMonthHistoryList.innerHTML = '';

  if (!bills.length) {
    dom.recurringMonthHistoryList.appendChild(emptyMessage('Esta carpeta todavía no tiene meses conectados.'));
    return;
  }

  for (const item of [...bills].reverse()) {
    const stats = getRecurringBillStats(item);
    const row = document.createElement('button');
    row.className = `recurring-month-row ${item.id === state.activeBillId ? 'active' : ''}`;
    row.type = 'button';
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(item.homeMonth || 'Sin mes')}</strong>
        <span>${escapeHtml(item.name)} · ${stats.isPaid ? 'Pagado' : 'Pendiente'}</span>
      </div>
      <div>
        <strong>${formatCurrency(stats.grandTotal)}</strong>
        <small>${stats.pendingTotal > 0 ? `Pendiente ${formatCurrency(stats.pendingTotal)}` : 'Sin pendiente'}</small>
      </div>
    `;

    row.addEventListener('click', () => openRecurringBill(item.id));
    dom.recurringMonthHistoryList.appendChild(row);
  }
}

function renderRecurringFolderOverview(group, bill, stats, latestBill, latestStats) {
  if (!dom.recurringFolderOverviewList) return;

  dom.recurringFolderOverviewList.innerHTML = '';
  const bills = getGroupBills(group);
  const nextMonth = getNextMonthValue((latestBill || bill).homeMonth || getCurrentMonthValue());
  const recurringProducts = ((latestBill || bill).products || []).filter((product) => product.recurring);
  const payer = (latestBill || bill).people.find((person) => person.id === (latestBill || bill).payerId);
  const separateCarryover = getBillSeparateCarryoverTotal(latestBill || bill);
  const summaryItems = [
    ['Siguiente mes', nextMonth],
    ['Gastos recurrentes', `${recurringProducts.length} marcado${recurringProducts.length === 1 ? '' : 's'}`],
    ['Pagador habitual', payer?.name || 'Sin pagador'],
    ['Último pendiente', formatCurrency(latestStats.pendingTotal || 0)],
    separateCarryover > 0 ? ['Deuda separada visible', formatCurrency(separateCarryover)] : null,
  ].filter(Boolean);

  const box = document.createElement('div');
  box.className = 'recurring-folder-overview-grid';
  box.innerHTML = summaryItems.map(([label, value]) => `
    <div>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `).join('');
  dom.recurringFolderOverviewList.appendChild(box);

  const note = document.createElement('p');
  note.className = 'helper-text compact-text';
  note.textContent = bills.length > 1
    ? 'Esta carpeta ya funciona como historial mensual. Al crear el siguiente mes se copian personas, gastos recurrentes, pagador y deuda pendiente.'
    : 'Crea el siguiente mes para empezar un historial mensual conectado.';
  dom.recurringFolderOverviewList.appendChild(note);

  const separateNotes = getBillSeparateCarryoverNotes(latestBill || bill);
  if (separateNotes.length > 0) {
    const list = document.createElement('div');
    list.className = 'recurring-separated-carryover-list';
    list.innerHTML = `
      <strong>Deuda anterior visible, no sumada al mes</strong>
      ${separateNotes.map((item) => `
        <div>
          <span>${escapeHtml(item.personName)} · ${escapeHtml(item.sourceMonth || 'mes anterior')}</span>
          <strong>${formatCurrency(item.amount)}</strong>
        </div>
      `).join('')}
    `;
    dom.recurringFolderOverviewList.appendChild(list);
  }
}

function renderRecurringDashboard() {
  if (!dom.recurringDashboardCard) return;

  const bill = getActiveBill();
  const group = getActiveRecurringGroup();
  const show = Boolean(group && bill.mode === 'home');
  dom.recurringDashboardCard.classList.toggle('hidden', !show);

  if (!show) return;

  const bills = getGroupBills(group);
  const stats = getRecurringBillStats(bill);
  const latestBill = getLatestGroupBill(group) || bill;
  const latestStats = getRecurringBillStats(latestBill);
  const activeMonthLabel = bill.homeMonth || '-';

  dom.recurringDashboardTitle.textContent = group.name;
  dom.recurringDashboardHelp.textContent = `Esta carpeta conecta ${bills.length} mes${bills.length === 1 ? '' : 'es'} de ${group.name}. Usa el historial para abrir meses anteriores y marca pagos para que el siguiente mes arrastre solo lo pendiente.`;
  dom.recurringCurrentMonthOutput.textContent = activeMonthLabel;
  dom.recurringMonthsOutput.textContent = bills.length;
  dom.recurringCarryoverOutput.textContent = stats.separateCarryover > 0
    ? `${formatCurrency(stats.carryover)} + ${formatCurrency(stats.separateCarryover)} separado`
    : formatCurrency(stats.carryover);
  if (dom.recurringPendingOutput) dom.recurringPendingOutput.textContent = formatCurrency(latestStats.pendingTotal);
  if (dom.recurringActiveMonthTitle) dom.recurringActiveMonthTitle.textContent = activeMonthLabel;
  if (dom.recurringActiveMonthStatus) {
    dom.recurringActiveMonthStatus.textContent = stats.isPaid
      ? `Mes pagado · ${formatCurrency(stats.grandTotal)}`
      : `Pendiente ${formatCurrency(stats.pendingTotal)} de ${formatCurrency(stats.grandTotal)}`;
  }

  renderRecurringFolderOverview(group, bill, stats, latestBill, latestStats);
  renderRecurringCurrentPeople(bill);
  renderRecurringDebtSnapshot(group);
  renderRecurringMonthHistory(group);
}

function canUseSharedAccounts() {
  return hasSupabaseClient() && currentSession.mode === 'user' && Boolean(currentSession.userId);
}


function isActiveSharedReadOnly() {
  const bill = getActiveBill();
  return Boolean(
    bill.sharedAccountId
    && bill.sharedRole === 'viewer'
    && bill.sharedOwnerId !== currentSession.userId
  );
}

function getSharedRoleDescription(role, isOwner = false) {
  if (isOwner || role === 'owner') {
    return 'Puede administrar la cuenta, invitar personas y actualizar permisos.';
  }
  if (role === 'viewer') {
    return 'Puede revisar la cuenta, pero no modificar personas, gastos ni pagos.';
  }
  return 'Puede editar personas, gastos y pagos de esta cuenta compartida.';
}

function renderSharedPermissionState() {
  const bill = getActiveBill();
  const isShared = Boolean(bill.sharedAccountId);
  const isOwner = isShared && bill.sharedOwnerId === currentSession.userId;
  const readOnly = isActiveSharedReadOnly();
  const roleLabel = isShared ? getSharedRoleLabel(bill.sharedRole, isOwner) : 'Privada';

  document.body.classList.toggle('shared-readonly-mode', readOnly);
  document.body.dataset.sharedRole = isShared ? (readOnly ? 'viewer' : (isOwner ? 'owner' : bill.sharedRole || 'editor')) : 'private';

  if (!dom.sharedReadOnlyBanner) return;

  if (!isShared) {
    dom.sharedReadOnlyBanner.classList.add('hidden');
    dom.sharedReadOnlyBanner.innerHTML = '';
    return;
  }

  dom.sharedReadOnlyBanner.classList.toggle('readonly', readOnly);
  dom.sharedReadOnlyBanner.classList.remove('hidden');
  dom.sharedReadOnlyBanner.innerHTML = `
    <div>
      <p class="eyebrow">${readOnly ? 'Solo lectura' : 'Cuenta compartida'}</p>
      <strong>${escapeHtml(roleLabel)}</strong>
      <small>${escapeHtml(getSharedRoleDescription(bill.sharedRole, isOwner))}</small>
    </div>
    <button class="btn btn-light btn-small" type="button" data-app-section="shared">Ver colaboración</button>
  `;
  dom.sharedReadOnlyBanner.querySelector('[data-app-section="shared"]')?.addEventListener('click', () => setAppSection('shared'));
}

function getSharedRoleLabel(role, isOwner = false) {
  if (isOwner || role === 'owner') return 'Dueño';
  if (role === 'viewer') return 'Lector';
  return 'Editor';
}

function canManageActiveSharedAccount() {
  const bill = getActiveBill();
  return Boolean(
    canUseSharedAccounts()
    && bill.sharedAccountId
    && bill.sharedOwnerId === currentSession.userId
  );
}

function getSharedStatusLabel(status) {
  if (status === 'accepted') return 'Aceptado';
  if (status === 'rejected') return 'Rechazado';
  return 'Pendiente';
}

function getSharedStatusClass(status) {
  if (status === 'accepted') return 'success';
  if (status === 'rejected') return 'muted';
  return 'warning';
}

function getSharedInviteHelpText(role) {
  if (role === 'viewer') {
    return 'Te invitaron como Lector. Podrás revisar la cuenta, pero no modificar personas, gastos ni pagos.';
  }
  return 'Te invitaron como Editor. Podrás modificar personas, gastos y pagos de esta cuenta.';
}


function getSharedPermissionBullets(role, isOwner = false) {
  if (isOwner || role === 'owner') {
    return ['Editar todo', 'Invitar personas', 'Cambiar roles', 'Cerrar o actualizar la cuenta'];
  }
  if (role === 'viewer') {
    return ['Revisar montos', 'Copiar comprobante desde Resumen', 'Sin editar personas', 'Sin modificar pagos'];
  }
  return ['Agregar gastos', 'Editar participantes', 'Marcar pagos', 'Actualizar la cuenta'];
}

function getSharedParticipantType(person) {
  if (personMatchesSelf(person)) {
    return {
      label: 'Tú',
      className: 'self',
      detail: 'Vinculado a tu perfil real',
    };
  }

  if (String(person.userId || '').trim()) {
    return {
      label: 'Usuario registrado',
      className: 'registered',
      detail: 'Participante vinculado a una cuenta registrada',
    };
  }

  if (normalizeEmail(person.email || '')) {
    return {
      label: 'Correo guardado',
      className: 'email',
      detail: 'Tiene correo, pero no está vinculado a usuario registrado',
    };
  }

  return {
    label: 'Manual',
    className: 'manual',
    detail: 'Persona escrita manualmente en esta cuenta',
  };
}

function getSharedMemberForPerson(person, bill = getActiveBill()) {
  if (!person?.userId || !bill?.sharedAccountId) return null;
  return sharedMembersCache.find((member) => (
    member.account_id === bill.sharedAccountId
    && member.user_id === person.userId
  )) || null;
}

function getActiveSharedAccessSummary() {
  const bill = getActiveBill();
  const isShared = Boolean(bill.sharedAccountId);
  const isOwner = isShared && bill.sharedOwnerId === currentSession.userId;
  const role = isShared ? (isOwner ? 'owner' : bill.sharedRole || 'editor') : 'private';
  const members = isShared
    ? sharedMembersCache.filter((member) => member.account_id === bill.sharedAccountId)
    : [];
  const accepted = members.filter((member) => member.status === 'accepted');
  const pending = members.filter((member) => member.status === 'pending');
  const rejected = members.filter((member) => member.status === 'rejected');
  const linkedPeople = bill.people.filter((person) => String(person.userId || '').trim()).length;
  const manualPeople = Math.max(0, bill.people.length - linkedPeople);

  return {
    bill,
    isShared,
    isOwner,
    role,
    members,
    accepted,
    pending,
    rejected,
    linkedPeople,
    manualPeople,
    readOnly: isActiveSharedReadOnly(),
  };
}

function renderSharedAccessDashboard() {
  if (!dom.sharedAccessDashboard) return;

  const summary = getActiveSharedAccessSummary();
  const roleLabel = summary.isShared
    ? getSharedRoleLabel(summary.role, summary.isOwner)
    : 'Privada';
  const permissionItems = summary.isShared
    ? getSharedPermissionBullets(summary.role, summary.isOwner)
    : ['Solo tú puedes editarla', 'No tiene invitados', 'Puedes compartirla cuando quieras'];
  const ownerText = summary.isShared
    ? (summary.isOwner ? 'Eres dueño de esta cuenta.' : 'Estás participando como invitado registrado.')
    : 'Esta cuenta todavía no está publicada como compartida.';

  dom.sharedAccessDashboard.innerHTML = `
    <div class="shared-access-card ${summary.readOnly ? 'is-readonly' : ''}">
      <div class="shared-access-main">
        <p class="eyebrow">Acceso de la cuenta actual</p>
        <h3>${escapeHtml(roleLabel)}</h3>
        <p>${escapeHtml(ownerText)}</p>
      </div>
      <div class="shared-access-stats">
        <span><b>${summary.linkedPeople}</b><small>Vinculados</small></span>
        <span><b>${summary.manualPeople}</b><small>Manuales</small></span>
        <span><b>${summary.pending.length}</b><small>Pendientes</small></span>
      </div>
      <ul class="shared-permission-chips">
        ${permissionItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    </div>
  `;
}

function renderSharedParticipantMap() {
  if (!dom.sharedParticipantMapList) return;

  const summary = getActiveSharedAccessSummary();
  const { bill } = summary;
  dom.sharedParticipantMapList.innerHTML = '';

  if (!bill.people.length) {
    dom.sharedParticipantMapList.appendChild(emptyMessage('Agrega personas para revisar si son manuales, registradas o vinculadas a tu perfil.'));
    return;
  }

  for (const person of bill.people) {
    const type = getSharedParticipantType(person);
    const member = getSharedMemberForPerson(person, bill);
    const memberStatus = member ? getSharedStatusLabel(member.status) : '';
    const memberRole = member ? getSharedRoleLabel(member.role) : '';
    const canLinkSelf = !personMatchesSelf(person) && getPotentialSelfNameMatches(bill).some((candidate) => candidate.id === person.id);
    const row = document.createElement('article');
    row.className = `shared-row shared-participant-card participant-${type.className}`;
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(person.name)} <span class="person-source-badge ${type.className}">${escapeHtml(type.label)}</span></strong>
        <small>${escapeHtml(type.detail)}${member ? ` · ${escapeHtml(memberRole)} · ${escapeHtml(memberStatus)}` : ''}</small>
      </div>
      <div class="shared-row-actions">
        ${canLinkSelf ? '<button class="btn btn-light btn-small" type="button" data-action="link-self">Vincular como Yo</button>' : ''}
        ${person.userId && !member && summary.isShared && summary.isOwner ? '<button class="btn btn-primary btn-small" type="button" data-action="invite-person">Enviar solicitud</button>' : ''}
      </div>
    `;

    row.querySelector('[data-action="link-self"]')?.addEventListener('click', () => {
      updatePersonWithSelfProfile(person);
      addBillActivity(`${person.name} fue vinculado al perfil del usuario actual.`, 'profile', bill);
      persistAndRender();
      showToast('Participante vinculado a tu perfil.');
    });

    row.querySelector('[data-action="invite-person"]')?.addEventListener('click', () => invitePersonToSharedAccount(person));

    dom.sharedParticipantMapList.appendChild(row);
  }
}

function createSharedSectionTitle(text, count = null) {
  const title = document.createElement('strong');
  title.className = 'shared-list-title';
  title.textContent = count === null ? text : `${text} (${count})`;
  return title;
}

function renderSharedAccountRow(account, roleLabel, metaParts = []) {
  const bill = getActiveBill();
  const accountBill = account.account_state || {};
  const row = document.createElement('button');
  row.className = `shared-row shared-row-button ${bill.sharedAccountId === account.id ? 'active' : ''}`;
  row.type = 'button';

  const pendingCount = Number(account.pendingInvites || 0);
  const acceptedCount = Number(account.acceptedMembers || 0);
  const rejectedCount = Number(account.rejectedInvites || 0);
  const details = [
    roleLabel,
    accountBill.homeMonth || getBillModeLabel(accountBill.mode),
    account.updated_at ? `Actualizada ${formatDate(account.updated_at)}` : '',
    ...metaParts,
    pendingCount > 0 ? `${pendingCount} pendiente${pendingCount === 1 ? '' : 's'}` : '',
    acceptedCount > 0 ? `${acceptedCount} aceptado${acceptedCount === 1 ? '' : 's'}` : '',
    rejectedCount > 0 ? `${rejectedCount} rechazado${rejectedCount === 1 ? '' : 's'}` : '',
  ].filter(Boolean);

  const badges = [
    pendingCount > 0 ? `<span class="shared-status-badge warning">${pendingCount} pendiente${pendingCount === 1 ? '' : 's'}</span>` : '',
    acceptedCount > 0 ? `<span class="shared-status-badge success">${acceptedCount} aceptado${acceptedCount === 1 ? '' : 's'}</span>` : '',
    rejectedCount > 0 ? `<span class="shared-status-badge muted">${rejectedCount} rechazado${rejectedCount === 1 ? '' : 's'}</span>` : '',
  ].filter(Boolean).join('');

  row.innerHTML = `
    <div>
      <strong>${escapeHtml(account.title || accountBill.name || 'Cuenta compartida')}</strong>
      <small>${escapeHtml(details.join(' · '))}</small>
      ${badges ? `<div class="shared-mini-badges">${badges}</div>` : ''}
    </div>
    <span aria-hidden="true">Abrir</span>
  `;
  row.addEventListener('click', () => openSharedAccount(account.id));
  return row;
}


function getSharedMemberDisplayName(member) {
  const profile = member.profile || {};
  return profile.nick || profile.nombre || profile.email || member.user_id || 'Usuario registrado';
}

function renderSharedMembersList() {
  if (!dom.sharedMembersList) return;

  const bill = getActiveBill();
  dom.sharedMembersList.innerHTML = '';

  if (!bill.sharedAccountId) {
    const empty = document.createElement('p');
    empty.className = 'helper-text compact-text';
    empty.textContent = 'Cuando compartas la cuenta actual, aquí verás participantes, invitaciones y permisos.';
    dom.sharedMembersList.appendChild(empty);
    return;
  }

  const isOwner = bill.sharedOwnerId === currentSession.userId;
  const members = sharedMembersCache.filter((member) => member.account_id === bill.sharedAccountId);

  const title = createSharedSectionTitle(isOwner ? 'Miembros y permisos' : 'Mi acceso');
  dom.sharedMembersList.appendChild(title);

  if (!isOwner) {
    const row = document.createElement('div');
    row.className = 'shared-row shared-permission-row';
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(getSharedRoleLabel(bill.sharedRole))}</strong>
        <small>${escapeHtml(getSharedRoleDescription(bill.sharedRole))}</small>
      </div>
    `;
    dom.sharedMembersList.appendChild(row);
    return;
  }

  if (!members.length) {
    const empty = document.createElement('p');
    empty.className = 'helper-text compact-text';
    empty.textContent = 'Aún no hay invitaciones para esta cuenta. Busca un correo o nick registrado para invitar.';
    dom.sharedMembersList.appendChild(empty);
    return;
  }

  for (const member of members) {
    const row = document.createElement('div');
    row.className = `shared-row shared-member-card status-${member.status || 'pending'}`;
    const statusLabel = getSharedStatusLabel(member.status);
    const statusClass = getSharedStatusClass(member.status);
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(getSharedMemberDisplayName(member))}</strong>
        <small><span class="shared-status-badge ${statusClass}">${escapeHtml(statusLabel)}</span> · ${escapeHtml(getSharedRoleLabel(member.role))}</small>
      </div>
      <div class="shared-member-controls">
        <select aria-label="Rol de ${escapeHtml(getSharedMemberDisplayName(member))}">
          <option value="editor" ${member.role === 'editor' ? 'selected' : ''}>Editor</option>
          <option value="viewer" ${member.role === 'viewer' ? 'selected' : ''}>Lector</option>
        </select>
        <button class="btn btn-light btn-small" type="button" data-action="remove">Quitar</button>
      </div>
    `;

    row.querySelector('select')?.addEventListener('change', (event) => updateSharedMemberRole(member.id, event.target.value));
    row.querySelector('[data-action="remove"]')?.addEventListener('click', () => removeSharedMember(member));
    dom.sharedMembersList.appendChild(row);
  }
}

function renderSharedActivityList() {
  if (!dom.sharedActivityList) return;

  const bill = getActiveBill();
  const activity = normalizeBillActivity(bill.activity).slice(0, 10);
  dom.sharedActivityList.innerHTML = '';

  if (!bill.sharedAccountId && !activity.length) {
    dom.sharedActivityList.appendChild(emptyMessage('Cuando compartas o edites una cuenta, aquí verás los cambios recientes.'));
    return;
  }

  if (!activity.length) {
    dom.sharedActivityList.appendChild(emptyMessage('Aún no hay actividad registrada en esta cuenta.'));
    return;
  }

  for (const item of activity) {
    const row = document.createElement('div');
    row.className = `profile-activity-row shared-activity-row activity-${escapeHtml(item.type)}`;
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(item.message)}</strong>
        <span>${escapeHtml(item.actor || 'Cuenta Clara')} · ${escapeHtml(formatDate(item.at))}</span>
      </div>
    `;
    dom.sharedActivityList.appendChild(row);
  }
}

function renderSharedPanel() {
  if (!dom.sharedAccountStatus) return;

  const bill = getActiveBill();
  const isUser = currentSession.mode === 'user';

  if (!isUser) {
    dom.sharedAccountStatus.innerHTML = '<p class="helper-text compact-text">Inicia sesión para compartir cuentas.</p>';
    dom.sharedAccountsList.innerHTML = '';
    dom.sharedInvitesList.innerHTML = '';
    if (dom.sharedAccessDashboard) dom.sharedAccessDashboard.innerHTML = '';
    if (dom.sharedParticipantMapList) dom.sharedParticipantMapList.innerHTML = '';
    if (dom.sharedMembersList) dom.sharedMembersList.innerHTML = '';
    if (dom.sharedActivityList) dom.sharedActivityList.innerHTML = '';
    renderNotificationCenter();
    return;
  }

  const pending = sharedInvitesCache.filter((invite) => invite.status === 'pending');
  const ownedAccounts = sharedAccountsCache.filter((account) => account.owner_id === currentSession.userId);
  const acceptedAsGuest = sharedAccountsCache.filter((account) => account.owner_id !== currentSession.userId);
  const currentRole = bill.sharedAccountId
    ? getSharedRoleLabel(bill.sharedRole, bill.sharedOwnerId === currentSession.userId)
    : 'Privada';
  const currentLabel = bill.sharedAccountId
    ? `Cuenta actual compartida · ${currentRole}`
    : 'Cuenta actual privada';
  const isOwnerOfActive = bill.sharedAccountId && bill.sharedOwnerId === currentSession.userId;
  const canInviteFromActive = !bill.sharedAccountId || isOwnerOfActive;
  const acceptedMembers = sharedMembersCache.filter((member) => member.status === 'accepted').length;
  const rejectedMembers = sharedMembersCache.filter((member) => member.status === 'rejected').length;

  if (dom.publishSharedAccountButton) {
    dom.publishSharedAccountButton.disabled = Boolean(bill.sharedAccountId && !isOwnerOfActive);
    dom.publishSharedAccountButton.textContent = bill.sharedAccountId
      ? (isOwnerOfActive ? 'Actualizar cuenta compartida' : 'Solo el dueño puede actualizar')
      : 'Compartir cuenta actual';
  }

  [dom.sharedInviteSearchInput, dom.sharedInviteRoleSelect, dom.inviteSharedUserButton].filter(Boolean).forEach((control) => {
    control.disabled = !canInviteFromActive;
  });

  if (dom.inviteSharedUserButton) {
    dom.inviteSharedUserButton.textContent = canInviteFromActive ? 'Invitar' : 'Solo dueño';
  }

  if (dom.refreshSharedAccountsButton) {
    dom.refreshSharedAccountsButton.textContent = sharedUiBusy ? 'Actualizando…' : 'Actualizar';
    dom.refreshSharedAccountsButton.disabled = sharedUiBusy;
  }

  const inviteHint = canInviteFromActive
    ? 'Puedes invitar por correo o nick registrado. Elige Editor para permitir cambios o Lector para solo lectura.'
    : 'Esta cuenta fue compartida contigo. Solo el dueño puede invitar personas o cambiar permisos.';

  dom.sharedAccountStatus.innerHTML = `
    <div class="shared-current-box">
      <div>
        <strong>${escapeHtml(currentLabel)}</strong>
        <small>${escapeHtml(inviteHint)}</small>
      </div>
      <div class="shared-status-grid" aria-label="Estado de colaboración">
        <span><b>${pending.length}</b><small>Invitaciones</small></span>
        <span><b>${ownedAccounts.length}</b><small>Creadas por mí</small></span>
        <span><b>${acceptedAsGuest.length}</b><small>Compartidas conmigo</small></span>
        <span><b>${acceptedMembers}</b><small>Miembros activos</small></span>
      </div>
      ${rejectedMembers ? `<small class="shared-rejected-note">${rejectedMembers} invitación${rejectedMembers === 1 ? '' : 'es'} rechazada${rejectedMembers === 1 ? '' : 's'} en tus cuentas.</small>` : ''}
    </div>
  `;

  renderSharedAccessDashboard();
  renderSharedParticipantMap();

  dom.sharedInvitesList.innerHTML = '';

  if (pending.length) {
    dom.sharedInvitesList.appendChild(createSharedSectionTitle('Invitaciones pendientes', pending.length));
  }

  for (const invite of pending) {
    const row = document.createElement('div');
    row.className = 'shared-row shared-invite-card';
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(invite.title || 'Cuenta compartida')}</strong>
        <small>${escapeHtml(getSharedInviteHelpText(invite.role))}</small>
      </div>
      <div class="shared-row-actions">
        <button class="btn btn-primary btn-small" type="button" data-action="accept">Aceptar</button>
        <button class="btn btn-light btn-small" type="button" data-action="reject">Rechazar</button>
      </div>
    `;
    row.querySelector('[data-action="accept"]').addEventListener('click', () => acceptSharedInvite(invite));
    row.querySelector('[data-action="reject"]').addEventListener('click', () => rejectSharedInvite(invite));
    dom.sharedInvitesList.appendChild(row);
  }

  dom.sharedAccountsList.innerHTML = '';

  if (!ownedAccounts.length && !acceptedAsGuest.length) {
    const empty = document.createElement('p');
    empty.className = 'helper-text compact-text';
    empty.textContent = pending.length
      ? 'Acepta una invitación para que aparezca como cuenta compartida.'
      : 'No hay cuentas compartidas cargadas.';
    dom.sharedAccountsList.appendChild(empty);
    renderSharedMembersList();
    renderSharedActivityList();
    renderNotificationCenter();
    return;
  }

  if (ownedAccounts.length) {
    dom.sharedAccountsList.appendChild(createSharedSectionTitle('Creadas por mí', ownedAccounts.length));
    for (const account of ownedAccounts) {
      dom.sharedAccountsList.appendChild(renderSharedAccountRow(account, 'Dueño'));
    }
  }

  if (acceptedAsGuest.length) {
    dom.sharedAccountsList.appendChild(createSharedSectionTitle('Compartidas conmigo', acceptedAsGuest.length));
    for (const account of acceptedAsGuest) {
      dom.sharedAccountsList.appendChild(renderSharedAccountRow(account, getSharedRoleLabel(account.role), ['Invitado']));
    }
  }

  renderSharedMembersList();
  renderSharedActivityList();
  renderNotificationCenter();
}


function getNotificationStorageKey() {
  const userKey = currentSession.userId || currentSession.email || 'guest';
  return `${NOTIFICATION_SEEN_KEY_PREFIX}:${userKey}`;
}

function loadSeenNotificationIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(getNotificationStorageKey()) || '[]');
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
}

function saveSeenNotificationIds(ids) {
  try {
    localStorage.setItem(getNotificationStorageKey(), JSON.stringify([...ids].slice(-200)));
  } catch {
      }
}

function getSharedInviteNotification(invite = {}) {
  const accountId = invite.accountId || invite.account_id || invite.id || '';
  const title = invite.title || invite.account_state?.name || 'Cuenta compartida';
  return {
    id: `shared-invite:${accountId}`,
    type: 'shared-invite',
    accountId,
    title,
    role: invite.role || 'viewer',
    status: invite.status || 'pending',
    text: `Tienes una solicitud para ver ${title}.`,
    actionLabel: 'Revisar',
  };
}

function getInternalNotifications() {
  if (currentSession.mode !== 'user') return [];
  return sharedInvitesCache
    .filter((invite) => invite.status === 'pending' && invite.accountId)
    .map(getSharedInviteNotification);
}

function getUnreadInternalNotifications() {
  const seen = loadSeenNotificationIds();
  return getInternalNotifications().filter((item) => !seen.has(item.id));
}

function markNotificationSeen(notificationId) {
  if (!notificationId) return;
  const seen = loadSeenNotificationIds();
  seen.add(String(notificationId));
  saveSeenNotificationIds(seen);
  renderNotificationCenter();
}

function markAllNotificationsSeen() {
  const seen = loadSeenNotificationIds();
  for (const item of getInternalNotifications()) seen.add(item.id);
  saveSeenNotificationIds(seen);
  renderNotificationCenter();
  showToast('Solicitudes marcadas como vistas.');
}

function setNotificationBadge(element, count) {
  if (!element) return;
  element.textContent = String(count);
  element.classList.toggle('hidden', count <= 0);
  element.setAttribute('aria-label', count > 0 ? `${count} solicitud${count === 1 ? '' : 'es'} nueva${count === 1 ? '' : 's'}` : 'Sin solicitudes nuevas');
}

function openNotificationCenter() {
  setAppSection('shared');
  setTimeout(() => {
    dom.sharedNotificationSummary?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 80);
}

function createNotificationRow(notification, options = {}) {
  const seen = loadSeenNotificationIds();
  const unread = !seen.has(notification.id);
  const row = document.createElement('div');
  row.className = `notification-row ${unread ? 'is-unread' : 'is-seen'}`;
  row.innerHTML = `
    <div class="notification-dot" aria-hidden="true"></div>
    <div class="notification-body">
      <strong>${escapeHtml(notification.title)}</strong>
      <span>${escapeHtml(notification.text || 'Solicitud pendiente.')}</span>
      <small>${escapeHtml(getSharedInviteHelpText(notification.role))}</small>
    </div>
    <div class="notification-actions"></div>
  `;

  const actions = row.querySelector('.notification-actions');
  const sourceInvite = sharedInvitesCache.find((invite) => invite.accountId === notification.accountId) || notification;

  if (options.compact) {
    const open = document.createElement('button');
    open.className = 'btn btn-primary btn-small';
    open.type = 'button';
    open.textContent = 'Ver';
    open.addEventListener('click', () => {
      markNotificationSeen(notification.id);
      openNotificationCenter();
    });
    actions.appendChild(open);
    return row;
  }

  const accept = document.createElement('button');
  accept.className = 'btn btn-primary btn-small';
  accept.type = 'button';
  accept.textContent = 'Aceptar';
  accept.addEventListener('click', () => {
    markNotificationSeen(notification.id);
    acceptSharedInvite(sourceInvite);
  });
  actions.appendChild(accept);

  const reject = document.createElement('button');
  reject.className = 'btn btn-light btn-small';
  reject.type = 'button';
  reject.textContent = 'Rechazar';
  reject.addEventListener('click', () => {
    markNotificationSeen(notification.id);
    rejectSharedInvite(sourceInvite);
  });
  actions.appendChild(reject);

  if (unread) {
    const mark = document.createElement('button');
    mark.className = 'btn btn-light btn-small';
    mark.type = 'button';
    mark.textContent = 'Visto';
    mark.addEventListener('click', () => markNotificationSeen(notification.id));
    actions.appendChild(mark);
  }

  return row;
}

function renderNotificationList(target, notifications, options = {}) {
  if (!target) return;
  target.innerHTML = '';

  if (!notifications.length) {
    const empty = document.createElement('p');
    empty.className = 'helper-text compact-text';
    empty.textContent = 'No hay solicitudes pendientes.';
    target.appendChild(empty);
    return;
  }

  for (const notification of notifications.slice(0, options.limit || notifications.length)) {
    target.appendChild(createNotificationRow(notification, options));
  }
}

function renderNotificationCenter() {
  const notifications = getInternalNotifications();
  const unread = getUnreadInternalNotifications();
  const unreadCount = unread.length;
  const totalCount = notifications.length;

  setNotificationBadge(dom.notificationHeaderBadge, unreadCount);
  setNotificationBadge(dom.mobileNotificationBadge, unreadCount);

  if (dom.notificationCenterButton) {
    dom.notificationCenterButton.classList.toggle('hidden', currentSession.mode !== 'user');
    dom.notificationCenterButton.classList.toggle('has-notifications', unreadCount > 0);
  }

  if (dom.homeNotificationPanel) {
    dom.homeNotificationPanel.classList.toggle('hidden', totalCount === 0 || currentSession.mode !== 'user');
    if (dom.homeNotificationTitle) {
      dom.homeNotificationTitle.textContent = unreadCount > 0
        ? `${unreadCount} solicitud${unreadCount === 1 ? '' : 'es'} nueva${unreadCount === 1 ? '' : 's'}`
        : `${totalCount} solicitud${totalCount === 1 ? '' : 'es'} pendiente${totalCount === 1 ? '' : 's'}`;
    }
    if (dom.homeNotificationText) {
      dom.homeNotificationText.textContent = unreadCount > 0
        ? 'Revisa quién te invitó y acepta o rechaza.'
        : 'No hay solicitudes nuevas, pero aún quedan invitaciones pendientes.';
    }
    if (dom.homeNotificationBadge) dom.homeNotificationBadge.textContent = String(unreadCount || totalCount);
    renderNotificationList(dom.homeNotificationList, unread.length ? unread : notifications, { compact: true, limit: 2 });
  }

  if (dom.sharedNotificationSummary) {
    dom.sharedNotificationSummary.classList.toggle('hidden', totalCount === 0 || currentSession.mode !== 'user');
    if (dom.sharedNotificationTitle) {
      dom.sharedNotificationTitle.textContent = unreadCount > 0
        ? `${unreadCount} solicitud${unreadCount === 1 ? '' : 'es'} nueva${unreadCount === 1 ? '' : 's'}`
        : `${totalCount} solicitud${totalCount === 1 ? '' : 'es'} pendiente${totalCount === 1 ? '' : 's'}`;
    }
    if (dom.sharedNotificationText) {
      dom.sharedNotificationText.textContent = 'Acepta para que la cuenta aparezca en tu app y perfil financiero.';
    }
    renderNotificationList(dom.sharedNotificationList, notifications);
  }

  notifyUnreadInvitesWithSystemNotification();
  renderConnectionStatus();
}


function getSystemNotificationStorageKey() {
  const userKey = currentSession.userId || currentSession.email || 'guest';
  return `${SYSTEM_NOTIFICATIONS_KEY_PREFIX}:${userKey}`;
}

function getSystemNotificationShownStorageKey() {
  const userKey = currentSession.userId || currentSession.email || 'guest';
  return `${SYSTEM_NOTIFICATION_SHOWN_KEY_PREFIX}:${userKey}`;
}

function getPushSubscriptionStatusKey() {
  const userKey = currentSession.userId || currentSession.email || 'guest';
  return `${PUSH_SUBSCRIPTION_STATUS_KEY_PREFIX}:${userKey}`;
}

function isSystemNotificationsEnabled() {
  return localStorage.getItem(getSystemNotificationStorageKey()) === 'enabled';
}

function setSystemNotificationsEnabled(enabled) {
  localStorage.setItem(getSystemNotificationStorageKey(), enabled ? 'enabled' : 'disabled');
}

function loadSystemNotificationShownIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(getSystemNotificationShownStorageKey()) || '[]');
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
}

function saveSystemNotificationShownIds(ids) {
  try {
    localStorage.setItem(getSystemNotificationShownStorageKey(), JSON.stringify([...ids].slice(-200)));
  } catch {
      }
}

function savePushSubscriptionStatus(status, detail = '') {
  try {
    localStorage.setItem(getPushSubscriptionStatusKey(), JSON.stringify({
      status,
      detail,
      updatedAt: nowIso(),
    }));
  } catch {
    // No bloquea el uso de la app.
  }
}

function loadPushSubscriptionStatus() {
  try {
    return JSON.parse(localStorage.getItem(getPushSubscriptionStatusKey()) || '{}');
  } catch {
    return {};
  }
}

function getNotificationPermissionValue() {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission || 'default';
}

function getNotificationPermissionLabel() {
  const permission = getNotificationPermissionValue();
  if (permission === 'granted') return 'Permitidas';
  if (permission === 'denied') return 'Bloqueadas';
  if (permission === 'default') return 'Sin activar';
  return 'No compatible';
}

function getPushCapability() {
  const hasNotification = typeof Notification !== 'undefined';
  const hasServiceWorker = 'serviceWorker' in navigator;
  const hasPushManager = 'PushManager' in window;
  return {
    hasNotification,
    hasServiceWorker,
    hasPushManager,
    canAskPermission: hasNotification && hasServiceWorker,
    canSubscribe: hasNotification && hasServiceWorker && hasPushManager && Boolean(PUSH_PUBLIC_VAPID_KEY),
  };
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function getCuentaClaraServiceWorkerRegistration() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const existing = await navigator.serviceWorker.getRegistration();
    if (existing) return existing;
    return await navigator.serviceWorker.register('./service-worker.js');
  } catch (error) {
    console.warn('No se pudo registrar service worker para notificaciones:', error);
    return null;
  }
}

async function savePushSubscriptionToCloud(subscription) {
  if (!subscription || !canUseSharedAccounts()) {
    savePushSubscriptionStatus('local', 'Permiso activo en este dispositivo. Inicia sesión para conectar tus solicitudes.');
    return false;
  }

  try {
    const payload = subscription.toJSON ? subscription.toJSON() : subscription;
    const { error } = await supabaseClient
      .from('push_subscriptions')
      .upsert({
        user_id: currentSession.userId,
        endpoint: payload.endpoint,
        subscription: payload,
        device_label: navigator.userAgent ? navigator.userAgent.slice(0, 120) : 'Dispositivo web',
        enabled: true,
        last_seen_at: nowIso(),
        updated_at: nowIso(),
      }, { onConflict: 'user_id,endpoint' });

    if (error) throw error;
    savePushSubscriptionStatus('cloud', 'Avisos del celular activados para este dispositivo.');
    return true;
  } catch (error) {
    console.warn('No se pudo guardar el dispositivo para avisos:', error);
    savePushSubscriptionStatus('pending-backend', 'Permiso activo. Los avisos del celular aún no están disponibles.');
    return false;
  }
}

async function activateSystemNotifications() {
  const capability = getPushCapability();

  if (!capability.canAskPermission) {
    showNotice('No compatible', 'Este navegador no permite notificaciones web para Cuenta Clara. Puedes seguir usando las solicitudes dentro de la app.');
    renderConnectionStatus();
    return;
  }

  let permission = getNotificationPermissionValue();
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }

  if (permission !== 'granted') {
    setSystemNotificationsEnabled(false);
    savePushSubscriptionStatus('blocked', 'El permiso de notificaciones no está activo.');
    showNotice('Permiso no activo', 'El navegador no permitió notificaciones. Puedes activarlas manualmente desde la configuración del sitio.');
    renderConnectionStatus();
    return;
  }

  setSystemNotificationsEnabled(true);
  const registration = await getCuentaClaraServiceWorkerRegistration();

  if (registration && capability.canSubscribe) {
    try {
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUSH_PUBLIC_VAPID_KEY),
        });
      }
      await savePushSubscriptionToCloud(subscription);
    } catch (error) {
      console.warn('No se pudo activar avisos del celular:', error);
      savePushSubscriptionStatus('permission-only', 'Permiso activo. No se pudo completar el registro del dispositivo.');
    }
  } else if (!PUSH_PUBLIC_VAPID_KEY) {
    savePushSubscriptionStatus('permission-only', 'Permiso activo. Los avisos con la app cerrada todavía no están disponibles.');
  } else {
    savePushSubscriptionStatus('permission-only', 'Permiso activo. Este navegador tiene soporte limitado para avisos del celular.');
  }

  showToast('Notificaciones activadas en este dispositivo.');
  renderConnectionStatus();
  notifyUnreadInvitesWithSystemNotification();
}

async function showCuentaClaraNotification(title, options = {}) {
  if (!isSystemNotificationsEnabled() || getNotificationPermissionValue() !== 'granted') return false;
  const registration = await getCuentaClaraServiceWorkerRegistration();
  const notificationOptions = {
    body: options.body || 'Revisa Cuenta Clara.',
    icon: './assets/logo.svg',
    badge: './assets/logo.svg',
    tag: options.tag || 'cuenta-clara',
    renotify: true,
    data: options.data || { url: './app.html#shared' },
  };

  try {
    if (registration?.showNotification) {
      await registration.showNotification(title, notificationOptions);
      return true;
    }
        new Notification(title, notificationOptions);
    return true;
  } catch (error) {
    console.warn('No se pudo mostrar notificación:', error);
    return false;
  }
}

async function testSystemNotification() {
  if (getNotificationPermissionValue() !== 'granted' || !isSystemNotificationsEnabled()) {
    await activateSystemNotifications();
  }

  const shown = await showCuentaClaraNotification('Cuenta Clara', {
    body: 'Las notificaciones están activas en este dispositivo.',
    tag: 'cuenta-clara-test',
    data: { url: './app.html#shared' },
  });

  if (shown) showToast('Aviso de prueba enviado.');
  else showNotice('No se pudo mostrar', 'El navegador no permitió mostrar el aviso de prueba. Revisa permisos del sitio.');
}

function notifyUnreadInvitesWithSystemNotification() {
  if (!isSystemNotificationsEnabled() || getNotificationPermissionValue() !== 'granted') return;
  const unread = getUnreadInternalNotifications();
  if (!unread.length) return;

  const shown = loadSystemNotificationShownIds();
  const next = unread.find((item) => !shown.has(item.id));
  if (!next) return;

  shown.add(next.id);
  saveSystemNotificationShownIds(shown);
  showCuentaClaraNotification('Nueva solicitud de Cuenta Clara', {
    body: `${next.title} · ${next.text || 'Tienes una solicitud pendiente.'}`,
    tag: next.id,
    data: { url: './app.html#shared', accountId: next.accountId, notificationId: next.id },
  });
}

async function sendSharedInvitePush(recipientUserId, payload = {}) {
  if (!recipientUserId || !canUseSharedAccounts() || typeof supabaseClient === 'undefined' || !supabaseClient?.functions?.invoke) return false;

  try {
    const { error } = await supabaseClient.functions.invoke(PUSH_EDGE_FUNCTION_NAME, {
      body: {
        recipientUserId,
        accountId: payload.accountId || '',
        title: payload.title || 'Cuenta compartida',
        fromName: currentSession.name || currentSession.email || 'Un amigo',
        role: payload.role || 'editor',
      },
    });
    if (error) throw error;
    return true;
  } catch (error) {
    console.warn('Aviso del celular no enviado:', error);
    return false;
  }
}

function getConnectionStatusSummary() {
  const capability = getPushCapability();
  const permission = getNotificationPermissionValue();
  const pushStatus = loadPushSubscriptionStatus();
  const pendingRequests = getInternalNotifications().length;
  const unreadRequests = getUnreadInternalNotifications().length;

  let pushLabel = getNotificationPermissionLabel();
  if (permission === 'granted' && isSystemNotificationsEnabled()) {
    if (pushStatus.status === 'cloud') pushLabel = 'Avisos activos';
    else if (pushStatus.status === 'permission-only') pushLabel = 'Permiso activo';
    else if (pushStatus.status === 'pending-backend') pushLabel = 'Pendiente';
    else pushLabel = 'Activadas';
  }

  return {
    capability,
    permission,
    pushStatus,
    pendingRequests,
    unreadRequests,
    sessionLabel: currentSession.mode === 'user' ? 'Sesión iniciada' : 'Modo invitado',
    syncLabel: getHomeSyncLabel(),
    pushLabel,
  };
}

function renderConnectionStatus() {
  if (!dom.connectionStatusPanel) return;
  const summary = getConnectionStatusSummary();
  const isUser = currentSession.mode === 'user';
  const permissionGranted = summary.permission === 'granted';
  const enabled = isSystemNotificationsEnabled();
  const hasBackend = summary.pushStatus?.status === 'cloud';

  if (dom.connectionStatusBadge) {
    let badgeText = 'Revisado';
    let badgeClass = 'is-ok';
    if (!isUser) {
      badgeText = 'Modo invitado';
      badgeClass = 'is-warning';
    } else if (!permissionGranted || !enabled) {
      badgeText = 'Avisos desactivados';
      badgeClass = 'is-muted';
    } else if (!hasBackend) {
      badgeText = 'Permiso activo';
      badgeClass = 'is-warning';
    }
    dom.connectionStatusBadge.textContent = badgeText;
    dom.connectionStatusBadge.classList.remove('is-ok', 'is-muted', 'is-warning');
    dom.connectionStatusBadge.classList.add(badgeClass);
  }

  if (dom.connectionStatusHelp) {
    dom.connectionStatusHelp.textContent = isUser
      ? 'Tu sesión permite recibir solicitudes. Activa avisos para enterarte más rápido.'
      : 'Inicia sesión para recibir solicitudes reales de otros usuarios.';
  }
  if (dom.connectionSessionOutput) dom.connectionSessionOutput.textContent = summary.sessionLabel;
  if (dom.connectionSyncOutput) dom.connectionSyncOutput.textContent = summary.syncLabel;
  if (dom.connectionRequestsOutput) {
    dom.connectionRequestsOutput.textContent = summary.pendingRequests
      ? `${summary.unreadRequests} nueva${summary.unreadRequests === 1 ? '' : 's'} · ${summary.pendingRequests} pendiente${summary.pendingRequests === 1 ? '' : 's'}`
      : 'Sin pendientes';
  }
  if (dom.connectionPushOutput) dom.connectionPushOutput.textContent = summary.pushLabel;

  if (dom.enablePushNotificationsButton) {
    dom.enablePushNotificationsButton.textContent = permissionGranted && enabled ? 'Revisar notificaciones' : 'Activar notificaciones';
    dom.enablePushNotificationsButton.disabled = !summary.capability.canAskPermission;
  }
  if (dom.testPushNotificationButton) {
    dom.testPushNotificationButton.disabled = !summary.capability.canAskPermission;
  }
  if (dom.pushSetupHelp) {
    if (!summary.capability.hasNotification) {
      dom.pushSetupHelp.textContent = 'Este navegador no permite notificaciones web. Las solicitudes seguirán apareciendo dentro de la app.';
    } else if (!PUSH_PUBLIC_VAPID_KEY) {
      dom.pushSetupHelp.textContent = 'Los avisos dentro de la app están activos. Los avisos con la app cerrada todavía no están disponibles.';
    } else if (hasBackend) {
      dom.pushSetupHelp.textContent = 'Este dispositivo quedó listo para recibir avisos de solicitudes.';
    } else {
      const status = summary.pushStatus?.status || '';
      if (status === 'pending-backend') {
        dom.pushSetupHelp.textContent = 'Permiso activo. Los avisos del celular aún no están disponibles.';
      } else if (status === 'permission-only') {
        dom.pushSetupHelp.textContent = 'Permiso activo. Las solicitudes seguirán apareciendo dentro de la app.';
      } else if (status === 'local') {
        dom.pushSetupHelp.textContent = 'Permiso activo en este dispositivo. Inicia sesión para conectar tus solicitudes.';
      } else if (status === 'blocked') {
        dom.pushSetupHelp.textContent = 'El permiso no está activo. Puedes habilitarlo desde la configuración del navegador.';
      } else {
        dom.pushSetupHelp.textContent = 'Activa notificaciones para recibir avisos de solicitudes.';
      }
    }
  }
}

function isMissingSharedSqlError(error) {
  const message = String(error?.message || '').toLowerCase();
  const details = String(error?.details || '').toLowerCase();
  const code = String(error?.code || '').toLowerCase();

  return code === '42p01'
    || message.includes('does not exist')
    || message.includes('could not find the table')
    || details.includes('does not exist')
    || details.includes('could not find the table');
}

async function fetchSharedAccounts() {
  if (!canUseSharedAccounts() || sharedUiBusy) {
    renderSharedPanel();
    return;
  }

  sharedUiBusy = true;

  try {
    const { data: owned, error: ownedError } = await supabaseClient
      .from('shared_accounts')
      .select('id, owner_id, title, account_state, updated_at')
      .eq('owner_id', currentSession.userId)
      .order('updated_at', { ascending: false });

    if (ownedError) throw ownedError;

    const { data: memberships, error: membershipError } = await supabaseClient
      .from('shared_account_members')
      .select('account_id, role, status, created_at')
      .eq('user_id', currentSession.userId)
      .order('created_at', { ascending: false });

    if (membershipError) throw membershipError;

    const memberAccountIds = [...new Set((memberships || [])
      .map((item) => item.account_id)
      .filter(Boolean))];

    let memberAccounts = [];

    if (memberAccountIds.length) {
      const { data, error } = await supabaseClient
        .from('shared_accounts')
        .select('id, owner_id, title, account_state, updated_at')
        .in('id', memberAccountIds);

      if (error) throw error;
      memberAccounts = data || [];
    }

    const ownedAccountIds = (owned || []).map((account) => account.id).filter(Boolean);
    const ownedMemberStats = new Map();

    if (ownedAccountIds.length) {
      const { data: ownedMembers, error: ownedMembersError } = await supabaseClient
        .from('shared_account_members')
        .select('id, account_id, user_id, role, status, created_at, updated_at')
        .in('account_id', ownedAccountIds);

      if (ownedMembersError) throw ownedMembersError;

      const memberUserIds = [...new Set((ownedMembers || []).map((member) => member.user_id).filter(Boolean))];
      const profileById = new Map();

      if (memberUserIds.length) {
        const { data: memberProfiles, error: memberProfilesError } = await supabaseClient
          .from('public_profiles')
          .select('id, email, nick, nombre')
          .in('id', memberUserIds);

        if (!memberProfilesError) {
          for (const profile of memberProfiles || []) {
            profileById.set(profile.id, profile);
          }
        }
      }

      sharedMembersCache = (ownedMembers || []).map((member) => ({
        ...member,
        profile: profileById.get(member.user_id) || {},
      }));

      for (const member of ownedMembers || []) {
        const current = ownedMemberStats.get(member.account_id) || { pending: 0, accepted: 0, rejected: 0 };
        if (member.status === 'accepted') current.accepted += 1;
        if (member.status === 'pending') current.pending += 1;
        if (member.status === 'rejected') current.rejected += 1;
        ownedMemberStats.set(member.account_id, current);
      }
    }

    if (!ownedAccountIds.length) {
      sharedMembersCache = [];
    }

    const accountById = new Map(memberAccounts.map((account) => [account.id, account]));

    const accepted = (memberships || [])
      .filter((item) => item.status === 'accepted' && accountById.has(item.account_id))
      .map((item) => ({ ...accountById.get(item.account_id), role: item.role }));

    sharedInvitesCache = (memberships || [])
      .filter((item) => item.status === 'pending')
      .map((item) => {
        const account = accountById.get(item.account_id) || {};
        return {
          accountId: item.account_id,
          role: item.role,
          status: item.status,
          title: account.title || account.account_state?.name || 'Cuenta compartida',
        };
      });

    const ownedWithStats = (owned || []).map((account) => {
      const stats = ownedMemberStats.get(account.id) || { pending: 0, accepted: 0, rejected: 0 };
      return {
        ...account,
        role: 'owner',
        pendingInvites: stats.pending,
        acceptedMembers: stats.accepted,
        rejectedInvites: stats.rejected,
      };
    });

    const merged = [...ownedWithStats, ...accepted];
    const seen = new Set();
    sharedAccountsCache = merged.filter((account) => {
      if (!account?.id || seen.has(account.id)) return false;
      seen.add(account.id);
      return true;
    });
  } catch (error) {
    console.error(error);
    if (isMissingSharedSqlError(error)) {
      showNotice('Cuentas compartidas no disponibles', 'La colaboración todavía no está configurada para esta cuenta.');
    } else {
      showNotice('No se pudieron cargar compartidas', 'No pude actualizar tus cuentas compartidas. Revisa conexión o sesión de usuario.');
    }
  } finally {
    sharedUiBusy = false;
    renderSharedPanel();
  }
}

function sanitizeSupabaseSearch(value) {
  return String(value || '').trim().replace(/[%,]/g, '');
}


function getSharedInviteRoleValue() {
  return dom.sharedInviteRoleSelect?.value === 'viewer' ? 'viewer' : 'editor';
}

function getRegisteredParticipantLabel(person = {}) {
  return person.name || person.email || 'Usuario registrado';
}

async function ensureActiveBillSharedForInvites(options = {}) {
  if (!canUseSharedAccounts()) {
    if (!options.silent) {
      showNotice('Inicia sesión', 'Para enviar solicitudes reales a amigos registrados debes iniciar sesión. Puedes seguir agregando personas manualmente.');
    }
    return false;
  }

  const bill = getActiveBill();

  if (bill.sharedAccountId) {
    if (bill.sharedOwnerId && bill.sharedOwnerId !== currentSession.userId) {
      if (!options.silent) {
        showNotice('Permiso requerido', 'Solo el dueño puede invitar amigos registrados a esta cuenta.');
      }
      return false;
    }

    bill.sharedRole = 'owner';
    bill.sharedOwnerId = currentSession.userId;
    await saveSharedActiveBillNow();
    return true;
  }

  if (!bill.people.length) {
    if (!options.silent) {
      showNotice('Cuenta sin participantes', 'Agrega participantes antes de enviar solicitudes.');
    }
    return false;
  }

  try {
    const payload = {
      ...bill,
      sharedRole: 'owner',
      sharedOwnerId: currentSession.userId,
    };

    const { data, error } = await supabaseClient.rpc('create_shared_account_safe', {
      p_title: bill.name || 'Cuenta compartida',
      p_account_state: payload,
    });

    if (error) throw error;

    bill.sharedAccountId = data;
    bill.sharedRole = 'owner';
    bill.sharedOwnerId = currentSession.userId;
    bill.updatedAt = nowIso();
    addBillActivity('Cuenta compartida creada para enviar solicitudes a amigos.', 'shared', bill);
    saveState();
    await saveSharedActiveBillNow();
    return true;
  } catch (error) {
    console.error(error);
    if (!options.silent) {
      showNotice('No se pudo activar colaboración', 'No pude preparar esta cuenta para solicitudes. Revisa conexión o sesión de usuario.');
    }
    return false;
  }
}

async function inviteRegisteredPersonToActiveAccount(person, options = {}) {
  const userId = person?.userId || person?.id;
  if (!userId || userId === currentSession.userId) return { status: 'skipped' };

  const canShare = await ensureActiveBillSharedForInvites({ silent: options.silent });
  if (!canShare) return { status: 'failed' };

  if (!canManageActiveSharedAccount()) {
    if (!options.silent) showNotice('Permiso requerido', 'Solo el dueño puede enviar solicitudes para esta cuenta.');
    return { status: 'failed' };
  }

  const bill = getActiveBill();
  const role = options.role === 'viewer' ? 'viewer' : 'editor';

  try {
    const { data: existingMember, error: existingMemberError } = await supabaseClient
      .from('shared_account_members')
      .select('status, role')
      .eq('account_id', bill.sharedAccountId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingMemberError) throw existingMemberError;

    if (existingMember?.status === 'accepted') {
      return { status: 'accepted' };
    }

    if (existingMember?.status === 'pending') {
      return { status: 'pending' };
    }

    const { error } = await supabaseClient
      .from('shared_account_members')
      .upsert({
        account_id: bill.sharedAccountId,
        user_id: userId,
        role,
        status: 'pending',
        invited_by: currentSession.userId,
        updated_at: nowIso(),
      }, { onConflict: 'account_id,user_id' });

    if (error) throw error;

    const name = getRegisteredParticipantLabel(person);
    addBillActivity(`Solicitud enviada a ${name} como ${getSharedRoleLabel(role)}.`, 'shared', bill);
    sendSharedInvitePush(userId, {
      accountId: bill.sharedAccountId,
      title: bill.name || 'Cuenta compartida',
      role,
    }).catch(() => {});
    saveState();
    await saveSharedActiveBillNow();
    return { status: 'sent' };
  } catch (error) {
    console.error(error);
    if (!options.silent) {
      showNotice('No se pudo enviar solicitud', 'No pude enviar la solicitud a este amigo registrado. Revisa conexión o sesión de usuario.');
    }
    return { status: 'failed' };
  }
}

async function inviteRegisteredPeopleToActiveAccount(people = [], options = {}) {
  const registered = (people || []).filter((person) => person?.userId && person.userId !== currentSession.userId);
  if (!registered.length) return { sent: 0, pending: 0, accepted: 0, failed: 0 };

  const results = { sent: 0, pending: 0, accepted: 0, failed: 0 };
  for (const person of registered) {
    const result = await inviteRegisteredPersonToActiveAccount(person, options);
    if (result.status === 'sent') results.sent += 1;
    else if (result.status === 'pending') results.pending += 1;
    else if (result.status === 'accepted') results.accepted += 1;
    else if (result.status === 'failed') results.failed += 1;
  }

  await fetchSharedAccounts();
  return results;
}

async function invitePersonToSharedAccount(person) {
  if (!person?.userId) return;
  const result = await inviteRegisteredPersonToActiveAccount(person, { role: getSharedInviteRoleValue(), silent: false });
  await fetchSharedAccounts();
  if (result.status === 'sent') showToast(`Solicitud enviada a ${person.name}.`);
  if (result.status === 'pending') showToast(`${person.name} ya tiene una solicitud pendiente.`);
  if (result.status === 'accepted') showToast(`${person.name} ya tiene acceso a esta cuenta.`);
}

async function publishActiveBillAsShared(options = {}) {
  if (!canUseSharedAccounts()) {
    showNotice('Inicia sesión', 'Debes iniciar sesión para compartir una cuenta con otras personas registradas.');
    return false;
  }

  const bill = getActiveBill();

  if (bill.sharedAccountId && bill.sharedOwnerId !== currentSession.userId) {
    showNotice('Permiso requerido', 'Solo el dueño puede actualizar la configuración de una cuenta compartida.');
    return false;
  }

  if (!bill.people.length) {
    showNotice('Cuenta sin participantes', 'Agrega al menos una persona antes de compartir esta cuenta.');
    return false;
  }

  if (!options.skipEmptyConfirm && !billHasAmounts(bill)) {
    const continueEmpty = confirm('La cuenta no tiene gastos ni montos. ¿Quieres compartirla de todas formas?');
    if (!continueEmpty) return false;
  }

  try {
    const payload = {
      owner_id: currentSession.userId,
      title: bill.name || 'Cuenta compartida',
      account_state: { ...bill, sharedRole: 'owner', sharedOwnerId: currentSession.userId },
      updated_at: nowIso(),
    };

    const wasShared = Boolean(bill.sharedAccountId);

    if (bill.sharedAccountId) {
      const { error } = await supabaseClient.rpc('update_shared_account_safe', {
        p_account_id: bill.sharedAccountId,
        p_title: payload.title,
        p_account_state: payload.account_state,
      });
      if (error) throw error;
    } else {
      const { data, error } = await supabaseClient.rpc('create_shared_account_safe', {
        p_title: payload.title,
        p_account_state: payload.account_state,
      });
      if (error) throw error;
      bill.sharedAccountId = data;
      bill.sharedRole = 'owner';
      bill.sharedOwnerId = currentSession.userId;
      saveState();
      await saveSharedActiveBillNow();
    }

    addBillActivity(wasShared ? 'Cuenta compartida actualizada.' : 'Cuenta compartida publicada.', 'shared', bill);
    saveState();
    await fetchSharedAccounts();
    showToast(wasShared ? 'Cuenta compartida actualizada.' : 'Cuenta compartida publicada.');
    return true;
  } catch (error) {
    console.error(error);
    showNotice('No se pudo compartir', 'La colaboración todavía no está disponible o la conexión falló. Intenta nuevamente más tarde.');
    return false;
  }
}

async function inviteUserToSharedAccount() {
  if (!canUseSharedAccounts()) {
    showNotice('Inicia sesión', 'Debes iniciar sesión para invitar usuarios registrados.');
    return;
  }

  const bill = getActiveBill();

  if (!bill.sharedAccountId) {
    await publishActiveBillAsShared({ skipEmptyConfirm: true });
  }

  if (!getActiveBill().sharedAccountId) return;

  if (!canManageActiveSharedAccount()) {
    showNotice('Permiso requerido', 'Solo el dueño de la cuenta puede invitar personas o cambiar permisos.');
    return;
  }

  const rawQuery = dom.sharedInviteSearchInput?.value || prompt('Correo o nick del usuario registrado:');
  const query = sanitizeSupabaseSearch(rawQuery);

  if (!query) {
    showToast('Escribe un correo o nick registrado.');
    return;
  }

  try {
    const { data: profiles, error: profileError } = await supabaseClient
      .from('public_profiles')
      .select('id, email, nick, nombre')
      .or(`email.ilike.%${query}%,nick.ilike.%${query}%,nombre.ilike.%${query}%`)
      .limit(5);

    if (profileError) throw profileError;

    const matches = (profiles || []).filter((item) => item.id !== currentSession.userId);
    const lowerQuery = query.toLowerCase();
    const exactMatch = matches.find((item) => (item.email || '').toLowerCase() === lowerQuery || (item.nick || '').toLowerCase() === lowerQuery);
    const profile = exactMatch || (matches.length === 1 ? matches[0] : null);

    if (!profile) {
      const message = matches.length > 1
        ? 'Encontré varios usuarios. Escribe el correo exacto o el nick exacto para evitar invitar a la persona equivocada.'
        : 'La persona debe tener cuenta registrada y perfil público activo.';
      showNotice('Usuario no encontrado', message);
      return;
    }

    const result = await inviteRegisteredPersonToActiveAccount({
      userId: profile.id,
      name: profile.nick || profile.nombre || profile.email,
      email: profile.email || '',
    }, { role: getSharedInviteRoleValue(), silent: false });

    if (dom.sharedInviteSearchInput) dom.sharedInviteSearchInput.value = '';

    if (result.status === 'sent') {
      showToast(`Solicitud enviada a ${profile.nick || profile.nombre || profile.email}.`);
    } else if (result.status === 'pending') {
      showNotice('Invitación pendiente', 'Esta persona ya tiene una solicitud pendiente para esta cuenta.');
    } else if (result.status === 'accepted') {
      showNotice('Ya participa', 'Esta persona ya aceptó la invitación y puede abrir la cuenta compartida.');
    }
  } catch (error) {
    console.error(error);
    showNotice('No se pudo invitar', 'No pude enviar la invitación. Revisa que la persona exista, que no esté repetida y que la nube esté conectada.');
  }
}


async function callSharedRpcOrFallback(rpcName, rpcArgs, fallbackAction) {
  const { error } = await supabaseClient.rpc(rpcName, rpcArgs);
  if (!error) return;

  const message = String(error.message || '').toLowerCase();
  if (message.includes('function') || message.includes('schema cache') || message.includes('not found')) {
    await fallbackAction();
    return;
  }

  throw error;
}

async function acceptSharedInvite(invite) {
  if (!canUseSharedAccounts() || !invite?.accountId) return;
  markNotificationSeen(`shared-invite:${invite.accountId}`);

  try {
    await callSharedRpcOrFallback('accept_shared_invite_safe', { p_account_id: invite.accountId }, async () => {
      const { error } = await supabaseClient
        .from('shared_account_members')
        .update({ status: 'accepted', updated_at: nowIso() })
        .eq('account_id', invite.accountId)
        .eq('user_id', currentSession.userId);
      if (error) throw error;
    });

    await fetchSharedAccounts();
    await openSharedAccount(invite.accountId);
    showToast('Invitación aceptada.');
  } catch (error) {
    console.error(error);
    showNotice('No se pudo aceptar', 'No pude aceptar esta invitación. Actualiza compartidas y revisa que la sesión siga activa.');
  }
}

async function rejectSharedInvite(invite) {
  if (!canUseSharedAccounts() || !invite?.accountId) return;

  const confirmed = confirm(`¿Rechazar la invitación a "${invite.title || 'Cuenta compartida'}"?`);
  if (!confirmed) return;
  markNotificationSeen(`shared-invite:${invite.accountId}`);

  try {
    await callSharedRpcOrFallback('reject_shared_invite_safe', { p_account_id: invite.accountId }, async () => {
      const { error } = await supabaseClient
        .from('shared_account_members')
        .update({ status: 'rejected', updated_at: nowIso() })
        .eq('account_id', invite.accountId)
        .eq('user_id', currentSession.userId);
      if (error) throw error;
    });

    await fetchSharedAccounts();
    showToast('Invitación rechazada.');
  } catch (error) {
    console.error(error);
    showNotice('No se pudo rechazar', 'No pude rechazar esta invitación. Actualiza compartidas y revisa que la sesión siga activa.');
  }
}


async function updateSharedMemberRole(memberId, role) {
  if (!canManageActiveSharedAccount()) {
    showNotice('Permiso requerido', 'Solo el dueño de la cuenta puede cambiar roles.');
    renderSharedPanel();
    return;
  }

  const cleanRole = role === 'viewer' ? 'viewer' : 'editor';
  try {
    await callSharedRpcOrFallback('set_shared_member_role_safe', { p_member_id: memberId, p_role: cleanRole }, async () => {
      const { error } = await supabaseClient
        .from('shared_account_members')
        .update({ role: cleanRole, updated_at: nowIso() })
        .eq('id', memberId);
      if (error) throw error;
    });
    await fetchSharedAccounts();
    showToast(`Rol actualizado a ${getSharedRoleLabel(cleanRole)}.`);
  } catch (error) {
    console.error(error);
    showNotice('No se pudo actualizar el rol', 'Solo el dueño de la cuenta puede cambiar permisos. Revisa la conexión y vuelve a intentar.');
  }
}

async function removeSharedMember(member) {
  if (!canManageActiveSharedAccount()) {
    showNotice('Permiso requerido', 'Solo el dueño de la cuenta puede quitar accesos.');
    renderSharedPanel();
    return;
  }

  const name = getSharedMemberDisplayName(member);
  const confirmed = confirm(`¿Quitar acceso a ${name}?`);
  if (!confirmed) return;

  try {
    await callSharedRpcOrFallback('remove_shared_member_safe', { p_member_id: member.id }, async () => {
      const { error } = await supabaseClient
        .from('shared_account_members')
        .delete()
        .eq('id', member.id);
      if (error) throw error;
    });
    await fetchSharedAccounts();
    showToast('Acceso eliminado.');
  } catch (error) {
    console.error(error);
    showNotice('No se pudo quitar acceso', 'Solo el dueño de la cuenta puede quitar participantes compartidos.');
  }
}

async function openSharedAccount(accountId) {
  if (!canUseSharedAccounts()) return;

  try {
    const { data, error } = await supabaseClient
      .from('shared_accounts')
      .select('id, owner_id, title, account_state, updated_at')
      .eq('id', accountId)
      .single();

    if (error) throw error;

    const incoming = normalizeState({ bills: [data.account_state || makeDefaultBill()], activeBillId: (data.account_state || {}).id }).bills[0];
    const cachedAccount = sharedAccountsCache.find((account) => account.id === data.id);
    incoming.sharedAccountId = data.id;
    incoming.sharedOwnerId = data.owner_id;
    incoming.sharedRole = data.owner_id === currentSession.userId ? 'owner' : (cachedAccount?.role || 'editor');
    incoming.updatedAt = data.account_state?.updatedAt || data.updated_at || nowIso();

    const existingIndex = state.bills.findIndex((bill) => bill.sharedAccountId === data.id || bill.id === incoming.id);
    if (existingIndex >= 0) {
      state.bills[existingIndex] = incoming;
    } else {
      state.bills.unshift(incoming);
    }

    state.activeBillId = incoming.id;
    saveState();
    render();
    showToast('Cuenta compartida abierta.');
  } catch (error) {
    console.error(error);
    showNotice('No se pudo abrir', error.message || 'No tienes acceso a esa cuenta compartida.');
  }
}

function scheduleSharedActiveBillSave() {
  const bill = state?.bills?.find((item) => item.id === state.activeBillId);

  if (!bill?.sharedAccountId || !canUseSharedAccounts() || isCloudLoading) {
    return;
  }

  clearTimeout(sharedSaveTimer);
  sharedSaveTimer = setTimeout(saveSharedActiveBillNow, 450);
}

async function saveSharedActiveBillNow() {
  const bill = getActiveBill();

  if (!bill.sharedAccountId || !canUseSharedAccounts() || isActiveSharedReadOnly()) return;

  try {
    const { error } = await supabaseClient.rpc('update_shared_account_safe', {
      p_account_id: bill.sharedAccountId,
      p_title: bill.name || 'Cuenta compartida',
      p_account_state: bill,
    });

    if (error) throw error;
  } catch (error) {
    console.warn('No se pudo sincronizar cuenta compartida:', error);
  }
}

function renderBillList() {
  const search = dom.historySearchInput.value.trim().toLowerCase();
  const filter = dom.historyFilterSelect.value;
  const typeFilter = dom.historyTypeFilterSelect?.value || 'all';
  const sortMode = dom.historySortSelect?.value || 'recent';
  dom.billList.innerHTML = '';

  const matchesTypeFilter = (bill) => {
    if (typeFilter === 'all') return true;
    if (typeFilter === 'shared') return Boolean(bill.sharedAccountId);
    if (typeFilter === 'recurring') return Boolean(bill.recurringGroupId);
    return bill.mode === typeFilter;
  };

  const filteredBills = state.bills
    .filter((bill) => {
      const status = getBillStatus(bill);
      const matchesSearch = bill.name.toLowerCase().includes(search);

      if (!matchesSearch || !matchesTypeFilter(bill)) return false;
      if (filter === 'everything') return true;
      if (filter === 'all') return !bill.archived && !bill.closed;
      return status === filter;
    })
    .sort((a, b) => {
      if (sortMode === 'amount') {
        return calculateBill(b).grandTotal - calculateBill(a).grandTotal;
      }
      if (sortMode === 'pendingFirst') {
        const aCalc = calculateBill(a);
        const bCalc = calculateBill(b);
        const aPending = a.people.filter((person) => !person.paid && (aCalc.finalTotals[person.id] || 0) > 0).length;
        const bPending = b.people.filter((person) => !person.paid && (bCalc.finalTotals[person.id] || 0) > 0).length;
        return bPending - aPending || new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      }
      if (sortMode === 'name') {
        return String(a.name || '').localeCompare(String(b.name || ''), 'es');
      }
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    });

  if (filteredBills.length === 0) {
    const message = search
      ? 'No encontré cuentas con ese nombre.'
      : filter === 'paid'
        ? 'Todavía no tienes cuentas pagadas.'
        : filter === 'pending'
          ? 'No tienes cuentas pendientes visibles.'
          : filter === 'closed'
            ? 'No tienes cuentas cerradas.'
            : filter === 'archived'
              ? 'No tienes cuentas archivadas.'
              : 'Todavía no tienes cuentas guardadas.';
    dom.billList.appendChild(emptyMessage(message));
    return;
  }

  for (const bill of filteredBills) {
    const calculation = calculateBill(bill);
    const status = getBillStatus(bill);
    const statusLabel = status === 'paid'
      ? 'Pagada'
      : status === 'closed'
        ? 'Cerrada'
        : status === 'archived'
          ? 'Archivada'
          : 'Pendiente';
    const row = document.createElement('article');
    row.className = `history-bill-card ${bill.id === state.activeBillId ? 'active' : ''} ${bill.archived ? 'archived' : ''} ${bill.closed ? 'closed' : ''}`;
    const pendingPeople = bill.people.filter((person) => !person.paid && (calculation.finalTotals[person.id] || 0) > 0).length;
    const productCount = bill.mode === 'quick' ? (Number(bill.quickTotal || 0) > 0 ? 1 : 0) : bill.products.length;
    const ownershipLabel = bill.sharedAccountId ? 'Compartida' : bill.recurringGroupId ? 'Recurrente' : 'Personal';
    row.innerHTML = `
      <button class="bill-item history-bill-open" type="button" aria-label="Abrir ${escapeHtml(bill.name)}">
        <div class="history-bill-main">
          <span class="history-status-line"><em class="history-status-badge is-${status}">${statusLabel}</em><em>${escapeHtml(getBillModeLabel(bill.mode))}</em><em>${ownershipLabel}</em></span>
          <strong>${escapeHtml(bill.name)}</strong>
          <span>${formatCurrency(calculation.grandTotal)} · ${bill.people.length} persona${bill.people.length === 1 ? '' : 's'} · ${productCount} gasto${productCount === 1 ? '' : 's'}</span>
          <span>${pendingPeople > 0 ? `${pendingPeople} pendiente${pendingPeople === 1 ? '' : 's'} por pagar · ` : ''}${bill.closed ? `Cerrada ${formatDate(bill.closedAt || bill.updatedAt)} · ` : ''}${formatDate(bill.updatedAt)}</span>
        </div>
        <span class="bill-count">${pendingPeople > 0 ? pendingPeople : status === 'closed' ? 'C' : '✓'}</span>
      </button>
      <div class="history-bill-actions" aria-label="Acciones de ${escapeHtml(bill.name)}">
        <button class="btn btn-primary btn-small" data-action="edit" type="button">Editar gastos</button>
        <button class="btn btn-light btn-small" data-action="payments" type="button">Pagos</button>
        <button class="btn btn-light btn-small" data-action="close" type="button">${bill.closed ? 'Reabrir' : 'Cerrar'}</button>
        <button class="btn btn-danger-light btn-small" data-action="delete" type="button">Eliminar</button>
      </div>
    `;

    row.querySelector('.history-bill-open').addEventListener('click', () => {
      state.activeBillId = bill.id;
      editingProductId = null;
      saveState();
      render();
      showToast('Cuenta seleccionada.');
    });

    row.querySelector('[data-action="edit"]').addEventListener('click', () => {
      editBillFromHistory(bill.id);
    });

    row.querySelector('[data-action="payments"]').addEventListener('click', () => {
      openBillFromProfileStats(bill.id, 'payments');
    });

    row.querySelector('[data-action="close"]').addEventListener('click', () => {
      toggleBillClosedFromHistory(bill.id);
    });

    row.querySelector('[data-action="delete"]').addEventListener('click', () => {
      deleteBillFromHistory(bill.id);
    });

    dom.billList.appendChild(row);
  }
}

function getBillModeLabel(mode) {
  return window.CuentaClaraUtils.getBillModeLabel(mode);
}

function getBillModeLongLabel(mode) {
  return window.CuentaClaraUtils.getBillModeLongLabel(mode);
}

function getBillModeChangeHelp(mode) {
  if (mode === 'quick') {
    return 'Estás usando monto rápido: ingresa un total general y se divide entre todas las personas.';
  }
  if (mode === 'home') {
    return 'Estás usando hogar: agrega gastos mensuales, fechas y recurrentes sin propina.';
  }
  return 'Estás usando detallada: agrega productos, cantidades y define quién consumió cada cosa.';
}

function renderBillModeSwitcher() {
  const bill = getActiveBill();
  if (!dom.billModeSwitcherCard) return;

  const currentLabel = getBillModeLongLabel(bill.mode);
  if (dom.billModeCurrentOutput) {
    dom.billModeCurrentOutput.textContent = currentLabel;
  }
  if (dom.billModeChangeHelp) {
    dom.billModeChangeHelp.textContent = `${getBillModeChangeHelp(bill.mode)} Puedes cambiarlo si te arrepentiste.`;
  }

  dom.billModeChoiceButtons?.forEach((button) => {
    const mode = button.dataset.billModeChoice;
    const isActive = mode === bill.mode;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    button.disabled = isActiveSharedReadOnly();
  });

  if (dom.templateChangeSelect) {
    dom.templateChangeSelect.value = bill.templateKey && BILL_TEMPLATES[bill.templateKey] ? bill.templateKey : 'custom';
    dom.templateChangeSelect.disabled = isActiveSharedReadOnly();
  }
  if (dom.applyTemplateChangeButton) {
    dom.applyTemplateChangeButton.disabled = isActiveSharedReadOnly();
  }

  renderActiveTemplateHelper();
}


function changeActiveBillTemplate(templateKey) {
  const bill = getActiveBill();
  const template = BILL_TEMPLATES[templateKey] || BILL_TEMPLATES.custom;

  if (isActiveSharedReadOnly()) {
    showToast('Esta cuenta está en modo solo lectura.');
    return;
  }

  if (bill.templateKey === templateKey) {
    showToast(`Esta cuenta ya usa la plantilla ${template.label}.`);
    return;
  }

  const snapshot = captureUndoSnapshot('Cambiar plantilla');
  const previousName = bill.name;
  const previousQuickTotal = Number(bill.quickTotal || 0);
  const previousHomeMonth = bill.homeMonth || '';
  const confirmed = confirm(
    `Cambiarás la plantilla a ${template.label}.

` +
    `Se conservarán personas, gastos y pagos. Solo se ajustará el tipo de cuenta, propina y configuración principal.

` +
    `¿Continuar?`
  );

  if (!confirmed) {
    return;
  }

  applyTemplateToBill(bill, templateKey, previousName || template.name());
  bill.name = previousName || bill.name;
  if (template.mode === 'quick' && previousQuickTotal > 0) {
    bill.quickTotal = previousQuickTotal;
  }
  if (template.mode === 'home' && previousHomeMonth) {
    bill.homeMonth = previousHomeMonth;
  }
  persistAndRender();
  setAppSection('expenses', { scroll: false });
  showUndoToast(`Plantilla cambiada a ${template.label}.`, snapshot);
}

function getDetailedProductsTotal(bill) {
  return (bill.products || []).reduce((sum, product) => {
    const unit = Number(product.unitPrice || 0);
    const quantity = Number(product.quantity || 0);
    return sum + (Number.isFinite(unit) && Number.isFinite(quantity) ? unit * quantity : 0);
  }, 0);
}

function createProductFromQuickTotal(bill, targetMode) {
  const quickTotal = Math.round(Number(bill.quickTotal || 0));
  if (quickTotal <= 0) return false;

  bill.products = Array.isArray(bill.products) ? bill.products : [];
  bill.products.push({
    id: createId('product'),
    name: 'Monto rápido anterior',
    unitPrice: quickTotal,
    quantity: 1,
    category: targetMode === 'home' ? 'Otros' : 'Comida',
    splitMode: targetMode === 'home' ? 'responsibles' : 'participants',
    dueDate: '',
    recurring: false,
    consumers: (bill.people || []).map((person) => ({ personId: person.id, share: 1 })),
  });
  bill.quickTotal = 0;
  return true;
}

function changeActiveBillMode(nextMode, options = {}) {
  const bill = getActiveBill();
  const safeMode = ['detailed', 'quick', 'home'].includes(nextMode) ? nextMode : 'detailed';

  if (isActiveSharedReadOnly()) {
    showToast('Esta cuenta está en modo solo lectura.');
    return false;
  }

  if (bill.mode === safeMode) {
    if (options.focusQuickTotal && safeMode === 'quick') {
      setAppSection('expenses', { scroll: false });
      requestAnimationFrame(() => {
        dom.quickTotalInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        dom.quickTotalInput?.focus();
      });
    } else {
      showToast(`Esta cuenta ya está en modo ${getBillModeLongLabel(safeMode).toLowerCase()}.`);
    }
    return true;
  }

  const snapshot = captureUndoSnapshot('Cambiar tipo de cuenta');
  const previousMode = bill.mode;
  const hasProducts = Array.isArray(bill.products) && bill.products.length > 0;
  const quickTotal = Math.round(Number(bill.quickTotal || 0));

  if (safeMode === 'quick' && hasProducts) {
    const productsTotal = Math.round(getDetailedProductsTotal(bill));
    const confirmed = confirm(
      `Cambiarás a Cuenta rápida.

` +
      `Los productos detallados quedarán guardados por si vuelves a Detallada u Hogar, pero el cálculo usará solo el monto rápido.

` +
      `${!quickTotal && productsTotal > 0 ? `Puedo sugerir como monto rápido el total actual: ${formatCurrency(productsTotal)}. ` : ''}` +
      `¿Continuar?`
    );

    if (!confirmed) return false;

    if (!quickTotal && productsTotal > 0) {
      bill.quickTotal = productsTotal;
    }
  }

  if (previousMode === 'quick' && safeMode !== 'quick' && quickTotal > 0 && !hasProducts) {
    const convert = confirm(
      `Tienes un monto rápido de ${formatCurrency(quickTotal)}.

` +
      `¿Quieres convertirlo en un gasto para no perderlo al pasar a modo detallado/hogar?

` +
      `Aceptar: crea un gasto con ese monto.
Cancelar: cambia el tipo y deja el monto rápido guardado por si vuelves.`
    );

    if (convert) {
      createProductFromQuickTotal(bill, safeMode);
    }
  }

  bill.mode = safeMode;
  bill.templateKey = '';
  bill.templateLabel = '';

  if (safeMode === 'home') {
    bill.homeMonth = bill.homeMonth || getCurrentMonthValue();
    bill.tipPercent = 0;
  } else if (!Number.isFinite(Number(bill.tipPercent))) {
    bill.tipPercent = 10;
  }
  persistAndRender();
  setAppSection('expenses', { scroll: false });

  if (options.focusQuickTotal && safeMode === 'quick') {
    requestAnimationFrame(() => {
      dom.quickTotalInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      dom.quickTotalInput?.focus();
    });
  }

  showUndoToast(`Cuenta cambiada a ${getBillModeLongLabel(safeMode).toLowerCase()}.`, snapshot);
  return true;
}

function renderBillHeader() {
  const bill = getActiveBill();
  const isQuick = bill.mode === 'quick';
  const isHome = bill.mode === 'home';


  if (dom.currentListName) {
    dom.currentListName.textContent = bill.name || 'Nueva cuenta';
  }
  if (dom.currentListMeta) {
    const modeLabel = getBillModeLabel(bill.mode);
    const peopleCount = bill.people.length;
    const productCount = bill.mode === 'quick' ? (Number(bill.quickTotal || 0) > 0 ? 1 : 0) : bill.products.length;
    const sharedText = bill.sharedAccountId ? ' · Compartida' : '';
    const recurringText = bill.recurringGroupId ? ' · Recurrente' : '';
    const templateText = bill.templateLabel ? ` · ${bill.templateLabel}` : '';
    dom.currentListMeta.textContent = `${modeLabel}${templateText} · ${peopleCount} persona${peopleCount === 1 ? '' : 's'} · ${productCount} gasto${productCount === 1 ? '' : 's'}${sharedText}${recurringText}`;
  }

  dom.billNameInput.value = bill.name;
  const recurringLabel = bill.recurringGroupId ? ` · Recurrente` : '';
  const sharedLabel = bill.sharedAccountId ? ` · Compartida` : '';
  const templateLabel = bill.templateLabel ? ` · Plantilla: ${bill.templateLabel}` : '';
  dom.billMeta.textContent = `Creada: ${formatDate(bill.createdAt)} · Última edición: ${formatDate(bill.updatedAt)}${templateLabel}${recurringLabel}${sharedLabel}`;
  dom.deleteBillButton.disabled = state.bills.length <= 1;
  dom.archiveBillButton.textContent = bill.archived ? 'Desarchivar' : 'Archivar';
  if (dom.closeBillButton) {
    dom.closeBillButton.textContent = bill.closed ? 'Reabrir cuenta' : 'Cerrar cuenta';
    dom.closeBillButton.disabled = Boolean(bill.archived || isActiveSharedReadOnly());
  }

  document.querySelectorAll('input[name="billMode"]').forEach((input) => {
    input.checked = input.value === bill.mode;
  });

  dom.quickTotalPanel.classList.toggle('hidden', !isQuick);
  dom.tipCard.classList.toggle('hidden', isHome);
  dom.homePanel.classList.toggle('hidden', !isHome);
  dom.productEditorCard.classList.toggle('hidden', isQuick);
  dom.productListCard.classList.toggle('hidden', isQuick);
  dom.homeDashboardCard.classList.toggle('hidden', !isHome);
  dom.quickTotalInput.value = bill.quickTotal || '';
  dom.homeMonthInput.value = bill.homeMonth || getCurrentMonthValue();
  dom.tipPercentInput.value = bill.tipPercent;

  dom.productNameLabel.textContent = isHome ? 'Gasto' : 'Producto';
  dom.productNameInput.placeholder = isHome ? 'Ej: Luz, Arriendo, Supermercado' : 'Ej: Papas fritas';
  dom.productListTitle.textContent = isHome ? 'Gastos agregados' : 'Productos agregados';
  updateDivisionCopy();
  document.querySelectorAll('.home-only').forEach((element) => element.classList.toggle('hidden', !isHome));
}


function renderPayerSelect() {
  const bill = getActiveBill();
  const current = bill.payerId;
  dom.payerSelect.innerHTML = '<option value="">Sin pagador principal</option>';

  for (const person of bill.people) {
    const option = document.createElement('option');
    option.value = person.id;
    option.textContent = person.name;
    dom.payerSelect.appendChild(option);
  }

  dom.payerSelect.value = bill.people.some((person) => person.id === current) ? current : '';
}



function canUseRegisteredFriends() {
  return typeof supabaseClient !== 'undefined' && currentSession.mode === 'user' && Boolean(currentSession.userId);
}

async function fetchRegisteredFriendsForPicker() {
  if (!canUseRegisteredFriends()) {
    return [];
  }

  try {
    const { data: requests, error } = await supabaseClient
      .from('friend_requests')
      .select('id, requester_id, recipient_id, status')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${currentSession.userId},recipient_id.eq.${currentSession.userId}`);

    if (error) {
      console.error(error);
      return [];
    }

    const otherIds = [...new Set((requests || []).map((request) =>
      request.requester_id === currentSession.userId ? request.recipient_id : request.requester_id
    ))];

    if (!otherIds.length) {
      return [];
    }

    const { data: profiles, error: profileError } = await supabaseClient
      .from('public_profiles')
      .select('id, nick, nombre, email, telefono, avatar_data_url')
      .in('id', otherIds);

    if (profileError) {
      console.error(profileError);
      return [];
    }

    return (profiles || []).map((profile) => ({
      id: `registered_${profile.id}`,
      userId: profile.id,
      source: 'registered',
      name: profile.nick || profile.nombre || profile.email || 'Usuario',
      phone: normalizePhoneNumber(profile.telefono || ''),
      email: profile.email || '',
      avatarDataUrl: profile.avatar_data_url || '',
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function openFriendsPicker() {
  const manualFriends = getFriends().map((friend) => ({ ...friend, source: 'manual' }));
  const registeredFriends = await fetchRegisteredFriendsForPicker();
  friendsPickerItems = [...registeredFriends, ...manualFriends];

  if (friendsPickerItems.length === 0) {
    showNotice('Sin amigos guardados', 'Agrega amigos desde tu perfil. También puedes buscar usuarios registrados y enviar solicitudes de amistad.');
    return;
  }

  renderFriendsPicker();
  dom.friendsPickerModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeFriendsPicker() {
  dom.friendsPickerModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

function renderFriendsPicker() {
  const bill = getActiveBill();
  const existingNames = new Set(bill.people.map((person) => person.name.toLowerCase()));
  const query = normalizeText(dom.friendsPickerSearchInput?.value || '');
  const visibleFriends = friendsPickerItems.filter((friend) => {
    if (!query) return true;
    return [friend.name, friend.email, friend.phone]
      .filter(Boolean)
      .some((value) => normalizeText(value).includes(query));
  });

  dom.friendsPickerList.innerHTML = '';

  if (visibleFriends.length === 0) {
    renderFriendsPickerCount(0);
    dom.friendsPickerList.appendChild(emptyMessage('No encontré amigos con esa búsqueda.'));
    return;
  }

  for (const friend of visibleFriends) {
    const alreadyInBill = existingNames.has(friend.name.toLowerCase());
    const row = document.createElement('label');
    row.className = `friend-picker-row ${alreadyInBill ? 'is-disabled' : ''}`;
    row.innerHTML = `
      <input type="checkbox" value="${friend.id}" ${alreadyInBill ? 'disabled' : ''} />
      <div class="friend-mini-avatar">${friend.avatarDataUrl ? `<img src="${friend.avatarDataUrl}" alt="" />` : getInitials(friend.name)}</div>
      <div>
        <strong>${escapeHtml(friend.name)}</strong>
        <small>${friend.source === 'registered' ? 'Usuario registrado · recibirá solicitud' : 'Amigo manual'} · ${friend.phone ? escapeHtml(formatPhoneForDisplay(friend.phone)) : 'Sin teléfono'}${alreadyInBill ? ' · Ya está en esta cuenta' : ''}</small>
      </div>
    `;

    row.querySelector('input')?.addEventListener('change', () => renderFriendsPickerCount());
    dom.friendsPickerList.appendChild(row);
  }

  renderFriendsPickerCount(visibleFriends.length);
}

function getVisibleFriendsPickerCount() {
  const query = normalizeText(dom.friendsPickerSearchInput?.value || '');
  return friendsPickerItems.filter((friend) => {
    if (!query) return true;
    return [friend.name, friend.email, friend.phone].filter(Boolean).some((value) => normalizeText(value).includes(query));
  }).length;
}

function renderFriendsPickerCount(visibleCount = getVisibleFriendsPickerCount()) {
  if (!dom.friendsPickerCountOutput) return;
  const selectedCount = dom.friendsPickerList?.querySelectorAll('input[type="checkbox"]:checked').length || 0;
  dom.friendsPickerCountOutput.textContent = `${visibleCount} de ${friendsPickerItems.length} amigos visibles${selectedCount ? ` · ${selectedCount} seleccionados` : ''}`;
}

function clearFriendsPickerSearch() {
  if (dom.friendsPickerSearchInput) dom.friendsPickerSearchInput.value = '';
  renderFriendsPicker();
}

async function addSelectedFriendsToBill() {
  const selected = [...dom.friendsPickerList.querySelectorAll('input[type="checkbox"]:checked')]
    .map((input) => input.value);
  const friends = friendsPickerItems.filter((friend) => selected.includes(friend.id));

  if (friends.length === 0) {
    showToast('Selecciona al menos un amigo.');
    return;
  }

  const bill = getActiveBill();
  let added = 0;
  const addedRegisteredPeople = [];

  for (const friend of friends) {
    const exists = bill.people.some((person) => person.name.toLowerCase() === friend.name.toLowerCase());

    if (exists) {
      continue;
    }

    const person = {
      id: createId('person'),
      name: friend.name,
      phone: normalizePhoneNumber(friend.phone || ''),
      email: normalizeEmail(friend.email || ''),
      userId: friend.userId || '',
      previousDebt: 0,
      paid: false,
    };

    bill.people.push(person);
    if (person.userId) addedRegisteredPeople.push(person);
    added += 1;
  }

  if (added === 0) {
    showToast('No se agregaron personas nuevas.');
    return;
  }

  persistAndRender();
  closeFriendsPicker();

  if (addedRegisteredPeople.length > 0) {
    const results = await inviteRegisteredPeopleToActiveAccount(addedRegisteredPeople, {
      role: getSharedInviteRoleValue(),
      silent: true,
    });

    if (results.sent > 0) {
      showToast(`${added} agregado${added === 1 ? '' : 's'} · ${results.sent} solicitud${results.sent === 1 ? '' : 'es'} enviada${results.sent === 1 ? '' : 's'}.`);
      return;
    }

    if (results.pending > 0 || results.accepted > 0) {
      showToast(`${added} agregado${added === 1 ? '' : 's'} · solicitudes ya existentes.`);
      return;
    }

    if (results.failed > 0) {
      showNotice('Amigos agregados', 'Se agregaron a la cuenta, pero no pude enviar algunas solicitudes. Revisa Compartidas cuando tengas conexión.');
      return;
    }
  }

  showToast(`${added} amigo${added === 1 ? '' : 's'} agregado${added === 1 ? '' : 's'} a la cuenta.`);
}

function getSelfParticipantInfo() {
  if (currentSession.mode !== 'user' || !currentSession.userId) {
    return null;
  }

  const profile = getProfile();
  const displayName = profile.nick || profile.name || currentSession.name || currentSession.email || 'Yo';

  return {
    userId: currentSession.userId,
    email: normalizeEmail(currentSession.email || ''),
    name: String(displayName || 'Yo').trim() || 'Yo',
    phone: normalizePhoneNumber(profile.phone || ''),
  };
}

function personMatchesSelf(person, selfInfo = getSelfParticipantInfo()) {
  if (!person || !selfInfo) return false;
  const personUserId = String(person.userId || '').trim();
  const personEmail = normalizeEmail(person.email || '');

  return Boolean(
    (selfInfo.userId && personUserId && personUserId === selfInfo.userId) ||
    (selfInfo.email && personEmail && personEmail === selfInfo.email)
  );
}

function findSelfPerson(bill = getActiveBill(), selfInfo = getSelfParticipantInfo()) {
  if (!bill || !Array.isArray(bill.people) || !selfInfo) return null;
  return bill.people.find((person) => personMatchesSelf(person, selfInfo)) || null;
}

function getPotentialSelfNameMatches(bill = getActiveBill(), selfInfo = getSelfParticipantInfo()) {
  if (!bill || !Array.isArray(bill.people) || !selfInfo) return [];
  const profile = getProfile();
  const names = new Set([
    selfInfo.name,
    profile.nick,
    profile.name,
    currentSession.name,
    currentSession.email,
  ].map((value) => String(value || '').trim().toLowerCase()).filter(Boolean));

  return bill.people.filter((person) => names.has(String(person.name || '').trim().toLowerCase()));
}

function updatePersonWithSelfProfile(person, selfInfo = getSelfParticipantInfo()) {
  if (!person || !selfInfo) return;
  person.userId = selfInfo.userId;
  person.email = selfInfo.email;
  person.phone = selfInfo.phone || normalizePhoneNumber(person.phone || '');
  person.name = selfInfo.name || person.name || 'Yo';
}

function addCurrentUserAsPerson() {
  const selfInfo = getSelfParticipantInfo();

  if (!selfInfo) {
    showNotice('Inicia sesión para usar “Yo”', 'Esta opción vincula la persona con tu perfil registrado. Puedes seguir agregando personas manualmente en modo invitado.');
    return;
  }

  const bill = getActiveBill();
  const existing = findSelfPerson(bill, selfInfo);

  if (existing) {
    updatePersonWithSelfProfile(existing, selfInfo);
    persistAndRender();
    showToast('Tu perfil ya está en esta cuenta.');
    return;
  }

  const nameMatches = getPotentialSelfNameMatches(bill, selfInfo);

  if (nameMatches.length === 1) {
    const confirmed = confirm(`Ya existe “${nameMatches[0].name}” en esta cuenta. ¿Quieres vincular esa persona con tu perfil?`);
    if (!confirmed) return;

    updatePersonWithSelfProfile(nameMatches[0], selfInfo);
    persistAndRender();
    showToast('Persona vinculada a tu perfil.');
    return;
  }

  if (nameMatches.length > 1) {
    showNotice('Nombre repetido', 'Hay más de una persona que podría ser tu perfil. Edita o elimina duplicados antes de usar “Yo”.');
    return;
  }

  bill.people.push({
    id: createId('person'),
    name: selfInfo.name,
    phone: selfInfo.phone,
    email: selfInfo.email,
    userId: selfInfo.userId,
    previousDebt: 0,
    paid: false,
  });

  persistAndRender();
  showToast('Te agregué a la cuenta.');
}

function renderSelfParticipantCard() {
  if (!dom.selfParticipantCard || !dom.addMePersonButton) return;

  const selfInfo = getSelfParticipantInfo();
  const bill = getActiveBill();
  const existing = findSelfPerson(bill, selfInfo);
  const infoText = dom.selfParticipantCard.querySelector('span');
  const title = dom.selfParticipantCard.querySelector('strong');

  dom.selfParticipantCard.classList.toggle('is-disabled', !selfInfo);
  dom.selfParticipantCard.classList.toggle('is-linked', Boolean(existing));
  dom.addMePersonButton.disabled = Boolean(existing);
  if (dom.addMePersonQuickButton) {
    dom.addMePersonQuickButton.disabled = Boolean(existing);
    dom.addMePersonQuickButton.textContent = existing ? 'Yo agregado' : '+ Yo';
  }

  if (!selfInfo) {
    if (title) title.textContent = 'Agregar mi perfil';
    if (infoText) infoText.textContent = 'Inicia sesión para agregarte como “Yo” y vincular movimientos a tus estadísticas.';
    dom.addMePersonButton.textContent = '+ Yo';
    return;
  }

  if (existing) {
    if (title) title.textContent = `${selfInfo.name} está en esta cuenta`;
    if (infoText) infoText.textContent = 'Esta persona está vinculada a tu perfil y sus movimientos impactan tus estadísticas.';
    dom.addMePersonButton.textContent = 'Ya agregado';
    return;
  }

  if (title) title.textContent = 'Agregarme a esta cuenta';
  if (infoText) infoText.textContent = `Agrega “${selfInfo.name}” como participante vinculado a tu perfil.`;
  dom.addMePersonButton.textContent = '+ Yo';
}

function setPersonPaidStatus(personId, paid) {
  const bill = getActiveBill();
  const person = bill.people.find((item) => item.id === personId);

  if (!person) {
    return;
  }

  const nextPaid = Boolean(paid);
  if (person.paid === nextPaid) return;
  const undoSnapshot = captureUndoSnapshot(nextPaid ? 'Marcar pagado' : 'Marcar pendiente');
  person.paid = nextPaid;
  addBillActivity(`${person.name} quedó como ${nextPaid ? 'pagado' : 'pendiente'}.`, 'payment', bill);
  persistAndRender();
  showUndoToast(nextPaid ? `${person.name}: pago registrado.` : `${person.name}: vuelve a pendiente.`, undoSnapshot);
}


function renderPeople() {
  const bill = getActiveBill();
  renderSelfParticipantCard();
  renderFrequentPeopleSuggestions();
  dom.peopleList.innerHTML = '';

  if (bill.people.length === 0) {
    dom.peopleList.appendChild(cloneEmptyState());
    return;
  }

  for (const person of bill.people) {
    const hasPhone = Boolean(normalizePhoneNumber(person.phone));
    const participantType = getSharedParticipantType(person);
    const row = document.createElement('div');
    row.className = `person-row person-${participantType.className}`;
    row.innerHTML = `
      <div class="person-info">
        <strong title="${escapeHtml(person.name)}">${escapeHtml(person.name)} <span class="person-source-badge ${participantType.className}">${escapeHtml(participantType.label)}</span></strong>
        <small>${hasPhone ? escapeHtml(formatPhoneForDisplay(person.phone)) : 'Sin teléfono'} · ${escapeHtml(participantType.detail)}${Number(person.previousDebt || 0) > 0 ? ` · Arrastre ${formatCurrency(person.previousDebt)}` : ''}</small>
      </div>
      <button class="icon-button whatsapp ${hasPhone ? '' : 'muted'}" type="button" aria-label="Enviar WhatsApp a ${escapeHtml(person.name)}">WA</button>
      <button class="icon-button edit" type="button" aria-label="Editar ${escapeHtml(person.name)}">✎</button>
      <button class="icon-button danger" type="button" aria-label="Eliminar ${escapeHtml(person.name)}">×</button>
      <button class="paid-toggle ${person.paid ? 'is-paid' : 'is-pending'}" type="button" aria-label="${person.paid ? `Marcar a ${escapeHtml(person.name)} como pendiente` : `Marcar pago de ${escapeHtml(person.name)}`}">
        <span class="paid-toggle-status">${person.paid ? 'Pagado ✓' : 'Pendiente'}</span>
        <small>${person.paid ? 'Tocar para desmarcar' : 'Marcar como pagado'}</small>
      </button>
    `;

    row.querySelector('.paid-toggle').addEventListener('click', () => {
      setPersonPaidStatus(person.id, !person.paid);
    });

    row.querySelector('.icon-button.whatsapp').addEventListener('click', () => {
      const calculation = calculateBill(bill);
      openPersonWhatsapp(person.id, calculation.finalTotals[person.id] || 0);
    });

    row.querySelector('.icon-button.danger').addEventListener('click', () => {
      deletePerson(person.id);
    });

    row.querySelector('.icon-button.edit').addEventListener('click', () => {
      editPerson(person.id);
    });

    row.querySelector('strong').addEventListener('dblclick', () => {
      editPerson(person.id);
    });

    dom.peopleList.appendChild(row);
  }
}

function updateDivisionCopy() {
  const bill = getActiveBill();
  const splitMode = dom.productSplitModeInput?.value === 'responsibles' ? 'responsibles' : 'participants';

  if (splitMode === 'responsibles') {
    dom.consumerPanelTitle.textContent = 'Responsables de pago';
    dom.consumerPanelHelp.textContent = 'Marca quién paga este gasto y cuántas partes asume cada responsable. Ej: Wladimir 2, Carlos 2, Pamela 1.';

    if (dom.splitModeHelp) {
      dom.splitModeHelp.textContent = 'Útil para plataformas o gastos donde una persona paga por otra. Ejemplo: Carlos paga 2 partes, Wladimir 2 y Pamela 1.';
    }

    return;
  }

  dom.consumerPanelTitle.textContent = bill.mode === 'home' ? '¿Entre quiénes se divide?' : '¿Quiénes consumieron?';
  dom.consumerPanelHelp.textContent = bill.mode === 'home'
    ? 'Marca las personas que participan en este gasto y ajusta las partes si corresponde.'
    : 'Marca las personas y ajusta las partes si alguien consumió más.';

  if (dom.splitModeHelp) {
    dom.splitModeHelp.textContent = bill.mode === 'home'
      ? 'Divide este gasto entre las personas seleccionadas.'
      : 'Usa esta opción cuando cada persona consume una parte del producto o gasto.';
  }
}

function updateConsumerSelectionSummary() {
  if (!dom.consumerSelectionSummary || !dom.consumerList) return;

  const rows = [...dom.consumerList.querySelectorAll('.consumer-row')];
  const selectedRows = rows.filter((row) => row.querySelector('input[type="checkbox"]')?.checked);
  const totalShares = selectedRows.reduce((sum, row) => {
    const value = Number(row.querySelector('input[type="number"]')?.value || 1);
    return sum + Math.max(1, value);
  }, 0);

  if (rows.length === 0) {
    dom.consumerSelectionSummary.textContent = 'Agrega personas para poder dividir este gasto.';
    dom.consumerSelectionSummary.classList.remove('is-ready');
    return;
  }

  if (selectedRows.length === 0) {
    dom.consumerSelectionSummary.textContent = 'Ninguna persona seleccionada. Elige al menos una para guardar el gasto.';
    dom.consumerSelectionSummary.classList.remove('is-ready');
    return;
  }

  dom.consumerSelectionSummary.textContent = `${selectedRows.length} persona${selectedRows.length === 1 ? '' : 's'} seleccionada${selectedRows.length === 1 ? '' : 's'} · ${totalShares} parte${totalShares === 1 ? '' : 's'} en total`;
  dom.consumerSelectionSummary.classList.add('is-ready');
}

function setAllConsumersChecked(checked) {
  [...dom.consumerList.querySelectorAll('.consumer-row')].forEach((row) => {
    const checkbox = row.querySelector('input[type="checkbox"]');
    const shareInput = row.querySelector('input[type="number"]');
    if (!checkbox || !shareInput) return;
    checkbox.checked = checked;
    shareInput.disabled = !checked;
    shareInput.value = Math.max(1, Number(shareInput.value || 1));
    row.classList.toggle('is-selected', checked);
    row.classList.remove('is-editing-shares');
    const helpText = row.querySelector('.consumer-name-wrap small');
    if (helpText) helpText.textContent = checked ? 'Incluido en este gasto' : 'No incluido';
  });
  updateConsumerSelectionSummary();
}


function selectOnlySelfConsumer() {
  const bill = getActiveBill();
  const selfInfo = getSelfParticipantInfo();
  const selfPerson = findSelfPerson(bill, selfInfo);

  if (!selfPerson) {
    showNotice('No encontré tu perfil en Personas', 'Agrega “Yo” en Personas o selecciona manualmente quién consumió este gasto.');
    return;
  }

  [...dom.consumerList.querySelectorAll('.consumer-row')].forEach((row) => {
    const checkbox = row.querySelector('input[type="checkbox"]');
    const shareInput = row.querySelector('input[type="number"]');
    const helpText = row.querySelector('.consumer-name-wrap small');
    const checked = checkbox?.value === selfPerson.id;
    if (!checkbox || !shareInput) return;
    checkbox.checked = checked;
    shareInput.value = 1;
    shareInput.disabled = !checked;
    row.classList.toggle('is-selected', checked);
    if (helpText) helpText.textContent = checked ? 'Solo tú en este gasto' : 'No incluido';
  });
  updateConsumerSelectionSummary();
}

function resetConsumerSharesToEqual() {
  let updated = 0;
  [...dom.consumerList.querySelectorAll('.consumer-row')].forEach((row) => {
    const checkbox = row.querySelector('input[type="checkbox"]');
    const shareInput = row.querySelector('input[type="number"]');
    if (!checkbox || !shareInput || !checkbox.checked) return;
    shareInput.value = 1;
    updated += 1;
  });
  updateConsumerSelectionSummary();
  showToast(updated ? 'Partes igualadas en 1 para las personas seleccionadas.' : 'Selecciona personas antes de igualar partes.');
}

function highlightCustomShares() {
  const selectedRows = [...dom.consumerList.querySelectorAll('.consumer-row')].filter((row) => row.querySelector('input[type="checkbox"]')?.checked);
  if (selectedRows.length === 0) {
    showToast('Selecciona personas antes de ajustar partes distintas.');
    return;
  }
  selectedRows.forEach((row) => row.classList.add('is-editing-shares'));
  const firstInput = selectedRows[0].querySelector('input[type="number"]');
  firstInput?.focus();
  showToast('Ajusta el número de partes de cada persona. Ej: Carlos 2, Pamela 1.');
}

function renderConsumers() {
  const bill = getActiveBill();
  const currentProduct = editingProductId
    ? bill.products.find((product) => product.id === editingProductId)
    : null;
  const splitMode = dom.productSplitModeInput?.value === 'responsibles' ? 'responsibles' : 'participants';
  const defaultChecked = splitMode === 'responsibles' ? false : true;

  dom.consumerList.innerHTML = '';

  if (bill.people.length === 0) {
    dom.consumerList.appendChild(cloneEmptyState());
    updateConsumerSelectionSummary();
    return;
  }

  for (const person of bill.people) {
    const existing = currentProduct?.consumers.find((consumer) => consumer.personId === person.id);
    const checked = currentProduct ? Boolean(existing) : defaultChecked;
    const share = existing?.share || 1;

    const row = document.createElement('label');
    row.className = `consumer-row ${checked ? 'is-selected' : ''}`;
    row.innerHTML = `
      <input type="checkbox" value="${person.id}" ${checked ? 'checked' : ''} />
      <span class="consumer-name-wrap">
        <strong>${escapeHtml(person.name)}</strong>
        <small>${checked ? 'Incluido en este gasto' : 'No incluido'}</small>
      </span>
      <span class="consumer-share-control">
        <small>Partes</small>
        <input type="number" min="1" step="1" value="${share}" aria-label="Partes de ${escapeHtml(person.name)}" />
      </span>
    `;

    const checkbox = row.querySelector('input[type="checkbox"]');
    const shareInput = row.querySelector('input[type="number"]');
    const helpText = row.querySelector('.consumer-name-wrap small');

    shareInput.disabled = !checkbox.checked;

    checkbox.addEventListener('change', () => {
      shareInput.disabled = !checkbox.checked;
      row.classList.toggle('is-selected', checkbox.checked);
      helpText.textContent = checkbox.checked ? 'Incluido en este gasto' : 'No incluido';
      updateConsumerSelectionSummary();
    });

    shareInput.addEventListener('input', updateConsumerSelectionSummary);

    dom.consumerList.appendChild(row);
  }

  updateConsumerSelectionSummary();
}

function renderCategoryTotals() {
  const bill = getActiveBill();
  const calculation = calculateBill(bill);

  dom.categoryTotals.innerHTML = '';

  for (const [category, total] of Object.entries(calculation.categoryTotals)) {
    if (total <= 0) continue;

    const pill = document.createElement('span');
    pill.className = 'category-pill';
    pill.textContent = `${category}: ${formatCurrency(total)}`;
    dom.categoryTotals.appendChild(pill);
  }
}

function renderProducts() {
  const bill = getActiveBill();
  dom.productList.innerHTML = '';

  const search = dom.productSearchInput.value.trim().toLowerCase();
  const filter = dom.productFilterSelect.value;

  const products = bill.products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search);
    const matchesFilter =
      filter === 'all' ||
      (filter === 'shared' && product.consumers.length > 1) ||
      product.category === filter;

    return matchesSearch && matchesFilter;
  });

  if (bill.products.length === 0 || products.length === 0) {
    dom.productList.appendChild(cloneEmptyState());
    return;
  }

  for (const product of products) {
    const productTotal = Number(product.unitPrice) * Number(product.quantity);
    const divisionLabel = product.splitMode === 'responsibles'
      ? 'Responsables'
      : (bill.mode === 'home' ? 'Participantes' : 'Consumidores');
    const consumerNames = product.consumers
      .map((consumer) => {
        const person = bill.people.find((item) => item.id === consumer.personId);
        return person ? `${person.name}${consumer.share > 1 ? ` (${consumer.share} partes)` : ''}` : null;
      })
      .filter(Boolean)
      .join(', ');

    const row = document.createElement('article');
    row.className = 'product-row';
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(product.name)}</strong>
        <div class="product-meta">
          ${escapeHtml(product.category)} · ${formatCurrency(product.unitPrice)} × ${product.quantity} = ${formatCurrency(productTotal)}
          ${bill.mode === 'home' && product.dueDate ? `<br />Vence: ${escapeHtml(formatShortDate(product.dueDate))}` : ''}
          ${bill.mode === 'home' && product.recurring ? '<br />Recurrente' : ''}
          <br />
          ${divisionLabel}: ${escapeHtml(consumerNames || 'Sin personas seleccionadas')}
        </div>
      </div>
      <div class="product-actions">
        <button class="btn btn-light btn-small" data-action="edit" type="button">Editar</button>
        <button class="btn btn-light btn-small" data-action="duplicate" type="button">Duplicar</button>
        <button class="btn btn-danger-light btn-small" data-action="delete" type="button">Eliminar</button>
      </div>
    `;

    row.querySelector('[data-action="edit"]').addEventListener('click', () => {
      startEditProduct(product.id);
    });

    row.querySelector('[data-action="duplicate"]').addEventListener('click', () => {
      duplicateProduct(product.id);
    });

    row.querySelector('[data-action="delete"]').addEventListener('click', () => {
      deleteProduct(product.id);
    });

    dom.productList.appendChild(row);
  }
}

function renderProductForm() {
  const bill = getActiveBill();
  const isHome = bill.mode === 'home';

  if (!editingProductId) {
    dom.productFormTitle.textContent = isHome ? 'Agregar gasto del hogar' : 'Agregar producto';
    dom.productSubmitButton.textContent = isHome ? 'Agregar gasto' : 'Agregar producto';
    dom.cancelEditProductButton.classList.add('hidden');
    dom.productSplitModeInput.value = isHome ? 'responsibles' : 'participants';
    dom.productDueDateInput.value = '';
    dom.productRecurringInput.checked = false;
    renderConsumers();
    return;
  }

  const product = bill.products.find((item) => item.id === editingProductId);

  if (!product) {
    editingProductId = null;
    renderProductForm();
    return;
  }

  dom.productFormTitle.textContent = isHome ? 'Editar gasto' : 'Editar producto';
  dom.productSubmitButton.textContent = 'Guardar cambios';
  dom.cancelEditProductButton.classList.remove('hidden');

  dom.productNameInput.value = product.name;
  dom.productPriceInput.value = product.unitPrice;
  dom.productQuantityInput.value = product.quantity;
  dom.productCategoryInput.value = product.category || 'Otros';
  dom.productSplitModeInput.value = product.splitMode === 'responsibles' ? 'responsibles' : 'participants';
  dom.productDueDateInput.value = product.dueDate || '';
  dom.productRecurringInput.checked = Boolean(product.recurring);

  renderConsumers();
}


function formatShortDate(value) {
  if (!value) return 'Sin fecha';

  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

function daysUntil(dateValue) {
  if (!dateValue) return null;

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(`${dateValue}T00:00:00`);
  return Math.round((target - todayStart) / 86400000);
}

function renderHomeDashboard() {
  const bill = getActiveBill();

  if (bill.mode !== 'home') return;

  const recurrent = bill.products.filter((product) => product.recurring).length;
  const withDueDate = bill.products
    .filter((product) => product.dueDate)
    .map((product) => ({ ...product, days: daysUntil(product.dueDate) }))
    .sort((a, b) => (a.days ?? 99999) - (b.days ?? 99999));

  const upcoming = withDueDate.filter((product) => product.days !== null && product.days >= 0 && product.days <= 7).length;
  const overdue = withDueDate.filter((product) => product.days !== null && product.days < 0).length;

  dom.homeRecurringOutput.textContent = recurrent;
  dom.homeUpcomingOutput.textContent = upcoming;
  dom.homeOverdueOutput.textContent = overdue;
  dom.homeDueList.innerHTML = '';

  if (!withDueDate.length) {
    dom.homeDueList.appendChild(emptyMessage('No hay vencimientos registrados todavía.'));
    return;
  }

  for (const product of withDueDate.slice(0, 8)) {
    const productTotal = Number(product.unitPrice) * Number(product.quantity);
    const item = document.createElement('div');
    const stateClass = product.days < 0 ? 'overdue' : product.days <= 7 ? 'upcoming' : '';

    item.className = `home-due-item ${stateClass}`;
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(product.name)}</strong>
        <span>${escapeHtml(product.category)} · vence ${escapeHtml(formatShortDate(product.dueDate))}</span>
      </div>
      <strong>${formatCurrency(productTotal)}</strong>
    `;
    dom.homeDueList.appendChild(item);
  }
}

function renderTotals() {
  const bill = getActiveBill();
  const calculation = calculateBill(bill);

  dom.accountStatus.innerHTML = `
    <strong>Estado de cuenta: ${calculation.isPaid ? 'Pagada' : 'Pendiente'}</strong>
    <p>${calculation.paidPeople} de ${calculation.totalPeople} personas marcaron pago. Falta cobrar ${formatCurrency(calculation.pendingTotal)}.</p>
  `;

  dom.subtotalOutput.textContent = formatCurrency(calculation.subtotal);
  dom.tipOutput.textContent = formatCurrency(calculation.tipAmount);
  dom.grandTotalOutput.textContent = formatCurrency(calculation.grandTotal);
  if (dom.sidebarGrandTotalOutput) dom.sidebarGrandTotalOutput.textContent = formatCurrency(calculation.grandTotal);
  dom.paidTotalOutput.textContent = formatCurrency(calculation.paidTotal);
  dom.pendingTotalOutput.textContent = formatCurrency(calculation.pendingTotal);
  if (dom.paymentPendingTotalOutput) dom.paymentPendingTotalOutput.textContent = formatCurrency(calculation.pendingTotal);
  if (dom.paymentPaidTotalOutput) dom.paymentPaidTotalOutput.textContent = formatCurrency(calculation.paidTotal);
  if (dom.paymentPendingPeopleOutput) {
    const pendingPeople = bill.people.filter((person) => !person.paid && (calculation.finalTotals[person.id] || 0) > 0).length;
    dom.paymentPendingPeopleOutput.textContent = String(pendingPeople);
  }
  dom.mobileTotalOutput.textContent = formatCurrency(calculation.grandTotal);

  dom.personResults.innerHTML = '';

  if (bill.people.length === 0) {
    dom.personResults.appendChild(cloneEmptyState());
    return;
  }

  for (const person of bill.people) {
    const row = document.createElement('div');
    row.className = 'result-row';
    const amount = calculation.finalTotals[person.id] || 0;
    const hasPhone = Boolean(normalizePhoneNumber(person.phone));
    row.className = `result-row payment-person-row ${person.paid ? 'is-paid' : 'is-pending'}`;
    row.innerHTML = `
      <div class="payment-person-main">
        <span class="payment-person-name">${escapeHtml(person.name)}</span>
        <small class="payment-person-status">${person.paid ? 'Pago registrado' : (bill.payerId && person.id !== bill.payerId ? `Debe transferir a ${(bill.people.find((p) => p.id === bill.payerId) || {}).name || 'pagador'}` : 'Pendiente de pago')}</small>
      </div>
      <div class="result-actions payment-actions">
        <strong>${formatCurrency(amount)}</strong>
        <button class="btn ${person.paid ? 'btn-light' : 'btn-primary'} btn-small payment-toggle-button" type="button">${person.paid ? 'Marcar pendiente' : 'Marcar pagado'}</button>
        <button class="btn btn-light btn-small" type="button" ${hasPhone ? '' : 'disabled'}>WhatsApp</button>
      </div>
    `;

    const [paidButton, whatsappButton] = row.querySelectorAll('button');

    paidButton.addEventListener('click', () => {
      setPersonPaidStatus(person.id, !person.paid);
    });

    whatsappButton.addEventListener('click', () => {
      openPersonWhatsapp(person.id, amount);
    });

    dom.personResults.appendChild(row);
  }
}


function getReceiptSummaryText() {
  const bill = getActiveBill();
  const calculation = calculateBill(bill);
  const payer = bill.people.find((person) => person.id === bill.payerId);
  const generatedAt = new Date().toLocaleDateString('es-CL');
  const statusLabel = calculation.isPaid && bill.people.length > 0 ? 'Pagada' : 'Pendiente';

  const lines = [
    `*Comprobante Cuenta Clara*`,
    `Cuenta: *${bill.name || 'Cuenta sin nombre'}*`,
    `Fecha: *${generatedAt}*`,
    bill.mode === 'home' ? `Mes: *${bill.homeMonth || getCurrentMonthValue()}*` : '',
    '',
    `Total: *${formatCurrency(calculation.grandTotal)}*`,
    `Estado: *${statusLabel}*`,
    `Pagador principal: *${payer ? payer.name : 'Sin definir'}*`,
    `Personas: *${bill.people.length}*`,
    `Pagadas: *${calculation.paidPeople}/${calculation.totalPeople}*`,
    `Pendiente: *${formatCurrency(calculation.pendingTotal)}*`,
  ].filter(Boolean);

  const transfers = getTransferLines(bill, calculation).filter((transfer) => !transfer.paid);

  if (transfers.length) {
    lines.push('', '*Pendientes:*');
    for (const transfer of transfers) {
      lines.push(`- ${transfer.from} debe transferir ${formatCurrency(transfer.amount)} a ${transfer.to}`);
    }
  } else if (bill.people.length > 0) {
    lines.push('', 'Sin cobros pendientes.');
  }

  return lines.join('\n');
}

function renderReceiptSummary() {
  if (!dom.receiptSummaryCard) return;

  const bill = getActiveBill();
  const calculation = calculateBill(bill);
  const payer = bill.people.find((person) => person.id === bill.payerId);
  const pendingPeople = bill.people.filter((person) => !person.paid && (calculation.finalTotals[person.id] || 0) > 0).length;
  const hasMinimumData = bill.people.length > 0 && (bill.mode === 'quick' ? Number(bill.quickTotal || 0) > 0 : bill.products.length > 0);

  dom.receiptBillNameOutput.textContent = bill.name || 'Cuenta actual';
  dom.receiptGrandTotalOutput.textContent = formatCurrency(calculation.grandTotal);
  dom.receiptPayerOutput.textContent = payer ? `Pagador principal: ${payer.name}` : 'Selecciona un pagador principal';
  dom.receiptPeopleOutput.textContent = String(bill.people.length);
  dom.receiptPaidPeopleOutput.textContent = `${calculation.paidPeople}/${calculation.totalPeople}`;
  dom.receiptPendingOutput.textContent = formatCurrency(calculation.pendingTotal);
  if (dom.receiptDateOutput) {
    dom.receiptDateOutput.textContent = new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
  }
  dom.receiptSummaryState.textContent = calculation.isPaid && hasMinimumData ? 'Pagada' : 'Pendiente';
  dom.receiptSummaryState.classList.toggle('is-paid', calculation.isPaid && hasMinimumData);
  dom.receiptSummaryState.classList.toggle('is-pending', !calculation.isPaid || !hasMinimumData);

  if (!bill.people.length) {
    dom.receiptNextStepOutput.textContent = 'Agrega personas para preparar el comprobante.';
  } else if (!hasMinimumData) {
    dom.receiptNextStepOutput.textContent = 'Agrega gastos o un monto rápido para calcular el comprobante.';
  } else if (!payer) {
    dom.receiptNextStepOutput.textContent = 'Selecciona un pagador principal para mostrar a quién transferir.';
  } else if (pendingPeople > 0) {
    dom.receiptNextStepOutput.textContent = `Faltan ${pendingPeople} persona${pendingPeople === 1 ? '' : 's'} por pagar. Puedes enviar recordatorios desde Pagos.`;
  } else {
    dom.receiptNextStepOutput.textContent = 'Todo aparece pagado. Puedes copiar o enviar el comprobante final.';
  }

  if (dom.receiptTransferPreviewList) {
    const transfers = getTransferLines(bill, calculation).filter((transfer) => !transfer.paid).slice(0, 4);
    if (!hasMinimumData) {
      dom.receiptTransferPreviewList.innerHTML = '';
    } else if (transfers.length === 0) {
      dom.receiptTransferPreviewList.innerHTML = '<span class="receipt-transfer-item is-paid">Sin transferencias pendientes.</span>';
    } else {
      dom.receiptTransferPreviewList.innerHTML = transfers.map((transfer) => `
        <span class="receipt-transfer-item">
          <strong>${escapeHtml(transfer.from)}</strong>
          <em>${formatCurrency(transfer.amount)} → ${escapeHtml(transfer.to)}</em>
        </span>
      `).join('');
    }
  }
}

async function copyReceiptSummary() {
  const text = getReceiptSummaryText();
  try {
    await navigator.clipboard.writeText(text);
    showToast('Comprobante copiado.');
  } catch {
    prompt('Copia el comprobante:', text);
  }
}

function whatsappReceiptSummary() {
  const text = getReceiptSummaryText();
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
}

function buildPaymentReminderMessage(person, payer, amount, bill) {
  const lines = [
    `Hola ${person.name}, te recuerdo que tienes pendiente *${formatCurrency(amount)}* de la cuenta *${bill.name || 'Cuenta Clara'}*.`,
  ];

  if (payer && payer.id !== person.id) {
    lines.push(`Transferir a: *${payer.name}*`);
  }

  if (bill.mode === 'home' && bill.homeMonth) {
    lines.push(`Mes: *${bill.homeMonth}*`);
  }

  const previousDebt = Math.max(0, Number(person.previousDebt || 0));
  if (bill.mode === 'home' && previousDebt > 0) {
    lines.push(`Deuda anterior: *${formatCurrency(previousDebt)}*`);
    lines.push(`Mes actual: *${formatCurrency(Math.max(0, amount - previousDebt))}*`);
    lines.push(`Total acumulado: *${formatCurrency(amount)}*`);
  }

  if (bill.paymentDueAt) {
    lines.push(`Fecha límite sugerida: *${bill.paymentDueAt}*`);
  }

  lines.push('', 'Gracias.');
  return lines.join('\n');
}

async function copyPaymentReminder(person, payer, amount, bill) {
  const text = buildPaymentReminderMessage(person, payer, amount, bill);
  try {
    await navigator.clipboard.writeText(text);
    showToast('Recordatorio copiado.');
  } catch {
    prompt('Copia el recordatorio:', text);
  }
}

function sendPaymentReminderWhatsapp(person, payer, amount, bill) {
  const phone = normalizePhoneNumber(person.phone);
  if (!phone) {
    showNotice('Teléfono faltante', `Agrega un WhatsApp a ${person.name} para enviarle recordatorio directo.`);
    return;
  }

  const text = buildPaymentReminderMessage(person, payer, amount, bill);
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
}

function getPaymentDueStatus(bill = getActiveBill()) {
  const calculation = calculateBill(bill);
  const due = String(bill.paymentDueAt || '');

  if (!due) {
    return { label: calculation.pendingTotal > 0 ? 'Sin fecha límite' : 'Sin pendientes', className: 'muted', overdue: false };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(`${due}T00:00:00`);
  const diffDays = Math.round((dueDate - today) / 86400000);

  if (calculation.pendingTotal <= 0 || calculation.isPaid) {
    return { label: `Fecha límite ${due} · cuenta pagada`, className: 'success', overdue: false };
  }

  if (diffDays < 0) {
    return { label: `Vencido hace ${Math.abs(diffDays)} día${Math.abs(diffDays) === 1 ? '' : 's'}`, className: 'danger', overdue: true };
  }

  if (diffDays === 0) {
    return { label: 'Vence hoy', className: 'warning', overdue: false };
  }

  return { label: `Vence en ${diffDays} día${diffDays === 1 ? '' : 's'}`, className: diffDays <= 2 ? 'warning' : 'success', overdue: false };
}

function renderPaymentReminderPanel() {
  if (!dom.paymentReminderPanel) return;

  const bill = getActiveBill();
  const status = getPaymentDueStatus(bill);
  dom.paymentReminderPanel.classList.remove('status-success', 'status-warning', 'status-danger', 'status-muted');
  dom.paymentReminderPanel.classList.add(`status-${status.className || 'muted'}`);

  if (dom.paymentReminderStatusOutput) {
    dom.paymentReminderStatusOutput.textContent = status.label;
  }
  if (dom.paymentDueDateInput && dom.paymentDueDateInput.value !== (bill.paymentDueAt || '')) {
    dom.paymentDueDateInput.value = bill.paymentDueAt || '';
  }
}

function setPaymentDueDateFromInput() {
  const bill = getActiveBill();
  const value = String(dom.paymentDueDateInput?.value || '').trim();

  if (!value) {
    showToast('Elige una fecha límite.');
    return;
  }

  bill.paymentDueAt = value;
  addBillActivity(`Fecha límite de pago definida para ${value}.`, 'reminder', bill);
  persistAndRender();
  showToast('Fecha límite guardada.');
}

function clearPaymentDueDate() {
  const bill = getActiveBill();
  if (!bill.paymentDueAt) {
    showToast('Esta cuenta no tiene fecha límite.');
    return;
  }
  bill.paymentDueAt = '';
  addBillActivity('Fecha límite de pago eliminada.', 'reminder', bill);
  persistAndRender();
  showToast('Fecha límite eliminada.');
}

function getActiveWhatsappNotificationQueue() {
  const bill = getActiveBill();
  const payer = bill.people.find((person) => person.id === bill.payerId);
  if (!payer) return [];

  const calculation = calculateBill(bill);
  return bill.people
    .filter((person) => person.id !== payer.id && !person.paid)
    .map((person) => ({
      person,
      payer,
      bill,
      amount: calculation.finalTotals[person.id] || 0,
      phone: normalizePhoneNumber(person.phone),
    }))
    .filter((item) => item.amount > 0);
}

function renderWhatsappNotificationSettings() {
  if (!dom.whatsappNotificationsToggle && !dom.whatsappNotificationStatusOutput) return;

  state.appSettings = normalizeAppSettings(state.appSettings || {});
  const enabled = Boolean(state.appSettings.whatsappNotificationsEnabled);
  const queue = getActiveWhatsappNotificationQueue();
  const withPhone = queue.filter((item) => item.phone).length;

  if (dom.whatsappNotificationsToggle) {
    dom.whatsappNotificationsToggle.checked = enabled;
  }

  if (dom.whatsappNotificationStatusOutput) {
    dom.whatsappNotificationStatusOutput.textContent = enabled
      ? `${withPhone}/${queue.length} listos`
      : 'Desactivadas';
  }

  if (dom.whatsappNotificationHelpOutput) {
    dom.whatsappNotificationHelpOutput.textContent = enabled
      ? 'Cuenta Clara puede preparar mensajes. WhatsApp siempre pedirá confirmar el envío.'
      : 'Activa esta opción para preparar recordatorios directos desde los pagos pendientes.';
  }
}

function toggleWhatsappNotifications() {
  state.appSettings = normalizeAppSettings(state.appSettings || {});
  state.appSettings.whatsappNotificationsEnabled = Boolean(dom.whatsappNotificationsToggle?.checked);
  if (state.appSettings.whatsappNotificationsEnabled && !state.appSettings.whatsappNotificationsActivatedAt) {
    state.appSettings.whatsappNotificationsActivatedAt = nowIso();
  }
  saveState();
  renderWhatsappNotificationSettings();
  showToast(state.appSettings.whatsappNotificationsEnabled ? 'Recordatorios WhatsApp activados.' : 'Recordatorios WhatsApp desactivados.');
}

async function prepareWhatsappNotifications() {
  state.appSettings = normalizeAppSettings(state.appSettings || {});
  if (!state.appSettings.whatsappNotificationsEnabled) {
    showNotice('Activa recordatorios', 'Primero activa las notificaciones WhatsApp. El envío automático no está permitido desde el navegador; la app prepara el mensaje y tú confirmas en WhatsApp.');
    return;
  }

  const queue = getActiveWhatsappNotificationQueue();
  if (queue.length === 0) {
    showNotice('Sin pendientes', 'Esta cuenta no tiene pagos pendientes para preparar por WhatsApp.');
    return;
  }

  const ready = queue.filter((item) => item.phone);
  if (ready.length === 0) {
    showNotice('Faltan teléfonos', 'Agrega WhatsApp a las personas pendientes para preparar mensajes directos.');
    return;
  }

  const first = ready[0];
  const message = buildPaymentReminderMessage(first.person, first.payer, first.amount, first.bill);
  try {
    await navigator.clipboard.writeText(ready.map((item) => buildPaymentReminderMessage(item.person, item.payer, item.amount, item.bill)).join('\n\n---\n\n'));
  } catch {
    // El copiado es una ayuda. Si falla, igual abrimos WhatsApp para el primer pendiente.
  }
  window.open(`https://wa.me/${first.phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  showNotice('Recordatorio preparado', ready.length > 1
    ? `Abrí WhatsApp para ${first.person.name}. También intenté copiar ${ready.length} recordatorios para enviarlos uno a uno.`
    : `Abrí WhatsApp para ${first.person.name}. Revisa y confirma el envío.`);
}

function renderProfilePayerSummary() {
  if (!dom.profilePayerSummary || !dom.profilePayerDebtorsList) return;

  const bill = getActiveBill();
  const selfInfo = getSelfParticipantInfo();
  const selfPerson = findSelfPerson(bill, selfInfo);
  const payer = bill.people.find((person) => person.id === bill.payerId);
  const calculation = calculateBill(bill);

  const shouldShow = Boolean(selfInfo && selfPerson && payer && payer.id === selfPerson.id);
  dom.profilePayerSummary.classList.toggle('hidden', !shouldShow);

  if (!shouldShow) {
    dom.profilePayerDebtorsList.innerHTML = '';
    return;
  }

  const myAmount = calculation.finalTotals[selfPerson.id] || 0;
  const pendingDebtors = bill.people
    .filter((person) => person.id !== selfPerson.id)
    .map((person) => ({ person, amount: calculation.finalTotals[person.id] || 0 }))
    .filter((item) => item.amount > 0 && !item.person.paid);
  const totalReceivable = pendingDebtors.reduce((sum, item) => sum + item.amount, 0);
  const totalToReceive = bill.people
    .filter((person) => person.id !== selfPerson.id)
    .reduce((sum, person) => sum + (calculation.finalTotals[person.id] || 0), 0);

  dom.profilePayerTitle.textContent = `${selfPerson.name} pagó esta cuenta`;
  dom.profilePayerHelp.textContent = `Tu parte es ${formatCurrency(myAmount)}. En total deberían transferirte ${formatCurrency(totalToReceive)}.`;
  dom.profilePayerPaidOutput.textContent = formatCurrency(calculation.grandTotal);
  dom.profilePayerOwnOutput.textContent = formatCurrency(myAmount);
  dom.profilePayerReceivableOutput.textContent = formatCurrency(totalReceivable);
  dom.profilePayerDebtorsList.innerHTML = '';

  if (pendingDebtors.length === 0) {
    dom.profilePayerDebtorsList.appendChild(emptyMessage('No tienes cobros pendientes en esta cuenta.'));
    return;
  }

  for (const { person, amount } of pendingDebtors) {
    const row = document.createElement('div');
    row.className = 'profile-payer-debtor-row';
    row.innerHTML = `
      <span>${escapeHtml(person.name)}</span>
      <strong>${formatCurrency(amount)}</strong>
    `;
    dom.profilePayerDebtorsList.appendChild(row);
  }
}

function renderTransfers() {
  const bill = getActiveBill();
  const calculation = calculateBill(bill);
  dom.transferList.innerHTML = '';

  const payer = bill.people.find((person) => person.id === bill.payerId);

  if (!payer) {
    dom.transferList.appendChild(emptyMessage('Selecciona un pagador principal para ver quién debe transferirle.'));
    return;
  }

  const debtors = bill.people.filter((person) => person.id !== payer.id && (calculation.finalTotals[person.id] || 0) > 0);
  const pendingDebtors = debtors.filter((person) => !person.paid);

  if (debtors.length === 0) {
    dom.transferList.appendChild(emptyMessage('No hay transferencias para mostrar.'));
    return;
  }

  if (pendingDebtors.length === 0) {
    dom.transferList.appendChild(emptyMessage('Todos los cobros están marcados como pagados.'));
    return;
  }

  for (const person of pendingDebtors) {
    const amount = calculation.finalTotals[person.id] || 0;
    const row = document.createElement('div');
    row.className = 'transfer-row transfer-row-pending';
    const hasPhone = Boolean(normalizePhoneNumber(person.phone));
    row.innerHTML = `
      <span><strong>${escapeHtml(person.name)}</strong><small>Debe transferir a ${escapeHtml(payer.name)}</small></span>
      <div class="transfer-actions">
        <strong>${formatCurrency(amount)}</strong>
        <button class="btn btn-light btn-small" data-action="copy-reminder" type="button">Copiar recordatorio</button>
        <button class="btn btn-primary btn-small" data-action="whatsapp-reminder" type="button" ${hasPhone ? '' : 'disabled'}>WhatsApp</button>
      </div>
    `;

    row.querySelector('[data-action="copy-reminder"]')?.addEventListener('click', () => copyPaymentReminder(person, payer, amount, bill));
    row.querySelector('[data-action="whatsapp-reminder"]')?.addEventListener('click', () => sendPaymentReminderWhatsapp(person, payer, amount, bill));
    dom.transferList.appendChild(row);
  }
}

function emptyMessage(message) {
  const div = document.createElement('div');
  div.className = 'empty-state';
  div.innerHTML = `<strong>Sin datos</strong><p>${escapeHtml(message)}</p>`;
  return div;
}

function render() {
  renderAuthUI();
  renderQuickProducts();
  renderBillList();
  renderRecurringGroups();
  renderSharedPanel();
  renderSharedPermissionState();
  renderSharedActivityList();
  renderBillHeader();
  renderBillModeSwitcher();
  renderPayerSelect();
  renderPeople();
  renderProductForm();
  renderCategoryTotals();
  renderProducts();
  renderHomeDashboard();
  renderRecurringDashboard();
  renderTotals();
  renderReceiptSummary();
  renderAccountReviewPanel();
  renderNetworkStatus();
  renderProfilePayerSummary();
  renderPaymentReminderPanel();
  renderWhatsappNotificationSettings();
  renderPaymentActionCenter();
  renderTransfers();
  renderBackupDiagnostics();
  renderNotificationCenter();
  renderConnectionStatus();
  try {
    renderGuidedExperience();
    renderGuidedFlowPanel();
    renderTemplateAssistant();
    renderActiveTemplateHelper();
    renderMobileHomeDashboard();
    renderHomeActionPanel();
    renderFirstUseOnboarding();
    renderDemoDataCard();
  } catch (error) {
    console.warn('No se pudo renderizar la experiencia guiada:', error);
  }

  if (!dom.shareModal.classList.contains('hidden')) {
    updateSharePreview();
  }
}

function getNextMonthValue(monthValue) {
  const [year, month] = String(monthValue || getCurrentMonthValue()).split('-').map(Number);
  const date = new Date(year, month, 1);
  return date.toISOString().slice(0, 7);
}

function duplicateHomeMonth() {
  const bill = getActiveBill();

  if (bill.mode !== 'home') {
    showToast('Esta opción es para cuentas del hogar.');
    return;
  }

  if (bill.recurringGroupId) {
    createNextRecurringMonthFromActive();
    return;
  }

  const calculation = calculateBill(bill);
  const pendingTotal = Math.round(calculation.pendingTotal || 0);
  const nextMonth = getNextMonthValue(bill.homeMonth);
  const recurringProducts = (bill.products || []).filter((product) => product.recurring);
  const productsToClone = recurringProducts.length ? recurringProducts : (bill.products || []);

  const confirmed = confirm(
    `Duplicar esta cuenta para ${nextMonth}?\n\n` +
    `${pendingTotal > 0 ? `Se arrastrará deuda pendiente por ${formatCurrency(pendingTotal)}.` : 'No hay deuda pendiente para arrastrar.'}\n` +
    `${recurringProducts.length ? `Se copiarán ${recurringProducts.length} gasto(s) marcados como recurrentes.` : 'No hay gastos marcados como recurrentes; se copiarán todos los gastos.'}`
  );

  if (!confirmed) {
    return;
  }

  const personMap = new Map();
  const newPeople = bill.people.map((person) => {
    const newId = createId('person');
    personMap.set(person.id, newId);
    return {
      ...person,
      id: newId,
      paid: false,
      previousDebt: person.paid ? 0 : Math.round(calculation.finalTotals[person.id] || 0),
    };
  });

  const createdAt = nowIso();

  const newBill = {
    ...bill,
    id: createId('bill'),
    name: `${bill.templateLabel || 'Hogar'} - ${nextMonth}`,
    homeMonth: nextMonth,
    payerId: bill.payerId ? personMap.get(bill.payerId) || '' : '',
    archived: false,
    closed: false,
    closedAt: '',
    paymentDueAt: '',
    activity: [],
    recurringGroupId: '',
    recurringSequence: Math.max(1, Number(bill.recurringSequence || 1)) + 1,
    previousBillId: bill.id,
    recurringCarryoverNotes: [],
    sharedAccountId: '',
    sharedRole: '',
    sharedOwnerId: '',
    createdAt,
    updatedAt: createdAt,
    people: newPeople,
    products: productsToClone.map((product) => {
      const dueDay = product.dueDate ? product.dueDate.slice(8, 10) : '';
      const newDueDate = dueDay ? `${nextMonth}-${dueDay}` : '';
      return {
        ...product,
        id: createId('product'),
        dueDate: newDueDate,
        consumers: product.consumers
          .filter((consumer) => personMap.has(consumer.personId))
          .map((consumer) => ({ personId: personMap.get(consumer.personId), share: consumer.share })),
      };
    }),
  };

  addBillActivity(`Mes ${nextMonth} duplicado con arrastre ${formatCurrency(pendingTotal)}.`, 'recurring', bill);
  addBillActivity(`Mes ${nextMonth} creado desde ${bill.homeMonth || 'mes anterior'} con arrastre ${formatCurrency(pendingTotal)}.`, 'recurring', newBill);
  state.bills.unshift(newBill);
  state.activeBillId = newBill.id;
  editingProductId = null;
  saveState();
  render();
  showToast('Mes duplicado con arrastre de pendientes.');
}

function addBill() {
  const listName = askGuidedBillName('detailed');

  if (!listName) {
    return;
  }

  const bill = makeDefaultBill();
  applyBillModePreset(bill, 'detailed', listName);
  state.bills.unshift(bill);
  state.activeBillId = bill.id;
  editingProductId = null;
  saveState();
  render();
  openInitialAccountSetup('Cuenta creada. Agrega personas, elige pagador principal y luego revisa propina en Gastos.');
}

function duplicateBill() {
  const bill = getActiveBill();
  const personMap = new Map();
  const newPeople = bill.people.map((person) => {
    const newId = createId('person');
    personMap.set(person.id, newId);
    return { ...person, id: newId, paid: false };
  });

  const createdAt = nowIso();
  const clonedBill = {
    ...bill,
    id: createId('bill'),
    name: `${bill.name} copia`,
    payerId: bill.payerId ? personMap.get(bill.payerId) || '' : '',
    archived: false,
    closed: false,
    closedAt: '',
    paymentDueAt: '',
    activity: [],
    recurringGroupId: '',
    recurringSequence: 1,
    previousBillId: '',
    recurringCarryoverNotes: [],
    sharedAccountId: '',
    sharedRole: '',
    sharedOwnerId: '',
    createdAt,
    updatedAt: createdAt,
    people: newPeople,
    products: bill.products.map((product) => ({
      ...product,
      id: createId('product'),
      consumers: product.consumers
        .filter((consumer) => personMap.has(consumer.personId))
        .map((consumer) => ({
          personId: personMap.get(consumer.personId),
          share: consumer.share,
        })),
    })),
  };

  state.bills.unshift(clonedBill);
  state.activeBillId = clonedBill.id;
  editingProductId = null;
  saveState();
  render();
  showToast('Cuenta duplicada.');
}

function deleteActiveBill() {
  if (state.bills.length <= 1) {
    showToast('Debe existir al menos una cuenta.');
    return;
  }

  const bill = getActiveBill();
  const undoSnapshot = captureUndoSnapshot('Eliminar cuenta');
  const confirmed = confirmAction(
    `¿Eliminar “${bill.name}”?`,
    'Se eliminarán personas, gastos y pagos asociados. Podrás deshacerlo durante unos segundos.'
  );

  if (!confirmed) {
    return;
  }

  state.bills = state.bills.filter((item) => item.id !== bill.id);
  state.activeBillId = state.bills[0].id;
  editingProductId = null;
  saveState();
  render();
  showUndoToast('Cuenta eliminada.', undoSnapshot);
}

function editBillFromHistory(billId) {
  const bill = state.bills.find((item) => item.id === billId);
  if (!bill) {
    showToast('No encontré esa cuenta en el historial.');
    return;
  }

  state.activeBillId = bill.id;
  editingProductId = null;
  saveState();
  render();
  setAppSection('expenses', { scroll: false });
  showToast('Cuenta lista para editar en Gastos.');
}

function deleteBillFromHistory(billId) {
  if (state.bills.length <= 1) {
    showToast('Debe existir al menos una cuenta.');
    return;
  }

  const bill = state.bills.find((item) => item.id === billId);
  if (!bill) {
    showToast('No encontré esa cuenta en el historial.');
    return;
  }

  const undoSnapshot = captureUndoSnapshot('Eliminar cuenta del historial');
  const confirmed = confirmAction(
    `¿Eliminar “${bill.name}” del historial?`,
    'Se eliminarán personas, gastos y pagos asociados. Podrás deshacerlo durante unos segundos.'
  );
  if (!confirmed) return;

  state.bills = state.bills.filter((item) => item.id !== bill.id);

  if (state.activeBillId === bill.id) {
    state.activeBillId = state.bills[0]?.id || makeDefaultBill().id;
  }

  editingProductId = null;
  saveState();
  render();
  showUndoToast('Cuenta eliminada del historial.', undoSnapshot);
}

function toggleArchiveBill() {
  const bill = getActiveBill();
  const undoSnapshot = captureUndoSnapshot(bill.archived ? 'Desarchivar cuenta' : 'Archivar cuenta');
  bill.archived = !bill.archived;
  persistAndRender();
  showUndoToast(bill.archived ? 'Cuenta archivada.' : 'Cuenta desarchivada.', undoSnapshot);
}

function getCloseReadinessIssues(bill = getActiveBill()) {
  const issues = [];
  const calculation = calculateBill(bill);

  if (!bill.people.length) issues.push('No hay personas agregadas.');
  if (!bill.payerId && calculation.grandTotal > 0) issues.push('Falta seleccionar pagador principal.');
  if (!billHasAmounts(bill)) issues.push('La cuenta no tiene gastos ni monto total.');

  const productsWithoutConsumers = (bill.products || []).filter((product) =>
    Number(product.unitPrice || 0) * Number(product.quantity || 0) > 0
    && (!Array.isArray(product.consumers) || product.consumers.length === 0)
  );
  if (productsWithoutConsumers.length) {
    issues.push(`${productsWithoutConsumers.length} gasto${productsWithoutConsumers.length === 1 ? '' : 's'} sin consumidores.`);
  }

  const pendingPeople = (bill.people || []).filter((person) => !person.paid && (calculation.finalTotals[person.id] || 0) > 0);
  if (pendingPeople.length) {
    issues.push(`${pendingPeople.length} persona${pendingPeople.length === 1 ? '' : 's'} con pago pendiente (${formatCurrency(calculation.pendingTotal)}).`);
  }

  return issues;
}

function confirmCloseBillWithReview(bill = getActiveBill()) {
  const issues = getCloseReadinessIssues(bill);

  if (!issues.length) return true;

  return confirmAction(
    `Antes de cerrar “${bill.name}”, revisa estos puntos:`,
    `${issues.map((issue) => `• ${issue}`).join('\n')}\n\nPuedes cerrar igual, pero la cuenta quedará marcada con pendientes.`
  );
}

function setBillClosedState(bill, closed) {
  bill.closed = Boolean(closed);
  bill.closedAt = bill.closed ? nowIso() : '';
  bill.updatedAt = nowIso();
}

function toggleCloseBill() {
  const bill = getActiveBill();

  if (bill.archived) {
    showToast('Desarchiva la cuenta antes de cerrarla o reabrirla.');
    return;
  }

  const undoSnapshot = captureUndoSnapshot(bill.closed ? 'Reabrir cuenta' : 'Cerrar cuenta');

  if (!bill.closed && !confirmCloseBillWithReview(bill)) {
    return;
  }

  setBillClosedState(bill, !bill.closed);
  addBillActivity(bill.closed ? 'Cuenta cerrada.' : 'Cuenta reabierta.', 'status', bill);
  saveState();
  render();
  showUndoToast(bill.closed ? 'Cuenta cerrada.' : 'Cuenta reabierta.', undoSnapshot);
}

function toggleBillClosedFromHistory(billId) {
  const bill = state.bills.find((item) => item.id === billId);

  if (!bill) {
    showToast('No encontré esa cuenta en el historial.');
    return;
  }

  if (bill.archived) {
    showToast('Desarchiva la cuenta antes de cerrarla o reabrirla.');
    return;
  }

  const undoSnapshot = captureUndoSnapshot(bill.closed ? 'Reabrir cuenta' : 'Cerrar cuenta');

  if (!bill.closed && !confirmCloseBillWithReview(bill)) {
    return;
  }

  setBillClosedState(bill, !bill.closed);
  addBillActivity(bill.closed ? 'Cuenta cerrada desde Historial.' : 'Cuenta reabierta desde Historial.', 'status', bill);
  saveState();
  render();
  showUndoToast(bill.closed ? 'Cuenta cerrada.' : 'Cuenta reabierta.', undoSnapshot);
}


function getFrequentPeopleSuggestions(limit = 8) {
  const activeBill = getActiveBill();
  const activeNames = new Set((activeBill.people || []).map((person) => String(person.name || '').trim().toLowerCase()));
  const suggestions = new Map();

  const collect = (person, weight = 1) => {
    const name = String(person?.name || '').trim();
    if (!name || activeNames.has(name.toLowerCase())) return;
    const key = name.toLowerCase();
    const current = suggestions.get(key) || { name, phone: '', count: 0 };
    current.phone = normalizePhoneNumber(person.phone || current.phone || '');
    current.count += weight;
    suggestions.set(key, current);
  };

  for (const bill of state.bills || []) {
    if (!bill || bill.id === activeBill.id) continue;
    for (const person of bill.people || []) {
      collect(person, 1);
    }
  }

  const profile = getProfile();
  for (const friend of profile.friends || []) {
    collect(friend, 2);
  }

  return [...suggestions.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'es'))
    .slice(0, limit);
}

function renderFrequentPeopleSuggestions() {
  if (!dom.frequentPeoplePanel || !dom.frequentPeopleChips) return;

  const suggestions = getFrequentPeopleSuggestions();
  const hasSuggestions = suggestions.length > 0;
  dom.toggleFrequentPeopleButton?.classList.toggle('hidden', !hasSuggestions);
  dom.frequentPeoplePanel.classList.toggle('hidden', !hasSuggestions || !frequentPeopleExpanded);

  if (dom.toggleFrequentPeopleButton) {
    dom.toggleFrequentPeopleButton.setAttribute('aria-expanded', String(frequentPeopleExpanded && hasSuggestions));
    dom.toggleFrequentPeopleButton.textContent = frequentPeopleExpanded
      ? 'Ocultar personas frecuentes'
      : `Ver personas frecuentes (${suggestions.length})`;
  }

  dom.frequentPeopleChips.innerHTML = '';

  for (const person of suggestions) {
    const button = document.createElement('button');
    button.className = 'frequent-person-chip';
    button.type = 'button';
    button.innerHTML = `<strong>${escapeHtml(person.name)}</strong><span>${person.phone ? escapeHtml(formatPhoneForDisplay(person.phone)) : 'Sin teléfono'}</span>`;
    button.addEventListener('click', () => addPerson(person.name, person.phone));
    dom.frequentPeopleChips.appendChild(button);
  }
}

function toggleFrequentPeoplePanel() {
  frequentPeopleExpanded = !frequentPeopleExpanded;
  renderFrequentPeopleSuggestions();
}

function addPerson(name, phone = '') {
  const bill = getActiveBill();
  const cleanName = name.trim();

  if (!cleanName) {
    showToast('Ingresa un nombre.');
    return;
  }

  const exists = bill.people.some((person) => person.name.toLowerCase() === cleanName.toLowerCase());

  if (exists) {
    showNotice('Nombre repetido', 'Ya existe una persona con ese nombre en esta cuenta. Usa un apellido, apodo o inicial para diferenciarla.');
    return;
  }

  bill.people.push({
    id: createId('person'),
    name: cleanName,
    phone: normalizePhoneNumber(phone),
    email: '',
    userId: '',
    previousDebt: 0,
    paid: false,
  });

  addBillActivity(`${cleanName} fue agregado a la cuenta.`, 'people', bill);
  dom.personNameInput.value = '';
  dom.personPhoneInput.value = '';
  persistAndRender();
}

function deletePerson(personId) {
  const bill = getActiveBill();
  const person = bill.people.find((item) => item.id === personId);

  if (!person) {
    return;
  }

  const undoSnapshot = captureUndoSnapshot('Eliminar persona');
  const confirmed = confirmAction(
    `¿Eliminar a ${person.name}?`,
    'También se quitará de los gastos compartidos y puede cambiar el resumen. Podrás deshacerlo durante unos segundos.'
  );

  if (!confirmed) {
    return;
  }

  addBillActivity(`${person.name} fue eliminado de la cuenta.`, 'people', bill);
  bill.people = bill.people.filter((item) => item.id !== personId);
  bill.products = bill.products.map((product) => ({
    ...product,
    consumers: product.consumers.filter((consumer) => consumer.personId !== personId),
  }));

  if (bill.payerId === personId) {
    bill.payerId = '';
  }

  persistAndRender();
  showUndoToast('Persona eliminada.', undoSnapshot);
}

function editPerson(personId) {
  const bill = getActiveBill();
  const person = bill.people.find((item) => item.id === personId);

  if (!person) {
    return;
  }

  const newName = prompt('Nombre de la persona:', person.name);

  if (newName === null) {
    return;
  }

  const cleanName = newName.trim();

  if (!cleanName) {
    showToast('El nombre no puede quedar vacío.');
    return;
  }

  const exists = bill.people.some(
    (item) => item.id !== personId && item.name.toLowerCase() === cleanName.toLowerCase()
  );

  if (exists) {
    showNotice('Nombre repetido', 'Ya existe una persona con ese nombre. Usa un apellido, apodo o inicial para diferenciarla.');
    return;
  }

  const newPhone = prompt('Teléfono WhatsApp opcional. Ej: 56912345678', formatPhoneForDisplay(person.phone) || '');

  if (newPhone === null) {
    return;
  }

  addBillActivity(`${person.name} fue editado como ${cleanName}.`, 'people', bill);
  person.name = cleanName;
  person.phone = normalizePhoneNumber(newPhone);
  persistAndRender();
}

function renamePerson(personId) {
  editPerson(personId);
}

function markAllPaid(paid) {
  const bill = getActiveBill();

  if (!bill.people.length) {
    showToast('Agrega personas antes de marcar pagos.');
    return;
  }

  const undoSnapshot = captureUndoSnapshot(paid ? 'Marcar todo pagado' : 'Marcar todo pendiente');
  bill.people = bill.people.map((person) => ({ ...person, paid }));
  addBillActivity(paid ? 'Todos los pagos fueron marcados como pagados.' : 'Todos los pagos volvieron a pendiente.', 'payment', bill);
  persistAndRender();
  showUndoToast(paid ? 'Todos quedaron como pagados.' : 'Todos quedaron como pendientes.', undoSnapshot);
}

function getConsumersFromForm() {
  return [...dom.consumerList.querySelectorAll('.consumer-row')]
    .map((row) => {
      const checkbox = row.querySelector('input[type="checkbox"]');
      const shareInput = row.querySelector('input[type="number"]');

      return {
        personId: checkbox.value,
        checked: checkbox.checked,
        share: Math.max(1, Number(shareInput.value || 1)),
      };
    })
    .filter((consumer) => consumer.checked)
    .map(({ personId, share }) => ({ personId, share }));
}

function submitProduct() {
  const bill = getActiveBill();
  const name = dom.productNameInput.value.trim();
  const unitPrice = Number(dom.productPriceInput.value);
  const quantity = Number(dom.productQuantityInput.value);
  const category = CATEGORIES.includes(dom.productCategoryInput.value) ? dom.productCategoryInput.value : 'Otros';
  const splitMode = dom.productSplitModeInput.value === 'responsibles' ? 'responsibles' : 'participants';
  const dueDate = dom.productDueDateInput.value || '';
  const recurring = dom.productRecurringInput.checked;
  const consumers = getConsumersFromForm();

  if (!name) {
    showToast('Ingresa el nombre del producto.');
    return;
  }

  if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
    showToast('Ingresa un precio unitario mayor a cero.');
    return;
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    showToast('Ingresa una cantidad mayor a cero.');
    return;
  }

  if (consumers.length === 0) {
    showToast('Selecciona al menos una persona.');
    return;
  }

  if (editingProductId) {
    const product = bill.products.find((item) => item.id === editingProductId);

    if (product) {
      product.name = name;
      product.unitPrice = unitPrice;
      product.quantity = quantity;
      product.category = category;
      product.splitMode = splitMode;
      product.dueDate = dueDate;
      product.recurring = recurring;
      product.consumers = consumers;
    }

    editingProductId = null;
    addBillActivity(`${name} fue actualizado.`, 'expense', bill);
    showToast('Producto actualizado.');
  } else {
    bill.products.push({
      id: createId('product'),
      name,
      unitPrice,
      quantity,
      category,
      splitMode,
      dueDate,
      recurring,
      consumers,
    });

    addBillActivity(`${name} fue agregado por ${formatCurrency(unitPrice * quantity)}.`, 'expense', bill);
    showToast('Producto agregado.');
  }

  resetProductForm();
  persistAndRender();
}

function startEditProduct(productId) {
  editingProductId = productId;
  renderProductForm();
  dom.productNameInput.focus();
  window.scrollTo({ top: dom.productForm.offsetTop - 110, behavior: 'smooth' });
}

function duplicateProduct(productId) {
  const bill = getActiveBill();
  const product = bill.products.find((item) => item.id === productId);

  if (!product) return;

  bill.products.push({
    ...product,
    id: createId('product'),
    name: `${product.name} copia`,
    consumers: product.consumers.map((consumer) => ({ ...consumer })),
  });

  addBillActivity(`${product.name} fue duplicado.`, 'expense', bill);
  persistAndRender();
  showToast('Producto duplicado.');
}

function deleteProduct(productId) {
  const bill = getActiveBill();
  const product = bill.products.find((item) => item.id === productId);

  if (!product) {
    return;
  }

  const undoSnapshot = captureUndoSnapshot('Eliminar gasto');
  const confirmed = confirmAction(
    `¿Eliminar “${product.name}”?`,
    'Esta acción cambiará el resumen de la cuenta. Podrás deshacerlo durante unos segundos.'
  );

  if (!confirmed) {
    return;
  }

  bill.products = bill.products.filter((item) => item.id !== productId);
  addBillActivity(`${product.name} fue eliminado.`, 'expense', bill);

  if (editingProductId === productId) {
    editingProductId = null;
    resetProductForm();
  }

  persistAndRender();
  showUndoToast('Gasto eliminado.', undoSnapshot);
}

function resetProductForm() {
  editingProductId = null;
  dom.productForm.reset();
  dom.productQuantityInput.value = 1;
  dom.productCategoryInput.value = getActiveBill().mode === 'home' ? 'Luz' : 'Comida';
  dom.productSplitModeInput.value = getActiveBill().mode === 'home' ? 'responsibles' : 'participants';
  dom.productDueDateInput.value = '';
  dom.productRecurringInput.checked = false;
  dom.productFormTitle.textContent = 'Agregar producto';
  dom.productSubmitButton.textContent = 'Agregar producto';
  dom.cancelEditProductButton.classList.add('hidden');
}

function clearProducts() {
  const bill = getActiveBill();
  const undoSnapshot = captureUndoSnapshot('Limpiar gastos');
  const confirmed = confirmAction(
    '¿Limpiar todos los gastos de esta cuenta?',
    'Se eliminarán los productos/gastos registrados y el monto rápido. Podrás deshacerlo durante unos segundos.'
  );

  if (!confirmed) return;

  bill.products = [];
  bill.quickTotal = 0;
  persistAndRender();
  showUndoToast('Gastos limpiados.', undoSnapshot);
}

function resetBill() {
  const bill = getActiveBill();
  const undoSnapshot = captureUndoSnapshot('Reiniciar cuenta');
  const confirmed = confirmAction(
    '¿Reiniciar esta cuenta?',
    'Se eliminarán personas, gastos, pagador y pagos. Podrás deshacerlo durante unos segundos.'
  );

  if (!confirmed) return;

  bill.people = [];
  bill.products = [];
  bill.payerId = '';
  bill.quickTotal = 0;
  bill.tipPercent = 10;
  bill.mode = 'detailed';
  persistAndRender();
  showUndoToast('Cuenta reiniciada.', undoSnapshot);
}

function getShareOptions() {
  const format = document.querySelector('input[name="shareFormat"]:checked')?.value || 'text';
  const content = document.querySelector('input[name="shareContent"]:checked')?.value || 'simple';

  return { format, content };
}

function getTransferLines(bill, calculation) {
  const payer = bill.people.find((person) => person.id === bill.payerId);

  if (!payer) {
    return [];
  }

  return bill.people
    .filter((person) => person.id !== payer.id && (calculation.finalTotals[person.id] || 0) > 0)
    .map((person) => ({
      from: person.name,
      to: payer.name,
      amount: calculation.finalTotals[person.id] || 0,
      paid: person.paid,
    }));
}

function getSummaryContentLabel(content = 'simple') {
  if (content === 'detail') return 'Resumen detallado';
  if (content === 'pending') return 'Solo pendientes';
  return 'Resumen simple';
}

function getBillStatusLabel(bill, calculation) {
  if (bill.archived) return 'Archivada';
  if (bill.closed) return 'Cerrada';
  return calculation.isPaid && bill.people.length > 0 ? 'Pagada' : 'Pendiente';
}

function getSummaryText(content = 'simple') {
  const bill = getActiveBill();
  const calculation = calculateBill(bill);
  const payer = bill.people.find((person) => person.id === bill.payerId);
  const transfers = getTransferLines(bill, calculation);
  const pendingTransfers = transfers.filter((transfer) => !transfer.paid);
  const generatedAt = new Date().toLocaleDateString('es-CL');
  const lines = [
    `*Cuenta Clara - ${bill.name}*`,
    `${getSummaryContentLabel(content)} · ${generatedAt}`,
    bill.mode === 'home' ? `Mes hogar: *${bill.homeMonth || getCurrentMonthValue()}*` : '',
    payer ? `Pagador principal: *${payer.name}*` : 'Pagador principal: pendiente',
    `Estado: *${getBillStatusLabel(bill, calculation)}*`,
    '',
  ].filter((line) => line !== '');

  if (content === 'pending') {
    lines.push(`Total pendiente: *${formatCurrency(calculation.pendingTotal)}*`);
    lines.push(`Personas pendientes: *${calculation.pendingPeople}*`);

    if (pendingTransfers.length > 0) {
      lines.push('', '*Transferencias pendientes:*');
      for (const transfer of pendingTransfers) {
        lines.push(`- ${transfer.from} debe transferir a ${transfer.to}: *${formatCurrency(transfer.amount)}*`);
      }
    } else {
      lines.push('', 'Sin transferencias pendientes.');
    }

    return lines.join('\n');
  }

  if (content === 'detail') {
    for (const person of bill.people) {
      const detail = calculation.personDetails[person.id];
      lines.push(`*${person.name}: ${formatCurrency(detail.total)}*`);
      lines.push(`Estado: ${person.paid ? 'Pagado' : 'Pendiente'}`);

      if (detail.items.length > 0) {
        lines.push('Detalle:');
        for (const item of detail.items) {
          const shareText = item.totalShares > 1 ? ` (${item.share}/${item.totalShares} partes)` : '';
          lines.push(`- ${item.productName}${shareText}: ${formatCurrency(item.amount)}`);
        }
      } else {
        lines.push('Detalle: sin consumos registrados');
      }

      lines.push(`Subtotal: ${formatCurrency(detail.subtotal)}`);
      lines.push(`Propina: ${formatCurrency(detail.tip)}`);
      lines.push('');
    }
  } else {
    for (const person of bill.people) {
      const detail = calculation.personDetails[person.id];
      lines.push(`*${person.name}: ${formatCurrency(detail.total)}* - ${person.paid ? 'Pagado' : 'Pendiente'}`);
    }

    lines.push('');
  }

  lines.push(`Subtotal: ${formatCurrency(calculation.subtotal)}`);

  if (bill.mode !== 'home') {
    lines.push(`Propina (${bill.tipPercent}%): ${formatCurrency(calculation.tipAmount)}`);
  }

  lines.push(`Total cuenta: *${formatCurrency(calculation.grandTotal)}*`);
  lines.push(`Total pagado: *${formatCurrency(calculation.paidTotal)}*`);
  lines.push(`Total pendiente: *${formatCurrency(calculation.pendingTotal)}*`);

  if (transfers.length > 0) {
    lines.push('');
    lines.push('*Transferencias:*');

    for (const transfer of transfers) {
      const status = transfer.paid ? 'Pagado' : 'Pendiente';
      lines.push(`*${transfer.from} debe transferir a ${transfer.to}: ${formatCurrency(transfer.amount)}* · ${status}`);
    }
  }

  return lines.join('\n');
}

async function copySummary(content = 'simple') {
  const summary = getSummaryText(content);

  try {
    await navigator.clipboard.writeText(summary);
    showToast('Resumen copiado.');
  } catch {
    prompt('Copia el resumen:', summary);
  }
}

function shareWhatsapp(content = 'simple') {
  const summary = getSummaryText(content);
  const url = `https://wa.me/?text=${encodeURIComponent(summary)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function setShareOptions({ format = 'text', content = 'simple' } = {}) {
  const formatInput = document.querySelector(`input[name="shareFormat"][value="${format}"]`);
  const contentInput = document.querySelector(`input[name="shareContent"][value="${content}"]`);

  if (formatInput) formatInput.checked = true;
  if (contentInput) contentInput.checked = true;
}

function openReceiptImageShare() {
  setShareOptions({ format: 'image', content: 'simple' });
  openShareModal();
}

function compactBillForLink(bill) {
  const people = bill.people.map((person) => ({
    name: person.name,
    phone: normalizePhoneNumber(person.phone || ''),
    email: normalizeEmail(person.email || ''),
    userId: person.userId || '',
    previousDebt: Math.max(0, Number(person.previousDebt || 0)),
    paid: person.paid,
  }));

  const personIndex = new Map(bill.people.map((person, index) => [person.id, index]));

  return {
    v: 2,
    name: bill.name,
    mode: bill.mode,
    quickTotal: bill.quickTotal,
    homeMonth: bill.homeMonth,
    tipPercent: bill.tipPercent,
    payerIndex: bill.payerId && personIndex.has(bill.payerId) ? personIndex.get(bill.payerId) : null,
    people,
    products: bill.products.map((product) => ({
      name: product.name,
      unitPrice: product.unitPrice,
      quantity: product.quantity,
      category: product.category,
      splitMode: product.splitMode || 'participants',
      dueDate: product.dueDate || '',
      recurring: Boolean(product.recurring),
      consumers: product.consumers
        .filter((consumer) => personIndex.has(consumer.personId))
        .map((consumer) => ({
          personIndex: personIndex.get(consumer.personId),
          share: consumer.share,
        })),
    })),
  };
}

function billFromCompactLink(data) {
  const createdAt = nowIso();
  const people = Array.isArray(data.people)
    ? data.people.map((person) => ({
        id: createId('person'),
        name: String(person.name || 'Persona'),
        phone: normalizePhoneNumber(person.phone || ''),
        email: normalizeEmail(person.email || ''),
        userId: String(person.userId || ''),
        previousDebt: Math.max(0, Number(person.previousDebt || 0)),
        paid: Boolean(person.paid),
      }))
    : [];

  const bill = {
    id: createId('bill'),
    name: `${String(data.name || 'Cuenta compartida')} compartida`,
    mode: ['quick', 'home'].includes(data.mode) ? data.mode : 'detailed',
    quickTotal: Number(data.quickTotal || 0),
    homeMonth: data.homeMonth || getCurrentMonthValue(),
    tipPercent: Number.isFinite(Number(data.tipPercent)) ? Number(data.tipPercent) : 10,
    payerId: Number.isInteger(data.payerIndex) && people[data.payerIndex] ? people[data.payerIndex].id : '',
    archived: false,
    closed: false,
    closedAt: '',
    paymentDueAt: '',
    activity: [],
    recurringGroupId: '',
    recurringSequence: 1,
    previousBillId: '',
    recurringCarryoverNotes: [],
    sharedAccountId: '',
    sharedRole: '',
    sharedOwnerId: '',
    createdAt,
    updatedAt: createdAt,
    people,
    products: [],
  };

  bill.products = Array.isArray(data.products)
    ? data.products.map((product) => ({
        id: createId('product'),
        name: String(product.name || 'Producto'),
        unitPrice: Number(product.unitPrice || 0),
        quantity: Number(product.quantity || 1),
        category: CATEGORIES.includes(product.category) ? product.category : 'Otros',
        splitMode: product.splitMode === 'responsibles' ? 'responsibles' : 'participants',
        dueDate: product.dueDate || '',
        recurring: Boolean(product.recurring),
        consumers: Array.isArray(product.consumers)
          ? product.consumers
              .filter((consumer) => people[consumer.personIndex])
              .map((consumer) => ({
                personId: people[consumer.personIndex].id,
                share: Math.max(1, Number(consumer.share || 1)),
              }))
          : [],
      }))
    : [];

  return bill;
}

function base64UrlEncode(text) {
  const utf8 = new TextEncoder().encode(text);
  let binary = '';

  utf8.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(encoded) {
  const padded = encoded.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((encoded.length + 3) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function copyShareLink() {
  const bill = getActiveBill();
  const data = compactBillForLink(bill);
  const encoded = base64UrlEncode(JSON.stringify(data));
  const url = `${location.origin}${location.pathname}?cuenta=${encoded}`;

  try {
    await navigator.clipboard.writeText(url);
    showToast('Enlace copiado.');
  } catch {
    prompt('Copia el enlace:', url);
  }
}

function importBillFromUrl() {
  const params = new URLSearchParams(location.search);
  const encoded = params.get('cuenta');

  if (!encoded) {
    return;
  }

  try {
    const data = JSON.parse(base64UrlDecode(encoded));
    const bill = billFromCompactLink(data);

    state.bills.unshift(bill);
    state.activeBillId = bill.id;
    saveState();

    history.replaceState(null, '', location.pathname);
    showNotice('Cuenta importada', 'Se cargó una cuenta compartida desde el enlace.');
  } catch {
    showNotice('Enlace inválido', 'No se pudo cargar la cuenta compartida desde el enlace.');
  }
}

function getStorageSizeBytes(key = activeStorageKey) {
  try {
    const raw = localStorage.getItem(key) || '';
    return new Blob([raw]).size;
  } catch {
    return 0;
  }
}

function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function getLatestBillUpdate() {
  const dates = (state?.bills || [])
    .map((bill) => bill.updatedAt || bill.createdAt)
    .filter(Boolean)
    .sort();

  return dates.length ? dates[dates.length - 1] : '';
}

function getBackupDiagnostics() {
  const bills = Array.isArray(state?.bills) ? state.bills : [];
  const activeBill = getActiveBill();
  const peopleCount = bills.reduce((sum, bill) => sum + (Array.isArray(bill.people) ? bill.people.length : 0), 0);
  const productsCount = bills.reduce((sum, bill) => sum + (Array.isArray(bill.products) ? bill.products.length : 0), 0);
  const recurringCount = Array.isArray(state?.recurringGroups) ? state.recurringGroups.length : 0;
  const sharedCount = bills.filter((bill) => bill.sharedAccountId || bill.sharedRole).length;
  let pendingTotal = 0;
  let pendingBills = 0;

  for (const bill of bills) {
    try {
      const calculation = calculateBill(bill);
      if ((calculation.pendingTotal || 0) > 0) {
        pendingBills += 1;
        pendingTotal += calculation.pendingTotal || 0;
      }
    } catch {
      // Si una cuenta antigua no calcula correctamente, el estado general sigue funcionando.
    }
  }

  const hasLocalData = getStorageSizeBytes() > 0 || bills.length > 0;
  const hasAutoBackup = Boolean(localStorage.getItem(AUTO_IMPORT_BACKUP_KEY));
  const latestBillUpdate = getLatestBillUpdate();

  return {
    appVersion: APP_VERSION,
    exportedAt: nowIso(),
    sessionMode: currentSession.mode === 'user' ? 'Usuario registrado' : 'Invitado',
    sessionName: currentSession.name || currentSession.email || 'Sin nombre de perfil',
    storageKey: activeStorageKey,
    hasLocalData,
    hasAutoBackup,
    localSizeBytes: getStorageSizeBytes(),
    cloudStatus: currentSession.mode === 'user' ? getHomeSyncLabel() : 'Modo invitado',
    lastLocalSaveAt: lastLocalSaveAt || latestBillUpdate || '',
    lastCloudSyncAt: lastCloudSyncAt || '',
    activeBillName: activeBill?.name || 'Cuenta actual',
    activeBillMode: getBillModeLongLabel(activeBill?.mode),
    billsCount: bills.length,
    peopleCount,
    productsCount,
    recurringCount,
    sharedCount,
    pendingBills,
    pendingTotal: Math.round(pendingTotal),
    quickProductsCount: Array.isArray(state?.quickProducts) ? state.quickProducts.length : 0,
    friendsCount: Array.isArray(state?.friends) ? state.friends.length : 0,
  };
}

function getBackupPayload() {
  return {
    exportedAt: nowIso(),
    app: 'Cuenta Clara',
    appVersion: APP_VERSION,
    version: BACKUP_SCHEMA_VERSION,
    profile: {
      mode: currentSession.mode,
      email: currentSession.email || '',
      name: currentSession.name || '',
      storageKey: activeStorageKey,
    },
    diagnostics: getBackupDiagnostics(),
    state,
  };
}

function exportBackup() {
  const payload = getBackupPayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const profileName = currentSession.mode === 'user'
    ? currentSession.email.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')
    : 'invitado';

  link.href = url;
  link.download = `cuenta-clara-respaldo-v${APP_VERSION}-${profileName}-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();

  URL.revokeObjectURL(url);
  showToast('Respaldo exportado.');
  renderBackupDiagnostics();
}

function saveAutomaticImportBackup() {
  try {
    const payload = getBackupPayload();
    payload.reason = 'Copia automática antes de importar un respaldo';
    localStorage.setItem(AUTO_IMPORT_BACKUP_KEY, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.warn('No se pudo crear copia previa:', error);
    return false;
  }
}

function extractStateFromBackupPayload(payload) {
  const importedState = payload?.state || payload;
  if (!importedState || !Array.isArray(importedState.bills)) {
    throw new Error('El archivo no contiene cuentas válidas.');
  }
  return normalizeState(importedState);
}

function getImportPreviewText(payload, importedState) {
  const diagnostics = payload?.diagnostics || {};
  const bills = importedState?.bills || [];
  const activeName = bills.find((bill) => bill.id === importedState.activeBillId)?.name || bills[0]?.name || 'Sin cuenta activa';
  const exportedAt = payload?.exportedAt ? formatDate(payload.exportedAt) : 'fecha no indicada';
  const originVersion = payload?.appVersion || diagnostics.appVersion || 'versión no indicada';

  return [
    `Origen: Cuenta Clara ${originVersion}`,
    `Exportado: ${exportedAt}`,
    `Cuentas: ${bills.length}`,
    `Cuenta activa: ${activeName}`,
    `Productos rápidos: ${Array.isArray(importedState.quickProducts) ? importedState.quickProducts.length : 0}`,
    `Carpetas recurrentes: ${Array.isArray(importedState.recurringGroups) ? importedState.recurringGroups.length : 0}`,
  ].join('\n');
}

function importBackupFile(file) {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const payload = JSON.parse(reader.result);
      const importedState = extractStateFromBackupPayload(payload);
      const profileLabel = currentSession.mode === 'user'
        ? `el usuario ${currentSession.email}`
        : 'el modo invitado';
      const preview = getImportPreviewText(payload, importedState);
      const confirmed = confirm(`¿Importar este respaldo?\n\n${preview}\n\nReemplazará las cuentas guardadas en ${profileLabel}. Antes de importar crearé una copia de seguridad.`);

      if (!confirmed) return;

      const autoBackupCreated = saveAutomaticImportBackup();
      state = importedState;
      migrateEmptyDefaultPeople();
      saveState();
      render();
      showNotice('Respaldo importado', autoBackupCreated
        ? 'Se importaron tus datos y quedó guardada una copia previa por seguridad.'
        : 'Se importaron tus datos. No pude crear copia previa automática en este navegador.');
    } catch {
      showNotice('Respaldo inválido', 'No se pudo leer el archivo seleccionado o no contiene datos válidos de Cuenta Clara. Tus datos actuales no fueron modificados.');
    }
  };

  reader.onerror = () => {
    showNotice('No se pudo leer el archivo', 'El navegador no permitió abrir el respaldo seleccionado. Prueba nuevamente con otro archivo JSON.');
  };

  reader.readAsText(file);
}

function restoreAutomaticImportBackup() {
  const raw = localStorage.getItem(AUTO_IMPORT_BACKUP_KEY);

  if (!raw) {
    showToast('No hay copia previa para restaurar.');
    return;
  }

  try {
    const payload = JSON.parse(raw);
    const restoredState = extractStateFromBackupPayload(payload);
    const preview = getImportPreviewText(payload, restoredState);
    const confirmed = confirm(`¿Restaurar la copia previa?\n\n${preview}\n\nEsto reemplazará los datos actuales de este navegador.`);

    if (!confirmed) return;

    state = restoredState;
    saveState();
    render();
    showNotice('Copia previa restaurada', 'Se recuperaron los datos guardados antes de la última importación.');
  } catch {
    showNotice('No se pudo restaurar', 'La copia previa está dañada o ya no contiene datos válidos.');
  }
}

function getDiagnosticPlainText() {
  const diagnostic = getBackupDiagnostics();
  return [
    `Cuenta Clara v${diagnostic.appVersion}`,
    `Modo: ${diagnostic.sessionMode}`,
    `Datos del dispositivo: ${diagnostic.hasLocalData ? 'disponibles' : 'sin datos guardados'}`,
    `Sincronización: ${diagnostic.cloudStatus}`,
    `Último guardado en este dispositivo: ${diagnostic.lastLocalSaveAt ? formatDate(diagnostic.lastLocalSaveAt) : 'sin registro'}`,
    `Última sincronización: ${diagnostic.lastCloudSyncAt ? formatDate(diagnostic.lastCloudSyncAt) : 'sin registro'}`,
    `Cuentas: ${diagnostic.billsCount}`,
    `Personas registradas en cuentas: ${diagnostic.peopleCount}`,
    `Gastos/productos: ${diagnostic.productsCount}`,
    `Recurrentes: ${diagnostic.recurringCount}`,
    `Compartidas: ${diagnostic.sharedCount}`,
    `Cuentas con pendientes: ${diagnostic.pendingBills}`,
    `Monto pendiente total: ${formatCurrency(diagnostic.pendingTotal)}`,
    `Tamaño aproximado: ${formatBytes(diagnostic.localSizeBytes)}`,
    `Copia previa de importación: ${diagnostic.hasAutoBackup ? 'disponible' : 'no disponible'}`,
  ].join('\n');
}

async function copyDiagnosticSummary() {
  const text = getDiagnosticPlainText();
  try {
    await navigator.clipboard.writeText(text);
    showToast('Estado copiado.');
  } catch {
    prompt('Copia el estado:', text);
  }
}

function renderBackupDiagnostics() {
  if (!dom.backupSummaryGrid || !dom.diagnosticList) return;

  const diagnostic = getBackupDiagnostics();
  const status = diagnostic.hasLocalData ? 'Protegible' : 'Sin datos';
  const statusClass = diagnostic.hasLocalData ? 'is-ok' : 'is-muted';

  if (dom.backupStatusOutput) {
    dom.backupStatusOutput.textContent = diagnostic.hasLocalData
      ? `Tienes ${diagnostic.billsCount} cuenta${diagnostic.billsCount === 1 ? '' : 's'} guardada${diagnostic.billsCount === 1 ? '' : 's'}. Exporta un respaldo antes de subir una versión nueva o importar datos.`
      : 'Aún no hay cuentas guardadas para respaldar en este navegador.';
  }

  if (dom.diagnosticStatusOutput) {
    dom.diagnosticStatusOutput.textContent = status;
    dom.diagnosticStatusOutput.classList.remove('is-ok', 'is-muted', 'is-warning');
    dom.diagnosticStatusOutput.classList.add(statusClass);
  }

  const cards = [
    ['Versión', `v${diagnostic.appVersion}`],
    ['Modo', diagnostic.sessionMode],
    ['Cuentas', diagnostic.billsCount],
    ['Pendiente total', formatCurrency(diagnostic.pendingTotal)],
    ['Datos del dispositivo', formatBytes(diagnostic.localSizeBytes)],
    ['Sincronización', diagnostic.cloudStatus],
  ];

  dom.backupSummaryGrid.innerHTML = cards.map(([label, value]) => `
    <article class="diagnostic-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value))}</strong>
    </article>
  `).join('');

  const items = [
    ['Cuenta activa', diagnostic.activeBillName],
    ['Tipo de cuenta activa', diagnostic.activeBillMode],
    ['Personas en cuentas', diagnostic.peopleCount],
    ['Gastos/productos', diagnostic.productsCount],
    ['Carpetas recurrentes', diagnostic.recurringCount],
    ['Cuentas compartidas', diagnostic.sharedCount],
    ['Copia previa para restaurar', diagnostic.hasAutoBackup ? 'Disponible' : 'No disponible'],
    ['Último guardado en este dispositivo', diagnostic.lastLocalSaveAt ? formatDate(diagnostic.lastLocalSaveAt) : 'Sin registro'],
    ['Última sincronización', diagnostic.lastCloudSyncAt ? formatDate(diagnostic.lastCloudSyncAt) : 'Sin registro'],
  ];

  dom.diagnosticList.innerHTML = items.map(([label, value]) => `
    <div class="diagnostic-row">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value || 'Sin datos'))}</strong>
    </div>
  `).join('');

  if (dom.restoreAutoBackupButton) {
    dom.restoreAutoBackupButton.disabled = !diagnostic.hasAutoBackup;
    dom.restoreAutoBackupButton.title = diagnostic.hasAutoBackup
      ? 'Restaura la copia creada antes de la última importación.'
      : 'Se activará después de importar un respaldo.';
  }
}





function safeFileName(name) {
  return String(name || 'cuenta-clara')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'cuenta-clara';
}

function roundMoney(value) {
  return Math.round(Number(value) || 0);
}

function argb(hex) {
  return hex.replace('#', '').toUpperCase();
}

function styleTitleCell(cell, text) {
  cell.value = text;
  cell.font = { name: 'Arial', bold: true, size: 20, color: { argb: 'FFFFFFFF' } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } };
  cell.alignment = { vertical: 'middle', horizontal: 'left' };
}

function styleSectionCell(cell, text) {
  cell.value = text;
  cell.font = { name: 'Arial', bold: true, size: 13, color: { argb: 'FF102A27' } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F4F1' } };
  cell.alignment = { vertical: 'middle', horizontal: 'left' };
}

function styleButtonCell(cell, label, targetAddress) {
  cell.value = { text: label, hyperlink: targetAddress };
  cell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FFFFFFFF' }, underline: false };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } };
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  cell.border = {
    top: { style: 'thin', color: { argb: 'FFB9DCD6' } },
    left: { style: 'thin', color: { argb: 'FFB9DCD6' } },
    bottom: { style: 'thin', color: { argb: 'FFB9DCD6' } },
    right: { style: 'thin', color: { argb: 'FFB9DCD6' } },
  };
}

function styleHeaderRow(row) {
  row.height = 26;

  row.eachCell((cell) => {
    cell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFB9DCD6' } },
      left: { style: 'thin', color: { argb: 'FFB9DCD6' } },
      bottom: { style: 'thin', color: { argb: 'FFB9DCD6' } },
      right: { style: 'thin', color: { argb: 'FFB9DCD6' } },
    };
  });
}

function styleDataRow(row, rowIndex) {
  const fillColor = rowIndex % 2 === 0 ? 'FFF8FAFA' : 'FFFFFFFF';
  row.height = row.height || 22;

  row.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 10, color: { argb: 'FF102A27' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
    cell.alignment = { vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFD9E8E5' } },
      left: { style: 'thin', color: { argb: 'FFD9E8E5' } },
      bottom: { style: 'thin', color: { argb: 'FFD9E8E5' } },
      right: { style: 'thin', color: { argb: 'FFD9E8E5' } },
    };
  });
}

function styleStatusCell(cell, value) {
  const normalized = String(value || '').toLowerCase();
  const isPaid = normalized === 'pagado' || normalized === 'pagada';

  cell.font = {
    name: 'Arial',
    bold: true,
    size: 10,
    color: { argb: isPaid ? 'FF166534' : 'FF92400E' },
  };
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: isPaid ? 'FFDCFCE7' : 'FFFEF3C7' },
  };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
}

function styleMoneyCell(cell) {
  const numericValue = typeof cell.value === 'number'
    ? cell.value
    : Number(String(cell.value || '').replace(/[^0-9,-]/g, '').replace(',', '.'));

  if (Number.isFinite(numericValue)) {
    cell.value = formatCurrency(roundMoney(numericValue));
  }

  cell.numFmt = '@';
  cell.alignment = { vertical: 'middle', horizontal: 'right' };
}

function stylePercentCell(cell) {
  cell.numFmt = '0.00%';
  cell.alignment = { vertical: 'middle', horizontal: 'right' };
}

function addStyledTable(sheet, startRow, headers, rows, moneyColumns = [], statusColumns = [], percentColumns = []) {
  const headerRow = sheet.getRow(startRow);

  headers.forEach((header, index) => {
    headerRow.getCell(index + 1).value = header;
  });

  styleHeaderRow(headerRow);

  rows.forEach((values, index) => {
    const row = sheet.getRow(startRow + 1 + index);

    values.forEach((value, valueIndex) => {
      row.getCell(valueIndex + 1).value = value;
    });

    styleDataRow(row, index);

    moneyColumns.forEach((columnNumber) => {
      styleMoneyCell(row.getCell(columnNumber));
    });

    statusColumns.forEach((columnNumber) => {
      styleStatusCell(row.getCell(columnNumber), row.getCell(columnNumber).value);
    });

    percentColumns.forEach((columnNumber) => {
      stylePercentCell(row.getCell(columnNumber));
    });
  });

  const endRow = startRow + rows.length;
  sheet.autoFilter = {
    from: { row: startRow, column: 1 },
    to: { row: Math.max(startRow, endRow), column: headers.length },
  };

  return endRow + 2;
}

function setSheetBaseStyle(sheet) {
  sheet.properties.defaultRowHeight = 20;

  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      if (!cell.font) {
        cell.font = { name: 'Arial', size: 10 };
      }
    });
  });
}

function addInfoRow(sheet, rowNumber, label, value, isMoney = false) {
  const labelCell = sheet.getCell(`A${rowNumber}`);
  const valueCell = sheet.getCell(`B${rowNumber}`);

  labelCell.value = label;
  labelCell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF526D68' } };
  labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4FBFA' } };
  labelCell.alignment = { vertical: 'middle', horizontal: 'left' };

  valueCell.value = isMoney ? formatCurrency(roundMoney(value)) : value;
  valueCell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF102A27' } };
  valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
  valueCell.alignment = { vertical: 'middle', horizontal: isMoney ? 'right' : 'left' };

  if (isMoney) {
    valueCell.numFmt = '@';
  }

  [labelCell, valueCell].forEach((cell) => {
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFD9E8E5' } },
      left: { style: 'thin', color: { argb: 'FFD9E8E5' } },
      bottom: { style: 'thin', color: { argb: 'FFD9E8E5' } },
      right: { style: 'thin', color: { argb: 'FFD9E8E5' } },
    };
  });
}

function addKpiCard(sheet, range, title, value, fillColor, valueIsMoney = true) {
  const [startCell] = range.split(':');
  sheet.mergeCells(range);

  const cell = sheet.getCell(startCell);
  cell.value = `${title}\n${valueIsMoney ? formatCurrency(roundMoney(value)) : value}`;
  cell.font = { name: 'Arial', bold: true, size: 13, color: { argb: 'FF102A27' } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(fillColor) } };
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  cell.border = {
    top: { style: 'thin', color: { argb: 'FFB9DCD6' } },
    left: { style: 'thin', color: { argb: 'FFB9DCD6' } },
    bottom: { style: 'thin', color: { argb: 'FFB9DCD6' } },
    right: { style: 'thin', color: { argb: 'FFB9DCD6' } },
  };
}

function personDetailRows(person, bill, calculation) {
  const detail = calculation.personDetails[person.id];

  if (!detail.items.length) {
    return [[person.name, 'Sin consumos registrados', '', 0, 0, 0, '', person.paid ? 'Pagado' : 'Pendiente']];
  }

  return detail.items.map((item) => {
    const itemTip = item.amount * ((Number(bill.tipPercent) || 0) / 100);

    return [
      person.name,
      item.productName,
      item.category || 'Otros',
      roundMoney(item.amount),
      roundMoney(itemTip),
      roundMoney(item.amount + itemTip),
      `${item.share}/${item.totalShares}`,
      person.paid ? 'Pagado' : 'Pendiente',
    ];
  });
}

function addPersonFilterButtons(sheet, people, targetRows, firstRow) {
  styleSectionCell(sheet.getCell(`A${firstRow}`), 'Filtrar / ver por persona');
  sheet.mergeCells(`A${firstRow}:H${firstRow}`);

  const buttons = [{ label: 'Ver detalle completo', target: `#'Detalle por persona'!A${targetRows.all}` }];

  for (const person of people) {
    buttons.push({ label: person.name, target: `#'Detalle por persona'!A${targetRows[person.id]}` });
  }

  const buttonsPerRow = 4;

  buttons.forEach((button, index) => {
    const rowOffset = Math.floor(index / buttonsPerRow);
    const colOffset = index % buttonsPerRow;
    const rowNumber = firstRow + 1 + rowOffset;
    const startCol = colOffset * 2 + 1;
    const endCol = startCol + 1;
    const startAddress = sheet.getCell(rowNumber, startCol).address;
    const endAddress = sheet.getCell(rowNumber, endCol).address;

    if (startCol !== endCol) {
      sheet.mergeCells(`${startAddress}:${endAddress}`);
    }

    styleButtonCell(sheet.getCell(rowNumber, startCol), button.label, button.target);
    sheet.getRow(rowNumber).height = 26;
  });

  return firstRow + 1 + Math.ceil(buttons.length / buttonsPerRow) + 1;
}


function getExcelCellDisplayValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    if (value.text) {
      return String(value.text);
    }

    if (value.richText) {
      return value.richText.map((part) => part.text || '').join('');
    }

    if (value.result !== undefined) {
      return String(value.result);
    }

    if (value.formula) {
      return String(value.formula);
    }

    return '';
  }

  return String(value);
}

function autoFitWorksheetColumns(sheet, options = {}) {
  const minWidth = options.minWidth || 10;
  const maxWidth = options.maxWidth || 34;
  const wideColumns = options.wideColumns || {};
  const narrowColumns = options.narrowColumns || {};
  const padding = options.padding || 2;

  sheet.columns.forEach((column, index) => {
    const columnNumber = index + 1;
    const columnLetter = column.letter;
    let maxLength = 0;

    column.eachCell({ includeEmpty: false }, (cell) => {
      // Ignorar títulos grandes combinados para que no agranden toda la hoja.
      if (cell.isMerged && cell.master && cell.address !== cell.master.address) {
        return;
      }

      const value = getExcelCellDisplayValue(cell.value);
      const longestLine = value
        .split(/\r?\n/)
        .reduce((longest, line) => Math.max(longest, line.length), 0);

      maxLength = Math.max(maxLength, longestLine);
    });

    const customMax = wideColumns[columnLetter] || wideColumns[columnNumber] || maxWidth;
    const customMin = narrowColumns[columnLetter] || narrowColumns[columnNumber] || minWidth;
    const calculatedWidth = Math.min(customMax, Math.max(customMin, maxLength + padding));

    column.width = calculatedWidth;
  });
}

function autoFitWorkbookSheets(workbook) {
  workbook.eachSheet((sheet) => {
    const name = sheet.name;

    if (name === 'Productos') {
      autoFitWorksheetColumns(sheet, {
        minWidth: 10,
        maxWidth: 28,
        wideColumns: { F: 30, I: 36, J: 48 },
        narrowColumns: { D: 10, E: 14, G: 12 },
      });

      return;
    }

    if (name === 'Detalle por persona') {
      autoFitWorksheetColumns(sheet, {
        minWidth: 10,
        maxWidth: 30,
        wideColumns: { B: 34 },
        narrowColumns: { G: 10, H: 14 },
      });

      return;
    }

    if (name === 'Resumen') {
      autoFitWorksheetColumns(sheet, {
        minWidth: 12,
        maxWidth: 24,
        narrowColumns: { E: 14 },
      });

      return;
    }

    if (name === 'Transferencias') {
      autoFitWorksheetColumns(sheet, {
        minWidth: 12,
        maxWidth: 26,
        narrowColumns: { C: 14, D: 14 },
      });

      return;
    }

    if (name === 'Categorías') {
      autoFitWorksheetColumns(sheet, {
        minWidth: 12,
        maxWidth: 26,
        narrowColumns: { B: 14, C: 14 },
      });

      return;
    }

    autoFitWorksheetColumns(sheet);
  });
}


async function exportExcel() {
  if (typeof ExcelJS === 'undefined') {
    showNotice(
      'Excel profesional no disponible',
      'No se pudo preparar el Excel avanzado. Revisa tu conexión e intenta nuevamente.'
    );
    return;
  }

  const bill = getActiveBill();
  const calculation = calculateBill(bill);
  const payer = bill.people.find((person) => person.id === bill.payerId);
  const transfers = getTransferLines(bill, calculation);
  const workbook = new ExcelJS.Workbook();
  const exportedAt = new Date();

  workbook.creator = 'Cuenta Clara';
  workbook.created = exportedAt;
  workbook.modified = exportedAt;
  workbook.subject = 'Resumen de cuenta';
  workbook.title = `Cuenta Clara - ${bill.name}`;

  const resumen = workbook.addWorksheet('Resumen', {
    pageSetup: { orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  resumen.columns = [
    { width: 24 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 16 },
  ];

  resumen.mergeCells('A1:E2');
  styleTitleCell(resumen.getCell('A1'), `CUENTA CLARA · ${bill.name.toUpperCase()}`);
  resumen.getRow(1).height = 30;
  resumen.getRow(2).height = 30;

  styleSectionCell(resumen.getCell('A4'), 'Información general');
  resumen.mergeCells('A4:E4');

  addInfoRow(resumen, 5, 'Cuenta', bill.name);
  addInfoRow(resumen, 6, 'Fecha de exportación', exportedAt.toLocaleString('es-CL'));
  addInfoRow(resumen, 7, 'Modo', bill.mode === 'quick' ? 'Cuenta rápida' : 'Cuenta detallada');
  addInfoRow(resumen, 8, 'Pagador principal', payer ? payer.name : 'Sin pagador principal');
  addInfoRow(resumen, 9, 'Estado', calculation.isPaid ? 'Pagada' : 'Pendiente');

  addKpiCard(resumen, 'A11:A13', 'Subtotal', calculation.subtotal, '#E6F4F1');
  addKpiCard(resumen, 'B11:B13', `Propina ${bill.tipPercent}%`, calculation.tipAmount, '#FEF3C7');
  addKpiCard(resumen, 'C11:C13', 'Total final', calculation.grandTotal, '#CCFBF1');
  addKpiCard(resumen, 'D11:D13', 'Total pagado', calculation.paidTotal, '#DCFCE7');
  addKpiCard(resumen, 'E11:E13', 'Total pendiente', calculation.pendingTotal, '#FEE2E2');

  styleSectionCell(resumen.getCell('A15'), 'Detalle por persona');
  resumen.mergeCells('A15:E15');

  const resumenRows = bill.people.map((person) => {
    const detail = calculation.personDetails[person.id];

    return [
      person.name,
      roundMoney(detail.subtotal),
      roundMoney(detail.tip),
      roundMoney(detail.total),
      person.paid ? 'Pagado' : 'Pendiente',
    ];
  });

  addStyledTable(
    resumen,
    16,
    ['Persona', 'Subtotal', 'Propina', 'Total a pagar', 'Estado'],
    resumenRows.length ? resumenRows : [['Sin personas', 0, 0, 0, '']],
    [2, 3, 4],
    [5]
  );

  resumen.getCell('A9').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4FBFA' } };
  styleStatusCell(resumen.getCell('B9'), calculation.isPaid ? 'Pagada' : 'Pendiente');

  const productos = workbook.addWorksheet('Productos', {
    views: [{ state: 'frozen', ySplit: 4 }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  productos.columns = [
    { width: 30 },
    { width: 16 },
    { width: 17 },
    { width: 12 },
    { width: 14 },
    { width: 95 },
  ];

  productos.mergeCells('A1:H2');
  styleTitleCell(productos.getCell('A1'), 'PRODUCTOS DE LA CUENTA');
  productos.getRow(1).height = 28;
  productos.getRow(2).height = 28;

  const productosRows = [];

  if (bill.mode === 'quick') {
    productosRows.push([
      'Cuenta rápida',
      'Otros',
      roundMoney(bill.quickTotal),
      1,
      roundMoney(bill.quickTotal),
      '',
      '',
      bill.people.map((person) => person.name).join(', '),
    ]);
  } else {
    for (const product of bill.products) {
      const consumers = product.consumers
        .map((consumer) => {
          const person = bill.people.find((item) => item.id === consumer.personId);
          return person ? `${person.name}${consumer.share > 1 ? ` (${consumer.share} partes)` : ''}` : null;
        })
        .filter(Boolean)
        .join(', ');

      productosRows.push([
        product.name,
        product.category || 'Otros',
        roundMoney(product.unitPrice),
        Number(product.quantity) || 0,
        roundMoney((Number(product.unitPrice) || 0) * (Number(product.quantity) || 0)),
        product.dueDate ? formatShortDate(product.dueDate) : '',
        product.recurring ? 'Sí' : 'No',
        consumers,
      ]);
    }
  }

  addStyledTable(
    productos,
    4,
    ['Producto', 'Categoría', 'Precio unitario', 'Cantidad', 'Total producto', 'Vencimiento', 'Recurrente', 'Consumidores'],
    productosRows.length ? productosRows : [['Sin productos', '', 0, 0, 0, '', '', '']],
    [3, 5],
    []
  );

  for (let rowNumber = 5; rowNumber <= 4 + Math.max(1, productosRows.length); rowNumber++) {
    productos.getRow(rowNumber).height = 38;
    productos.getCell(`E${rowNumber}`).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };
    productos.getCell(`H${rowNumber}`).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  }

  const detalle = workbook.addWorksheet('Detalle por persona', {
    views: [{ state: 'frozen', ySplit: 3 }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  detalle.columns = [
    { width: 22 },
    { width: 30 },
    { width: 16 },
    { width: 18 },
    { width: 20 },
    { width: 20 },
    { width: 12 },
    { width: 16 },
  ];

  detalle.mergeCells('A1:H2');
  styleTitleCell(detalle.getCell('A1'), 'DETALLE POR PERSONA');
  detalle.getRow(1).height = 28;
  detalle.getRow(2).height = 28;

  const allDetailRows = bill.people.flatMap((person) => personDetailRows(person, bill, calculation));
  const buttonRowsCount = Math.ceil((bill.people.length + 1) / 4);
  const mainTableStart = 7 + buttonRowsCount;
  const mainTableEnd = mainTableStart + Math.max(1, allDetailRows.length);
  let sectionCursor = mainTableEnd + 3;
  const targetRows = { all: mainTableStart };

  for (const person of bill.people) {
    targetRows[person.id] = sectionCursor;
    sectionCursor += 2 + personDetailRows(person, bill, calculation).length + 2;
  }

  addPersonFilterButtons(detalle, bill.people, targetRows, 4);

  styleSectionCell(detalle.getCell(`A${mainTableStart - 1}`), 'Detalle completo');
  detalle.mergeCells(`A${mainTableStart - 1}:H${mainTableStart - 1}`);

  addStyledTable(
    detalle,
    mainTableStart,
    ['Persona', 'Producto', 'Categoría', 'Monto asignado', 'Propina proporcional', 'Total con propina', 'Partes', 'Estado'],
    allDetailRows.length ? allDetailRows : [['Sin personas', '', '', 0, 0, 0, '', '']],
    [4, 5, 6],
    [8]
  );

  sectionCursor = mainTableEnd + 3;

  for (const person of bill.people) {
    const rows = personDetailRows(person, bill, calculation);
    styleSectionCell(detalle.getCell(`A${sectionCursor}`), `Detalle de ${person.name}`);
    detalle.mergeCells(`A${sectionCursor}:H${sectionCursor}`);

    addStyledTable(
      detalle,
      sectionCursor + 1,
      ['Persona', 'Producto', 'Categoría', 'Monto asignado', 'Propina proporcional', 'Total con propina', 'Partes', 'Estado'],
      rows,
      [4, 5, 6],
      [8]
    );

    sectionCursor += 2 + rows.length + 2;
  }

  const transferencias = workbook.addWorksheet('Transferencias', {
    views: [{ state: 'frozen', ySplit: 3 }],
    pageSetup: { orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  transferencias.columns = [
    { width: 26 },
    { width: 26 },
    { width: 18 },
    { width: 16 },
  ];

  transferencias.mergeCells('A1:D2');
  styleTitleCell(transferencias.getCell('A1'), 'TRANSFERENCIAS');
  transferencias.getRow(1).height = 28;
  transferencias.getRow(2).height = 28;

  const transferRows = transfers.length
    ? transfers.map((transfer) => [transfer.from, transfer.to, roundMoney(transfer.amount), transfer.paid ? 'Pagado' : 'Pendiente'])
    : [['Sin transferencias', payer ? payer.name : 'Sin pagador', 0, '']];

  addStyledTable(
    transferencias,
    4,
    ['Debe transferir', 'A quién', 'Monto', 'Estado'],
    transferRows,
    [3],
    [4]
  );

  const categorias = workbook.addWorksheet('Categorías', {
    views: [{ state: 'frozen', ySplit: 3 }],
    pageSetup: { orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  categorias.columns = [
    { width: 28 },
    { width: 18 },
    { width: 18 },
  ];

  categorias.mergeCells('A1:C2');
  styleTitleCell(categorias.getCell('A1'), 'TOTALES POR CATEGORÍA');
  categorias.getRow(1).height = 28;
  categorias.getRow(2).height = 28;

  const categoryRows = Object.entries(calculation.categoryTotals)
    .filter(([, total]) => total > 0)
    .map(([category, total]) => {
      const roundedTotal = roundMoney(total);
      const percent = calculation.subtotal > 0 ? total / calculation.subtotal : 0;
      return [category, roundedTotal, percent];
    });

  addStyledTable(
    categorias,
    4,
    ['Categoría', 'Total', '% del subtotal'],
    categoryRows.length ? categoryRows : [['Sin categorías registradas', 0, 0]],
    [2],
    [],
    [3]
  );

  for (let rowNumber = 5; rowNumber <= 4 + Math.max(1, categoryRows.length); rowNumber++) {
    stylePercentCell(categorias.getCell(`C${rowNumber}`));
  }

  workbook.eachSheet((sheet) => {
    setSheetBaseStyle(sheet);
  });

  autoFitWorkbookSheets(workbook);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `${safeFileName(bill.name)}-cuenta-clara.xlsx`;
  link.click();

  URL.revokeObjectURL(url);
  showToast('Excel profesional exportado.');
}


function openShareModal() {
  dom.shareModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  updateSharePreview();
}

function closeShareModal() {
  dom.shareModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

function updateSharePreview() {
  const { format, content } = getShareOptions();
  const contentLabel = getSummaryContentLabel(content);
  const formatLabel = format === 'image' ? 'Imagen' : 'Texto';

  dom.sharePreviewType.textContent = `${formatLabel} · ${contentLabel}`;
  dom.textPreview.textContent = getSummaryText(content);

  const isImage = format === 'image';
  dom.imagePreviewWrap.classList.toggle('hidden', !isImage);
  dom.textPreview.classList.toggle('hidden', isImage);

  dom.copySelectedShareButton.disabled = isImage;
  dom.whatsappSelectedShareButton.disabled = false;
  dom.downloadImageButton.disabled = !isImage;
  dom.nativeShareImageButton.disabled = !isImage;

  if (isImage) {
    drawShareImage(content);
  }
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(' ');
  let line = '';
  let currentY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) {
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }

  return currentY;
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function getCanvasLines(content = 'simple') {
  const bill = getActiveBill();
  const calculation = calculateBill(bill);
  const pendingOnly = content === 'pending';
  const people = bill.people
    .map((person) => {
      const detail = calculation.personDetails[person.id];
      return {
        name: person.name,
        paid: person.paid,
        subtotal: detail.subtotal,
        tip: detail.tip,
        total: detail.total,
        items: detail.items,
      };
    })
    .filter((person) => !pendingOnly || (!person.paid && person.total > 0));

  const allTransfers = getTransferLines(bill, calculation);

  return {
    bill,
    calculation,
    payer: bill.people.find((person) => person.id === bill.payerId),
    people,
    transfers: pendingOnly ? allTransfers.filter((transfer) => !transfer.paid) : allTransfers,
    detailed: content === 'detail',
    pendingOnly,
    statusLabel: getBillStatusLabel(bill, calculation),
    generatedAt: new Date().toLocaleDateString('es-CL'),
    contentLabel: getSummaryContentLabel(content),
  };
}

function drawShareImage(content = 'simple') {
  const canvas = dom.shareCanvas;
  const ctx = canvas.getContext('2d');
  const data = getCanvasLines(content);
  const width = 900;
  const padding = 58;
  const visiblePeopleCount = Math.max(1, data.people.length);
  const personBlockBase = data.detailed ? 178 : 86;
  const itemLineHeight = 32;
  const extraItems = data.detailed
    ? data.people.reduce((sum, person) => sum + Math.max(1, person.items.length) * itemLineHeight, 0)
    : 0;
  const transferHeight = data.transfers.length > 0 ? 92 + data.transfers.length * 42 : (data.pendingOnly ? 96 : 0);
  const height = Math.max(960, 560 + visiblePeopleCount * personBlockBase + extraItems + transferHeight);

  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = '#f4f7f6';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#0f766e';
  roundRect(ctx, 0, 0, width, 252, 0);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  roundRect(ctx, width - 250, -80, 330, 330, 80);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 54px Arial';
  ctx.fillText('Cuenta Clara', padding, 84);

  ctx.font = '700 31px Arial';
  wrapCanvasText(ctx, data.bill.name || 'Cuenta sin nombre', padding, 136, width - padding * 2 - 170, 36);

  ctx.font = '600 21px Arial';
  ctx.fillText(`${data.contentLabel} · ${data.generatedAt}`, padding, 194);

  const statusText = data.statusLabel;
  ctx.font = '800 20px Arial';
  const statusWidth = ctx.measureText(statusText).width + 38;
  ctx.fillStyle = data.statusLabel === 'Pagada' ? '#dcfce7' : '#fef3c7';
  roundRect(ctx, width - padding - statusWidth, 48, statusWidth, 40, 20);
  ctx.fill();
  ctx.fillStyle = data.statusLabel === 'Pagada' ? '#166534' : '#92400e';
  ctx.fillText(statusText, width - padding - statusWidth + 19, 75);

  let y = 294;

  ctx.fillStyle = '#ffffff';
  roundRect(ctx, padding, y, width - padding * 2, 150, 28);
  ctx.fill();

  ctx.fillStyle = '#64748b';
  ctx.font = '800 18px Arial';
  ctx.fillText('TOTAL CUENTA', padding + 28, y + 42);
  ctx.fillText('PENDIENTE', padding + 360, y + 42);
  ctx.fillText('PAGADOR', padding + 590, y + 42);

  ctx.fillStyle = '#0f766e';
  ctx.font = '900 38px Arial';
  ctx.fillText(formatCurrency(data.calculation.grandTotal), padding + 28, y + 88);

  ctx.fillStyle = data.calculation.pendingTotal > 0 ? '#92400e' : '#166534';
  ctx.font = '900 30px Arial';
  ctx.fillText(formatCurrency(data.calculation.pendingTotal), padding + 360, y + 86);

  ctx.fillStyle = '#102a27';
  ctx.font = '800 25px Arial';
  wrapCanvasText(ctx, data.payer ? data.payer.name : 'Sin pagador', padding + 590, y + 86, 210, 28);

  ctx.fillStyle = '#64748b';
  ctx.font = '600 18px Arial';
  ctx.fillText(`Total pagado: ${formatCurrency(data.calculation.paidTotal)} · Personas pendientes: ${data.calculation.pendingPeople}`, padding + 28, y + 126);

  y += 182;

  if (data.people.length === 0) {
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, padding, y, width - padding * 2, 112, 24);
    ctx.fill();
    ctx.fillStyle = '#166534';
    ctx.font = '800 26px Arial';
    ctx.fillText(data.pendingOnly ? 'Sin personas pendientes.' : 'Sin personas registradas.', padding + 28, y + 52);
    ctx.fillStyle = '#64748b';
    ctx.font = '600 20px Arial';
    ctx.fillText(data.pendingOnly ? 'La cuenta no tiene cobros pendientes por persona.' : 'Agrega personas para completar el comprobante.', padding + 28, y + 84);
    y += 130;
  } else {
    for (const person of data.people) {
      const blockHeight = data.detailed
        ? 138 + Math.max(1, person.items.length) * itemLineHeight
        : 86;

      ctx.fillStyle = '#ffffff';
      roundRect(ctx, padding, y, width - padding * 2, blockHeight, 24);
      ctx.fill();

      ctx.fillStyle = '#102a27';
      ctx.font = '800 30px Arial';
      ctx.fillText(person.name, padding + 28, y + 49);

      ctx.fillStyle = '#0f766e';
      ctx.font = '800 32px Arial';
      const amount = formatCurrency(person.total);
      const amountWidth = ctx.measureText(amount).width;
      ctx.fillText(amount, width - padding - 28 - amountWidth, y + 49);

      ctx.fillStyle = person.paid ? '#16a34a' : '#f59e0b';
      ctx.font = '700 20px Arial';
      ctx.fillText(person.paid ? 'Pagado' : 'Pendiente', padding + 28, y + 78);

      if (data.detailed) {
        let detailY = y + 116;

        ctx.fillStyle = '#64748b';
        ctx.font = '500 20px Arial';

        if (person.items.length === 0) {
          ctx.fillText('Sin consumos registrados', padding + 28, detailY);
          detailY += itemLineHeight;
        } else {
          for (const item of person.items) {
            const shareText = item.totalShares > 1 ? ` (${item.share}/${item.totalShares})` : '';
            const line = `${item.productName}${shareText}: ${formatCurrency(item.amount)}`;
            detailY = wrapCanvasText(ctx, line, padding + 28, detailY, width - padding * 2 - 56, itemLineHeight);
          }
        }

        ctx.fillStyle = '#102a27';
        ctx.font = '700 20px Arial';
        ctx.fillText(`Subtotal: ${formatCurrency(person.subtotal)} · Propina: ${formatCurrency(person.tip)}`, padding + 28, detailY + 8);
      }

      y += blockHeight + 18;
    }
  }

  if (data.transfers.length > 0 || data.pendingOnly) {
    y += 8;
    const blockHeight = data.transfers.length > 0 ? 78 + data.transfers.length * 42 : 96;

    ctx.fillStyle = '#fff7ed';
    roundRect(ctx, padding, y, width - padding * 2, blockHeight, 24);
    ctx.fill();

    ctx.fillStyle = '#102a27';
    ctx.font = '800 27px Arial';
    ctx.fillText(data.pendingOnly ? 'Transferencias pendientes' : 'Transferencias', padding + 28, y + 44);

    if (data.transfers.length === 0) {
      ctx.fillStyle = '#166534';
      ctx.font = '700 22px Arial';
      ctx.fillText('No hay transferencias pendientes.', padding + 28, y + 80);
    } else {
      let ty = y + 84;
      ctx.font = '700 21px Arial';

      for (const transfer of data.transfers) {
        ctx.fillStyle = '#102a27';
        ctx.fillText(`${transfer.from} → ${transfer.to}`, padding + 28, ty);

        ctx.fillStyle = transfer.paid ? '#16a34a' : '#0f766e';
        const amount = formatCurrency(transfer.amount);
        ctx.fillText(amount, width - padding - 28 - ctx.measureText(amount).width, ty);
        ty += 42;
      }
    }

    y += blockHeight + 18;
  }

  y += 12;

  ctx.fillStyle = '#ccfbf1';
  roundRect(ctx, padding, y, width - padding * 2, 184, 26);
  ctx.fill();

  ctx.fillStyle = '#102a27';
  ctx.font = '800 28px Arial';
  ctx.fillText('Totales de la cuenta', padding + 28, y + 48);

  ctx.font = '700 23px Arial';
  ctx.fillText(`Subtotal: ${formatCurrency(data.calculation.subtotal)}`, padding + 28, y + 88);

  const tipText = data.bill.mode === 'home'
    ? 'Sin propina en cuenta hogar'
    : `Propina (${data.bill.tipPercent}%): ${formatCurrency(data.calculation.tipAmount)}`;
  ctx.fillText(tipText, padding + 28, y + 122);

  ctx.fillStyle = '#0f766e';
  ctx.font = '800 34px Arial';
  ctx.fillText(`Total: ${formatCurrency(data.calculation.grandTotal)}`, padding + 28, y + 164);

  ctx.fillStyle = '#64748b';
  ctx.font = '500 18px Arial';
  ctx.fillText('Generado con Cuenta Clara', padding, height - 32);
  ctx.fillText(data.generatedAt, width - padding - ctx.measureText(data.generatedAt).width, height - 32);
}

function getCanvasBlob() {
  return new Promise((resolve) => {
    dom.shareCanvas.toBlob((blob) => resolve(blob), 'image/png', 1);
  });
}

async function downloadShareImage() {
  const { content } = getShareOptions();
  drawShareImage(content);

  const url = dom.shareCanvas.toDataURL('image/png');
  const link = document.createElement('a');
  const bill = getActiveBill();
  const safeName = bill.name.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi, '-').replace(/^-|-$/g, '') || 'cuenta-clara';

  link.href = url;
  link.download = `${safeName}-resumen.png`;
  link.click();
  showToast('Imagen descargada.');
}

async function tryNativeImageShare() {
  const blob = await getCanvasBlob();

  if (!blob) {
    return false;
  }

  const file = new File([blob], 'cuenta-clara-resumen.png', { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Cuenta Clara',
        text: 'Resumen de la cuenta',
      });
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

async function copyCanvasImageToClipboard() {
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    return false;
  }

  const blob = await getCanvasBlob();

  if (!blob) {
    return false;
  }

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);
    return true;
  } catch {
    return false;
  }
}

async function shareImageNatively() {
  const { content } = getShareOptions();
  drawShareImage(content);

  const shared = await tryNativeImageShare();

  if (shared) {
    return;
  }

  await downloadShareImage();
  showNotice('Imagen descargada', 'Tu navegador no permite compartir imagen directo. Se descargó el PNG para que puedas adjuntarlo manualmente.');
}

async function whatsappSelectedShare() {
  const { format, content } = getShareOptions();

  if (format === 'text') {
    shareWhatsapp(content);
    return;
  }

  drawShareImage(content);

  const sharedByNativeMenu = await tryNativeImageShare();

  if (sharedByNativeMenu) {
    return;
  }

  const copied = await copyCanvasImageToClipboard();

  await downloadShareImage();

  const helperText = copied
    ? 'Te copié la imagen al portapapeles y también la descargué. Se abrirá WhatsApp: pega la imagen en el chat con Ctrl+V o adjunta el archivo descargado.'
    : 'Se descargó la imagen. Se abrirá WhatsApp: adjunta manualmente el archivo PNG descargado.';

  showNotice('Imagen lista para WhatsApp', helperText);

  const bill = getActiveBill();
  const calculation = calculateBill(bill);
  const message = [
    `*Cuenta Clara - ${bill.name}*`,
    '',
    `Te envío el resumen en imagen.`,
    `Total cuenta: *${formatCurrency(calculation.grandTotal)}*`,
  ].join('\n');

  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
}

function escapeHtml(value) {
  return window.CuentaClaraUtils.escapeHtml(value);
}

function initTheme() {
  window.CuentaClaraUtils.initTheme(dom.themeToggle);
}

function toggleTheme() {
  window.CuentaClaraUtils.toggleTheme(dom.themeToggle);
}


function updateInstallButton() {
  if (!dom.installAppButton) {
    return;
  }

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  if (isStandalone) {
    dom.installAppButton.textContent = 'App instalada';
    dom.installAppButton.disabled = true;
    return;
  }

  dom.installAppButton.textContent = 'Instalar App';
  dom.installAppButton.disabled = false;
}

async function installApp() {
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  if (isStandalone) {
    showToast('La app ya está instalada.');
    return;
  }

  if (!deferredInstallPrompt) {
    showNotice(
      'Instalar Cuenta Clara',
      'Si el navegador no abre la instalación automáticamente, usa el menú del navegador y elige “Instalar app” o “Agregar a pantalla de inicio”.'
    );
    return;
  }

  deferredInstallPrompt.prompt();

  const choice = await deferredInstallPrompt.userChoice;

  if (choice.outcome === 'accepted') {
    showToast('Instalación iniciada.');
  } else {
    showToast('Instalación cancelada.');
  }

  deferredInstallPrompt = null;
  updateInstallButton();
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  updateInstallButton();
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  updateInstallButton();
  showToast('Cuenta Clara quedó instalada.');
});


function initServiceWorker() {
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }
}

dom.closeNoticeTabButton.addEventListener('click', () => dom.noticeTab.classList.add('hidden'));


dom.closeReceiptModalButton.addEventListener('click', closeReceiptModal);
dom.receiptModal.addEventListener('click', (event) => { if (event.target === dom.receiptModal) closeReceiptModal(); });
dom.receiptFileInput.addEventListener('change', handleReceiptFileChange);
dom.processReceiptButton.addEventListener('click', processReceiptImage);
dom.clearReceiptButton.addEventListener('click', clearReceiptReader);
if (dom.reparseReceiptTextButton) {
  dom.reparseReceiptTextButton.addEventListener('click', reparseReceiptRawText);
}
dom.selectAllReceiptItemsButton.addEventListener('click', () => setAllReceiptItems(true));
dom.unselectAllReceiptItemsButton.addEventListener('click', () => setAllReceiptItems(false));
dom.ignoreZeroReceiptItemsButton?.addEventListener('click', ignoreZeroReceiptItems);
dom.addManualReceiptItemButton?.addEventListener('click', addManualReceiptItem);
dom.addMissingReceiptDifferenceButton?.addEventListener('click', addMissingReceiptDifferenceItem);
dom.editReceiptTotalButton?.addEventListener('click', editReceiptTotalFromPrompt);
dom.selectValidReceiptItemsButton?.addEventListener('click', selectOnlyValidReceiptItems);
dom.focusReceiptIssuesButton?.addEventListener('click', focusReceiptIssues);
dom.receiptContinueDespiteMismatchButton?.addEventListener('click', acceptReceiptMismatchAndContinue);
dom.addReceiptItemsButton.addEventListener('click', addReceiptItemsToBill);


dom.authButton && dom.authButton.addEventListener('click', openAuthModal);
dom.authStatusBadge && dom.authStatusBadge.addEventListener('click', handleAuthBadgeClick);
dom.closeAuthModalButton && dom.closeAuthModalButton.addEventListener('click', closeAuthModal);
if (dom.authModal) {
  dom.authModal.addEventListener('click', (event) => {
    if (event.target === dom.authModal) {
      closeAuthModal();
    }
  });
}
dom.showLoginButton && dom.showLoginButton.addEventListener('click', showLoginForm);
dom.showRegisterButton && dom.showRegisterButton.addEventListener('click', showRegisterForm);
dom.loginForm && dom.loginForm.addEventListener('submit', loginLocalUser);
dom.registerForm && dom.registerForm.addEventListener('submit', registerLocalUser);
dom.continueGuestButton && dom.continueGuestButton.addEventListener('click', switchToGuestMode);
dom.switchToGuestButton && dom.switchToGuestButton.addEventListener('click', switchToGuestMode);
dom.logoutButton && dom.logoutButton.addEventListener('click', logoutLocalUser);


dom.profileTabs?.forEach((button) => {
  button.addEventListener('click', () => {
    setProfileTab(button.dataset.profileTab || 'profile');
    renderProfilePanels();
  });
});

dom.saveProfileButton && dom.saveProfileButton.addEventListener('click', saveProfileFromModal);
dom.savePreferencesButton && dom.savePreferencesButton.addEventListener('click', saveProfilePreferences);
dom.syncNowButton && dom.syncNowButton.addEventListener('click', async () => {
  const saved = await saveCloudStateNow({ force: true, message: 'Guardando...' });
  showToast(saved ? 'Guardado en la nube.' : 'No se pudo guardar en la nube. Quedó guardado en este dispositivo.');
});

dom.installAppButton && dom.installAppButton.addEventListener('click', installApp);
dom.themeToggle && dom.themeToggle.addEventListener('click', toggleTheme);

if (dom.headerMoreMenu) {
  document.addEventListener('click', (event) => {
    if (!dom.headerMoreMenu.contains(event.target)) {
      dom.headerMoreMenu.open = false;
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      dom.headerMoreMenu.open = false;
    }
  });
}

dom.headerMorePanel?.addEventListener('click', (event) => {
  if (event.target.closest('button, a')) {
    setTimeout(() => {
      if (dom.headerMoreMenu) dom.headerMoreMenu.open = false;
    }, 0);
  }
});

dom.sectionNavButtons?.forEach((button) => {
  button.addEventListener('click', () => setAppSection(button.dataset.appSection));
});

dom.mobileHomeButton?.addEventListener('click', () => setAppSection('home', { scroll: false }));

dom.mobileBackButton?.addEventListener('click', () => {
  const targetSection = previousAppSection && previousAppSection !== currentAppSection ? previousAppSection : 'home';
  setAppSection(targetSection, { fromBack: true, scroll: false });
});

dom.guidedChoiceButtons?.forEach((button) => {
  button.addEventListener('click', () => applyGuidedMode(button.dataset.guidedMode));
});

dom.templateChoiceButtons?.forEach((button) => {
  button.addEventListener('click', () => selectTemplatePreview(button.dataset.template, { scroll: true }));
});

dom.templateAssistantStartButton?.addEventListener('click', () => createTemplateBill(selectedTemplateKey));
dom.templateAssistantPeopleButton?.addEventListener('click', () => createTemplateBill(selectedTemplateKey));

dom.applyTemplateChangeButton?.addEventListener('click', () => {
  changeActiveBillTemplate(dom.templateChangeSelect?.value || 'custom');
});

dom.createExampleBillButton?.addEventListener('click', createExampleBill);
dom.loadDemoDataButton?.addEventListener('click', loadDemoData);
dom.clearDemoDataButton?.addEventListener('click', () => clearDemoData());
dom.startFirstBillButton?.addEventListener('click', focusTemplateChoices);
dom.firstUseExampleButton?.addEventListener('click', createExampleBill);
dom.dismissFirstUseButton?.addEventListener('click', dismissFirstUseOnboarding);

dom.guideFocusButtons?.forEach((button) => {
  button.addEventListener('click', () => {
    const target = dom[button.dataset.focusTarget] || document.querySelector(`#${button.dataset.focusTarget}`);
    scrollToGuideTarget(target);
  });
});

dom.guideShareButtons?.forEach((button) => {
  button.addEventListener('click', openShareModal);
});


dom.smartActionButton?.addEventListener('click', handleSmartAction);
dom.continueActiveBillButton?.addEventListener('click', continueActiveBillFromHome);
dom.homeActionOpenPaymentsButton?.addEventListener('click', () => setAppSection('payments', { scroll: false }));
dom.homeNewBillButton?.addEventListener('click', focusGuidedNewBillChoices);
dom.simpleModeButton?.addEventListener('click', () => setExperienceMode('simple'));
dom.advancedModeButton?.addEventListener('click', () => setExperienceMode('advanced'));
dom.toggleAdvancedToolsButton?.addEventListener('click', toggleAdvancedToolsVisibility);
dom.restoreRecommendedViewButton?.addEventListener('click', restoreRecommendedView);
dom.manualProductMethodButton?.addEventListener('click', focusManualProductForm);
dom.receiptMethodButton?.addEventListener('click', openReceiptModal);
dom.quickProductMethodButton?.addEventListener('click', showQuickProductsArea);
dom.quickTotalMethodButton?.addEventListener('click', focusQuickTotalPanel);


dom.newBillButton.addEventListener('click', focusGuidedNewBillChoices);
dom.duplicateBillButton.addEventListener('click', duplicateBill);
dom.archiveBillButton.addEventListener('click', toggleArchiveBill);
dom.closeBillButton?.addEventListener('click', toggleCloseBill);
dom.deleteBillButton.addEventListener('click', deleteActiveBill);

dom.historySearchInput.addEventListener('input', renderBillList);
dom.historyFilterSelect.addEventListener('change', renderBillList);
dom.historyTypeFilterSelect?.addEventListener('change', renderBillList);
dom.historySortSelect?.addEventListener('change', renderBillList);

dom.billNameInput.addEventListener('input', () => {
  const bill = getActiveBill();
  bill.name = dom.billNameInput.value;
  touchActiveBill();
  saveState();
});

dom.billNameInput.addEventListener('blur', () => {
  const bill = getActiveBill();
  const cleanName = dom.billNameInput.value.trim();

  bill.name = cleanName || 'Nueva cuenta';
  persistAndRender();
});

document.querySelectorAll('input[name="billMode"]').forEach((input) => {
  input.addEventListener('change', () => {
    changeActiveBillMode(input.value);
  });
});

dom.billModeChoiceButtons?.forEach((button) => {
  button.addEventListener('click', () => {
    changeActiveBillMode(button.dataset.billModeChoice);
  });
});

dom.quickTotalInput.addEventListener('input', () => {
  const bill = getActiveBill();
  const value = Number(dom.quickTotalInput.value);

  bill.quickTotal = Number.isFinite(value) && value >= 0 ? value : 0;
  persistAndRender();
});

dom.homeMonthInput.addEventListener('input', () => {
  const bill = getActiveBill();
  bill.homeMonth = dom.homeMonthInput.value || getCurrentMonthValue();
  persistAndRender();
});

dom.duplicateHomeMonthButton.addEventListener('click', duplicateHomeMonth);
if (dom.createRecurringGroupButton) {
  dom.createRecurringGroupButton.addEventListener('click', createRecurringGroupFromActiveBill);
}
if (dom.createNextRecurringMonthButton) {
  dom.createNextRecurringMonthButton.addEventListener('click', createNextRecurringMonthFromActive);
}
if (dom.createNextRecurringMonthButtonInline) {
  dom.createNextRecurringMonthButtonInline.addEventListener('click', createNextRecurringMonthFromActive);
}
if (dom.publishSharedAccountButton) {
  dom.publishSharedAccountButton.addEventListener('click', publishActiveBillAsShared);
}
if (dom.inviteSharedUserButton) {
  dom.inviteSharedUserButton.addEventListener('click', inviteUserToSharedAccount);
}
if (dom.refreshSharedAccountsButton) {
  dom.refreshSharedAccountsButton.addEventListener('click', fetchSharedAccounts);
}
if (dom.notificationCenterButton) {
  dom.notificationCenterButton.addEventListener('click', openNotificationCenter);
}
if (dom.homeNotificationOpenButton) {
  dom.homeNotificationOpenButton.addEventListener('click', openNotificationCenter);
}
if (dom.homeNotificationMarkReadButton) {
  dom.homeNotificationMarkReadButton.addEventListener('click', markAllNotificationsSeen);
}
if (dom.enablePushNotificationsButton) {
  dom.enablePushNotificationsButton.addEventListener('click', activateSystemNotifications);
}
if (dom.testPushNotificationButton) {
  dom.testPushNotificationButton.addEventListener('click', testSystemNotification);
}
if (dom.refreshConnectionStatusButton) {
  dom.refreshConnectionStatusButton.addEventListener('click', () => {
    renderConnectionStatus();
    showToast('Estado actualizado.');
  });
}
if (dom.setPaymentDueDateButton) {
  dom.setPaymentDueDateButton.addEventListener('click', setPaymentDueDateFromInput);
}
if (dom.clearPaymentDueDateButton) {
  dom.clearPaymentDueDateButton.addEventListener('click', clearPaymentDueDate);
}
if (dom.paymentActionFilterSelect) {
  dom.paymentActionFilterSelect.addEventListener('change', renderPaymentActionCenter);
}
if (dom.paymentActionRefreshButton) {
  dom.paymentActionRefreshButton.addEventListener('click', renderPaymentActionCenter);
}
if (dom.sharedInviteSearchInput) {
  dom.sharedInviteSearchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      inviteUserToSharedAccount();
    }
  });
}

dom.payerSelect.addEventListener('change', () => {
  const bill = getActiveBill();
  bill.payerId = dom.payerSelect.value;
  persistAndRender();
});

dom.personForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addPerson(dom.personNameInput.value, dom.personPhoneInput.value);
});

if (dom.addMePersonButton) {
  dom.addMePersonButton.addEventListener('click', addCurrentUserAsPerson);
}
if (dom.addMePersonQuickButton) {
  dom.addMePersonQuickButton.addEventListener('click', addCurrentUserAsPerson);
}

dom.markAllPaidButton.addEventListener('click', () => markAllPaid(true));
dom.markAllPendingButton.addEventListener('click', () => markAllPaid(false));


if (dom.openFriendsPickerButton) {
  dom.openFriendsPickerButton.addEventListener('click', openFriendsPicker);
}

if (dom.closeFriendsPickerButton) {
  dom.closeFriendsPickerButton.addEventListener('click', closeFriendsPicker);
}

if (dom.friendsPickerModal) {
  dom.friendsPickerModal.addEventListener('click', (event) => {
    if (event.target === dom.friendsPickerModal) {
      closeFriendsPicker();
    }
  });
}

if (dom.addSelectedFriendsButton) {
  dom.addSelectedFriendsButton.addEventListener('click', addSelectedFriendsToBill);
}
dom.friendsPickerSearchInput?.addEventListener('input', renderFriendsPicker);
dom.clearFriendsPickerSearchButton?.addEventListener('click', clearFriendsPickerSearch);
dom.toggleFrequentPeopleButton?.addEventListener('click', toggleFrequentPeoplePanel);
dom.whatsappNotificationsToggle?.addEventListener('change', toggleWhatsappNotifications);
dom.prepareWhatsappNotificationsButton?.addEventListener('click', prepareWhatsappNotifications);



dom.tipPercentInput.addEventListener('input', () => {
  const bill = getActiveBill();
  const value = Number(dom.tipPercentInput.value);

  bill.tipPercent = bill.mode === 'home' ? 0 : (Number.isFinite(value) && value >= 0 ? value : 0);
  persistAndRender();
});

dom.quickTipButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const bill = getActiveBill();
    if (bill.mode === 'home') {
      bill.tipPercent = 0;
    } else {
      bill.tipPercent = Number(button.dataset.tip);
    }
    persistAndRender();
  });
});

dom.clearProductsButton.addEventListener('click', clearProducts);
dom.resetBillButton.addEventListener('click', resetBill);

dom.selectAllConsumersButton.addEventListener('click', () => setAllConsumersChecked(true));
dom.clearConsumersButton?.addEventListener('click', () => setAllConsumersChecked(false));
dom.selectSelfConsumerButton?.addEventListener('click', selectOnlySelfConsumer);
dom.equalSharesConsumerButton?.addEventListener('click', resetConsumerSharesToEqual);
dom.customSharesConsumerButton?.addEventListener('click', highlightCustomShares);

dom.toggleQuickProductsEditorButton.addEventListener('click', () => {
  const isHidden = dom.quickProductsEditor.classList.toggle('hidden');
  dom.toggleQuickProductsEditorButton.textContent = isHidden ? 'Editar rápidos' : 'Ocultar editor';
});

dom.quickProductForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addQuickProduct(dom.quickProductNameInput.value, dom.quickProductCategoryInput.value);
});

dom.productSplitModeInput.addEventListener('change', updateDivisionCopy);

dom.productForm.addEventListener('submit', (event) => {
  event.preventDefault();
  submitProduct();
});

dom.cancelEditProductButton.addEventListener('click', () => {
  resetProductForm();
  renderProductForm();
});

dom.productSearchInput.addEventListener('input', renderProducts);
dom.productFilterSelect.addEventListener('change', renderProducts);

dom.copyReceiptSummaryButton?.addEventListener('click', copyReceiptSummary);
dom.whatsappReceiptSummaryButton?.addEventListener('click', whatsappReceiptSummary);
dom.generateReceiptImageButton?.addEventListener('click', openReceiptImageShare);
dom.openPaymentsFromReceiptButton?.addEventListener('click', () => setAppSection('payments'));
dom.copySummaryButton.addEventListener('click', () => copySummary('simple'));
dom.whatsappButton.addEventListener('click', () => shareWhatsapp('simple'));
dom.shareButton.addEventListener('click', openShareModal);
dom.shareLinkButton.addEventListener('click', copyShareLink);
if (dom.exportExcelButton) {
  dom.exportExcelButton.addEventListener('click', exportExcel);
}
dom.mobileShareButton.addEventListener('click', () => {
  const { hasAmounts } = getGuidedState();

  if (!hasAmounts) {
    setAppSection('summary', { scroll: false });
    return;
  }

  openShareModal();
});
dom.mobileAddProductButton.addEventListener('click', handleSmartAction);

dom.exportBackupButton.addEventListener('click', exportBackup);
dom.importBackupButton.addEventListener('click', () => dom.backupFileInput.click());
dom.backupFileInput.addEventListener('change', () => {
  importBackupFile(dom.backupFileInput.files[0]);
  dom.backupFileInput.value = '';
});
dom.diagnosticRefreshButton?.addEventListener('click', () => {
  renderBackupDiagnostics();
  showToast('Estado actualizado.');
});
dom.diagnosticCopyButton?.addEventListener('click', copyDiagnosticSummary);
dom.restoreAutoBackupButton?.addEventListener('click', restoreAutomaticImportBackup);

dom.closeShareModalButton.addEventListener('click', closeShareModal);
dom.shareModal.addEventListener('click', (event) => {
  if (event.target === dom.shareModal) {
    closeShareModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !dom.shareModal.classList.contains('hidden')) {
    closeShareModal();
  }

  if (event.key === 'Escape' && !dom.authModal.classList.contains('hidden')) {
    closeAuthModal();
  }

  if (event.key === 'Escape' && !dom.receiptModal.classList.contains('hidden')) {
    closeReceiptModal();
  }

  if (dom.friendsPickerModal && event.key === 'Escape' && !dom.friendsPickerModal.classList.contains('hidden')) {
    closeFriendsPicker();
  }
});

document.querySelectorAll('input[name="shareFormat"], input[name="shareContent"]').forEach((input) => {
  input.addEventListener('change', updateSharePreview);
});

dom.copySelectedShareButton.addEventListener('click', () => {
  const { content } = getShareOptions();
  copySummary(content);
});

dom.whatsappSelectedShareButton.addEventListener('click', whatsappSelectedShare);
dom.downloadImageButton.addEventListener('click', downloadShareImage);
dom.nativeShareImageButton.addEventListener('click', shareImageNatively);

window.addEventListener('online', () => {
  showToast('Conexión recuperada. Sincronizando cambios…');
  if (currentSession.mode === 'user') {
    saveCloudStateNow({ force: true, message: 'Sincronizando...' }).finally(render);
  } else {
    render();
  }
});

window.addEventListener('offline', () => {
  showNotice('Sin conexión', 'Puedes seguir usando la app. Tus cambios quedarán guardados en este dispositivo y se sincronizarán cuando vuelva internet.');
  render();
});

async function initApp() {
  initTheme();
  initExperienceMode();
  updateInstallButton();
  await initializeAuthSession();
  loadState();

  if (currentSession.mode === 'user') {
    await loadCloudState();
    await savePublicProfileFromMain();
    await fetchSharedAccounts();
  }

  migrateEmptyDefaultPeople();
  importBillFromUrl();
  saveState();
  render();
  initAppSections();
  initServiceWorker();

  if (hasSupabaseClient()) {
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        return;
      }

      if (session?.user && currentSession.userId !== session.user.id) {
        setUserSession(session.user);
        saveAuthSession();
        await loadCloudState();
        await savePublicProfileFromMain();
        await fetchSharedAccounts();
        migrateEmptyDefaultPeople();
        saveState();
        render();
      }
    });
  }
}

initApp().catch((error) => {
  console.error('Error al iniciar Cuenta Clara:', error);
  const message = error?.message || 'Error desconocido al iniciar la app.';
  try {
    showNotice('Error al iniciar la app', message);
  } catch {
    alert(`Error al iniciar Cuenta Clara: ${message}`);
  }
});
