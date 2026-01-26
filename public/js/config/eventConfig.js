// =====================================================
// EVENT CONFIG — FONTE ÚNICA (FRONTEND)
// =====================================================

export const EVENT_TYPES = {
  ENTRADA: {
    label: 'Entrada',
    icon: 'log-in',
    class: 'entry'
  },
  SAIDA: {
    label: 'Saída',
    icon: 'log-out',
    class: 'exit'
  },
  ALIMENTACAO: {
    label: 'Alimentação',
    icon: 'pizza-slice',
    class: 'food'
  },
  SONECA: {
    label: 'Soneca',
    icon: 'bed',
    class: 'sleep'
  },
  ATIVIDADE: {
    label: 'Atividade',
    icon: 'palette',
    class: 'activity'
  },
  RECADO: {
    label: 'Recado',
    icon: 'chat-bubble',
    class: 'message'
  },
  OCORRENCIA: {
    label: 'Ocorrência',
    icon: 'warning-triangle',
    class: 'alert'
  }
};

export function getEventConfig(tipo) {
  return EVENT_TYPES[tipo] || {
    label: tipo,
    icon: 'calendar',
    class: 'default'
  };
}
