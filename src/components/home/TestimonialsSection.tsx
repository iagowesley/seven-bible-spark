
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote } from "lucide-react";

type TestimonialProps = {
  quote: string;
  author: string;
  role: string;
  image?: string;
};

const Testimonial: React.FC<TestimonialProps> = ({ quote, author, role, image }) => {
  const initials = author
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="bg-card p-6 rounded-2xl shadow-sm flex flex-col h-full card-hover">
      <Quote className="h-6 w-6 text-seven-gold mb-4" />
      <p className="flex-grow text-foreground/90 mb-6">{quote}</p>
      <div className="flex items-center gap-3">
        <Avatar>
          {image && <AvatarImage src={image} alt={author} />}
          <AvatarFallback className="bg-primary text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{author}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "O Lição Jovem Seven transformou minha maneira de estudar a Bíblia. Os recursos interativos e o sistema de gamificação me mantêm motivado.",
      author: "Gabriel Silva",
      role: "Estudante de Teologia",
    },
    {
      quote: "Adoro como posso estudar offline e depois sincronizar meu progresso. O aplicativo se tornou parte da minha rotina diária de devocionais.",
      author: "Ana Oliveira",
      role: "Professora",
    },
    {
      quote: "Os fóruns de discussão me conectaram com outros jovens que compartilham dos mesmos valores. Tem sido uma experiência incrível!",
      author: "Mateus Santos",
      role: "Líder de Jovens",
    },
  ];

  return (
    <section className="py-16 bg-muted/50">
      <div className="seven-container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">O que dizem nossos usuários</h2>
          <p className="text-lg text-muted-foreground">
            Descubra como o Lição Jovem Seven está impactando a comunidade de estudantes da Bíblia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Testimonial
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
