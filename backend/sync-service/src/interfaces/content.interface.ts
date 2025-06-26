export interface Content {
  source: string; // 'youtube', 'stackoverflow', 'tiktok'...
  source_id: string; // ID unique dans la source
  url: string; // URL complète du contenu
  title: string; // Titre du contenu
  description: string; // Description du contenu
  thumbnail: string; // URL de la miniature
  channel: string; // Nom du canal/auteur
  published_at: string; // Date de publication au format ISO
  language: string; // Langage de programmation
  tags: string[]; // Tags associés
  origin_question: string; // Question d'origine
  created_at: string; // Date de création dans notre système
}
