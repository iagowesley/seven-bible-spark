
// Define study data structure
export type Study = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  lessons: Lesson[];
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  content: string;
  dayOfWeek: string;
};

// Lista de estudos e lições
export const studies: Study[] = [
  {
    id: "estudo-semanal",
    title: "Estudo Semanal",
    description: "Lições para cada dia da semana",
    imageUrl: "/cover.png",
    lessons: [
      {
        id: "domingo",
        title: "Estudo de Domingo",
        description: "Lição para o domingo",
        content: "Conteúdo da lição de domingo...",
        dayOfWeek: "Domingo"
      },
      {
        id: "segunda",
        title: "Estudo de Segunda",
        description: "Lição para a segunda-feira",
        content: "Conteúdo da lição de segunda...",
        dayOfWeek: "Segunda"
      },
      {
        id: "terca",
        title: "Estudo de Terça",
        description: "Lição para a terça-feira",
        content: "Conteúdo da lição de terça...",
        dayOfWeek: "Terça"
      },
      {
        id: "quarta",
        title: "Estudo de Quarta",
        description: "Lição para a quarta-feira",
        content: "Conteúdo da lição de quarta...",
        dayOfWeek: "Quarta"
      },
      {
        id: "quinta",
        title: "Estudo de Quinta",
        description: "Lição para a quinta-feira",
        content: "Conteúdo da lição de quinta...",
        dayOfWeek: "Quinta"
      },
      {
        id: "sexta",
        title: "Estudo de Sexta",
        description: "Lição para a sexta-feira",
        content: "Conteúdo da lição de sexta...",
        dayOfWeek: "Sexta"
      },
      {
        id: "sabado",
        title: "Estudo de Sábado",
        description: "Lição para o sábado",
        content: "Conteúdo da lição de sábado...",
        dayOfWeek: "Sábado"
      }
    ]
  }
];

// Função para obter todas as lições
export const getLessons = (): Lesson[] => {
  return studies.flatMap(study => study.lessons);
};

// Função para obter uma lição específica por ID
export const getLessonById = (id: string): Lesson | undefined => {
  return getLessons().find(lesson => lesson.id === id);
};
