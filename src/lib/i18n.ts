export type Language = 'en' | 'es' | 'fr' | 'pt' | 'tw' // English, Spanish, French, Portuguese, Twi (Ghana)

export const SUPPORTED_LANGUAGES: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  pt: 'Português',
  tw: 'Twi',
}

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    dashboard: 'Dashboard',
    welcome: 'Welcome',
    logout: 'Logout',
    settings: 'Settings',
    back: 'Back',
    next: 'Next',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',

    // Interventions
    my_plans: 'My Intervention Plans',
    new_plan: 'New Plan',
    plan_assigned: 'Plan Assigned',
    step_completed: 'Step Completed',
    plan_completed: 'Plan Completed!',
    progress: 'Progress',
    estimated_time: 'Estimated Time',
    mark_complete: 'Mark Complete',
    watch_video: 'Watch Video',
    take_quiz: 'Take Quiz',

    // Student
    my_interventions: 'My Interventions',
    all_caught_up: 'All caught up!',
    active_plans: 'Active Plans',
    completed_plans: 'Completed Plans',
    total_steps: 'Total Steps',
    steps_completed: 'Steps Completed',

    // Teacher
    interventions: 'Interventions',
    struggling_students: 'Struggling Students',
    generate_plan: 'Generate AI Plan',
    review_and_assign: 'Review & Assign',
    class_avg: 'Class Average',

    // Parent
    child_progress: 'Child Progress',
    how_to_support: 'How to Support Your Child',
    study_tips: 'Study Tips',

    // Admin
    school_analytics: 'School Analytics',
    teacher_performance: 'Teacher Performance',
    export_report: 'Export Report',

    // Messages
    excellent_work: 'Excellent work!',
    great_progress: 'Great progress!',
    keep_going: 'Keep going!',
    you_did_great: 'You did great!',
    try_again: 'Try again',
  },

  es: {
    dashboard: 'Panel de Control',
    welcome: 'Bienvenido',
    logout: 'Cerrar Sesión',
    settings: 'Configuración',
    back: 'Atrás',
    next: 'Siguiente',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',

    my_plans: 'Mis Planes de Intervención',
    new_plan: 'Nuevo Plan',
    plan_assigned: 'Plan Asignado',
    step_completed: 'Paso Completado',
    plan_completed: '¡Plan Completado!',
    progress: 'Progreso',
    estimated_time: 'Tiempo Estimado',
    mark_complete: 'Marcar como Completado',
    watch_video: 'Ver Video',
    take_quiz: 'Hacer Prueba',

    my_interventions: 'Mis Intervenciones',
    all_caught_up: '¡Estás al día!',
    active_plans: 'Planes Activos',
    completed_plans: 'Planes Completados',
    total_steps: 'Pasos Totales',
    steps_completed: 'Pasos Completados',

    interventions: 'Intervenciones',
    struggling_students: 'Estudiantes con Dificultades',
    generate_plan: 'Generar Plan IA',
    review_and_assign: 'Revisar y Asignar',
    class_avg: 'Promedio de Clase',

    child_progress: 'Progreso del Niño',
    how_to_support: 'Cómo Apoyar a tu Hijo',
    study_tips: 'Consejos de Estudio',

    school_analytics: 'Análisis Escolar',
    teacher_performance: 'Desempeño del Docente',
    export_report: 'Exportar Informe',

    excellent_work: '¡Excelente trabajo!',
    great_progress: '¡Gran progreso!',
    keep_going: '¡Sigue adelante!',
    you_did_great: '¡Lo hiciste bien!',
    try_again: 'Intenta de nuevo',
  },

  fr: {
    dashboard: 'Tableau de Bord',
    welcome: 'Bienvenue',
    logout: 'Déconnexion',
    settings: 'Paramètres',
    back: 'Retour',
    next: 'Suivant',
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',

    my_plans: 'Mes Plans d\'Intervention',
    new_plan: 'Nouveau Plan',
    plan_assigned: 'Plan Assigné',
    step_completed: 'Étape Terminée',
    plan_completed: 'Plan Terminé!',
    progress: 'Progrès',
    estimated_time: 'Temps Estimé',
    mark_complete: 'Marquer comme Terminé',
    watch_video: 'Regarder la Vidéo',
    take_quiz: 'Passer le Quiz',

    my_interventions: 'Mes Interventions',
    all_caught_up: 'Tout est à jour!',
    active_plans: 'Plans Actifs',
    completed_plans: 'Plans Terminés',
    total_steps: 'Total des Étapes',
    steps_completed: 'Étapes Complétées',

    interventions: 'Interventions',
    struggling_students: 'Étudiants en Difficulté',
    generate_plan: 'Générer un Plan IA',
    review_and_assign: 'Examiner et Assigner',
    class_avg: 'Moyenne de Classe',

    child_progress: 'Progrès de l\'Enfant',
    how_to_support: 'Comment Soutenir votre Enfant',
    study_tips: 'Conseils d\'Étude',

    school_analytics: 'Analyse Scolaire',
    teacher_performance: 'Performance de l\'Enseignant',
    export_report: 'Exporter le Rapport',

    excellent_work: 'Excellent travail!',
    great_progress: 'Grands progrès!',
    keep_going: 'Continuez!',
    you_did_great: 'Vous avez bien fait!',
    try_again: 'Réessayez',
  },

  pt: {
    dashboard: 'Painel de Controle',
    welcome: 'Bem-vindo',
    logout: 'Sair',
    settings: 'Configurações',
    back: 'Voltar',
    next: 'Próximo',
    cancel: 'Cancelar',
    save: 'Salvar',
    delete: 'Deletar',
    edit: 'Editar',

    my_plans: 'Meus Planos de Intervenção',
    new_plan: 'Novo Plano',
    plan_assigned: 'Plano Atribuído',
    step_completed: 'Etapa Concluída',
    plan_completed: 'Plano Concluído!',
    progress: 'Progresso',
    estimated_time: 'Tempo Estimado',
    mark_complete: 'Marcar como Concluído',
    watch_video: 'Assistir Vídeo',
    take_quiz: 'Fazer Teste',

    my_interventions: 'Minhas Intervenções',
    all_caught_up: 'Tudo em dia!',
    active_plans: 'Planos Ativos',
    completed_plans: 'Planos Concluídos',
    total_steps: 'Total de Etapas',
    steps_completed: 'Etapas Concluídas',

    interventions: 'Intervenções',
    struggling_students: 'Alunos com Dificuldades',
    generate_plan: 'Gerar Plano IA',
    review_and_assign: 'Revisar e Atribuir',
    class_avg: 'Média da Turma',

    child_progress: 'Progresso da Criança',
    how_to_support: 'Como Apoiar seu Filho',
    study_tips: 'Dicas de Estudo',

    school_analytics: 'Análise Escolar',
    teacher_performance: 'Desempenho do Professor',
    export_report: 'Exportar Relatório',

    excellent_work: 'Excelente trabalho!',
    great_progress: 'Ótimo progresso!',
    keep_going: 'Continue!',
    you_did_great: 'Você foi ótimo!',
    try_again: 'Tente novamente',
  },

  tw: {
    dashboard: 'Akotɔ Dwuma',
    welcome: 'Maakye',
    logout: 'Twa W\'akotɔ',
    settings: 'Nnyinaso',
    back: 'Kɔ Akɔ',
    next: 'Kɔ Anim',
    cancel: 'Twa So',
    save: 'Ma Dua',
    delete: 'Soa So',
    edit: 'Sesa',

    my_plans: 'Me Nhyehyee Mfiri',
    new_plan: 'Nhyehyee Fofor',
    plan_assigned: 'Nhyehyee Ama',
    step_completed: 'Akwanhyia Adwumae',
    plan_completed: 'Nhyehyee Adwumae!',
    progress: 'Akɔkɔ',
    estimated_time: 'Bere A Esi Sua',
    mark_complete: 'Kyerε Se Adwumae',
    watch_video: 'Hwɛ Video',
    take_quiz: 'Sɔ Abɔmposo',

    my_interventions: 'Me Mfiri',
    all_caught_up: 'Adwumae Nyinaa!',
    active_plans: 'Nhyehyee A Wɔ Hɔ',
    completed_plans: 'Nhyehyee A Adwumae',
    total_steps: 'Akwanhyia Nyinaa',
    steps_completed: 'Akwanhyia Adwumae',

    interventions: 'Mfiri',
    struggling_students: 'Sukuufo A Wɔ Nkoko',
    generate_plan: 'Yɛ Nhyehyee AI',
    review_and_assign: 'Hwɛ Ama',
    class_avg: 'Kum Pa',

    child_progress: 'Abɔfra Akɔkɔ',
    how_to_support: 'Sɛ Mede Akisa',
    study_tips: 'Akwadwoo Din',

    school_analytics: 'Sukuu Nkɔmhyɛ',
    teacher_performance: 'Okrafo Nnɛ Dwuma',
    export_report: 'Yi Kasiw So',

    excellent_work: 'Dwuma Pa!',
    great_progress: 'Akɔkɔ Pa!',
    keep_going: 'Kɔ So!',
    you_did_great: 'Yoo Yɛ Pa!',
    try_again: 'Sɔ Bio',
  },
}

// Utility function to get translation
export function t(key: string, language: Language = 'en'): string {
  return translations[language]?.[key] || translations['en'][key] || key
}

// Utility to create i18n context
export function createI18nContext(language: Language) {
  return {
    language,
    t: (key: string) => t(key, language),
    supportedLanguages: SUPPORTED_LANGUAGES,
    changeLanguage: (newLanguage: Language) => {
      localStorage.setItem('preferred_language', newLanguage)
      window.location.reload()
    },
  }
}

// Get user's preferred language from localStorage or browser
export function getPreferredLanguage(): Language {
  const stored = localStorage.getItem('preferred_language') as Language | null
  if (stored && stored in SUPPORTED_LANGUAGES) {
    return stored
  }

  const browserLang = navigator.language.split('-')[0].toLowerCase() as Language
  if (browserLang in SUPPORTED_LANGUAGES) {
    return browserLang
  }

  return 'en' // Fallback to English
}
