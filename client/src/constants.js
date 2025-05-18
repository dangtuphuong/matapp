export const ROLES = {
  ADMIN: "admin",
  NORMAL_USER: "normal_user",
  PREMIUM_USER: "premium_user",
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.NORMAL_USER]: "Normal User",
  [ROLES.PREMIUM_USER]: "Premium User",
};

export const CHART_TYPES = {
  RADAR: "radar",
  BAR: "bar",
  BUBBLE: "bubble",
};

export const MODELS = {
  VECTOR: "vector",
  LLM: "llm",
  DEEPSEEK: "deepseek",
  GEMINI: "gemini",
};

export const MODELS_LABELS = {
  [MODELS.VECTOR]: "Vector Search",
  [MODELS.LLM]: "OpenAI",
  [MODELS.DEEPSEEK]: "DeepSeek",
  [MODELS.GEMINI]: "Google Gemini",
};
