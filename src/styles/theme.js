// src/styles/theme.js

export const theme = {
  colors: {
    primary: '#007AFF',     // Azul (Botões de ação padrão)
    success: '#34C759',     // Verde (Concluir, Coração)
    danger: '#FF3B30',      // Vermelho (Deletar, X)
    background: '#ffffff',  // Fundo principal
    surface: '#f8f9fa',     // Fundo secundário (gavetas, badges)
    text: '#1a1a1a',        // Texto principal (Títulos)
    textSecondary: '#666',  // Texto secundário (Subtítulos)
    border: '#f0f0f0',      // Bordas leves
    inactive: '#a0a0a0',    // Botões desabilitados
    inactiveBg: '#F0F0F0',  // Fundo desabilitado
  },
  spacing: {
    s: 10,
    m: 15,
    l: 20,
    xl: 30,
  },
  borderRadius: {
    sm: 12,
    md: 16,
    lg: 24,
    full: 99,
  },
  // Sombras padronizadas para não repetir em todo card
  shadows: {
    light: {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    medium: {
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
    }
  }
};