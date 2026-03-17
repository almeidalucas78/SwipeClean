// src/styles/globalStyles.js
import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const globalStyles = StyleSheet.create({
  // Layouts Base
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Área do SwipeDeck (Repete nas 3 abas)
  cardArea: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', paddingBottom: theme.spacing.l },
  deckContainer: { width: '90%', height: '75%', position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.l },
  
  // Rodapé e Botão Principal (Repete nas 3 abas)
  footer: { padding: theme.spacing.l, paddingBottom: theme.spacing.xl, backgroundColor: theme.colors.background },
  
  reviewButton: { paddingVertical: 18, borderRadius: theme.borderRadius.md, alignItems: 'center' },
  reviewButtonActive: { backgroundColor: theme.colors.danger },
  reviewButtonInactive: { backgroundColor: theme.colors.inactiveBg },
  reviewButtonText: { color: theme.colors.background, fontSize: 16, fontWeight: 'bold' },
  reviewButtonTextInactive: { color: theme.colors.inactive },
  
  // Botões Verdes (Ex: Concluir Mês)
  successButton: { marginTop: theme.spacing.xl, backgroundColor: theme.colors.success, paddingVertical: 14, paddingHorizontal: 24, borderRadius: theme.borderRadius.lg, ...theme.shadows.light },
  successButtonText: { color: theme.colors.background, fontSize: 16, fontWeight: 'bold' },
});